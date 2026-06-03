from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from app import db
from app.models import Customer
from app.validators import require_fields

customers_bp = Blueprint("customers", __name__, url_prefix="/customers")


@customers_bp.route("", methods=["POST"])
def create_customer():
    data = request.get_json(silent=True)
    err = require_fields(data, ["full_name", "email", "phone_number"])
    if err:
        return jsonify({"error": err}), 400

    customer = Customer(
        full_name=str(data["full_name"]).strip(),
        email=str(data["email"]).strip().lower(),
        phone_number=str(data["phone_number"]).strip(),
    )
    db.session.add(customer)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Customer email must be unique"}), 409

    return jsonify(customer.to_dict()), 201


@customers_bp.route("", methods=["GET"])
def list_customers():
    customers = Customer.query.order_by(Customer.id).all()
    return jsonify([c.to_dict() for c in customers]), 200


@customers_bp.route("/<int:customer_id>", methods=["GET"])
def get_customer(customer_id):
    customer = db.session.get(Customer, customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    return jsonify(customer.to_dict()), 200


@customers_bp.route("/<int:customer_id>", methods=["DELETE"])
def delete_customer(customer_id):
    customer = db.session.get(Customer, customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    if customer.orders:
        return jsonify(
            {"error": "Cannot delete customer with existing orders"}
        ), 409
    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer deleted"}), 200
