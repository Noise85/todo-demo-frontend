"use client"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type TodoItem, Status } from "@/lib/types"
import { Calendar, ExternalLink, FileText, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: TodoItem
  onEdit: (task: TodoItem) => void
  onDelete: (taskId: number) => void
  onMoveToReady?: (taskId: number) => void
  isDraggable?: boolean
}

export function TaskCard({ task, onEdit, onDelete, onMoveToReady, isDraggable = false }: TaskCardProps) {
  // Truncate description to 50 characters
  const truncatedDescription =
    task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description

  return (
    <Card className={cn("mb-0", isDraggable && "cursor-grab active:cursor-grabbing")}>
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm">{task.title}</h3>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="h-7 w-7">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="h-7 w-7 text-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 text-sm">
        <p className="text-muted-foreground mb-2">{truncatedDescription}</p>

        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
          </div>
        )}

        {task.attachedDocumentUrl && (
          <div className="flex items-center text-xs text-blue-500 hover:underline">
            <FileText className="h-3 w-3 mr-1" />
            <a href={task.attachedDocumentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
              Attached document
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
      </CardContent>

      {onMoveToReady && task.status === Status.BACKLOG && (
        <CardFooter className="p-3 pt-0">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onMoveToReady(task.id)}>
            Mark as Ready
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
