const express = require('express');
const axios = require('axios');
const Song = require('../models/Song');

const router = express.Router();

/**
 * POST /api/generate/music
 * Frontend sends emotion → generates music via Python server
 * NO AUTHENTICATION REQUIRED (for testing)
 */
router.post('/music', async (req, res) => {
  try {
    const { emotion, confidence } = req.body;

    console.log('📤 Backend received:', { emotion, confidence });

    if (!emotion) {
      return res.status(400).json({
        success: false,
        error: 'Emotion is required'
      });
    }

    const musicParams = getMusicParams(emotion, confidence || 0.7);

    console.log('🎵 Calling Python server at:', process.env.FLASK_API_URL);

    let audioData = null;
    let generationError = null;

    try {
      // TODO: Call Python server when ready
      // For now, return mock data for testing while Aleem works on music generation
      console.log('🎵 Using mock audio for testing...');
      
      const mockAudioBuffer = Buffer.from('mock audio data - replace with real audio from Python');
      audioData = mockAudioBuffer.toString('base64');
      
      console.log('✅ Mock audio created successfully');
      
      // Uncomment this when Aleem's Python server is ready:
      /*
      const flaskResponse = await axios.post(
        process.env.FLASK_API_URL || 'http://localhost:5000/generate-music',
        {
          emotion,
          intensity: confidence,
          tempo: musicParams.tempo,
          key: musicParams.key,
          energy: musicParams.energy
        },
        { timeout: 30000 }
      );
      audioData = flaskResponse.data.audio;
      console.log('✅ Music generated successfully');
      */
    } catch (flaskError) {
      console.error('❌ Error:', flaskError.message);
      generationError = flaskError.message;
    }

    res.json({
      success: true,
      emotion,
      confidence,
      musicParams,
      audio: audioData,
      generationError,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Music Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating music: ' + error.message
    });
  }
});

function getMusicParams(emotion, confidence) {
  const emotionToMusic = {
    joy: { tempo: 'fast', key: 'major', energy: 'high' },
    sadness: { tempo: 'slow', key: 'minor', energy: 'low' },
    anger: { tempo: 'fast', key: 'minor', energy: 'very-high' },
    fear: { tempo: 'moderate', key: 'minor', energy: 'medium' },
    surprise: { tempo: 'moderate', key: 'major', energy: 'medium-high' },
    disgust: { tempo: 'slow', key: 'minor', energy: 'low-medium' },
  };

  return emotionToMusic[emotion] || emotionToMusic.joy;
}

module.exports = router;
