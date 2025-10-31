'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface SourceInfo {
  title: string;
  url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceInfo[];
}

export default function ConversationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('foodhub_chat_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setMessages(parsed);
        console.log('📂 Loaded chat history:', parsed.length, 'messages');
      } catch (error) {
        console.error('❌ Failed to load chat history:', error);
        localStorage.removeItem('foodhub_chat_history'); // Clear corrupted data
      }
    }
  }, []); // Empty array = runs once on mount

  // Save conversation history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('foodhub_chat_history', JSON.stringify(messages));
        console.log('💾 Saved chat history:', messages.length, 'messages');
      } catch (error) {
        console.error('❌ Failed to save chat history:', error);
      }
    }
  }, [messages]); // Runs whenever messages array changes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send chat history for context (last 10 messages)
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage.content, 
          chatHistory,
          k: 5 
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${data.message}`,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-400 hover:text-foodhub-red transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Foodhub Assistant</h1>
              <p className="text-xs text-gray-500">Knowledge Base Search</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                localStorage.removeItem('foodhub_chat_history');
                console.log('🗑️  Chat history cleared');
              }}
              className="text-xs text-gray-400 hover:text-foodhub-red transition-colors duration-200 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              Clear Chat
            </button>
          )}
        </div>
      </header>

      {/* Messages Area - Scrollable */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3 px-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-foodhub-red/10 to-foodhub-orange/10 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-foodhub-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm font-light">Ask me anything about your knowledge base</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* AI Avatar */}
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-foodhub-red to-foodhub-orange flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                )}

                 {/* Message Bubble */}
                 <div
                   className={`max-w-2xl rounded-2xl px-4 py-3 ${
                     message.role === 'user'
                       ? 'bg-gray-100 rounded-tr-sm border border-gray-200'
                       : 'bg-white border border-gray-200 rounded-tl-sm shadow-sm'
                   }`}
                 >
                   <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
                     {message.content}
                   </p>
                  
                   {message.sources && message.sources.length > 0 && (
                     <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                       <p className="text-xs font-bold text-gray-900 mb-2">Sources:</p>
                       {message.sources.map((source, idx) => (
                         <a
                           key={idx}
                           href={source.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-start text-xs text-gray-700 hover:text-foodhub-red transition-colors duration-200"
                         >
                           <span className="inline-block w-1.5 h-1.5 rounded-full bg-foodhub-red mr-2 mt-1.5 flex-shrink-0"></span>
                           <span className="break-all">{source.title}</span>
                         </a>
                       ))}
                     </div>
                   )}
                </div>

                 {/* User Avatar */}
                 {message.role === 'user' && (
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-3 mt-1">
                     <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                     </svg>
                   </div>
                 )}
              </div>
            ))}

             {isLoading && (
               <div className="flex justify-start">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-foodhub-red to-foodhub-orange flex items-center justify-center mr-3 mt-1">
                   <span className="text-white text-xs font-bold">AI</span>
                 </div>
                 <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
                   <div className="flex items-center space-x-2">
                     <svg className="w-5 h-5 text-foodhub-red animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span className="text-sm text-gray-600 font-medium">Searching knowledge base...</span>
                   </div>
                 </div>
               </div>
             )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area - Fixed */}
      <footer className="flex-shrink-0 border-t border-gray-200 bg-white shadow-lg">
        <div className="px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-end space-x-3">
            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-foodhub-red transition-colors duration-200">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-400 text-sm resize-none"
                disabled={isLoading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '44px';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 w-11 h-11 bg-foodhub-red text-white rounded-xl hover:bg-foodhub-red-dark disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 shadow-sm disabled:text-gray-400 flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
