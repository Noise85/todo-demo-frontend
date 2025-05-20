"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuFooter,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/contexts/notification-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleNotificationClick = (notification: any) => {
    setSelectedNotification(notification)
    setIsDialogOpen(true)
    markAsRead(notification.id)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const getNotificationContent = (notification: any) => {
    switch (notification.type) {
      case "TASK_STATUS_CHANGED":
        return (
          <>
            <p className="mb-2">
              <strong>{notification.actorName}</strong> changed the status of task{" "}
              <strong>"{notification.taskTitle}"</strong>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-gray-100 rounded dark:bg-gray-800">{notification.oldStatus}</span>
              <span>→</span>
              <span className="px-2 py-1 bg-gray-100 rounded dark:bg-gray-800">{notification.newStatus}</span>
            </div>
          </>
        )
      case "TASK_ASSIGNED":
        return (
          <p>
            <strong>{notification.actorName}</strong> assigned task <strong>"{notification.taskTitle}"</strong> to you
          </p>
        )
      case "TASK_MOVED_FROM_BACKLOG":
        return (
          <p>
            <strong>{notification.actorName}</strong> moved task <strong>"{notification.taskTitle}"</strong> from
            Backlog to <strong>{notification.newStatus}</strong>
          </p>
        )
      case "TASK_TAGS_CHANGED":
        return (
          <>
            <p className="mb-2">
              <strong>{notification.actorName}</strong> updated tags on task <strong>"{notification.taskTitle}"</strong>
            </p>
            {notification.addedTags && notification.addedTags.length > 0 && (
              <div className="mb-1">
                <span className="text-sm font-medium">Added: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {notification.addedTags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded dark:bg-green-900 dark:text-green-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {notification.removedTags && notification.removedTags.length > 0 && (
              <div>
                <span className="text-sm font-medium">Removed: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {notification.removedTags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded dark:bg-red-900 dark:text-red-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      case "TASK_DELETED":
        return (
          <p>
            <strong>{notification.actorName}</strong> deleted task <strong>"{notification.taskTitle}"</strong>
          </p>
        )
      default:
        return <p>You have a new notification</p>
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-transparent p-0 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 text-xs">
                Mark all as read
              </Button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`px-4 py-3 cursor-pointer ${notification.read ? "" : "bg-muted/50"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <p className="font-medium">{getNotificationTitle(notification)}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getNotificationDescription(notification)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuFooter>
                <Button variant="ghost" size="sm" onClick={clearNotifications} className="w-full text-xs">
                  Clear all notifications
                </Button>
              </DropdownMenuFooter>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedNotification && getNotificationTitle(selectedNotification)}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedNotification && (
              <>
                <div className="mb-4">{getNotificationContent(selectedNotification)}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedNotification.timestamp && format(new Date(selectedNotification.timestamp), "PPpp")}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseDialog}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Helper functions (duplicated from notification-context.tsx for simplicity)
function getNotificationTitle(notification: any): string {
  switch (notification.type) {
    case "TASK_STATUS_CHANGED":
      return "Task Status Changed"
    case "TASK_ASSIGNED":
      return "Task Assigned to You"
    case "TASK_MOVED_FROM_BACKLOG":
      return "Task Moved from Backlog"
    case "TASK_TAGS_CHANGED":
      return "Task Tags Updated"
    case "TASK_DELETED":
      return "Task Deleted"
    default:
      return "New Notification"
  }
}

function getNotificationDescription(notification: any): string {
  switch (notification.type) {
    case "TASK_STATUS_CHANGED":
      return `${notification.actorName} changed status of "${notification.taskTitle}" from ${notification.oldStatus} to ${notification.newStatus}`
    case "TASK_ASSIGNED":
      return `${notification.actorName} assigned "${notification.taskTitle}" to you`
    case "TASK_MOVED_FROM_BACKLOG":
      return `${notification.actorName} moved "${notification.taskTitle}" from Backlog to ${notification.newStatus}`
    case "TASK_TAGS_CHANGED":
      const addedText = notification.addedTags?.length > 0 ? `added tags: ${notification.addedTags.join(", ")}` : ""
      const removedText =
        notification.removedTags?.length > 0 ? `removed tags: ${notification.removedTags.join(", ")}` : ""
      const separator = addedText && removedText ? " and " : ""
      return `${notification.actorName} updated tags on "${notification.taskTitle}" (${addedText}${separator}${removedText})`
    case "TASK_DELETED":
      return `${notification.actorName} deleted task "${notification.taskTitle}"`
    default:
      return "You have a new notification"
  }
}
