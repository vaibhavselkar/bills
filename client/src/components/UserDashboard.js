import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
//https://billing-app-server.vercel.app/
import "../styles/UserDashboard.css";
import "../styles/Home.css";

const UserDashboard = () => {
  const navigate = useNavigate();



  return (
     <div className="dashboard">
          <Navbar />
      <header className="hero">
        <div className="hero-overlay">
          <h1 style={{ color: 'rgb(50, 18, 110)'}}>Sanghamitra Business Incubators</h1>
        </div>
      </header>

      <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => navigate("/bill")}>
            <h3>Create Bill</h3>
            <p>Create and manage new bills</p>
          </div>
          <div className="dashboard-card" onClick={() => navigate("/view")}>
            <h3>View Bills</h3>
            <p>Check all saved bills</p>
          </div>
          <div className="dashboard-card" onClick={() => navigate("/products")}>
            <h3>Products</h3>
            <p>View product categories</p>
          </div>
          <div className="dashboard-card" onClick={() => navigate("/analytics")}>
            <h3>Analytics</h3>
            <p>View sales analytics & insights</p>
          </div>
      </div>
  </div>
  );
};

export default UserDashboard;
