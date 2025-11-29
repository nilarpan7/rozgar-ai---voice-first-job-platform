import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface MicButtonProps {
  onTranscript: (text: string) => void;
  languageCode: string;
  label?: string;
  isProcessing?: boolean;
}

const MicButton: React.FC<MicButtonProps> = ({ onTranscript, languageCode, label, isProcessing = false }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = languageCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onTranscript(text);
      };

      recognitionRef.current = recognition;
    }
  }, [languageCode, onTranscript]);

  const toggleListening = () => {
    if (isProcessing) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        alert("Voice recognition not supported in this browser. Please use Chrome/Edge on Android.");
        // Fallback for demo purposes if no API
        const mockInput = prompt("Voice API not found. Type your command (Simulation):");
        if (mockInput) onTranscript(mockInput);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={toggleListening}
        disabled={isProcessing}
        className={`
          relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl
          ${isListening ? 'bg-red-500 animate-pulse' : 'bg-brand-600 hover:bg-brand-700'}
          ${isProcessing ? 'bg-gray-400 cursor-wait' : ''}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : isListening ? (
          <MicOff className="w-10 h-10 text-white" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
        
        {/* Ripple Effect Ring when listening */}
        {isListening && (
          <span className="absolute w-full h-full rounded-full bg-red-400 opacity-30 animate-ping"></span>
        )}
      </button>
      
      <p className="text-lg font-medium text-gray-700">
        {isListening ? "Listening..." : isProcessing ? "Thinking..." : label || "Tap to Speak"}
      </p>
    </div>
  );
};

export default MicButton;