import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import "../styles/ViewBills.css";
import Sidebar from "./Sidebar"; // import the navbar

const ViewBills = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const { userId } = useParams(); // <-- get userId from URL
  const [userName, setUserName] = useState("");

  // ✅ fetchBills defined with useCallback so it's stable
  const fetchBills = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://bills-welding.vercel.app/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 send token
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch bills");
      }

      // ✅ if there are bills, extract username from first bill
      if (data.length > 0 && data[0].user) {
        setUserName(data[0].user.name);
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      setBills(sorted);
    } catch (error) {
      console.error("Error fetching bills:", error);
      alert("Error fetching bills");
    }
  }, [userId]);

  // ✅ run fetchBills when userId changes
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const filteredBills = bills.filter((bill) => {
    const nameMatch = bill.customerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const dateMatch = dateFilter
      ? new Date(bill.date || bill.createdAt).toDateString() ===
        new Date(dateFilter).toDateString()
      : true;
    return nameMatch && dateMatch;
  });

  const totalStats = {
    totalBills: filteredBills.length,
    totalAmount: filteredBills.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    ),
    cashAmount: filteredBills
      .filter((b) => b.paymentMethod === "Cash")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    onlineAmount: filteredBills
      .filter((b) => b.paymentMethod === "Online")
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="admin-container">
        {/* ✅ Username shown on top */}
        <h2 style={{ marginBottom: "20px" }}>
          Bills of{" "}
          <span style={{ color: "#007bff" }}>{userName || "Loading..."}</span>
        </h2>

        {/* Stats Section */}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">{totalStats.totalBills}</div>
            <div className="stat-label">Total Bills</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ₹{totalStats.totalAmount.toFixed(2)}
            </div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ₹{totalStats.cashAmount.toFixed(2)}
            </div>
            <div className="stat-label">Cash Payments</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ₹{totalStats.onlineAmount.toFixed(2)}
            </div>
            <div className="stat-label">Online Payments</div>
          </div>
        </div>

        {/* Filters + Refresh */}
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
              }}
            >
              Reset
            </button>
          </div>
          <button onClick={fetchBills}>Refresh Data</button>
        </div>

        {/* Bills Table */}
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Items</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No bills found
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill._id}>
                  <td className="date-column">
                    {new Date(bill.date || bill.createdAt).toLocaleString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </td>
                  <td>{bill.customerName}</td>
                  <td>
                    {bill.products.length} items{" "}
                    <span
                      className="toggle-details"
                      onClick={(e) => {
                        const el = e.target.nextSibling;
                        el.style.display =
                          el.style.display === "block" ? "none" : "block";
                        e.target.textContent =
                          el.style.display === "block"
                            ? "(hide details)"
                            : "(show details)";
                      }}
                    >
                      (show details)
                    </span>
                    <div className="product-details" style={{ display: "none" }}>
                      {bill.products.map((p, i) => (
                        <div key={i}>
                          {p.product} - {p.category} (Qty: {p.quantity}, ₹
                          {p.price}, Disc: {p.discount}%)
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{bill.paymentMethod}</td>
                  <td>₹{bill.totalAmount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewBills;
