"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-client"

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initializeMessages = async () => {
      // Retry getting db with delays
      let db = getFirebaseDb()
      let retries = 0

      while (!db && retries < 3) {
        console.log(`Messages: Waiting for Firebase Firestore initialization (attempt ${retries + 1})...`)
        await new Promise((resolve) => setTimeout(resolve, 500))
        db = getFirebaseDb()
        retries++
      }

      if (!db) {
        console.error("Messages: Firebase Firestore not available")
        return
      }

      console.log("Messages: Setting up listener for chat:", chatId)
      try {
        const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp"))
        const unsub = onSnapshot(q, (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
          console.log("Messages: Updated:", newMessages.length)
          setMessages(newMessages)
        })
        return () => unsub()
      } catch (error) {
        console.error("Messages: Error setting up listener:", error)
      }
    }

    const cleanup = initializeMessages()
    return () => {
      if (cleanup) cleanup.then((fn) => fn && fn())
    }
  }, [chatId, mounted])

  const sendMessage = async (text: string, senderId: string) => {
    if (!mounted) return

    const db = getFirebaseDb()
    if (!db) {
      console.error("Messages: Firebase Firestore not available for sending")
      return
    }

    console.log("Messages: Sending message:", text)
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        senderId,
        timestamp: Timestamp.now(),
      })
    } catch (error) {
      console.error("Messages: Error sending message:", error)
    }
  }

  return { messages, sendMessage }
}
