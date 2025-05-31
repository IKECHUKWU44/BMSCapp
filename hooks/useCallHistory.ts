"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"

export interface CallHistoryItem {
  id: string
  caller_id: string
  receiver_id: string
  call_type: "video" | "audio"
  duration: number
  status: "completed" | "missed" | "declined"
  started_at: string
  ended_at?: string
  caller?: {
    id: string
    name: string
    avatar_url?: string
  }
  receiver?: {
    id: string
    name: string
    avatar_url?: string
  }
}

export function useCallHistory() {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    fetchCallHistory()
  }, [user])

  const fetchCallHistory = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch(`/api/call-history?userId=${user.uid}`)
      const result = await response.json()

      if (result.success) {
        setCallHistory(result.data || [])
      } else {
        console.error("Error fetching call history:", result.error)
      }
    } catch (error) {
      console.error("Error fetching call history:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCallRecord = async (
    receiverId: string,
    callType: "video" | "audio",
    status: "completed" | "missed" | "declined",
    duration = 0,
  ) => {
    if (!user) return

    try {
      const response = await fetch("/api/call-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caller_id: user.uid,
          receiver_id: receiverId,
          call_type: callType,
          duration,
          status,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh call history
        fetchCallHistory()
      } else {
        console.error("Error adding call record:", result.error)
      }
    } catch (error) {
      console.error("Error adding call record:", error)
    }
  }

  return { callHistory, loading, addCallRecord, refetch: fetchCallHistory }
}
