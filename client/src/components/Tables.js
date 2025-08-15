import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Tables.css'; // Add styles here if needed


const TopSellingAnalytics = () => {
  const [topSelling, setTopSelling] = useState([]);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await fetch('https://billing-app-server.vercel.app/api/products');
        const data = await res.json();

        const processed = [];

        data.forEach((product) => {
          const sold = product.__v || 0;

          product.categories.forEach((cat) => {
            processed.push({
              name: `${product.product} - ${cat.name}`,
              product: product.product,
              category: cat.name,
              price: cat.price,
              sold: sold,
              revenue: cat.price * sold,
            });
          });
        });

        // Sort by revenue and get top 5
        const topFive = processed
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopSelling(topFive);
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchTopSelling();
  }, []);

  const currentPath = window.location.pathname;

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/sanghamitra logo.jpeg" alt="Logo" className="logo" />
          <span className="username">Sanghamitra Admin</span>
        </div>
        <ul className="nav-links">
          <li className={currentPath === "/" ? "active" : ""} onClick={() => (window.location.href = "")}>PRE ORDER</li>
          <li className={currentPath === "/logout" ? "active" : ""} onClick={() => (window.location.href = "/logout")}>Logout</li>
        </ul>
      </nav>
    <div className="dashboard-layout">
      <aside className="sidebar">
          {/*<button
          className={`category ${currentPath === "/dashboard" ? "active" : ""}`}
          onClick={() => (window.location.href = "/dashboard")}
          >Dashboard</button> */}

          <nav>
          <a href="/dashboard" className={currentPath === "/dashboard" ? "active" : ""}>📈 Dashboard</a>
          <a href="/user-dashboard" className={currentPath === "/user-dashboard" ? "active" : ""}>🏠 Home</a>
          <a href="/tables" className={currentPath === "/tables" ? "active" : ""}>🧾 Tables</a>
          <a href="/view" className={currentPath === "/view" ? "active" : ""}>📄 View Bills</a>
          <a href="/analytics" className={currentPath === "/analytics" ? "active" : ""}>📊 Analytics</a>
          <a href="/products" className={currentPath === "/products" ? "active" : ""}>📦 Products</a>
        </nav>
      </aside>

    
    <div className="top-selling-container">
      <h2>Top 5 Selling Products by Revenue</h2>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price (₹)</th>
            <th>Sold</th>
            <th>Revenue (₹)</th>
          </tr>
        </thead>
        <tbody>
          {topSelling.map((item, index) => (
            <tr key={index}>
              <td>{item.product}</td>
              <td>{item.category}</td>
              <td>{item.price}</td>
              <td>{item.sold}</td>
              <td>{item.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '2rem' }}>Revenue Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topSelling} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={150} />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" name="Revenue ₹" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    </div>
    </div>
  );
};

export default TopSellingAnalytics;
