import fs from 'node:fs';
import path from 'node:path';
import { buildServer } from '../src/server/app.js';
import { chapterList } from '../src/server/content.js';

const root = process.cwd();
const outputRoot = path.join(root, 'dist/pages');
const clientRoot = path.join(root, 'dist/client');
const publicBasePath = process.env.PUBLIC_BASE_PATH?.trim() || '/luxuryspa';

process.env.PUBLIC_BASE_PATH = publicBasePath;
process.env.STATIC_EXPORT = 'true';
process.env.NODE_ENV = 'production';

if (!fs.existsSync(path.join(clientRoot, '.vite/manifest.json'))) {
  throw new Error('Client build is missing. Run npm run build before exporting Pages.');
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
fs.cpSync(clientRoot, outputRoot, { recursive: true });

const app = buildServer();
await app.ready();

async function render(url: string, outputPath: string) {
  const response = await app.inject({ method: 'GET', url });
  if (response.statusCode !== 200 && response.statusCode !== 404) {
    throw new Error(`Static render failed for ${url}: HTTP ${response.statusCode}`);
  }

  const destination = path.join(outputRoot, outputPath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, response.body);
  return response.body;
}

const home = await render('/', 'index.html');
await render('/prompt/', 'prompt/index.html');
for (const chapter of chapterList) {
  await render(`/fragments/chapter/${chapter.slug}`, `chapters/${chapter.slug}/index.html`);
}
await render('/not-found-for-static-export', '404.html');
await app.close();

fs.writeFileSync(path.join(outputRoot, '.nojekyll'), '');

const expectedPrefix = `${publicBasePath.replace(/\/$/, '')}/`;
const assertions: Array<[boolean, string]> = [
  [home.includes(`href="${expectedPrefix}"`), 'home link uses the Pages base path'],
  [home.includes(`src="${expectedPrefix}media/spa-film-all-intra.mp4"`), 'film uses the Pages base path'],
  [home.includes('id="static-inquiry-note"'), 'static inquiry limitation is disclosed'],
  [home.includes('disabled aria-disabled="true"'), 'static inquiry submit is disabled'],
];
for (const [passed, message] of assertions) {
  if (!passed) throw new Error(`Static export assertion failed: ${message}`);
}

console.log(`Exported GitHub Pages artifact to ${outputRoot}`);
