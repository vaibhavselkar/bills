// components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);

        if (data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <LogIn size={40} color="#667eea" />
          </div>
          <h2 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>Welcome Back To Sanghamitra Billing</h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            margin: 0
          }}>Sign in to continue to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ padding: '40px 30px' }}>
          {/* Email Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600'
            }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600'
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 44px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#9ca3af'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={{
            textAlign: 'right',
            marginBottom: '24px'
          }}>
            <Link to="/forgot-password" style={{
              color: '#667eea',
              fontSize: '14px',
              textDecoration: 'none',
              fontWeight: '600'
            }}>Forgot Password?</Link>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Register Link */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '600'
            }}>Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;