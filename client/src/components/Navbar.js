// Navbar.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [username, setUsername] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:8080/api/user/me", {
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

  return (
    <nav className="navbar">
      <div className="logo-section">
        <img src="/sanghamitra logo.jpeg" alt="Logo" className="logo" />
        <span className="username">{username || "Loading..."}</span>
      </div>
      <ul className="nav-links">
        <li className={currentPath === "/user-dashboard" ? "active" : ""} onClick={() => navigate("/user-dashboard")}>HOME</li>
        <li className={currentPath === "/bill" ? "active" : ""} onClick={() => navigate("/bill")}>BILL</li>
        <li className={currentPath === "/home" ? "active" : ""} onClick={() => navigate("/home")}>PRE ORDER</li>
        <li className={currentPath === "/users" ? "active" : ""} onClick={() => navigate("/users")}>ABOUT</li>
        <li className={currentPath === "/dashboard" ? "active" : ""} onClick={() => navigate("/dashboard")}>ADMIN DASHBOARD</li>
        <li className={currentPath === "/logout" ? "active" : ""} onClick={() => navigate("/logout")}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
