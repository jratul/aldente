import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _store: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app =
      getApps().length > 0
        ? getApp()
        : initializeApp({
            apiKey: process.env.FB_API_KEY,
            authDomain: process.env.FB_AUTH_DOMAIN,
            projectId: process.env.FB_PROJECT_ID,
            storageBucket: process.env.FB_STORAGE_BUCKET,
            messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
            appId: process.env.FB_APP_ID,
            measurementId: process.env.FB_MEASUREMENT_ID,
          });
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

export function getFirebaseStore(): Firestore {
  if (!_store) {
    _store = getFirestore(getFirebaseApp());
  }
  return _store;
}

// Backward-compatible lazy getters
export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getFirebaseAuth() as unknown as Record<string | symbol, unknown>)[
      prop
    ];
  },
});

export const store = new Proxy({} as Firestore, {
  get(_, prop) {
    return (getFirebaseStore() as unknown as Record<string | symbol, unknown>)[
      prop
    ];
  },
});
