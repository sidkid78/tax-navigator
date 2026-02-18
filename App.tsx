import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DisclaimerModal } from './components/DisclaimerModal';
import { ChatMessage } from './components/ChatMessage';
import { sendMessageToGemini } from './services/geminiService';
import { Message, TaxCategory } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Add temporary thinking message
    const thinkingId = uuidv4();
    const thinkingMessage: Message = {
      id: thinkingId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isThinking: true
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await sendMessageToGemini(messages.concat(userMessage), userMessage.content);
      
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { 
              ...msg, 
              content: response.text, 
              sources: response.sources, 
              isThinking: false 
            } 
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { 
              ...msg, 
              content: "I'm having trouble connecting to the IRS database right now. Please try again in a moment.", 
              isThinking: false 
            } 
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const suggestions = [
    { label: "Standard Deduction 2024", query: "What is the standard deduction for the 2024 tax year?" },
    { label: "Child Tax Credit", query: "What are the requirements for the Child Tax Credit this year?" },
    { label: "Freelance Taxes", query: "I am a freelancer. What forms do I need to file for self-employment tax?" },
    { label: "Extension Deadline", query: "When is the deadline to file a tax extension?" },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <DisclaimerModal />

      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-72 flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fas fa-scale-balanced text-white text-lg"></i>
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-tight">TaxNavigator</h1>
              <p className="text-xs text-emerald-500 font-medium">IRS.gov Connected</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Tax Categories</h3>
            <div className="space-y-1">
              {Object.values(TaxCategory).map((category) => (
                <button 
                  key={category}
                  onClick={() => handleSendMessage(`Tell me about ${category} for the current tax year`)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left"
                >
                  <i className="fas fa-folder text-slate-600 w-4"></i>
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <h4 className="text-sm font-semibold text-white mb-2">Did you know?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The deadline for filing federal tax returns is typically April 15. If it falls on a weekend or holiday, it moves to the next business day.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
             <i className="fas fa-lock"></i>
             <span>Encrypted & Private</span>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header - Mobile Only */}
        <div className="md:hidden flex items-center p-4 border-b border-slate-800 bg-slate-900">
           <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center mr-3">
              <i className="fas fa-scale-balanced text-white text-sm"></i>
            </div>
            <h1 className="font-bold text-white">TaxNavigator</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            
            {messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-0 animate-fade-in fill-mode-forwards" style={{animationDelay: '100ms'}}>
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-900/20 border border-slate-700 relative group">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                  <i className="fas fa-robot text-4xl text-emerald-400"></i>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">How can I help with your taxes?</h2>
                <p className="text-slate-400 max-w-md mb-8">
                  I'm connected to IRS.gov and Data.gov to provide you with the latest forms, deadlines, and regulation updates.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion.query)}
                      className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-left transition-all duration-200 group"
                    >
                      <h3 className="font-semibold text-slate-200 text-sm mb-1 group-hover:text-emerald-400 transition-colors">{suggestion.label}</h3>
                      <p className="text-xs text-slate-500 truncate">{suggestion.query}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/50 z-10">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about forms, deductions, or tax laws..."
              className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none shadow-lg placeholder:text-slate-600"
              rows={1}
              style={{ minHeight: '60px' }}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isProcessing}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center
                ${!inputValue.trim() || isProcessing 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95'
                }`}
            >
              <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-3">
            TaxNavigator AI can make mistakes. Verify important information with IRS.gov.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;