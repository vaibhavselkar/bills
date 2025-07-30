// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-layout">
        <aside className="sidebar">
          <img src="/sanghamitra logo.jpeg" alt="Sanghamitra Logo" style={{ width: '80px', height: 'auto', display: 'block', margin: '0 auto' }} />

          <button onClick={() => navigate('/')}>📊 Home</button>
          <button onClick={() => navigate('/bill')}>🧾 Bill</button>
          <button onClick={() => navigate('/view')}>👁️ ViewBills</button>
          <button onClick={() => navigate('/analytics')}>📈 Analytics</button>
          <button onClick={() => navigate('/products')}>📦 Product Management</button>
          <button onClick={() => navigate('/dashboard')}>🛡️Admin Dashboard</button>
          <button onClick={() => navigate('/admin-login')}>🔐 Login</button>
        </aside>

      <main className="main-content">
        <header className="header">
          <h1>Sanghamitra Business Incubator</h1>
        </header>
      </main>
    </div>
  );
};

export default Home;
