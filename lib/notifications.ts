"use client"

// Note: Messaging is removed from this file since it was causing issues
// FCM setup can be added later if needed

export function requestNotificationPermission() {
  if (typeof window === "undefined") return
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted")
      // Optionally: get and save FCM token here
    }
  })
}

export function listenForMessages(callback: (payload: any) => void) {
  // FCM message listening can be implemented here when needed
  console.log("Message listening setup")
}
