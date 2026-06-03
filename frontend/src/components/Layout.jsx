import { NavLink } from "react-router-dom";
import "./Layout.css";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "Products" },
  { to: "/customers", label: "Customers" },
  { to: "/orders", label: "Orders" },
];

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">◈</span>
            <span className="brand-text">InventoryOS</span>
          </div>
          <nav className="nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
