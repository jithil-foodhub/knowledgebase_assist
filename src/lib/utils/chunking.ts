import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

export interface ChunkOptions {
  maxTokens?: number;
  overlapPercent?: number;
}

/**
 * Create documents and split into chunks using LangChain's text splitter
 * 
 * @param text - The text to chunk
 * @param metadata - Metadata for the documents
 * @param options - Chunking options
 * @returns Array of LangChain Document objects with chunks
 */
export async function chunkText(
  text: string,
  metadata: Record<string, any>,
  options: ChunkOptions = {}
): Promise<Document[]> {
  const { maxTokens = 600, overlapPercent = 0.2 } = options;
  
  // Calculate overlap in characters (rough estimation: 1 token ≈ 4 characters)
  const chunkSize = maxTokens * 4;
  const chunkOverlap = Math.floor(chunkSize * overlapPercent);

  console.log(`Chunking text: ${text.length} characters, chunkSize: ${chunkSize}, overlap: ${chunkOverlap}`);

  // Initialize LangChain's RecursiveCharacterTextSplitter
  // This is smarter than our custom implementation - it respects document structure
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''], // Try these in order
    keepSeparator: false,
  });

  // Create documents with metadata
  const docs = await textSplitter.createDocuments([text], [metadata]);

  console.log(`✓ Created ${docs.length} chunks`);
  
  // Add chunk index to metadata
  docs.forEach((doc: Document, index: number) => {
    doc.metadata.chunk_index = index;
    doc.metadata.char_count = doc.pageContent.length;
    doc.metadata.updated_at = new Date().toISOString();
  });

  return docs;
}

/**
 * Split existing documents into chunks
 */
export async function splitDocuments(
  documents: Document[],
  options: ChunkOptions = {}
): Promise<Document[]> {
  const { maxTokens = 600, overlapPercent = 0.2 } = options;
  
  const chunkSize = maxTokens * 4;
  const chunkOverlap = Math.floor(chunkSize * overlapPercent);

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''],
  });

  const splitDocs = await textSplitter.splitDocuments(documents);
  
  console.log(`✓ Split ${documents.length} documents into ${splitDocs.length} chunks`);
  
  return splitDocs;
}
