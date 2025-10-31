# Architecture Documentation

## 📁 Project Structure

```
app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── admin/
│   │   │   │   └── ingest/
│   │   │   │       └── route.ts      # Knowledge base ingestion endpoint
│   │   │   └── health/
│   │   │       └── route.ts          # Health check endpoint
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   │
│   ├── lib/                          # Reusable library code
│   │   ├── config/                   # Configuration management
│   │   │   └── index.ts              # Environment variable getters
│   │   ├── services/                 # Business logic services
│   │   │   ├── crawler.ts            # Web crawling
│   │   │   ├── embedding.ts          # OpenAI embeddings
│   │   │   ├── pinecone.ts           # Vector database
│   │   │   └── index.ts              # Service exports
│   │   ├── utils/                    # Utility functions
│   │   │   ├── chunking.ts           # Text chunking
│   │   │   └── index.ts              # Utility exports
│   │   └── README.md                 # Library documentation
│   │
│   └── types/                        # TypeScript type definitions
│       └── index.ts                  # Centralized types
│
├── public/                           # Static assets
├── env.example                       # Environment variables template
├── SETUP.md                          # Setup instructions
├── ARCHITECTURE.md                   # This file
└── package.json                      # Dependencies
```

## 🔄 Data Flow

### Knowledge Base Ingestion Flow

```
┌──────────────┐
│   User Input │
│   (URL)      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  API Route: /api/admin/ingest                        │
│  ────────────────────────────────                    │
│  1. Validate request                                 │
│  2. Get configuration (config)                       │
│  3. Orchestrate services                             │
└──────┬───────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Service: Crawler                                    │
│  ────────────────────────                            │
│  • Fetch URL with axios                              │
│  • Parse HTML with cheerio                           │
│  • Extract main content                              │
│  • Clean and normalize text                          │
└──────┬───────────────────────────────────────────────┘
       │
       │ CrawledContent { title, content, lastModified }
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Utility: Chunking                                   │
│  ────────────────────────                            │
│  • Split text into ~600 token chunks                 │
│  • Add 20% overlap between chunks                    │
│  • Break at sentence boundaries                      │
│  • Generate unique IDs                               │
└──────┬───────────────────────────────────────────────┘
       │
       │ TextChunk[] { id, text, metadata }
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Service: Embedding                                  │
│  ────────────────────────                            │
│  • Initialize OpenAI client                          │
│  • Process chunks in batches (100)                   │
│  • Generate vectors (1024 dimensions)                │
│  • Handle rate limiting                              │
└──────┬───────────────────────────────────────────────┘
       │
       │ TextChunk[] { id, text, embedding, metadata }
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  Service: Pinecone                                   │
│  ────────────────────────                            │
│  • Initialize Pinecone client                        │
│  • Prepare vector format                             │
│  • Upsert in batches (100)                           │
│  • Store with metadata                               │
└──────┬───────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   Success    │
│   Response   │
└──────────────┘
```

## 🧩 Module Responsibilities

### API Routes (`/src/app/api`)
- **Purpose**: HTTP endpoint handlers
- **Responsibilities**:
  - Request validation
  - Response formatting
  - Error handling
  - Service orchestration
- **Does NOT contain**: Business logic, external API calls

### Services (`/src/lib/services`)
- **Purpose**: Business logic and external integrations
- **Responsibilities**:
  - External API interactions (OpenAI, Pinecone)
  - Data transformations
  - Error handling and retries
- **Key Services**:
  - `crawler.ts` - Web scraping and content extraction
  - `embedding.ts` - Vector generation via OpenAI
  - `pinecone.ts` - Vector storage and retrieval

### Utils (`/src/lib/utils`)
- **Purpose**: Pure utility functions
- **Responsibilities**:
  - Data processing (chunking, cleaning)
  - No external dependencies
  - Stateless operations

### Config (`/src/lib/config`)
- **Purpose**: Configuration management
- **Responsibilities**:
  - Environment variable access
  - Configuration validation
  - Default values

### Types (`/src/types`)
- **Purpose**: TypeScript type definitions
- **Responsibilities**:
  - Interface definitions
  - Type exports
  - Type safety across modules

