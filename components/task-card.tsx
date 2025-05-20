"use client"

import { cn } from "@/lib/utils"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type TodoItem, Status } from "@/lib/types"
import {Calendar, ExternalLink, FileText, Pencil, Trash2, Eye, SquareCodeIcon, SquarePenIcon} from "lucide-react"
import { format } from "date-fns"
import NextImage from "next/image"

// Add imports for the new components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskCardProps {
  task: TodoItem
  onEdit: (task: TodoItem) => void
  onDelete: (taskId: number) => void
  onView?: (task: TodoItem) => void
  onMoveToReady?: (taskId: number) => void
  isDraggable?: boolean
  isBacklog?: boolean
}

// Update the TaskCard component to display assignee and tags
export function TaskCard({
  task,
  onEdit,
  onDelete,
  onView,
  onMoveToReady,
  isDraggable = false,
  isBacklog = false,
}: TaskCardProps) {
  // Extract text content from HTML for truncation
  const getTextFromHtml = (html: string) => {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerText || ""
  }

  const textDescription = getTextFromHtml(task.description)
  const truncatedDescription = textDescription.length > 50 ? `${textDescription.substring(0, 50)}...` : textDescription

  // Calculate card border color based on the first tag
  const cardBorderStyle = task.tags && task.tags.length > 0 ? { borderLeft: `4px solid ${task.tags[0].color}` } : {}

  return (
    <Card
      className={cn(
        "mb-0 shadow-sm hover:shadow-md transition-all duration-200",
        isDraggable && "cursor-grab active:cursor-grabbing",
      )}
      style={cardBorderStyle}
    >
      <CardHeader className="p-3 pb-0 bg-muted/30">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm">{task.title}</h3>
          <div className="flex space-x-1">
            {onView && (
              <Button variant="ghost" size="icon" onClick={() => onView(task)} className="h-7 w-7">
                <SquareCodeIcon className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="h-7 w-7">
              <SquarePenIcon className="h-4 w-4" />
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
        {/* Display assignee with tooltip */}
        {task.assignee && (
          <div className="mb-2">
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
          </div>
        )}

        <p className="text-muted-foreground mb-2">{truncatedDescription}</p>

        {/* Display tags - only if not in backlog view */}
        {!isBacklog && task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.map((tag) => (
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
        )}

        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
          </div>
        )}

        {task.ticketImageUrl && (
          <div className="mb-2">
            <NextImage
              src={task.ticketImageUrl || "/placeholder.svg"}
              alt="Ticket image"
              width={200}
              height={100}
              className="rounded-md object-cover w-full h-auto"
            />
          </div>
        )}

        {task.attachedDocumentUrl && (
          <div className="flex items-center text-xs text-primary hover:underline">
            <FileText className="h-3 w-3 mr-1" />
            <a href={task.attachedDocumentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
              Attached document
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
      </CardContent>

      {onMoveToReady && task.status === Status.BACKLOG && (
        <CardFooter className="p-3 pt-0 bg-muted/20">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onMoveToReady(task.id)}>
            Mark as Ready
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
