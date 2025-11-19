import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { VoiceTranscriberWithSentiment } from './components/VoiceTranscriber';
import { AudioVisualizer } from './components/AudioVisualizer';

function Dashboard() {
  const { user, logout } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentMood, setCurrentMood] = useState('calm');

  const moods = [
    { id: 'joy', label: 'Happy', emoji: '😊', color: '#10b981' },
    { id: 'calm', label: 'Calm', emoji: '🌙', color: '#3b82f6' },
    { id: 'anger', label: 'Energetic', emoji: '⚡', color: '#f59e0b' },
    { id: 'sadness', label: 'Romantic', emoji: '💖', color: '#ec4899' },
    { id: 'fear', label: 'Focused', emoji: '🧠', color: '#8b5cf6' },
    { id: 'surprise', label: 'Ambient', emoji: '✨', color: '#6366f1' },
  ];

  const musicTracks = {
    joy: { title: 'Sunshine Boulevard', artist: 'AI Composer', genre: 'Pop' },
    calm: { title: 'Peaceful Waters', artist: 'AI Composer', genre: 'Ambient' },
    anger: { title: 'Electric Pulse', artist: 'AI Composer', genre: 'Electronic' },
    sadness: { title: 'Moonlight Serenade', artist: 'AI Composer', genre: 'Jazz' },
    fear: { title: 'Deep Concentration', artist: 'AI Composer', genre: 'Lo-Fi' },
    surprise: { title: 'Cosmic Dreams', artist: 'AI Composer', genre: 'Ambient' },
  };

  const currentTrack = musicTracks[currentMood] || musicTracks.calm;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #5b21b6, #4c1d95, #1e3a8a)',
      padding: '32px 16px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {user?.username?.substring(0, 2).toUpperCase() || 'SA'}
            </div>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '600' }}>
                Welcome back
              </h2>
              <p style={{ color: '#c4b5fd', margin: 0, fontSize: '16px' }}>
                Ready to create your soundtrack
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px'
        }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Listening Status Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '50%',
                    background: isListening ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)'
                  }}>
                    <span style={{ fontSize: '24px' }}>
                      {isListening ? '🎤' : '🔇'}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '18px' }}>
                      {isListening ? 'Listening to your environment' : 'Listening paused'}
                    </h3>
                    <p style={{ color: '#c4b5fd', margin: 0, fontSize: '14px' }}>
                      {isListening ? 'Analyzing conversation and generating music...' : 'Click to resume'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsListening(!isListening);
                    if (!isListening) setIsPlaying(true);
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isListening ? '#fca5a5' : '#6ee7b7',
                    transition: 'all 0.3s'
                  }}
                >
                  {isListening ? 'Stop' : 'Start'}
                </button>
              </div>

              {/* Audio Visualizer */}
              <AudioVisualizer isActive={isListening && isPlaying} />
            </div>

            {/* Now Playing */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px'
                  }}>
                    🎵
                  </div>
                  {isPlaying && (
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '16px',
                      height: '16px',
                      background: '#10b981',
                      borderRadius: '50%',
                      border: '2px solid white',
                      animation: 'pulse 1s infinite'
                    }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '18px' }}>
                    {currentTrack.title}
                  </h3>
                  <p style={{ color: '#c4b5fd', margin: '0 0 8px 0', fontSize: '14px' }}>
                    {currentTrack.artist}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#c4b5fd',
                    fontSize: '12px'
                  }}>
                    {currentTrack.genre}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: '#c4b5fd', margin: '0 0 4px 0', fontSize: '14px' }}>
                    Now Playing
                  </p>
                  <p style={{ color: 'white', margin: 0, fontSize: '14px' }}>
                    Generated in real-time
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginTop: '24px' }}>
                <div style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: isPlaying ? '60%' : '0%',
                    background: 'linear-gradient(to right, #a855f7, #ec4899)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            </div>

            {/* Playback Control */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                      cursor: 'pointer',
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <div>
                    <p style={{ color: 'white', margin: '0 0 4px 0', fontSize: '16px' }}>
                      Playback Control
                    </p>
                    <p style={{ color: '#c4b5fd', margin: 0, fontSize: '14px' }}>
                      {isPlaying ? 'Music is playing' : 'Music paused'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    style={{
                      width: '128px',
                      accentColor: '#a855f7'
                    }}
                  />
                  <span style={{ color: 'white', width: '48px', fontSize: '14px' }}>
                    {volume}%
                  </span>
                </div>
              </div>
            </div>

            {/* Transcription & Sentiment */}
            <VoiceTranscriberWithSentiment />
          </div>

          {/* Right Column - Mood Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{
                color: 'white',
                margin: '0 0 24px 0',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                Music Mood
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setCurrentMood(mood.id)}
                    style={{
                      position: 'relative',
                      padding: '20px',
                      background: currentMood === mood.id 
                        ? 'rgba(255, 255, 255, 0.2)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: currentMood === mood.id 
                        ? '2px solid rgba(168, 85, 247, 0.8)' 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'center'
                    }}
                  >
                    {currentMood === mood.id && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        background: '#a855f7',
                        borderRadius: '50%'
                      }} />
                    )}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: mood.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: '24px'
                    }}>
                      {mood.emoji}
                    </div>
                    <p style={{
                      color: 'white',
                      margin: 0,
                      fontSize: '15px',
                      fontWeight: '500'
                    }}>
                      {mood.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Settings */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '20px' }}>⚙️</span>
                <h3 style={{
                  color: 'white',
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Quick Settings
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Auto-adapt to mood', checked: true },
                  { label: 'Voice detection', checked: true },
                  { label: 'Ambient mode', checked: false }
                ].map((setting, index) => (
                  <label key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <span style={{ color: '#c4b5fd', fontSize: '14px' }}>
                      {setting.label}
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={setting.checked}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: '#a855f7',
                        cursor: 'pointer'
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
