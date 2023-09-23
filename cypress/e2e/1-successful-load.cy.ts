describe('EP navigation test', () => {
  it('should navigate through header items and ensure they load correctly', () => {
    // Attempt the following code block 5 times
    const retries = 5;
    for (let i = 0; i < retries; i++) {
      // Go to the home page
      cy.visit('https://enthusiasticpanther.com/').retry(retries);

      // Verify that the home page has loaded
      cy.contains('Latest shows').retry(retries);
      cy.contains('Highly rated shows').retry(retries);

      // Click "About" in the header and verify it loads
      cy.get('div.flex > div.space-x-4 > a[href="/about"]').click().retry(retries);
      cy.url().should('include', '/about').retry(retries);
      // Add a check for some content that should appear on the "About" page
      // cy.contains('Some content specific to About page').retry(retries);

      // Click "Shows" in the header and verify it loads
      cy.get('div.flex > div.space-x-4 > a[href="/shows"]').click().retry(retries);
      cy.url().should('include', '/shows').retry(retries);
      // Add a check for some content that should appear on the "Shows" page
      // cy.contains('Some content specific to Shows page').retry(retries);

      // Click "Songs" in the header and verify it loads
      cy.get('div.flex > div.space-x-4 > a[href="/songs"]').click().retry(retries);
      cy.url().should('include', '/songs').retry(retries);
      // Add a check for some content that should appear on the "Songs" page
      // cy.contains('Some content specific to Songs page').retry(retries);
    }
  });
});
