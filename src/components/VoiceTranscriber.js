import { useState, useEffect, useRef } from 'react';
import { SentimentDashboard } from '../SentimentComponents';

/**
 * Display-only component for transcription and sentiment analysis
 * All recording logic is now in Dashboard.js
 */
export function VoiceTranscriberDisplay({ transcript, interimTranscript, sentiment, onClear }) {
  // Send sentiment to backend when it changes significantly
  const [generatedMusic, setGeneratedMusic] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [musicError, setMusicError] = useState(null);
  const [lastSentimentSent, setLastSentimentSent] = useState(null);
  const lastSendTimeRef = useRef(0);

  // Send sentiment to backend API when it changes significantly
  useEffect(() => {
    if (!sentiment.sentimentState?.current) return;

    const now = Date.now();
    const emotionChanged = lastSentimentSent?.emotion !== sentiment.sentimentState.current.emotion;
    const timeElapsed = now - lastSendTimeRef.current > 2000; // Throttle to 2 seconds

    if (emotionChanged || timeElapsed) {
      sendMusicGenerationRequest(
        sentiment.sentimentState.current.emotion,
        sentiment.sentimentState.current.score
      );

      setLastSentimentSent(sentiment.sentimentState.current);
      lastSendTimeRef.current = now;
    }
  }, [sentiment.sentimentState]);

  // Send request to backend API
  const sendMusicGenerationRequest = async (emotion, confidence) => {
    setIsGenerating(true);
    setMusicError(null);

    try {
      const token = localStorage.getItem('token');
      
      console.log('📤 Sending to backend:', { emotion, confidence });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/generate/music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          emotion,
          confidence
        })
      });

      const data = await response.json();

      if (data.success && data.audio) {
        console.log('🎵 Music generated:', data.emotion);
        setGeneratedMusic({
          audio: data.audio,
          emotion: data.emotion,
          musicParams: data.musicParams,
          timestamp: Date.now()
        });
        setMusicError(null);
      } else {
        console.error('Generation error:', data.error);
        setMusicError(data.error || 'Failed to generate music');
      }
    } catch (err) {
      console.error('API Error:', err);
      setMusicError(err.message || 'Connection error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play generated music
  const playGeneratedMusic = () => {
    if (!generatedMusic?.audio) return;

    try {
      const audioArray = Uint8Array.from(atob(generatedMusic.audio), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioArray], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Playback error:', err));
    } catch (err) {
      console.error('Error playing audio:', err);
      setMusicError('Failed to play audio');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '20px' }}>Voice Transcription & Analysis</h2>
      
      {/* Transcript Display */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '20px',
        minHeight: '100px'
      }}>
        <h3>Transcript:</h3>
        <p style={{ margin: '10px 0', fontSize: '16px' }}>
          {transcript}
          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>{interimTranscript}</span>
        </p>
      </div>

      {/* Sentiment Analysis Dashboard */}
      <SentimentDashboard {...sentiment} />

      {/* Music Generation Status */}
      {isGenerating && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          border: '2px solid #3b82f6',
          color: '#1e40af'
        }}>
          <p style={{ margin: 0 }}>🎵 Generating music for <strong>{sentiment.sentimentState?.current?.emotion}</strong>...</p>
        </div>
      )}

      {musicError && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          border: '2px solid #ef4444',
          color: '#991b1b'
        }}>
          <p style={{ margin: 0 }}>❌ {musicError}</p>
        </div>
      )}

      {generatedMusic && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          border: '2px solid #22c55e'
        }}>
          <p style={{ margin: '0 0 12px 0', color: '#166534' }}>
            ✅ Music generated for <strong>{generatedMusic.emotion}</strong>
          </p>
          <button
            onClick={playGeneratedMusic}
            style={{
              padding: '10px 16px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🎧 Play Music
          </button>
        </div>
      )}

      {/* Data being sent (for debugging) */}
      {sentiment.sentimentState?.current && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0f4f8',
          borderRadius: '8px',
          border: '2px solid #3b82f6',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>📊 Current Data:</strong>
          <pre style={{ margin: '8px 0 0 0', backgroundColor: '#1f2937', color: '#10b981', padding: '8px', borderRadius: '4px', overflow: 'auto' }}>
{JSON.stringify({
  emotion: sentiment.sentimentState.current.emotion,
  confidence: sentiment.sentimentState.current.score,
  matchedKeywords: sentiment.sentimentState.current.matchedKeywords
}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
