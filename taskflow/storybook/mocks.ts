import type { Task } from '../src/features/kanban/types'
import type { WorkflowStatus } from '../src/types/workflow'
import type { Activity } from '../src/types/activity'

export const workflowStatuses: WorkflowStatus[] = [
  { id: 'todo', label: 'Todo', color: '#64748b', category: 'pending', system: true },
  { id: 'in-progress', label: 'In Progress', color: '#3b82f6', category: 'active', system: true },
  { id: 'done', label: 'Done', color: '#22c55e', category: 'completed', system: true }
]

export const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design dashboard cards',
    description: 'Polish spacing and hierarchy for the analytics cards.',
    status: 'todo',
    priority: 'high',
    dueDate: '2099-04-10',
    tags: ['design', 'dashboard']
  },
  {
    id: '2',
    title: 'Implement settings sync',
    description: 'Wire profile settings to the backend and session refresh flow.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2099-04-12',
    tags: ['settings', 'backend']
  },
  {
    id: '3',
    title: 'Write release notes',
    description: 'Summarize this sprint changes for the release handoff.',
    status: 'done',
    priority: 'low',
    dueDate: '2099-04-14',
    tags: ['docs']
  }
]

export const sampleActivity: Activity[] = [
  { id: '1', message: 'Created landing page tasks', timestamp: new Date('2026-04-02T09:00:00').getTime() },
  { id: '2', message: 'Moved settings sync to In Progress', timestamp: new Date('2026-04-02T10:30:00').getTime() },
  { id: '3', message: 'Completed release note draft', timestamp: new Date('2026-04-02T12:15:00').getTime() }
]
