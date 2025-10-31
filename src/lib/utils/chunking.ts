import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { extractKeywords } from './text-processing';

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
    // Better separators that respect document structure
    separators: [
      '\n\n\n',      // Multiple blank lines (section breaks)
      '\n\n',        // Paragraph breaks
      '\n',          // Single line breaks
      '. ',          // Sentence endings
      '! ',
      '? ',
      '; ',          // Semicolons
      ': ',          // Colons (for lists)
      ', ',          // Commas
      ' ',           // Spaces
      '',            // Characters (last resort)
    ],
    keepSeparator: true,  // Keep separators for better context
    lengthFunction: (text: string) => {
      // More accurate token counting (rough: 1 token ≈ 4 chars for English)
      return Math.ceil(text.length / 4);
    },
  });

  // Create documents with metadata
  const docs = await textSplitter.createDocuments([text], [metadata]);

  console.log(`✓ Created ${docs.length} chunks`);
  
  // Add enhanced metadata to each chunk
  docs.forEach((doc: Document, index: number) => {
    doc.metadata.chunk_index = index;
    doc.metadata.chunk_total = docs.length;
    doc.metadata.char_count = doc.pageContent.length;
    doc.metadata.word_count = doc.pageContent.split(/\s+/).length;
    doc.metadata.updated_at = new Date().toISOString();
    
    // Extract first sentence as preview
    const firstSentence = doc.pageContent.split(/[.!?]/)[0]?.trim();
    doc.metadata.preview = firstSentence ? firstSentence.substring(0, 150) : '';
    
    // Calculate position in document (beginning, middle, end)
    const position = index / docs.length;
    if (position < 0.33) {
      doc.metadata.position = 'beginning';
    } else if (position > 0.66) {
      doc.metadata.position = 'end';
    } else {
      doc.metadata.position = 'middle';
    }
    
    // Extract key phrases (simple keyword extraction)
    const keywords = extractKeywords(doc.pageContent, 5);
    doc.metadata.keywords = keywords.join(', ');
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
