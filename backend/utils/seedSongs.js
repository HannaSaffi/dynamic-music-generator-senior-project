require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../models/Song');
const User = require('../models/User');
const connectDB = require('../config/db');

const sampleSongs = [
  {
    title: 'Victorious March',
    emotion: 'joy',
    tempo: 'fast',
    key: 'major',
    energy: 'high',
    intensity: 0.9,
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 180,
    artist: 'Epic Orchestra'
  },
  {
    title: 'Melancholy Strings',
    emotion: 'sadness',
    tempo: 'slow',
    key: 'minor',
    energy: 'low',
    intensity: 0.8,
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 200,
    artist: 'Ambient Collective'
  },
  {
    title: 'Battle Fury',
    emotion: 'anger',
    tempo: 'very-fast',
    key: 'minor',
    energy: 'very-high',
    intensity: 1.0,
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 160,
    artist: 'War Drums'
  },
  {
    title: 'Shadows Lurking',
    emotion: 'fear',
    tempo: 'slow',
    key: 'minor',
    energy: 'medium',
    intensity: 0.75,
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 190,
    artist: 'Horror Ambient'
  },
  {
    title: 'Sudden Discovery',
    emotion: 'surprise',
    tempo: 'moderate',
    key: 'major',
    energy: 'medium-high',
    intensity: 0.7,
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 90,
    artist: 'Magical Moments'
  },
  {
    title: 'Rotting Depths',
    emotion: 'disgust',
    tempo: 'slow',
    key: 'minor',
    energy: 'low-medium',
    intensity: 0.7,
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 170,
    artist: 'Dark Ambient'
  }
];

async function seedDatabase() {
  try {
    await connectDB();

    let adminUser = await User.findOne({ email: 'admin@dynamicmusic.com' });
    
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@dynamicmusic.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Admin user created (admin@dynamicmusic.com / admin123)');
    }

    await Song.deleteMany({});
    
    for (const songData of sampleSongs) {
      await Song.create({ ...songData, uploadedBy: adminUser._id });
    }

    console.log(`✅ Seeded ${sampleSongs.length} songs`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
