'use client';
// @camada/react — renders the first-party camada beacon script tag.
// The tag is a plain <script src async>: SSR (renderToString) and RSC output is exactly that, and
// the browser's parser runs it. A script React creates on the CLIENT through innerHTML never runs
// under React 18 (React 19 hoists and loads it), so on the client the component also inserts the
// script imperatively, once, unless the tag was already on the page when it first rendered
// (SSR'd and hydrated, or a second mount). The 'use client' directive keeps that effect legal when
// a Server Component imports this: the server output is the same tag.
import { useEffect, useRef, useState, version } from 'react';

export interface CamadaBeaconProps {
  /** Path the backend SDK serves the beacon from. Default: '/_cam/b.js'. */
  src?: string;
  /** Request id correlating the beacon with this page view; appended as ?r=<rid>. */
  rid?: string | null;
}

const hasScript = (url: string, except?: Element | null): boolean =>
  Array.from(document.scripts).some((s) => s !== except && s.getAttribute('src') === url);

export function CamadaBeacon({ src = '/_cam/b.js', rid }: CamadaBeaconProps) {
  const url = rid ? `${src}?r=${rid}` : src;
  const own = useRef<HTMLScriptElement>(null);
  // Render phase, before this component's own tag is committed: a tag already in the document is
  // an SSR'd one the browser ran (hydration) or one an earlier mount loaded.
  const [onPage] = useState(() => typeof document !== 'undefined' && hasScript(url));
  useEffect(() => {
    if (onPage || Number.parseInt(version, 10) >= 19) return;   // React 19 loads the rendered tag itself
    if (hasScript(url, own.current)) return;                    // StrictMode's second effect run, or a sibling mount
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    document.head.appendChild(s);
  }, [url, onPage]);
  return <script ref={own} src={url} async />;
}
