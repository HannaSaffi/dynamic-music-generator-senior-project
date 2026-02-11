/**
 * Audio Service for Emotion-Based Music Playback
 * Plays pre-saved tracks based on detected emotions
 */

class AudioService {
  constructor() {
    this.currentAudio = null;
    this.currentEmotion = null;
    this.currentTrackName = null;
    this.volume = 0.7;
    this.isPlaying = false;
    this.listeners = new Set();
    
    // Actual track filenames per emotion
    this.emotionTracks = {
      joy: ['happy.mp3', 'acoustic-upbeat.mp3', 'happy-acoustic-guitar.mp3', 'pop-upbeat-pop-music.mp3', 'upbeat-acoustic-happy-strums.mp3', 'upbeat-acoustic.mp3'],
      sadness: ['melancholic-piano-amp-strings.mp3', 'melancholy-sad-dramatic-piano.mp3', 'sad-sorrowful-piano.mp3', 'sad-story.mp3', 'sad.mp3'], // Aleem will add
      anger: ['angry.mp3', 'heavy-punky.mp3', 'intense-chase.mp3', 'intense-hard-rock.mp3', 'sport-action-rock.mp3'], // Aleem will add
      fear: ['horror.mp3', 'horrorDoll.mp3', 'suspense.mp3', 'tension.mp3', 'darkAmbient.mp3'],
      surprise: ['fantasy.mp3', 'magical.mp3', 'mystery.mp3', 'surprise.mp3', 'unexpected.mp3'],
      disgust: ['creepy.mp3', 'darkDrone.mp3', 'eerie.mp3', 'unsettling.mp3', 'weird.mp3']
    };
    
    // Avoid immediate repeats
    this.lastPlayedTrack = {};
  }

  /**
   * Get random track for emotion (avoids repeat)
   */
  getRandomTrack(emotion) {
    const tracks = this.emotionTracks[emotion] || [];
    
    if (tracks.length === 0) {
      console.warn(`No tracks for ${emotion}, falling back to joy`);
      return { track: this.emotionTracks['joy'][0], fallbackEmotion: 'joy' };
    }
    
    if (tracks.length === 1) {
      return { track: tracks[0], fallbackEmotion: null };
    }
    
    let track;
    do {
      track = tracks[Math.floor(Math.random() * tracks.length)];
    } while (track === this.lastPlayedTrack[emotion] && tracks.length > 1);
    
    this.lastPlayedTrack[emotion] = track;
    return { track, fallbackEmotion: null };
  }

  /**
   * Get audio file path
   */
  getAudioPath(emotion) {
    const { track, fallbackEmotion } = this.getRandomTrack(emotion);
    const actualEmotion = fallbackEmotion || emotion;
    this.currentTrackName = track;
    return `/audio/${actualEmotion}/${track}`;
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

    // Check if we have tracks for this emotion
    if (this.emotionTracks[emotion].length === 0) {
      console.warn(`No tracks for ${emotion}, falling back to joy`);
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
    console.log(`🎵 Playing: ${path}`);
    
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
      currentTrack: this.currentTrackName,
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
    this.currentTrackName = null;
    this.notifyListeners();
  }
}

// Singleton instance
export const audioService = new AudioService();
export default audioService;
