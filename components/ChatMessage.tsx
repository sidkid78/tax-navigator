import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-fade-in`}>
      <div className={`flex max-w-4xl w-full ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-700' : 'bg-emerald-600/20 border border-emerald-500/30'}`}>
            {isUser ? (
              <i className="fas fa-user text-slate-300 text-sm"></i>
            ) : (
              <i className="fas fa-university text-emerald-400 text-sm"></i>
            )}
          </div>
        </div>

        {/* Content Bubble */}
        <div className={`flex-1 flex flex-col items-start min-w-0`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-xs font-semibold ${isUser ? 'text-slate-400' : 'text-emerald-400'}`}>
              {isUser ? 'You' : 'TaxNavigator AI'}
            </span>
            <span className="text-xs text-slate-600">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div 
            className={`prose prose-invert prose-sm max-w-none w-full p-4 rounded-2xl shadow-sm
            ${isUser 
              ? 'bg-slate-800 text-slate-100 rounded-tr-sm' 
              : 'bg-slate-900/50 border border-slate-800 text-slate-200 rounded-tl-sm'
            }`}
          >
             {message.isThinking ? (
               <div className="flex items-center space-x-2 text-slate-400">
                 <i className="fas fa-circle-notch fa-spin"></i>
                 <span>Analyzing IRS database...</span>
               </div>
             ) : (
               <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => <a {...props} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2" target="_blank" rel="noopener noreferrer" />,
                    ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 my-2 space-y-1" />,
                    ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-5 my-2 space-y-1" />,
                    h3: ({node, ...props}) => <h3 {...props} className="text-lg font-semibold text-white mt-4 mb-2" />,
                    code: ({node, ...props}) => <code {...props} className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono text-xs" />,
                  }}
               >
                 {message.content}
               </ReactMarkdown>
             )}
          </div>

          {/* Sources Section */}
          {!isUser && !message.isThinking && message.sources && message.sources.length > 0 && (
            <div className="mt-3 w-full">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <i className="fas fa-link"></i> Verified Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all text-xs text-emerald-400 group max-w-[250px]"
                  >
                    <div className="bg-white/10 p-1 rounded-sm w-4 h-4 flex items-center justify-center">
                       <img 
                        src={`https://www.google.com/s2/favicons?domain=${new URL(source.uri).hostname}`} 
                        alt="favicon" 
                        className="w-3 h-3 opacity-70 group-hover:opacity-100" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="truncate">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};