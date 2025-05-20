export enum NotificationType {
  TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  TASK_MOVED_FROM_BACKLOG = "TASK_MOVED_FROM_BACKLOG",
  TASK_TAGS_CHANGED = "TASK_TAGS_CHANGED",
  TASK_DELETED = "TASK_DELETED",
}

export interface BaseNotification {
  id: string
  type: NotificationType
  timestamp: string
  read: boolean
  taskId: number
  taskTitle: string
  actorId: string
  actorName: string
}

export interface TaskStatusChangedNotification extends BaseNotification {
  type: NotificationType.TASK_STATUS_CHANGED
  oldStatus: string
  newStatus: string
}

export interface TaskAssignedNotification extends BaseNotification {
  type: NotificationType.TASK_ASSIGNED
  assigneeId: string
  assigneeName: string
}

export interface TaskMovedFromBacklogNotification extends BaseNotification {
  type: NotificationType.TASK_MOVED_FROM_BACKLOG
  newStatus: string
}

export interface TaskTagsChangedNotification extends BaseNotification {
  type: NotificationType.TASK_TAGS_CHANGED
  addedTags: string[]
  removedTags: string[]
}

export interface TaskDeletedNotification extends BaseNotification {
  type: NotificationType.TASK_DELETED
}

export type Notification =
  | TaskStatusChangedNotification
  | TaskAssignedNotification
  | TaskMovedFromBacklogNotification
  | TaskTagsChangedNotification
  | TaskDeletedNotification

export interface NotificationPreferences {
  taskStatusChanged: boolean
  taskAssigned: boolean
  taskMovedFromBacklog: boolean
  taskTagsChanged: boolean
  taskDeleted: boolean
}

export const defaultNotificationPreferences: NotificationPreferences = {
  taskStatusChanged: true,
  taskAssigned: true,
  taskMovedFromBacklog: true,
  taskTagsChanged: true,
  taskDeleted: true,
}
