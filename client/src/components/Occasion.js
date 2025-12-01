import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

const Occasion = () => {
  const [occasion, setOccasion] = useState("");
  const [currentOccasion, setCurrentOccasion] = useState("");
  const [occasionSummary, setOccasionSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = () => {
    setIsSidebarOpen(false);
  };

  // 🔥 Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // 🟣 Fetch current active occasion
  useEffect(() => {
    const fetchCurrentOccasion = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError("Please login to view occasions");
          return;
        }

        const res = await fetch("https://bills-weld.vercel.app/api/get-occasion", {
          headers: {
            Authorization: `Bearer ${token}` // 🔥 ADD AUTH HEADER
          }
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentOccasion(data?.activeOccasion || "");
        } else {
          console.error("Failed to fetch occasion");
        }
      } catch (err) {
        console.error("Error fetching current occasion:", err);
        setError("Failed to load occasion data");
      }
    };

    fetchCurrentOccasion();
    fetchOccasionSummary();
  }, []);

  const fetchOccasionSummary = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const res = await fetch("https://bills-weld.vercel.app/api/occasion-summary", {
        headers: {
          Authorization: `Bearer ${token}` // 🔥 ADD AUTH HEADER
        }
      });

      if (res.ok) {
        const data = await res.json();
        setOccasionSummary(data);
      }
    } catch (err) {
      console.error("Error fetching occasion summary:", err);
    }
  };

  const handleSetOccasion = async () => {
    if (!occasion.trim()) {
      alert("Please enter an occasion name");
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await fetch("https://bills-weld.vercel.app/api/set-occasion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // 🔥 ADD AUTH HEADER
        },
        body: JSON.stringify({ occasion }),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Occasion set successfully!");
        setCurrentOccasion(data.activeOccasion);
        setOccasion("");
        fetchOccasionSummary();
      } else {
        alert(data.message || "Error setting occasion");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearOccasion = async () => {
    if (!window.confirm("Are you sure you want to clear the current occasion?")) {
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await fetch("https://bills-weld.vercel.app/api/clear-occasion", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` // 🔥 ADD AUTH HEADER
        }
      });

      if (res.ok) {
        alert("Occasion cleared!");
        setCurrentOccasion("");
        fetchOccasionSummary();
      } else {
        alert("Failed to clear occasion");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: "900px",
          margin: "0 auto"
        }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#1f2937", fontSize: "28px", fontWeight: "700" }}>
            🎉 Occasion Management Dashboard
          </h2>

      {error && (
        <div style={{
          padding: "10px",
          marginBottom: "20px",
          background: "#fee",
          border: "1px solid #fcc",
          borderRadius: "4px",
          color: "#c33"
        }}>
          {error}
        </div>
      )}

      <div style={{
        padding: "15px",
        marginBottom: "20px",
        background: "#f0f9ff",
        borderRadius: "8px",
        border: "2px solid #bae6fd"
      }}>
        <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#0369a1" }}>
          <strong>Current Active Occasion:</strong>
        </p>
        <p style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#0c4a6e" }}>
          {currentOccasion || "None"}
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter occasion (e.g. Diwali Sale)"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          style={{
            padding: "10px",
            width: "60%",
            marginRight: "10px",
            border: "2px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px"
          }}
          disabled={loading}
        />
        <button
          onClick={handleSetOccasion}
          disabled={loading || !occasion.trim()}
          style={{
            padding: "10px 20px",
            background: loading ? "#ccc" : "#667eea",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          {loading ? "Setting..." : "Set Occasion"}
        </button>
        <button
          onClick={handleClearOccasion}
          disabled={loading || !currentOccasion}
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            background: loading ? "#ccc" : "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          {loading ? "Clearing..." : "Clear Occasion"}
        </button>
      </div>

      <hr style={{ margin: "30px 0", border: "none", borderTop: "2px solid #e5e7eb" }} />

      <h3>📊 Occasion Summary</h3>
      {occasionSummary.length === 0 ? (
        <p style={{ color: "#6b7280", fontStyle: "italic" }}>No occasions found yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ textAlign: "left", padding: "12px" }}>Occasion</th>
              <th style={{ textAlign: "center", padding: "12px" }}>Total Bills</th>
              <th style={{ textAlign: "left", padding: "12px" }}>Users</th>
            </tr>
          </thead>
          <tbody>
            {occasionSummary.map((o, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px", fontWeight: "600" }}>{o._id}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>{o.totalBills}</td>
                <td style={{ padding: "12px" }}>
                  {o.users && o.users.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {o.users.map((u) => (
                        <li key={u._id}>{u.name || "Unnamed User"}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                      No user data
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
        </div>
      </main>
    </div>
  );
};

export default Occasion;
