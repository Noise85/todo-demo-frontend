"use client"

import type React from "react"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { type TodoItem, Status, type FilterState } from "@/lib/types"
import { TaskCard } from "@/components/task-card"
import { TaskListItem } from "@/components/task-list-item"
import { Droppable } from "@/components/dnd/droppable"
import { SortableItem } from "@/components/dnd/sortable-item"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Pagination } from "@/components/pagination"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TaskDetail } from "@/components/task-detail"
import { cn } from "@/lib/utils"
import { SortIndicator } from "@/components/sort-indicator"

interface BoardProps {
  tasks: TodoItem[]
  onUpdateTask: (task: TodoItem) => void
  onDeleteTask: (taskId: number) => void
  onMoveTask: (taskId: number, newStatus: Status) => void
  setEditingTask: (task: TodoItem) => void
  viewMode: "card" | "list"
  pagination: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  onSort: (field: string) => void
  sortField?: string
  sortDirection?: "asc" | "desc"
  filters: FilterState
}

const lanes = [
  { id: "READY", title: "Ready", status: Status.READY },
  { id: "IN_PROGRESS", title: "In Progress", status: Status.IN_PROGRESS },
  { id: "REVIEW", title: "Review", status: Status.REVIEW },
  { id: "DONE", title: "Done", status: Status.DONE },
]

export function Board({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  setEditingTask,
  viewMode,
  pagination,
  onSort,
  sortField,
  sortDirection,
  filters,
}: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewingTask, setViewingTask] = useState<TodoItem | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const activeTask = activeId ? tasks.find((task) => `task-${task.id}` === activeId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    // Extract the task ID from the draggable ID (format: "task-{id}")
    const taskId = Number(active.id.toString().split("-")[1])

    // Extract the lane ID from the droppable ID (format: "lane-{status}")
    const newStatus = over.id.toString().split("-")[1] as Status

    // If the task was dropped in a different lane, update its status
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      onMoveTask(taskId, newStatus)
    }

    setActiveId(null)
  }

  const handleConfirmDelete = (taskId: number) => {
    setDeletingTaskId(taskId)
  }

  const handleDeleteConfirmed = () => {
    if (deletingTaskId !== null) {
      onDeleteTask(deletingTaskId)
      setDeletingTaskId(null)
    }
  }

  // Determine which lanes to show based on filters
  const getVisibleLanes = () => {
    // If filters aren't active, show all lanes
    if (!filters.isActive) {
      return lanes
    }

    // Check if any status filters are selected
    const anyStatusSelected = Object.values(filters.statusFilters).some((value) => value)

    if (!anyStatusSelected) {
      return lanes // If no status filters are selected, show all lanes
    }

    // Only show lanes that match the selected status filters
    return lanes.filter((lane) => filters.statusFilters[lane.status])
  }

  const visibleLanes = getVisibleLanes()

  // Create a handler for column header clicks
  const handleColumnHeaderClick = (field: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSort(field)
  }

  if (viewMode === "list") {
    return (
      <div>
        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/60">
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium sortable-header"
                  onClick={handleColumnHeaderClick("title")}
                >
                  <div className="flex items-center">
                    Title
                    {sortField === "title" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th
                  className="px-4 py-3 text-left font-medium sortable-header"
                  onClick={handleColumnHeaderClick("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left font-medium sortable-header"
                  onClick={handleColumnHeaderClick("assignee")}
                >
                  <div className="flex items-center">
                    Assignee
                    {sortField === "assignee" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium">Tags</th>
                <th
                  className="px-4 py-3 text-left font-medium sortable-header"
                  onClick={handleColumnHeaderClick("dueDate")}
                >
                  <div className="flex items-center">
                    Due Date
                    {sortField === "dueDate" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No tasks found. Create a new task or adjust your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-accent/40 transition-colors cursor-pointer group"
                    onClick={() => setViewingTask(task)}
                  >
                    <TaskListItem
                      task={task}
                      onEdit={setEditingTask}
                      onDelete={onDeleteTask}
                      onView={setViewingTask}
                      onConfirmDelete={handleConfirmDelete}
                    />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          pageSize={pagination.pageSize}
          onPageSizeChange={pagination.onPageSizeChange}
          totalItems={pagination.totalItems}
        />

        {/* Task Detail Dialog */}
        {viewingTask && (
          <Dialog open={!!viewingTask} onOpenChange={(open) => !open && setViewingTask(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Task Details</DialogTitle>
              </DialogHeader>
              <TaskDetail task={viewingTask} />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deletingTaskId !== null} onOpenChange={(open) => !open && setDeletingTaskId(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this task? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingTaskId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirmed}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {visibleLanes.length === 0 ? (
          <div className="bg-card rounded-lg shadow-md p-8 text-center text-muted-foreground">
            No lanes match your selected status filters. Please adjust your filters.
          </div>
        ) : (
          <div>
            {viewMode === "card" && (
              <div className="flex flex-wrap gap-2 mb-4 bg-muted/30 p-2 rounded-md">
                <span className="text-sm font-medium mr-2 self-center">Sort by:</span>
                <SortIndicator
                  field="title"
                  label="Title"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                />
                <SortIndicator
                  field="assignee"
                  label="Assignee"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                />
                <SortIndicator
                  field="dueDate"
                  label="Due Date"
                  currentSortField={sortField}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleLanes.map((lane) => (
                <div key={lane.id} className="bg-muted/60 rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-3">{lane.title}</h3>
                  <Droppable id={`lane-${lane.status}`}>
                    <div className={cn("min-h-[200px] space-y-3 p-2 rounded-md", "bg-muted/30")}>
                      {tasks
                        .filter((task) => task.status === lane.status)
                        .map((task) => (
                          <SortableItem key={task.id} id={`task-${task.id}`}>
                            <TaskCard
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={(taskId) => handleConfirmDelete(taskId)}
                              onView={setViewingTask}
                              isDraggable
                            />
                          </SortableItem>
                        ))}
                    </div>
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        )}

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80">
              <TaskCard task={activeTask} onEdit={setEditingTask} onDelete={handleConfirmDelete} isDraggable />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={pagination.onPageChange}
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.onPageSizeChange}
        totalItems={pagination.totalItems}
      />

      {/* Task Detail Dialog */}
      {viewingTask && (
        <Dialog open={!!viewingTask} onOpenChange={(open) => !open && setViewingTask(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            <TaskDetail task={viewingTask} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingTaskId !== null} onOpenChange={(open) => !open && setDeletingTaskId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTaskId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
