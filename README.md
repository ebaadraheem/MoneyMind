SnapMart Frontend (React/Vite Application)

This repository contains the client-side code for the SnapMart application, built using React and the Vite build tool. It integrates with Firebase for authentication and relies on the backend server for all API logic.

⚙️ Prerequisites

Node.js (LTS recommended)

npm or yarn

The SnapMart Server must be running or deployed (to set VITE_SERVER_URL).

🚀 Installation & Setup

Install Dependencies:

npm install
# or
yarn install


Configure Environment: Create a file named .env.local in the root directory of the frontend project.

Populate .env.local File: The application uses Vite's standardized VITE_ prefix for environment variables. Populate the file with your Firebase configuration and the URL of your deployed or local server:

Variable

Description

Purpose

VITE_FIREBASE_API_KEY

Your Firebase Project's API Key.

Initializes Firebase services.

VITE_FIREBASE_AUTH_DOMAIN

Firebase Authentication Domain.

Manages user sessions.

VITE_FIREBASE_PROJECT_ID

Your Firebase Project ID.

Unique project identifier.

VITE_FIREBASE_STORAGE_BUCKET

Firebase Storage Bucket URL.

Used for accessing media storage (if applicable).

VITE_FIREBASE_MESSAGING_SENDER_ID

Sender ID for Firebase Cloud Messaging.

Required for push notifications setup.

VITE_FIREBASE_APP_ID

Firebase App ID.

Unique identifier for the web application.

VITE_FIREBASE_MEASUREMENT_ID

Firebase Analytics Measurement ID.

For collecting web analytics data.

VITE_SERVER_URL

The URL of your running backend server (e.g., hosted on Azure).

Directs API requests (e.g., user management, product fetching).

VITE_ADMIN_ROLE_ID

The Firebase Authentication UID of the designated Administrator email.

Used for frontend permission checks and role-based access control.

Example .env.local structure:

VITE_FIREBASE_API_KEY="AIzaSyC..."
VITE_FIREBASE_AUTH_DOMAIN="snapmart.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="snapmart-pos"
VITE_FIREBASE_STORAGE_BUCKET="snapmart.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdefghijk"
VITE_FIREBASE_MEASUREMENT_ID="G-ABCDEF123"
VITE_SERVER_URL="[https://snapmart-server-api.azurewebsites.net/api/v1](https://snapmart-server-api.azurewebsites.net/api/v1)"
VITE_ADMIN_ROLE_ID="admin_uid_from_firebase" 


Run the Application:

Start the application in development mode:

npm run dev


The frontend application should now open in your browser, connecting to the specified server URL.
