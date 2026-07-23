import type { MountableController } from './scroll-film.js';

export class GuidedTourController implements MountableController {
  private root: HTMLElement | null = null;
  private status: HTMLElement | null = null;
  private animationFrame = 0;
  private speed = 1;
  private playing = false;
  private startedAt = 0;
  private startY = 0;
  private destinationY = 0;
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly manualEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

  mount(root: ParentNode): void {
    this.root = root.querySelector<HTMLElement>('[data-guided-tour]');
    if (!this.root) return;
    this.status = this.root.querySelector<HTMLElement>('[data-tour-status]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.root.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
        button.disabled = true;
      });
      this.setStatus('Guided motion is disabled by your reduced-motion preference.');
      return;
    }
    this.root.addEventListener('click', this.onClick);
    for (const type of this.manualEvents) window.addEventListener(type, this.onManualInput, { passive: true });
  }

  private readonly onClick = (event: Event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button) return;

    const speed = Number(button.dataset.tourSpeed);
    if (speed === 1 || speed === 2) {
      this.speed = speed;
      this.root?.querySelectorAll<HTMLButtonElement>('[data-tour-speed]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      this.setStatus(`Tour speed set to ${speed}×.`);
      return;
    }

    if (button.dataset.tourAction === 'play') this.play();
    if (button.dataset.tourAction === 'pause') this.pause('Tour paused.');
  };

  private play(): void {
    if (this.reducedMotion.matches) {
      this.setStatus('Guided motion is disabled by your reduced-motion preference.');
      return;
    }
    this.pause();
    this.playing = true;
    this.startedAt = performance.now();
    this.startY = 0;
    this.destinationY = Math.max(0, this.root?.offsetTop ?? document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: 0, behavior: 'instant' });
    this.root?.querySelector<HTMLButtonElement>('[data-tour-action="play"]')?.setAttribute('aria-pressed', 'true');
    this.setStatus(`Guided tour playing at ${this.speed}×.`);
    this.animationFrame = requestAnimationFrame(this.step);
  }

  private readonly step = (now: number) => {
    if (!this.playing) return;
    const duration = 20_000 / this.speed;
    const progress = Math.min(1, (now - this.startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo({ top: this.startY + (this.destinationY - this.startY) * eased, behavior: 'instant' });

    if (progress >= 1) {
      this.pause('Guided tour complete.');
      return;
    }
    this.animationFrame = requestAnimationFrame(this.step);
  };

  private readonly onManualInput = (event: Event) => {
    if (!this.playing) return;
    const target = event.target as Element | null;
    if (target?.closest('[data-guided-tour]')) return;
    this.pause('Tour paused after manual input.');
  };

  private pause(message?: string): void {
    this.playing = false;
    cancelAnimationFrame(this.animationFrame);
    this.root?.querySelector<HTMLButtonElement>('[data-tour-action="play"]')?.setAttribute('aria-pressed', 'false');
    if (message) this.setStatus(message);
  }

  private setStatus(message: string): void {
    if (this.status) this.status.textContent = message;
  }

  destroy(): void {
    this.pause();
    this.root?.removeEventListener('click', this.onClick);
    for (const type of this.manualEvents) window.removeEventListener(type, this.onManualInput);
    this.root = null;
    this.status = null;
  }
}
