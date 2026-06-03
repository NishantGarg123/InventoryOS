from decimal import Decimal

from flask import Blueprint, jsonify, request

from app import db
from app.models import Customer, Order, OrderItem, Product
from app.validators import parse_positive_int, require_fields

orders_bp = Blueprint("orders", __name__, url_prefix="/orders")


def _validate_order_items(items):
    if not isinstance(items, list) or len(items) == 0:
        return None, "Order must include at least one product line item"

    parsed = []
    seen_products = set()
    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            return None, f"Item at index {idx} must be an object"
        err = require_fields(item, ["product_id", "quantity"])
        if err:
            return None, f"Item at index {idx}: {err}"
        product_id, err = parse_positive_int(item["product_id"], "product_id")
        if err:
            return None, f"Item at index {idx}: {err}"
        quantity, err = parse_positive_int(item["quantity"], "quantity")
        if err:
            return None, f"Item at index {idx}: {err}"
        if product_id in seen_products:
            return None, "Duplicate product in the same order is not allowed"
        seen_products.add(product_id)
        parsed.append({"product_id": product_id, "quantity": quantity})

    return parsed, None


@orders_bp.route("", methods=["POST"])
def create_order():
    data = request.get_json(silent=True)
    err = require_fields(data, ["customer_id", "items"])
    if err:
        return jsonify({"error": err}), 400

    customer = db.session.get(Customer, data["customer_id"])
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    parsed_items, err = _validate_order_items(data["items"])
    if err:
        return jsonify({"error": err}), 400

    products = {}
    for line in parsed_items:
        product = db.session.get(Product, line["product_id"])
        if not product:
            return jsonify(
                {"error": f"Product {line['product_id']} not found"}
            ), 404
        if product.quantity_in_stock < line["quantity"]:
            return jsonify(
                {
                    "error": (
                        f"Insufficient inventory for product '{product.name}' "
                        f"(SKU: {product.sku}). Available: {product.quantity_in_stock}, "
                        f"requested: {line['quantity']}"
                    )
                }
            ), 400
        products[line["product_id"]] = product

    order = Order(customer_id=customer.id, total_amount=Decimal("0"))
    db.session.add(order)
    db.session.flush()

    total = Decimal("0")
    for line in parsed_items:
        product = products[line["product_id"]]
        unit_price = Decimal(str(product.price))
        line_total = unit_price * line["quantity"]
        total += line_total
        product.quantity_in_stock -= line["quantity"]
        db.session.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=line["quantity"],
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    order.total_amount = total
    db.session.commit()
    return jsonify(order.to_dict()), 201


@orders_bp.route("", methods=["GET"])
def list_orders():
    orders = Order.query.order_by(Order.id.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.route("/<int:order_id>", methods=["GET"])
def get_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order.to_dict()), 200


@orders_bp.route("/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404

    for item in order.items:
        product = db.session.get(Product, item.product_id)
        if product:
            product.quantity_in_stock += item.quantity

    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Order cancelled and stock restored"}), 200
