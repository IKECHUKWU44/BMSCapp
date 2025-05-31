"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/components/AuthProvider"
import { ChatWindow } from "@/components/ChatWindow"
import { VideoCallManager } from "@/components/VideoCallManager"
import { LoginForm } from "@/components/LoginForm"
import { useLogout } from "@/hooks/useAuth"
import { requestNotificationPermission, listenForMessages } from "@/lib/notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Phone, MessageCircle, Star, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useContacts } from "@/hooks/useContacts"
import { useCallHistory } from "@/hooks/useCallHistory"
import { ContactCard } from "@/components/ContactCard"
import { AddContactDialog } from "@/components/AddContactDialog"
import type { Contact } from "@/lib/supabase"
import { ConversationList } from "@/components/ConversationList"
import { CallHistoryItemComponent } from "@/components/CallHistoryItem"

export default function Page() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginForm />

  return <Dashboard />
}

function Dashboard() {
  const { user } = useAuth()
  const { logout } = useLogout()
  const { contacts, loading: contactsLoading, toggleFavorite } = useContacts()
  const { callHistory, loading: callHistoryLoading, addCallRecord } = useCallHistory()
  const [activeTab, setActiveTab] = useState("contacts")
  const [searchQuery, setSearchQuery] = useState("")
  const [isInCall, setIsInCall] = useState(false)
  const [currentCall, setCurrentCall] = useState<{ contact: Contact; channelName: string } | null>(null)
  const { theme, setTheme } = useTheme()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  useEffect(() => {
    // Request notification permission on app load
    requestNotificationPermission()

    // Listen for foreground messages
    listenForMessages((payload) => {
      console.log("Received foreground message:", payload)
      // Handle the message (show notification, update UI, etc.)
    })
  }, [])

  const startCall = (contact: Contact, type: "video" | "audio") => {
    if (!user) return

    // Use the user's UID to create a unique channel name
    const channelName = `bmsc-${user.uid.substring(0, 8)}-${contact.user_id.substring(0, 8)}-${Date.now()
      .toString()
      .substring(8)}`

    console.log("Starting call with channel:", channelName)
    setCurrentCall({ contact, channelName })
    setIsInCall(true)
  }

  const endCall = () => {
    if (currentCall) {
      // Record the call in history
      addCallRecord(currentCall.contact.user_id, "video", "completed", 120) // 2 minutes example
    }

    setIsInCall(false)
    setCurrentCall(null)
  }

  const handleToggleFavorite = async (contact: Contact) => {
    await toggleFavorite(contact.id, contact.is_favorite)
  }

  const startCallFromHistory = (contactId: string, name: string, avatar?: string) => {
    // Find the contact or create a temporary one
    const contact = contacts.find((c) => c.user_id === contactId) || {
      id: contactId,
      name,
      avatar_url: avatar,
      status: "offline" as const,
      last_seen: new Date().toISOString(),
      is_favorite: false,
      user_id: contactId,
      email: "",
      created_at: new Date().toISOString(),
    }

    startCall(contact, "video")
  }

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const favoriteContacts = contacts.filter((contact) => contact.is_favorite)

  // Use user's UID for chat ID to make it unique per user
  const chatId = `user-${user?.uid || "default"}-chat`

  // Show video call interface if in call
  if (isInCall && currentCall) {
    return <VideoCallManager contact={currentCall.contact} channelName={currentCall.channelName} onEndCall={endCall} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">BMSC Connect</h1>
            <p className="text-gray-600">Welcome back, {user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-4">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Chat</h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg h-96">
            <ChatWindow chatId={chatId} />
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Calls</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Messages</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Favorites</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contacts ({contacts.length})</h2>
              <AddContactDialog />
            </div>
            {contactsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? "No contacts found matching your search."
                      : "No contacts yet. Add some to get started!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onVideoCall={() => startCall(contact, "video")}
                    onAudioCall={() => startCall(contact, "audio")}
                    onToggleFavorite={() => handleToggleFavorite(contact)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calls" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Calls</h2>
            {callHistoryLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Loading call history...</p>
              </div>
            ) : callHistory.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="p-8 text-center">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Call history will appear here after you make your first call.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    {callHistory.map((call, index) => (
                      <div key={call.id}>
                        <CallHistoryItemComponent
                          call={call}
                          onVideoCall={(contactId, name, avatar) => {
                            startCallFromHistory(contactId, name, avatar)
                          }}
                          onAudioCall={(contactId, name, avatar) => {
                            startCallFromHistory(contactId, name, avatar)
                          }}
                        />
                        {index < callHistory.length - 1 && <Separator />}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h2>
            <div className="flex h-96 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-lg overflow-hidden">
              <ConversationList
                onSelectContact={(contact) => {
                  setSelectedContact(contact)
                }}
                selectedContactId={selectedContact?.id}
              />
              {selectedContact ? (
                <div className="flex-1">
                  <ChatWindow
                    contact={selectedContact}
                    onBack={() => setSelectedContact(null)}
                    onVideoCall={() => startCall(selectedContact, "video")}
                    onAudioCall={() => startCall(selectedContact, "audio")}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Favorite Contacts ({favoriteContacts.length})
            </h2>
            {favoriteContacts.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No favorite contacts yet. Star contacts to add them here!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoriteContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onVideoCall={() => startCall(contact, "video")}
                    onAudioCall={() => startCall(contact, "audio")}
                    onToggleFavorite={() => handleToggleFavorite(contact)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
