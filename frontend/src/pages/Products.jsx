import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import Alert from "../components/Alert";
import Modal from "../components/Modal";

const emptyForm = {
  name: "",
  sku: "",
  price: "",
  quantity_in_stock: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    api
      .getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.sku.trim()) errs.sku = "SKU is required";
    if (form.price === "" || Number(form.price) < 0) errs.price = "Valid price required";
    if (form.quantity_in_stock === "" || Number(form.quantity_in_stock) < 0)
      errs.quantity_in_stock = "Valid quantity required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    };

    try {
      if (editing) {
        await api.updateProduct(editing.id, payload);
        setSuccess("Product updated successfully");
      } else {
        await api.createProduct(payload);
        setSuccess("Product created successfully");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      setSuccess("Product deleted");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button type="button" className="btn-primary" onClick={openCreate}>
          + Add Product
        </button>
      </div>

      <Alert message={error} onClose={() => setError("")} />
      <Alert type="success" message={success} onClose={() => setSuccess("")} />

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="empty-state">No products yet. Add your first product.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      {p.quantity_in_stock <= 10 ? (
                        <span className="badge badge-warning">{p.quantity_in_stock}</span>
                      ) : (
                        <span className="badge badge-success">{p.quantity_in_stock}</span>
                      )}
                    </td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
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
        <Modal
          title={editing ? "Edit Product" : "Add Product"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {formErrors.name && (
                <small style={{ color: "var(--danger)" }}>{formErrors.name}</small>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="sku">SKU / Code</label>
              <input
                id="sku"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
              {formErrors.sku && (
                <small style={{ color: "var(--danger)" }}>{formErrors.sku}</small>
              )}
            </div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                {formErrors.price && (
                  <small style={{ color: "var(--danger)" }}>{formErrors.price}</small>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="qty">Quantity in Stock</label>
                <input
                  id="qty"
                  type="number"
                  min="0"
                  value={form.quantity_in_stock}
                  onChange={(e) =>
                    setForm({ ...form, quantity_in_stock: e.target.value })
                  }
                />
                {formErrors.quantity_in_stock && (
                  <small style={{ color: "var(--danger)" }}>
                    {formErrors.quantity_in_stock}
                  </small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editing ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
