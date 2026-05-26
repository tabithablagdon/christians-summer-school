const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(
  path.resolve(__dirname, '../../public/index.html'),
  'utf8'
);

describe('CSS custom properties in index.html', () => {
  test('--color-border-danger is defined', () => {
    expect(indexHtml).toMatch(/--color-border-danger\s*:/);
  });

  test('--color-border-danger uses SF Giants orange at low opacity', () => {
    expect(indexHtml).toMatch(/--color-border-danger\s*:\s*rgba\(253\s*,\s*90\s*,\s*30/);
  });

  test('--color-border-secondary is defined', () => {
    expect(indexHtml).toMatch(/--color-border-secondary\s*:/);
  });

  test('--color-border-tertiary is defined', () => {
    expect(indexHtml).toMatch(/--color-border-tertiary\s*:/);
  });
});
