import { EmbeddingConfig, PineconeConfig } from '@/types';

/**
 * Get embedding configuration from environment variables
 */
export function getEmbeddingConfig(): EmbeddingConfig {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found. Please add it to your .env.local file');
  }

  return {
    apiKey,
    model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
    dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS || '1024'),
  };
}

/**
 * Get Pinecone configuration from environment variables
 */
export function getPineconeConfig(): PineconeConfig {
  const apiKey = process.env.PINECONE_API_KEY;
  
  if (!apiKey) {
    throw new Error('PINECONE_API_KEY not found. Please add it to your .env.local file');
  }

  return {
    apiKey,
    indexName: process.env.PINECONE_INDEX_NAME || 'knowledgebase-index',
  };
}

/**
 * Get chunking configuration
 */
export function getChunkConfig() {
  return {
    maxTokens: parseInt(process.env.CHUNK_SIZE || '600'),
    overlapPercent: parseFloat(process.env.CHUNK_OVERLAP || '0.2'),
  };
}

/**
 * Get retrieval configuration
 */
export function getRetrievalConfig() {
  return {
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7'),
    fallbackThreshold: parseFloat(process.env.FALLBACK_THRESHOLD || '0.5'),
    useMMR: process.env.USE_MMR === 'true',
    mmrFetchK: parseInt(process.env.MMR_FETCH_K || '20'),
    mmrLambda: parseFloat(process.env.MMR_LAMBDA || '0.5'),
    maxContextTokens: parseInt(process.env.MAX_CONTEXT_TOKENS || '2000'),
  };
}

/**
 * Get cache configuration
 */
export function getCacheConfig() {
  return {
    enabled: process.env.CACHE_ENABLED !== 'false', // Enabled by default
    ttl: parseInt(process.env.QUERY_CACHE_TTL || '300000'), // 5 minutes
    maxSize: parseInt(process.env.QUERY_CACHE_SIZE || '50'),
  };
}

