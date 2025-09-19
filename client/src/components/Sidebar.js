import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Dashboard.css";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [openTables, setOpenTables] = useState(false);
  const [username, setUsername] = useState("Loading...");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // 👈 read token
        const response = await fetch("https://billing-app-server.vercel.app/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user info");
        }

        setUsername(data.name || "Unknown User");
      } catch (error) {
        console.error("Error fetching user:", error);
        setUsername("Guest");
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/sanghamitra logo.jpeg" alt="Logo" className="logo" />
          <span className="username">{username || "Loading..."}</span>
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
          <a
            href="/admin-dashboard"
            className={currentPath === "/admin-dashboard" ? "active" : ""}
          >
            📈 Dashboard
          </a>
          <a
            href="/user-dashboard"
            className={currentPath === "/user-dashboard" ? "active" : ""}
          >
            🏠 Home
          </a>
          <a href="/view" className={currentPath === "/view" ? "active" : ""}>
            📄 View Bills
          </a>
          <a
            href="/admin-analytics"
            className={currentPath === "/admin-analytics" ? "active" : ""}
          >
            📊 Analytics
          </a>
          <a
            href="/products"
            className={currentPath === "/products" ? "active" : ""}
          >
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
              <a
                href="/tables"
                className={currentPath === "/tables" ? "active" : ""}
              >
                📦 Selling Data
              </a>
              <a
                href="/users"
                className={currentPath === "/users" ? "active" : ""}
              >
                👤 Users
              </a>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
