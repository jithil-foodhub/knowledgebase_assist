'use client';

import { useState } from 'react';
import Link from 'next/link';

interface KnowledgeBaseItem {
  url: string;
  sourceName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  chunksProcessed?: number;
  error?: string;
}

export default function KnowledgeBasePage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);

  const handleAddKnowledgeBase = async () => {
    if (!url.trim()) return;

    const newItem: KnowledgeBaseItem = {
      url,
      sourceName: new URL(url).hostname,
      status: 'processing',
    };

    setItems([...items, newItem]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setItems(prev => prev.map(item => 
          item.url === url 
            ? { ...item, status: 'completed', chunksProcessed: data.chunksProcessed }
            : item
        ));
        setUrl('');
      } else {
        setItems(prev => prev.map(item => 
          item.url === url 
            ? { ...item, status: 'error', error: data.message }
            : item
        ));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setItems(prev => prev.map(item => 
        item.url === url 
          ? { ...item, status: 'error', error: errorMsg }
          : item
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#d82d27] shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center space-x-4">
          <Link href="/" className="text-white/80 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-white/50">|</span>
          <h1 className="text-xl font-bold text-white">Knowledge Base</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Knowledge Sources</h2>
            <p className="text-gray-600">Add URLs to build your knowledge base</p>
          </div>

          {/* Input Card */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="space-y-4">
              <input
                type="url"
                className="w-full px-5 py-4 text-gray-900 bg-white rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#d82d27] transition-all placeholder:text-gray-400"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKnowledgeBase()}
                disabled={isLoading}
              />
              <button
                onClick={handleAddKnowledgeBase}
                disabled={isLoading || !url.trim()}
                className="w-full px-6 py-4 rounded-xl transition-all font-semibold bg-[#d82d27] text-white hover:bg-[#b02120] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : (
                  'Add Source'
                )}
              </button>
            </div>
          </div>

          {/* History */}
          {items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Added Sources</h3>
              <div className="grid gap-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#d82d27]/30 transition-all"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#d82d27]/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#d82d27]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 truncate mb-1">
                          {item.sourceName}
                        </h4>
                        <p className="text-sm text-gray-500 truncate mb-3">{item.url}</p>
                        
                        {/* Status */}
                        <div className="flex items-center space-x-3">
                          {item.status === 'completed' && (
                            <>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Completed
                              </span>
                              {item.chunksProcessed && (
                                <span className="text-xs text-gray-500">
                                  {item.chunksProcessed} chunks indexed
                                </span>
                              )}
                            </>
                          )}
                          {item.status === 'processing' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                              <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Error
                            </span>
                          )}
                        </div>
                        
                        {/* Error Message */}
                        {item.error && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-700">{item.error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
