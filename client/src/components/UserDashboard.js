import React, { useEffect, useState } from "react";

import "../styles/UserDashboard.css";

const UserDashboard = () => {
  const [username, setUsername] = useState("");

  const products = [
    { name: "Baby Wolf T-shirt", price: "499.00", img: "/Baby Wolf T-shirt.jpeg" },
    { name: "Pattern Tote Bag", price: "1,499.00", img: "/Pattern Tote Bag.jpeg" },
    { name: "Warli Terrain Frame", price: "800.00", img: "/Warli Terrain.jpeg" },
    { name: "Navayana Buddhism Book", price: "300.00", img: "/Navayana Buddhism.jpeg" },
  ];


  // Fetch logged-in user details
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Get JWT from storage
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
          setUsername(data.name); // Name from your User schema
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserData();
  }, []);

  const currentPath = window.location.pathname;

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/sanghamitra logo.jpeg" alt="Logo" className="logo" />
          <span className="username">{username || "Loading..."}</span>
        </div>
        <ul className="nav-links">
          <li className={currentPath === "/user-dashboard" ? "active" : ""} onClick={() => (window.location.href = "/user-dashboard")}>HOME</li>
          <li className={currentPath === "/bill" ? "active" : ""} onClick={() => (window.location.href = "/bill")}>BILL</li>
          <li className={currentPath === "/" ? "active" : ""} onClick={() => (window.location.href = "")}>PRE ORDER</li>
          <li className={currentPath === "/" ? "active" : ""} onClick={() => (window.location.href = "")}>ABOUT</li>
          <li className={currentPath === "/dashboard" ? "active" : ""} onClick={() => (window.location.href = "/dashboard")}>ADMIN DASHBOARD</li>
          <li className={currentPath === "/logout" ? "active" : ""} onClick={() => (window.location.href = "/logout")}>Logout</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-overlay">
          <h1 style={{ color: 'rgb(50, 18, 110)'}}>Sanghamitra Business Incubators</h1>
          <div className="search-bar">
            <input type="text" placeholder="Search" />
            <button>🔍</button>
          </div>
        </div>
      </header>

      {/* Category Sidebar + Product List */}
      <div className="content">
        <aside className="sidebar">
          <button className="category active">New Collection</button>
          <button className="category">Special Promo</button>
          <button className="category">Casual Bag</button>
          <button className="category">Setting</button>
        </aside>

        <section className="product-list">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <img src={product.img} alt={product.name} />
              <p className="product-name">{product.name}</p>
              <p className="price">₹{product.price}</p>
              <button className="add-btn">add</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;
