describe('Enthusiastic Panther Album Art', () => {
  it('should check that the first item in "Latest shows" uses a PNG for album art', () => {
    // Go to the home page
    cy.visit('http://localhost:3000');

    // Navigate to the "Latest shows" section
    cy.contains('Latest shows').scrollIntoView();

cy.get('section:contains("Latest shows") div.grid > div')
.first()
.find('img')
.should('have.attr', 'src')
.and('match', /\.png$/);  // RegExp to ensure it ends with '.png'
  });


});
