import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Alert from "../components/Alert";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="empty-state">Loading order...</p>;
  }

  if (!order) {
    return (
      <div>
        <Alert message={error || "Order not found"} />
        <Link to="/orders" className="btn-secondary" style={{ display: "inline-block", marginTop: "1rem" }}>
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Order #{order.id}</h1>
        <Link to="/orders" className="btn-secondary">
          ← Back to orders
        </Link>
      </div>

      <Alert message={error} onClose={() => setError("")} />

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Order Summary</h2>
        <p>
          <strong>Customer:</strong> {order.customer?.full_name} ({order.customer?.email})
        </p>
        <p>
          <strong>Phone:</strong> {order.customer?.phone_number}
        </p>
        <p>
          <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
        </p>
        <p>
          <strong>Total:</strong>{" "}
          <span style={{ color: "var(--primary)", fontSize: "1.25rem", fontWeight: 700 }}>
            ${order.total_amount.toFixed(2)}
          </span>
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Line Items</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.name}</td>
                  <td>{item.product?.sku}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${item.line_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
