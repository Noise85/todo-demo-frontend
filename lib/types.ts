export enum Status {
  BACKLOG = "BACKLOG",
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  REOPENED = "REOPENED", // Added from API
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
  titleSearchMode: "exact" | "contains"
  statusFilters: Record<Status, boolean>
  dueDateFrom: Date | null
  dueDateTo: Date | null
}
