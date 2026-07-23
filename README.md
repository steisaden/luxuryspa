# The Exhale

A film-derived luxury wellness experience built with Fastify, Nunjucks, HTMX, native video, GSAP, ScrollTrigger, and Lenis.

## Local production

Requires Node.js 22 or newer.

```sh
npm ci
npm run build
npm start
```

The server listens on `http://127.0.0.1:4187` by default when `PORT=4187` is supplied.

## Verification

```sh
npm run check
npm test
npm run build
npm run test:e2e
```

## GitHub Pages

`npm run build:pages` creates a base-path-safe static artifact at `dist/pages`. The GitHub Actions workflow deploys that artifact to the project Pages site.

GitHub Pages cannot run Fastify. The Pages edition preserves the cinematic experience, prompt archive, chapter pages, native video, and client-side motion, but disables inquiry submission and states that limitation in the page. The complete server validation and HTMX form flow remain available in the Fastify deployment.
