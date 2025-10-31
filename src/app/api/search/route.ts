import { NextRequest, NextResponse } from 'next/server';
import { initializeVectorStore, similaritySearchWithScore } from '@/lib/services';
import { getEmbeddingConfig, getPineconeConfig } from '@/lib/config';

interface SearchRequest {
  query: string;
  k?: number;
  filter?: Record<string, any>;
}

interface SearchResponse {
  success: boolean;
  results?: Array<{
    content: string;
    metadata: Record<string, any>;
    score: number;
  }>;
  message?: string;
}

/**
 * POST /api/search
 * 
 * Semantic search across the knowledge base using LangChain
 */
export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    
    if (!body.query) {
      return NextResponse.json(
        { success: false, message: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`\n🔍 Searching for: "${body.query}"`);

    // Get configuration
    const embeddingConfig = getEmbeddingConfig();
    const pineconeConfig = getPineconeConfig();

    // Initialize vector store
    const vectorStore = await initializeVectorStore(embeddingConfig, pineconeConfig);

    // Perform similarity search
    const results = await similaritySearchWithScore(
      vectorStore,
      body.query,
      body.k || 5,
      body.filter
    );

    // Format results
    const formattedResults = results.map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score: score,
    }));

    console.log(`✓ Found ${formattedResults.length} results\n`);

    const response: SearchResponse = {
      success: true,
      results: formattedResults,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Search error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Search failed: ${errorMessage}`
      },
      { status: 500 }
    );
  }
}

