"use client"

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
import { type TodoItem, Status } from "@/lib/types"
import { TaskCard } from "@/components/task-card"
import { TaskListItem } from "@/components/task-list-item"
import { Droppable } from "@/components/dnd/droppable"
import { SortableItem } from "@/components/dnd/sortable-item"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Pagination } from "@/components/pagination"

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
}: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
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
                <th className="px-4 py-3 text-left font-medium cursor-pointer" onClick={() => onSort("status")}>
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
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No tasks found. Create a new task or adjust your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <TaskListItem key={task.id} task={task} onEdit={setEditingTask} onDelete={onDeleteTask} />
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lanes.map((lane) => (
            <div key={lane.id} className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-3">{lane.title}</h3>
              <Droppable id={`lane-${lane.status}`}>
                <div className="min-h-[200px] space-y-3">
                  {tasks
                    .filter((task) => task.status === lane.status)
                    .map((task) => (
                      <SortableItem key={task.id} id={`task-${task.id}`}>
                        <TaskCard task={task} onEdit={setEditingTask} onDelete={onDeleteTask} isDraggable />
                      </SortableItem>
                    ))}
                </div>
              </Droppable>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80">
              <TaskCard task={activeTask} onEdit={setEditingTask} onDelete={onDeleteTask} isDraggable />
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
    </div>
  )
}
