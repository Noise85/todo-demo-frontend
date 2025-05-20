"use client"

import type React from "react"

import type { TodoItem } from "@/lib/types"
import { TaskCard } from "@/components/task-card"
import { BacklogListItem } from "@/components/backlog-list-item"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { useState } from "react"
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
import { SortIndicator } from "@/components/sort-indicator"

interface BacklogProps {
  tasks: TodoItem[]
  onUpdateTask: (task: TodoItem) => void
  onDeleteTask: (taskId: number) => void
  onMoveToReady: (taskId: number) => void
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
}

export function Backlog({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onMoveToReady,
  setEditingTask,
  viewMode,
  pagination,
  onSort,
  sortField,
  sortDirection,
}: BacklogProps) {
  const [viewingTask, setViewingTask] = useState<TodoItem | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)

  const handleConfirmDelete = (taskId: number) => {
    setDeletingTaskId(taskId)
  }

  const handleDeleteConfirmed = () => {
    if (deletingTaskId !== null) {
      onDeleteTask(deletingTaskId)
      setDeletingTaskId(null)
    }
  }

  // Create a handler for column header clicks
  const handleColumnHeaderClick = (field: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSort(field)
  }

  if (viewMode === "list") {
    return (
      <div>
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40">
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
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No tasks in backlog. Create a new task to get started.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b hover:bg-muted/40 hover:border-l-4 hover:border-l-primary transition-all cursor-pointer group"
                    onClick={() => setViewingTask(task)}
                  >
                    <BacklogListItem
                      task={task}
                      onEdit={setEditingTask}
                      onDelete={onDeleteTask}
                      onView={setViewingTask}
                      onMoveToReady={onMoveToReady}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No tasks in backlog. Create a new task to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id}>
              <TaskCard
                task={task}
                onEdit={setEditingTask}
                onDelete={handleConfirmDelete}
                onView={setViewingTask}
                onMoveToReady={onMoveToReady}
                isBacklog={true}
              />
            </div>
          ))
        )}
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
