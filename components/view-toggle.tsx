"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, List } from "lucide-react"

interface ViewToggleProps {
  viewMode: "card" | "list"
  setViewMode: (mode: "card" | "list") => void
}

export function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="flex border rounded-md overflow-hidden">
      <Button
        variant={viewMode === "card" ? "default" : "ghost"}
        size="sm"
        className="rounded-none"
        onClick={() => setViewMode("card")}
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Cards
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        className="rounded-none"
        onClick={() => setViewMode("list")}
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
    </div>
  )
}
