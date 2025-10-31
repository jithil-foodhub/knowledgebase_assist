// Re-export LangChain Document type
export type { Document } from '@langchain/core/documents';

// API Request/Response types
export interface IngestRequest {
  url: string;
  sourceName?: string;
  reindex?: boolean;
}

export interface IngestResponse {
  success: boolean;
  message: string;
  chunksProcessed?: number;
  url: string;
}

// Content types
export interface CrawledContent {
  title: string;
  content: string;
  lastModified: string;
}

export interface TextChunk {
  id: string;
  text: string;
  index: number;
  charCount: number;
  embedding?: number[];
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  source_url: string;
  title: string;
  chunk_index: number;
  updated_at: string;
  section?: string;
}

// Embedding configuration
export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  apiKey: string;
}

// Pinecone configuration
export interface PineconeConfig {
  apiKey: string;
  indexName: string;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  environment: string;
}

