import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { VoiceTranscriberDisplay } from './components/VoiceTranscriber';
import { AudioVisualizer } from './components/AudioVisualizer';
import { useSentimentWithTranscription } from './useSentimentAnalysis';
import { audioService } from './AudioService';

const themeMap = {
  casual: {
    background: 'linear-gradient(to bottom right, #5b21b6, #4c1d95, #1e3a8a)',
    accent: '#a855f7',
    accentSecondary: '#ec4899',
    subtextColor: '#c4b5fd',
    accentRgb: '168, 85, 247',
    waveColors: ['#a855f7', '#ec4899'],
  },
  meditation: {
    background: 'linear-gradient(to bottom right, #4a7c59, #3a6b49, #2d5a3a)',
    accent: '#9DC183',
    accentSecondary: '#5f9ea0',
    subtextColor: '#b8d8ba',
    accentRgb: '157, 193, 131',
    waveColors: ['#48C9B0', '#5DADE2'],
  },
  therapy: {
    background: 'linear-gradient(to bottom right, #7b68a8, #6a5a96, #5a4d82)',
    accent: '#B4A7D6',
    accentSecondary: '#9DC183',
    subtextColor: '#d0c4e8',
    accentRgb: '180, 167, 214',
    waveColors: ['#A569BD', '#D2B4DE'],
  },
  boardgames: {
    background: 'linear-gradient(to bottom right, #b8860b, #a0750a, #8b6508)',
    accent: '#FFB347',
    accentSecondary: '#FF8C00',
    subtextColor: '#ffe0a6',
    accentRgb: '255, 179, 71',
    waveColors: ['#F5B041', '#F39C12'],
  },
  dnd: {
    background: 'linear-gradient(to bottom right, #8B0000, #6b0000, #4a0000)',
    accent: '#FFD700',
    accentSecondary: '#B22222',
    subtextColor: '#ffecb3',
    accentRgb: '255, 215, 0',
    waveColors: ['#F4D03F', '#F39C12'],
  },
};

