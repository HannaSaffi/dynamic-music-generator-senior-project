import './App.css';
import { useVoiceTranscription } from './components/VoiceTranscriber';

function App() {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceTranscription();

  if (!isSupported) {
    return (
      <div className="App">
        <div className="container">
          <h1>Voice Transcriber</h1>
          <div className="error">
            ⚠️ Speech Recognition is not supported in this browser.
            <br />
            Please use Chrome, Edge, or Safari.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <h1>🎤 Voice Transcriber</h1>
        <p className="subtitle">Press the button to start recording and transcribing your voice</p>

        <div className="controls">
          {!isListening ? (
            <button className="btn btn-start" onClick={startListening}>
              Start Recording
            </button>
          ) : (
            <button className="btn btn-stop" onClick={stopListening}>
              Stop Recording
            </button>
          )}
          
          <button 
            className="btn btn-clear" 
            onClick={clearTranscript}
            disabled={!transcript && !interimTranscript}
          >
            Clear
          </button>
        </div>

        {isListening && (
          <div className="status">
            <div className="pulse"></div>
            <span>Listening...</span>
          </div>
        )}

        <div className="transcript-container">
          <h2>Transcript:</h2>
          <div className="transcript-box">
            {transcript}
            {interimTranscript && (
              <span className="interim">{interimTranscript}</span>
            )}
            {!transcript && !interimTranscript && (
              <span className="placeholder">
                Your transcribed speech will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
