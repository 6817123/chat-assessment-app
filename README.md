# Chat Assessment – Real-Time Chat Application

A modern chat application built with **Next.js 14 (TypeScript)** and **Node.js/Express**, featuring real-time messaging, multilingual support, and advanced user experience features.

## 🚀 Features

- **Real-time messaging** with conversation history
- **File attachments**: images, documents, audio
- **Voice recording** with start/pause/resume/stop controls
- **Text-to-Speech (TTS)** with English & Arabic support
- **Multilingual interface** (English/Arabic) with RTL/LTR adaptation
- **Responsive design** optimized for desktop, tablet, and mobile
- **Dark/Light theme toggle** with system preference detection
- **Accessibility**: keyboard navigation + ARIA labels
- **Virtual scrolling** for large conversations (50+ messages)
- **Local settings**: theme, font, language, sound effects

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Context API
- **Backend**: Node.js, Express.js (in-memory store, no DB required)
- **Utilities**: Multer (file upload), MediaRecorder API (voice), Headless UI

## ⚙️ Setup

### Backend

```bash
cd backend
npm install
npm run dev
# runs on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# runs on http://localhost:3000
```

## 📦 Storage

- **Conversations & messages**: handled by backend (in-memory)
- **Settings (language, theme, font, toggles)**: stored in localStorage

## ✅ Assessment Coverage

- All **core requirements** fully implemented
- All **bonus features** (voice recording, TTS, file uploads, virtual scroll) completed
- Clean, production-ready codebase with responsive and accessible design

---

✦ This project was built as part of the technical assessment, focusing on delivering a polished, real-world chat experience with multilingual and accessibility support.
