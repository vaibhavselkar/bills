import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";

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
  const [editingBill, setEditingBill] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    mobileNumber: "",
    paymentMethod: "Cash",
    totalAmount: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
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
      setBillingData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch billing data:", err);
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill._id);
    setEditForm({
      customerName: bill.customerName,
      mobileNumber: bill.mobileNumber || "",
      paymentMethod: bill.paymentMethod,
      totalAmount: bill.totalAmount
    });
  };

  const handleSave = async (billId) => {
    try {
      const response = await fetch(`https://bills-welding.vercel.app/api/bill/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Bill updated successfully!");
        setEditingBill(null);
        fetchBillingData();
      } else {
        alert(data.message || "Failed to update bill");
      }
    } catch (err) {
      console.error("Error updating bill:", err);
      alert("Error updating bill");
    }
  };

  const handleCancel = () => {
    setEditingBill(null);
  };

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
  const filteredBills = filterByDateRange(billingData);

  const renderCustomizedLabel = ({ percent }) =>
    `${(percent * 100).toFixed(1)}%`;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
    <div className="dashboard">
      <Navbar />

      <div style={styles.container}>
        <h2>Billing Summary: Products Sold and Earnings</h2>

        {/* Filter Buttons */}
        <div style={styles.filterSection}>
          <button
            onClick={() => setSelectedRange("year")}
            style={{
              ...styles.filterBtn,
              background: selectedRange === "year" ? "#475087" : "#ddd",
              color: selectedRange === "year" ? "#fff" : "#000",
            }}
          >
            This Year
          </button>

          <button
            onClick={() => setSelectedRange("month")}
            style={{
              ...styles.filterBtn,
              background: selectedRange === "month" ? "#475087" : "#ddd",
              color: selectedRange === "month" ? "#fff" : "#000",
            }}
          >
            This Month
          </button>

          <button
            onClick={() => setSelectedRange("today")}
            style={{
              ...styles.filterBtn,
              background: selectedRange === "today" ? "#475087" : "#ddd",
              color: selectedRange === "today" ? "#fff" : "#000",
            }}
          >
            Today
          </button>
        </div>

        {/* Chart Type Selector */}
        <div style={styles.chartSelector}>
          <label htmlFor="chartType">Choose Chart Type: </label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            style={styles.select}
          >
            <option value="Bar">Bar Chart</option>
            <option value="Pie">Pie Chart</option>
            <option value="Doughnut">Doughnut Chart</option>
          </select>
        </div>

        {/* Charts */}
        {renderChart()}

        {/* Bills Table */}
        <div style={styles.tableSection}>
          <h2 style={styles.tableTitle}>📋 All Bills ({filteredBills.length})</h2>
          
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Customer Name</th>
                  <th style={styles.th}>Mobile</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill._id} style={styles.tr}>
                    {editingBill === bill._id ? (
                      // Edit Mode
                      <>
                        <td style={styles.td}>{formatDate(bill.date || bill.createdAt)}</td>
                        <td style={styles.td}>
                          <input
                            type="text"
                            value={editForm.customerName}
                            onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                            style={styles.input}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            type="tel"
                            value={editForm.mobileNumber}
                            onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                            style={styles.input}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            type="number"
                            value={editForm.totalAmount}
                            onChange={(e) => setEditForm({ ...editForm, totalAmount: parseFloat(e.target.value) })}
                            style={styles.input}
                          />
                        </td>
                        <td style={styles.td}>
                          <select
                            value={editForm.paymentMethod}
                            onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                            style={styles.selectPayment}
                          >
                            <option value="Cash">💵 Cash</option>
                            <option value="Online">📱 Online</option>
                          </select>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleSave(bill._id)} style={styles.saveBtn}>
                            ✓ Save
                          </button>
                          <button onClick={handleCancel} style={styles.cancelBtn}>
                            ✕
                          </button>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td style={styles.td}>{formatDate(bill.date || bill.createdAt)}</td>
                        <td style={styles.td}>{bill.customerName}</td>
                        <td style={styles.td}>{bill.mobileNumber || "N/A"}</td>
                        <td style={styles.tdAmount}>₹{bill.totalAmount?.toFixed(2)}</td>
                        <td style={styles.td}>
                          <span style={bill.paymentMethod === "Cash" ? styles.cashBadge : styles.onlineBadge}>
                            {bill.paymentMethod === "Cash" ? "💵" : "📱"} {bill.paymentMethod}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button onClick={() => handleEdit(bill)} style={styles.editBtn}>
                            ✏️ Edit
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBills.length === 0 && (
            <div style={styles.noBills}>No bills found for selected period</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: "100%",
    padding: "1rem",
    maxWidth: "1200px",
    margin: "auto",
  },
  filterSection: {
    marginBottom: "1rem",
  },
  filterBtn: {
    padding: "0.4rem 1rem",
    marginRight: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "500",
  },
  chartSelector: {
    marginBottom: "1rem",
  },
  select: {
    padding: "0.4rem",
    fontSize: "1rem",
    marginLeft: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  tableSection: {
    marginTop: "3rem",
  },
  tableTitle: {
    marginBottom: "1rem",
    color: "#333",
  },
  tableWrapper: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#673199",
    color: "white",
    padding: "1rem",
    textAlign: "left",
    fontWeight: "600",
  },
  tr: {
    borderBottom: "1px solid #f0f0f0",
  },
  td: {
    padding: "1rem",
    verticalAlign: "middle",
  },
  tdAmount: {
    padding: "1rem",
    fontWeight: "bold",
    color: "#2e7d32",
    fontSize: "1.1rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "2px solid #673199",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
  selectPayment: {
    width: "100%",
    padding: "0.5rem",
    border: "2px solid #673199",
    borderRadius: "4px",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  editBtn: {
    background: "#f57c00",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  saveBtn: {
    background: "#2e7d32",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginRight: "0.5rem",
    fontWeight: "500",
  },
  cancelBtn: {
    background: "#d32f2f",
    color: "white",
    padding: "0.5rem 0.7rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  cashBadge: {
    background: "#c8e6c9",
    color: "#2e7d32",
    padding: "0.4rem 0.8rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "inline-block",
  },
  onlineBadge: {
    background: "#bbdefb",
    color: "#1565c0",
    padding: "0.4rem 0.8rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "inline-block",
  },
  noBills: {
    textAlign: "center",
    padding: "2rem",
    color: "#666",
    fontSize: "1.1rem",
  },
};

export default BillingChart;
