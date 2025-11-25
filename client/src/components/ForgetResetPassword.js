// components/ForgetResetPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';

export const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email verification, 2: reset password
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('https://bills-weld.vercel.app/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setMessage(data.message);
        setTimeout(() => {
          setStep(2);
          setMessage('');
        }, 1500);
      } else {
        setError(data.message || 'Email verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('https://bills-weld.vercel.app/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
            <KeyRound size={40} color="#667eea" />
          </div>
          <h2 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>Reset Password</h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            margin: 0
          }}>
            {step === 1 ? 'Enter your email to verify' : 'Create your new password'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px 30px',
          gap: '10px'
        }}>
          <div style={{
            flex: 1,
            height: '4px',
            background: step >= 1 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
            borderRadius: '2px',
            transition: 'all 0.3s'
          }} />
          <div style={{
            flex: 1,
            height: '4px',
            background: step >= 2 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
            borderRadius: '2px',
            transition: 'all 0.3s'
          }} />
        </div>

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail} style={{ padding: '20px 30px 40px' }}>
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

            {message && (
              <div style={{
                padding: '12px',
                background: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                marginBottom: '20px',
                color: '#065f46',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={18} />
                {message}
              </div>
            )}

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
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                marginBottom: '16px'
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Remember your password?{' '}
              <span
                onClick={() => navigate('/')}
                style={{
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Sign In
              </span>
            </div>
          </form>
        )}

        {/* Step 2: Reset Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ padding: '20px 30px 40px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600'
              }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {message && (
              <div style={{
                padding: '12px',
                background: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                marginBottom: '20px',
                color: '#065f46',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={18} />
                {message}
              </div>
            )}

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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const ResetPassword = () => {
  return <ForgetPassword />;
};
