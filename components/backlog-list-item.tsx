"use client"

import type { TodoItem } from "@/lib/types"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Check, FileText, ImageIcon } from "lucide-react"

interface BacklogListItemProps {
  task: TodoItem
  onEdit: (task: TodoItem) => void
  onDelete: (taskId: number) => void
  onMoveToReady: (taskId: number) => void
}

export function BacklogListItem({ task, onEdit, onDelete, onMoveToReady }: BacklogListItemProps) {
  // Truncate description to 50 characters
  const truncatedDescription =
    task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description

  return (
    <tr className="border-b">
      <td className="px-4 py-3">{task.title}</td>
      <td className="px-4 py-3 text-muted-foreground">{truncatedDescription}</td>
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoveToReady(task.id)}
            title="Mark as Ready"
            className="text-green-600"
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as Ready</span>
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
