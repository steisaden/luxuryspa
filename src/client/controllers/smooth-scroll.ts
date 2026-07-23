import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { MountableController } from './scroll-film.js';

export class SmoothScrollController implements MountableController {
  private lenis: Lenis | null = null;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly tick = (time: number) => this.lenis?.raf(time * 1000);
  private readonly update = () => ScrollTrigger.update();

  mount(): void {
    if (this.reducedMotion.matches) return;
    gsap.registerPlugin(ScrollTrigger);
    this.lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
    });
    this.lenis.on('scroll', this.update);
    gsap.ticker.add(this.tick);
    gsap.ticker.lagSmoothing(0);
  }

  destroy(): void {
    gsap.ticker.remove(this.tick);
    this.lenis?.off('scroll', this.update);
    this.lenis?.destroy();
    this.lenis = null;
  }
}
