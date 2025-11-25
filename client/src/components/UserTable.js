import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = () => {
    setIsSidebarOpen(false);
  };
  //const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // assume stored at login
        const res = await fetch("http://localhost:8080/api/user/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 403) {
          alert("Access denied. Admins only.");
          navigate("/"); // redirect non-admins
          return;
        }

        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading users...</p>;
  }

  return (
    <div className="dashboard">
       <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        onItemClick={handleSidebarItemClick}
       />
      <div style={{ padding: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Registered Users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <thead style={{ background: "#f4f4f4" }}>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Created At</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "15px" }}>
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
                  <td style={styles.td}>
                    <button
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/each-bills/${user._id}`)}
                    >
                      View Bills
                    </button>
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
  th: { padding: "12px", border: "1px solid #ddd", textAlign: "left" },
  td: { padding: "12px", border: "1px solid #ddd" },
};

export default UserTable;
