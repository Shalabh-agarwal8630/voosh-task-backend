Got it 👍 — here are the **two complete README.md files** (backend + frontend) in one single response so you can copy them easily.

---

# 📄 `news-rag-backend/README.md`

```markdown
# 📰 News RAG Chatbot — Backend

Backend service for a Retrieval-Augmented Generation (RAG) powered chatbot built as part of the **Voosh Full Stack Developer Assignment**.  

It handles:
- News ingestion (~50 articles)
- Embedding + vector storage (Qdrant)
- Retrieval-Augmented Generation pipeline (Jina + Gemini)
- Session & message management
- Redis caching for performance

---

## 🚀 Tech Stack
- **Runtime:** Node.js, Express
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Cache / Sessions:** Redis (Upstash)
- **Vector Store:** Qdrant Cloud
- **Embeddings:** Jina AI Embeddings
- **LLM:** Google Gemini API
- **Hosting:** Render (Web Service)

---

## 📂 Project Structure
```

src/
config/       # Database, Redis, Qdrant configs
routes/       # Express routes: session, messages, news, chat
services/     # Embedding + RAG pipeline logic
scripts/        # Ingestion & embedding scripts
prisma/         # Prisma schema & migrations

````

---

## ⚙️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/news-rag-backend.git
cd news-rag-backend
npm install
````

### 2. Environment Variables

Create a `.env` file (never commit it) from `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>
REDIS_URL=rediss://default:<password>@<upstash-host>:6379
JINA_API_KEY=<your_jina_key>
QDRANT_URL=<your_qdrant_url>
QDRANT_API_KEY=<your_qdrant_api_key>
GEMINI_API_KEY=<your_gemini_api_key>
```

### 3. Database

```bash
npx prisma migrate dev --name init
```

### 4. Start Backend

```bash
npm run dev
```

Server will run at `http://localhost:3000`.

---

## 🔄 Scripts

* **Ingest News (\~50 articles):**

  ```bash
  node scripts/ingestNews.js
  ```

* **Embed & Store Articles in Qdrant:**

  ```bash
  node scripts/embedNews.js
  ```

---

## 📡 API Endpoints

### Sessions

* `POST /api/session/start` → start a new session
* `GET /api/session/:id` → fetch session history
* `DELETE /api/session/:id` → clear session

### Messages

* `POST /api/message/:sessionId` → add user/bot message
* `GET /api/message/:sessionId` → fetch messages

### News

* `POST /api/news` → add article
* `GET /api/news` → list all articles
* `GET /api/news/:id` → fetch single article
* `DELETE /api/news/:id` → delete article

### Chat (RAG)

* `POST /api/chat/:sessionId`

  * Input: `{ "query": "What is happening in US politics?" }`
  * Output: `{ "answer": "...", "messages": [...] }`

---

## 🧠 RAG Pipeline

1. **Ingest** news → store in Postgres.
2. **Embed** articles with Jina → store vectors in Qdrant.
3. **Retrieve** top-k relevant articles from Qdrant.
4. **Augment** prompt with retrieved passages.
5. **Generate** final response with Gemini.
6. **Cache** conversation history in Redis.

---

## 🚀 Deployment

1. Push repo to GitHub.
2. Deploy to **Render** as Web Service.
3. Set environment variables in Render dashboard.
4. Public backend available at `https://news-rag-backend.onrender.com`.

---

## 📜 License

MIT

````

---

# 📄 `news-rag-frontend/README.md`

```markdown
# 📰 News RAG Chatbot — Frontend

Frontend for the Retrieval-Augmented Generation (RAG) chatbot built as part of the **Voosh Full Stack Developer Assignment**.  

Provides a modern chat UI for users to query the backend RAG service.

---

## 🚀 Tech Stack
- **Framework:** React + TypeScript (Vite)
- **Styling:** SCSS
- **State:** LocalStorage for session persistence
- **API Integration:** REST calls to Express backend
- **Hosting:** Vercel

---

## 📂 Project Structure
````

src/
api/            # API helpers for backend calls
components/     # Chat UI components (ChatWindow, MessageBubble)
styles/         # SCSS styles
types.ts        # Shared types
App.tsx         # Root app
main.tsx        # Entry point

````

---

## ⚙️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/news-rag-frontend.git
cd news-rag-frontend
npm install
````

### 2. Environment Variables

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Frontend

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## ✨ Features

* Modern chat UI with **animations**.
* Auto-starts or resumes a session using **localStorage**.
* Displays user & bot messages with styled chat bubbles.
* **Reset button** → clears session locally and in backend.
* Smooth **fade-in** (chat window) and **pop-in** (messages).

---

## 📡 API Usage

The frontend interacts with backend routes:

* **Start session** → `POST /api/session/start`
* **Get history** → `GET /api/session/:id`
* **Send query** → `POST /api/chat/:sessionId`
* **Reset session** → `DELETE /api/session/:id`

---

## 🚀 Deployment

1. Push repo to GitHub.
2. Deploy to **Vercel**.
3. Set env var in Vercel:

   ```
   VITE_API_URL=https://news-rag-backend.onrender.com/api
   ```
4. Frontend will connect to the deployed backend.

---

## 📜 License

MIT

```

---

✅ Now you have **both full README files** in one place.  

Do you also want me to create a **CODE_WALKTHROUGH.md** file (for backend) that explains ingestion → embeddings → retrieval → caching → frontend integration? This is one of the deliverables Voosh explicitly asks for.
```
