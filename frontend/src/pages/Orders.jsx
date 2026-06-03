import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Alert from "../components/Alert";
import Modal from "../components/Modal";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lineItems, setLineItems] = useState([{ product_id: "", quantity: 1 }]);
  const [formErrors, setFormErrors] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.getOrders(), api.getCustomers(), api.getProducts()])
      .then(([o, c, p]) => {
        setOrders(o);
        setCustomers(c);
        setProducts(p);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addLine = () => {
    setLineItems([...lineItems, { product_id: "", quantity: 1 }]);
  };

  const updateLine = (index, field, value) => {
    const next = [...lineItems];
    next[index] = { ...next[index], [field]: value };
    setLineItems(next);
  };

  const removeLine = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!customerId) {
      setFormErrors("Please select a customer");
      return false;
    }
    for (const line of lineItems) {
      if (!line.product_id || !line.quantity || Number(line.quantity) < 1) {
        setFormErrors("Each line must have a product and quantity ≥ 1");
        return false;
      }
    }
    const ids = lineItems.map((l) => l.product_id);
    if (new Set(ids).size !== ids.length) {
      setFormErrors("Duplicate products in the same order are not allowed");
      return false;
    }
    setFormErrors("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await api.createOrder({
        customer_id: Number(customerId),
        items: lineItems.map((l) => ({
          product_id: Number(l.product_id),
          quantity: Number(l.quantity),
        })),
      });
      setSuccess("Order created successfully");
      setModalOpen(false);
      setCustomerId("");
      setLineItems([{ product_id: "", quantity: 1 }]);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order and restore inventory?")) return;
    try {
      await api.deleteOrder(id);
      setSuccess("Order cancelled");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setFormErrors("");
            setModalOpen(true);
          }}
          disabled={customers.length === 0 || products.length === 0}
        >
          + Create Order
        </button>
      </div>

      <Alert message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      {(customers.length === 0 || products.length === 0) && (
        <p className="alert alert-error" style={{ marginBottom: "1rem" }}>
          Add at least one customer and one product before creating orders.
        </p>
      )}

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                    <td>${o.total_amount.toFixed(2)}</td>
                    <td>{new Date(o.created_at).toLocaleString()}</td>
                    <td className="actions">
                      <Link to={`/orders/${o.id}`} className="btn-secondary" style={{ display: "inline-block" }}>
                        View
                      </Link>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleCancel(o.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title="Create Order" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit}>
            {formErrors && (
              <div className="alert alert-error">{formErrors}</div>
            )}
            <div className="form-group">
              <label htmlFor="customer">Customer</label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Line Items</p>
            {lineItems.map((line, idx) => (
              <div key={idx} className="form-row cols-2" style={{ marginBottom: "0.75rem", alignItems: "end" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Product</label>
                  <select
                    value={line.product_id}
                    onChange={(e) => updateLine(idx, "product_id", e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${p.price.toFixed(2)} (stock: {p.quantity_in_stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "end" }}>
                  <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                    <label>Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                    />
                  </div>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => removeLine(idx)}
                      style={{ marginBottom: "0.1rem" }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn-secondary" onClick={addLine} style={{ marginBottom: "1rem" }}>
              + Add line item
            </button>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Place Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
