import React from "react";

const Dashboard = () => {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div style={{
        backgroundColor: "#1E3A8A", // blue
        color: "white",
        width: "250px",
        display: "flex",
        flexDirection: "column",
        padding: "20px"
      }}>
        <h2 style={{ marginBottom: "40px" }}>Apeksha Garse</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <button style={linkStyle}>Dashboard</button>
            <button style={linkStyle}>Tasks</button>
            <button style={linkStyle}>Reports</button>
            <button style={linkStyle}>Settings</button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{
        backgroundColor: "#EDE9FE", // faint purple
        flex: 1,
        padding: "20px"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h1 style={{ color: "#1E3A8A" }}>Billing App</h1>
          <button style={{
            backgroundColor: "#1E3A8A",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px"
          }}>
            New Task
          </button>
        </div>

        {/* Table */}
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <thead style={{ backgroundColor: "#1E3A8A", color: "white" }}>
            <tr>
              <th style={thStyle}>Due Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Task Name</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>15/08/2025</td>
              <td style={tdStyle}><span style={badgeGrey}>Not Started</span></td>
              <td style={tdStyle}>Build Android Billing App</td>
              <td style={tdStyle}>Explore hosting, research on Flutter, Firebase...</td>
              <td style={tdStyle}>Apeksha Garse</td>
            </tr>
            <tr>
              <td style={tdStyle}>08/08/2025</td>
              <td style={tdStyle}><span style={badgeBlue}>In Progress</span></td>
              <td style={tdStyle}>Improve UI of Billing App</td>
              <td style={tdStyle}>Change header text, add log, modify graph view...</td>
              <td style={tdStyle}>Apeksha Garse</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles
const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "16px"
};

const thStyle = {
  padding: "10px",
  textAlign: "left"
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd"
};

const badgeGrey = {
  backgroundColor: "#9CA3AF",
  color: "white",
  padding: "4px 8px",
  borderRadius: "5px",
  fontSize: "12px"
};

const badgeBlue = {
  backgroundColor: "#3B82F6",
  color: "white",
  padding: "4px 8px",
  borderRadius: "5px",
  fontSize: "12px"
};

export default Dashboard;
