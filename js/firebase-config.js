// =================================================================
// LIFIN Firebase Configuration
// This file centralizes the Firebase configuration for the entire app.
// It loads credentials securely from an .env file.
// =================================================================

// Your web app's Firebase configuration
// IMPORTANT: This object is intended to be public.
// Security is managed by Firebase Security Rules, not by hiding these keys.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};