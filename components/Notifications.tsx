"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  type: NotificationType
  message: string
}

interface NotificationsProps {
  notifications: Notification[]
  onNotificationDismiss: (index: number) => void
}

export function Notifications({ notifications, onNotificationDismiss }: NotificationsProps) {
  const { toast } = useToast()

  useEffect(() => {
    notifications.forEach((notification, index) => {
      toast({
        title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
        description: notification.message,
        variant: notification.type === "error" ? "destructive" : "default",
        onDismiss: () => onNotificationDismiss(index),
      })
    })
  }, [notifications, onNotificationDismiss, toast])

  return null
}

