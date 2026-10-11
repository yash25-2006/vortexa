import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, RefreshCw } from 'lucide-react';

export default function VoiceRecorder({ selectedLanguage, onTranscriptReady }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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

    // Map language selection to BCP-47 language tag
    const langCodeMap = {
      'Marathi': 'mr-IN',
      'Hindi': 'hi-IN',
      'English': 'en-IN',
      'Tamil': 'ta-IN',
      'Telugu': 'te-IN',
      'Auto': 'hi-IN'
    };

    recognition.lang = langCodeMap[selectedLanguage] || 'hi-IN';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        setInterimText(interimTranscript);
      }

      if (finalTranscript) {
        setInterimText('');
        onTranscriptReady(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMessage('Microphone access denied. Please grant microphone permission in your browser.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('No speech detected. Please speak clearly into your microphone.');
      } else {
        setErrorMessage(`Voice recognition note: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage, onTranscriptReady]);

  const toggleListening = () => {
    setErrorMessage('');
    if (!isSupported) {
      setErrorMessage('Voice input is not supported by your current browser. You can type directly in the text box.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const langCodeMap = {
          'Marathi': 'mr-IN',
          'Hindi': 'hi-IN',
          'English': 'en-IN',
          'Tamil': 'ta-IN',
          'Telugu': 'te-IN',
          'Auto': 'hi-IN'
        };
        if (recognitionRef.current) {
          recognitionRef.current.lang = langCodeMap[selectedLanguage] || 'hi-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setErrorMessage('Unable to start microphone. Please check permissions.');
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={toggleListening}
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            isListening
              ? 'bg-emerald-600 text-white animate-pulse ring-4 ring-emerald-200'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice speech-to-text'}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 text-white" />
              <span>Listening... (Click to stop)</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-amber-700" />
              <span>Voice Input (बोलून सांगा / बोलकर बताएं)</span>
            </>
          )}
        </button>

        {isListening && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>Recording ({selectedLanguage || 'Auto'})...</span>
          </div>
        )}
      </div>

      {interimText && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 font-indic italic">
          Live speech: &ldquo;{interimText}&rdquo;
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
