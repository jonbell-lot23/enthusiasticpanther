describe('EP navigation test', () => {
  it('should navigate through header items and ensure they load correctly', () => {
    // Go to the home page
    cy.visit('http://localhost:3000');

    // Verify that the home page has loaded
    cy.contains('Latest shows');
    cy.contains('Highly rated shows');

    // Click "About" in the header and verify it loads
    cy.get('div.flex > div.space-x-4 > a[href="/about"]').click();
    cy.url().should('include', '/about');

    // Click "Shows" in the header and verify it loads
    cy.get('div.flex > div.space-x-4 > a[href="/shows"]').click();
    cy.url().should('include', '/shows');

    // Click "Songs" in the header and verify it loads
    cy.get('div.flex > div.space-x-4 > a[href="/songs"]').click();
    cy.url().should('include', '/songs');
  });
});
