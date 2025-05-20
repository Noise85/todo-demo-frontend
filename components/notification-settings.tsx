"use client"

import { useNotifications } from "@/contexts/notification-context"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NotificationSettings() {
  const { preferences, setPreferences } = useNotifications()

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure which notifications you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-status-changed" className="font-medium">
                Task Status Changes
              </Label>
              <p className="text-sm text-muted-foreground">Receive notifications when a task status is changed</p>
            </div>
            <Switch
              id="task-status-changed"
              checked={preferences.taskStatusChanged}
              onCheckedChange={() => handleToggle("taskStatusChanged")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-assigned" className="font-medium">
                Task Assignments
              </Label>
              <p className="text-sm text-muted-foreground">Receive notifications when a task is assigned to you</p>
            </div>
            <Switch
              id="task-assigned"
              checked={preferences.taskAssigned}
              onCheckedChange={() => handleToggle("taskAssigned")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-moved-from-backlog" className="font-medium">
                Tasks Moved from Backlog
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when a task assigned to you is moved from backlog
              </p>
            </div>
            <Switch
              id="task-moved-from-backlog"
              checked={preferences.taskMovedFromBacklog}
              onCheckedChange={() => handleToggle("taskMovedFromBacklog")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-tags-changed" className="font-medium">
                Tag Changes
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when tags are added or removed from a task
              </p>
            </div>
            <Switch
              id="task-tags-changed"
              checked={preferences.taskTagsChanged}
              onCheckedChange={() => handleToggle("taskTagsChanged")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-deleted" className="font-medium">
                Task Deletions
              </Label>
              <p className="text-sm text-muted-foreground">Receive notifications when a task is deleted</p>
            </div>
            <Switch
              id="task-deleted"
              checked={preferences.taskDeleted}
              onCheckedChange={() => handleToggle("taskDeleted")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
