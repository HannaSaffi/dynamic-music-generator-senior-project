/**
 * Advanced NLP-Based Emotion Detection - FIXED VERSION
 * Now properly handles real-time voice transcription
 */

class EmotionAnalysisService {
  constructor(config = {}) {
    this.config = {
      analysisInterval: 1, // Analyze after each complete phrase
      minConfidenceThreshold: 0.5,
      historyLimit: 100,
      trendWindowSize: 10,
      debug: false, // Turn off debug spam
      minWordsForAnalysis: 3, // Need at least 3 words to analyze
      ...config,
    };

    this.isInitialized = false;
    this.lastAnalyzedText = ''; // Track what we already analyzed
    this.sentenceBuffer = [];
    this.state = this.initializeState();
    this.listeners = new Set();
    
    // Emotion keywords (same as before)
    this.emotionKeywords = {
      joy: {
        keywords: ['happy', 'happiness', 'joy', 'joyful', 'joyous', 'delighted', 'delight', 'pleased', 'pleasure', 'glad', 'cheerful', 'excited', 'excitement', 'thrilled', 'elated', 'euphoric', 'love', 'loving', 'adore', 'wonderful', 'amazing', 'fantastic', 'great', 'excellent', 'brilliant', 'awesome', 'perfect', 'beautiful', 'good', 'blessed', 'grateful', 'thankful', 'proud', 'optimistic', 'hopeful', 'hope', 'content', 'satisfied', 'peaceful', 'celebrate', 'celebration', 'victory', 'victorious', 'win', 'winner', 'succeed', 'success', 'successful', 'triumph', 'champion', 'best', 'enjoy', 'fun', 'funny', 'laugh', 'laughing', 'smile', 'smiling'],
        weight: 1.0
      },
      sadness: {
        keywords: ['sad', 'sadness', 'unhappy', 'depressed', 'depression', 'miserable', 'gloomy', 'melancholy', 'sorrowful', 'sorrow', 'dejected', 'downcast', 'down', 'disappointed', 'disappointing', 'disappointment', 'heartbroken', 'heartbreak', 'lonely', 'loneliness', 'alone', 'bored', 'boring', 'despair', 'hopeless', 'cry', 'crying', 'tears', 'tear', 'weep', 'weeping', 'awful', 'terrible', 'bad', 'worst', 'unfortunate', 'regret', 'regretful', 'miss', 'missing', 'lost', 'lose', 'losing', 'empty', 'emptiness', 'hurt', 'hurting', 'painful', 'pain', 'ache', 'fail', 'failure', 'failing', 'defeat', 'defeated', 'die', 'died', 'dying', 'death', 'dead', 'mourn', 'mourning', 'grief', 'grieve'],
        weight: 1.0
      },
      anger: {
        keywords: ['angry', 'anger', 'mad', 'furious', 'fury', 'enraged', 'rage', 'raging', 'livid', 'irate', 'annoyed', 'annoying', 'irritated', 'irritating', 'irritate', 'frustrated', 'frustrating', 'frustration', 'aggravated', 'hostile', 'hostility', 'resentful', 'resent', 'bitter', 'hate', 'hating', 'hatred', 'loathe', 'despise', 'outraged', 'outrage', 'infuriated', 'exasperated', 'threatened', 'threaten', 'attack', 'attacking', 'betray', 'betrayed', 'betrayal', 'steal', 'stolen', 'thief', 'enemy', 'enemies', 'enrage', 'aggressive', 'aggression', 'violent', 'violence', 'destroy', 'destroyed', 'destruction', 'ruin', 'ruined'],
        weight: 1.0
      },
      fear: {
        keywords: ['afraid', 'scared', 'scary', 'scare', 'frightened', 'frightening', 'fright', 'terrified', 'terrifying', 'terror', 'fearful', 'fear', 'anxious', 'anxiety', 'worried', 'worry', 'worrying', 'nervous', 'nervousness', 'panicked', 'panic', 'alarmed', 'alarm', 'alarming', 'horrified', 'horrifying', 'horror', 'petrified', 'threatened', 'threat', 'threatening', 'insecure', 'vulnerable', 'helpless', 'powerless', 'intimidated', 'intimidate', 'overwhelmed', 'overwhelm', 'stressed', 'stress', 'stressful', 'tense', 'tension', 'uneasy', 'danger', 'dangerous', 'dread', 'dreading', 'nightmare', 'flee', 'escape', 'trapped', 'trap', 'chase', 'chasing'],
        weight: 1.0
      },
      surprise: {
        keywords: ['surprise', 'surprised', 'surprising', 'shock', 'shocked', 'shocking', 'unexpected', 'unexpectedly', 'sudden', 'suddenly', 'wow', 'omg', 'oh', 'woah', 'whoa', 'what', 'reveal', 'revealed', 'revelation', 'discover', 'discovered', 'discovery', 'appear', 'appeared', 'appearance', 'emerge', 'emerged', 'emergence', 'portal', 'magic', 'magical', 'transform', 'transformation', 'amaze', 'amazed', 'amazing', 'astonish', 'astonished', 'astound', 'astounding', 'stun', 'stunned', 'stunning', 'startle', 'startled'],
        weight: 0.9
      },
      disgust: {
        keywords: ['disgusting', 'disgust', 'disgusted', 'gross', 'revolting', 'revolt', 'repulsive', 'nasty', 'rotten', 'rot', 'foul', 'vomit', 'vomiting', 'puke', 'puking', 'decay', 'decaying', 'decayed', 'corpse', 'slime', 'slimy', 'ooze', 'oozing', 'toxic', 'poison', 'poisonous', 'poisoned', 'putrid', 'stench', 'stink', 'stinking', 'stinky', 'sickening', 'sick', 'nauseous', 'horrible', 'hideous', 'ugly', 'filthy', 'contaminated', 'contamination'],
        weight: 1.0
      }
    };
    
    this.emotionToMusic = {
      joy: { tempo: 'fast', key: 'major', energy: 'high' },
      sadness: { tempo: 'slow', key: 'minor', energy: 'low' },
      anger: { tempo: 'fast', key: 'minor', energy: 'very-high' },
      fear: { tempo: 'moderate', key: 'minor', energy: 'medium' },
      surprise: { tempo: 'moderate', key: 'major', energy: 'medium-high' },
      disgust: { tempo: 'slow', key: 'minor', energy: 'low-medium' },
    };
  }

