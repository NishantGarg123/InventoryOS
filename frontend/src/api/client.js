const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.message || "Request failed";
    throw new Error(message);
  }

  return data;
}

export const api = {
  getSummary: () => request("/dashboard/summary"),
  getProducts: () => request("/products"),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (body) =>
    request("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  getCustomers: () => request("/customers"),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (body) =>
    request("/customers", { method: "POST", body: JSON.stringify(body) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),
  getOrders: () => request("/orders"),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (body) =>
    request("/orders", { method: "POST", body: JSON.stringify(body) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),
};
