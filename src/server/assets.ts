import fs from 'node:fs';
import path from 'node:path';

interface ManifestChunk {
  file: string;
  css?: string[];
}

interface AssetBundle {
  script: string;
  styles: string[];
}

export function resolveAssets(root: string, basePath = ''): AssetBundle {
  const manifestPath = path.join(root, 'dist/client/.vite/manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return {
      script: 'http://127.0.0.1:5173/src/client/main.ts',
      styles: [],
    };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Record<string, ManifestChunk>;
  const entry = manifest['src/client/main.ts'];

  if (!entry) {
    throw new Error('Vite manifest is missing the client entry.');
  }

  return {
    script: `${basePath}/${entry.file}`,
    styles: (entry.css ?? []).map((file) => `${basePath}/${file}`),
  };
}
