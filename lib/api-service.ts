import { config } from "./config"
import { type TodoItem, Status, type TaskSearchDTO, type PageResponse, type FilterState } from "./types"
import { format } from "date-fns"

// Mock data
const mockTasks: TodoItem[] = [
  {
    id: 1,
    title: "Implement login page",
    description: "Create a login page with email and password fields",
    dueDate: new Date("2023-12-31"),
    status: Status.BACKLOG,
    ticketImageUrl: "",
    attachedDocumentUrl: "",
  },
  {
    id: 2,
    title: "Design dashboard",
    description: "Create wireframes for the dashboard",
    dueDate: new Date("2023-12-15"),
    status: Status.READY,
    ticketImageUrl: "",
    attachedDocumentUrl: "",
  },
  {
    id: 3,
    title: "Fix navigation bug",
    description: "Navigation menu doesn't close on mobile",
    dueDate: new Date("2023-12-10"),
    status: Status.IN_PROGRESS,
    ticketImageUrl: "",
    attachedDocumentUrl: "",
  },
  {
    id: 4,
    title: "Update documentation",
    description: "Update API documentation with new endpoints",
    dueDate: new Date("2023-12-20"),
    status: Status.REVIEW,
    ticketImageUrl: "",
    attachedDocumentUrl: "",
  },
  {
    id: 5,
    title: "Release v1.0",
    description: "Prepare for initial release",
    dueDate: new Date("2023-12-25"),
    status: Status.DONE,
    ticketImageUrl: "",
    attachedDocumentUrl: "",
  },
  // Add more mock tasks to test pagination
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 6,
    title: `Task ${i + 6}`,
    description: `This is task ${i + 6} description with some more text to test truncation in the UI`,
    dueDate: new Date(2023, 11, Math.floor(Math.random() * 30) + 1),
    status: Object.values(Status)[Math.floor(Math.random() * 5)],
    ticketImageUrl: "",
    attachedDocumentUrl: "",
  })),
]

// Helper function to format date for API
const formatDateForApi = (date: Date | null): string | undefined => {
  if (!date) return undefined
  return format(date, "yyyy-MM-dd'T'HH:mm:ss")
}

// Helper function to build query string for pagination
const buildPaginationQuery = (page: number, size: number, sortField?: string, sortDirection?: string): string => {
  let query = `?page=${page}&size=${size}`

  if (sortField) {
    query += `&sort=${sortField},${sortDirection || config.defaultSortDirection}`
  } else if (config.defaultSortField) {
    query += `&sort=${config.defaultSortField},${config.defaultSortDirection}`
  }

  return query
}

// Mock API functions
const mockFetchTasks = async (
  activeTab: string,
  statusFilter: Status | "ALL",
  filters: FilterState,
  page: number,
  pageSize: number,
  sortField?: string,
  sortDirection?: string,
): Promise<PageResponse<TodoItem>> => {
  console.log("MOCK API Call: Fetching tasks with params:", {
    activeTab,
    statusFilter,
    filters,
    page,
    pageSize,
    sortField,
    sortDirection,
  })

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Filter tasks
  let filteredTasks = [...mockTasks]

  // Apply tab filter
  if (activeTab === "backlog") {
    filteredTasks = filteredTasks.filter((task) => task.status === Status.BACKLOG)
  } else if (activeTab === "board") {
    filteredTasks = filteredTasks.filter((task) => task.status !== Status.BACKLOG)
  }

  // Apply status filter from sidebar
  if (statusFilter !== "ALL") {
    filteredTasks = filteredTasks.filter((task) => task.status === statusFilter)
  }

  // Apply filters if they are active
  if (filters.isActive) {
    // Apply title filter
    if (filters.title) {
      if (filters.titleSearchMode === "exact") {
        filteredTasks = filteredTasks.filter((task) => task.title.toLowerCase() === filters.title.toLowerCase())
      } else {
        filteredTasks = filteredTasks.filter((task) => task.title.toLowerCase().includes(filters.title.toLowerCase()))
      }
    }

    // Apply status filters from checkboxes
    const anyStatusSelected = Object.values(filters.statusFilters).some((value) => value)
    if (anyStatusSelected) {
      filteredTasks = filteredTasks.filter((task) => filters.statusFilters[task.status])
    }

    // Apply date range filter
    if (filters.dueDateFrom) {
      const fromDate = new Date(filters.dueDateFrom)
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.dueDate) return false
        return new Date(task.dueDate) >= fromDate
      })
    }

    if (filters.dueDateTo) {
      const toDate = new Date(filters.dueDateTo)
      toDate.setHours(23, 59, 59, 999)
      filteredTasks = filteredTasks.filter((task) => {
        if (!task.dueDate) return false
        return new Date(task.dueDate) <= toDate
      })
    }
  }

  // Apply sorting
  if (sortField) {
    const isAsc = sortDirection === "asc"

    filteredTasks.sort((a, b) => {
      if (sortField === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return isAsc ? 1 : -1
        if (!b.dueDate) return isAsc ? -1 : 1
        return isAsc
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      } else if (sortField === "title") {
        return isAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else if (sortField === "status") {
        return isAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)
      }
      return 0
    })
  } else {
    // Default sort by dueDate desc
    filteredTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    })
  }

  // Calculate pagination
  const totalElements = filteredTasks.length
  const totalPages = Math.ceil(totalElements / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + pageSize)

  return {
    content: paginatedTasks,
    totalElements,
    totalPages,
    size: pageSize,
    number: page - 1, // Convert to 0-based for API consistency
    first: page === 1,
    last: page === totalPages,
    empty: paginatedTasks.length === 0,
  }
}

