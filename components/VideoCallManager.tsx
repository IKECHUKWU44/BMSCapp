"use client"

import { useEffect, useState } from "react"
import { doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore"
import { getFirebaseDb, getFirebaseAuth } from "@/lib/firebase-client"
import { VideoCall } from "./VideoCall"
import type { Contact } from "@/lib/supabase"

interface VideoCallManagerProps {
  contact: Contact
  channelName: string
  onEndCall: () => void
}

export function VideoCallManager({ contact, channelName, onEndCall }: VideoCallManagerProps) {
  const [callData, setCallData] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const startCall = async () => {
      const auth = getFirebaseAuth()
      const db = getFirebaseDb()

      if (!auth || !db) {
        console.error("Firebase not initialized")
        return
      }

      const user = auth.currentUser
      if (!user) throw new Error("User not logged in")

      console.log("Starting call with user:", user.uid)

      // Create call document in Firestore for signaling
      const callRef = doc(db, "calls", `${user.uid}_${contact.user_id}`)
      await setDoc(callRef, {
        caller: user.uid,
        callerEmail: user.email,
        receiver: contact.user_id,
        receiverName: contact.name,
        channelName,
        status: "calling",
        createdAt: new Date().toISOString(),
      })

      // Listen for call updates
      const unsubscribe = onSnapshot(callRef, (doc) => {
        if (doc.exists()) {
          setCallData(doc.data())
        }
      })

      return () => {
        unsubscribe()
        // Clean up call document when component unmounts
        deleteDoc(callRef).catch(console.error)
      }
    }

    startCall()
  }, [contact, channelName, mounted])

  const handleEndCall = async () => {
    if (!mounted) return

    const auth = getFirebaseAuth()
    const db = getFirebaseDb()

    if (!auth || !db) return

    const user = auth.currentUser
    if (user) {
      // Clean up call document
      const callRef = doc(db, "calls", `${user.uid}_${contact.user_id}`)
      await deleteDoc(callRef).catch(console.error)
    }
    onEndCall()
  }

  if (!mounted) {
    return <div>Loading call...</div>
  }

  return <VideoCall contact={contact} channelName={channelName} onEndCall={handleEndCall} />
}
