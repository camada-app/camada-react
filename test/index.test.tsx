import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CamadaBeacon } from '../src/index';

describe('CamadaBeacon', () => {
  it('renders an async script tag with the default src', () => {
    const html = renderToString(<CamadaBeacon />);
    expect(html).toContain('<script');
    expect(html).toContain('src="/_cam/b.js"');
    expect(html).toContain('async=""');
  });

  it('appends the rid as the r query param', () => {
    const html = renderToString(<CamadaBeacon rid="abc123" />);
    expect(html).toContain('src="/_cam/b.js?r=abc123"');
  });

  it('composes a custom src with the rid', () => {
    const html = renderToString(<CamadaBeacon src="/api/camada/b.js" rid="xyz" />);
    expect(html).toContain('src="/api/camada/b.js?r=xyz"');
  });

  it('honors a custom src without a rid, and treats rid null as absent', () => {
    expect(renderToString(<CamadaBeacon src="/api/camada/b.js" />)).toContain('src="/api/camada/b.js"');
    expect(renderToString(<CamadaBeacon rid={null} />)).toContain('src="/_cam/b.js"');
  });
});
