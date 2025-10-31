'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SourceItem {
  url: string;
  title: string;
  chunksCount: number;
  lastUpdated: string;
}

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
  const [ingestedSources, setIngestedSources] = useState<SourceItem[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [reingestingUrl, setReingestingUrl] = useState<string | null>(null);

  // Fetch ingested sources on mount
  useEffect(() => {
    fetchIngestedSources();
  }, []);

  const fetchIngestedSources = async () => {
    setLoadingSources(true);
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      
      if (data.success) {
        setIngestedSources(data.sources || []);
        console.log('📋 Loaded', data.sources?.length || 0, 'ingested sources');
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoadingSources(false);
    }
  };

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
        // Refresh the ingested sources list
        fetchIngestedSources();
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

  const handleDelete = async (sourceUrl: string) => {
    if (!confirm(`Are you sure you want to delete this source?\n\n${sourceUrl}`)) {
      return;
    }

    setDeletingUrl(sourceUrl);
    try {
      const response = await fetch('/api/sources/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✓ Deleted:', sourceUrl);
        // Refresh the list
        fetchIngestedSources();
      } else {
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete source');
    } finally {
      setDeletingUrl(null);
    }
  };

  const handleReingest = async (sourceUrl: string) => {
    if (!confirm(`Re-ingest this source?\n\n${sourceUrl}\n\nThis will delete and re-add all content.`)) {
      return;
    }

    setReingestingUrl(sourceUrl);
    try {
      // Step 1: Delete existing
      const deleteResponse = await fetch('/api/sources/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl }),
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete existing source');
      }

      // Step 2: Re-ingest
      const ingestResponse = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl }),
      });

      const data = await ingestResponse.json();

      if (data.success) {
        console.log('✓ Re-ingested:', sourceUrl);
        // Refresh the list
        fetchIngestedSources();
      } else {
        alert(`Failed to re-ingest: ${data.message}`);
      }
    } catch (error) {
      console.error('Re-ingest error:', error);
      alert('Failed to re-ingest source');
    } finally {
      setReingestingUrl(null);
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

          {/* Recently Added (temporary status) */}
          {items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Added</h3>
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

          {/* Ingested Sources from Pinecone */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingested Sources</h3>
            
            {loadingSources ? (
              <div className="bg-white rounded-xl p-12 border-2 border-gray-200 text-center">
                <svg className="animate-spin h-8 w-8 text-[#d82d27] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-500">Loading sources...</p>
              </div>
            ) : ingestedSources.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border-2 border-gray-200 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                <p className="text-sm text-gray-500">No sources ingested yet</p>
                <p className="text-xs text-gray-400 mt-1">Add a URL above to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {ingestedSources.map((source, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-[#d82d27]/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#d82d27]/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#d82d27]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate mb-1">
                            {source.title}
                          </h4>
                          <p className="text-sm text-gray-500 truncate mb-2">{source.url}</p>
                          
                          {/* Stats */}
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className="inline-flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              {source.chunksCount} chunks
                            </span>
                            <span className="inline-flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {new Date(source.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Reingest Button */}
                        <button
                          onClick={() => handleReingest(source.url)}
                          disabled={reingestingUrl === source.url || deletingUrl === source.url}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#d82d27] hover:bg-[#d82d27]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Re-ingest"
                        >
                          {reingestingUrl === source.url ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(source.url)}
                          disabled={deletingUrl === source.url || reingestingUrl === source.url}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          {deletingUrl === source.url ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
