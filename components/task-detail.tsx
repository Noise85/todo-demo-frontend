"use client"

import type { TodoItem } from "@/lib/types"
import { format } from "date-fns"
import { Calendar, FileText } from "lucide-react"
import NextImage from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TaskDetailProps {
  task: TodoItem
  onClose?: () => void
}

export function TaskDetail({ task, onClose }: TaskDetailProps) {
  return (
    <div className="max-h-[80vh] overflow-auto p-6 space-y-6">
      {/* Task title */}
      <h2 className="text-2xl font-bold">{task.title}</h2>

      {/* Assignee section */}
      {task.assignee && (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={task.assignee.picture || "/placeholder.svg"} alt={task.assignee.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {task.assignee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{task.assignee.name}</div>
            <div className="text-sm text-muted-foreground">{task.assignee.email}</div>
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
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

      {/* Due date */}
      {task.dueDate && (
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Due: {format(new Date(task.dueDate), "MMMM d, yyyy")}</span>
        </div>
      )}

      {/* Description */}
      <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-md">
        <div dangerouslySetInnerHTML={{ __html: task.description }} />
      </div>

      {/* Attachments section */}
      {(task.ticketImageUrl || task.attachedDocumentUrl) && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-md font-medium">Attachments</h3>

          {task.ticketImageUrl && (
            <div className="mt-2">
              <NextImage
                src={task.ticketImageUrl}
                alt="Ticket image"
                width={400}
                height={200}
                className="rounded-md object-cover max-w-full h-auto border"
              />
            </div>
          )}

          {task.attachedDocumentUrl && (
            <div className="mt-2">
              <a
                href={task.attachedDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
              >
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                <span className="text-sm font-medium">{task.attachedDocumentUrl.split("/").pop()}</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
