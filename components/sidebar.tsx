"use client"

import { Button } from "@/components/ui/button"
import { Status } from "@/lib/types"
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckSquare,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  statusFilter: Status | "ALL"
  setStatusFilter: (status: Status | "ALL") => void
  setViewMode: (mode: "card" | "list") => void
}

export function Sidebar({ activeTab, setActiveTab, statusFilter, setStatusFilter, setViewMode }: SidebarProps) {
  return (
    <div className="w-64 bg-muted/40 border-r h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-xl flex items-center">
          <Layers className="mr-2 h-5 w-5" />
          Todo Board
        </h2>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-sm text-muted-foreground mb-3">VIEWS</h3>
        <nav className="space-y-1">
          <Button
            variant="ghost"
            className={cn("w-full justify-start", activeTab === "board" && "bg-muted")}
            onClick={() => {
              setActiveTab("board")
              setStatusFilter("ALL")
              setViewMode("card") // Set view mode to card by default for board
            }}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Board
          </Button>

          <Button
            variant="ghost"
            className={cn("w-full justify-start", activeTab === "backlog" && "bg-muted")}
            onClick={() => {
              setActiveTab("backlog")
              setStatusFilter("ALL")
              setViewMode("list") // Set view mode to list by default for backlog
            }}
          >
            <ListTodo className="mr-2 h-4 w-4" />
            Backlog
          </Button>
        </nav>
      </div>

      {/* Only show filters when board tab is active */}
      {activeTab === "board" && (
        <div className="p-4 border-t">
          <h3 className="font-medium text-sm text-muted-foreground mb-3">FILTERS</h3>
          <nav className="space-y-1">
            <Button
              variant="ghost"
              className={cn("w-full justify-start", statusFilter === "ALL" && "bg-muted")}
              onClick={() => {
                setStatusFilter("ALL")
                setViewMode("list") // Set view mode to list for filters
              }}
            >
              <Layers className="mr-2 h-4 w-4" />
              All Tasks
            </Button>

            <Button
              variant="ghost"
              className={cn("w-full justify-start", statusFilter === Status.READY && "bg-muted")}
              onClick={() => {
                setStatusFilter(Status.READY)
                setViewMode("list") // Set view mode to list for filters
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              Ready
            </Button>

            <Button
              variant="ghost"
              className={cn("w-full justify-start", statusFilter === Status.IN_PROGRESS && "bg-muted")}
              onClick={() => {
                setStatusFilter(Status.IN_PROGRESS)
                setViewMode("list") // Set view mode to list for filters
              }}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              In Progress
            </Button>

            <Button
              variant="ghost"
              className={cn("w-full justify-start", statusFilter === Status.REVIEW && "bg-muted")}
              onClick={() => {
                setStatusFilter(Status.REVIEW)
                setViewMode("list") // Set view mode to list for filters
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Review
            </Button>

            <Button
              variant="ghost"
              className={cn("w-full justify-start", statusFilter === Status.DONE && "bg-muted")}
              onClick={() => {
                setStatusFilter(Status.DONE)
                setViewMode("list") // Set view mode to list for filters
              }}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Done
            </Button>
          </nav>
        </div>
      )}

      <div className="mt-auto p-4 border-t">
        <Button
          variant="ghost"
          className={cn("w-full justify-start", activeTab === "settings" && "bg-muted")}
          onClick={() => setActiveTab("settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  )
}
