<div align="center">

# Chat Assessment

Single-user ↔ assistant echo chat. **Next.js 14 + TypeScript** frontend + **Express** backend. Pure REST (no WebSockets / no DB). Multilingual, attachments, voice & TTS.

</div>

## 🚀 Core Features

| Area        | Capability                                                     |
| ----------- | -------------------------------------------------------------- |
| Messaging   | Echo assistant (≈2s simulated thinking) with in-memory history |
| Attachments | Images / docs / audio mirrored back                            |
| Audio       | Voice recording + playback; TTS (EN/AR auto-detect)            |
| UI          | RTL/LTR, themes, virtual scrolling, accessibility              |
| Settings    | LocalStorage (language, theme, font, feature toggles)          |

## 🛠 Stack

Frontend: Next.js 14, TypeScript, Tailwind, Context API  
Backend: Express + Multer (memory)  
No DB / No WebSockets / No ORM

## ⚙️ Quick Start

```bash
# Backend
cd backend && npm install && npm run dev   # http://localhost:4000

# Frontend (new terminal)
cd frontend && npm install && npm run dev  # http://localhost:3000
```

Optional: set `NEXT_PUBLIC_API_URL` (defaults to http://localhost:4000)

## 🧱 Architecture

```
server.js       # Bootstrap / CORS / health
routes/chat.js  # Routing only
controllers/    # Echo + CRUD
services/       # chatStore (Map in-memory)
utils/          # IDs, titles, thinking strings, attachments, delay
middleware/     # Multer (memory)
```

Echo Flow:

```
POST /api/chat -> delay(~2s) -> { userMessage, assistantMessage }
Assistant text: 'Echo: <original>' OR 'Echo: Attachment received'
Attachments mirrored; memory resets on restart.
```

Type boundaries:

```
lib/chatApi.ts   # HTTP client
lib/apiTypes.ts  # Transport DTOs
lib/types.ts     # UI/domain types
types/index.ts   # Re-export facade
```

Message shape: `{ id, text, sender: 'user' | 'assistant', attachments?, timestamp }`.

## 🔌 Key Endpoints

| Method | Path                                 | Purpose                    |
| ------ | ------------------------------------ | -------------------------- |
| GET    | /health                              | Basic health               |
| GET    | /api/chat/health                     | Scoped health              |
| GET    | /api/chat/title                      | Random title               |
| GET    | /api/chat/thinking                   | Random thinking text       |
| GET    | /api/chat/conversations              | List conversations         |
| GET    | /api/chat/conversations/:id          | Conversation detail        |
| POST   | /api/chat/conversations              | Create conversation        |
| DELETE | /api/chat/conversations/:id          | Delete conversation        |
| GET    | /api/chat/messages?conversationId=ID | Paginated messages         |
| POST   | /api/chat (multipart)                | Send message + attachments |

Quick test:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/chat/title
curl -X POST http://localhost:4000/api/chat/conversations -H 'Content-Type: application/json' -d '{"title":"Test"}'
```

## ✅ Status & Qualities

- Deterministic assistant (stable tests)
- Virtualized long histories
- Auto TTS language detection (EN/AR)
- Attachment mirroring
- Clear transport vs UI type separation

## ⚖️ Design Choices

- Context API (scope simplicity)
- In-memory only (requirement + speed)
- Echo pattern (pluggable future LLM)
- Memory uploads (fast, ephemeral)

## ⚙️ Performance

- Virtual scrolling (>1000 msgs)
- Code splitting & memoization
- Minimal over-fetching

## 🔐 Practices

- MIME & size validation
- CORS allowlist
- Input hygiene + safe rendering
- ARIA + keyboard accessibility

## 🧩 Quality

- ESLint / Prettier / strict TS
- Modular hooks & components
- Concise documentation

## ▶️ Run

Frontend: http://localhost:3000 | Backend: http://localhost:4000

## 🔮 Next Ideas

- Pluggable LLM (replace echo)
- Persistence layer (SQLite/Postgres)
- Streaming responses (SSE)
- Image thumbnail optimization
- Tests for chatStore & chatApi

---

Crafted for assessment: concise, deterministic, extensible.
