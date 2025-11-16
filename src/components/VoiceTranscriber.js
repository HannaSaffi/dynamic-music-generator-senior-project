import { useState, useEffect, useRef } from 'react';
import { useSentimentWithTranscription } from '../useSentimentAnalysis';
import { SentimentDashboard } from '../SentimentComponents';

export function useVoiceTranscription() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPiece + ' ';
        } else {
          interim += transcriptPiece;
        }
      }

      setInterimTranscript(interim);
      if (final) {
        setTranscript(prev => prev + final);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  };
}

// NEW: Voice Transcriber Component with Sentiment Analysis
export function VoiceTranscriberWithSentiment() {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceTranscription();

  // Add sentiment analysis - ONE line!
  const sentiment = useSentimentWithTranscription(transcript + interimTranscript);

  if (!isSupported) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Speech recognition is not supported in this browser. Please use Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Voice Transcription with Sentiment Analysis</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: isListening ? '#ef4444' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {isListening ? '🛑 Stop' : '🎤 Start Recording'}
        </button>
        
        <button
          onClick={clearTranscript}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      <div style={{
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '20px',
        minHeight: '150px'
      }}>
        <h3>Transcript:</h3>
        <p style={{ margin: '10px 0' }}>
          {transcript}
          <span style={{ color: '#6b7280' }}>{interimTranscript}</span>
        </p>
      </div>

      {/* Sentiment Analysis Dashboard */}
      <SentimentDashboard {...sentiment} />
    </div>
  );
}
