# API Reference 📡

Complete API documentation for the Knowledge Base Assistant.

---

## Base URL

```
http://localhost:3000/api
```

---

## Endpoints Overview

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/health` | GET | Health check | ✅ |
| `/admin/ingest` | POST | Ingest URL | ✅ |
| `/search` | POST | Semantic search | ✅ NEW |
| `/chat` | POST | RAG Q&A | ✅ NEW |

---

## 1. Health Check

Check if the API is running and healthy.

### Request

```http
GET /api/health
```

### Response

```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "development"
}
```

### cURL Example

```bash
curl http://localhost:3000/api/health
```

---

## 2. Ingest Knowledge Base

Crawl a URL and add its content to the knowledge base.

### Request

```http
POST /api/admin/ingest
Content-Type: application/json
```

### Body

```json
{
  "url": "https://example.com/docs",
  "sourceName": "Example Documentation", // Optional
  "reindex": false // Optional
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Successfully ingested content using LangChain",
  "chunksProcessed": 42,
  "url": "https://example.com/docs"
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Ingestion failed: Invalid URL format",
  "url": "https://example.com/docs"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/admin/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "sourceName": "Example Docs"
  }'
```

### Notes

- The URL must be publicly accessible
- Content is automatically chunked using LangChain's RecursiveCharacterTextSplitter
- Embeddings are generated using OpenAI's `text-embedding-3-small`
- Vectors are stored in Pinecone with metadata

---

## 3. Semantic Search (NEW!)

Search the knowledge base using natural language.

### Request

```http
POST /api/search
Content-Type: application/json
```

### Body

```json
{
  "query": "machine learning concepts",
  "k": 5, // Optional, default: 5
  "filter": { // Optional
    "source_url": "https://example.com"
  }
}
```

### Response (Success)

```json
{
  "success": true,
  "results": [
    {
      "content": "Machine learning is a subset of artificial intelligence...",
      "metadata": {
        "source_url": "https://example.com/ml",
        "title": "Machine Learning Guide",
        "chunk_index": 0,
        "char_count": 450
      },
      "score": 0.9234
    },
    {
      "content": "Neural networks are inspired by biological neurons...",
      "metadata": {
        "source_url": "https://example.com/nn",
        "title": "Neural Networks",
        "chunk_index": 2,
        "char_count": 423
      },
      "score": 0.8876
    }
  ]
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Search failed: Query is required"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?",
    "k": 5
  }'
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | - | Natural language search query |
| `k` | number | ❌ No | 5 | Number of results to return (1-100) |
| `filter` | object | ❌ No | {} | Metadata filters (e.g., source_url) |

### Notes

- Uses cosine similarity for ranking
- Scores range from 0 to 1 (higher is better)
- Results are sorted by relevance (highest score first)
- Filters use Pinecone's metadata filtering

---

## 4. RAG Chat (NEW!)

Ask questions and get AI-generated answers based on your knowledge base.

### Request

```http
POST /api/chat
Content-Type: application/json
```

### Body

```json
{
  "question": "What are the main concepts in machine learning?",
  "k": 5, // Optional, default: 5
  "filter": { // Optional
    "source_url": "https://example.com"
  }
}
```

### Response (Success)

```json
{
  "success": true,
  "answer": "Based on the documentation, the main concepts in machine learning include supervised learning, unsupervised learning, neural networks, and deep learning. Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data. Neural networks are computational models inspired by biological neurons, and deep learning uses multiple layers to process complex patterns.",
  "sources": [
    {
      "content": "Machine learning is a subset of artificial intelligence...",
      "metadata": {
        "source_url": "https://example.com/ml",
        "title": "Machine Learning Guide",
        "chunk_index": 0
      }
    },
    {
      "content": "Neural networks are inspired by biological neurons...",
      "metadata": {
        "source_url": "https://example.com/nn",
        "title": "Neural Networks",
        "chunk_index": 2
      }
    }
  ]
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Chat failed: Question is required"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Explain machine learning in simple terms",
    "k": 5
  }'
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `question` | string | ✅ Yes | - | Question to ask about your knowledge base |
| `k` | number | ❌ No | 5 | Number of relevant docs to retrieve (1-20) |
| `filter` | object | ❌ No | {} | Metadata filters for retrieval |

### How It Works

1. **Retrieval**: Finds the `k` most relevant documents using semantic search
2. **Context Building**: Combines retrieved documents into context
3. **Generation**: Uses GPT-4o-mini to generate an answer based on context
4. **Source Attribution**: Returns the source documents used

### Notes

- Uses GPT-4o-mini for answer generation
- Temperature set to 0.7 for balanced creativity
- Will say "I don't know" if context doesn't contain the answer
- Sources are returned for transparency and verification

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing required fields or invalid format |
| 500 | Internal Server Error | Unexpected error during processing |

---

## Rate Limits

Currently no rate limits are enforced, but recommended limits:

- Ingestion: 10 requests/minute
- Search: 60 requests/minute  
- Chat: 30 requests/minute

---

## Authentication

Currently no authentication is required. For production, implement:

- API key authentication
- JWT tokens
- Rate limiting per user/key

---

## TypeScript SDK Example

```typescript
// types.ts
interface IngestRequest {
  url: string;
  sourceName?: string;
  reindex?: boolean;
}

interface SearchRequest {
  query: string;
  k?: number;
  filter?: Record<string, any>;
}

interface ChatRequest {
  question: string;
  k?: number;
  filter?: Record<string, any>;
}

// client.ts
class KnowledgeBaseClient {
  constructor(private baseUrl: string = 'http://localhost:3000/api') {}

  async ingest(request: IngestRequest) {
    const response = await fetch(`${this.baseUrl}/admin/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async search(request: SearchRequest) {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }

  async chat(request: ChatRequest) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }
}

// Usage
const client = new KnowledgeBaseClient();

// Ingest
await client.ingest({ url: 'https://example.com' });

// Search
const searchResults = await client.search({ 
  query: 'machine learning',
  k: 5
});

// Chat
const chatResponse = await client.chat({ 
  question: 'What is ML?',
  k: 5  
});
```

---

## Testing

### Postman Collection

Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Knowledge Base Assistant",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "Ingest URL",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/admin/ingest",
        "body": {
          "mode": "raw",
          "raw": "{\"url\":\"https://example.com\"}"
        }
      }
    },
    {
      "name": "Search",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/search",
        "body": {
          "mode": "raw",
          "raw": "{\"query\":\"test\",\"k\":5}"
        }
      }
    },
    {
      "name": "Chat",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/chat",
        "body": {
          "mode": "raw",
          "raw": "{\"question\":\"What is this about?\"}"
        }
      }
    }
  ]
}
```

---

## Troubleshooting

### Common Issues

**"OPENAI_API_KEY not found"**
- Check `.env.local` file exists
- Verify API key format starts with `sk-`
- Restart dev server after updating

**"Vector dimension mismatch"**
- Pinecone index dimensions must match `EMBEDDING_DIMENSIONS`
- Default: 1024 for `text-embedding-3-small`

**"Failed to crawl URL"**
- Ensure URL is publicly accessible
- Check if site blocks crawlers
- Verify URL format is correct

---

## Support

- Check [SETUP.md](./SETUP.md) for setup help
- Review [LANGCHAIN_MIGRATION.md](./LANGCHAIN_MIGRATION.md) for migration details
- See console logs for detailed error messages

---

Built with LangChain.js, Next.js, and TypeScript

