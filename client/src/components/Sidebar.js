import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, onToggle, onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [openTables, setOpenTables] = useState(false);
  const [username, setUsername] = useState("Loading...");
    
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
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

  const handleNavigation = (path) => {
    navigate(path);
    onItemClick(); // Close sidebar after clicking an item
  };

  // Fixed navbar styles
  const navbarStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "70px",
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    padding: "0 30px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1002
  };

  // Logo section styles
  const logoSectionStyles = {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  };

  // Logo styles
  const logoStyles = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #2E8B57"
  };

  // Username styles
  const usernameStyles = {
    color: "#2E8B57",
    fontSize: "1rem",
    fontWeight: "600",
    letterSpacing: "0.5px"
  };

  // Menu button styles (three lines) - positioned on left
  const menuButtonStyles = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginRight: "20px"
  };

  // Left section for menu button and logo
  const leftSectionStyles = {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  };

  // Sidebar container styles - connected to navbar
  const sidebarStyles = {
    position: "fixed",
    top: "70px", // Start below navbar
    left: 0,
    height: "calc(100vh - 70px)", // Full height minus navbar
    width: isOpen ? "280px" : "0",
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    borderRight: "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease",
    overflow: "hidden",
    zIndex: 1001
  };

  // Sidebar content styles with scroll
  const sidebarContentStyles = {
    padding: "25px 20px",
    width: "280px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto", // Enable vertical scrolling
    overflowX: "hidden", // Prevent horizontal scrolling
    // Custom scrollbar styling
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(46, 139, 87, 0.3) transparent"
  };

  // Custom scrollbar styles for Webkit browsers (Chrome, Safari, Edge)
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "6px"
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
      borderRadius: "3px"
    },
    "&::-webkit-scrollbar-thumb": {
      background: "rgba(46, 139, 87, 0.3)",
      borderRadius: "3px",
      "&:hover": {
        background: "rgba(46, 139, 87, 0.5)"
      }
    }
  };

  // Apply scrollbar styles
  Object.assign(sidebarContentStyles, scrollbarStyles);

  // Link styles
  const getLinkStyles = (path) => {
    const isActive = currentPath === path;
    return {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "14px 16px",
      color: isActive ? "#2E8B57" : "#555",
      textDecoration: "none",
      borderRadius: "10px",
      marginBottom: "8px",
      transition: "all 0.2s ease",
      background: isActive ? "rgba(46, 139, 87, 0.1)" : "transparent",
      border: isActive ? "1px solid rgba(46, 139, 87, 0.2)" : "1px solid transparent",
      fontWeight: isActive ? "600" : "500",
      fontSize: "0.95rem",
      "&:hover": {
        background: isActive ? "rgba(46, 139, 87, 0.15)" : "rgba(0, 0, 0, 0.03)"
      }
    };
  };

  // Dropdown link styles
  const dropdownLinkStyles = {
    cursor: "pointer",
    padding: "14px 16px",
    borderRadius: "10px",
    marginBottom: "8px",
    transition: "all 0.2s ease",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: openTables ? "rgba(46, 139, 87, 0.05)" : "transparent",
    color: "#555",
    fontWeight: "500",
    "&:hover": {
      background: openTables ? "rgba(46, 139, 87, 0.08)" : "rgba(0, 0, 0, 0.03)"
    }
  };

  // Dropdown menu styles
  const dropdownMenuStyles = {
    marginLeft: "20px",
    borderLeft: "2px solid rgba(46, 139, 87, 0.2)",
    paddingLeft: "10px",
    marginTop: "5px",
    marginBottom: "15px"
  };

  // Section header styles
  const sectionHeaderStyles = {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "25px 0 15px 16px"
  };

  // Footer styles for sidebar
  const sidebarFooterStyles = {
    marginTop: "auto",
    paddingTop: "20px",
    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    color: "#888",
    fontSize: "0.8rem"
  };

  return (
    <>
      {/* Fixed Top Navbar */}
      <div style={navbarStyles}>
        <div style={leftSectionStyles}>
          {/* Menu Button (Three Lines) */}
          <button 
            style={menuButtonStyles}
            onClick={onToggle}
          >
            <div style={{
              width: "20px",
              height: "2px",
              background: "#2E8B57",
              transition: "all 0.3s ease",
              transform: isOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
            }}></div>
            <div style={{
              width: "20px",
              height: "2px",
              background: "#2E8B57",
              transition: "all 0.3s ease",
              opacity: isOpen ? "0" : "1"
            }}></div>
            <div style={{
              width: "20px",
              height: "2px",
              background: "#2E8B57",
              transition: "all 0.3s ease",
              transform: isOpen ? "rotate(-45deg) translate(7px, -6px)" : "none"
            }}></div>
          </button>

          {/* Logo */}
          <div style={logoSectionStyles}>
            <img src="/sanghamitra logo.jpeg" alt="Logo" style={logoStyles} />
          </div>
        </div>

        {/* Username on the right */}
        <span style={usernameStyles}>{username}</span>
      </div>

      {/* Fixed Sidebar - connected to navbar */}
      <aside style={sidebarStyles}>
        <div style={sidebarContentStyles}>
          <div style={sectionHeaderStyles}>MAIN</div>
          <nav style={{ flex: 1 }}>
            <a
              href="/admin-dashboard"
              style={getLinkStyles("/admin-dashboard")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/admin-dashboard");
              }}
            >
              <span>📈</span>
              <span>Dashboard</span>
            </a>
            
            <a 
              href="/view" 
              style={getLinkStyles("/view")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/view");
              }}
            >
              <span>📄</span>
              <span>View Bills</span>
            </a>
            <a
              href="/admin-analytics"
              style={getLinkStyles("/admin-analytics")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/admin-analytics");
              }}
            >
              <span>📊</span>
              <span>Analytics</span>
            </a>
            <a
              href="/products"
              style={getLinkStyles("/products")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/products");
              }}
            >
              <span>📦</span>
              <span>Products</span>
            </a>

            <div style={sectionHeaderStyles}>MANAGEMENT</div>

            {/* Dropdown for Tables */}
            <div
              onClick={() => setOpenTables(!openTables)}
              style={dropdownLinkStyles}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span>🧾</span>
                <span>Tables</span>
              </div>
              <span>{openTables ? "▲" : "▼"}</span>
            </div>

            {openTables && (
              <div style={dropdownMenuStyles}>
                <a
                  href="/tables"
                  style={getLinkStyles("/tables")}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/tables");
                  }}
                >
                  <span>📦</span>
                  <span>Selling Data</span>
                </a>
                <a
                  href="/users"
                  style={getLinkStyles("/users")}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/users");
                  }}
                >
                  <span>👤</span>
                  <span>Users</span>
                </a>
              </div>
            )}

            {/* Additional menu items to demonstrate scrolling */}
            <a
              href="/settings"
              style={getLinkStyles("/settings")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/settings");
              }}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </a>
            <a
              href="/reports"
              style={getLinkStyles("/reports")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/reports");
              }}
            >
              <span>📋</span>
              <span>Reports</span>
            </a>
            <a
              href="/backup"
              style={getLinkStyles("/backup")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/backup");
              }}
            >
              <span>💾</span>
              <span>Backup</span>
            </a>
            <a
              href="/help"
              style={getLinkStyles("/help")}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/help");
              }}
            >
              <span>❓</span>
              <span>Help & Support</span>
            </a>
          </nav>

          {/* Sidebar Footer */}
          <div style={sidebarFooterStyles}>
            <div>Sanghamitra Billing</div>
            <div style={{ fontSize: "0.7rem", marginTop: "5px" }}>v1.0.0</div>
          </div>
        </div>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {isOpen && (
        <div 
          style={{
            position: "fixed",
            top: "70px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: window.innerWidth < 768 ? "block" : "none"
          }}
          onClick={onToggle}
        />
      )}

      {/* Global scrollbar styles */}
      <style>
        {`
          /* Custom scrollbar for Webkit browsers */
          .sidebar-content::-webkit-scrollbar {
            width: 6px;
          }
          .sidebar-content::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 3px;
          }
          .sidebar-content::-webkit-scrollbar-thumb {
            background: rgba(46, 139, 87, 0.3);
            border-radius: 3px;
          }
          .sidebar-content::-webkit-scrollbar-thumb:hover {
            background: rgba(46, 139, 87, 0.5);
          }

          /* Custom scrollbar for Firefox */
          .sidebar-content {
            scrollbar-width: thin;
            scrollbar-color: rgba(46, 139, 87, 0.3) transparent;
          }
        `}
      </style>
    </>
  );
};

export default Sidebar;

