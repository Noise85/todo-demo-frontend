"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { type TodoItem, Status } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TaskFormProps {
  task?: TodoItem
  onSubmit: (task: TodoItem | Omit<TodoItem, "id">) => void
  onCancel: () => void
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate)
  const [ticketImageUrl, setTicketImageUrl] = useState(task?.ticketImageUrl || "")
  const [attachedDocumentUrl, setAttachedDocumentUrl] = useState(task?.attachedDocumentUrl || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

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
    }

    onSubmit(updatedTask as any)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticketImage">Ticket Image</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={imageInputRef}
            id="ticketImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()} className="flex-1">
            <Upload className="mr-2 h-4 w-4" />
            {imageFile ? imageFile.name : ticketImageUrl ? "Change Image" : "Upload Image"}
          </Button>
          {(imageFile || ticketImageUrl) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
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
          <p className="text-sm text-muted-foreground">Current image: {ticketImageUrl.split("/").pop()}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachedDocument">Attached Document</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={documentInputRef}
            id="attachedDocument"
            type="file"
            accept="application/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="hidden"
            onChange={handleDocumentChange}
          />
          <Button type="button" variant="outline" onClick={() => documentInputRef.current?.click()} className="flex-1">
            <Upload className="mr-2 h-4 w-4" />
            {documentFile ? documentFile.name : attachedDocumentUrl ? "Change Document" : "Upload Document"}
          </Button>
          {(documentFile || attachedDocumentUrl) && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
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
          <p className="text-sm text-muted-foreground">Current document: {attachedDocumentUrl.split("/").pop()}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{task ? "Update Task" : "Create Task"}</Button>
      </div>
    </form>
  )
}
