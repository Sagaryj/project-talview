export interface HasuraTaskInsertEvent {
  event: {
    op: 'INSERT'
    data: {
      old: null
      new: {
        id: number | string
        user_id: number | string
        title: string
        due_date: string | null
        workflow_status_id: number | string | null
      }
    }
  }
}

export interface HasuraTaskUpdateEvent {
  event: {
    op: 'UPDATE'
    data: {
      old: {
        id: number | string
        user_id: number | string
        title: string
        due_date: string | null
        workflow_status_id: number | string | null
      }
      new: {
        id: number | string
        user_id: number | string
        title: string
        due_date: string | null
        workflow_status_id: number | string | null
      }
    }
  }
}

export interface HasuraWorkflowStatusInsertEvent {
  event: {
    op: 'INSERT'
    data: {
      old: null
      new: {
        id: number | string
        user_id: number | string
        label: string
        color: string
        category: string
        system: boolean
      }
    }
  }
}

export interface TaskReminderEventPayload {
  workflowId: string | null
  runId: string | null
  alreadyRunning: boolean
  emailSent: boolean
  reminderScheduled: boolean
  skipped: boolean
  reason?: string
}
