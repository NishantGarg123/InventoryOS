from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from app.config import Config

db = SQLAlchemy()


def create_app(config_class=Config, init_db=False):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app)
    db.init_app(app)

    from app.routes.products import products_bp
    from app.routes.customers import customers_bp
    from app.routes.orders import orders_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(products_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}, 200

    if init_db:
        with app.app_context():
            db.create_all()

    return app
