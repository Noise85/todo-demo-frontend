"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type TodoItem, Status, type User, type Tag } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiService } from "@/lib/api-service"

interface TaskFormProps {
  task?: TodoItem
  onSubmit: (task: TodoItem | Omit<TodoItem, "id">) => void
  onCancel: () => void
  currentUser: User
}

export function TaskForm({ task, onSubmit, onCancel, currentUser }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate)
  const [ticketImageUrl, setTicketImageUrl] = useState(task?.ticketImageUrl || "")
  const [attachedDocumentUrl, setAttachedDocumentUrl] = useState(task?.attachedDocumentUrl || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [assignee, setAssignee] = useState<User | undefined>(task?.assignee || currentUser)
  const [selectedTags, setSelectedTags] = useState<Tag[]>(task?.tags || [])
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingTags, setIsLoadingTags] = useState(false)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  // Load users and tags on component mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const fetchedUsers = await apiService.getUsers()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error loading users:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    const loadTags = async () => {
      setIsLoadingTags(true)
      try {
        const fetchedTags = await apiService.getTags()
        setTags(fetchedTags)
      } catch (error) {
        console.error("Error loading tags:", error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    loadUsers()
    loadTags()
  }, [])

  // Prevent event propagation to stop dialog from closing
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // In a real app, you would upload the files to a server and get URLs back
    // For this demo, we'll just use the existing URLs or fake ones for new files
    const newTicketImageUrl = imageFile
      ? URL.createObjectURL(imageFile) // This is temporary and would be replaced with a real URL
      : ticketImageUrl

    const newDocumentUrl = documentFile
      ? URL.createObjectURL(documentFile) // This is temporary and would be replaced with a real URL
      : attachedDocumentUrl

    const updatedTask = {
      ...(task ? { id: task.id } : {}),
      title,
      description,
      dueDate,
      status: task?.status || Status.BACKLOG,
      ticketImageUrl: newTicketImageUrl,
      attachedDocumentUrl: newDocumentUrl,
      assignee,
      tags: selectedTags,
    }

    onSubmit(updatedTask as any)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
    }
  }

  const handleTagToggle = (tag: Tag) => {
    if (selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <div className="max-h-[80vh] overflow-auto p-4" onClick={stopPropagation}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2" onClick={stopPropagation}>
          <Label htmlFor="title" onClick={stopPropagation}>
            Title *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
            onClick={stopPropagation}
          />
        </div>

        <div className="space-y-2" onClick={stopPropagation}>
          <Label htmlFor="description" onClick={stopPropagation}>
            Description *
          </Label>
          <RichTextEditor content={description} onChange={setDescription} placeholder="Enter task description..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2" onClick={stopPropagation}>
            <Label htmlFor="dueDate" onClick={stopPropagation}>
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild onClick={stopPropagation}>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                  onClick={stopPropagation}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" onClick={stopPropagation}>
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date)
                  }}
                  initialFocus
                  onDayClick={stopPropagation}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2" onClick={stopPropagation}>
            <Label htmlFor="assignee" onClick={stopPropagation}>
              Assignee
            </Label>
            <Select
              value={assignee?.id}
              onValueChange={(value) => {
                const selectedUser = users.find((user) => user.id === value)
                setAssignee(selectedUser)
              }}
            >
              <SelectTrigger className="w-full" id="assignee">
                <SelectValue placeholder="Select assignee">
                  {assignee ? (
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={assignee.picture || "/placeholder.svg"} alt={assignee.name} />
                        <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{assignee.name}</span>
                    </div>
                  ) : (
                    "Select assignee"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center p-2">Loading users...</div>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={user.picture || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2" onClick={stopPropagation}>
          <Label onClick={stopPropagation}>Tags</Label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
            {isLoadingTags ? (
              <div className="flex justify-center w-full p-2">Loading tags...</div>
            ) : (
              tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.some((t) => t.id === tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedTags.some((t) => t.id === tag.id) ? tag.color : "transparent",
                    borderColor: tag.color,
                    color: selectedTags.some((t) => t.id === tag.id) ? "white" : tag.color,
                  }}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag.name}
                </Badge>
              ))
            )}
            {tags.length === 0 && !isLoadingTags && (
              <div className="text-muted-foreground text-sm">No tags available</div>
            )}
          </div>
        </div>

        <div className="space-y-2" onClick={stopPropagation}>
          <Label htmlFor="ticketImage" onClick={stopPropagation}>
            Ticket Image
          </Label>
          <div className="flex items-center gap-2" onClick={stopPropagation}>
            <Input
              ref={imageInputRef}
              id="ticketImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              onClick={stopPropagation}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                imageInputRef.current?.click()
              }}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {imageFile ? imageFile.name : ticketImageUrl ? "Change Image" : "Upload Image"}
            </Button>
            {(imageFile || ticketImageUrl) && (
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setImageFile(null)
                  setTicketImageUrl("")
                  if (imageInputRef.current) imageInputRef.current.value = ""
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {ticketImageUrl && !imageFile && (
            <p className="text-sm text-muted-foreground" onClick={stopPropagation}>
              Current image: {ticketImageUrl.split("/").pop()}
            </p>
          )}
        </div>

        <div className="space-y-2" onClick={stopPropagation}>
          <Label htmlFor="attachedDocument" onClick={stopPropagation}>
            Attached Document
          </Label>
          <div className="flex items-center gap-2" onClick={stopPropagation}>
            <Input
              ref={documentInputRef}
              id="attachedDocument"
              type="file"
              accept="application/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="hidden"
              onChange={handleDocumentChange}
              onClick={stopPropagation}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                documentInputRef.current?.click()
              }}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {documentFile ? documentFile.name : attachedDocumentUrl ? "Change Document" : "Upload Document"}
            </Button>
            {(documentFile || attachedDocumentUrl) && (
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  setDocumentFile(null)
                  setAttachedDocumentUrl("")
                  if (documentInputRef.current) documentInputRef.current.value = ""
                }}
              >
                Clear
              </Button>
            )}
          </div>
          {attachedDocumentUrl && !documentFile && (
            <p className="text-sm text-muted-foreground" onClick={stopPropagation}>
              Current document: {attachedDocumentUrl.split("/").pop()}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4" onClick={stopPropagation}>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onCancel()
            }}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={stopPropagation}>
            {task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  )
}
