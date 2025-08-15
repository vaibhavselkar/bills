import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('http://localhost:8080/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        navigate('/');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px',
        margin: 'auto',
        padding: '30px',
        boxShadow: '0px 0px 10px #ccc',
        borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" type="text" onChange={handleChange} required />

        <label>Email</label>
        <input name="email" type="email" onChange={handleChange} required />

        <label>Password</label>
        <input name="password" type="password" onChange={handleChange} required />

        <button type="submit" style={{ backgroundColor: '#673199', display: 'block',
         margin: '20px auto' }}>Register</button>
        <p>{message} </p>
        <p style={{ textAlign: 'center' }}>Already have an account?{' '}
          <span onClick={() => navigate('/')} style={{ color: 'blue', cursor: 'pointer' }}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
