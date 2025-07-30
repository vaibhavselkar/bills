import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();


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

  // 🧠 Function to render percentage inside Pie chart
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
    <div className="home-layout">
      <aside className="sidebar">
        <button onClick={() => navigate('/')}>📊 Home</button>
        <button onClick={() => navigate('/bill')}>🧾 Bill</button>
        <button onClick={() => navigate('/view')}>👁️ ViewBills</button>
        <button onClick={() => navigate('/analytics')}>📈 Analytics</button>
        <button onClick={() => navigate('/products')}>📦 Product Management</button>
        <button onClick={() => navigate('/dashboard')}>🛡️Admin Dashboard</button>
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
  );
};

export default BillingChart;
