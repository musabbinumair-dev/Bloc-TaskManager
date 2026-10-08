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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCfLNV1iFvLOSfG6LsucexiyIqOQl93hwE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-task-management-9a1a3.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://project-task-management-9a1a3-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-task-management-9a1a3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-task-management-9a1a3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "223873358690",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:223873358690:web:8ac1a21f8cbf0d750dea3b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

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
