export function buildWorkflowStatuses() {
  return [
    {
      id: 101,
      slug: 'todo',
      label: 'To Do',
      color: '#2563eb',
      category: 'active',
      system: true,
      position: 0
    },
    {
      id: 102,
      slug: 'in-progress',
      label: 'In Progress',
      color: '#f59e0b',
      category: 'active',
      system: true,
      position: 1
    },
    {
      id: 103,
      slug: 'done',
      label: 'Done',
      color: '#10b981',
      category: 'completed',
      system: true,
      position: 2
    }
  ]
}

export function buildTasks(statuses = buildWorkflowStatuses()) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const today = String(now.getDate()).padStart(2, '0')
  const upcoming = String(Math.min(now.getDate() + 2, 28)).padStart(2, '0')

  return [
    {
      id: 201,
      title: 'Design login experience',
      description: 'Polish the auth flow for the workspace.',
      priority: 'high',
      due_date: `${year}-${month}-${today}`,
      position: 0,
      workflow_status: statuses[0],
      task_tags: [
        { id: 401, name: 'design' },
        { id: 402, name: 'auth' }
      ]
    },
    {
      id: 202,
      title: 'Ship kanban filters',
      description: 'Expose search and due date filters in the board.',
      priority: 'medium',
      due_date: `${year}-${month}-${upcoming}`,
      position: 0,
      workflow_status: statuses[1],
      task_tags: [{ id: 403, name: 'frontend' }]
    },
    {
      id: 203,
      title: 'Publish sprint summary',
      description: 'Prepare release notes for the current sprint.',
      priority: 'low',
      due_date: `${year}-${month}-${upcoming}`,
      position: 0,
      workflow_status: statuses[2],
      task_tags: [{ id: 404, name: 'ops' }]
    }
  ]
}

export function stubKanbanGraphql() {
  const workflowStatuses = buildWorkflowStatuses()
  const tasks = buildTasks(workflowStatuses)
  const activities = [
    {
      id: 301,
      message: 'Task "Design login experience" created',
      created_at: new Date().toISOString()
    }
  ]

  cy.intercept('POST', '**/v1/graphql', (req) => {
    switch (req.body.operationName) {
      case 'FetchTasks':
        req.alias = 'fetchTasks'
        req.reply({ data: { tasks } })
        break
      case 'FetchActivities':
        req.alias = 'fetchActivities'
        req.reply({ data: { activities } })
        break
      case 'FetchWorkflowStatuses':
        req.alias = 'fetchWorkflowStatuses'
        req.reply({ data: { workflow_statuses: workflowStatuses } })
        break
      case 'CreateTask':
        req.alias = 'createTask'
        req.reply({ data: { insert_tasks_one: { id: 999 } } })
        break
      case 'CreateActivity':
        req.alias = 'createActivity'
        req.reply({ data: { insert_activities_one: { id: 1000 } } })
        break
      case 'DeleteTask':
        req.alias = 'deleteTask'
        req.reply({ data: { delete_tasks_by_pk: { id: req.body.variables.id } } })
        break
      default:
        req.reply({ data: {} })
    }
  })
}

export function stubProfileGraphql() {
  const currentUser = {
    id: 1,
    name: 'Cypress User',
    username: 'cypress-user',
    email: 'cypress@example.com',
    preferred_language: 'en',
    theme: 'dark',
    profile_role: 'Developer',
    company: 'Taskflow',
    timezone: 'Asia/Kolkata'
  }

  cy.intercept('POST', '**/v1/graphql', (req) => {
    switch (req.body.operationName) {
      case 'CurrentUser':
        req.alias = 'currentUser'
        req.reply({ data: { users: [currentUser] } })
        break
      case 'UpdateCurrentUser':
        req.alias = 'updateCurrentUser'
        req.reply({
          data: {
            update_users: {
              returning: [
                {
                  ...currentUser,
                  ...req.body.variables.changes
                }
              ]
            }
          }
        })
        break
      default:
        req.reply({ data: {} })
    }
  })
}
