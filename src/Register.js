import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await register(username, email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  const displayError = localError || error;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #5b21b6, #4c1d95, #1e3a8a)',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '96px',
            height: '96px',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            animation: 'scaleIn 0.4s ease-out 0.2s backwards',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)'
          }}>
            <span style={{ fontSize: '48px' }}>🎵</span>
          </div>
          <h1 style={{
            color: 'white',
            fontSize: '40px',
            fontWeight: '600',
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px'
          }}>
            Create Account
          </h1>
          <p style={{
            color: '#c4b5fd',
            fontSize: '18px',
            margin: 0,
            fontWeight: '400'
          }}>
            Join the Sound Scape Experience
          </p>
        </div>

        {/* Register Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '48px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeIn 0.6s ease-out 0.3s backwards'
        }}>
          <form onSubmit={handleSubmit}>
            {displayError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#fca5a5',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '28px',
                fontSize: '14px'
              }}>
                {displayError}
              </div>
            )}

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '10px',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                placeholder="Choose a username"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.border = '2px solid rgba(168, 85, 247, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '10px',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.border = '2px solid rgba(168, 85, 247, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '10px',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.border = '2px solid rgba(168, 85, 247, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                }}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '10px',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.border = '2px solid rgba(168, 85, 247, 0.8)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.border = '2px solid rgba(255, 255, 255, 0.3)';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading ? 'rgba(168, 85, 247, 0.5)' : 'linear-gradient(to right, #a855f7, #ec4899)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '17px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 16px rgba(168, 85, 247, 0.5)',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(168, 85, 247, 0.5)';
              }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          color: 'white',
          fontSize: '15px'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: '#a855f7',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Sign in
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        input::placeholder {
          color: #c4b5fd;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}

export default Register;
