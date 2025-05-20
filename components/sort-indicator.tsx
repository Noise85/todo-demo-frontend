"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SortIndicatorProps {
  field: string
  label: string
  currentSortField?: string
  currentSortDirection?: "asc" | "desc"
  onSort: (field: string) => void
}

export function SortIndicator({ field, label, currentSortField, currentSortDirection, onSort }: SortIndicatorProps) {
  const isActive = currentSortField === field

  return (
    <Button variant="ghost" size="sm" className="h-8 px-2 text-sm font-medium" onClick={() => onSort(field)}>
      <span>{label}</span>
      {isActive &&
        (currentSortDirection === "asc" ? (
          <ArrowUp className="ml-1 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-1 h-4 w-4" />
        ))}
    </Button>
  )
}
