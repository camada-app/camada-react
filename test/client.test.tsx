// @vitest-environment node
// Client render of <CamadaBeacon/> under the installed React (19 from devDependencies, or 18 via
// vitest.react18.config.ts). jsdom runs scripts like a browser does: a <script> React creates on
// the client through innerHTML is "already started" and never runs (React 18), while one the
// browser parsed from SSR HTML, or one inserted with createElement, does. The beacon here is a
// data: URL that counts its runs (the trailing `//` swallows the `?r=` the component appends).
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StrictMode, act, version } from 'react';
import { JSDOM } from 'jsdom';
import { renderToString } from 'react-dom/server';
import { CamadaBeacon } from '../src/index';

// A browser-like window that runs scripts. vitest's own jsdom environment does not execute
// inserted scripts, so build the window here and expose it before react-dom/client loads.
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'http://localhost/', runScripts: 'dangerously', resources: 'usable' });
for (const k of Object.getOwnPropertyNames(dom.window)) {
  if (!(k in globalThis)) Object.defineProperty(globalThis, k, { configurable: true, get: () => (dom.window as never)[k] });
}
Object.defineProperty(globalThis, 'window', { configurable: true, value: dom.window });
Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.window.document });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
const { createRoot, hydrateRoot } = await import('react-dom/client');

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let n = 0;   // a fresh src per test: React 19 remembers the scripts it hoisted for a document
let SRC = '';
const newSrc = () => `data:text/javascript,window.__beaconRuns=(window.__beaconRuns||0)%2B1;//t${++n}`;
const win = () => dom.window as unknown as { __beaconRuns?: number };
const runs = () => win().__beaconRuns ?? 0;
const settle = (ms: number) => new Promise((r) => setTimeout(r, ms));
const waitForRun = async () => { for (let i = 0; i < 40 && runs() === 0; i++) await settle(25); await settle(150); };

let container: HTMLElement;
beforeEach(() => { SRC = newSrc(); });
afterEach(() => {
  document.head.innerHTML = ''; document.body.innerHTML = '';
  delete win().__beaconRuns;
});
const fresh = () => { container = document.createElement('div'); document.body.appendChild(container); return container; };

describe(`client render, React ${version}`, () => {
  it('runs the beacon exactly once on a client-only render', async () => {
    const root = createRoot(fresh());
    await act(async () => { root.render(<CamadaBeacon src={SRC} rid="r1" />); });
    await waitForRun();
    expect(runs()).toBe(1);
    await act(async () => { root.unmount(); });
  });

  it('runs it exactly once under StrictMode (effects run twice)', async () => {
    const root = createRoot(fresh());
    await act(async () => { root.render(<StrictMode><CamadaBeacon src={SRC} /></StrictMode>); });
    await waitForRun();
    expect(runs()).toBe(1);
    await act(async () => { root.unmount(); });
  });

  it('does not load it again after hydrating an SSR tag the browser already ran', async () => {
    const el = fresh();
    el.innerHTML = renderToString(<CamadaBeacon src={SRC} rid="r2" />);   // the browser parsed this tag and ran it:
    win().__beaconRuns = 1;       // stand in for that run
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => { root = hydrateRoot(el, <StrictMode><CamadaBeacon src={SRC} rid="r2" /></StrictMode>); });
    await settle(300);
    expect(runs()).toBe(1);
    expect(document.querySelectorAll('script').length).toBe(1);
    await act(async () => { root.unmount(); });
  });

  it('a second mount on a page whose beacon is already there does not load it again', async () => {
    const a = createRoot(fresh());
    await act(async () => { a.render(<CamadaBeacon src={SRC} />); });
    await waitForRun();
    const b = createRoot(fresh());
    await act(async () => { b.render(<CamadaBeacon src={SRC} />); });
    await settle(300);
    expect(runs()).toBe(1);
    await act(async () => { a.unmount(); b.unmount(); });
  });
});

describe('server output is unchanged', () => {
  it('renders exactly the bare async script tag', () => {
    expect(renderToString(<CamadaBeacon rid="abc" />)).toBe('<script src="/_cam/b.js?r=abc" async=""></script>');
    expect(renderToString(<CamadaBeacon src="/api/camada/b.js" />)).toBe('<script src="/api/camada/b.js" async=""></script>');
  });
});
