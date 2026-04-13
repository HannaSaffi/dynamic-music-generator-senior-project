/**
 * Audio Service for Emotion-Based Music Playback
 * Plays pre-saved tracks based on detected emotions and context modes
 */

class AudioService {
  constructor() {
    this.currentAudio = null;
    this.currentEmotion = null;
    this.currentTrackName = null;
    this.currentMode = 'casual';
    this.volume = 0.7;
    this.isPlaying = false;
    this.playingIntro = false;
    this.listeners = new Set();

    // Tracks organized by mode then emotion
    this.emotionTracks = {
      casual: {
        joy: ['happy.mp3', 'acoustic-upbeat.mp3', 'happy-acoustic-guitar.mp3', 'pop-upbeat-pop-music.mp3', 'upbeat-acoustic-happy-strums.mp3', 'upbeat-acoustic.mp3'],
        sadness: ['melancholic-piano-amp-strings.mp3', 'melancholy-sad-dramatic-piano.mp3', 'sad-sorrowful-piano.mp3', 'sad-story.mp3', 'sad.mp3'],
        anger: ['angry.mp3', 'heavy-punky.mp3', 'intense-chase.mp3', 'intense-hard-rock.mp3', 'sport-action-rock.mp3'],
        fear: ['darkAmbient.mp3', 'horror.mp3', 'horrorDoll.mp3', 'suspense.mp3', 'tension.mp3'],
        surprise: ['fantasy.mp3', 'magical.mp3', 'mystery.mp3', 'surprise.mp3', 'unexpected.mp3'],
        disgust: ['creepy.mp3', 'darkDrone.mp3', 'eerie.mp3', 'unsettling.mp3', 'weird.mp3']
      },
      boardgames: {
        joy: ['happy.mp3', 'acoustic-upbeat.mp3', 'happy-acoustic-guitar.mp3', 'pop-upbeat-pop-music.mp3', 'upbeat-acoustic-happy-strums.mp3', 'upbeat-acoustic.mp3'],
        sadness: ['melancholic-piano-amp-strings.mp3', 'melancholy-sad-dramatic-piano.mp3', 'sad-sorrowful-piano.mp3', 'sad-story.mp3', 'sad.mp3'],
        anger: ['angry.mp3', 'heavy-punky.mp3', 'intense-chase.mp3', 'intense-hard-rock.mp3', 'sport-action-rock.mp3'],
        fear: ['darkAmbient.mp3', 'horror.mp3', 'horrorDoll.mp3', 'suspense.mp3', 'tension.mp3'],
        surprise: ['fantasy.mp3', 'magical.mp3', 'mystery.mp3', 'surprise.mp3', 'unexpected.mp3'],
        disgust: ['creepy.mp3', 'darkDrone.mp3', 'eerie.mp3', 'unsettling.mp3', 'weird.mp3']
      },
      dnd: {
        joy: ['happy-adventure.wav', 'happy-uplift-quest.wav', 'joyful.wav', 'medievalJoy.mp3'],
        sadness: ['melancholy-and-despair.wav', 'sad-grief-ominous.wav', 'sadness-medieval.wav'],
        anger: ['angry-maiden-nu-metal-flute-instrumental.mp3', 'epic-battle.wav', 'heat-of-heroes-battle.mp3', 'traitor.wav'],
        fear: ['darkAmbient.mp3', 'horror.mp3', 'mystery-reveal.wav', 'tension.mp3'],
        surprise: ['fantasy.mp3', 'magical-surprise.wav', 'shocking-news-medieval.wav', 'surprise.mp3', 'unexpected.mp3'],
        disgust: ['creepy.mp3', 'darkDrone.mp3', 'disgust-unsettling-weird-goosebumps.wav', 'eerie.mp3', 'unsettling.mp3']
      },
      meditation: {
        joy: ['meditation_joy_1.wav', 'music_for_video-uplifting-ambient-124569.mp3'],
        sadness: ['meditation_sadness_1.wav', 'soundgallerybydmitrytaras-sad-piano-496878.mp3'],
        anger: ['leberch-meditation-509071.mp3', 'meditation_anger_1.wav'],
        fear: ['meditation_fear_1.wav', 'soundsbyamelia-slow-breathing-calm-instrumental-soundscape-457319.mp3'],
        surprise: ['meditation_surprise_1.wav', 'metriko-cosmic-exploration-soundscape-364796.mp3'],
        disgust: ['meditation_disgust_1.wav', 'meditativetiger-full-moon-cleansing-ritual-489159.mp3']
      },
      therapy: {
        joy: ['leberch-piano-438549.mp3', 'therapy_joy_1.wav'],
        sadness: ['do_what_you_want-relax-meditate-gentle-peaceful-291162.mp3', 'therapy_sadness_1.wav'],
        anger: ['andriig-calm-nature-music-471361.mp3', 'therapy_anger_1.wav'],
        fear: ['soundsbyamelia-slow-breathing-calm-instrumental-soundscape-457319.mp3', 'therapy_fear_1.wav'],
        surprise: ['grand_project-easy-travel_short-1-332846.mp3', 'therapy_surprise_1.wav'],
        disgust: ['senormusica81-ambient-neutral-v11-456867.mp3', 'therapy_disgust_1.wav']
      }
    };

    // Avoid immediate repeats
    this.lastPlayedTrack = {};
  }

