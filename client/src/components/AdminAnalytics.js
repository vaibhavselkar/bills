import React, { useEffect, useState } from "react";
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
  const [selectedRange, setSelectedRange] = useState("year");
  const [occasionFilter, setOccasionFilter] = useState(""); // 🔥 NEW: Occasion filter
  const [uniqueOccasions, setUniqueOccasions] = useState([]); // 🔥 NEW: List of occasions
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
        const token = localStorage.getItem("token");
        const response = await fetch("https://bills-weld.vercel.app/api/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unauthorized or failed to fetch");
        }

        const data = await response.json();
        setBillingData(Array.isArray(data) ? data : []);
        
        // 🔥 Extract unique occasions
        const occasions = [...new Set(data.map(bill => bill.occasion).filter(o => o && o.trim() !== ''))];
        setUniqueOccasions(occasions);
      } catch (err) {
        console.error("Failed to fetch billing data:", err);
        setBillingData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // 🔥 Filter bills by selected date range AND occasion
  const filterByDateRange = (data) => {
    const now = new Date();

    return data.filter((bill) => {
      const billDate = new Date(bill.date || bill.createdAt);

      // Date filter
      let dateMatch = true;
      if (selectedRange === "today") {
        dateMatch = billDate.toDateString() === now.toDateString();
      } else if (selectedRange === "month") {
        dateMatch = billDate.getMonth() === now.getMonth() &&
                    billDate.getFullYear() === now.getFullYear();
      } else if (selectedRange === "year") {
        dateMatch = billDate.getFullYear() === now.getFullYear();
      }

      // 🔥 Occasion filter
      let occasionMatch = true;
      if (occasionFilter === 'no-occasion') {
        occasionMatch = !bill.occasion || bill.occasion.trim() === '';
      } else if (occasionFilter !== '') {
        occasionMatch = bill.occasion === occasionFilter;
      }

      return dateMatch && occasionMatch;
    });
  };

  // Get chart data
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
    // 🔥 Show filter description
    const filterDescription = occasionFilter 
      ? (occasionFilter === 'no-occasion' ? 'Daily Bills' : `🎉 ${occasionFilter}`)
      : 'All Bills';

    switch (chartType) {
      case "Bar":
        return (
          <>
            <h3>Bar Chart: Total Amount and Quantity Sold</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              <strong>Period:</strong> {selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1)} | 
              <strong> Filter:</strong> {filterDescription}
            </p>
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
            <h3>Pie Chart: Total Amount per Product (%)</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              <strong>Period:</strong> {selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1)} | 
              <strong> Filter:</strong> {filterDescription}
            </p>
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
            <h3>Doughnut Chart: Total Amount per Product</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              <strong>Period:</strong> {selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1)} | 
              <strong> Filter:</strong> {filterDescription}
            </p>
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
        minHeight: "calc(100vh - 70px)",
        background: "linear-gradient(135deg, #2E8B57 0%, #20B2AA 100%)",
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "15px",
          padding: "30px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
          maxWidth: "1000px",
          margin: "auto",
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
            Billing Summary: Products Sold and Earnings
          </h2>

          {/* Date Range Filter Buttons */}
          <div style={{ marginBottom: "1rem", display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedRange("year")}
              style={{
                padding: "0.5rem 1.2rem",
                background: selectedRange === "year" ? "#475087" : "#e5e7eb",
                color: selectedRange === "year" ? "#fff" : "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: selectedRange === "year" ? "600" : "400",
                transition: "all 0.2s"
              }}
            >
              This Year
            </button>

            <button
              onClick={() => setSelectedRange("month")}
              style={{
                padding: "0.5rem 1.2rem",
                background: selectedRange === "month" ? "#475087" : "#e5e7eb",
                color: selectedRange === "month" ? "#fff" : "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: selectedRange === "month" ? "600" : "400",
                transition: "all 0.2s"
              }}
            >
              This Month
            </button>
            
            <button
              onClick={() => setSelectedRange("today")}
              style={{
                padding: "0.5rem 1.2rem",
                background: selectedRange === "today" ? "#475087" : "#e5e7eb",
                color: selectedRange === "today" ? "#fff" : "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: selectedRange === "today" ? "600" : "400",
                transition: "all 0.2s"
              }}
            >
              Today
            </button>
          </div>

          {/* 🔥 NEW: Occasion Filter Dropdown */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="occasionFilter" style={{ marginRight: '10px', fontWeight: '500' }}>
              Filter by Occasion:
            </label>
            <select
              id="occasionFilter"
              value={occasionFilter}
              onChange={(e) => setOccasionFilter(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "14px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                minWidth: "200px"
              }}
            >
              <option value="">All Bills</option>
              <option value="no-occasion">Daily Bills (No Occasion)</option>
              {uniqueOccasions.map((occasion, index) => (
                <option key={index} value={occasion}>
                  🎉 {occasion}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="chartType" style={{ marginRight: '10px', fontWeight: '500' }}>
              Choose Chart Type:
            </label>
            <select
              id="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                fontSize: "14px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              <option value="Bar">Bar Chart</option>
              <option value="Pie">Pie Chart</option>
              <option value="Doughnut">Doughnut Chart</option>
            </select>
          </div>

          {/* Display message if no data */}
          {productData.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: '#f3f4f6',
              borderRadius: '8px',
              color: '#6b7280'
            }}>
              <p style={{ fontSize: '16px', margin: 0 }}>
                No data available for the selected filters
              </p>
            </div>
          ) : (
            renderChart()
          )}
        </div>
      </main>
    </div>
  );
};

export default BillingChart;
