/**
 * React Hook for Sentiment Analysis Integration
 * JavaScript version for Hanna's existing project
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { sentimentService } from './sentimentAnalysisService';

export function useSentimentAnalysis(options = {}) {
  const { enabled = true, config, onSentimentChange, onError } = options;

  const [sentimentState, setSentimentState] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Initialize service
  useEffect(() => {
    if (!enabled) return;

    const initService = async () => {
      try {
        // Apply custom config if provided
        if (config) {
          Object.assign(sentimentService.config, config);
        }

        // Subscribe to state changes
        const unsubscribe = sentimentService.subscribe((state) => {
          setSentimentState(state);
          if (state.current && onSentimentChange) {
            onSentimentChange(state.current);
          }
        });

        // Initialize the model
        await sentimentService.initialize();
        setIsInitialized(true);
        setSentimentState(sentimentService.getState());

        return () => {
          unsubscribe();
        };
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error('Failed to initialize sentiment analysis');
        setError(errorObj);
        if (onError) onError(errorObj);
      }
    };

    initService();
  }, [enabled, config, onSentimentChange, onError]);

  // Process transcribed text
  const processText = useCallback(async (text) => {
    if (!isInitialized) {
      console.warn('Sentiment service not ready');
      return;
    }

    try {
      setIsAnalyzing(true);
      await sentimentService.processTranscription(text);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to process text');
      setError(errorObj);
      if (onError) onError(errorObj);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isInitialized, onError]);

  // Force immediate analysis
  const forceAnalyze = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Sentiment service not ready');
    }

    try {
      setIsAnalyzing(true);
      await sentimentService.analyzeSentiment();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to analyze sentiment');
      setError(errorObj);
      if (onError) onError(errorObj);
      throw errorObj;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isInitialized, onError]);

  // Reset sentiment state
  const reset = useCallback(() => {
    sentimentService.reset();
    setError(null);
  }, []);

  // Computed values
  const currentSentiment = sentimentState?.current
    ? sentimentState.current.label.toLowerCase()
    : null;

  const sentimentScore = sentimentState?.current?.score ?? null;

  const trend = sentimentState?.trend.direction ?? 'stable';

  const musicData = sentimentService.getMusicGenerationData();

  return {
    sentimentState,
    isInitialized,
    isAnalyzing,
    error,
    processText,
    forceAnalyze,
    reset,
    currentSentiment,
    sentimentScore,
    trend,
    musicData,
  };
}

/**
 * Hook to integrate sentiment analysis with transcription
 * Auto-processes transcription results
 * FIXED: Now sends full text instead of incremental changes
 */
export function useSentimentWithTranscription(
  transcriptionText,
  options = {}
) {
  const sentiment = useSentimentAnalysis(options);
  const previousTextRef = useRef('');

  useEffect(() => {
    // Send the FULL transcription text (service tracks what's already analyzed)
    if (transcriptionText && transcriptionText.trim()) {
      sentiment.processText(transcriptionText);
      previousTextRef.current = transcriptionText;
    }
  }, [transcriptionText, sentiment]);

  return sentiment;
}

export default useSentimentAnalysis;
