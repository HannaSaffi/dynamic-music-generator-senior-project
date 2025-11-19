import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

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
            SoundScape AI
          </h1>
          <p style={{
            color: '#c4b5fd',
            fontSize: '18px',
            margin: 0,
            fontWeight: '400'
          }}>
            Dynamic Music for Your Moments
          </p>
        </div>

        {/* Login Card */}
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
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                color: '#fca5a5',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '28px',
                fontSize: '14px'
              }}>
                {error}
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

            <div style={{ marginBottom: '32px' }}>
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
              {isLoading ? 'Logging in...' : 'Start Listening'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link to="/forgot-password" style={{
                color: '#c4b5fd',
                textDecoration: 'none',
                fontSize: '15px',
                transition: 'color 0.3s'
              }}>
                Forgot password?
              </Link>
            </div>
          </form>
        </div>

        {/* Features */}
        <div style={{
          marginTop: '48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          animation: 'fadeIn 0.6s ease-out 0.5s backwards'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🎤</span>
            <span style={{ 
              color: '#c4b5fd', 
              fontSize: '14px', 
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Real-time Listening
            </span>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🌊</span>
            <span style={{ 
              color: '#c4b5fd', 
              fontSize: '14px', 
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              AI Generation
            </span>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🎭</span>
            <span style={{ 
              color: '#c4b5fd', 
              fontSize: '14px', 
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Smart Moods
            </span>
          </div>
        </div>

        {/* Sign up link */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          color: 'white',
          fontSize: '15px'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: '#a855f7',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Sign up
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

export default Login;
