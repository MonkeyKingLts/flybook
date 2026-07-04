export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked'
export type TaskPriority = 'high' | 'medium' | 'low'
export type OrgRole = 'owner' | 'admin' | 'member' | 'guest'
export type ProjectRole = 'project_admin' | 'developer' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Organization {
  id: string
  name: string
}

export interface Project {
  id: string
  name: string
  key: string
  description: string
  todoCount: number
  inProgressCount: number
  doneCount: number
  updatedAt: string
  members: User[]
}

export interface Task {
  id: string
  key: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  projectName: string
  assignee?: User
  dueDate?: string
  updatedAt: string
  commentCount?: number
}
