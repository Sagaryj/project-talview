describe('Projects feature', () => {
  beforeEach(() => {
    cy.mockLoginAndVisit('/projects')
  })

  it('renders the projects page', () => {
    cy.contains(/projects/i).should('be.visible')
  })
})
