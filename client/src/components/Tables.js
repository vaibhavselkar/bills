import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Tables.css'; // Add styles here if needed
import Sidebar from "./Sidebar"; // import the navbar


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


  return (
    <div className="dashboard">
      <Sidebar /> {/* Use Navbar component */}
    
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
  );
};

export default TopSellingAnalytics;
