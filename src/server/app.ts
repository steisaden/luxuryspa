import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import formbody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import Fastify, { type FastifyRequest } from 'fastify';
import nunjucks from 'nunjucks';
import { resolveAssets } from './assets.js';
import { chapterList, chapters, reconstructionPrompt, type ChapterSlug } from './content.js';

interface InquiryBody {
  name?: string;
  email?: string;
  property?: string;
  interest?: string;
  message?: string;
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const isHtmx = (request: FastifyRequest) => request.headers['hx-request'] === 'true';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicBasePath() {
  const configured = process.env.PUBLIC_BASE_PATH?.trim();
  if (!configured || configured === '/') return '';
  return `/${configured.replace(/^\/+|\/+$/g, '')}`;
}

function pageContext(page: 'home' | 'prompt' | 'chapter' | 'inquiry') {
  const basePath = publicBasePath();
  return {
    page,
    assets: resolveAssets(projectRoot, basePath),
    basePath,
    staticMode: process.env.STATIC_EXPORT === 'true',
    currentYear: new Date().getFullYear(),
  };
}

function validateInquiry(body: InquiryBody) {
  const values = {
    name: body.name?.trim() ?? '',
    email: body.email?.trim() ?? '',
    property: body.property?.trim() ?? '',
    interest: body.interest?.trim() ?? '',
    message: body.message?.trim() ?? '',
  };
  const errors: Record<string, string> = {};

  if (!values.name) errors.name = 'Enter your name so the request can be addressed.';
  if (!emailPattern.test(values.email)) errors.email = 'Enter a valid work email, such as name@property.com.';
  if (!values.property) errors.property = 'Enter the property or resort group you represent.';

  return { values, errors };
}

export function buildServer() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'test' });

  app.register(formbody);
  app.register(fastifyView, {
    engine: { nunjucks },
    root: path.join(projectRoot, 'templates'),
    options: {
      onConfigure(environment: nunjucks.Environment) {
        environment.addGlobal('isHtmx', false);
      },
    },
  });

  const clientRoot = path.join(projectRoot, 'dist/client');
  const publicRoot = path.join(projectRoot, 'public');
  if (fs.existsSync(clientRoot)) {
    app.register(fastifyStatic, {
      root: path.resolve(clientRoot),
      prefix: '/',
      wildcard: false,
    });
  } else {
    app.register(fastifyStatic, {
      root: path.resolve(publicRoot),
      prefix: '/',
      wildcard: false,
    });
  }

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/', async (request, reply) => {
    const context = {
      ...pageContext('home'),
      chapters: chapterList,
      values: {},
      errors: {},
      success: false,
    };
    return reply.view(isHtmx(request) ? 'pages/home-content.njk' : 'pages/home.njk', context);
  });

  app.get('/prompt/', async (request, reply) => {
    const context = { ...pageContext('prompt'), prompt: reconstructionPrompt };
    return reply.view(isHtmx(request) ? 'pages/prompt-content.njk' : 'pages/prompt.njk', context);
  });

  app.get('/prompt/reconstruction', async (request, reply) => {
    if (!isHtmx(request)) return reply.redirect('/prompt/#reconstruction');
    return reply.view('fragments/reconstruction.njk', { prompt: reconstructionPrompt });
  });

  app.get<{ Params: { chapter: string } }>('/fragments/chapter/:chapter', async (request, reply) => {
    const chapter = chapters[request.params.chapter as ChapterSlug];
    if (!chapter) return reply.code(404).view('pages/not-found.njk', pageContext('chapter'));

    if (isHtmx(request)) return reply.view('fragments/chapter.njk', { chapter });
    return reply.view('pages/chapter.njk', { ...pageContext('chapter'), chapter });
  });

  app.post<{ Body: InquiryBody }>('/inquiry', async (request, reply) => {
    const { values, errors } = validateInquiry(request.body ?? {});
    const success = Object.keys(errors).length === 0;
    const context = { ...pageContext('inquiry'), values, errors, success };

    if (!success) reply.code(422);
    return reply.view(isHtmx(request) ? 'fragments/inquiry-result.njk' : 'pages/inquiry-result.njk', context);
  });

  app.setNotFoundHandler(async (request, reply) => {
    reply.code(404);
    return reply.view(isHtmx(request) ? 'fragments/not-found.njk' : 'pages/not-found.njk', pageContext('chapter'));
  });

  return app;
}
