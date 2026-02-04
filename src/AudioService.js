/**
 * Audio Service for Emotion-Based Music Playback
 * Plays pre-saved tracks based on detected emotions
 */

class AudioService {
  constructor() {
    this.currentAudio = null;
    this.currentEmotion = null;
    this.volume = 0.7;
    this.isPlaying = false;
    this.listeners = new Set();
    
    // 5 tracks per emotion
    this.trackCounts = {
      joy: 5,
      sadness: 5,
      anger: 5,
      fear: 5,
      surprise: 5,
      disgust: 5
    };
    
    // Avoid immediate repeats
    this.lastPlayedTrack = {};
  }

  /**
   * Get random track number (avoids repeat)
   */
  getRandomTrack(emotion) {
    const count = this.trackCounts[emotion] || 5;
    let trackNum;
    
    do {
      trackNum = Math.floor(Math.random() * count) + 1;
    } while (trackNum === this.lastPlayedTrack[emotion] && count > 1);
    
    this.lastPlayedTrack[emotion] = trackNum;
    return trackNum;
  }

  /**
   * Get audio file path
   */
  getAudioPath(emotion) {
    const trackNum = this.getRandomTrack(emotion);
    return `/audio/${emotion}/track${trackNum}.mp3`;
  }

  /**
   * Play music for detected emotion
   */
  async playForEmotion(emotion) {
    const validEmotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'];
    
    if (!validEmotions.includes(emotion)) {
      console.warn(`Unknown emotion: ${emotion}, defaulting to joy`);
      emotion = 'joy';
    }

    // Skip if same emotion already playing
    if (emotion === this.currentEmotion && this.isPlaying) {
      return;
    }

    console.log(`🎵 Switching to ${emotion} music`);
    await this.crossfadeTo(emotion);
  }

  /**
   * Crossfade to new emotion track
   */
  async crossfadeTo(emotion) {
    const path = this.getAudioPath(emotion);
    const newAudio = new Audio(path);
    newAudio.volume = 0;
    newAudio.loop = true;

    try {
      await newAudio.play();
      
      // Crossfade
      if (this.currentAudio) {
        await this.crossfade(this.currentAudio, newAudio);
      } else {
        // First track - just fade in
        await this.fadeIn(newAudio);
      }
      
      this.currentAudio = newAudio;
      this.currentEmotion = emotion;
      this.isPlaying = true;
      this.notifyListeners();
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      if (error.name === 'NotAllowedError') {
        console.log('⚠️ Click anywhere to enable audio');
      }
    }
  }

  /**
   * Crossfade between tracks (1 second)
   */
  crossfade(oldAudio, newAudio, duration = 1000) {
    return new Promise((resolve) => {
      const steps = 20;
      const stepTime = duration / steps;
      const volumeStep = this.volume / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        
        // Fade out old
        if (oldAudio) {
          oldAudio.volume = Math.max(0, this.volume - (volumeStep * step));
        }
        
        // Fade in new
        newAudio.volume = Math.min(this.volume, volumeStep * step);

        if (step >= steps) {
          clearInterval(interval);
          if (oldAudio) {
            oldAudio.pause();
            oldAudio.src = '';
          }
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Fade in single track
   */
  fadeIn(audio, duration = 500) {
    return new Promise((resolve) => {
      const steps = 10;
      const stepTime = duration / steps;
      const volumeStep = this.volume / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        audio.volume = Math.min(this.volume, volumeStep * step);

        if (step >= steps) {
          clearInterval(interval);
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Fade out and stop
   */
  async fadeOut(duration = 500) {
    if (!this.currentAudio) return;

    const audio = this.currentAudio;
    const steps = 10;
    const stepTime = duration / steps;
    const volumeStep = audio.volume / steps;

    return new Promise((resolve) => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        audio.volume = Math.max(0, audio.volume - volumeStep);

        if (step >= steps) {
          clearInterval(interval);
          audio.pause();
          resolve();
        }
      }, stepTime);
    });
  }

  /**
   * Play/Resume
   */
  async play() {
    if (this.currentAudio && !this.isPlaying) {
      await this.currentAudio.play();
      this.isPlaying = true;
      this.notifyListeners();
    }
  }

  /**
   * Pause
   */
  pause() {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
      this.notifyListeners();
    }
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Set volume (0-100)
   */
  setVolume(value) {
    this.volume = value / 100;
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentEmotion: this.currentEmotion,
      volume: this.volume * 100
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Stop and cleanup
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.currentEmotion = null;
    this.notifyListeners();
  }
}

// Singleton instance
export const audioService = new AudioService();
export default audioService;
