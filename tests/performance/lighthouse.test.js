const { runLighthouse } = require('@lhci/cli/src/api/commands/run.js');

describe('Lighthouse performance & SEO', () => {
  it('la home debe tener buen score de performance y SEO', async () => {
    const { lhr } = await runLighthouse('http://localhost:3000', { 
      output: 'json',
      onlyCategories: ['performance', 'seo'],
      chromeFlags: '--headless',
    });
    expect(lhr.categories.performance.score).toBeGreaterThan(0.8);
    expect(lhr.categories.seo.score).toBeGreaterThan(0.8);
  });
}); 