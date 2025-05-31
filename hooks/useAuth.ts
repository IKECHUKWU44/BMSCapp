"use client"

import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase-client"

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const login = async (email: string, password: string) => {
    if (!mounted) return null

    setLoading(true)
    setError(null)

    // Retry getting auth with a small delay
    let auth = getFirebaseAuth()
    let retries = 0

    while (!auth && retries < 3) {
      console.log(`Login: Waiting for Firebase Auth initialization (attempt ${retries + 1})...`)
      await new Promise((resolve) => setTimeout(resolve, 500))
      auth = getFirebaseAuth()
      retries++
    }

    if (!auth) {
      setError("Firebase Auth not initialized. Please refresh the page.")
      setLoading(false)
      return null
    }

    try {
      console.log("Login: Attempting login for:", email)
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      console.log("Login: Successful for:", userCred.user.email)
      return userCred.user
    } catch (e: any) {
      console.error("Login: Error:", e)
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
}

export function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const register = async (email: string, password: string) => {
    if (!mounted) return null

    setLoading(true)
    setError(null)

    // Retry getting auth with a small delay
    let auth = getFirebaseAuth()
    let retries = 0

    while (!auth && retries < 3) {
      console.log(`Register: Waiting for Firebase Auth initialization (attempt ${retries + 1})...`)
      await new Promise((resolve) => setTimeout(resolve, 500))
      auth = getFirebaseAuth()
      retries++
    }

    if (!auth) {
      setError("Firebase Auth not initialized. Please refresh the page.")
      setLoading(false)
      return null
    }

    try {
      console.log("Register: Attempting registration for:", email)
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      console.log("Register: Successful for:", userCred.user.email)
      return userCred.user
    } catch (e: any) {
      console.error("Register: Error:", e)
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { register, loading, error }
}

export function useLogout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const logout = async () => {
    if (!mounted) return

    const auth = getFirebaseAuth()
    if (!auth) {
      setError("Firebase Auth not initialized")
      return
    }

    setLoading(true)
    setError(null)
    try {
      console.log("Logout: Attempting logout...")
      await signOut(auth)
      console.log("Logout: Successful")
    } catch (e: any) {
      console.error("Logout: Error:", e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { logout, loading, error }
}
