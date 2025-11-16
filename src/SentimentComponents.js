import React from 'react';

/**
 * Emotion Dashboard Component
 * Displays 6 primary emotions with emotion wheel styling
 */
export function SentimentDashboard({
  sentimentState,
  currentSentiment,
  sentimentScore,
  trend,
  isInitialized,
  isAnalyzing,
  error,
}) {
  // Get emotion from state
  const currentEmotion = sentimentState?.current?.emotion || currentSentiment;
  const emotionScore = sentimentState?.current?.score || sentimentScore;
  const displayTrend = trend || 'stable';
  const stats = sentimentState?.statistics;

  // Emotion configuration matching the wheel
  const emotionConfig = {
    joy: { 
      emoji: '😊', 
      color: '#FFD700', 
      label: 'Joy',
      bgColor: '#FFF8DC'
    },
    sadness: { 
      emoji: '😢', 
      color: '#4A90E2', 
      label: 'Sadness',
      bgColor: '#E3F2FD'
    },
    anger: { 
      emoji: '😠', 
      color: '#E74C3C', 
      label: 'Anger',
      bgColor: '#FFEBEE'
    },
    fear: { 
      emoji: '😱', 
      color: '#9B59B6', 
      label: 'Fear',
      bgColor: '#F3E5F5'
    },
    surprise: { 
      emoji: '😮', 
      color: '#F39C12', 
      label: 'Surprise',
      bgColor: '#FFF3E0'
    },
    disgust: { 
      emoji: '🤢', 
      color: '#27AE60', 
      label: 'Disgust',
      bgColor: '#E8F5E9'
    },
  };

  if (error) {
    return (
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#fee',
        borderRadius: '8px',
        color: '#c00',
        border: '2px solid #fcc'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          ⚠️ Emotion Analysis Error
        </div>
        <div style={{ fontSize: '14px' }}>
          {error.message || error}
        </div>
      </div>
    );
  }

  if (isInitialized === false) {
    return (
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        textAlign: 'center',
        border: '2px solid #bfdbfe'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎭</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Loading Emotion Detection Model...
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Detecting: Joy, Sadness, Anger, Fear, Surprise, Disgust
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        textAlign: 'center',
        border: '2px solid #d1d5db'
      }}>
        <div style={{ marginBottom: '10px' }}>🔄 Analyzing emotions...</div>
      </div>
    );
  }

  if (!currentEmotion) {
    return (
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666',
        border: '2px dashed #d1d5db'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎤</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Speak to detect emotions...
        </div>
        <div style={{ fontSize: '14px' }}>
          Your speech will be analyzed for 6 primary emotions
        </div>
      </div>
    );
  }

  const config = emotionConfig[currentEmotion] || emotionConfig.joy;

  const getTrendEmoji = () => {
    if (displayTrend === 'improving') return '📈';
    if (displayTrend === 'declining') return '📉';
    return '➡️';
  };

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: `3px solid ${config.color}`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
        Emotion Analysis
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 'normal',
          marginLeft: '10px',
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          🎭 6 Emotions
        </span>
      </h2>

      {/* Current Emotion Display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: config.bgColor,
        borderRadius: '8px'
      }}>
        <span style={{ fontSize: '64px' }}>{config.emoji}</span>
        <div>
          <div style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: config.color,
            textTransform: 'uppercase'
          }}>
            {config.label}
          </div>
          {emotionScore !== null && emotionScore !== undefined && (
            <div style={{ fontSize: '16px', color: '#6b7280' }}>
              Confidence: {(emotionScore * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Trend Display */}
      <div style={{
        padding: '12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        <span style={{ fontSize: '20px', marginRight: '8px' }}>
          {getTrendEmoji()}
        </span>
        <span style={{ fontWeight: 'bold' }}>Emotional Trend: </span>
        <span style={{ textTransform: 'capitalize' }}>{displayTrend}</span>
      </div>

      {/* Emotion Distribution */}
      {stats && stats.totalAnalyzed > 0 && (
        <div style={{
          padding: '15px',
          backgroundColor: '#fefce8',
          borderRadius: '8px',
          border: '1px solid #fde047'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '15px',
            color: '#854d0e',
            textAlign: 'center'
          }}>
            🎭 Emotion Breakdown
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            fontSize: '14px'
          }}>
            {Object.entries(emotionConfig).map(([emotion, conf]) => {
              const count = stats[`${emotion}Count`] || 0;
              const percentage = stats.totalAnalyzed > 0 
                ? ((count / stats.totalAnalyzed) * 100).toFixed(0)
                : 0;
              
              return (
                <div key={emotion} style={{
                  padding: '8px',
                  backgroundColor: conf.bgColor,
                  borderRadius: '6px',
                  border: `2px solid ${conf.color}`
                }}>
                  <span style={{ fontSize: '20px', marginRight: '6px' }}>
                    {conf.emoji}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>{conf.label}: </span>
                  <span>{count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: '12px',
            textAlign: 'center',
            padding: '8px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}>
            Total Analyzed: {stats.totalAnalyzed}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Emotion Badge - Compact display
 */
export function SentimentBadge({ 
  sentiment, 
  currentSentiment,
  sentimentState
}) {
  const emotion = sentimentState?.current?.emotion || currentSentiment || sentiment;
  const score = sentimentState?.current?.score;

  if (!emotion) return null;

  const emotionConfig = {
    joy: { emoji: '😊', color: '#FFD700', bg: '#FFF8DC' },
    sadness: { emoji: '😢', color: '#4A90E2', bg: '#E3F2FD' },
    anger: { emoji: '😠', color: '#E74C3C', bg: '#FFEBEE' },
    fear: { emoji: '😱', color: '#9B59B6', bg: '#F3E5F5' },
    surprise: { emoji: '😮', color: '#F39C12', bg: '#FFF3E0' },
    disgust: { emoji: '🤢', color: '#27AE60', bg: '#E8F5E9' },
  };

  const config = emotionConfig[emotion] || emotionConfig.joy;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      backgroundColor: config.bg,
      border: `2px solid ${config.color}`,
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '600',
      color: config.color
    }}>
      <span style={{ fontSize: '18px' }}>{config.emoji}</span>
      <span style={{ textTransform: 'capitalize' }}>{emotion}</span>
      {score && (
        <span style={{ fontSize: '12px', opacity: 0.8 }}>
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </span>
  );
}

/**
 * Emotion Indicator - Larger version
 */
export function SentimentIndicator({
  sentiment,
  currentSentiment,
  sentimentState,
  trend,
  size = 'medium'
}) {
  const emotion = sentimentState?.current?.emotion || currentSentiment || sentiment;
  const score = sentimentState?.current?.score;

  if (!emotion) return null;

  const sizes = {
    small: { font: '16px', emoji: '32px', padding: '8px 12px' },
    medium: { font: '20px', emoji: '48px', padding: '12px 16px' },
    large: { font: '24px', emoji: '64px', padding: '16px 24px' }
  };

  const currentSize = sizes[size];

  const emotionConfig = {
    joy: { emoji: '😊', color: '#FFD700', label: 'Joy' },
    sadness: { emoji: '😢', color: '#4A90E2', label: 'Sadness' },
    anger: { emoji: '😠', color: '#E74C3C', label: 'Anger' },
    fear: { emoji: '😱', color: '#9B59B6', label: 'Fear' },
    surprise: { emoji: '😮', color: '#F39C12', label: 'Surprise' },
    disgust: { emoji: '🤢', color: '#27AE60', label: 'Disgust' },
  };

  const config = emotionConfig[emotion] || emotionConfig.joy;

  const getTrendIcon = () => {
    if (trend === 'improving') return '↗️';
    if (trend === 'declining') return '↘️';
    return '→';
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: currentSize.padding,
      backgroundColor: `${config.color}20`,
      border: `3px solid ${config.color}`,
      borderRadius: '12px',
      color: config.color
    }}>
      <span style={{ fontSize: currentSize.emoji }}>{config.emoji}</span>
      <div>
        <div style={{ 
          fontSize: currentSize.font, 
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {config.label}
        </div>
        {score && (
          <div style={{ fontSize: '14px', opacity: 0.8 }}>
            {(score * 100).toFixed(1)}%
          </div>
        )}
      </div>
      {trend && trend !== 'stable' && (
        <span style={{ fontSize: currentSize.emoji }}>{getTrendIcon()}</span>
      )}
    </div>
  );
}

export default SentimentDashboard;