const mockCreateTask = async (task: Omit<TodoItem, "id">): Promise<TodoItem> => {
  console.log("MOCK API Call: Creating task:", task)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Create a new task with a random ID
  const newTask: TodoItem = {
    ...task,
    id: Math.floor(Math.random() * 1000) + mockTasks.length + 1,
  }

  // Add to mock data
  mockTasks.push(newTask)

  return newTask
}

const mockUpdateTask = async (task: TodoItem): Promise<TodoItem> => {
  console.log("MOCK API Call: Updating task:", task)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Update the task in mock data
  const index = mockTasks.findIndex((t) => t.id === task.id)
  if (index !== -1) {
    mockTasks[index] = { ...task }
  }

  return task
}

const mockDeleteTask = async (taskId: number): Promise<void> => {
  console.log("MOCK API Call: Deleting task:", taskId)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Remove from mock data
  const index = mockTasks.findIndex((t) => t.id === taskId)
  if (index !== -1) {
    mockTasks.splice(index, 1)
  }
}

const mockGetTaskById = async (taskId: number): Promise<TodoItem> => {
  console.log("MOCK API Call: Getting task by ID:", taskId)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Find task in mock data
  const task = mockTasks.find((t) => t.id === taskId)
  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`)
  }

  return task
}

// Real API functions
const realFetchTasks = async (
  activeTab: string,
  statusFilter: Status | "ALL",
  filters: FilterState,
  page: number,
  pageSize: number,
  sortField?: string,
  sortDirection?: string,
): Promise<PageResponse<TodoItem>> => {
  // Determine which endpoint to use based on the request type
  let url: string
  let method = "GET"
  let body: any = null

  // If filters are active, use the search endpoint
  if (filters.isActive) {
    url = `${config.apiBaseUrl}/todos/all`
    method = "POST"

    // Build the search request body
    const searchDTO: TaskSearchDTO = {
      page: {
        page: page - 1, // Convert to 0-based for API
        size: pageSize,
        sort: sortField
          ? [
              {
                property: sortField,
                direction: sortDirection || config.defaultSortDirection,
              },
            ]
          : [
              {
                property: config.defaultSortField,
                direction: config.defaultSortDirection,
              },
            ],
      },
    }

    // Add title filter
    if (filters.title) {
      searchDTO.title = {
        text: filters.title,
        exactMatch: filters.titleSearchMode === "exact",
      }
    }

    // Add status filters
    const statuses: Status[] = []

    // Handle sidebar status filter
    if (statusFilter !== "ALL") {
      statuses.push(statusFilter)
    } else {
      // Handle checkbox status filters
      const anyStatusSelected = Object.entries(filters.statusFilters).some(([_, isSelected]) => isSelected)

      if (anyStatusSelected) {
        Object.entries(filters.statusFilters).forEach(([status, isSelected]) => {
          if (isSelected) {
            statuses.push(status as Status)
          }
        })
      } else if (activeTab === "board") {
        // If no statuses selected and we're on the board tab, exclude BACKLOG
        statuses.push(...Object.values(Status).filter((status) => status !== Status.BACKLOG))
      } else if (activeTab === "backlog") {
        // If we're on the backlog tab, only show BACKLOG
        statuses.push(Status.BACKLOG)
      }
    }

    if (statuses.length > 0) {
      searchDTO.statuses = statuses
    }

    // Add date range filters
    if (filters.dueDateFrom) {
      searchDTO.fromDate = formatDateForApi(filters.dueDateFrom)
    }

    if (filters.dueDateTo) {
      searchDTO.toDate = formatDateForApi(filters.dueDateTo)
    }

    body = searchDTO
    console.log("REAL API Call (POST): Search with filters", body)
  } else {
    // Use the appropriate GET endpoint based on the tab and status filter
    const paginationQuery = buildPaginationQuery(
      page - 1, // Convert to 0-based for API
      pageSize,
      sortField,
      sortDirection,
    )

    if (activeTab === "backlog") {
      url = `${config.apiBaseUrl}/todos/backlog${paginationQuery}`
      console.log("REAL API Call (GET): Backlog items")
    } else if (activeTab === "board") {
      if (statusFilter !== "ALL") {
        url = `${config.apiBaseUrl}/todos/todo/status/${statusFilter}${paginationQuery}`
        console.log(`REAL API Call (GET): Items with status ${statusFilter}`)
      } else {
        url = `${config.apiBaseUrl}/todos/board${paginationQuery}`
        console.log("REAL API Call (GET): Board items")
      }
    } else {
      // Default to all items
      url = `${config.apiBaseUrl}/todos/all${paginationQuery}`
      console.log("REAL API Call (GET): All items")
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform dates from strings to Date objects
    const transformedData = {
      ...data,
      content: data.content.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      })),
    }

    return transformedData
  } catch (error) {
    console.error("Error fetching tasks:", error)
    throw error
  }
}

const realCreateTask = async (task: Omit<TodoItem, "id">): Promise<TodoItem> => {
  console.log("REAL API Call: Creating task:", task)

  try {
    // Convert Date to ISO string for API
    const apiTask = {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
    }

    const response = await fetch(`${config.apiBaseUrl}/todos/todo`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiTask),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform date from string to Date object
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    }
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

const realUpdateTask = async (task: TodoItem): Promise<TodoItem> => {
  console.log("REAL API Call: Updating task:", task)

  try {
    // Convert Date to ISO string for API
    const apiTask = {
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
    }

    const response = await fetch(`${config.apiBaseUrl}/todos/todo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiTask),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform date from string to Date object
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    }
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

