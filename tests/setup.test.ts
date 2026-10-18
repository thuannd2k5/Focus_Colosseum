describe('Project Environment Setup', () => {
  it('should have valid typescript configuration and environment', () => {
    const tsconfig = require('../tsconfig.json');
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
});