## 🔐 Configuration

All configuration is managed through environment variables:

```env
# OpenAI
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1024

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=knowledgebase-index

# Processing
CHUNK_SIZE=600
CHUNK_OVERLAP=0.2
```

Configuration is accessed via typed getters:
```typescript
import { getEmbeddingConfig, getPineconeConfig } from '@/lib/config';

const config = getEmbeddingConfig();
// Returns: { apiKey, model, dimensions }
```

## 🎯 Design Principles

### 1. Separation of Concerns
Each module has a single, well-defined responsibility:
- API routes handle HTTP
- Services handle business logic
- Utils handle data processing
- Config handles environment

### 2. Dependency Injection
Services receive configuration as parameters:
```typescript
await generateEmbeddings(chunks, config);
```
This makes testing and mocking easier.

### 3. Type Safety
All modules use TypeScript with strict types:
- Interfaces defined in `/types`
- No `any` types without justification
- Proper error typing

### 4. Error Handling
Consistent error handling pattern:
```typescript
try {
  // operation
} catch (error) {
  console.error('Context:', error);
  throw new Error(`Descriptive message: ${error.message}`);
}
```

### 5. Modularity
Services are independent and reusable:
- Can be used in different API routes
- Can be tested in isolation
- Can be replaced without affecting others

## 📊 Performance Considerations

### Batch Processing
- **Embeddings**: 100 chunks per batch
- **Pinecone**: 100 vectors per batch
- **Rate Limiting**: 100ms delay between batches

### Chunking Strategy
- **Size**: ~600 tokens (2400 characters)
- **Overlap**: 20% to preserve context
- **Boundary Detection**: Sentence and paragraph breaks

### Vector Dimensions
- **Default**: 1024 dimensions
- **Trade-off**: 35% smaller than 1536, minimal accuracy loss
- **Benefits**: Faster search, lower storage costs

## 🚀 Future Enhancements

### Planned Features
1. **Semantic Search API**
   - Query endpoint using `queryPinecone`
   - Similarity search across knowledge base
   
2. **Conversation API**
   - RAG (Retrieval Augmented Generation)
   - Context-aware responses
   
3. **Batch Ingestion**
   - Multiple URLs at once
   - Sitemap support
   
4. **Monitoring & Analytics**
   - Usage tracking
   - Performance metrics
   - Error reporting

### Scalability
The modular architecture supports:
- Adding new embedding providers (swap `embedding.ts`)
- Adding new vector databases (swap `pinecone.ts`)
- Adding new crawling strategies (extend `crawler.ts`)
- Horizontal scaling (stateless services)

## 🧪 Testing Strategy

### Unit Tests (Recommended)
```typescript
// Test individual services
import { chunkText } from '@/lib/utils';

describe('chunkText', () => {
  it('should create chunks with overlap', () => {
    const chunks = chunkText('test', 'title', 'url');
    expect(chunks).toHaveLength(1);
  });
});
```

### Integration Tests
```typescript
// Test service integration
import { crawlUrl } from '@/lib/services';

describe('crawlUrl', () => {
  it('should extract content from URL', async () => {
    const result = await crawlUrl('https://example.com');
    expect(result).toHaveProperty('title');
  });
});
```

## 📝 Code Style

### Import Organization
```typescript
// 1. Next.js and React
import { NextRequest } from 'next/server';

// 2. External libraries
import OpenAI from 'openai';

// 3. Internal modules
import { crawlUrl } from '@/lib/services';
import { TextChunk } from '@/types';
```

### Naming Conventions
- **Files**: kebab-case (`crawler.ts`, `chunk-text.ts`)
- **Functions**: camelCase (`crawlUrl`, `generateEmbeddings`)
- **Types**: PascalCase (`TextChunk`, `IngestRequest`)
- **Constants**: UPPER_SNAKE_CASE (`BATCH_SIZE`)

## 🔗 Related Documentation

- [Setup Guide](./SETUP.md) - Getting started
- [Library README](./src/lib/README.md) - Detailed module docs
- [Environment Variables](./env.example) - Configuration reference

