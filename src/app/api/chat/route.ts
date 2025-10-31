import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { initializeVectorStore, createRetriever, similaritySearchWithScore } from '@/lib/services';
import { getEmbeddingConfig, getPineconeConfig, getRetrievalConfig, getCacheConfig } from '@/lib/config';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { queryCache, optimizeContext } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  question: string;
  chatHistory?: ChatMessage[];
  filter?: Record<string, any>;
  k?: number;
}

interface SourceInfo {
  title: string;
  url: string;
}

interface ChatResponse {
  success: boolean;
  answer?: string;
  sources?: SourceInfo[];
  message?: string;
  cached?: boolean;
  debug?: {
    docsRetrieved: number;
    docsAfterFiltering: number;
    avgScore?: number;
  };
}

/**
 * POST /api/chat
 * 
 * RAG-powered Q&A using LangChain's retrieval chain
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.question) {
      return NextResponse.json(
        { success: false, message: 'Question is required' },
        { status: 400 }
      );
    }

    console.log(`\n💬 Question: "${body.question}"`);

    // Get configuration
    const embeddingConfig = getEmbeddingConfig();
    const pineconeConfig = getPineconeConfig();
    const retrievalConfig = getRetrievalConfig();
    const cacheConfig = getCacheConfig();

    // Check cache first if enabled
    if (cacheConfig.enabled) {
      const cacheKey = `query:${body.question}:k=${body.k || 8}:filter=${JSON.stringify(body.filter || {})}`;
      const cachedResult = queryCache.get(cacheKey);

      if (cachedResult) {
        console.log('✅ Cache HIT - returning cached result');
        return NextResponse.json({ ...cachedResult, cached: true }, { status: 200 });
      }
      console.log('❌ Cache MISS - processing query');
    }

    // Initialize vector store
    const vectorStore = await initializeVectorStore(embeddingConfig, pineconeConfig);

    // Retrieve relevant documents with scores using MMR if enabled
    console.log('🔍 Retrieving relevant documents...');
    const k = body.k || 8;
    
    let relevantDocs: [any, number][];
    let docsWithScores: [any, number][];
    
    if (retrievalConfig.useMMR) {
      console.log(`🎯 Using MMR (fetchK=${retrievalConfig.mmrFetchK}, lambda=${retrievalConfig.mmrLambda})`);
      const retriever = createRetriever(vectorStore, {
        k,
        filter: body.filter,
        searchType: 'mmr',
        searchKwargs: {
          fetchK: retrievalConfig.mmrFetchK,
          lambda: retrievalConfig.mmrLambda,
        },
      });
      
      // For MMR, we need to get docs and then score them separately
      const docs = await retriever.invoke(body.question);
      
      // Get scores for the MMR results
      docsWithScores = await similaritySearchWithScore(
        vectorStore,
        body.question,
        k * 2, // Get more to find our MMR results
        body.filter
      );
      
      // Match MMR docs with their scores
      relevantDocs = docs.map(doc => {
        const match = docsWithScores.find(([d]: [any, number]) => d.pageContent === doc.pageContent);
        return match ? match : [doc, 0.5] as [any, number]; // Default score if not found
      });
    } else {
      // Use regular similarity search with scores
      docsWithScores = await similaritySearchWithScore(
        vectorStore,
        body.question,
        k,
        body.filter
      );
      relevantDocs = docsWithScores;
    }

    const initialDocCount = relevantDocs.length;
    console.log(`✓ Retrieved ${initialDocCount} documents`);

    // Filter by similarity threshold
    const filteredDocs = relevantDocs.filter(([doc, score]) => {
      const meetsThreshold = score >= retrievalConfig.similarityThreshold;
      if (meetsThreshold) {
        console.log(`  ✓ ${doc.metadata.title} (score: ${score.toFixed(3)})`);
      }
      return meetsThreshold;
    });

    // If no documents meet threshold, try with fallback
    let finalDocs = filteredDocs;
    if (filteredDocs.length === 0 && relevantDocs.length > 0) {
      console.log(`⚠️  No docs meet threshold ${retrievalConfig.similarityThreshold}, trying fallback ${retrievalConfig.fallbackThreshold}`);
      finalDocs = relevantDocs.filter(([doc, score]) => score >= retrievalConfig.fallbackThreshold);
    }

    // Extract just the documents (without scores)
    const docsOnly = finalDocs.map(([doc]) => doc);
    const avgScore = finalDocs.length > 0 
      ? finalDocs.reduce((sum, [, score]) => sum + score, 0) / finalDocs.length 
      : 0;

    console.log(`✓ After filtering: ${docsOnly.length} relevant documents (avg score: ${avgScore.toFixed(3)})`);

    // Initialize LLM with low temperature for factual responses
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.2, // Very low temperature to stick to facts
      apiKey: embeddingConfig.apiKey,
    });

    // Check if we have any relevant context
    if (docsOnly.length === 0) {
      console.log('⚠️  No relevant documents found in knowledge base');
      return NextResponse.json(
        {
          success: true,
          answer: "I couldn't find any relevant information in the knowledge base to answer your question. Please make sure the relevant content has been added first.",
          sources: [],
          debug: {
            docsRetrieved: initialDocCount,
            docsAfterFiltering: 0,
            avgScore: 0,
          },
        },
        { status: 200 }
      );
    }

    // Optimize context - extract only relevant portions
    console.log('📝 Optimizing context...');
    const context = optimizeContext(docsOnly, body.question, retrievalConfig.maxContextTokens);

    // Check if context is meaningful
    if (!context.trim()) {
      console.log('⚠️  Empty context after optimization');
      return NextResponse.json(
        {
          success: true,
          answer: "The retrieved documents don't contain sufficient information to answer your question. Please add more detailed content to the knowledge base.",
          sources: [],
          debug: {
            docsRetrieved: initialDocCount,
            docsAfterFiltering: docsOnly.length,
            avgScore,
          },
        },
        { status: 200 }
      );
    }

    // Build chat history context
    let chatHistoryText = '';
    if (body.chatHistory && body.chatHistory.length > 0) {
      // Only include last 6 messages (3 exchanges) for context
      const recentHistory = body.chatHistory.slice(-6);
      chatHistoryText = '\n\nPrevious Conversation:\n' + 
        recentHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    }

    // Create enhanced prompt with chain-of-thought reasoning
    const prompt = ChatPromptTemplate.fromTemplate(
      `You are the Foodhub Knowledge Base Assistant. You provide helpful, conversational answers using ONLY the knowledge base context provided.

CRITICAL RULES:
1. ONLY use information from the Knowledge Base Context below
2. DO NOT use external knowledge, assumptions, or information not in the context
3. First, think step-by-step internally (don't show this reasoning to the user):
   - What is the user asking?
   - What relevant information is in the context?
   - How can I best answer using only this information?
4. Then provide a clear, conversational response
5. If you need to reference previous conversation, use the chat history
6. If the answer is not in the context, explicitly say "I don't have that information in the knowledge base"
7. Be concise but thorough - focus on what matters most
8. Use natural language and maintain Foodhub's professional yet friendly tone

Knowledge Base Context:
{context}
{chatHistory}

Current Question: {question}

Think through the question, then provide your answer based ONLY on the knowledge base context above:`
    );

    // Create RAG chain
    const chain = RunnableSequence.from([
      {
        context: () => context,
        chatHistory: () => chatHistoryText,
        question: new RunnablePassthrough(),
      },
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    // Execute the chain
    console.log('🧠 Generating answer with RAG...');
    const answer = await chain.invoke(body.question);

    console.log(`✓ Answer generated\n`);

    // Extract unique sources with clean metadata
    const uniqueSourcesMap = new Map<string, SourceInfo>();
    docsOnly.forEach((doc) => {
      const url = doc.metadata.source_url;
      if (url && !uniqueSourcesMap.has(url)) {
        uniqueSourcesMap.set(url, {
          title: doc.metadata.title || new URL(url).hostname,
          url: url,
        });
      }
    });

    const cleanSources = Array.from(uniqueSourcesMap.values()).slice(0, 3);

    const response: ChatResponse = {
      success: true,
      answer: answer,
      sources: cleanSources,
      debug: {
        docsRetrieved: initialDocCount,
        docsAfterFiltering: docsOnly.length,
        avgScore,
      },
    };

    // Cache the response if caching is enabled
    if (cacheConfig.enabled) {
      const cacheKey = `query:${body.question}:k=${body.k || 8}:filter=${JSON.stringify(body.filter || {})}`;
      queryCache.set(cacheKey, response, cacheConfig.ttl);
      console.log(`💾 Cached response (TTL: ${cacheConfig.ttl}ms)`);
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Chat error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Chat failed: ${errorMessage}`
      },
      { status: 500 }
    );
  }
}

