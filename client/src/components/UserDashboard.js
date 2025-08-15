// src/pages/UserDashboard.js
import React from "react";
import "../styles/UserDashboard.css";

const UserDashboard = () => {
  const products = [
    { name: "Beige Casual Bag", price: "68.56", img: "/beige-bag.jpg" },
    { name: "Brown Casual Bag", price: "68.56", img: "/brown-bag.jpg" },
    { name: "Orange Casual Bag", price: "68.56", img: "/orange-bag.jpg" },
  ];

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/logo.png" alt="Logo" className="logo" />
          <span className="username">Olivia Wilson</span>
        </div>
        <ul className="nav-links">
          <li className="active">HOME</li>
          <li>CART</li>
          <li>PRE ORDER</li>
          <li>ABOUT</li>
          <li>CONTACT</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-overlay">
          <h1>Our New Collection</h1>
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
          <button className="category">Party Bag</button>
        </aside>

        <section className="product-list">
          {products.map((product, index) => (
            <div key={index} className="product-card">
              <img src={product.img} alt={product.name} />
              <p className="product-name">{product.name}</p>
              <p className="price">${product.price}</p>
              <button className="add-btn">add</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default UserDashboard;
