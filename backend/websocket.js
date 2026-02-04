const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const axios = require('axios');

module.exports = function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    try {
      const token = new URL(`http://localhost${req.url}`).searchParams.get('token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;
      console.log(`✅ Client connected: ${ws.userId}`);
    } catch (err) {
      ws.close();
      return;
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'generate-music') {
          const { emotion, confidence } = data;
          console.log(`📤 Received: emotion=${emotion}, confidence=${confidence}`);

          // Call Flask API
          const flaskResponse = await axios.post(
            process.env.FLASK_API_URL || 'http://localhost:5000/generate-music',
            {
              emotion,
              intensity: confidence,
              tempo: getTempoForEmotion(emotion),
              key: getKeyForEmotion(emotion),
              energy: getEnergyForEmotion(emotion)
            },
            { timeout: 30000 }
          );

          // Send back to client
          ws.send(JSON.stringify({
            success: true,
            audio: flaskResponse.data.audio,
            emotion,
            musicParams: flaskResponse.data.musicParams
          }));
        }
      } catch (err) {
        console.error('WebSocket error:', err.message);
        ws.send(JSON.stringify({
          error: err.message
        }));
      }
    });

    ws.on('close', () => {
      console.log(`❌ Client disconnected: ${ws.userId}`);
    });
  });
};

function getTempoForEmotion(emotion) {
  const tempos = {
    joy: 'fast',
    sadness: 'slow',
    anger: 'fast',
    fear: 'moderate',
    surprise: 'moderate',
    disgust: 'slow'
  };
  return tempos[emotion] || 'moderate';
}

function getKeyForEmotion(emotion) {
  const keys = {
    joy: 'major',
    sadness: 'minor',
    anger: 'minor',
    fear: 'minor',
    surprise: 'major',
    disgust: 'minor'
  };
  return keys[emotion] || 'major';
}

function getEnergyForEmotion(emotion) {
  const energy = {
    joy: 'high',
    sadness: 'low',
    anger: 'very-high',
    fear: 'medium',
    surprise: 'medium-high',
    disgust: 'low-medium'
  };
  return energy[emotion] || 'medium';
}
