import React, { useState, useEffect } from "react";

const Occasion = () => {
  const [occasion, setOccasion] = useState("");
  const [currentOccasion, setCurrentOccasion] = useState("");
  const [occasionSummary, setOccasionSummary] = useState([]);

  
  // 🟣 Fetch current active occasion
  useEffect(() => {
    fetch("https://billing-app-server.vercel.app/api/get-occasion")
      .then((res) => res.json())
      .then((data) => setCurrentOccasion(data?.activeOccasion || ""))
      .catch((err) => console.error("Error fetching current occasion:", err));

    fetchOccasionSummary(); // fetch all occasions summary
  }, []);

  const fetchOccasionSummary = async () => {
    try {
      const res = await fetch("https://billing-app-server.vercel.app/api/occasion-summary");
      const data = await res.json();
      setOccasionSummary(data);
    } catch (err) {
      console.error("Error fetching occasion summary:", err);
    }
  };

  const handleSetOccasion = async () => {
    try {
      const res = await fetch("https://billing-app-server.vercel.app/api/set-occasion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Occasion set successfully!");
        setCurrentOccasion(data.activeOccasion);
        setOccasion("");
        fetchOccasionSummary(); // refresh
      } else {
        alert(data.message || "Error setting occasion");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleClearOccasion = async () => {
    try {
      const res = await fetch("https://billing-app-server.vercel.app/api/clear-occasion", {
        method: "POST",
      });
      if (res.ok) {
        alert("Occasion cleared!");
        setCurrentOccasion("");
        fetchOccasionSummary();
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>🎉 Occasion Management Dashboard</h2>
      <p><strong>Current Active Occasion:</strong> {currentOccasion || "None"}</p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter occasion (e.g. Diwali Sale)"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
        />
        <button onClick={handleSetOccasion}>Set Occasion</button>
        <button onClick={handleClearOccasion} style={{ marginLeft: "10px" }}>
          Clear Occasion
        </button>
      </div>

      <hr />

      <h3>📊 Occasion Summary</h3>
      {occasionSummary.length === 0 ? (
        <p>No occasions found yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f3f3" }}>
              <th>Occasion</th>
              <th>Total Bills</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            {occasionSummary.map((o, index) => (
              <tr key={index}>
                <td>{o._id}</td>
                <td>{o.totalBills}</td>
                <td>
                  {o.users && o.users.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {o.users.map((u) => (
                        <li key={u._id}>{u.name || "Unnamed User"}</li>
                      ))}
                    </ul>
                  ) : (
                    "No user data"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Occasion;
