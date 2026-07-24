import { describe, expect, it } from 'vitest';
import { FILM_FRAME_RATE, clampProgress, dampPlayhead, quantizeSeekTarget, safeSeekTarget } from '../src/client/controllers/scroll-film.js';

describe('scroll-film math', () => {
  it('clamps normalized progress', () => {
    expect(clampProgress(-0.4)).toBe(0);
    expect(clampProgress(0.4)).toBe(0.4);
    expect(clampProgress(1.4)).toBe(1);
  });

  it('uses frame-rate-independent exponential damping', () => {
    const oneStep = dampPlayhead(0, 10, 1 / 30, 8);
    const twoSteps = dampPlayhead(dampPlayhead(0, 10, 1 / 60, 8), 10, 1 / 60, 8);

    expect(oneStep).toBeCloseTo(twoSteps, 10);
    expect(oneStep).toBeGreaterThan(0);
    expect(oneStep).toBeLessThan(10);
  });

  it('keeps seek targets inside decodable media bounds', () => {
    expect(safeSeekTarget(12, 10)).toBeLessThan(10);
    expect(safeSeekTarget(-1, 10)).toBe(0);
  });

  it('quantizes seek targets to exact source frames', () => {
    expect(FILM_FRAME_RATE).toBe(60);
    expect(quantizeSeekTarget(1.041, 10, FILM_FRAME_RATE)).toBe(1.0333333333333334);
    expect(quantizeSeekTarget(10, 10, FILM_FRAME_RATE)).toBe(9.983333333333333);
    expect(quantizeSeekTarget(-1, 10, FILM_FRAME_RATE)).toBe(0);
  });
});
