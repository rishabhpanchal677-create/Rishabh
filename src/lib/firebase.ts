import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from 'firebase/auth';

// Configuration details sourced from /firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCDgBukO8vUcS9oZtBbNdOKvJK7yErTKhI",
  authDomain: "gen-lang-client-0849961562.firebaseapp.com",
  projectId: "gen-lang-client-0849961562",
  storageBucket: "gen-lang-client-0849961562.firebasestorage.app",
  messagingSenderId: "119815461250",
  appId: "1:119815461250:web:03f436690373d33ad0179b",
  firestoreDatabaseId: "ai-studio-pureatytiffinser-499cab9a-046c-4d1c-b3a0-d6d3a9188b38"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom Database ID
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Initialize Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// Request profiles & emails
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { 
  app, 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  signInWithEmailAndPassword
};