const realDeleteTask = async (taskId: number): Promise<void> => {
  console.log("REAL API Call: Deleting task:", taskId)

  try {
    const response = await fetch(`${config.apiBaseUrl}/todos/todo/${taskId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}

const realGetTaskById = async (taskId: number): Promise<TodoItem> => {
  console.log("REAL API Call: Getting task by ID:", taskId)

  try {
    const response = await fetch(`${config.apiBaseUrl}/todos/todo/${taskId}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform date from string to Date object
    return {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    }
  } catch (error) {
    console.error("Error getting task:", error)
    throw error
  }
}

// Export the API service with conditional implementation
export const apiService = {
  fetchTasks: (
    activeTab: string,
    statusFilter: Status | "ALL",
    filters: FilterState,
    page: number,
    pageSize: number,
    sortField?: string,
    sortDirection?: string,
  ) => {
    return config.useRealApi
      ? realFetchTasks(activeTab, statusFilter, filters, page, pageSize, sortField, sortDirection)
      : mockFetchTasks(activeTab, statusFilter, filters, page, pageSize, sortField, sortDirection)
  },

  createTask: (task: Omit<TodoItem, "id">) => (config.useRealApi ? realCreateTask(task) : mockCreateTask(task)),

  updateTask: (task: TodoItem) => (config.useRealApi ? realUpdateTask(task) : mockUpdateTask(task)),

  deleteTask: (taskId: number) => (config.useRealApi ? realDeleteTask(taskId) : mockDeleteTask(taskId)),

  getTaskById: (taskId: number) => (config.useRealApi ? realGetTaskById(taskId) : mockGetTaskById(taskId)),
}
