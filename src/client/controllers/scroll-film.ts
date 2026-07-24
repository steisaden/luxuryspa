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

export class ScrollFilmController implements MountableController {
  private video: HTMLVideoElement | null = null;
  private progressElement: HTMLElement | null = null;
  private trigger: ScrollTrigger | null = null;
  private animationFrame = 0;
  private videoFrame = 0;
  private decoderWatchdog = 0;
  private duration = 0;
  private currentTime = 0;
  private targetTime = 0;
  private lastFrameTime = 0;
  private decoderReady = true;
  private mounted = false;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  private readonly onMetadata = () => {
    if (!this.video) return;
    this.duration = this.video.duration;
    this.currentTime = this.video.currentTime;
    this.targetTime = this.currentTime;
  };

  private readonly releaseDecoder = () => {
    if (this.decoderWatchdog) window.clearTimeout(this.decoderWatchdog);
    this.decoderWatchdog = 0;
    if (this.video && this.videoFrame && 'cancelVideoFrameCallback' in this.video) {
      this.video.cancelVideoFrameCallback(this.videoFrame);
    }
    this.videoFrame = 0;
    this.decoderReady = true;
  };

  mount(root: ParentNode): void {
    const journey = root.querySelector<HTMLElement>('[data-scroll-film]');
    this.video = root.querySelector<HTMLVideoElement>('[data-film]');
    this.progressElement = root.querySelector<HTMLElement>('[data-film-progress]');
    if (!journey || !this.video) return;

    this.mounted = true;
    this.video.controls = this.reducedMotion.matches;
    this.video.pause();
    this.video.addEventListener('loadedmetadata', this.onMetadata);
    this.video.addEventListener('seeked', this.releaseDecoder);
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

    const frameThreshold = 1 / 48;
    if (this.decoderReady && !this.video.seeking && Math.abs(this.video.currentTime - this.currentTime) >= frameThreshold) {
      this.decoderReady = false;
      this.video.currentTime = safeSeekTarget(this.currentTime, this.duration);

      if ('requestVideoFrameCallback' in this.video) {
        this.videoFrame = this.video.requestVideoFrameCallback(this.releaseDecoder);
      } else {
        requestAnimationFrame(this.releaseDecoder);
      }
      this.decoderWatchdog = window.setTimeout(this.releaseDecoder, 250);
    }

    this.animationFrame = requestAnimationFrame(this.tick);
  };

  destroy(): void {
    this.mounted = false;
    this.trigger?.kill();
    this.trigger = null;
    cancelAnimationFrame(this.animationFrame);
    this.releaseDecoder();
    this.video?.removeEventListener('loadedmetadata', this.onMetadata);
    this.video?.removeEventListener('seeked', this.releaseDecoder);
    this.video = null;
    this.progressElement = null;
    this.lastFrameTime = 0;
    this.decoderReady = true;
  }
}
