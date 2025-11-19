const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  emotion: {
    type: String,
    enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral'],
    required: true
  },
  tempo: {
    type: String,
    enum: ['very-slow', 'slow', 'moderate', 'fast', 'very-fast'],
    required: true
  },
  key: {
    type: String,
    enum: ['major', 'minor'],
    required: true
  },
  energy: {
    type: String,
    enum: ['very-low', 'low', 'low-medium', 'medium', 'medium-high', 'high', 'very-high'],
    required: true
  },
  intensity: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileFormat: {
    type: String,
    default: 'mp3'
  },
  duration: {
    type: Number,
    required: true
  },
  artist: {
    type: String,
    default: 'Unknown'
  },
  genre: String,
  tags: [String],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plays: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

SongSchema.index({ emotion: 1, tempo: 1, key: 1, energy: 1 });

SongSchema.methods.incrementPlays = async function() {
  this.plays += 1;
  await this.save();
};

SongSchema.statics.findByEmotionParams = function(emotion, musicParams) {
  const query = { emotion, isActive: true, isPublic: true };
  if (musicParams.tempo) query.tempo = musicParams.tempo;
  if (musicParams.key) query.key = musicParams.key;
  if (musicParams.energy) query.energy = musicParams.energy;
  return this.find(query);
};

module.exports = mongoose.model('Song', SongSchema);