  initializeState() {
    return {
      current: null,
      history: [],
      trend: { direction: 'stable', confidence: 0, recentAverage: 0 },
      statistics: {
        averageScore: 0,
        joyCount: 0,
        sadnessCount: 0,
        angerCount: 0,
        fearCount: 0,
        surpriseCount: 0,
        disgustCount: 0,
        totalAnalyzed: 0,
      },
    };
  }

  async initialize() {
    console.log('🎭 Emotion Detection Ready');
    console.log('✅ Detects: Joy, Sadness, Anger, Fear, Surprise, Disgust');
    this.isInitialized = true;
    return Promise.resolve();
  }

  async processTranscription(text) {
    if (!this.isInitialized || !text) return;

    // Only analyze if we have NEW text
    if (text === this.lastAnalyzedText) {
      return;
    }

    // Only analyze if we have enough words
    const wordCount = text.split(/\s+/).filter(w => w.length > 1).length;
    if (wordCount < this.config.minWordsForAnalysis) {
      return;
    }

    // Analyze the FULL text
    await this.analyzeEmotion(text);
    this.lastAnalyzedText = text;
  }

  async analyzeEmotion(text = null) {
    const textToAnalyze = text || this.sentenceBuffer.join(' ');

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      return null;
    }

    const lowerText = textToAnalyze.toLowerCase();
    const hasNegation = /\b(not|no|never|neither|nor|dont|don't|doesnt|doesn't|cant|can't|wont|won't|isnt|isn't|wasnt|wasn't|arent|aren't)\b/.test(lowerText);
    
    const emotionScores = {};

    // Score each emotion
    for (const [emotion, data] of Object.entries(this.emotionKeywords)) {
      let score = 0;
      const matchedKeywords = [];

      for (const keyword of data.keywords) {
        if (lowerText.includes(keyword)) {
          const regex = new RegExp(keyword, 'g');
          const matches = lowerText.match(regex);
          const matchCount = matches ? matches.length : 0;
          
          score += matchCount * data.weight;
          matchedKeywords.push(keyword);
        }
      }

      // Negation adjustment
      if (hasNegation) {
        if (emotion === 'joy' || emotion === 'surprise') {
          score *= 0.2;
        } else {
          score *= 1.3;
        }
      }

      emotionScores[emotion] = {
        score,
        matchedKeywords,
        count: matchedKeywords.length
      };
    }

    // Find dominant emotion
    const maxScore = Math.max(...Object.values(emotionScores).map(e => e.score));
    
    let detectedEmotion = 'joy';
    let confidence = 0.5;

    if (maxScore > 0) {
      detectedEmotion = Object.keys(emotionScores).find(
        e => emotionScores[e].score === maxScore
      );
      
      const totalMatches = emotionScores[detectedEmotion].count;
      const wordCount = lowerText.split(/\s+/).length;
      const density = Math.min(totalMatches / Math.max(wordCount, 1), 1);
      
      confidence = Math.min(0.95, 0.65 + (density * 0.25));
      
      if (totalMatches >= 2) {
        confidence = Math.min(0.95, confidence + 0.1);
      }
    } else {
      // No keywords - use context
      const positiveWords = ['good', 'nice', 'fine', 'ok', 'okay', 'well', 'yes', 'yay'];
      const negativeWords = ['bad', 'wrong', 'no', 'not', 'never'];
      
      const posCount = positiveWords.filter(w => lowerText.includes(w)).length;
      const negCount = negativeWords.filter(w => lowerText.includes(w)).length;
      
      if (negCount > posCount || hasNegation) {
        detectedEmotion = 'sadness';
        confidence = 0.6;
      } else if (posCount > 0) {
        detectedEmotion = 'joy';
        confidence = 0.6;
      }
    }

    const emotionResult = {
      emotion: detectedEmotion,
      label: detectedEmotion.toUpperCase(),
      score: confidence,
      confidence,
      timestamp: Date.now(),
      textSegment: textToAnalyze.substring(0, 100) + (textToAnalyze.length > 100 ? '...' : ''),
      matchedKeywords: emotionScores[detectedEmotion]?.matchedKeywords || [],
      hasNegation
    };

    this.updateState(emotionResult);
    return emotionResult;
  }

