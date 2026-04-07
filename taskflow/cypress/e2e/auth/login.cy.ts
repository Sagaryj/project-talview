describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('shows the login page for unauthenticated users', () => {
    cy.contains(/log in/i).should('be.visible')
  })

  it('allows mocked login without calling the backend', () => {
    cy.mockLogin()
    cy.visit('/dashboard')

    cy.url().should('include', '/dashboard')

  })
  
})
