import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface MountableController {
  mount(root: ParentNode): void;
  destroy(): void;
}

export function clampProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

export function dampPlayhead(current: number, target: number, deltaSeconds: number, damping = 8): number {
  const alpha = 1 - Math.exp(-damping * Math.max(0, deltaSeconds));
  return current + (target - current) * alpha;
}

export function safeSeekTarget(target: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(Math.max(0, duration - 0.001), Math.max(0, target));
}

export function quantizeSeekTarget(target: number, duration: number, frameRate: number): number {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(frameRate) || frameRate <= 0) return 0;
  const frameDuration = 1 / frameRate;
  const clamped = Math.min(Math.max(0, duration - frameDuration), Math.max(0, target));
  return Math.round(clamped * frameRate) / frameRate;
}

export const FILM_FRAME_RATE = 60;

export class ScrollFilmController implements MountableController {
  private static readonly SEEK_THRESHOLD = (1 / FILM_FRAME_RATE) * 0.75;
  private video: HTMLVideoElement | null = null;
  private progressElement: HTMLElement | null = null;
  private trigger: ScrollTrigger | null = null;
  private animationFrame = 0;
  private duration = 0;
  private currentTime = 0;
  private targetTime = 0;
  private pendingTime: number | null = null;
  private lastFrameTime = 0;
  private mounted = false;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  private readonly onMetadata = () => {
    if (!this.video) return;
    this.duration = this.video.duration;
    this.currentTime = this.video.currentTime;
    this.targetTime = this.currentTime;
  };

  mount(root: ParentNode): void {
    const journey = root.querySelector<HTMLElement>('[data-scroll-film]');
    this.video = root.querySelector<HTMLVideoElement>('[data-film]');
    this.progressElement = root.querySelector<HTMLElement>('[data-film-progress]');
    if (!journey || !this.video) return;

    this.mounted = true;
    this.video.controls = this.reducedMotion.matches;
    this.video.addEventListener('loadedmetadata', this.onMetadata);
    this.video.addEventListener('seeked', this.onSeeked);
    if (this.video.readyState >= HTMLMediaElement.HAVE_METADATA) this.onMetadata();

    gsap.registerPlugin(ScrollTrigger);
    this.trigger = ScrollTrigger.create({
      trigger: journey,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => {
        const normalized = clampProgress(progress);
        this.targetTime = normalized * this.duration;
        this.progressElement?.style.setProperty('--film-progress', String(normalized));
      },
    });

    if (!this.reducedMotion.matches) {
      this.animationFrame = requestAnimationFrame(this.tick);
    }
  }

  private readonly tick = (now: number) => {
    if (!this.mounted || !this.video) return;
    const deltaSeconds = this.lastFrameTime ? Math.min((now - this.lastFrameTime) / 1000, 0.1) : 1 / 60;
    this.lastFrameTime = now;
    this.currentTime = dampPlayhead(this.currentTime, this.targetTime, deltaSeconds);

    if (Math.abs(this.video.currentTime - this.currentTime) >= ScrollFilmController.SEEK_THRESHOLD) {
      this.requestSeek(this.currentTime);
    }

    this.animationFrame = requestAnimationFrame(this.tick);
  };

  private requestSeek(value: number): void {
    if (!this.video) return;
    const next = quantizeSeekTarget(value, this.duration, FILM_FRAME_RATE);
    if (this.video.seeking) {
      this.pendingTime = next;
      return;
    }
    this.pendingTime = null;
    this.video.currentTime = next;
  }

  private readonly onSeeked = () => {
    if (!this.video || this.pendingTime === null) return;
    const next = this.pendingTime;
    this.pendingTime = null;
    if (Math.abs(this.video.currentTime - next) >= ScrollFilmController.SEEK_THRESHOLD) this.requestSeek(next);
  };

  destroy(): void {
    this.mounted = false;
    this.trigger?.kill();
    this.trigger = null;
    cancelAnimationFrame(this.animationFrame);
    this.video?.removeEventListener('loadedmetadata', this.onMetadata);
    this.video?.removeEventListener('seeked', this.onSeeked);
    this.video = null;
    this.progressElement = null;
    this.pendingTime = null;
    this.lastFrameTime = 0;
  }
}
