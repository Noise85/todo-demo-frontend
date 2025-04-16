"use client"

import { useState, useEffect } from "react"
import { Board } from "@/components/board"
import { Backlog } from "@/components/backlog"
import { TaskForm } from "@/components/task-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, LogOut } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { type TodoItem, Status, type FilterState } from "@/lib/types"
import { Sidebar } from "@/components/sidebar"
import { FilterBar } from "@/components/filter-bar"
import { ViewToggle } from "@/components/view-toggle"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiService } from "@/lib/api-service"
import { config } from "@/lib/config"

function TodoApp() {
  const [tasks, setTasks] = useState<TodoItem[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null)
  const [activeTab, setActiveTab] = useState("board")
  const [viewMode, setViewMode] = useState<"card" | "list">("card")
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL")
  const [isLoading, setIsLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    isActive: false,
    title: "",
    titleSearchMode: "contains",
    statusFilters: {
      [Status.READY]: false,
      [Status.IN_PROGRESS]: false,
      [Status.REVIEW]: false,
      [Status.REOPENED]: false,
      [Status.DONE]: false,
    },
    dueDateFrom: null,
    dueDateTo: null,
  })

  // Sorting state
  const [sortField, setSortField] = useState<string | undefined>(config.defaultSortField)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(config.defaultSortDirection)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(config.defaultPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const { toast } = useToast()
  const { user, logout } = useAuth()

  // Function to load tasks with current filters and pagination
  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const result = await apiService.fetchTasks(
        activeTab,
        statusFilter,
        filters,
        currentPage,
        pageSize,
        sortField,
        sortDirection,
      )

      setTasks(result.content)
      setTotalItems(result.totalElements)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load tasks on initial render and when activeTab, statusFilter, or pagination changes
  useEffect(() => {
    loadTasks()
  }, [activeTab, statusFilter, currentPage, pageSize, sortField, sortDirection])

  // Handle search button click
  const handleSearch = () => {
    // Set filters as active
    setFilters((prev) => ({
      ...prev,
      isActive: true,
    }))

    // Reset to first page when searching
    setCurrentPage(1)
    loadTasks()
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      isActive: false,
      title: "",
      titleSearchMode: "contains",
      statusFilters: {
        [Status.READY]: false,
        [Status.IN_PROGRESS]: false,
        [Status.REVIEW]: false,
        [Status.REOPENED]: false,
        [Status.DONE]: false,
      },
      dueDateFrom: null,
      dueDateTo: null,
    })

    // Reset to first page
    setCurrentPage(1)
    loadTasks()
  }

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Set new column and default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const handleCreateTask = async (task: Omit<TodoItem, "id">) => {
    try {
      await apiService.createTask(task)

      // Refresh the task list to include the new task
      loadTasks()

      setIsFormOpen(false)
      toast({
        title: "Task Created",
        description: "Your task has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTask = async (updatedTask: TodoItem) => {
    try {
      await apiService.updateTask(updatedTask)

      // Update the task in the current list if it exists
      setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))

      // Refresh the task list to ensure consistency
      loadTasks()

      setEditingTask(null)
      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await apiService.deleteTask(taskId)
      const taskToDelete = tasks.find((task) => task.id === taskId)

      // Remove the task from the current list
      setTasks(tasks.filter((task) => task.id !== taskId))

      // Refresh the task list to update pagination
      loadTasks()

      if (taskToDelete && taskToDelete.status === Status.DONE) {
        toast({
          title: "Task Archived",
          description: "The completed task has been archived.",
        })
      } else {
        toast({
          title: "Task Deleted",
          description: "Your task has been deleted successfully.",
        })
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMoveTask = async (taskId: number, newStatus: Status) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const updatedTask = { ...task, status: newStatus }

    try {
      await apiService.updateTask(updatedTask)

      // Update the task in the current list
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)))

      // Refresh the task list to update status grouping
      loadTasks()

      // If moving to READY from BACKLOG, create Google Calendar event
      if (task.status === Status.BACKLOG && newStatus === Status.READY) {
        createGoogleCalendarEvent(task)
      }

      toast({
        title: "Task Updated",
        description: `Task moved to ${newStatus.replace("_", " ").toLowerCase()}.`,
      })
    } catch (error) {
      console.error("Error moving task:", error)
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const createGoogleCalendarEvent = (task: TodoItem) => {
    // Mock function - would be replaced with actual Google Calendar API call
    console.log("Creating Google Calendar event for task:", task)
    toast({
      title: "Calendar Event Created",
      description: `"${task.title}" has been added to your Google Calendar`,
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  // Pagination props
  const paginationProps = {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setViewMode={setViewMode}
      />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Todo Board</h1>
            <div className="flex items-center gap-4">
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskForm onSubmit={handleCreateTask} onCancel={() => setIsFormOpen(false)} />
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.picture || "/placeholder.svg"} alt={user?.name || "User"} />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuLabel className="font-normal">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Only show filter bar when not in settings */}
          {activeTab !== "settings" && (
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
              activeTab={activeTab}
              statusFilter={statusFilter}
            />
          )}

          {/* Only show view toggle when not in settings */}
          {activeTab !== "settings" && (
            <div className="flex justify-end mb-4">
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {activeTab === "board" && (
                <Board
                  tasks={tasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onMoveTask={handleMoveTask}
                  setEditingTask={setEditingTask}
                  viewMode={viewMode}
                  pagination={paginationProps}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                />
              )}

              {activeTab === "backlog" && (
                <Backlog
                  tasks={tasks}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onMoveToReady={(taskId) => handleMoveTask(taskId, Status.READY)}
                  setEditingTask={setEditingTask}
                  viewMode={viewMode}
                  pagination={paginationProps}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                />
              )}

              {activeTab === "settings" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  <CalendarSettings />
                  <ApiSettings />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <TaskForm task={editingTask} onSubmit={handleUpdateTask} onCancel={() => setEditingTask(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CalendarSettings() {
  const [isConnected, setIsConnected] = useState(false)
  const [calendarId, setCalendarId] = useState("")
  const [autoCreateEvents, setAutoCreateEvents] = useState(true)
  const { toast } = useToast()

  const handleConnect = () => {
    // Mock Google OAuth flow
    setIsConnected(true)
    toast({
      title: "Connected to Google Calendar",
      description: "Your account has been successfully connected",
    })
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    toast({
      title: "Disconnected from Google Calendar",
      description: "Your account has been disconnected",
    })
  }

  return (
    <div className="space-y-6 mb-8">
      <div>
        <h3 className="text-lg font-medium mb-2">Google Calendar Integration</h3>
        <p className="text-muted-foreground mb-4">
          Connect your Google Calendar to automatically create events when tasks are moved to Ready status.
        </p>

        {!isConnected ? (
          <Button onClick={handleConnect}>Connect Google Calendar</Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Connected to Google Calendar</span>
            </div>

            <div className="space-y-2">
              <label htmlFor="calendarId" className="block text-sm font-medium">
                Calendar ID (leave empty for primary)
              </label>
              <Input
                id="calendarId"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                placeholder="e.g., example@gmail.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoCreateEvents"
                checked={autoCreateEvents}
                onChange={(e) => setAutoCreateEvents(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoCreateEvents" className="text-sm font-medium">
                Automatically create events when tasks are moved to Ready
              </label>
            </div>

            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ApiSettings() {
  const [useRealApi, setUseRealApi] = useState(config.useRealApi)
  const [apiBaseUrl, setApiBaseUrl] = useState(config.apiBaseUrl)
  const { toast } = useToast()

  const handleSaveSettings = () => {
    // In a real app, you would persist these settings
    // For now, we'll just update the config object
    config.useRealApi = useRealApi
    config.apiBaseUrl = apiBaseUrl

    toast({
      title: "Settings Saved",
      description: `API Mode: ${useRealApi ? "Real API" : "Mock Data"}, Base URL: ${apiBaseUrl}`,
    })

    // Force a page reload to apply the new settings
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">API Settings</h3>
        <p className="text-muted-foreground mb-4">
          Configure the API settings for the application. You can switch between using mock data and real API calls.
        </p>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useRealApi"
              checked={useRealApi}
              onChange={(e) => setUseRealApi(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="useRealApi" className="text-sm font-medium">
              Use Real API (uncheck to use mock data)
            </label>
          </div>

          <div className="space-y-2">
            <label htmlFor="apiBaseUrl" className="block text-sm font-medium">
              API Base URL
            </label>
            <Input
              id="apiBaseUrl"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="e.g., http://localhost:8080"
            />
          </div>

          <Button onClick={handleSaveSettings}>Save API Settings</Button>
        </div>
      </div>
    </div>
  )
}

// Wrap the TodoApp with ProtectedRoute
export default function Page() {
  return (
    <ProtectedRoute>
      <TodoApp />
    </ProtectedRoute>
  )
}
