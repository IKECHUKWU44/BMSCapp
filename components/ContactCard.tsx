"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Video, Phone, Star, StarOff } from "lucide-react"
import type { Contact } from "@/lib/supabase"

interface ContactCardProps {
  contact: Contact
  onVideoCall: () => void
  onAudioCall: () => void
  onToggleFavorite: () => void
}

export function ContactCard({ contact, onVideoCall, onAudioCall, onToggleFavorite }: ContactCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const getLastSeenText = (lastSeen: string, status: string) => {
    if (status === "online") return "Active now"
    if (status === "busy") return "Busy"

    const date = new Date(lastSeen)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Active recently"
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={contact.avatar_url || "/placeholder.svg"} alt={contact.name} />
              <AvatarFallback>
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{contact.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getLastSeenText(contact.last_seen, contact.status)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className="text-yellow-500 hover:text-yellow-600"
          >
            {contact.is_favorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={onAudioCall} className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button
            size="sm"
            onClick={onVideoCall}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Video className="w-4 h-4 mr-2" />
            Video
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
