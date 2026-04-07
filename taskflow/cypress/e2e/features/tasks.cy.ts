import { stubKanbanGraphql } from '../../support/utils/mockGraphql'

describe('Tasks feature', () => {
  beforeEach(() => {
    stubKanbanGraphql()
    cy.mockLoginAndVisit('/projects')
    cy.wait('@fetchTasks')
    cy.wait('@fetchActivities')
    cy.wait('@fetchWorkflowStatuses')
  })

  it('lists tasks returned by the mocked GraphQL API', () => {
    cy.contains('h1', 'Projects').should('be.visible')
    cy.contains('Design login experience').should('be.visible')
    cy.contains('Ship kanban filters').should('be.visible')
  })

  it('creates a new task from the board modal', () => {
    cy.openCreateTaskModal()
    cy.createBoardTask('Write Cypress coverage')

    cy.wait('@createTask').its('request.body.variables').should((variables) => {
      expect(variables.title).to.equal('Write Cypress coverage')
      expect(variables.workflowStatusId).to.equal(101)
      expect(variables.priority).to.equal('medium')
    })
    cy.wait('@createActivity').its('request.body.variables.message').should('contain', 'Write Cypress coverage')
  })

  it('deletes an existing task from the board', () => {
    cy.deleteBoardTask('Design login experience')
    cy.wait('@deleteTask').its('request.body.variables.id').should('eq', 201)
  })
})
