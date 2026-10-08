import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, update, remove, serverTimestamp } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Safe initialization only when credentials are provided
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
const app = hasConfig ? initializeApp(firebaseConfig) : ({} as any);
const db = hasConfig ? getDatabase(app) : ({} as any);
const auth = hasConfig ? getAuth(app) : ({} as any);

export const dbRef = (path: string) => ref(db, path);
export {
  app,
  db,
  auth,
  set,
  onValue,
  push,
  update,
  remove,
  serverTimestamp,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
};
