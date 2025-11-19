const express = require('express');
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user sessions
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    const query = { userId: req.user._id };
    if (active !== undefined) query.isActive = active === 'true';

    const sessions = await Session.find(query)
      .populate('songsPlayed.song', 'title emotion')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Session.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching sessions' });
  }
});

// Get single session
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('songsPlayed.song')
      .populate('userId', 'username');

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching session' });
  }
});

// Create session
router.post('/', protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const session = await Session.create({
      userId: req.user._id,
      title,
      description
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { sessions: session._id } });

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error creating session' });
  }
});

// Add emotion entry
router.post('/:id/emotion', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const { emotion, confidence, textSegment } = req.body;
    await session.addEmotionEntry({ emotion, confidence, textSegment });

    res.json({ success: true, message: 'Emotion entry added' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error adding emotion' });
  }
});

// Add song play
router.post('/:id/song', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const { songId, emotion, duration } = req.body;
    await session.addSongPlay(songId, emotion, duration || 0);

    res.json({ success: true, message: 'Song play recorded' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error recording song' });
  }
});

// End session
router.put('/:id/end', protect, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session || session.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (!session.isActive) {
      return res.status(400).json({ success: false, error: 'Session already ended' });
    }

    await session.endSession();
    res.json({ success: true, message: 'Session ended', session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error ending session' });
  }
});

module.exports = router;
