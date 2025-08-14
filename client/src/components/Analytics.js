import React, { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8884d8", "#28a745", "#ffc658", "#ff7f50", "#a28fd0", "#00c853", "#ffb74d"];

const BillingChart = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("Bar");
  const currentPath = window.location.pathname;


  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/");
        const data = await response.json();
        setBillingData(data);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const getProductData = () => {
    const productStats = {};

    billingData.forEach((bill) => {
      bill.products.forEach(({ product, quantity, total }) => {
        if (!productStats[product]) {
          productStats[product] = {
            name: product,
            quantitySold: 0,
            totalAmount: 0,
          };
        }

        productStats[product].quantitySold += Number(quantity);
        productStats[product].totalAmount += Number(total);
      });
    });

    return Object.values(productStats);
  };

  const productData = getProductData();
  const renderCustomizedLabel = ({ percent }) => `${(percent * 100).toFixed(1)}%`;

  const renderChart = () => {
    switch (chartType) {
      case "Bar":
        return (
          <>
            <h3>Bar Chart: Total Amount and Quantity Sold</h3>
            <ResponsiveContainer height={300}>
              <BarChart data={productData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Rupees", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "totalAmount" ? [`₹${value}`, "Total Amount"] : [value, "Quantity Sold"]
                  }
                />
                <Legend />
                <Bar dataKey="totalAmount" fill="#8884d8" name="Total Amount (₹)" />
                <Bar dataKey="quantitySold" fill="#28a745" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </>
        );

      case "Line":
        return (
          <>
            <h3>Line Chart: Total Amount and Quantity Sold</h3>
            <ResponsiveContainer height={300}>
              <LineChart data={productData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Rupees", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "totalAmount" ? [`₹${value}`, "Total Amount"] : [value, "Quantity Sold"]
                  }
                />
                <Legend />
                <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" name="Total Amount (₹)" />
                <Line type="monotone" dataKey="quantitySold" stroke="#28a745" name="Quantity Sold" />
              </LineChart>
            </ResponsiveContainer>
          </>
        );

      case "Area":
        return (
          <>
            <h3>Area Chart: Total Amount and Quantity Sold</h3>
            <ResponsiveContainer height={300}>
              <AreaChart data={productData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: "Rupees", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "totalAmount" ? [`₹${value}`, "Total Amount"] : [value, "Quantity Sold"]
                  }
                />
                <Legend />
                <Area type="monotone" dataKey="totalAmount" stroke="#8884d8" fill="#8884d8" name="Total Amount (₹)" />
                <Area type="monotone" dataKey="quantitySold" stroke="#28a745" fill="#28a745" name="Quantity Sold" />
              </AreaChart>
            </ResponsiveContainer>
          </>
        );

      case "Pie":
        return (
          <>
            <h3>Pie Chart: Total Amount per Product (with %)</h3>
            <ResponsiveContainer height={300}>
              <PieChart>
                <Tooltip formatter={(v) => [`₹${v}`, "Total Amount"]} />
                <Legend />
                <Pie
                  data={productData}
                  dataKey="totalAmount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderCustomizedLabel}
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </>
        );

      case "Doughnut":
        return (
          <>
            <h3>Doughnut Chart: Total Amount per Product</h3>
            <ResponsiveContainer height={300}>
              <PieChart>
                <Tooltip formatter={(v) => [`₹${v}`, "Total Amount"]} />
                <Legend />
                <Pie
                  data={productData}
                  dataKey="totalAmount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label={renderCustomizedLabel}
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </>
        );

      default:
        return null;
    }
  };

  if (loading) return <div>Loading chart...</div>;

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/sanghamitra logo.jpeg" alt="Logo" className="logo" />
          <span className="username">Sanghamitra Admin</span>
        </div>
        <ul className="nav-links">
          <li className={currentPath === "/logout" ? "active" : ""} onClick={() => (window.location.href = "/logout")}>Logout</li>
        </ul>
      </nav>

      <div className="dashboard-layout">
      <aside className="sidebar">
        <nav>
          <a href="/dashboard" className={currentPath === "/dashboard" ? "active" : ""}>📈 Dashboard</a>
          <a href="/user-dashboard" className={currentPath === "/user-dashboard" ? "active" : ""}>🏠 Home</a>
          <a href="/tables" className={currentPath === "/tables" ? "active" : ""}>🧾 Tables</a>
          <a href="/view" className={currentPath === "/view" ? "active" : ""}>📄 View Bills</a>
          <a href="/analytics" className={currentPath === "/analytics" ? "active" : ""}>📊 Analytics</a>
          <a href="/products" className={currentPath === "/products" ? "active" : ""}>📦 Products</a>
        </nav>
      </aside>


    <div style={{ width: "100%", padding: "1rem", maxWidth: "900px", margin: "auto" }}>
      <h2>Billing Summary: Products Sold and Earnings</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="chartType">Choose Chart Type: </label>
        <select
          id="chartType"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          style={{ padding: "0.4rem", fontSize: "1rem", marginLeft: "0.5rem" }}
        >
          <option value="Bar">Bar Chart</option>
          <option value="Pie">Pie Chart</option>
          <option value="Doughnut">Doughnut Chart</option>
        </select>
      </div>

      {renderChart()}
    </div>
    </div>
    </div>
  );
};

export default BillingChart;
