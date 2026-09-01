# @camada/react

React component for the camada beacon: `<CamadaBeacon />` renders the
first-party beacon `<script>` tag served by a camada backend SDK.

No hooks, no client-only APIs — it works as a React Server Component, in SSR
(`renderToString`), and in plain client React.

## Install

Unpublished. Consume it from a sibling checkout via a `file:` dependency:

```json
{
  "dependencies": {
    "@camada/react": "file:../camada-react"
  }
}
```

Run `npm run build` in this repo first so `dist/` exists. Requires `react >= 18`
as a peer dependency.

## Quickstart

```tsx
import { CamadaBeacon } from '@camada/react';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CamadaBeacon rid={requestId} />
      </body>
    </html>
  );
}
```

Renders `<script src="/_cam/b.js?r=<rid>" async />`. The script itself is the
`@camada/browser` self-initializing beacon, served at `/_cam/b.js` by the
backend SDK on the same origin.

### Props

| Prop  | Type             | Default        | Meaning                                                    |
| ----- | ---------------- | -------------- | ---------------------------------------------------------- |
| `src` | `string`         | `'/_cam/b.js'` | Path the backend SDK serves the beacon from.               |
| `rid` | `string \| null` | —              | Request id for this page view; appended as `?r=<rid>`.     |

The props type is exported as `CamadaBeaconProps`.

## Development

```bash
npm install
npm run build   # tsup (ESM + CJS + d.ts)
npm test        # vitest (renderToString)
npm run check   # tsc --noEmit
```
