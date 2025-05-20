"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"
import { apiService } from "@/lib/api-service"
import { Loader2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserTaskStatsProps {
  onFilterByUser: (userId: string) => void
}

interface UserStats extends User {
  taskCount: number
}

export function UserTaskStats({ onFilterByUser }: UserTaskStatsProps) {
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadUserStats = async () => {
      setIsLoading(true)
      try {
        // Get all users
        const users = await apiService.getUsers()

        // For each user, count their tasks
        const stats = await Promise.all(
          users.map(async (user) => {
            try {
              const result = await apiService.fetchTasks(
                "board",
                "ALL",
                {
                  isActive: true,
                  title: "",
                  titleSearchMode: "contains",
                  statusFilters: {},
                  dueDateFrom: null,
                  dueDateTo: null,
                  assigneeId: user.id,
                  tagIds: [],
                },
                1,
                1, // We only need the count, not the actual tasks
                undefined,
                undefined,
              )

              return {
                ...user,
                taskCount: result.totalElements,
              }
            } catch (error) {
              console.error(`Error fetching tasks for user ${user.id}:`, error)
              return {
                ...user,
                taskCount: 0,
              }
            }
          }),
        )

        // Sort by task count (descending)
        stats.sort((a, b) => b.taskCount - a.taskCount)

        setUserStats(stats)
      } catch (error) {
        console.error("Error loading user stats:", error)
        toast({
          title: "Error",
          description: "Failed to load user statistics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserStats()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {userStats.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.picture || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {user.taskCount} {user.taskCount === 1 ? "task" : "tasks"}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onFilterByUser(user.id)}>
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
