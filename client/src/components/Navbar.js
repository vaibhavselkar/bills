import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [username, setUsername] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("https://billing-app-server.vercel.app/api/user/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.name);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, []);

  // Navbar container styles
  const navbarStyles = {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    padding: "15px 30px",
    borderRadius: "15px",
    margin: "10px auto",
    maxWidth: "1200px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative"
  };

  // Logo section styles
  const logoSectionStyles = {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  };

  // Logo styles
  const logoStyles = {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #2E8B57"
  };

  // Username styles
  const usernameStyles = {
    color: "#2E8B57",
    fontSize: "1.1rem",
    fontWeight: "600",
    letterSpacing: "0.5px"
  };

  // Desktop Navigation links container
  const navLinksStyles = {
    display: "flex",
    listStyle: "none",
    gap: "30px",
    margin: 0,
    padding: 0,
    alignItems: "center"
  };

  // Individual link styles
  const getLinkStyles = (path) => {
    const isActive = currentPath === path;
    return {
      color: isActive ? "#2E8B57" : "#666",
      fontSize: "0.95rem",
      fontWeight: isActive ? "600" : "500",
      cursor: "pointer",
      padding: "10px 20px",
      borderRadius: "25px",
      transition: "all 0.3s ease",
      background: isActive ? "rgba(46, 139, 87, 0.1)" : "transparent",
      border: isActive ? "1px solid rgba(46, 139, 87, 0.3)" : "1px solid transparent",
      textDecoration: "none",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
    };
  };

  // Mobile menu button (hamburger)
  const menuButtonStyles = {
    display: "none",
    flexDirection: "column",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px"
  };

  // Mobile menu overlay that covers the dashboard area
  const mobileMenuOverlayStyles = {
    display: isMenuOpen ? "block" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 999
  };

  // Mobile menu styles - appears below the navbar in the dashboard area
  const mobileMenuStyles = {
    position: "absolute",
    top: "100%",
    right: "20px",
    background: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    borderRadius: "15px",
    marginTop: "10px",
    padding: "20px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    zIndex: 1000,
    minWidth: "200px",
    display: isMenuOpen ? "block" : "none"
  };

  // Mobile menu list
  const mobileMenuListStyles = {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  };

  // Mobile menu item
  const mobileMenuItemStyles = {
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "center"
  };

  const getMobileLinkStyles = (path) => {
    const isActive = currentPath === path;
    return {
      ...mobileMenuItemStyles,
      color: isActive ? "#2E8B57" : "#666",
      fontWeight: isActive ? "600" : "500",
      background: isActive ? "rgba(46, 139, 87, 0.1)" : "transparent",
      border: isActive ? "1px solid rgba(46, 139, 87, 0.3)" : "1px solid transparent",
      textTransform: "uppercase",
      fontSize: "0.9rem",
      letterSpacing: "0.5px"
    };
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div 
          style={mobileMenuOverlayStyles}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      <div style={navbarStyles}>
        <div style={logoSectionStyles}>
          <img 
            src="/sanghamitra logo.jpeg" 
            alt="Sanghamitra Logo" 
            style={logoStyles} 
          />
          <span style={usernameStyles}>{username || "Loading..."}</span>
        </div>

        {/* Desktop Navigation - visible on larger screens */}
        <ul style={navLinksStyles}>
          <li 
            style={getLinkStyles("/user-dashboard")} 
            onClick={() => handleNavigation("/user-dashboard")}
          >
            HOME
          </li>
  
          <li 
            style={getLinkStyles("/logout")} 
            onClick={handleLogout}
          >
            LOGOUT
          </li>
        </ul>

        {/* Mobile Menu Button - visible only on small screens */}
        <button 
          style={{
            ...menuButtonStyles,
            display: "none" // Hide on desktop, we'll show via media query below
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div style={{
            width: "25px",
            height: "3px",
            background: "#2E8B57",
            transition: "all 0.3s ease",
            transform: isMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none"
          }}></div>
          <div style={{
            width: "25px",
            height: "3px",
            background: "#2E8B57",
            transition: "all 0.3s ease",
            opacity: isMenuOpen ? "0" : "1"
          }}></div>
          <div style={{
            width: "25px",
            height: "3px",
            background: "#2E8B57",
            transition: "all 0.3s ease",
            transform: isMenuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none"
          }}></div>
        </button>

        {/* Mobile Menu - appears below navbar */}
        <div style={mobileMenuStyles}>
          <ul style={mobileMenuListStyles}>
            <li 
              style={getMobileLinkStyles("/user-dashboard")} 
              onClick={() => handleNavigation("/user-dashboard")}
            >
              HOME
            </li>
            <li 
              style={getMobileLinkStyles("/bill")} 
              onClick={() => handleNavigation("/bill")}
            >
              BILL
            </li>
            <li 
              style={getMobileLinkStyles("/user-bills")} 
              onClick={() => handleNavigation("/user-bills")}
            >
              VIEW BILLS
            </li>
            <li 
              style={getMobileLinkStyles("/logout")} 
              onClick={handleLogout}
            >
              LOGOUT
            </li>
          </ul>
        </div>
      </div>

      {/* Inline media queries for responsiveness */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-menu-btn { display: flex !important; }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;