  async analyzeComprehensive(text) {
    if (!text || text.trim().length === 0) {
      return { emotion: null, sentiment: null, timestamp: Date.now() };
    }

    const emotionResult = await this.analyzeEmotion(text);
    const sentiment = emotionResult ? this.emotionToSentiment(emotionResult.emotion) : null;

    return { emotion: emotionResult, sentiment, timestamp: Date.now() };
  }

  emotionToSentiment(emotion) {
    const positiveEmotions = ['joy', 'surprise'];
    const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust'];
    
    if (positiveEmotions.includes(emotion)) {
      return { label: 'POSITIVE', emotion };
    } else if (negativeEmotions.includes(emotion)) {
      return { label: 'NEGATIVE', emotion };
    }
    return { label: 'NEUTRAL', emotion };
  }

  updateState(result) {
    this.state.current = result;
    this.state.history.push(result);

    if (this.state.history.length > this.config.historyLimit) {
      this.state.history.shift();
    }

    this.updateStatistics(result);
    this.state.trend = this.calculateTrend();
    this.notifyListeners();
  }

  updateStatistics(result) {
    const stats = this.state.statistics;
    stats.totalAnalyzed++;

    const emotion = result.emotion;
    if (emotion === 'joy') stats.joyCount++;
    else if (emotion === 'sadness') stats.sadnessCount++;
    else if (emotion === 'anger') stats.angerCount++;
    else if (emotion === 'fear') stats.fearCount++;
    else if (emotion === 'surprise') stats.surpriseCount++;
    else if (emotion === 'disgust') stats.disgustCount++;

    stats.averageScore =
      (stats.averageScore * (stats.totalAnalyzed - 1) + result.score) /
      stats.totalAnalyzed;
  }

