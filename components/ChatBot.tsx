
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, MapPin } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Namaste! Main Rozgar Sahayak hoon. Main aapki kya madad kar sakta hoon?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    // Get user location for grounding
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.log("Geolocation error:", error)
      );
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for Gemini SDK
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const { text, groundingChunks } = await getChatResponse(history, userMessage.text, location);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text || "Sorry, I didn't catch that.",
        timestamp: new Date(),
        groundingChunks: groundingChunks
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-brand-600 hover:bg-brand-700 hover:-translate-y-1'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
             <MessageCircle className="w-7 h-7 text-white" />
             <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
             </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-96 max-h-[600px] h-[70vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-brand-600 p-4 flex items-center gap-3 text-white shadow-md">
            <div className="p-2 bg-white/20 rounded-full">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Rozgar Sahayak</h3>
              <p className="text-xs text-brand-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span> Online
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-200' : 'bg-brand-100'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-brand-600" />
                  )}
                </div>
                <div className="flex flex-col">
                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-tr-none'
                          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {/* Render Google Maps Grounding Chips */}
                    {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                           {msg.groundingChunks.map((chunk: any, i: number) => {
                               const mapData = chunk.maps;
                               if (!mapData || !mapData.uri) return null;
                               return (
                                   <a 
                                     key={i} 
                                     href={mapData.uri} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 hover:bg-blue-100 transition-colors no-underline"
                                   >
                                     <MapPin className="w-3 h-3" />
                                     {mapData.title || "View on Maps"}
                                   </a>
                               );
                           })}
                        </div>
                    )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-brand-600" />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none focus:ring-0 px-3 text-sm text-gray-800 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
