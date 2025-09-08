import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar"; // import the navbar

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("https://billing-app-server.vercel.app/api/user/users");
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading users...</p>;
  }

  return (

    <div className="dashboard">
      <Sidebar /> {/* Use Navbar component */}

    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Registered Users</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ background: "#f4f4f4" }}>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "15px" }}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
};

const styles = {
  th: {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
  },
  td: {
    padding: "12px",
    border: "1px solid #ddd",
  },
};

export default UserTable;
