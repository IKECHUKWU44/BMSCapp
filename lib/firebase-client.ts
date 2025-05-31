"use client"

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBK8ASRTdb9c4FltxN4bDycpU0fX8yoNUQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bmscapp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bmscapp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bmscapp.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "254326634912",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:254326634912:android:0cb4acea440f5177cb8cc5",
}

// Global variables to store Firebase instances
let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let firebaseDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null

// Initialize Firebase app only once
function initializeFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") {
    console.log("Firebase: Server-side rendering, skipping initialization")
    return null
  }

  if (!firebaseApp) {
    try {
      console.log("Firebase: Initializing app...")
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      console.log("Firebase: App initialized successfully")
    } catch (error) {
      console.error("Firebase: Error initializing app:", error)
      return null
    }
  }

  return firebaseApp
}

// Get Auth instance with proper initialization order
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") {
    console.log("Firebase Auth: Server-side rendering, returning null")
    return null
  }

  // First ensure the app is initialized
  const app = initializeFirebaseApp()
  if (!app) {
    console.error("Firebase Auth: App not initialized")
    return null
  }

  // Then initialize auth if not already done
  if (!firebaseAuth) {
    try {
      console.log("Firebase Auth: Initializing...")
      firebaseAuth = getAuth(app)
      console.log("Firebase Auth: Initialized successfully")
    } catch (error) {
      console.error("Firebase Auth: Error initializing:", error)
      return null
    }
  }

  return firebaseAuth
}

// Get Firestore instance with proper initialization order
export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") {
    console.log("Firebase Firestore: Server-side rendering, returning null")
    return null
  }

  // First ensure the app is initialized
  const app = initializeFirebaseApp()
  if (!app) {
    console.error("Firebase Firestore: App not initialized")
    return null
  }

  // Then initialize firestore if not already done
  if (!firebaseDb) {
    try {
      console.log("Firebase Firestore: Initializing...")
      firebaseDb = getFirestore(app)
      console.log("Firebase Firestore: Initialized successfully")
    } catch (error) {
      console.error("Firebase Firestore: Error initializing:", error)
      return null
    }
  }

  return firebaseDb
}

// Get Storage instance with proper initialization order
export function getFirebaseStorage(): FirebaseStorage | null {
  if (typeof window === "undefined") {
    console.log("Firebase Storage: Server-side rendering, returning null")
    return null
  }

  // First ensure the app is initialized
  const app = initializeFirebaseApp()
  if (!app) {
    console.error("Firebase Storage: App not initialized")
    return null
  }

  // Then initialize storage if not already done
  if (!firebaseStorage) {
    try {
      console.log("Firebase Storage: Initializing...")
      firebaseStorage = getStorage(app)
      console.log("Firebase Storage: Initialized successfully")
    } catch (error) {
      console.error("Firebase Storage: Error initializing:", error)
      return null
    }
  }

  return firebaseStorage
}

// Initialize Firebase when this module loads (client-side only)
if (typeof window !== "undefined") {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initializeFirebaseApp()
  }, 100)
}
