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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-500 hover:text-foodhub-red transition-colors duration-200 flex items-center space-x-2 group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Knowledge Base</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Input Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <input
                type="url"
                className="w-full px-5 py-4 text-gray-900 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-foodhub-red focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
                placeholder="Enter URL to add"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKnowledgeBase()}
                disabled={isLoading}
              />
              <button
                onClick={handleAddKnowledgeBase}
                disabled={isLoading || !url.trim()}
                className="w-full px-6 py-4 rounded-2xl transition-all duration-200 font-semibold shadow-sm hover:shadow-md bg-foodhub-red enabled:text-white hover:bg-foodhub-red-dark disabled:bg-gray-200 disabled:text-gray-900 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2 text-white">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold text-white">Processing</span>
                  </span>
                ) : (
                  <span className="font-semibold">Add Source</span>
                )}
              </button>
            </div>
          </div>

          {/* History */}
          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center space-x-3">
                        {item.status === 'completed' && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {item.status === 'processing' && (
                          <svg className="flex-shrink-0 w-5 h-5 text-foodhub-red animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {item.status === 'error' && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-900 truncate">{item.sourceName}</p>
                        {item.chunksProcessed && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {item.chunksProcessed} chunks
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate pl-8">{item.url}</p>
                      {item.error && (
                        <p className="text-xs text-red-600 pl-8">{item.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 py-5 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Foodhub</p>
        </div>
      </footer>
    </div>
  );
}