  calculateTrend() {
    const recentResults = this.state.history.slice(-this.config.trendWindowSize);

    if (recentResults.length < 3) {
      return { direction: 'stable', confidence: 0, recentAverage: 0 };
    }

    const valenceMap = {
      joy: 1.0, surprise: 0.5, sadness: -0.8,
      anger: -1.0, fear: -0.9, disgust: -0.7,
    };

    const scores = recentResults.map((r) => valenceMap[r.emotion] || 0);
    const recentAverage = scores.reduce((a, b) => a + b, 0) / scores.length;
    const slope = this.calculateSlope(scores);

    let direction = 'stable';
    if (Math.abs(slope) >= 0.05) {
      direction = slope > 0 ? 'improving' : 'declining';
    }

    return { direction, confidence: Math.abs(slope), recentAverage };
  }

  calculateSlope(values) {
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    let numerator = 0, denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  splitIntoSentences(text) {
    const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    if (sentences.length === 0 && text.trim().length > 0) {
      return [text.trim()];
    }
    return sentences;
  }

  getState() { return { ...this.state }; }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  getMusicGenerationData() {
    const current = this.state.current;
    const trend = this.state.trend;

    if (!current) {
      return {
        emotion: 'neutral', intensity: 0.5, trend: 'stable',
        musicParams: null, recentHistory: [],
      };
    }

    return {
      emotion: current.emotion,
      intensity: current.score,
      trend: trend.direction,
      musicParams: this.emotionToMusic[current.emotion],
      recentHistory: this.state.history.slice(-5).map((r) => ({
        emotion: r.emotion, intensity: r.score,
      })),
    };
  }

  getEmotionDistribution() {
    const stats = this.state.statistics;
    const total = stats.totalAnalyzed;
    if (total === 0) return {};

    return {
      joy: (stats.joyCount / total) * 100,
      sadness: (stats.sadnessCount / total) * 100,
      anger: (stats.angerCount / total) * 100,
      fear: (stats.fearCount / total) * 100,
      surprise: (stats.surpriseCount / total) * 100,
      disgust: (stats.disgustCount / total) * 100,
    };
  }

  reset() {
    this.sentenceBuffer = [];
    this.lastAnalyzedText = '';
    this.state = this.initializeState();
    this.notifyListeners();
  }

  dispose() {
    this.listeners.clear();
    this.sentenceBuffer = [];
  }

  // Backward compatibility
  async analyzeSentiment(text) { return this.analyzeEmotion(text); }
  getSentimentTrend(history) { return this.state.trend.direction; }
  normalizeScore(result) {
    if (!result) return 0;
    const valenceMap = { joy: 1.0, surprise: 0.5, sadness: -0.8, anger: -1.0, fear: -0.9, disgust: -0.7 };
    return valenceMap[result.emotion] || 0;
  }
  resetEmotionScores() { this.reset(); }
  detectEmotions(text, result) {
    return { primary: result?.emotion || 'neutral', score: result?.score || 0.5, allEmotions: result ? [result] : [] };
  }
}

export const sentimentService = new EmotionAnalysisService();
export default sentimentService;
