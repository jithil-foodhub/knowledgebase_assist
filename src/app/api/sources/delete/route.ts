import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { getPineconeConfig } from '@/lib/config';

interface DeleteRequest {
  url: string;
}

/**
 * POST /api/sources/delete
 * 
 * Deletes all vectors associated with a specific URL from Pinecone
 */
export async function POST(request: NextRequest) {
  try {
    const body: DeleteRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      );
    }

    console.log(`\n🗑️  Deleting all vectors for URL: ${body.url}`);

    const pineconeConfig = getPineconeConfig();
    
    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: pineconeConfig.apiKey,
    });

    const index = pinecone.Index(pineconeConfig.indexName);

    // Delete all vectors with matching source_url metadata
    await index.deleteMany({
      source_url: body.url,
    });

    console.log(`✓ Successfully deleted all vectors for: ${body.url}`);

    return NextResponse.json({
      success: true,
      message: 'Source deleted successfully',
      url: body.url,
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting source:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      message: `Failed to delete source: ${errorMessage}`,
    }, { status: 500 });
  }
}

