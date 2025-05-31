"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Camera, AlertCircle } from "lucide-react"

interface PermissionHandlerProps {
  onPermissionsGranted: () => void
}

export function PermissionHandler({ onPermissionsGranted }: PermissionHandlerProps) {
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkPermissions() {
      try {
        // Check camera permission
        const cameraResult = await navigator.permissions.query({ name: "camera" as PermissionName })
        setCameraPermission(cameraResult.state as "granted" | "denied" | "prompt")

        // Check microphone permission
        const micResult = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setMicPermission(micResult.state as "granted" | "denied" | "prompt")

        // If both permissions are granted, call the callback
        if (cameraResult.state === "granted" && micResult.state === "granted") {
          onPermissionsGranted()
        }
      } catch (error) {
        console.error("Error checking permissions:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkPermissions()
  }, [onPermissionsGranted])

  const requestPermissions = async () => {
    try {
      setIsChecking(true)

      // Request camera and microphone permissions
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

      // Check permissions again
      const cameraResult = await navigator.permissions.query({ name: "camera" as PermissionName })
      const micResult = await navigator.permissions.query({ name: "microphone" as PermissionName })

      setCameraPermission(cameraResult.state as "granted" | "denied" | "prompt")
      setMicPermission(micResult.state as "granted" | "denied" | "prompt")

      // If both permissions are granted, call the callback
      if (cameraResult.state === "granted" && micResult.state === "granted") {
        onPermissionsGranted()
      }
    } catch (error) {
      console.error("Error requesting permissions:", error)
    } finally {
      setIsChecking(false)
    }
  }

  // If still checking permissions, show loading
  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Checking Permissions</CardTitle>
            <CardDescription>Please wait while we check camera and microphone permissions...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If permissions are not granted, show permission request
  if (cameraPermission !== "granted" || micPermission !== "granted") {
    return (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Camera & Microphone Access</CardTitle>
            <CardDescription>BMSC Connect needs access to your camera and microphone for video calls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Camera className={cameraPermission === "granted" ? "text-green-500" : "text-gray-400"} />
                <span>Camera: {cameraPermission === "granted" ? "Granted" : "Required"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mic className={micPermission === "granted" ? "text-green-500" : "text-gray-400"} />
                <span>Microphone: {micPermission === "granted" ? "Granted" : "Required"}</span>
              </div>
            </div>

            {(cameraPermission === "denied" || micPermission === "denied") && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Permission denied</p>
                  <p className="text-sm">
                    Please enable camera and microphone access in your browser settings and refresh the page.
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={requestPermissions}
              disabled={cameraPermission === "denied" || micPermission === "denied"}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Grant Permissions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If permissions are granted, return null (don't render anything)
  return null
}
