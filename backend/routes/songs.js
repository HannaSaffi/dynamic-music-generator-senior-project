const express = require('express');
const Song = require('../models/Song');
const User = require('../models/User');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all songs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { emotion, tempo, key, energy, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const query = { isActive: true, isPublic: true };
    if (emotion) query.emotion = emotion;
    if (tempo) query.tempo = tempo;
    if (key) query.key = key;
    if (energy) query.energy = energy;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }

    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Song.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      songs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching songs' });
  }
});

// Match emotion
router.get('/match-emotion', async (req, res) => {
  try {
    const { emotion, tempo, key, energy, limit = 5 } = req.query;

    if (!emotion) {
      return res.status(400).json({ success: false, error: 'Emotion parameter is required' });
    }

    const songs = await Song.findByEmotionParams(emotion, { tempo, key, energy })
      .limit(parseInt(limit))
      .sort('-plays');

    res.json({ success: true, count: songs.length, songs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error matching songs' });
  }
});

// Get single song
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'username');

    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }

    await song.incrementPlays();
    res.json({ success: true, song });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching song' });
  }
});

// Create song (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const song = await Song.create({ ...req.body, uploadedBy: req.user._id });
    res.status(201).json({ success: true, song });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating song' });
  }
});

// Favorite song
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.favoriteSongs.includes(song._id)) {
      return res.status(400).json({ success: false, error: 'Already in favorites' });
    }

    user.favoriteSongs.push(song._id);
    await user.save();

    song.favorites += 1;
    await song.save();

    res.json({ success: true, message: 'Song added to favorites' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error adding to favorites' });
  }
});

module.exports = router;
