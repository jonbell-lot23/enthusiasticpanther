describe('EP navigation test', () => {
  it('should navigate through header items and ensure they load correctly', () => {
    // Go to the home page
    cy.visit('https://enthusiasticpanther.com/');

    // Verify that the home page has loaded
    cy.contains('Latest shows');
    cy.contains('Highly rated shows');

    // Click "About" in the header and verify it loads
    cy.get('div.flex > div.space-x-4 > a[href="/about"]').click();
    cy.url().should('include', '/about');
    // Add a check for some content that should appear on the "About" page
    // cy.contains('Some content specific to About page');

    // Click "Shows" in the header and verify it loads
    cy.get('div.flex > div.space-x-4 > a[href="/shows"]').click();
    cy.url().should('include', '/shows');
    // Add a check for some content that should appear on the "Shows" page
    // cy.contains('Some content specific to Shows page');

    // Click "Songs" in the header and verify it loads
    cy.get('div.flex > div.space-x-4 > a[href="/songs"]').click();
    cy.url().should('include', '/songs');
    // Add a check for some content that should appear on the "Songs" page
    // cy.contains('Some content specific to Songs page');
  });
});
