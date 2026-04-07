describe('Settings feature', () => {
  beforeEach(() => {
    cy.mockLoginAndVisit('/settings')
  })

  it('renders the settings page', () => {
    cy.contains(/settings/i).should('be.visible')
  })
})
