describe('Dashboard feature', () => {
  beforeEach(() => {
    cy.mockLoginAndVisit('/dashboard')
  })

  it('renders the dashboard page for an authenticated user', () => {
    cy.contains(/dashboard/i).should('not.be.visible')
    cy.screenshot('dashboard-page')
  })
})