const contextModes = [
  { id: 'casual', label: 'Casual Conversation', emoji: '💬' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'therapy', label: 'Therapy', emoji: '🩺' },
  { id: 'boardgames', label: 'Board Games', emoji: '🎲' },
  { id: 'dnd', label: 'D&D Adventure', emoji: '🐉' },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [currentMood, setCurrentMood] = useState(null);
  const [selectedMode, setSelectedMode] = useState('casual');

  const theme = themeMap[selectedMode];

  // Transcription state
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  // Sentiment analysis
  const sentiment = useSentimentWithTranscription(transcript + interimTranscript);

  // Connect sentiment to audio playback using recent emotion history (not cumulative stats)
  useEffect(() => {
    const history = sentiment.sentimentState?.history;
    if (!history || history.length === 0 || !sentiment.isInitialized || !isListening) return;

    // Use last 3 results to determine dominant emotion (responsive to changes)
    const recentHistory = history.slice(-3);
    const recentCounts = {};
    for (const entry of recentHistory) {
      recentCounts[entry.emotion] = (recentCounts[entry.emotion] || 0) + 1;
    }

    let dominantEmotion = 'joy';
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(recentCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    console.log('🎯 Dominant emotion (recent):', dominantEmotion, '(count:', maxCount, '/ last', recentHistory.length, ')');
    if (dominantEmotion !== currentMood) {
      console.log('🎵 Switching audio to dominant emotion:', dominantEmotion);
      audioService.playForEmotion(dominantEmotion);
      setCurrentMood(dominantEmotion);
    }
    if (!isPlaying) {
      setIsPlaying(true);
    }
  }, [
    sentiment.sentimentState?.history,
    sentiment.sentimentState?.statistics?.totalAnalyzed,
    sentiment.isInitialized,
    isListening,
    currentMood,
  ]);

  // Sync volume with audioService
  useEffect(() => {
    audioService.setVolume(volume);
  }, [volume]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioService.stop();
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript(prev => prev + final);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      if (shouldListenRef.current) {
        console.log('🔄 Auto-restarting voice recognition...');
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      shouldListenRef.current = true;
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      shouldListenRef.current = false;
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
      setIsPlaying(false);
    } else {
      // If no track playing, start with current mood
      if (!audioService.currentEmotion) {
        audioService.playForEmotion(currentMood);
      } else {
        audioService.play();
      }
      setIsPlaying(true);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const value = Number(e.target.value);
    setVolume(value);
    audioService.setVolume(value);
  };

  const musicTracks = {
    joy: { title: 'Happy Vibes', artist: 'Pre-saved Track', genre: 'Upbeat' },
    sadness: { title: 'Melancholy', artist: 'Pre-saved Track', genre: 'Slow' },
    anger: { title: 'Intense Energy', artist: 'Pre-saved Track', genre: 'Electronic' },
    fear: { title: 'Suspense', artist: 'Pre-saved Track', genre: 'Dark Ambient' },
    surprise: { title: 'Wonder', artist: 'Pre-saved Track', genre: 'Cinematic' },
    disgust: { title: 'Unsettling', artist: 'Pre-saved Track', genre: 'Eerie' },
  };

  const currentTrack = musicTracks[currentMood] || musicTracks.joy;

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.background,
      padding: '32px 16px',
      transition: 'background 0.6s ease'
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
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              transition: 'background 0.6s ease'
            }}>
              {user?.username?.substring(0, 2).toUpperCase() || 'SA'}
            </div>
            <div>
              <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '600' }}>
                Welcome back
              </h2>
              <p style={{ color: theme.subtextColor, margin: 0, fontSize: '16px', transition: 'color 0.6s ease' }}>
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
            Logout
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
                    <p style={{ color: theme.subtextColor, margin: 0, fontSize: '14px', transition: 'color 0.6s ease' }}>
                      {isListening ? 'Analyzing conversation and generating music...' : 'Click to resume'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                      audioService.pause();
                      setIsPlaying(false);
                    } else {
                      startListening();
                      audioService.playIntro();
                      setIsPlaying(true);
                    }
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
              <AudioVisualizer isActive={isListening && isPlaying} waveColors={theme.waveColors} />
            </div>

            {/* Now Playing */}
            <div style={{
              background: `linear-gradient(135deg, rgba(${theme.accentRgb}, 0.2), rgba(${theme.accentRgb}, 0.1))`,
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'background 0.6s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    transition: 'background 0.6s ease'
                  }}>
                    {"🎵"}
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
                  <p style={{ color: theme.subtextColor, margin: '0 0 8px 0', fontSize: '14px', transition: 'color 0.6s ease' }}>
                    {currentTrack.artist} {currentMood ? `\u2022 Emotion: ${currentMood}` : ''}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: theme.subtextColor,
                    fontSize: '12px',
                    transition: 'color 0.6s ease'
                  }}>
                    {currentTrack.genre}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: theme.subtextColor, margin: '0 0 4px 0', fontSize: '14px', transition: 'color 0.6s ease' }}>
                    {isPlaying ? 'Now Playing' : 'Paused'}
                  </p>
                  <p style={{ color: 'white', margin: 0, fontSize: '14px' }}>
                    {currentMood ? `Detected: ${currentMood}` : 'Waiting for speech...'}
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
                    background: `linear-gradient(to right, ${theme.accent}, ${theme.accentSecondary})`,
                    transition: 'width 0.3s, background 0.6s ease'
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
                    onClick={handlePlayPause}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      border: 'none',
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})`,
                      cursor: 'pointer',
                      fontSize: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px rgba(${theme.accentRgb}, 0.4)`,
                      transition: 'transform 0.2s, background 0.6s ease'
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
                    <p style={{ color: theme.subtextColor, margin: 0, fontSize: '14px', transition: 'color 0.6s ease' }}>
                      {isPlaying ? 'Music is playing' : 'Music paused'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{"🔊"}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{
                      width: '128px',
                      accentColor: theme.accent
                    }}
                  />
                  <span style={{ color: 'white', width: '48px', fontSize: '14px' }}>
                    {volume}%
                  </span>
                </div>
              </div>
            </div>

            {/* Transcription & Sentiment Display */}
            <VoiceTranscriberDisplay
              transcript={transcript}
              interimTranscript={interimTranscript}
              sentiment={sentiment}
              onClear={clearTranscript}
            />
          </div>

          {/* Right Column - Context Mode & Emotion Detection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Context Mode Selector */}
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
                Context Mode
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {contextModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      audioService.setMode(mode.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 18px',
                      background: selectedMode === mode.id
                        ? `rgba(${theme.accentRgb}, 0.3)`
                        : 'rgba(255, 255, 255, 0.05)',
                      border: selectedMode === mode.id
                        ? `2px solid ${theme.accent}`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{mode.emoji}</span>
                    <span style={{
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: selectedMode === mode.id ? '600' : '400'
                    }}>
                      {mode.label}
                    </span>
                    {selectedMode === mode.id && (
                      <div style={{
                        marginLeft: 'auto',
                        width: '10px',
                        height: '10px',
                        background: theme.accent,
                        borderRadius: '50%',
                        boxShadow: `0 0 8px ${theme.accent}`,
                        transition: 'background 0.6s ease'
                      }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Detected Emotion Display */}
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
                <span style={{ fontSize: '20px' }}>{"🎭"}</span>
                <h3 style={{
                  color: 'white',
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  Emotion Detection
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: theme.subtextColor, fontSize: '14px', transition: 'color 0.6s ease' }}>Current Emotion</span>
                  <span style={{
                    color: 'white',
                    fontSize: '14px',
                    padding: '4px 12px',
                    background: `rgba(${theme.accentRgb}, 0.3)`,
                    borderRadius: '8px',
                    transition: 'background 0.6s ease'
                  }}>
                    {currentMood || 'None'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: theme.subtextColor, fontSize: '14px', transition: 'color 0.6s ease' }}>Confidence</span>
                  <span style={{ color: 'white', fontSize: '14px' }}>
                    {(() => {
                      const stats = sentiment.sentimentState?.statistics;
                      if (!stats || stats.totalAnalyzed === 0 || !currentMood) return '-';
                      const count = stats[`${currentMood}Count`] || 0;
                      return `${((count / stats.totalAnalyzed) * 100).toFixed(0)}%`;
                    })()}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: theme.subtextColor, fontSize: '14px', transition: 'color 0.6s ease' }}>Trend</span>
                  <span style={{ color: 'white', fontSize: '14px' }}>
                    {sentiment.musicData?.trend || 'stable'}
                  </span>
                </div>
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
                    <span style={{ color: theme.subtextColor, fontSize: '14px', transition: 'color 0.6s ease' }}>
                      {setting.label}
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked={setting.checked}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: theme.accent,
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
