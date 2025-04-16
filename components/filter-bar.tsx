"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Status, type FilterState } from "@/lib/types"
import { Search, CalendarIcon, X, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FilterBarProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  onSearch: () => void
  onClearFilters: () => void
  activeTab: string
  statusFilter: Status | "ALL"
}

export function FilterBar({ filters, setFilters, onSearch, onClearFilters, activeTab, statusFilter }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters =
    filters.title ||
    Object.values(filters.statusFilters).some((value) => value) ||
    filters.dueDateFrom ||
    filters.dueDateTo

  const toggleStatus = (status: Status) => {
    setFilters({
      ...filters,
      statusFilters: {
        ...filters.statusFilters,
        [status]: !filters.statusFilters[status],
      },
    })
  }

  // Determine if we should show status filters
  const showStatusFilters = activeTab === "board" && statusFilter === "ALL"

  return (
    <div className="bg-muted/40 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {isExpanded ? (
              <>
                <span>Hide Filters</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Show Filters</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Title and Due Date on the same line */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Title Search */}
            <div className="w-full sm:w-1/2">
              <Label className="mb-2 block">Title</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Filter by title"
                    className="pl-8"
                    value={filters.title}
                    onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                    maxLength={50}
                  />
                </div>
                <RadioGroup
                  value={filters.titleSearchMode}
                  onValueChange={(value) => setFilters({ ...filters, titleSearchMode: value as "exact" | "contains" })}
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

            {/* Due Date Range */}
            <div className="w-full sm:w-1/2">
              <Label className="mb-2 block">Due Date Range</Label>
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[120px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dueDateFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateFrom ? format(filters.dueDateFrom, "PP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateFrom || undefined}
                        onSelect={(date) => setFilters({ ...filters, dueDateFrom: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 min-w-[120px]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dueDateTo && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateTo ? format(filters.dueDateTo, "PP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateTo || undefined}
                        onSelect={(date) => setFilters({ ...filters, dueDateTo: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Status Checkboxes - Only show when on board view and no specific status filter is active */}
          {showStatusFilters && (
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-ready"
                    checked={filters.statusFilters[Status.READY]}
                    onCheckedChange={() => toggleStatus(Status.READY)}
                  />
                  <Label htmlFor="status-ready" className="cursor-pointer">
                    Ready
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-in-progress"
                    checked={filters.statusFilters[Status.IN_PROGRESS]}
                    onCheckedChange={() => toggleStatus(Status.IN_PROGRESS)}
                  />
                  <Label htmlFor="status-in-progress" className="cursor-pointer">
                    In Progress
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-review"
                    checked={filters.statusFilters[Status.REVIEW]}
                    onCheckedChange={() => toggleStatus(Status.REVIEW)}
                  />
                  <Label htmlFor="status-review" className="cursor-pointer">
                    Review
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-reopened"
                    checked={filters.statusFilters[Status.REOPENED]}
                    onCheckedChange={() => toggleStatus(Status.REOPENED)}
                  />
                  <Label htmlFor="status-reopened" className="cursor-pointer">
                    Reopened
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-done"
                    checked={filters.statusFilters[Status.DONE]}
                    onCheckedChange={() => toggleStatus(Status.DONE)}
                  />
                  <Label htmlFor="status-done" className="cursor-pointer">
                    Done
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Search and Clear Buttons */}
          <div className="flex justify-end gap-2">
            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-1">
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
      )}
    </div>
  )
}
