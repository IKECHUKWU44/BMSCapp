"use client"

import type { ReactNode } from "react"
import { useEffect, useState, createContext, useContext } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase-client"

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [initAttempts, setInitAttempts] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeAuth = () => {
      console.log("AuthProvider: Attempting to initialize Firebase Auth...")
      const auth = getFirebaseAuth()

      if (!auth) {
        console.error("AuthProvider: Firebase Auth not available, retrying...")

        // Retry up to 5 times with increasing delays
        if (initAttempts < 5) {
          const delay = (initAttempts + 1) * 500 // 500ms, 1s, 1.5s, 2s, 2.5s
          setTimeout(() => {
            setInitAttempts((prev) => prev + 1)
          }, delay)
          return
        } else {
          console.error("AuthProvider: Failed to initialize Firebase Auth after 5 attempts")
          setLoading(false)
          return
        }
      }

      console.log("AuthProvider: Setting up auth state listener...")
      try {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log("AuthProvider: Auth state changed:", firebaseUser?.email || "No user")
          setUser(firebaseUser)
          setLoading(false)
        })

        return () => {
          console.log("AuthProvider: Cleaning up auth listener")
          unsubscribe()
        }
      } catch (error) {
        console.error("AuthProvider: Error setting up auth listener:", error)
        setLoading(false)
      }
    }

    const cleanup = initializeAuth()
    return cleanup
  }, [mounted, initAttempts])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{initAttempts > 0 ? `Initializing... (${initAttempts}/5)` : "Loading..."}</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
