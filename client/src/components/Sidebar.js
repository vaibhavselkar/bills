import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Dashboard.css";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [openTables, setOpenTables] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/sanghamitra logo.jpeg" alt="Logo" className="logo" />
          <span className="username">Sanghamitra Admin</span>
        </div>
        <ul className="nav-links">
          <li
            className={currentPath === "/logout" ? "active" : ""}
            onClick={() => (window.location.href = "/logout")}
          >
            Logout
          </li>
        </ul>
      </nav>

      {/* Sidebar */}
      <aside className="sidebar">
        <nav>
          <a href="/dashboard" className={currentPath === "/dashboard" ? "active" : ""}>
            📈 Dashboard
          </a>
          <a href="/user-dashboard" className={currentPath === "/user-dashboard" ? "active" : ""}>
            🏠 Home
          </a>
          <a href="/view" className={currentPath === "/view" ? "active" : ""}>
            📄 View Bills
          </a>
          <a href="/analytics" className={currentPath === "/analytics" ? "active" : ""}>
            📊 Analytics
          </a>
          <a href="/products" className={currentPath === "/products" ? "active" : ""}>
            📦 Products
          </a>

          {/* Dropdown for Tables */}
          <div
            onClick={() => setOpenTables(!openTables)}
            className={`sidebar-link ${openTables ? "open" : ""}`}
            style={{ cursor: "pointer" }}
          >
            🧾 Tables {openTables ? "▲" : "▼"}
          </div>

          {openTables && (
            <div className="dropdown-menu">
              <a href="/tables" className={currentPath === "/tables" ? "active" : ""}>
                📦 Selling Data
              </a>
              <a href="/users" className={currentPath === "/users" ? "active" : ""}>
                👤 Users
              </a>
              <a href="/tables/bills" className={currentPath === "/tables/bills" ? "active" : ""}>
                💵 Bills
              </a>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Navbar;
