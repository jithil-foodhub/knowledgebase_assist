# Setup Guide

## Overview

This application uses **LangChain.js** with OpenAI embeddings and Pinecone vector storage to build a powerful RAG-enabled knowledge base system.

## Quick Start

### 1. Create `.env.local` file

Copy the `env.example` file to `.env.local`:

```bash
cp env.example .env.local
```

### 2. Get Required API Keys

#### OpenAI API Key (Required)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy the key and add it to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-...your-openai-key...
   ```

#### Pinecone API Key (Required)

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Sign up or log in (free tier available)
3. Create a new API key
4. Copy the key and add it to `.env.local`:
   ```env
   PINECONE_API_KEY=your-pinecone-key-here
   ```

### 3. Create Pinecone Index

Before ingesting content, you need to create a Pinecone index:

1. Log into [Pinecone Console](https://app.pinecone.io/)
2. Click "Create Index"
3. Configure:
   - **Name**: `knowledgebase-index` (or update `PINECONE_INDEX_NAME` in `.env.local`)
   - **Dimensions**: `1024` (recommended for `text-embedding-3-small`)
   - **Metric**: `cosine`
   - **Region**: Choose the one closest to your location
4. Click "Create Index"

**Important**: The dimension size in Pinecone must match the `EMBEDDING_DIMENSIONS` setting:

#### Supported Dimensions by Model:
- `text-embedding-3-small`: 512, **1024** (recommended), or 1536
- `text-embedding-3-large`: 256, 1024, or 3072
- `text-embedding-ada-002`: 1536 only (no custom dimensions)

**Recommendation**: Use **1024 dimensions** with `text-embedding-3-small` for the best balance of performance, cost, and accuracy.

## Configuration

Your `.env.local` file should look like this:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-...

# Pinecone Configuration
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=knowledgebase-index

# Application Settings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1024
CHUNK_SIZE=600
CHUNK_OVERLAP=0.2
```

### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | **Required** |
| `PINECONE_API_KEY` | Your Pinecone API key | **Required** |
| `PINECONE_INDEX_NAME` | Name of your Pinecone index | `knowledgebase-index` |
| `EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-3-small` |
| `EMBEDDING_DIMENSIONS` | Vector dimensions (must match Pinecone) | `1024` |
| `CHUNK_SIZE` | Maximum tokens per chunk | `600` |
| `CHUNK_OVERLAP` | Overlap between chunks (0-1) | `0.2` |

### Available Embedding Models

| Model | Supported Dimensions | Recommended | Cost |
|-------|---------------------|-------------|------|
| `text-embedding-3-small` | 512, 1024, 1536 | **1024** | $ |
| `text-embedding-3-large` | 256, 1024, 3072 | 1024 | $$$ |
| `text-embedding-ada-002` | 1536 (fixed) | 1536 | $$ |

**Note**: Lower dimensions = faster & cheaper, with minimal accuracy loss for most use cases.

## Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Testing the Setup

### 1. Health Check

Test that the server is running:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T...",
  "version": "1.0.0",
  "uptime": 42,
  "environment": "development"
}
```

### 2. Ingest a Knowledge Base

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click **"Add Knowledge-Base"**
3. Enter a URL (e.g., `https://docs.example.com`)
4. Click **"Add Knowledge Base"**

The system will:
- Crawl the URL
- Extract and clean the content
- Split into chunks
- Generate embeddings via OpenAI
- Store in Pinecone

## Troubleshooting

### "OPENAI_API_KEY not found"

**Cause**: Missing or incorrect API key in `.env.local`

**Solution**:
1. Ensure `.env.local` exists in the `app/` directory
2. Check that the key starts with `sk-`
3. Restart the dev server after updating `.env.local`

### "API request failed with status 401"

**Cause**: Invalid OpenAI API key

**Solution**:
1. Verify your API key at [OpenAI Platform](https://platform.openai.com/api-keys)
2. Check that your OpenAI account has credits
3. Generate a new API key if needed

### "API request failed with status 429"

**Cause**: Rate limit exceeded

**Solution**:
- Wait a few moments and try again
- Reduce `CHUNK_SIZE` to send fewer requests
- Check your OpenAI usage limits

### "Pinecone configuration missing"

**Cause**: Missing Pinecone credentials

**Solution**:
1. Ensure `PINECONE_API_KEY` is set in `.env.local`
2. Verify the index name matches `PINECONE_INDEX_NAME`
3. Check that the index exists in Pinecone Console

### "Vector dimension X does not match the dimension of the index Y"

**Cause**: Mismatch between embedding dimensions and Pinecone index dimensions

**Solution**:
1. Check your Pinecone index dimensions in the [Pinecone Console](https://app.pinecone.io/)
2. Update `EMBEDDING_DIMENSIONS` in `.env.local` to match your Pinecone index
3. Or, recreate your Pinecone index with the dimensions you want to use
4. Common combinations:
   - Index: 1024 dims → `EMBEDDING_DIMENSIONS=1024`
   - Index: 1536 dims → `EMBEDDING_DIMENSIONS=1536`

### "Failed to crawl URL"

**Cause**: URL not accessible or blocked

**Solution**:
1. Verify the URL is publicly accessible
2. Check if the site blocks automated crawlers
3. Try a different URL to test

## Architecture

### Data Flow

1. **URL Input** → User provides a URL via the web interface
2. **Crawling** → Fetch HTML content using axios
3. **Extraction** → Parse and extract main content using cheerio
4. **Cleaning** → Remove scripts, styles, and normalize text
5. **Chunking** → Split into ~600 token chunks with 20% overlap
6. **Embedding** → Generate vectors using OpenAI API
7. **Storage** → Store vectors in Pinecone with metadata

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **LLM Framework**: LangChain.js
- **Embedding**: OpenAI (via `@langchain/openai`)
- **Vector DB**: Pinecone (via `@langchain/pinecone`)
- **Text Splitting**: RecursiveCharacterTextSplitter (`@langchain/textsplitters`)
- **Crawling**: axios + cheerio

## Next Steps

Once setup is complete, you can:
- ✅ Add multiple knowledge base URLs  
- ✅ Use semantic search API (`/api/search`)  
- ✅ Use RAG-powered Q&A API (`/api/chat`)  
- 🔄 Build conversation features with memory  
- 🤖 Create AI agents using LangChain  

## API Documentation

### Health Check

```
GET /api/health
```

Returns server health status.

### Ingest Knowledge Base

```
POST /api/admin/ingest
Content-Type: application/json

{
  "url": "https://example.com/docs",
  "sourceName": "Example Docs",
  "reindex": false
}
```

Crawls the URL and stores content in the knowledge base using LangChain.

### Semantic Search (NEW!)

```
POST /api/search
Content-Type: application/json

{
  "query": "search term",
  "k": 5,
  "filter": { "source_url": "https://example.com" }
}
```

Performs semantic search and returns similar documents with scores.

### RAG Chat (NEW!)

```
POST /api/chat
Content-Type: application/json

{
  "question": "What is X?",
  "k": 5,
  "filter": { "source_url": "https://example.com" }
}
```

AI-powered question answering using retrieved context from your knowledge base.

## Support

For issues or questions:
1. Check the error logs in your terminal
2. Verify all environment variables are set correctly
3. Test with the health check endpoint first
4. Ensure your API keys have sufficient credits
