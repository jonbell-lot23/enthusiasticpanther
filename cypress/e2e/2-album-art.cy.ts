describe('Enthusiastic Panther Album Art', () => {
  it('should check that the first item in "Latest shows" uses a PNG for album art', () => {
    // Go to the home page
    cy.visit('https://enthusiasticpanther.com');  // Replace with the URL of your app if needed

    // Navigate to the "Latest shows" section
    cy.contains('Latest shows').scrollIntoView();

    // Get the first image element in the "Latest shows" section and verify its source ends with '.png'
    cy.get('section:contains("Latest shows") img')
      .first()
      .should('have.attr', 'src')
      .and('match', /\.png$/);  // RegExp to ensure it ends with '.png'
  });
});
