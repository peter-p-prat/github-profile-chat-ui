import '@testing-library/jest-dom/vitest';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {};
});
