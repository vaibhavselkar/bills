// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="header">
        <div className="brand">Sanghamitra Business Incubator</div>
      </header>

      <nav className="nav-bar">
        <button onClick={() => navigate('/')}>Dashboard</button>
        <button onClick={() => navigate('/bill')}>Bill</button>
        <button onClick={() => navigate('/view')}>ViewBills</button>
        <button onClick={() => navigate('/admin-login')}>Login</button>
        <button onClick={() => alert("Edit Profile coming soon!")}>Edit Profile</button>
        <button onClick={() => navigate('/products')}>Product Management</button>
      </nav>

      <div className="home-body">
        <h1>Welcome to Sanghamitra Billing App</h1>
        <p>Select an option from above to continue.</p>
      </div>
    </div>
  );
};

export default Home;
