import { NextRequest, NextResponse } from 'next/server';
import { IngestRequest, IngestResponse } from '@/types';
import { crawlUrl, initializeVectorStore, addDocuments } from '@/lib/services';
import { chunkText } from '@/lib/utils';
import { getEmbeddingConfig, getPineconeConfig, getChunkConfig } from '@/lib/config';

/**
 * POST /api/admin/ingest
 * 
 * Ingest a URL into the knowledge base using LangChain:
 * 1. Crawl and extract content
 * 2. Chunk the content with LangChain's RecursiveCharacterTextSplitter
 * 3. Add documents to Pinecone (LangChain handles embedding + storage)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: IngestRequest = await request.json();
    
    // Validate URL
    if (!body.url) {
      return NextResponse.json(
        { success: false, message: 'URL is required', url: '' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format', url: body.url },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Starting ingestion for URL: ${body.url}`);

    // Get configuration
    const embeddingConfig = getEmbeddingConfig();
    const pineconeConfig = getPineconeConfig();
    const chunkConfig = getChunkConfig();

    // Step 1: Crawl the URL
    console.log('\n📥 Step 1: Crawling URL...');
    const crawlResult = await crawlUrl(body.url);
    console.log(`✓ Crawled content: ${crawlResult.content.length} characters`);
    console.log(`✓ Title: ${crawlResult.title}`);

    // Step 2: Chunk the content using LangChain
    console.log('\n✂️  Step 2: Chunking content with LangChain...');
    const documents = await chunkText(
      crawlResult.content,
      {
        source_url: body.url,
        title: crawlResult.title,
        source_name: body.sourceName || crawlResult.title,
        last_modified: crawlResult.lastModified,
      },
      chunkConfig
    );
    console.log(`✓ Created ${documents.length} document chunks`);

    if (documents.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No content could be extracted from the URL', url: body.url },
        { status: 400 }
      );
    }

    // Step 3: Initialize vector store and add documents
    // LangChain automatically handles embedding generation and Pinecone storage
    console.log('\n🧠 Step 3: Initializing vector store...');
    const vectorStore = await initializeVectorStore(embeddingConfig, pineconeConfig);

    console.log('\n💾 Step 4: Adding documents to Pinecone (with embeddings)...');
    const ids = await addDocuments(vectorStore, documents);

    // Success response
    const response: IngestResponse = {
      success: true,
      message: 'Successfully ingested content using LangChain',
      chunksProcessed: documents.length,
      url: body.url,
    };

    console.log(`\n✅ Ingestion complete! Processed ${documents.length} chunks\n`);
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('\n❌ Ingestion error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Ingestion failed: ${errorMessage}`,
        url: (await request.json().catch(() => ({})))?.url || ''
      },
      { status: 500 }
    );
  }
}
