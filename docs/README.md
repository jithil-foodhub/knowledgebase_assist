# Knowledge Base Assistant 🤖

A powerful, LangChain-powered knowledge base system with RAG (Retrieval Augmented Generation) capabilities built on Next.js 15.

## ✨ Features

- 🔍 **Semantic Search**: Find relevant documents using natural language queries
- 💬 **RAG-Powered Q&A**: Ask questions and get AI-generated answers from your knowledge base
- 📚 **URL Ingestion**: Automatically crawl and process web pages
- 🧠 **Smart Chunking**: LangChain's RecursiveCharacterTextSplitter for optimal document splitting
- ⚡ **Vector Search**: Pinecone-powered similarity search
- 🎯 **Type-Safe**: Full TypeScript support
- 🏗️ **Modular Architecture**: Clean, maintainable codebase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Pinecone account and API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd knowledgebase_assist/app

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🌐 Pages

- **`/`** - Landing page with navigation
- **`/knowledge-base`** - Add and manage knowledge sources
- **`/conversation`** - Chat interface with RAG & search modes

See [PAGES.md](./PAGES.md) for detailed page documentation.

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide with troubleshooting
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
- **[LANGCHAIN_MIGRATION.md](./LANGCHAIN_MIGRATION.md)** - LangChain migration details
- **[src/lib/README.md](./src/lib/README.md)** - Library structure and usage

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **LLM Framework**: LangChain.js
- **Embeddings**: OpenAI `text-embedding-3-small`
- **Vector Database**: Pinecone
- **LLM**: OpenAI GPT-4o-mini (for chat)
- **Web Crawling**: Axios + Cheerio
- **Styling**: TailwindCSS

## 📡 API Endpoints

### Ingest Content
```bash
POST /api/admin/ingest
{
  "url": "https://example.com"
}
```

### Semantic Search
```bash
POST /api/search
{
  "query": "your search query",
  "k": 5
}
```

### RAG Chat
```bash
POST /api/chat
{
  "question": "What is X?",
  "k": 5
}
```

### Health Check
```bash
GET /api/health
```

## 🏗️ Project Structure

```
app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/
│   │   │   ├── admin/ingest/    # URL ingestion
│   │   │   ├── search/          # Semantic search
│   │   │   ├── chat/            # RAG Q&A
│   │   │   └── health/          # Health check
│   │   ├── page.tsx         # Landing page
│   │   └── layout.tsx       # Root layout
│   ├── lib/                 # Reusable modules
│   │   ├── config/          # Configuration
│   │   ├── services/        # Business logic
│   │   │   ├── crawler.ts       # Web crawling
│   │   │   └── vectorstore.ts   # LangChain vector store
│   │   └── utils/           # Utilities
│   │       └── chunking.ts      # Text splitting
│   └── types/               # TypeScript types
├── public/                  # Static assets
└── env.example              # Environment template
```

## 🔧 Configuration

Create `.env.local` with:

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

## 🎯 Usage Examples

### Ingest a Website

```typescript
const response = await fetch('/api/admin/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://docs.example.com' })
});
```

### Search Your Knowledge Base

```typescript
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    query: 'machine learning concepts',
    k: 5 
  })
});
```

### Ask Questions (RAG)

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    question: 'Explain the key concepts from the documentation',
    k: 5 
  })
});
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

### Environment Variables

Make sure to set all environment variables in your deployment platform:
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_INDEX_NAME`
- `EMBEDDING_MODEL`
- `EMBEDDING_DIMENSIONS`

## 🧪 Development

```bash
# Development server
npm run dev

# Build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 📊 Performance

- **Embedding Generation**: Batch processing (100 chunks)
- **Vector Dimensions**: 1024 (optimized for speed & cost)
- **Chunking**: ~600 tokens with 20% overlap
- **Build Time**: ~2-3 seconds

## 🔮 Future Enhancements

- [ ] Conversational memory for multi-turn dialogues
- [ ] Multi-query retrieval for better results
- [ ] Streaming responses for chat API
- [ ] Document deletion API
- [ ] Batch URL ingestion
- [ ] Sitemap support
- [ ] PDF and other document format support
- [ ] User authentication
- [ ] Rate limiting
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- [LangChain.js](https://js.langchain.com/) for the amazing LLM framework
- [Pinecone](https://www.pinecone.io/) for vector database
- [OpenAI](https://openai.com/) for embeddings and LLM
- [Next.js](https://nextjs.org/) for the React framework

## 📞 Support

For issues or questions:
1. Check [SETUP.md](./SETUP.md) for common issues
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system details
3. Check the console logs for detailed error messages

---

Built with ❤️ using LangChain.js, Next.js, and TypeScript
