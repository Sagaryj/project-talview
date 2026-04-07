Cypress.Commands.add('openCreateTaskModal', () => {
  cy.contains('button', 'Add Task').click()
  cy.contains('h2', 'Create Task').should('be.visible')
})

Cypress.Commands.add('createBoardTask', (title: string) => {
  cy.contains('h2', 'Create Task')
    .closest('div[class*="rounded-2xl"]')
    .within(() => {
      cy.contains('label', 'Title').next('input').clear().type(title)
      cy.contains('button', 'Create').click()
    })
})

Cypress.Commands.add('deleteBoardTask', (title: string) => {
  cy.on('window:confirm', () => true)
  cy.contains('p', title)
    .closest('div[draggable="true"]')
    .within(() => {
      cy.contains('button', '✕').click({ force: true })
    })
})

declare global {
  namespace Cypress {
    interface Chainable {
      openCreateTaskModal(): Chainable<void>
      createBoardTask(title: string): Chainable<void>
      deleteBoardTask(title: string): Chainable<void>
    }
  }
}

export {}
