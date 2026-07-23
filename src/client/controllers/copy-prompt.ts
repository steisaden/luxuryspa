import type { MountableController } from './scroll-film.js';

export class CopyPromptController implements MountableController {
  private root: HTMLElement | null = null;
  private button: HTMLButtonElement | null = null;
  private source: HTMLElement | null = null;
  private status: HTMLElement | null = null;
  private resetTimer = 0;

  mount(root: ParentNode): void {
    this.root = root.querySelector<HTMLElement>('[data-copy-prompt]');
    if (!this.root) return;
    this.button = this.root.querySelector<HTMLButtonElement>('[data-copy-button]');
    this.source = this.root.querySelector<HTMLElement>('[data-copy-source]');
    this.status = this.root.querySelector<HTMLElement>('[data-copy-status]');
    this.button?.addEventListener('click', this.copy);
  }

  private readonly copy = async () => {
    if (!this.source || !this.button) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.source.textContent ?? '');
      } else {
        this.source.focus();
        this.selectSource();
        if (!document.execCommand('copy')) throw new Error('Copy command was unavailable.');
      }
      this.button.textContent = 'Copied';
      this.button.dataset.state = 'success';
      if (this.status) this.status.textContent = 'Prompt copied to the clipboard.';
      this.resetTimer = window.setTimeout(() => this.reset(), 2500);
    } catch {
      this.source.focus();
      this.selectSource();
      this.button.dataset.state = 'error';
      if (this.status) this.status.textContent = 'Clipboard access was unavailable. The prompt is selected for manual copy.';
    }
  };

  private selectSource(): void {
    if (!this.source) return;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this.source);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  private reset(): void {
    if (!this.button) return;
    this.button.textContent = this.button.dataset.copyDefault ?? 'Copy prompt';
    delete this.button.dataset.state;
  }

  destroy(): void {
    window.clearTimeout(this.resetTimer);
    this.button?.removeEventListener('click', this.copy);
    this.root = null;
    this.button = null;
    this.source = null;
    this.status = null;
  }
}
