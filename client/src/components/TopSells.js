import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Sidebar from "./Sidebar";

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [showAllRevenue, setShowAllRevenue] = useState(false);
  const [showAllQuantity, setShowAllQuantity] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = () => {
    setIsSidebarOpen(false);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://bills-welding.vercel.app/api/top-products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchData();
  }, []);
  
  const topRevenue = [...products].sort((a, b) => b.revenue - a.revenue);
  const displayedRevenue = showAllRevenue ? topRevenue : topRevenue.slice(0, 5);

  const topQuantity = [...products].sort((a, b) => b.totalSold - a.totalSold);
  const displayedQuantity = showAllQuantity ? topQuantity : topQuantity.slice(0, 5);

  return (
    <div className="dashboard" style={{ padding: "20px" }}>
       <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        onItemClick={handleSidebarItemClick}
       />

      {/* Flex container for tables */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "50px" }}>
        {/* Revenue Table */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2 style={{ textAlign: "center" }}>Top Selling Products by Revenue</h2>
          <table style={styles.table}>
            <thead style={{ background: "#f4f4f4" }}>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {displayedRevenue.map((p, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>₹{p.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length > 5 && (
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button style={styles.button} onClick={() => setShowAllRevenue(!showAllRevenue)}>
                {showAllRevenue ? "Show Top 5" : "Show More"}
              </button>
            </div>
          )}
        </div>

        {/* Quantity Table */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2 style={{ textAlign: "center" }}>Top Selling Products by Quantity</h2>
          <table style={styles.table}>
            <thead style={{ background: "#f4f4f4" }}>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Sold</th>
              </tr>
            </thead>
            <tbody>
              {displayedQuantity.map((p, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.totalSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length > 5 && (
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <button style={styles.button} onClick={() => setShowAllQuantity(!showAllQuantity)}>
                {showAllQuantity ? "Show Top 5" : "Show More"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Flex container for charts */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ textAlign: "center" }}>Revenue Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayedRevenue} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, minWidth: "300px" }}>
          <h3 style={{ textAlign: "center" }}>Quantity Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayedQuantity} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSold" fill="#28a745" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  table: { width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
  th: { padding: "12px", border: "1px solid #ddd", textAlign: "left" },
  td: { padding: "12px", border: "1px solid #ddd" },
  button: { padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
};

export default TopProducts;
