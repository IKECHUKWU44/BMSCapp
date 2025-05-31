"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBK8ASRTdb9c4FltxN4bDycpU0fX8yoNUQ",
  authDomain: "bmscapp.firebaseapp.com",
  projectId: "bmscapp",
  storageBucket: "bmscapp.appspot.com",
  messagingSenderId: "254326634912",
  appId: "1:254326634912:android:0cb4acea440f5177cb8cc5",
}

// Client-only Firebase initialization
let firebaseApp: any = null
let firebaseAuth: Auth | null = null
let firebaseDb: Firestore | null = null
let firebaseStorage: FirebaseStorage | null = null

export function initializeFirebase() {
  if (typeof window === "undefined") {
    // Server-side: return null objects
    return {
      app: null,
      auth: null,
      db: null,
      storage: null,
    }
  }

  // Client-side: initialize Firebase if not already done
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
    firebaseAuth = getAuth(firebaseApp)
    firebaseDb = getFirestore(firebaseApp)
    firebaseStorage = getStorage(firebaseApp)
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
  }
}

// Safe getters that work during SSR
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null
  const { auth } = initializeFirebase()
  return auth
}

export function getFirebaseDb(): Firestore | null {
  if (typeof window === "undefined") return null
  const { db } = initializeFirebase()
  return db
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (typeof window === "undefined") return null
  const { storage } = initializeFirebase()
  return storage
}