  /**
   * Set the current context mode
   */
  async setMode(mode) {
    const validModes = ['casual', 'boardgames', 'dnd', 'meditation', 'therapy'];
    if (!validModes.includes(mode)) {
      console.warn(`Unknown mode: ${mode}, defaulting to casual`);
      mode = 'casual';
    }
    if (mode === this.currentMode) return;
    await this.fadeOut();
    this.currentEmotion = null;
    this.currentMode = mode;
    console.log(`🎵 Mode set to: ${mode}`);
    this.notifyListeners();
    await this.playIntro();
  }

  /**
   * Get random track for emotion (avoids repeat)
   */
  getRandomTrack(emotion) {
    const modeTracks = this.emotionTracks[this.currentMode] || this.emotionTracks['casual'];
    const tracks = modeTracks[emotion] || [];

    if (tracks.length === 0) {
      console.warn(`No tracks for ${emotion} in ${this.currentMode}, falling back to joy`);
      const joyTracks = modeTracks['joy'] || [];
      if (joyTracks.length === 0) {
        console.warn(`No joy tracks in ${this.currentMode} either`);
        return { track: null, fallbackEmotion: null };
      }
      return { track: joyTracks[0], fallbackEmotion: 'joy' };
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
    if (!track) return null;
    const actualEmotion = fallbackEmotion || emotion;
    this.currentTrackName = track;
    return `/audio/${this.currentMode}/${actualEmotion}/${track}`;
  }

  /**
   * Play intro music (loops until first emotion is detected)
   */
  async playIntro() {
    console.log(`🎵 Playing intro music for ${this.currentMode} mode`);
    this.playingIntro = true;
    const path = `/audio/${this.currentMode}/intro/intro.mp3`;
    this.currentTrackName = 'intro.mp3';

    const introAudio = new Audio(path);
    introAudio.volume = 0;
    introAudio.loop = true;

    // Check if the intro file exists before trying to play
    try {
      const response = await fetch(path, { method: 'HEAD' });
      if (!response.ok) {
        console.log(`No intro available for ${this.currentMode} mode, skipping`);
        this.playingIntro = false;
        return;
      }
    } catch {
      console.log(`No intro available for ${this.currentMode} mode, skipping`);
      this.playingIntro = false;
      return;
    }

    try {
      await introAudio.play();
      await this.fadeIn(introAudio);
      this.currentAudio = introAudio;
      this.currentEmotion = 'intro';
      this.isPlaying = true;
      this.notifyListeners();
    } catch (error) {
      console.log(`Could not play intro for ${this.currentMode} mode, skipping`);
      this.playingIntro = false;
    }
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

    // Check if we have tracks for this emotion in current mode
    const modeTracks = this.emotionTracks[this.currentMode] || this.emotionTracks['casual'];
    if (!modeTracks[emotion] || modeTracks[emotion].length === 0) {
      console.warn(`No tracks for ${emotion} in ${this.currentMode}, falling back to joy`);
      emotion = 'joy';
      if (!modeTracks['joy'] || modeTracks['joy'].length === 0) {
        console.warn(`No tracks available in ${this.currentMode} mode`);
        return;
      }
    }

    // Skip if same emotion already playing (but not if transitioning from intro)
    if (emotion === this.currentEmotion && this.isPlaying && !this.playingIntro) {
      return;
    }

    if (this.playingIntro) {
      console.log(`🎵 Intro ending — crossfading to ${emotion} music`);
      this.playingIntro = false;
    } else {
      console.log(`🎵 Switching to ${emotion} music`);
    }
    await this.crossfadeTo(emotion);
  }

  /**
   * Crossfade to new emotion track
   */
  async crossfadeTo(emotion) {
    const path = this.getAudioPath(emotion);
    if (!path) {
      console.warn('No audio path available, skipping crossfade');
      return;
    }
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
      currentMode: this.currentMode,
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
    this.playingIntro = false;
    this.currentEmotion = null;
    this.currentTrackName = null;
    this.notifyListeners();
  }
}

// Singleton instance
export const audioService = new AudioService();
export default audioService;
