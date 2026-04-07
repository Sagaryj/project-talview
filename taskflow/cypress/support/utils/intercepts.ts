import type { MockTask } from './mockData'
import { buildMockTask } from './mockData'

export function mockTaskApi(seedTasks: MockTask[]) {
  let tasks = [...seedTasks]

  cy.intercept('GET', '**/api/tasks', {
    statusCode: 200,
    body: tasks
  }).as('getTasks')

  cy.intercept('POST', '**/api/tasks', (req) => {
    const nextTask = buildMockTask({ title: req.body.title })
    tasks = [...tasks, nextTask]

    req.reply({
      statusCode: 201,
      body: nextTask
    })
  }).as('createTask')

  cy.intercept('DELETE', '**/api/tasks/*', (req) => {
    const id = Number(String(req.url).split('/').pop())
    tasks = tasks.filter((task) => task.id !== id)

    req.reply({
      statusCode: 204,
      body: {}
    })
  }).as('deleteTask')
}
