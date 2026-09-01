// @camada/react — renders the first-party camada beacon script tag.
// No hooks, no client-only APIs: works as a React Server Component, in SSR
// (renderToString), and in plain client React alike.

export interface CamadaBeaconProps {
  /** Path the backend SDK serves the beacon from. Default: '/_cam/b.js'. */
  src?: string;
  /** Request id correlating the beacon with this page view; appended as ?r=<rid>. */
  rid?: string | null;
}

export function CamadaBeacon({ src = '/_cam/b.js', rid }: CamadaBeaconProps) {
  return <script src={rid ? `${src}?r=${rid}` : src} async />;
}
