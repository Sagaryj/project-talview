describe('Protected routes', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('redirects dashboard access to login when no session exists', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

  it('opens a protected page when a mocked session exists', () => {
    cy.mockLoginAndVisit('/settings')
    cy.url().should('include', '/settings')
  })
})
describe('Protected routes', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })
  it('redirects dashboard access to login when no session exists', () => {
    cy.visit('/dashboard')
    cy.url().should('include','/login')
  })


})
