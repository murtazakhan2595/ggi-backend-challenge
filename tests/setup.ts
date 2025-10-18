// Global test setup
beforeAll(() => {
  // Suppress console logs during tests
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'info').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
});

afterAll(() => {
  // Restore console
  jest.restoreAllMocks();
});
