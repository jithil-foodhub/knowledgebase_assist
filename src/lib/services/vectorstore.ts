import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { EmbeddingConfig, PineconeConfig } from '@/types';

/**
 * Initialize LangChain vector store with Pinecone
 */
export async function initializeVectorStore(
  embeddingConfig: EmbeddingConfig,
  pineconeConfig: PineconeConfig
): Promise<PineconeStore> {
  // Initialize OpenAI embeddings
  const embeddings = new OpenAIEmbeddings({
    apiKey: embeddingConfig.apiKey,
    modelName: embeddingConfig.model,
    dimensions: embeddingConfig.dimensions,
  });

  // Initialize Pinecone client
  const pinecone = new PineconeClient({
    apiKey: pineconeConfig.apiKey,
  });

  const pineconeIndex = pinecone.Index(pineconeConfig.indexName);

  // Create vector store from existing index
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5, // Process up to 5 batches concurrently
  });

  return vectorStore;
}

/**
 * Add documents to Pinecone vector store
 */
export async function addDocuments(
  vectorStore: PineconeStore,
  documents: Document[]
): Promise<string[]> {
  console.log(`Adding ${documents.length} documents to vector store...`);
  
  // LangChain handles chunking, embedding, and storage automatically
  const ids = await vectorStore.addDocuments(documents);
  
  console.log(`✓ Successfully added ${ids.length} documents to Pinecone`);
  return ids;
}

/**
 * Search for similar documents
 */
export async function similaritySearch(
  vectorStore: PineconeStore,
  query: string,
  k: number = 5,
  filter?: Record<string, any>
): Promise<Document[]> {
  return await vectorStore.similaritySearch(query, k, filter);
}

/**
 * Search for similar documents with scores
 */
export async function similaritySearchWithScore(
  vectorStore: PineconeStore,
  query: string,
  k: number = 5,
  filter?: Record<string, any>
): Promise<[Document, number][]> {
  return await vectorStore.similaritySearchWithScore(query, k, filter);
}

/**
 * Create a retriever for RAG chains
 */
export function createRetriever(
  vectorStore: PineconeStore,
  options?: {
    k?: number;
    filter?: Record<string, any>;
    searchType?: 'similarity' | 'mmr';
  }
) {
  return vectorStore.asRetriever({
    k: options?.k || 5,
    filter: options?.filter,
    searchType: options?.searchType || 'similarity',
  });
}

/**
 * Delete documents by IDs
 */
export async function deleteDocuments(
  pineconeConfig: PineconeConfig,
  ids: string[]
): Promise<void> {
  const pinecone = new PineconeClient({
    apiKey: pineconeConfig.apiKey,
  });

  const index = pinecone.Index(pineconeConfig.indexName);
  await index.deleteMany(ids);
  
  console.log(`✓ Deleted ${ids.length} documents from Pinecone`);
}

