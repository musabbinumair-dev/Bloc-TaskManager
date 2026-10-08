import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, update, remove, serverTimestamp } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfLNV1iFvLOSfG6LsucexiyIqOQl93hwE",
  authDomain: "project-task-management-9a1a3.firebaseapp.com",
  databaseURL: "https://project-task-management-9a1a3-default-rtdb.firebaseio.com",
  projectId: "project-task-management-9a1a3",
  storageBucket: "project-task-management-9a1a3.firebasestorage.app",
  messagingSenderId: "223873358690",
  appId: "1:223873358690:web:8ac1a21f8cbf0d750dea3b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export const dbRef = (path: string) => ref(db, path);
export { app, db, auth, set, onValue, push, update, remove, serverTimestamp, signInWithEmailAndPassword, signOut, onAuthStateChanged };
