from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from app import db
from app.models import Product
from app.validators import parse_non_negative_int, parse_positive_decimal, require_fields

products_bp = Blueprint("products", __name__, url_prefix="/products")


@products_bp.route("", methods=["POST"])
def create_product():
    data = request.get_json(silent=True)
    err = require_fields(data, ["name", "sku", "price", "quantity_in_stock"])
    if err:
        return jsonify({"error": err}), 400

    price, err = parse_positive_decimal(data["price"], "price")
    if err:
        return jsonify({"error": err}), 400

    qty, err = parse_non_negative_int(data["quantity_in_stock"], "quantity_in_stock")
    if err:
        return jsonify({"error": err}), 400

    product = Product(
        name=str(data["name"]).strip(),
        sku=str(data["sku"]).strip(),
        price=price,
        quantity_in_stock=qty,
    )
    db.session.add(product)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Product SKU must be unique"}), 409

    return jsonify(product.to_dict()), 201


@products_bp.route("", methods=["GET"])
def list_products():
    products = Product.query.order_by(Product.id).all()
    return jsonify([p.to_dict() for p in products]), 200


@products_bp.route("/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.to_dict()), 200


@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if "name" in data and data["name"] not in (None, ""):
        product.name = str(data["name"]).strip()
    if "sku" in data and data["sku"] not in (None, ""):
        product.sku = str(data["sku"]).strip()
    if "price" in data:
        price, err = parse_positive_decimal(data["price"], "price")
        if err:
            return jsonify({"error": err}), 400
        product.price = price
    if "quantity_in_stock" in data:
        qty, err = parse_non_negative_int(
            data["quantity_in_stock"], "quantity_in_stock"
        )
        if err:
            return jsonify({"error": err}), 400
        product.quantity_in_stock = qty

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Product SKU must be unique"}), 409

    return jsonify(product.to_dict()), 200


@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200
