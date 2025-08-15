// src/pages/UserLogin.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
//import '../styles/UserLogin.css';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://billing-app-server.vercel.app/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token); // Save JWT
        navigate('/user-dashboard'); // Redirect after login
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="login-container"style={{ maxWidth: '400px',
        margin: 'auto',
        padding: '30px',
        boxShadow: '0px 0px 10px #ccc',
        borderRadius: '8px' }} >
      <h2 style={{ textAlign: 'center' }}>User Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            display: 'block',
            width: '100%',
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            display: 'block',
            width: '100%',
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />

        <button type="submit" style={{
                backgroundColor: '#673199',
                display: 'block',
                margin: '20px auto',
                width: '95px',
                borderRadius: '5px'
        }}>Login</button>

        {error && <p className="error" style={{ color: 'red'}}>{error}</p>}
      </form>

      <div className="login-links">
        <p style={{ textAlign: 'center' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <p style={{ textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
        
      </div>
    </div>
  );
};

export default UserLogin;
