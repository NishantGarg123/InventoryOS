from flask import Blueprint, jsonify

from app.models import Customer, Order, Product

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")

LOW_STOCK_THRESHOLD = 10


@dashboard_bp.route("/summary", methods=["GET"])
def summary():
    products = Product.query.all()
    low_stock = [
        p.to_dict()
        for p in products
        if p.quantity_in_stock <= LOW_STOCK_THRESHOLD
    ]
    return jsonify(
        {
            "total_products": Product.query.count(),
            "total_customers": Customer.query.count(),
            "total_orders": Order.query.count(),
            "low_stock_products": low_stock,
            "low_stock_threshold": LOW_STOCK_THRESHOLD,
        }
    ), 200
