import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config';

// The same suite against React 18: `react` and `react-dom` resolve to the copy in test/react18
// (installed by `pretest`), whose react-dom finds its own sibling react.
const nm = (p: string) => fileURLToPath(new URL(`./test/react18/node_modules/${p}`, import.meta.url));
export default mergeConfig(base, defineConfig({
  resolve: { alias: [{ find: /^react-dom(\/.*)?$/, replacement: nm('react-dom') + '$1' }, { find: /^react(\/.*)?$/, replacement: nm('react') + '$1' }] },
  test: { server: { deps: { inline: [/react/] } } },
}));
