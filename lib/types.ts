export interface User {
  id: string
  name: string
  email: string
  picture?: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export enum Status {
  BACKLOG = "BACKLOG",
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  REOPENED = "REOPENED",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

export interface TodoItem {
  id: number
  title: string
  description: string
  dueDate?: Date
  status: Status
  ticketImageUrl?: string
  attachedDocumentUrl?: string
  assignee?: User
  tags: Tag[]
}

// API specific types
export interface TitleDTO {
  text: string
  exactMatch: boolean
}

export interface SortDTO {
  property: string
  direction: string
}

export interface PaginationDTO {
  page: number
  size: number
  sort?: SortDTO[]
}

export interface TaskSearchDTO {
  page?: PaginationDTO
  title?: TitleDTO
  statuses?: Status[]
  fromDate?: string
  toDate?: string
  assigneeId?: string
  tagIds?: string[]
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number // current page (0-based)
  first: boolean
  last: boolean
  empty: boolean
}

// Flag to determine if we're using filters
export interface FilterState {
  isActive: boolean
  title: string
  titleSearchMode: "exact" | "contains" // This maps to exactMatch in the API
  statusFilters: Record<Status, boolean>
  dueDateFrom: Date | null
  dueDateTo: Date | null
  assigneeId?: string
  tagIds: string[]
}
