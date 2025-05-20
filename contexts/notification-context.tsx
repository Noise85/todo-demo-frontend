"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type Notification,
  NotificationType,
  type NotificationPreferences,
  defaultNotificationPreferences,
  type BaseNotification,
} from "@/lib/notification-types"
import { config } from "@/lib/config"
import { useAuth } from "./auth-context"
import { useToast } from "@/hooks/use-toast"

// Mock notifications for testing
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: NotificationType.TASK_STATUS_CHANGED,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    read: false,
    taskId: 1,
    taskTitle: "Implement login page",
    actorId: "987654321",
    actorName: "Jane Smith",
    oldStatus: "BACKLOG" as any,
    newStatus: "READY" as any,
  },
  {
    id: "2",
    type: NotificationType.TASK_ASSIGNED,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    taskId: 2,
    taskTitle: "Design dashboard",
    actorId: "987654321",
    actorName: "Jane Smith",
    assigneeId: "123456789",
    assigneeName: "Demo User",
  },
  {
    id: "3",
    type: NotificationType.TASK_MOVED_FROM_BACKLOG,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    read: true,
    taskId: 3,
    taskTitle: "Fix navigation bug",
    actorId: "456789123",
    actorName: "John Doe",
    newStatus: "READY" as any,
  },
  {
    id: "4",
    type: NotificationType.TASK_TAGS_CHANGED,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    taskId: 4,
    taskTitle: "Update documentation",
    actorId: "456789123",
    actorName: "John Doe",
    addedTags: ["design"],
    removedTags: ["dev"],
  },
  {
    id: "5",
    type: NotificationType.TASK_DELETED,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    taskId: 5,
    taskTitle: "Release v1.0",
    actorId: "987654321",
    actorName: "Jane Smith",
  },
]

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences
  setPreferences: (prefs: NotificationPreferences) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [socket, setSocket] = useState<WebSocket | null>(null)

  // Load preferences from localStorage
  useEffect(() => {
    if (user) {
      const savedPrefs = localStorage.getItem(`notification-preferences-${user.id}`)
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs))
        } catch (e) {
          console.error("Failed to parse notification preferences", e)
        }
      }
    }
  }, [user])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`notification-preferences-${user.id}`, JSON.stringify(preferences))
    }
  }, [preferences, user])

  // Connect to WebSocket or use mock data
  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Load existing notifications from localStorage
    const savedNotifications = localStorage.getItem(`notifications-${user.id}`)
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
        console.error("Failed to parse saved notifications", e)
      }
    }

    if (config.useRealWebSocket) {
      // Connect to real WebSocket
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8080")

      ws.onopen = () => {
        console.log("WebSocket connection established")
        // Send authentication message
        ws.send(JSON.stringify({ type: "AUTH", userId: user.id }))
      }

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification

          // Check if notification should be shown based on preferences
          if (shouldShowNotification(notification, preferences)) {
            // Add notification to state
            setNotifications((prev) => [notification, ...prev])

            // Show toast for new notification
            toast({
              title: getNotificationTitle(notification),
              description: getNotificationDescription(notification),
            })
          }
        } catch (e) {
          console.error("Failed to parse notification", e)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      ws.onclose = () => {
        console.log("WebSocket connection closed")
      }

      setSocket(ws)

      return () => {
        ws.close()
      }
    } else {
      // Use mock data if no saved notifications
      if (!savedNotifications) {
        setNotifications(mockNotifications)
      }

      // Simulate receiving new notifications periodically
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          // 30% chance of new notification
          const mockNotification = generateMockNotification(user.id)

          // Check if notification should be shown based on preferences
          if (shouldShowNotification(mockNotification, preferences)) {
            setNotifications((prev) => [mockNotification, ...prev])

            // Show toast for new notification
            toast({
              title: getNotificationTitle(mockNotification),
              description: getNotificationDescription(mockNotification),
            })
          }
        }
      }, 30000) // Every 30 seconds

      return () => clearInterval(interval)
    }
  }, [user, isAuthenticated, toast, preferences])

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem(`notifications-${user.id}`, JSON.stringify(notifications))
    }
  }, [notifications, user])

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
    if (user) {
      localStorage.removeItem(`notifications-${user.id}`)
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        setPreferences,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

// Helper functions

// Check if a notification should be shown based on user preferences
function shouldShowNotification(notification: Notification, preferences: NotificationPreferences): boolean {
  switch (notification.type) {
    case NotificationType.TASK_STATUS_CHANGED:
      return preferences.taskStatusChanged
    case NotificationType.TASK_ASSIGNED:
      return preferences.taskAssigned
    case NotificationType.TASK_MOVED_FROM_BACKLOG:
      return preferences.taskMovedFromBacklog
    case NotificationType.TASK_TAGS_CHANGED:
      return preferences.taskTagsChanged
    case NotificationType.TASK_DELETED:
      return preferences.taskDeleted
    default:
      return true
  }
}

// Generate a title for a notification
function getNotificationTitle(notification: Notification): string {
  switch (notification.type) {
    case NotificationType.TASK_STATUS_CHANGED:
      return "Task Status Changed"
    case NotificationType.TASK_ASSIGNED:
      return "Task Assigned to You"
    case NotificationType.TASK_MOVED_FROM_BACKLOG:
      return "Task Moved from Backlog"
    case NotificationType.TASK_TAGS_CHANGED:
      return "Task Tags Updated"
    case NotificationType.TASK_DELETED:
      return "Task Deleted"
    default:
      return "New Notification"
  }
}

// Generate a description for a notification
function getNotificationDescription(notification: Notification): string {
  switch (notification.type) {
    case NotificationType.TASK_STATUS_CHANGED:
      return `${notification.actorName} changed status of "${notification.taskTitle}" from ${notification.oldStatus} to ${notification.newStatus}`
    case NotificationType.TASK_ASSIGNED:
      return `${notification.actorName} assigned "${notification.taskTitle}" to you`
    case NotificationType.TASK_MOVED_FROM_BACKLOG:
      return `${notification.actorName} moved "${notification.taskTitle}" from Backlog to ${notification.newStatus}`
    case NotificationType.TASK_TAGS_CHANGED:
      const addedText = notification.addedTags?.length > 0 ? `added tags: ${notification.addedTags.join(", ")}` : ""
      const removedText =
        notification.removedTags?.length > 0 ? `removed tags: ${notification.removedTags.join(", ")}` : ""
      const separator = addedText && removedText ? " and " : ""
      return `${notification.actorName} updated tags on "${notification.taskTitle}" (${addedText}${separator}${removedText})`
    case NotificationType.TASK_DELETED:
      return `${notification.actorName} deleted task "${notification.taskTitle}"`
    default:
      return "You have a new notification"
  }
}

// Generate a mock notification for testing
function generateMockNotification(userId: string): Notification {
  const taskId = Math.floor(Math.random() * 10) + 1
  const taskTitles = [
    "Implement login page",
    "Design dashboard",
    "Fix navigation bug",
    "Update documentation",
    "Release v1.0",
    "Add user settings",
    "Optimize database queries",
    "Create user guide",
    "Setup CI/CD pipeline",
    "Refactor authentication system",
  ]
  const taskTitle = taskTitles[taskId % taskTitles.length]

  const actors = [
    { id: "987654321", name: "Jane Smith" },
    { id: "456789123", name: "John Doe" },
  ]
  const actor = actors[Math.floor(Math.random() * actors.length)]

  const notificationTypes = [
    NotificationType.TASK_STATUS_CHANGED,
    NotificationType.TASK_ASSIGNED,
    NotificationType.TASK_MOVED_FROM_BACKLOG,
    NotificationType.TASK_TAGS_CHANGED,
    NotificationType.TASK_DELETED,
  ]
  const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]

  const statuses = ["BACKLOG", "READY", "IN_PROGRESS", "REVIEW", "DONE"]
  const tags = ["dev", "design", "business", "system", "devops"]

  const baseNotification: BaseNotification = {
    id: Date.now().toString(),
    type,
    timestamp: new Date().toISOString(),
    read: false,
    taskId,
    taskTitle,
    actorId: actor.id,
    actorName: actor.name,
  }

  switch (type) {
    case NotificationType.TASK_STATUS_CHANGED:
      const oldStatusIndex = Math.floor(Math.random() * statuses.length)
      let newStatusIndex = Math.floor(Math.random() * statuses.length)
      while (newStatusIndex === oldStatusIndex) {
        newStatusIndex = Math.floor(Math.random() * statuses.length)
      }
      return {
        ...baseNotification,
        type: NotificationType.TASK_STATUS_CHANGED,
        oldStatus: statuses[oldStatusIndex] as any,
        newStatus: statuses[newStatusIndex] as any,
      }

    case NotificationType.TASK_ASSIGNED:
      return {
        ...baseNotification,
        type: NotificationType.TASK_ASSIGNED,
        assigneeId: userId,
        assigneeName: "You",
      }

    case NotificationType.TASK_MOVED_FROM_BACKLOG:
      return {
        ...baseNotification,
        type: NotificationType.TASK_MOVED_FROM_BACKLOG,
        newStatus: statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1] as any,
      }

    case NotificationType.TASK_TAGS_CHANGED:
      const numAddedTags = Math.floor(Math.random() * 3)
      const numRemovedTags = Math.floor(Math.random() * 3)
      const shuffledTags = [...tags].sort(() => 0.5 - Math.random())

      return {
        ...baseNotification,
        type: NotificationType.TASK_TAGS_CHANGED,
        addedTags: shuffledTags.slice(0, numAddedTags),
        removedTags: shuffledTags.slice(numAddedTags, numAddedTags + numRemovedTags),
      }

    case NotificationType.TASK_DELETED:
      return {
        ...baseNotification,
        type: NotificationType.TASK_DELETED,
      }

    default:
      return baseNotification as any
  }
}
