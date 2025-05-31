"use client"

import { useState, useEffect } from "react"
import { supabase, type Contact } from "@/lib/supabase"
import { useAuth } from "@/components/AuthProvider"

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    fetchContacts()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("contacts")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, () => fetchContacts())
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const fetchContacts = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("contacts").select("*").neq("user_id", user.uid).order("name")

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const addContact = async (email: string, name: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("contacts").insert({
        user_id: user.uid,
        name,
        email,
        status: "offline",
        last_seen: new Date().toISOString(),
        is_favorite: false,
      })

      if (error) throw error
      await fetchContacts()
    } catch (error) {
      console.error("Error adding contact:", error)
      throw error
    }
  }

  const toggleFavorite = async (contactId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase.from("contacts").update({ is_favorite: !isFavorite }).eq("id", contactId)

      if (error) throw error
      await fetchContacts()
    } catch (error) {
      console.error("Error updating favorite:", error)
    }
  }

  const updateStatus = async (status: "online" | "offline" | "busy") => {
    if (!user) return

    try {
      await supabase
        .from("contacts")
        .update({
          status,
          last_seen: new Date().toISOString(),
        })
        .eq("user_id", user.uid)
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  return { contacts, loading, addContact, toggleFavorite, updateStatus, refetch: fetchContacts }
}
