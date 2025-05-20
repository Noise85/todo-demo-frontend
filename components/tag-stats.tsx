"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Tag } from "@/lib/types"
import { apiService } from "@/lib/api-service"
import { Loader2, Tags } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TagStatsProps {
  onFilterByTag: (tagId: string) => void
}

interface TagStats extends Tag {
  taskCount: number
}

export function TagStats({ onFilterByTag }: TagStatsProps) {
  const [tagStats, setTagStats] = useState<TagStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadTagStats = async () => {
      setIsLoading(true)
      try {
        // Get all tags
        const tags = await apiService.getTags()

        // For each tag, count their tasks
        const stats = await Promise.all(
          tags.map(async (tag) => {
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
                  assigneeId: undefined,
                  tagIds: [tag.id],
                },
                1,
                1, // We only need the count, not the actual tasks
                undefined,
                undefined,
              )

              return {
                ...tag,
                taskCount: result.totalElements,
              }
            } catch (error) {
              console.error(`Error fetching tasks for tag ${tag.id}:`, error)
              return {
                ...tag,
                taskCount: 0,
              }
            }
          }),
        )

        // Sort by task count (descending)
        stats.sort((a, b) => b.taskCount - a.taskCount)

        setTagStats(stats)
      } catch (error) {
        console.error("Error loading tag stats:", error)
        toast({
          title: "Error",
          description: "Failed to load tag statistics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTagStats()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Tags className="mr-2 h-5 w-5" />
          Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {tagStats.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge
                    variant="outline"
                    className="mr-2"
                    style={{
                      backgroundColor: `${tag.color}20`, // 20% opacity
                      borderColor: tag.color,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {tag.taskCount} {tag.taskCount === 1 ? "task" : "tasks"}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onFilterByTag(tag.id)}>
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
