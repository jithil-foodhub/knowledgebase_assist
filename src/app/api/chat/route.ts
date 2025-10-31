import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { initializeVectorStore, createRetriever } from '@/lib/services';
import { getEmbeddingConfig, getPineconeConfig } from '@/lib/config';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';

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

    // Initialize vector store and retriever
    const vectorStore = await initializeVectorStore(embeddingConfig, pineconeConfig);
    const retriever = createRetriever(vectorStore, {
      k: body.k || 5,
      filter: body.filter,
    });

    // Initialize LLM with low temperature for factual responses
    const llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.3, // Lower temperature to reduce hallucination and stick to facts
      apiKey: embeddingConfig.apiKey,
    });

    // Retrieve relevant documents
    console.log('🔍 Retrieving relevant documents...');
    const relevantDocs = await retriever.invoke(body.question);
    console.log(`✓ Found ${relevantDocs.length} relevant documents`);

    // Check if we have any relevant context
    if (relevantDocs.length === 0) {
      console.log('⚠️  No relevant documents found in knowledge base');
      return NextResponse.json(
        {
          success: true,
          answer: "I couldn't find any relevant information in the knowledge base to answer your question. Please make sure the relevant content has been added first.",
          sources: [],
        },
        { status: 200 }
      );
    }

    // Format context from documents
    const context = relevantDocs
      .map((doc) => doc.pageContent)
      .join('\n\n---\n\n');

    // Check if context is meaningful
    if (!context.trim()) {
      console.log('⚠️  Empty context from documents');
      return NextResponse.json(
        {
          success: true,
          answer: "The retrieved documents don't contain sufficient information to answer your question. Please add more detailed content to the knowledge base.",
          sources: [],
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

    // Create prompt template - STRICTLY LIMITED TO KNOWLEDGE BASE ONLY with chat context
    const prompt = ChatPromptTemplate.fromTemplate(
      `You are the Foodhub Knowledge Base Assistant. You provide helpful, conversational answers using ONLY the knowledge base context provided.

CRITICAL RULES:
1. ONLY use information from the Knowledge Base Context below
2. DO NOT use external knowledge or make assumptions
3. Be conversational and natural in your responses
4. If you need to reference previous conversation, use the chat history
5. If the answer is not in the context, say "I don't have that information in the knowledge base"
6. Provide clear, well-structured answers
7. Be concise but thorough

Knowledge Base Context:
{context}
{chatHistory}

Current Question: {question}

Provide a helpful answer based ONLY on the knowledge base context above:`
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
    relevantDocs.forEach((doc) => {
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
    };

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

