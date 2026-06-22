# MoneyMind — Frontend

The frontend is a React + TypeScript single-page app (built with Vite) that provides the chat interface for MoneyMind, an AI finance assistant. It handles user authentication, renders chat sessions and messages, and talks to the [MoneyMind backend](../backend/README.md) for AI responses and chat persistence.

## Features

- Email/password and Google sign-in, plus password reset, via Firebase Authentication
- Multi-session chat: create, switch between, rename, and delete conversations
- Markdown rendering for AI responses (GFM tables, lists, code blocks, raw HTML) via `react-markdown`, `remark-gfm`, and `rehype-raw`
- Collapsible sidebar with session list, responsive down to mobile widths
- Profile dropdown for account actions and sign-out
- Confirmation modal for destructive actions (e.g. deleting a chat)

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — dev server and build tool
- [React Router](https://reactrouter.com/) — client-side routing (`/login`, `/`)
- [Tailwind CSS 4](https://tailwindcss.com/) — styling
- [Firebase JS SDK](https://firebase.google.com/docs/web/setup) + [react-firebase-hooks](https://github.com/CSFrequency/react-firebase-hooks) — authentication state
- [Axios](https://axios-http.com/) — HTTP client for the backend API
- [Heroicons](https://heroicons.com/) — icon set

## Project structure

```
frontend/
├── public/                     # Static assets (logo, favicon)
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx           # Top bar, sidebar toggle
│   │   ├── ChatMessagesArea.tsx    # Message list + markdown rendering
│   │   ├── ConfirmationModal.tsx   # Reusable confirm/cancel dialog
│   │   ├── InputArea.tsx           # Message composer
│   │   ├── ProfileDropdown.tsx     # Account menu / sign-out
│   │   └── Sidebar.tsx             # Chat session list (create/rename/delete)
│   ├── pages/
│   │   ├── ChatPage.tsx            # Main authenticated chat screen, API calls
│   │   └── LoginPage.tsx           # Sign in / sign up / forgot password
│   ├── App.tsx                 # Route definitions + auth-gated redirects
│   ├── firebase.ts             # Firebase app/auth/firestore initialization
│   ├── main.tsx                 # App entry point
│   └── index.css                # Tailwind entry / global styles
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig*.json
```

## Prerequisites

- Node.js 18 or later
- npm (or yarn/pnpm, adjusting commands accordingly)
- A Firebase project with **Authentication** enabled (Email/Password and Google sign-in providers)
- The [MoneyMind backend](../backend/README.md) running locally or deployed, since the chat features call it directly

## Setup

1. **Navigate to this directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables.**

   Create a `.env.local` file in `frontend/` (this is git-ignored and used only for local development):

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_SERVER_URL=http://localhost:5001/api
   ```

   - The `VITE_FIREBASE_*` values come from your Firebase project settings (Project settings → General → Your apps → SDK setup and configuration).
   - `VITE_SERVER_URL` should point to the base URL of the running backend, including the `/api` prefix (see [`backend/README.md`](../backend/README.md) for the default port).

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` by default.

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server with hot module reloading |
| `npm run build` | Type-checks (`tsc -b`) and builds a production bundle into `dist/` |
| `npm run lint` | Runs ESLint over the project |
| `npm run preview` | Serves the production build locally for a final check |

## How it talks to the backend

- After signing in, the app retrieves a Firebase ID token (`authUser.getIdToken()`) and attaches it as a `Bearer` token on every request to the backend.
- All chat-related requests go to `${VITE_SERVER_URL}/chats...` (list/create/delete/rename sessions, fetch history, send a message).
- The backend verifies the token before processing any request — see [`backend/README.md`](../backend/README.md) for endpoint details.

## Deployment (Vercel)

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, import the repository as a new project and set the **root directory** to `frontend`.
3. Vercel should auto-detect the Vite preset:
   - **Build command:** `npm run build` (or `vite build`)
   - **Output directory:** `dist`
4. Add the environment variables from the [Setup](#setup) step above under Project Settings → Environment Variables, for both **Production** and **Preview** environments. Set `VITE_SERVER_URL` to your deployed backend's URL.
5. Deploy.

## Notes

- The app redirects unauthenticated users to `/login` and authenticated users away from `/login` to `/` (see `App.tsx`).
- Tailwind v4 is wired in via the `@tailwindcss/vite` plugin, so no separate PostCSS config step is required beyond what's already in `vite.config.ts`.
