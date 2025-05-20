"use client"

import { type TodoItem, Status } from "@/lib/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {Pencil, Trash2, FileText, ImageIcon, Eye, SquarePen} from "lucide-react"

// Add imports for the new components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskListItemProps {
  task: TodoItem
  onEdit: (task: TodoItem) => void
  onDelete: (taskId: number) => void
  onView: (task: TodoItem) => void
  onConfirmDelete: (taskId: number) => void
  onStatusChange?: (status: Status) => void
  onSort?: (column: string) => void
}

// Update the TaskListItem component to display assignee and tags
export function TaskListItem({ task, onEdit, onDelete, onView, onConfirmDelete, onStatusChange }: TaskListItemProps) {
  // Update the getTextFromHtml function to better handle HTML content and preserve line breaks
  const getTextFromHtml = (html: string) => {
    // Create a temporary DOM element
    const div = document.createElement("div")
    div.innerHTML = html

    // Get the text content
    let text = div.textContent || div.innerText || ""

    // Replace multiple line breaks with a single one for cleaner display
    text = text.replace(/(\r\n|\n|\r){2,}/g, "\n")

    // Truncate to 50 characters
    if (text.length > 50) {
      text = text.substring(0, 50) + "..."
    }

    return text
  }

  const textDescription = getTextFromHtml(task.description)
  const truncatedDescription = textDescription.length > 50 ? `${textDescription.substring(0, 50)}...` : textDescription

  // Map status to badge - using the same badge styling as in card view
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
      case Status.REOPENED:
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            Reopened
          </Badge>
        )
      case Status.DONE:
        return <Badge variant="success">Done</Badge>
    }
  }

  return (
    <>
      <td className="px-4 py-3 text-foreground">{task.title}</td>
      <td className="px-4 py-3 text-muted-foreground whitespace-pre-line">{truncatedDescription}</td>
      <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
      <td className="px-4 py-3">
        {task.assignee ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.picture || "/placeholder.svg"} alt={task.assignee.name} />
                  <AvatarFallback>{task.assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{task.assignee.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {task.tags &&
            task.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs"
                style={{
                  backgroundColor: `${tag.color}20`, // 20% opacity
                  borderColor: tag.color,
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "-"}
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation()
                    onEdit(task)
                }}
                className="h-10 w-10"
                title="Edit"
            >
                <SquarePen className="h-10 w-10" />
                <span className="sr-only">Edit</span>
            </Button>

            {!task.ticketImageUrl && (
                <Button variant="ghost" size="icon" asChild className="h-10 w-10 opacity-50" title="View Document"
                        onClick={(e) => e.stopPropagation()}>
                    <div
                        rel="noopener noreferrer">
                        <ImageIcon className="h-10 w-10" />
                        <span className="sr-only">View Document</span>
                    </div>
                </Button>
            )}

            {task.ticketImageUrl && (
                <Button variant="ghost" size="icon" asChild className="h-10 w-10" title="View Image">
                    <a
                        href={task.ticketImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ImageIcon className="h-10 w-10" />
                        <span className="sr-only">View Image</span>
                    </a>
                </Button>
            )}

            {!task.attachedDocumentUrl && (
                <Button variant="ghost" size="icon" asChild className="h-10 w-10 opacity-50" title="View Document"
                        onClick={(e) => e.stopPropagation()}>
                    <div
                        rel="noopener noreferrer">
                        <FileText className="h-10 w-10" />
                        <span className="sr-only">View Document</span>
                    </div>
                </Button>
            )}

            {task.attachedDocumentUrl && (
                <Button variant="ghost" size="icon" asChild className="h-10 w-10" title="View Document">
                    <a
                        href={task.attachedDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileText className="h-10 w-10" />
                        <span className="sr-only">View Document</span>
                    </a>
                </Button>
            )}

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation()
                    onConfirmDelete(task.id)
                }}
                className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                title="Delete">
                <Trash2 className="h-10 w-10" />
                <span className="sr-only">Delete</span>
            </Button>
        </div>
      </td>
    </>
  )
}
