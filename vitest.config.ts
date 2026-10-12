import { defineConfig } from 'vitest/config';

// jsdom executes the scripts a client render inserts (runScripts + resources), which is what the
// client-render tests in test/client.test.tsx assert on. React 19 runs from the root devDependencies.
export default defineConfig({
  test: {
    include: ['test/*.test.tsx'],
    environmentOptions: { jsdom: { runScripts: 'dangerously', resources: 'usable' } },
  },
});
