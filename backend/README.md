# MoneyMind — Backend

The backend is a Flask REST API that powers the MoneyMind chat assistant. It authenticates requests with Firebase, stores chat sessions and messages in Firestore, and generates AI responses with Google's Gemini model using a finance-focused system prompt.

## Features

- 🔐 Firebase ID token verification on every protected route
- 💬 Multi-session chat support: list, create, rename, and delete sessions per user
- 🧠 Gemini-powered responses scoped to finance topics (personal finance, investing, crypto, business/corporate finance, banking, and scam awareness), with built-in guardrails against giving specific financial/investment advice
- 🗃️ Per-user chat history persisted in Firestore, with auto-generated session titles based on the first message
- 🌍 Configurable CORS for your frontend's origin(s)

## Tech stack

- [Python](https://www.python.org/) + [Flask](https://flask.palletsprojects.com/)
- [Flask-CORS](https://flask-cors.readthedocs.io/) — cross-origin request handling
- [google-generativeai](https://pypi.org/project/google-generativeai/) — Gemini API client
- [firebase-admin](https://firebase.google.com/docs/admin/setup) — token verification + Firestore access
- [python-dotenv](https://pypi.org/project/python-dotenv/) — local `.env` loading
- [Gunicorn](https://gunicorn.org/) — production WSGI server

## Project structure

```
backend/
├── main.py             # App factory, Firebase/Gemini init, routes, auth middleware
├── requirements.txt    # Python dependencies
└── README.md           # You are here
```

## Prerequisites

- Python 3.9+
- A Firebase project with:
  - **Authentication** enabled (so the frontend can issue ID tokens)
  - **Firestore** enabled (native mode)
  - A **service account** with Firebase Admin access
- A **Google Gemini API key** ([Google AI Studio](https://aistudio.google.com/))

## Setup

1. **Navigate to this directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv venv
   ```

   - macOS/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables.**

   Create a `.env` file in `backend/` (keep this out of version control):

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/firebase-service-account.json
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   PORT=5001
   FLASK_DEBUG=True
   ```

   | Variable | Description |
   |---|---|
   | `GEMINI_API_KEY` | API key for Google Gemini. Without it, AI responses are disabled. |
   | `GOOGLE_APPLICATION_CREDENTIALS` | Path to a Firebase service account JSON key, used to initialize the Firebase Admin SDK and access Firestore. If omitted, the app falls back to Application Default Credentials (useful when deployed on Google infrastructure). |
   | `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins, e.g. `http://localhost:5173,https://your-app.vercel.app`. Defaults to `http://localhost:5173,http://localhost:3000` if unset. |
   | `PORT` | Port the Flask app listens on. Defaults to `5001`. |
   | `FLASK_DEBUG` | Set to `True` for local development (enables debug mode/auto-reload). Should be `False` in production. |

5. **Run the server:**

   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:5001` (or whatever `PORT` you set).

## API reference

All routes below are prefixed with `/api`. Every route except `/api/hello` requires an `Authorization: Bearer <Firebase ID token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hello` | Health check, no auth required |
| `GET` | `/api/chats` | List all chat sessions for the authenticated user |
| `POST` | `/api/chats` | Create a new chat session |
| `GET` | `/api/chats/<chat_id>/history` | Fetch message history for a session |
| `POST` | `/api/chats/<chat_id>/message` | Send a prompt and receive a Gemini-generated response |
| `PUT` | `/api/chats/<chat_id>/rename` | Rename a chat session (body: `{ "title": "..." }`) |
| `DELETE` | `/api/chats/<chat_id>` | Delete a chat session and all of its messages |

**Sending a message** (`POST /api/chats/<chat_id>/message`) expects a JSON body:

```json
{
  "prompt": "What's the difference between a Roth and Traditional IRA?",
  "history": [
    { "role": "user", "parts": ["Hi"] },
    { "role": "model", "parts": ["Hello! I'm Moneymind..."] }
  ]
}
```

`history` is the prior conversation in Gemini's chat format and is used to maintain context across turns. The response includes the assistant's reply and, if this was the first message in a new chat, an updated session title:

```json
{
  "response": "A Roth IRA is funded with after-tax dollars...",
  "updatedSession": {
    "id": "abc123",
    "title": "What's the difference between a Roth and...",
    "lastUpdatedAt": "2026-06-22T10:15:00+00:00"
  }
}
```

## Data model (Firestore)

```
users/{userId}/
└── chat_sessions/{chatId}
    ├── title: string
    ├── createdAt: timestamp
    ├── lastUpdatedAt: timestamp
    ├── userId: string
    └── messages/{messageId}
        ├── role: "user" | "model"
        ├── parts: string[]
        ├── timestamp: timestamp
        └── log_index: number
```

Each user's chats and messages are isolated under their own `users/{userId}` document, scoped by their Firebase UID.

## The AI assistant's behavior

The Gemini model is configured with a detailed system prompt (see `main.py`) that:

- Identifies the assistant as "Moneymind"
- Scopes responses to finance-related topics only (personal finance, investing/markets, crypto, business/corporate finance, banking, and financial scam awareness)
- Politely declines off-topic questions
- Avoids giving specific financial, investment, legal, or tax advice — it explains concepts and trade-offs instead of telling users what to buy or sell
- Uses Gemini's safety settings (`BLOCK_MEDIUM_AND_ABOVE`) for harassment, hate speech, sexually explicit, and dangerous content categories

## Deployment

The app is structured to run behind Gunicorn in production:

```bash
gunicorn main:app
```

It can be deployed to any platform that supports Python/WSGI apps (e.g. Render, Railway, Google Cloud Run) or adapted for Firebase Cloud Functions. Whichever platform you choose, make sure to:

- Set the same environment variables listed in [Setup](#setup)
- Set `CORS_ALLOWED_ORIGINS` to your deployed frontend's URL
- Provide Firebase Admin credentials appropriate for that environment (a mounted service account file, a secret manager reference, or Application Default Credentials if hosted on Google Cloud)

## Notes

- If Firestore is unreachable or uninitialized, chat-related endpoints return `503 Service temporarily unavailable` rather than crashing.
- If `GEMINI_API_KEY` is missing, the API still runs, but chat responses will return a fallback "AI model is not available" message.
