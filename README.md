# @camada/react

React component for the camada beacon: `<CamadaBeacon />` renders the
first-party beacon `<script>` tag served by a camada backend SDK.

Server output (SSR with `renderToString`, or a React Server Component) is the bare
`<script src async>` tag, which the browser runs as it parses the page. On the client the
component also loads the script itself, once: React 18 never runs a `<script>` it creates
on the client (React 19 does), so under React 18 an effect inserts the script with
`document.createElement`. It skips that when the tag was already on the page when the
component first rendered (an SSR'd tag being hydrated, or an earlier mount), and under
React 19. The package ships with the `'use client'` directive so a Server Component can
import it.

## Install

```sh
npm install @camada/react
```

Requires `react >= 18` as a peer dependency.

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
`@camada/browser` self-initializing beacon, served first-party by the backend SDK:
`@camada/node` and `@camada/hono` serve it at `/_cam/b.js`, the default here.
`@camada/next` wraps this component in its own async `<CamadaBeacon />` with the
default `src` `/api/camada/b.js` and the rid read from the middleware's
`x-camada-rid` header — use that one in a Next app rather than this component
directly.

The component reports no version of its own; the beacon it loads stamps
`sdk: "@camada/browser/<version>"` on its payload, which is what the dashboard
uses to flag an outdated beacon.

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
npm test        # vitest: SSR output, and client render under React 19 and React 18 (jsdom runs the scripts)
npm run check   # tsc --noEmit
```
