"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase-client"
import { useAuth } from "@/components/AuthProvider"
import { useContacts } from "@/hooks/useContacts"
import type { Contact } from "@/lib/supabase"

interface ConversationListProps {
  onSelectContact: (contact: Contact) => void
  selectedContactId?: string
}

interface Conversation {
  contactId: string
  contact: Contact
  lastMessage: string
  lastMessageTime: any
  unreadCount: number
}

export function ConversationList({ onSelectContact, selectedContactId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const { contacts } = useContacts()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !user) return

    const db = getFirebaseDb()
    if (!db) {
      console.error("Firebase Firestore not available")
      return
    }

    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("participants", "array-contains", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationMap = new Map<string, Conversation>()

      snapshot.forEach((doc) => {
        const data = doc.data()
        const otherUserId = data.senderId === user.uid ? data.receiverId : data.senderId
        const contact = contacts.find((c) => c.user_id === otherUserId)

        if (contact && !conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            contactId: otherUserId,
            contact,
            lastMessage: data.text,
            lastMessageTime: data.createdAt,
            unreadCount: 0,
          })
        }
      })

      setConversations(Array.from(conversationMap.values()))
    })

    return () => unsubscribe()
  }, [user, contacts, mounted])

  const filteredConversations = conversations.filter((conv) =>
    conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "now"
    if (diffInHours < 24) return `${diffInHours}h`
    return date.toLocaleDateString()
  }

  if (!mounted) {
    return <div>Loading conversations...</div>
  }

  return (
    <div className="w-full max-w-sm bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-96">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.contactId}
                onClick={() => onSelectContact(conversation.contact)}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedContactId === conversation.contactId ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.contact.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {conversation.contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {conversation.contact.name}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
