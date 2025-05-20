"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Search, CalendarIcon, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import { apiService } from "@/lib/api-service"
import { Status, type FilterState } from "@/lib/types"
import type { User, Tag } from "@/lib/types"

interface FilterBarProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  onSearch: () => void
  onClearFilters: () => void
  activeTab: string
  statusFilter: Status | "ALL"
}

export function FilterBar({
                            filters,
                            setFilters,
                            onSearch,
                            onClearFilters,
                            activeTab,
                            statusFilter,
                          }: FilterBarProps) {
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])

  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false)

  const hasActiveFilters =
      filters.title ||
      Object.values(filters.statusFilters).some((v) => v) ||
      filters.dueDateFrom ||
      filters.dueDateTo ||
      filters.assigneeId ||
      filters.tagIds.length > 0

  // Load users, tags, and statuses on mount
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true)
      try {
        const u = await apiService.getUsers()
        setUsers(u)
      } catch (e) {
        console.error("Error loading users:", e)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    const loadTags = async () => {
      setIsLoadingTags(true)
      try {
        const t = await apiService.getTags()
        setTags(t)
      } catch (e) {
        console.error("Error loading tags:", e)
      } finally {
        setIsLoadingTags(false)
      }
    }

    const loadStatuses = async () => {
      setIsLoadingStatuses(true)
      try {
        const s = await apiService.getStatuses()
        setStatuses(s)
      } catch (e) {
        console.error("Error loading statuses:", e)
      } finally {
        setIsLoadingStatuses(false)
      }
    }

    loadUsers()
    loadTags()
    loadStatuses()
  }, [])

  const toggleStatus = (status: Status) =>
      setFilters({
        ...filters,
        statusFilters: {
          ...filters.statusFilters,
          [status]: !filters.statusFilters[status],
        },
      })

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case Status.READY:
        return <Badge variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status)}>Ready</Badge>
      case Status.IN_PROGRESS:
        return <Badge variant="default"
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status)}>In Progress</Badge>
      case Status.REVIEW:
        return <Badge variant="warning"
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status)}>Review</Badge>
      case Status.REOPENED:
        return (
            <Badge variant="outline"
                   className="bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer"
                   onClick={() => toggleStatus(status)}>
              Reopened
            </Badge>
        )
      case Status.DONE:
        return <Badge variant="success"
                      className="cursor-pointer"
                      onClick={() => toggleStatus(status)}>Done</Badge>
    }
  }

  const toggleTag = (tagId: string) => {
    const next = filters.tagIds.includes(tagId)
        ? filters.tagIds.filter((id) => id !== tagId)
        : [...filters.tagIds, tagId]

    setFilters({ ...filters, tagIds: next })
  }

  // Only show status badges on board when filtering ALL
  const showStatusFilters = activeTab === "board" && statusFilter === "ALL"

  return (
      <div className="bg-muted/60 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Filters</h3>
        </div>

        <div className="space-y-4">
          {/* Title & due date */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Title */}
            <div className="w-full sm:w-1/2">
              <Label className="mb-2 block">Title</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="text"
                      placeholder="Filter by title"
                      className="pl-8 bg-background"
                      value={filters.title}
                      onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                      maxLength={50}
                      aria-label="Filter by title"
                  />
                </div>
                <RadioGroup
                    value={filters.titleSearchMode}
                    onValueChange={(v) =>
                        setFilters({ ...filters, titleSearchMode: v as "exact" | "contains" })
                    }
                    className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exact" id="exact" />
                    <Label htmlFor="exact" className="cursor-pointer">
                      Exact
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="contains" id="contains" />
                    <Label htmlFor="contains" className="cursor-pointer">
                      Contains
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Due date */}
            <div className="w-full sm:w-1/2">
              <Label className="mb-2 block">Due Date Range</Label>
              <div className="flex flex-wrap gap-2">
                {["dueDateFrom", "dueDateTo"].map((field, idx) => (
                    <div key={field} className="flex-1 min-w-[120px]">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                              variant="outline"
                              className={cn(
                                  "w-full justify-start text-left font-normal bg-background",
                                  !filters[field as "dueDateFrom" | "dueDateTo"] &&
                                  "text-muted-foreground"
                              )}
                              aria-label={field === "dueDateFrom" ? "From date" : "To date"}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters[field as "dueDateFrom" | "dueDateTo"]
                                ? format(
                                    filters[field as "dueDateFrom" | "dueDateTo"]!,
                                    "PP"
                                )
                                : idx === 0
                                    ? "From"
                                    : "To"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                              mode="single"
                              selected={filters[field as "dueDateFrom" | "dueDateTo"] || undefined}
                              onSelect={(date) =>
                                  setFilters({ ...filters, [field]: date } as any)
                              }
                              initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assignee & Tags */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Assignee */}
            <div className="w-full sm:w-1/2">
              <Label className="mb-2 block">Assignee</Label>
              <Select
                  value={filters.assigneeId || "all"}
                  onValueChange={(v) =>
                      setFilters({ ...filters, assigneeId: v === "all" ? undefined : v })
                  }
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Filter by assignee">
                    {filters.assigneeId
                        ? (() => {
                          const u = users.find((u) => u.id === filters.assigneeId)
                          return u ? (
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={u.picture || "/placeholder.svg"} alt={u.name} />
                                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                                </Avatar>
                                {u.name}
                              </div>
                          ) : (
                              "Loading user..."
                          )
                        })()
                        : "All assignees"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assignees</SelectItem>
                  {isLoadingUsers ? (
                      <div className="flex justify-center p-2">Loading users...</div>
                  ) : (
                      users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={u.picture || "/placeholder.svg"} alt={u.name} />
                                <AvatarFallback>{u.name[0]}</AvatarFallback>
                              </Avatar>
                              {u.name}
                            </div>
                          </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="w-full sm:w-1/2">
              <Label className="mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
                {isLoadingTags ? (
                    <div className="flex justify-center w-full p-2">Loading tags...</div>
                ) : tags.length > 0 ? (
                    tags.map((tag) => (
                        <Badge
                            key={tag.id}
                            variant={filters.tagIds.includes(tag.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            style={{
                              backgroundColor: filters.tagIds.includes(tag.id)
                                  ? tag.color
                                  : "transparent",
                              borderColor: tag.color,
                              color: filters.tagIds.includes(tag.id) ? "#fff" : tag.color,
                            }}
                            onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                    ))
                ) : (
                    <div className="text-muted-foreground text-sm">
                      No tags available
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Status as Badges */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2"/>
            {showStatusFilters && (
                <div className="w-full sm:w-1/2">
                  <Label className="mb-2 block">Status</Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
                    {isLoadingStatuses ? (
                        <div className="flex justify-center w-full p-2">Loading tags...</div>
                    ) : statuses.length > 0 ? (
                        statuses.map((status) => {
                          const active = filters.statusFilters[status]
                          return getStatusBadge(status)
                        })
                    ) : (
                        <div className="text-muted-foreground text-sm">
                          No statuses available
                        </div>
                    )}
                  </div>
                </div>
            )}
          </div>

          {/* Search / Clear */}
          <div className="flex justify-end gap-2">
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
            )}
            <Button onClick={onSearch} className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>
  )
}
