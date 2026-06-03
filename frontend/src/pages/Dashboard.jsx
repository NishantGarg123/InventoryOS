import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Alert from "../components/Alert";
import "./Dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getSummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="empty-state">Loading dashboard...</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <Alert message={error} onClose={() => setError("")} />

      {summary && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Products</span>
              <span className="stat-value">{summary.total_products}</span>
              <Link to="/products" className="stat-link">
                Manage products →
              </Link>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Customers</span>
              <span className="stat-value">{summary.total_customers}</span>
              <Link to="/customers" className="stat-link">
                Manage customers →
              </Link>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{summary.total_orders}</span>
              <Link to="/orders" className="stat-link">
                View orders →
              </Link>
            </div>
          </div>

          <section className="card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">
              Low Stock Products
              <span className="badge badge-warning">
                ≤ {summary.low_stock_threshold} units
              </span>
            </h2>
            {summary.low_stock_products.length === 0 ? (
              <p className="empty-state">All products are well stocked.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>In Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.low_stock_products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>${p.price.toFixed(2)}</td>
                        <td>
                          <span className="badge badge-warning">
                            {p.quantity_in_stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
