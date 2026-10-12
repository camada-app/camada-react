import { defineConfig } from 'vitest/config';

// Tests run in node; test/client.test.tsx builds its own script-running JSDOM window (runScripts +
// resources) for the client-render cases. React 19 runs from the root devDependencies.
export default defineConfig({
  test: {
    include: ['test/*.test.tsx'],
  },
});
