"use client"

import type { TodoItem } from "@/lib/types"
import { TaskCard } from "@/components/task-card"
import { BacklogListItem } from "@/components/backlog-list-item"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Pagination } from "@/components/pagination"

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
  if (viewMode === "list") {
    return (
      <div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium cursor-pointer" onClick={() => onSort("title")}>
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
                <th className="px-4 py-3 text-left font-medium cursor-pointer" onClick={() => onSort("dueDate")}>
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
                <th className="px-4 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No tasks in backlog. Create a new task to get started.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <BacklogListItem
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={onDeleteTask}
                    onMoveToReady={onMoveToReady}
                  />
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
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No tasks in backlog. Create a new task to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onDelete={onDeleteTask}
              onMoveToReady={onMoveToReady}
            />
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
    </div>
  )
}
