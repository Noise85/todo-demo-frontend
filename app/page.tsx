"use client"

import { useState, useEffect } from "react"
import { Board } from "@/components/board"
import { Backlog } from "@/components/backlog"
import { TaskForm } from "@/components/task-form"
import { Button } from "@/components/ui/button"
import { PlusCircle, LogOut, Filter, ArrowLeft, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type TodoItem, Status, type FilterState } from "@/lib/types"
import { Sidebar } from "@/components/sidebar"
import { FilterBar } from "@/components/filter-bar"
import { ViewToggle } from "@/components/view-toggle"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { apiService } from "@/lib/api-service"
import { config } from "@/lib/config"
import { UserProfile } from "@/components/user-profile"
import { NotificationBell } from "@/components/notification-bell"

function TodoApp() {
  const [tasks, setTasks] = useState<TodoItem[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null)
  const [activeTab, setActiveTab] = useState("board")
  const [viewMode, setViewMode] = useState<"card" | "list">("card")
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL")
  const [isLoading, setIsLoading] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

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
    assigneeId: undefined,
    tagIds: [],
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

  // Add state for users and tags
  const [users, setUsers] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])

  // Function to load tasks with current filters and pagination
  const loadTasks = async () => {
    setIsLoading(true)
    try {
      // Ensure filters.isActive is properly set before making the API call
      const activeFilters = {
        ...filters,
        isActive:
          filters.isActive ||
          filters.title !== "" ||
          Object.values(filters.statusFilters).some((v) => v) ||
          filters.dueDateFrom !== null ||
          filters.dueDateTo !== null ||
          filters.assigneeId !== undefined ||
          (filters.tagIds && filters.tagIds.length > 0),
      }

      const result = await apiService.fetchTasks(
        activeTab,
        statusFilter,
        activeFilters,
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
    const loadUsersAndTags = async () => {
      try {
        const [fetchedUsers, fetchedTags] = await Promise.all([apiService.getUsers(), apiService.getTags()])
        setUsers(fetchedUsers)
        setTags(fetchedTags)
      } catch (error) {
        console.error("Error loading users and tags:", error)
        toast({
          title: "Error",
          description: "Failed to load users and tags. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadUsersAndTags()
  }, [])

  // Update the useEffect that loads tasks to set default filter to current user
  useEffect(() => {
    // Only load tasks if not showing profile or settings
    if (!showProfile) {
      // Set default filter to show only current user's tasks
      if (user && !filters.isActive) {
        setFilters((prev) => ({
          ...prev,
          assigneeId: user.id,
          isActive: true,
        }))
      }

      loadTasks()
    }
  }, [activeTab, statusFilter, currentPage, pageSize, sortField, sortDirection, user, showProfile])

  // Handle search button click
  const handleSearch = () => {
    // Set filters as active
    setFilters((prev) => ({
      ...prev,
      isActive: true,
    }))

    // Reset to first page when searching
    setCurrentPage(1)

    // Load tasks with the updated filters
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
      assigneeId: undefined,
      tagIds: [],
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

    // Reload tasks with new sorting
    loadTasks()
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
    setShowUserMenu(false)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  // Toggle filter visibility
  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible)
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

  // Function to view all tasks assigned to the current user
  const handleViewAllMyTasks = () => {
    setFilters({
      ...filters,
      isActive: true,
      assigneeId: user?.id,
      tagIds: [],
    })
    setCurrentPage(1)
    loadTasks()
  }

  // Add a function to filter tasks by user
  const handleFilterByUser = (userId: string) => {
    setFilters({
      ...filters,
      isActive: true,
      assigneeId: userId,
      tagIds: [],
    })
    setActiveTab("board")
    setStatusFilter("ALL")
    setCurrentPage(1)
    loadTasks()
  }

  // Add a function to filter tasks by tag
  const handleFilterByTag = (tagId: string) => {
    setFilters({
      ...filters,
      isActive: true,
      assigneeId: undefined,
      tagIds: [tagId],
    })
    setActiveTab("board")
    setStatusFilter("ALL")
    setCurrentPage(1)
    loadTasks()
  }

  const handleShowProfile = () => {
    setShowProfile(true)
    setShowUserMenu(false)
  }

  const handleBackFromSection = () => {
    setShowProfile(false)
  }

  const handleCloseProfile = () => {
    setShowProfile(false)
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setViewMode={setViewMode}
        showProfile={showProfile}
      />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-6">
            {showProfile ? (
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">My Profile</h1>
              </div>
            ) : (
              <h1 className="text-3xl font-bold">Todo Board</h1>
            )}
            <div className="flex items-center gap-2">
              {/* Only show these buttons when not in profile or settings view */}
              {!showProfile && (
                <>
                  {/* Filter Toggle Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFilterVisibility}
                    title={isFilterVisible ? "Hide Filters" : "Show Filters"}
                    className="h-9 w-9"
                  >
                    <Filter className="h-5 w-5" />
                    <span className="sr-only">Filters</span>
                  </Button>

                  {/* New Task Button */}
                  <Button variant="default" size="icon" onClick={() => setIsFormOpen(true)} className="h-9 w-9">
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">New Task</span>
                  </Button>
                </>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* User Menu Button */}
              <Button variant="ghost" size="icon" onClick={toggleUserMenu} className="h-9 w-9 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.picture || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>

              {/* Custom Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">My Account</div>
                    <div className="px-4 py-1 text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleShowProfile}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </button>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Only show filter bar when not in settings or profile and filter is visible */}
          {!showProfile && activeTab !== "settings" && isFilterVisible && (
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onSearch={handleSearch}
              onClearFilters={handleClearFilters}
              activeTab={activeTab}
              statusFilter={statusFilter}
            />
          )}

          {/* Only show view toggle when not in settings or profile */}
          {!showProfile && activeTab !== "settings" && (
            <div className="flex justify-start mb-4">
              <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          )}

          {/* New Task Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSubmit={handleCreateTask} onCancel={() => setIsFormOpen(false)} currentUser={user} />
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Show profile if in profile view */}
              {showProfile ? (
                <div className="relative">
                  <UserProfile onClose={handleCloseProfile} />
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
                      filters={filters}
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
                </>
              )}
            </>
          )}
        </div>
      </div>

      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="sm:max-w-[600px]" onClick={(e) => e.stopPropagation()}>
            <DialogHeader onClick={(e) => e.stopPropagation()}>
              <DialogTitle onClick={(e) => e.stopPropagation()}>Edit Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
              currentUser={user}
            />
          </DialogContent>
        </Dialog>
      )}
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
