"use client"

import { useEffect, useRef, useState } from "react"
import AgoraRTC from "agora-rtc-sdk-ng"

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "9cbcca3d9f2f4e73b546c7f372bab604"
const AGORA_CHANNEL_NAME = process.env.NEXT_PUBLIC_AGORA_CHANNEL_NAME || "bmsc-room"

export function VideoCall() {
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const localRef = useRef<HTMLDivElement>(null)
  const remoteRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<any>(null)

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
    clientRef.current = client

    client.on("user-published", async (user: any, mediaType: any) => {
      await client.subscribe(user, mediaType)
      if (mediaType === "video") user.videoTrack.play(remoteRef.current)
      if (mediaType === "audio") user.audioTrack.play()
    })

    const joinCall = async () => {
      try {
        await client.join(AGORA_APP_ID, AGORA_CHANNEL_NAME, null, null)
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        if (localRef.current) {
          videoTrack.play(localRef.current)
        }
        await client.publish([audioTrack, videoTrack])
        setJoined(true)
      } catch (error) {
        console.error("Failed to join video call:", error)
      } finally {
        setLoading(false)
      }
    }

    joinCall()

    return () => {
      client.leave()
    }
  }, [])

  if (loading) return <div>Joining video call...</div>
  if (!joined) return <div>Failed to join video call. Please try again.</div>

  return (
    <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
      <div>
        <h3>You</h3>
        <div ref={localRef} style={{ width: 320, height: 240, background: "#ddd", borderRadius: 8 }} />
      </div>
      <div>
        <h3>Remote</h3>
        <div ref={remoteRef} style={{ width: 320, height: 240, background: "#bbb", borderRadius: 8 }} />
      </div>
    </div>
  )
}
