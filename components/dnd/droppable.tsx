"use client"

import type React from "react"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DroppableProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function Droppable({ id, children, className }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn("transition-colors duration-200", isOver && "bg-muted/80 rounded-md", className)}
    >
      {children}
    </div>
  )
}
