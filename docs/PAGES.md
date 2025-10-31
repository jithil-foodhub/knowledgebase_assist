# Pages & Routes 📄

## Application Structure

The Knowledge Base Assistant now has a clean multi-page structure with dedicated pages for different functionalities.

---

## 🏠 Pages Overview

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing Page | Welcome page with navigation |
| `/knowledge-base` | Knowledge Base Manager | Add & manage knowledge sources |
| `/conversation` | Chat & Search | Query your knowledge base |

---

## 📄 Page Details

### 1. Landing Page (`/`)

**File**: `src/app/page.tsx`

**Features**:
- Hero section with value proposition
- Two main action cards:
  - 📚 Knowledge Base (navigates to `/knowledge-base`)
  - 💬 Start Conversation (navigates to `/conversation`)
- Technology stack showcase
- API endpoints overview
- Clean, modern gradient design

**User Flow**:
```
Landing Page
    ├─→ Knowledge Base (add content)
    └─→ Conversation (query content)
```

---

### 2. Knowledge Base Manager (`/knowledge-base`)

**File**: `src/app/knowledge-base/page.tsx`

**Features**:
- ✅ URL input form for ingesting new content
- ✅ Optional source name field
- ✅ Real-time ingestion status tracking
- ✅ Ingestion history with status indicators:
  - ✓ Completed (green)
  - ⟳ Processing (blue)
  - ✗ Error (red)
- ✅ Chunks processed counter
- ✅ Error messages display
- ✅ Navigation to Conversation page

**Usage**:
1. Enter a publicly accessible URL
2. Optionally provide a friendly name
3. Click "Add Knowledge Base"
4. Watch real-time progress
5. View ingestion history

**API Integration**:
- `POST /api/admin/ingest` - For URL ingestion

---

### 3. Conversation Page (`/conversation`)

**File**: `src/app/conversation/page.tsx`

**Features**:
- ✅ Dual Mode Interface:
  - 💬 **Chat Mode**: RAG-powered Q&A
  - 🔍 **Search Mode**: Semantic search
- ✅ Chat interface with message history
- ✅ Source attribution (shows where answers came from)
- ✅ Real-time streaming UI
- ✅ Loading indicators
- ✅ Clear chat functionality
- ✅ Keyboard shortcuts (Enter to send)

**Modes**:

#### Chat Mode (RAG)
- AI-powered question answering
- Uses GPT-4o-mini
- Returns natural language answers
- Shows source documents
- Example: "How do I integrate WhatsApp?"

#### Search Mode
- Semantic similarity search
- Returns relevant document chunks
- Shows similarity scores
- Multiple results ranked by relevance
- Example: "integration setup"

**API Integration**:
- `POST /api/chat` - RAG Q&A
- `POST /api/search` - Semantic search

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (`bg-blue-600`, `text-blue-600`)
- **Secondary**: Purple (`bg-purple-600`, `text-purple-600`)
- **Success**: Green (`bg-green-600`, `text-green-600`)
- **Error**: Red (`bg-red-600`, `text-red-600`)
- **Neutral**: Gray (`bg-gray-50` to `bg-gray-900`)

### Components
- Rounded corners: `rounded-lg`, `rounded-2xl`
- Shadows: `shadow-md`, `shadow-lg`, `shadow-2xl`
- Hover effects: `hover:shadow-2xl`, `hover:scale-110`
- Transitions: `transition-all duration-300`

---

## 🔄 Navigation Flow

```
┌─────────────────┐
│  Landing Page   │
│       (/)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐  ┌──────────┐
│ KB Mgmt │  │   Chat   │
│  (/kb)  │  │  (/conv) │
└────┬────┘  └────┬─────┘
     │            │
     └────────────┘
    Back to Home
```

### Navigation Elements
- **Header Back Button**: Returns to previous page
- **Cross-Page Links**: Direct navigation between pages
- **Clear Actions**: Prominent CTAs on each page

---

## 📱 Responsive Design

All pages are fully responsive:

- **Mobile**: Single column layout, stacked cards
- **Tablet**: Optimized spacing, 2-column grids where appropriate
- **Desktop**: Full-width layouts with max-width containers (max-w-4xl, max-w-6xl)

---

## 🎯 User Journeys

### Journey 1: First-Time User
1. Land on homepage
2. Click "Knowledge Base"
3. Add first URL
4. Wait for ingestion
5. Navigate to "Conversation"
6. Ask a question
7. Get AI-powered answer with sources

### Journey 2: Returning User
1. Land on homepage
2. Click "Start Conversation"
3. Toggle to Search mode
4. Search for specific topic
5. Review results with scores
6. Switch to Chat mode
7. Ask follow-up questions

### Journey 3: Content Manager
1. Navigate to Knowledge Base
2. Add multiple URLs
3. Monitor ingestion status
4. Review ingestion history
5. Check completion status
6. Test queries in Conversation

---

## 🔧 Page-Specific Features

### Knowledge Base Page
```typescript
interface KnowledgeBaseItem {
  url: string;
  sourceName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  chunksProcessed?: number;
  error?: string;
}
```

### Conversation Page
```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    content: string;
    metadata: Record<string, any>;
  }>;
}
```

---

## 🚀 Future Enhancements

### Potential New Pages
- `/dashboard` - Analytics and usage statistics
- `/settings` - Configuration and preferences
- `/history` - Conversation and search history
- `/documents` - Document management (PDFs, files)
- `/admin` - Admin panel for user management

### Potential Features
- [ ] File upload for PDFs/documents
- [ ] Batch URL ingestion
- [ ] Conversation history persistence
- [ ] Export conversations
- [ ] Keyboard shortcuts panel
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Voice input/output

---

## 📊 Page Performance

| Page | Load Time | Size | Static/Dynamic |
|------|-----------|------|----------------|
| `/` | Fast | Small | Static (SSG) |
| `/knowledge-base` | Fast | Medium | Static (SSG) |
| `/conversation` | Fast | Medium | Static (SSG) |

All pages use:
- **Static Generation (SSG)** for initial load
- **Client-Side Rendering** for interactivity
- **TailwindCSS** for styling (optimized, purged)

---

## 🎨 Screenshots & Examples

### Landing Page
- Clean hero section
- Two prominent action cards
- Technology showcase
- API endpoints reference

### Knowledge Base
- Simple form interface
- Real-time status updates
- Clear success/error states
- Ingestion history log

### Conversation
- ChatGPT-like interface
- Mode toggle (Chat/Search)
- Message bubbles
- Source citations
- Loading animations

---

## 🔗 Related Documentation

- [README.md](./README.md) - Project overview
- [API.md](./API.md) - API documentation
- [SETUP.md](./SETUP.md) - Setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

Built with ❤️ using Next.js 15, TailwindCSS, and LangChain.js


