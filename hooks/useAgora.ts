"use client"

import { useState, useEffect } from "react"
import AgoraRTC, { type IAgoraRTCClient, type ILocalVideoTrack, type ILocalAudioTrack } from "agora-rtc-sdk-ng"

// Update to use the environment variables
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!
const DEFAULT_CHANNEL = process.env.NEXT_PUBLIC_AGORA_CHANNEL_NAME || "bmsc-room"

export function useAgora() {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null)
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null)
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
    setClient(agoraClient)

    const handleUserPublished = async (user: any, mediaType: "video" | "audio") => {
      await agoraClient.subscribe(user, mediaType)

      if (mediaType === "video") {
        setRemoteUsers((prev) => [...prev.filter((u) => u.uid !== user.uid), user])
      }

      if (mediaType === "audio") {
        user.audioTrack?.play()
      }
    }

    const handleUserUnpublished = (user: any) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
    }

    const handleUserLeft = (user: any) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
    }

    agoraClient.on("user-published", handleUserPublished)
    agoraClient.on("user-unpublished", handleUserUnpublished)
    agoraClient.on("user-left", handleUserLeft)

    return () => {
      agoraClient.off("user-published", handleUserPublished)
      agoraClient.off("user-unpublished", handleUserUnpublished)
      agoraClient.off("user-left", handleUserLeft)
    }
  }, [])

  const joinChannel = async (channelName: string = DEFAULT_CHANNEL, uid?: string | number) => {
    if (!client) return

    try {
      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      setLocalAudioTrack(audioTrack)
      setLocalVideoTrack(videoTrack)

      // Join channel
      await client.join(APP_ID, channelName, null, uid)

      // Publish tracks
      await client.publish([audioTrack, videoTrack])

      setIsJoined(true)
    } catch (error) {
      console.error("Error joining channel:", error)
      throw error
    }
  }

  const leaveChannel = async () => {
    if (!client) return

    try {
      // Stop and close local tracks
      localAudioTrack?.stop()
      localAudioTrack?.close()
      localVideoTrack?.stop()
      localVideoTrack?.close()

      // Leave channel
      await client.leave()

      setLocalAudioTrack(null)
      setLocalVideoTrack(null)
      setRemoteUsers([])
      setIsJoined(false)
      setIsMuted(false)
      setIsVideoOff(false)
    } catch (error) {
      console.error("Error leaving channel:", error)
    }
  }

  const toggleMute = async () => {
    if (!localAudioTrack) return

    try {
      await localAudioTrack.setEnabled(isMuted)
      setIsMuted(!isMuted)
    } catch (error) {
      console.error("Error toggling mute:", error)
    }
  }

  const toggleVideo = async () => {
    if (!localVideoTrack) return

    try {
      await localVideoTrack.setEnabled(isVideoOff)
      setIsVideoOff(!isVideoOff)
    } catch (error) {
      console.error("Error toggling video:", error)
    }
  }

  return {
    client,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isJoined,
    isMuted,
    isVideoOff,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleVideo,
  }
}
