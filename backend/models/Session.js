const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  transcript: String,
  emotionHistory: [{
    emotion: String,
    confidence: Number,
    textSegment: String,
    timestamp: { type: Date, default: Date.now }
  }],
  songsPlayed: [{
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    emotion: String,
    playedAt: { type: Date, default: Date.now },
    duration: Number
  }],
  statistics: {
    totalDuration: { type: Number, default: 0 },
    totalSongsPlayed: { type: Number, default: 0 },
    dominantEmotion: String,
    emotionBreakdown: {
      joy: { type: Number, default: 0 },
      sadness: { type: Number, default: 0 },
      anger: { type: Number, default: 0 },
      fear: { type: Number, default: 0 },
      surprise: { type: Number, default: 0 },
      disgust: { type: Number, default: 0 }
    }
  },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

SessionSchema.methods.addEmotionEntry = function(emotionData) {
  this.emotionHistory.push(emotionData);
  if (emotionData.emotion && this.statistics.emotionBreakdown[emotionData.emotion] !== undefined) {
    this.statistics.emotionBreakdown[emotionData.emotion] += 1;
  }
  return this.save();
};

SessionSchema.methods.addSongPlay = function(songId, emotion, duration) {
  this.songsPlayed.push({ song: songId, emotion, duration });
  this.statistics.totalSongsPlayed += 1;
  return this.save();
};

SessionSchema.methods.endSession = function() {
  this.endedAt = new Date();
  this.isActive = false;
  this.statistics.totalDuration = Math.floor((this.endedAt - this.startedAt) / 1000);
  const breakdown = this.statistics.emotionBreakdown;
  const dominantEmotion = Object.keys(breakdown).reduce((a, b) => 
    breakdown[a] > breakdown[b] ? a : b
  );
  this.statistics.dominantEmotion = dominantEmotion;
  return this.save();
};

module.exports = mongoose.model('Session', SessionSchema);
