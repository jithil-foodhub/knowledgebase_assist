import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { getPineconeConfig } from '@/lib/config';

interface SourceItem {
  url: string;
  title: string;
  chunksCount: number;
  lastUpdated: string;
}

/**
 * GET /api/sources
 * 
 * Retrieves all unique URLs that have been ingested into the knowledge base
 * by querying Pinecone metadata
 */
export async function GET() {
  try {
    const pineconeConfig = getPineconeConfig();
    
    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: pineconeConfig.apiKey,
    });

    const index = pinecone.Index(pineconeConfig.indexName);

    // Fetch all vectors with metadata (using a dummy query to get results)
    // We'll query with a zero vector to get random samples, then aggregate
    const queryResponse = await index.query({
      vector: new Array(1024).fill(0), // Dummy vector (adjust dimension if needed)
      topK: 10000, // Get as many as possible
      includeMetadata: true,
    });

    // Aggregate by source_url
    const sourcesMap = new Map<string, SourceItem>();

    if (queryResponse.matches) {
      for (const match of queryResponse.matches) {
        const metadata = match.metadata;
        if (metadata && metadata.source_url) {
          const url = metadata.source_url as string;
          
          if (sourcesMap.has(url)) {
            // Increment chunk count
            const existing = sourcesMap.get(url)!;
            existing.chunksCount += 1;
            
            // Update timestamp if newer
            if (metadata.updated_at && metadata.updated_at > existing.lastUpdated) {
              existing.lastUpdated = metadata.updated_at as string;
            }
          } else {
            // Add new source
            sourcesMap.set(url, {
              url,
              title: (metadata.title as string) || new URL(url).hostname,
              chunksCount: 1,
              lastUpdated: (metadata.updated_at as string) || new Date().toISOString(),
            });
          }
        }
      }
    }

    // Convert to array and sort by last updated (newest first)
    const sources = Array.from(sourcesMap.values()).sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );

    console.log(`📋 Found ${sources.length} unique sources in knowledge base`);

    return NextResponse.json({
      success: true,
      sources,
      count: sources.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching sources:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      message: `Failed to fetch sources: ${errorMessage}`,
      sources: [],
    }, { status: 500 });
  }
}

