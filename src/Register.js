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
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: 'scaleIn 0.4s ease-out 0.2s backwards'
          }}>
            <span style={{ fontSize: '40px' }}>🎵</span>
          </div>
          <h1 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: '600',
            margin: '0 0 10px 0'
          }}>
            Create Account
          </h1>
          <p style={{
            color: '#c4b5fd',
            fontSize: '16px',
            margin: 0
          }}>
            Join the D&D Music Experience
          </p>
        </div>

        {/* Register Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
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
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {displayError}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '8px',
                fontSize: '14px',
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
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '8px',
                fontSize: '14px',
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
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#e9d5ff',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your password"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? 'rgba(168, 85, 247, 0.5)' : 'linear-gradient(to right, #a855f7, #ec4899)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)'
              }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          color: 'white'
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
