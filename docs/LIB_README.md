# Library Structure (LangChain-Powered)

This directory contains reusable services, utilities, and configuration for the Knowledge Base Assistant application, now powered by **LangChain.js** for advanced RAG capabilities.

## Directory Structure

```
src/lib/
├── config/           # Configuration management
│   └── index.ts      # Environment variable getters
├── services/         # Business logic services
│   ├── crawler.ts    # Web crawling and content extraction
│   ├── vectorstore.ts # LangChain vector store operations
│   └── index.ts      # Service exports
└── utils/            # Utility functions
    ├── chunking.ts   # LangChain text splitters
    └── index.ts      # Utility exports
```

## What's New with LangChain? 🎉

We've replaced custom implementations with **LangChain.js** for:

✅ **Automatic embedding generation** - No manual API calls
✅ **Smart text chunking** - RecursiveCharacterTextSplitter respects document structure  
✅ **Built-in vector store integration** - PineconeStore handles everything
✅ **RAG chains** - Ready-to-use retrieval augmented generation
✅ **Type-safe Document objects** - Better TypeScript support

## Modules

### Config (`/config`)

Manages application configuration from environment variables:

- `getEmbeddingConfig()` - OpenAI embedding configuration
- `getPineconeConfig()` - Pinecone database configuration
- `getChunkConfig()` - Text chunking parameters

### Services (`/services`)

#### Crawler (`crawler.ts`)
```typescript
import { crawlUrl } from '@/lib/services';

const content = await crawlUrl('https://example.com');
// Returns: { title, content, lastModified }
```

#### Vector Store (`vectorstore.ts`) - **NEW! LangChain-powered**
```typescript
import {
  initializeVectorStore,
  addDocuments,
  similaritySearch,
  createRetriever,
} from '@/lib/services';

// Initialize LangChain vector store
const vectorStore = await initializeVectorStore(embeddingConfig, pineconeConfig);

// Add documents (embeddings generated automatically!)
const documents = [{ pageContent: 'text', metadata: { source: 'url' } }];
await addDocuments(vectorStore, documents);

// Semantic search
const results = await similaritySearch(vectorStore, 'query', 5);

// Create retriever for RAG chains
const retriever = createRetriever(vectorStore, { k: 5 });
```

### Utils (`/utils`)

#### Chunking (`chunking.ts`) - **NEW! LangChain RecursiveCharacterTextSplitter**
```typescript
import { chunkText } from '@/lib/utils';
import { Document } from '@/types';

// Smart chunking that respects document structure
const documents: Document[] = await chunkText(
  text,
  { source_url: url, title: 'Title' },
  { maxTokens: 600, overlapPercent: 0.2 }
);
```

## Usage Example

### Ingestion (Simplified with LangChain)

```typescript
import { crawlUrl, initializeVectorStore, addDocuments } from '@/lib/services';
import { chunkText } from '@/lib/utils';
import { getEmbeddingConfig, getPineconeConfig } from '@/lib/config';

// 1. Get configuration
const embeddingConfig = getEmbeddingConfig();
const pineconeConfig = getPineconeConfig();

// 2. Crawl content
const content = await crawlUrl('https://example.com');

// 3. Chunk with LangChain (smart splitting)
const documents = await chunkText(
  content.content,
  { source_url: 'https://example.com', title: content.title }
);

// 4. Initialize vector store
const vectorStore = await initializeVectorStore(embeddingConfig, pineconeConfig);

// 5. Add documents (embeddings + storage in one step!)
await addDocuments(vectorStore, documents);
```

### Retrieval & RAG

```typescript
import { initializeVectorStore, createRetriever } from '@/lib/services';
import { ChatOpenAI } from '@langchain/openai';

// Initialize
const vectorStore = await initializeVectorStore(config, pineconeConfig);
const retriever = createRetriever(vectorStore, { k: 5 });

// Retrieve similar documents
const docs = await retriever.invoke('What is mitochondria?');

// Use in RAG chain
const llm = new ChatOpenAI({ model: 'gpt-4o-mini' });
// ... build your RAG chain (see /api/chat/route.ts for example)
```

## Benefits of LangChain Integration

### Before (Custom Implementation)
```typescript
// 4 separate steps
const content = await crawlUrl(url);
const chunks = chunkText(content);
const withEmbeddings = await generateEmbeddings(chunks); // Manual API calls
await storeInPinecone(withEmbeddings); // Manual vector format
```

### After (LangChain)
```typescript
// 2 simple steps
const documents = await chunkText(content, metadata);
await addDocuments(vectorStore, documents); // Embeddings + storage automatic!
```

### Key Advantages

✅ **Less Code**: ~60% reduction in implementation code  
✅ **More Features**: RAG chains, retrievers, advanced search  
✅ **Better Chunking**: RecursiveCharacterTextSplitter respects structure  
✅ **Type Safety**: Full TypeScript support with Document types  
✅ **Battle-Tested**: Production-ready patterns from LangChain  
✅ **Extensible**: Easy to add more LangChain features  

## API Endpoints

### Ingestion
```
POST /api/admin/ingest
Body: { "url": "https://example.com" }
```
Crawls URL and stores in knowledge base with LangChain.

### Semantic Search
```
POST /api/search
Body: { "query": "search term", "k": 5 }
```
Returns similar documents with scores.

### RAG Chat (NEW!)
```
POST /api/chat
Body: { "question": "What is X?", "k": 5 }
```
AI-powered question answering using retrieved context.

## Adding New Features

### Example: Add Conversational Memory

```typescript
// src/lib/services/memory.ts
import { BufferMemory } from 'langchain/memory';

export function createMemory() {
  return new BufferMemory({
    returnMessages: true,
    memoryKey: 'chat_history',
  });
}
```

### Example: Add Custom Retriever

```typescript
// src/lib/services/retriever.ts
import { MultiQueryRetriever } from 'langchain/retrievers/multi_query';

export async function createMultiQueryRetriever(vectorStore, llm) {
  return MultiQueryRetriever.fromLLM({
    llm,
    retriever: vectorStore.asRetriever(),
  });
}
```

## Architecture Benefits

✅ **Separation of Concerns**: Each module has a single responsibility  
✅ **Testability**: Easy to unit test individual services  
✅ **Reusability**: Services can be used across different API routes  
✅ **Maintainability**: Changes are isolated to specific modules  
✅ **Type Safety**: Centralized types in `/types` directory  
✅ **Clean Imports**: Barrel exports via `index.ts` files  
✅ **LangChain-Ready**: Easy to add chains, agents, and tools  

## Further Reading

- [LangChain.js Documentation](https://js.langchain.com/)
- [Pinecone Vector Store Guide](https://js.langchain.com/docs/integrations/vectorstores/pinecone/)
- [RAG Tutorial](https://js.langchain.com/docs/tutorials/rag)
- [Project Architecture](../../ARCHITECTURE.md)
