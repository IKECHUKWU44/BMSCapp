import AgoraRTC from "agora-rtc-sdk-ng"

export function createAgoraClient() {
  return AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
}
