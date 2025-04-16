"use client"

import { type TodoItem, Status } from "@/lib/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, FileText, ImageIcon } from "lucide-react"

interface TaskListItemProps {
  task: TodoItem
  onEdit: (task: TodoItem) => void
  onDelete: (taskId: number) => void
  onStatusChange?: (status: Status) => void
  onSort?: (column: string) => void
}

export function TaskListItem({ task, onEdit, onDelete, onStatusChange }: TaskListItemProps) {
  // Truncate description to 50 characters
  const truncatedDescription =
    task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description

  // Map status to badge
  const getStatusBadge = (status: Status) => {
    switch (status) {
      case Status.BACKLOG:
        return <Badge variant="outline">Backlog</Badge>
      case Status.READY:
        return <Badge variant="secondary">Ready</Badge>
      case Status.IN_PROGRESS:
        return <Badge variant="default">In Progress</Badge>
      case Status.REVIEW:
        return <Badge variant="warning">Review</Badge>
      case Status.DONE:
        return <Badge variant="success">Done</Badge>
    }
  }

  return (
    <tr className="border-b">
      <td className="px-4 py-3">{task.title}</td>
      <td className="px-4 py-3 text-muted-foreground">{truncatedDescription}</td>
      <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
      <td className="px-4 py-3">{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}</td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)} title="Edit">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            title="Delete"
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>

          {task.ticketImageUrl && (
            <Button variant="ghost" size="icon" asChild title="View Image">
              <a href={task.ticketImageUrl} target="_blank" rel="noopener noreferrer">
                <ImageIcon className="h-4 w-4" />
                <span className="sr-only">View Image</span>
              </a>
            </Button>
          )}

          {task.attachedDocumentUrl && (
            <Button variant="ghost" size="icon" asChild title="View Document">
              <a href={task.attachedDocumentUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4" />
                <span className="sr-only">View Document</span>
              </a>
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
