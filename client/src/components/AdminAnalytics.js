import React, { useEffect, useState } from "react";
//import Sidebar from "./Sidebar"; // import the navbar
import Sidebar from "./Sidebar";

import {
  BarChart,
  Bar,
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

const COLORS = [
  "#8884d8",
  "#2d773fff",
  "#ffc658",
  "#ff7f50",
  "#a28fd0",
  "#389c62ff",
  "#ffb74d",
];

const BillingChart = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("Bar");
  const [selectedRange, setSelectedRange] = useState("year"); // today, month, year
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSidebarItemClick = () => {
      setIsSidebarOpen(false);
    };


  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const token = localStorage.getItem("token"); // token saved on login
        const response = await fetch("https://bills-welding.vercel.app/api/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unauthorized or failed to fetch");
        }

        const data = await response.json();
        setBillingData(Array.isArray(data) ? data : []); // ensure it's always array
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
        setBillingData([]); // fallback to empty array
      } finally {
        setLoading(false);
      }
    };


    fetchBillingData();
  }, []);

  // --- filter bills by selected date range ---
  const filterByDateRange = (data) => {
    const now = new Date();

    return data.filter((bill) => {
      const billDate = new Date(bill.date || bill.createdAt);

      if (selectedRange === "today") {
        return billDate.toDateString() === now.toDateString();
      }
      if (selectedRange === "month") {
        return (
          billDate.getMonth() === now.getMonth() &&
          billDate.getFullYear() === now.getFullYear()
        );
      }
      if (selectedRange === "year") {
        return billDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  // --- get chart data ---
  const getProductData = () => {
    const productStats = {};
    const filtered = filterByDateRange(billingData);

    filtered.forEach((bill) => {
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

  const renderCustomizedLabel = ({ percent }) =>
    `${(percent * 100).toFixed(1)}%`;

    const renderChart = () => {
      switch (chartType) {
        case "Bar":
          return (
            <>
              <h3>Bar Chart: Total Amount and Quantity Sold ({selectedRange})</h3>
              <ResponsiveContainer height={300}>
                <BarChart
                  data={productData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(label) => `Product: ${label}`}
                    formatter={(value, key) => {
                      if (key === "totalAmount")
                        return [`₹${value}`, "Total Amount"];
                      if (key === "quantitySold")
                        return [value, "Quantity Sold"];
                      return [value, key];
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="quantitySold"
                    fill="#38914dff"
                    name="Quantity Sold"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="totalAmount"
                    fill="#8884d8"
                    name="Total Amount (₹)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          );
    
        case "Pie":
          return (
            <>
              <h3>Pie Chart: Total Amount per Product ({selectedRange}) (%)</h3>
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </>
          );
    
        case "Doughnut":
          return (
            <>
              <h3>Doughnut Chart: Total Amount per Product ({selectedRange})</h3>
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
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
  <div style={{ minHeight: "100vh" }}>
    <Sidebar 
      isOpen={isSidebarOpen} 
      onToggle={toggleSidebar}
      onItemClick={handleSidebarItemClick}
    />
    
    <main style={{
      marginTop: "70px",
      marginLeft: isSidebarOpen ? "280px" : "0",
      transition: "margin-left 0.3s ease",
      padding: "30px",
      minHeight: "calc(100vh - 70px)"
    }}>
      <div style={{
        width: "100%",
        padding: "1rem",
        maxWidth: "900px",
        margin: "auto",
      }}>
        <h2>Billing Summary: Products Sold and Earnings</h2>

        {/* Filter Buttons */}
        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={() => setSelectedRange("year")}
            style={{
              padding: "0.4rem 1rem",
              marginRight: "10px",
              background: selectedRange === "year" ? "#475087" : "#ddd",
              color: selectedRange === "year" ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            This Year
          </button>

          <button
            onClick={() => setSelectedRange("month")}
            style={{
              padding: "0.4rem 1rem",
              marginRight: "10px",
              background: selectedRange === "month" ? "#475087" : "#ddd",
              color: selectedRange === "month" ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            This Month
          </button>
          
          <button
            onClick={() => setSelectedRange("today")}
            style={{
              padding: "0.4rem 1rem",
              background: selectedRange === "today" ? "#475087" : "#ddd",
              color: selectedRange === "today" ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Today
          </button>
        </div>

        {/* Chart Type Selector */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="chartType">Choose Chart Type: </label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            style={{
              padding: "0.4rem",
              fontSize: "1rem",
              marginLeft: "0.5rem",
            }}
          >
            <option value="Bar">Bar Chart</option>
            <option value="Pie">Pie Chart</option>
            <option value="Doughnut">Doughnut Chart</option>
          </select>
        </div>

        {renderChart()}
      </div>
    </main>
  </div>
  );
};

export default BillingChart;
