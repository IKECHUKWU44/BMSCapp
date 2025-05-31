"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PhoneCall, PhoneOff, Video, Phone } from "lucide-react"
import type { CallHistoryItem } from "@/hooks/useCallHistory"
import { useAuth } from "@/components/AuthProvider"

interface CallHistoryItemProps {
  call: CallHistoryItem
  onVideoCall: (contactId: string, name: string, avatar?: string) => void
  onAudioCall: (contactId: string, name: string, avatar?: string) => void
}

export function CallHistoryItemComponent({ call, onVideoCall, onAudioCall }: CallHistoryItemProps) {
  const { user } = useAuth()

  // Determine if the current user is the caller or receiver
  const isOutgoing = user?.uid === call.caller_id
  const otherParty = isOutgoing ? call.receiver : call.caller

  if (!otherParty) return null

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getStatusIcon = () => {
    switch (call.status) {
      case "missed":
        return <PhoneOff className="w-4 h-4 text-red-500" />
      case "declined":
        return <PhoneOff className="w-4 h-4 text-red-500" />
      default:
        return call.call_type === "video" ? (
          <Video className="w-4 h-4 text-green-500" />
        ) : (
          <Phone className="w-4 h-4 text-green-500" />
        )
    }
  }

  return (
    <div className="flex items-center space-x-3 p-4">
      <Avatar className="w-10 h-10">
        <AvatarImage src={otherParty.avatar_url || "/placeholder.svg"} alt={otherParty.name} />
        <AvatarFallback>
          {otherParty.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white">{otherParty.name}</h4>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          {isOutgoing ? <PhoneCall className="w-3 h-3 rotate-180" /> : <PhoneCall className="w-3 h-3" />}
          <span>{isOutgoing ? "Outgoing" : "Incoming"}</span>
          <span>•</span>
          {getStatusIcon()}
          <span>{formatTime(call.started_at)}</span>
          {call.status === "completed" && call.duration > 0 && (
            <>
              <span>•</span>
              <span>{formatDuration(call.duration)}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex space-x-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAudioCall(otherParty.id, otherParty.name, otherParty.avatar_url)}
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onVideoCall(otherParty.id, otherParty.name, otherParty.avatar_url)}
        >
          <Video className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
