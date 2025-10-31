import { Document } from '@langchain/core/documents';

/**
 * Extract the most relevant sentences from a chunk
 * based on keyword overlap with the query
 */
export function extractRelevantSentences(
  doc: Document,
  query: string,
  maxSentences: number = 3
): string {
  const sentences = doc.pageContent
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20); // Filter out very short sentences

  if (sentences.length <= maxSentences) {
    return doc.pageContent;
  }

  // Simple keyword matching for sentence scoring
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const scoredSentences = sentences.map(sentence => {
    const sentenceLower = sentence.toLowerCase();
    const score = queryWords.filter(word => 
      sentenceLower.includes(word)
    ).length;
    
    return { sentence, score };
  });

  // Sort by score and take top N sentences, maintaining some order
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map(s => s.sentence);

  return topSentences.join('. ') + '.';
}

/**
 * Optimize context by extracting only relevant portions
 * Prioritizes most relevant chunks while staying under token limit
 */
export function optimizeContext(
  docs: Document[],
  query: string,
  maxTokens: number = 2000
): string {
  let context = '';
  let currentTokens = 0;

  for (const doc of docs) {
    // For highly relevant docs, include more content
    const relevantText = extractRelevantSentences(doc, query, 4);
    const tokens = Math.ceil(relevantText.length / 4); // Rough estimate: 1 token ≈ 4 chars
    
    if (currentTokens + tokens > maxTokens) {
      break; // Stop if we exceed token limit
    }
    
    const sourceTitle = doc.metadata.title || 'Unknown Source';
    context += `\n\n[Source: ${sourceTitle}]\n${relevantText}`;
    currentTokens += tokens;
  }

  return context.trim();
}

/**
 * Extract keywords from text using simple frequency analysis
 */
export function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it',
    'from', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can',
    'may', 'might', 'must', 'shall'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  
  // Count word frequency
  const wordFreq: Record<string, number> = {};
  words.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
  
  // Get top N words by frequency
  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
  
  return topWords;
}

/**
 * Calculate approximate token count for text
 * Uses a more accurate estimation than simple character division
 */
export function estimateTokenCount(text: string): number {
  // Average: 1 token ≈ 4 characters for English text
  // But punctuation and whitespace affect this
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;
  
  // Use a weighted average for better estimation
  return Math.ceil((charCount / 4 + wordCount) / 2);
}

