
//https://billing-app-server.vercel.app/
import React, { useState } from "react";
import Navbar from "./Navbar";
import BillForm from "./BillForm";
import UserBill from "./UserBill";  
import Analytics from "./Analytics";  
import Occasion from "./Occasion";  

const UserDashboard = () => {
  // ✅ Show BillForm by default
  const [activeSection, setActiveSection] = useState("bill");
  const [hoveredCard, setHoveredCard] = useState(null);

  const renderSection = () => {
    switch (activeSection) {
      case "bill":
        return <BillForm embedded={true} />;
      case "user-bills":
        return <UserBill embedded={true} />;
      case "analytics":
        return <Analytics embedded={true} />;
      case "occasion":
        return <Occasion embedded={true} />;
      default:
        return null;
    }
  };

  // Dashboard container styles - Using green/teal gradient instead of blue
  const dashboardStyles = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2E8B57 0%, #20B2AA 100%)",
    //background: "linear-gradient(135deg, #FF6B35 0%, #FFA500 100%)",
    //background: "linear-gradient(135deg, #6A0DAD 0%, #8A2BE2 100%)",
    //background: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  // Grid container styles
  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    margin: "30px auto",
    maxWidth: "1200px"
  };

  // Card base styles
  const getCardStyles = (section) => {
    const isActive = activeSection === section;
    const isHovered = hoveredCard === section;
    
    return {
      background: isActive ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.95)",
      borderRadius: "15px",
      padding: "30px 25px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: isActive 
        ? "0 12px 30px rgba(46, 139, 87, 0.2)" 
        : "0 8px 25px rgba(0, 0, 0, 0.1)",
      border: isActive ? "2px solid #2E8B57" : "2px solid transparent",
      backdropFilter: "blur(10px)",
      transform: isHovered ? "translateY(-8px)" : "translateY(0)",
      borderColor: isHovered ? "rgba(46, 139, 87, 0.3)" : (isActive ? "#2E8B57" : "transparent"),
    };
  };

  // Card title styles
  const cardTitleStyles = {
    color: "#333",
    fontSize: "1.4rem",
    fontWeight: "600",
    marginBottom: "12px",
    letterSpacing: "0.5px"
  };

  // Card description styles
  const cardDescStyles = {
    color: "#666",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    margin: "0",
    fontWeight: "400"
  };

  // Section container styles
  const sectionStyles = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "15px",
    padding: "30px",
    margin: "30px auto",
    maxWidth: "1200px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    minHeight: "400px"
  };

  return (
    <div style={dashboardStyles}>
      <Navbar />
      

      <div style={gridStyles}>
        <div
          style={getCardStyles("bill")}
          onClick={() => setActiveSection("bill")}
          onMouseEnter={() => setHoveredCard("bill")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={cardTitleStyles}>Create Bill</h3>
          <p style={cardDescStyles}>Create and manage new bills</p>
        </div>

        <div
          style={getCardStyles("user-bills")}
          onClick={() => setActiveSection("user-bills")}
          onMouseEnter={() => setHoveredCard("user-bills")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={cardTitleStyles}>View Bills</h3>
          <p style={cardDescStyles}>Check all saved bills</p>
        </div>

        <div
          style={getCardStyles("analytics")}
          onClick={() => setActiveSection("analytics")}
          onMouseEnter={() => setHoveredCard("analytics")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={cardTitleStyles}>Analytics</h3>
          <p style={cardDescStyles}>View sales analytics & insights</p>
        </div>

        <div
          style={getCardStyles("occasion")}
          onClick={() => setActiveSection("occasion")}
          onMouseEnter={() => setHoveredCard("occasion")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={cardTitleStyles}>Set occasian</h3>
          <p style={cardDescStyles}>Set Occasion first</p>
        </div>
      </div>

      <div style={sectionStyles}>
        {renderSection()}
      </div>
    </div>
  );
};

export default UserDashboard;
