const AUTH_STORAGE_KEY = 'taskflow-auth'
const AUTH_SESSION_EVENT = 'taskflow-auth-changed'

Cypress.Commands.add('mockLogin', () => {
  cy.fixture('user').then((session) => {
    cy.window().then((window) => {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
    })
  })
})

Cypress.Commands.add('mockLoginAndVisit', (url: string) => {
  cy.fixture('user').then((session) => {
    cy.visit(url, {
      onBeforeLoad(window) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
      }
    })
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      mockLogin(): Chainable<void>
      mockLoginAndVisit(url: string): Chainable<void>
    }
  }
}

export {}
