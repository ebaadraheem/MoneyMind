# MoneyMind

MoneyMind is an AI-powered finance assistant that answers personal finance, investing, and money-management questions through a chat interface. It pairs a React/TypeScript single-page app with a Flask API that talks to Google's Gemini model, and uses Firebase for authentication and chat storage.

The assistant is scoped on purpose: it sticks to financial topics, explains concepts instead of giving specific buy/sell advice, and politely declines anything outside its lane.

## How it works

```
┌─────────────────┐        HTTPS + Firebase ID Token        ┌──────────────────┐
│                 │ ───────────────────────────────────────▶ │                  │
│  React Frontend │                                            │   Flask Backend  │
│   (Vite + TS)   │ ◀─────────────────────────────────────── │  (Gemini + Auth) │
│                 │              JSON responses                │                  │
└────────┬────────┘                                            └─────────┬────────┘
         │                                                               │
         │ Firebase Auth (Email/Password + Google)                      │ verifies ID tokens
         ▼                                                               ▼
┌─────────────────┐                                            ┌──────────────────┐
│  Firebase Auth   │                                            │ Firebase Admin SDK│
└─────────────────┘                                            └─────────┬────────┘
                                                                          │
                                                                          ▼
                                                                 ┌──────────────────┐
                                                                 │     Firestore     │
                                                                 │ (chats & messages)│
                                                                 └──────────────────┘
                                                                          ▲
                                                                          │
                                                                 ┌──────────────────┐
                                                                 │   Gemini API      │
                                                                 │ (AI responses)    │
                                                                 └──────────────────┘
```

1. The **user signs in** on the frontend with Firebase Authentication (email/password or Google).
2. The frontend attaches the user's **Firebase ID token** to every API request.
3. The **Flask backend** verifies that token with the Firebase Admin SDK, then handles the request as that authenticated user.
4. Chat sessions and messages are stored per-user in **Firestore**.
5. New prompts are sent to **Gemini** (with a finance-focused system prompt) and the reply is streamed back and saved to the session.

## Repository structure

```
MoneyMind/
├── frontend/   # React + TypeScript + Vite single-page app
├── backend/    # Flask REST API (Gemini + Firebase Admin SDK)
└── README.md   # You are here
```

Each folder is a self-contained project with its own dependencies, environment variables, and setup instructions:

- [`frontend/README.md`](./frontend/README.md) — UI setup, environment variables, scripts, and deployment to Vercel.
- [`backend/README.md`](./backend/README.md) — API setup, environment variables, endpoints, and deployment.

## Features

- 💬 Chat with an AI assistant that specializes in personal finance, investing, crypto, and corporate finance topics
- 🔒 Email/password and Google sign-in via Firebase Authentication
- 🗂️ Multiple chat sessions per user — create, rename, and delete conversations
- 📝 Markdown-formatted AI responses (tables, lists, code blocks, etc.)
- ☁️ Persistent chat history stored in Firestore, scoped per user
- 🌗 Responsive UI with light/dark styling

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Auth | Firebase Authentication |
| Backend | Python, Flask, Flask-CORS |
| AI | Google Gemini (`google-generativeai`) |
| Database | Firestore (via Firebase Admin SDK) |
| Deployment targets | Vercel (frontend), any WSGI-compatible host such as Render, Cloud Run, or Firebase Functions (backend) |

## Getting started

You'll need both halves of the app running to use MoneyMind locally: the Flask API and the React client. At a high level:

1. Set up a Firebase project (Authentication + Firestore) and a Gemini API key.
2. Follow [`backend/README.md`](./backend/README.md) to configure and run the API.
3. Follow [`frontend/README.md`](./frontend/README.md) to configure and run the UI, pointing it at your local API URL.

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- A Firebase project with **Authentication** (Email/Password and Google providers) and **Firestore** enabled
- A **Google Gemini** API key

## Contributing

Issues and pull requests are welcome. Please open an issue describing the change you'd like to make before submitting a large PR.

## License

This project is licensed under MIT.
