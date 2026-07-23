import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../src/server/app.js';

const HX_HEADERS = { 'hx-request': 'true' };

describe('The Exhale server', () => {
  const app = buildServer();

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('renders complete primary documents for standard navigation', async () => {
    const home = await app.inject({ method: 'GET', url: '/' });
    const prompt = await app.inject({ method: 'GET', url: '/prompt/' });

    expect(home.statusCode).toBe(200);
    expect(home.body).toContain('<!doctype html>');
    expect(home.body).toContain('The Exhale');
    expect(home.body).toContain('<form');
    expect(prompt.statusCode).toBe(200);
    expect(prompt.body).toContain('<!doctype html>');
    expect(prompt.body).toContain('Reconstruction archive');
  });

  it('returns route fragments for HTMX requests', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/prompt/',
      headers: HX_HEADERS,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).not.toContain('<!doctype html>');
    expect(response.body).toContain('data-page="prompt"');
  });

  it('returns contextual chapter HTML', async () => {
    const response = await app.inject({ method: 'GET', url: '/fragments/chapter/steam' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('Warm vapor');
  });

  it('returns a native fallback page when a chapter is opened directly', async () => {
    const response = await app.inject({ method: 'GET', url: '/fragments/chapter/water' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('<!doctype html>');
    expect(response.body).toContain('Mineral water');
  });

  it('validates inquiry submissions on the server', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/inquiry',
      headers: HX_HEADERS,
      payload: { name: '', email: 'not-an-email', property: '' },
    });

    expect(response.statusCode).toBe(422);
    expect(response.body).toContain('Enter your name');
    expect(response.body).toContain('Enter a valid work email');
  });

  it('accepts valid inquiries without claiming external delivery', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/inquiry',
      headers: HX_HEADERS,
      payload: {
        name: 'Morgan Lee',
        email: 'morgan@example.com',
        property: 'North Shore Resort',
        interest: 'Treatment concept',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain('Request received');
    expect(response.body).toContain('prototype');
  });
});
