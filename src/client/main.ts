import '@fontsource/bellefair/400.css';
import '@fontsource-variable/albert-sans';
import 'htmx.org';
import './styles.css';
import { CopyPromptController } from './controllers/copy-prompt.js';
import { GuidedTourController } from './controllers/guided-tour.js';
import { ScrollFilmController, type MountableController } from './controllers/scroll-film.js';
import { SmoothScrollController } from './controllers/smooth-scroll.js';

let controllers: MountableController[] = [];

function destroy(): void {
  for (const controller of [...controllers].reverse()) controller.destroy();
  controllers = [];
  document.documentElement.dataset.activeLifecycles = '0';
}

function mount(root: ParentNode = document): void {
  destroy();
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('.site-nav__links a').forEach((link) => {
    const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/$/, '') || '/';
    if (linkPath === currentPath) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  controllers = [
    new SmoothScrollController(),
    new ScrollFilmController(),
    new GuidedTourController(),
    new CopyPromptController(),
  ];
  for (const controller of controllers) controller.mount(root);

  const current = Number.parseInt(document.documentElement.dataset.mountCount ?? '0', 10);
  document.documentElement.dataset.mountCount = String(current + 1);
  document.documentElement.dataset.activeLifecycles = '1';

  const focusTarget = root.querySelector<HTMLElement>('#main-content');
  if (current > 0) focusTarget?.focus({ preventScroll: true });
}

function swapTargetsAppShell(event: Event): boolean {
  const detail = (event as CustomEvent<{ target?: Element }>).detail;
  return detail?.target?.id === 'app-shell';
}

function focusAndReveal(element: HTMLElement | null): void {
  if (!element) return;
  element.focus({ preventScroll: true });
  const rect = element.getBoundingClientRect();
  const navHeight = document.querySelector<HTMLElement>('.site-nav')?.offsetHeight ?? 0;
  if (rect.top < navHeight || rect.bottom > window.innerHeight) {
    element.scrollIntoView({ behavior: 'auto', block: 'center' });
  }
}

document.addEventListener('DOMContentLoaded', () => mount(document), { once: true });
document.body.addEventListener('htmx:beforeSwap', (event) => {
  const detail = (event as CustomEvent<{ xhr?: XMLHttpRequest; shouldSwap?: boolean; isError?: boolean }>).detail;
  if (detail?.xhr?.status === 422) {
    detail.shouldSwap = true;
    detail.isError = false;
  }
  if (swapTargetsAppShell(event)) destroy();
});
document.body.addEventListener('htmx:afterSwap', (event) => {
  const detail = (event as CustomEvent<{ target?: ParentNode }>).detail;
  if ((detail?.target as Element | undefined)?.id === 'app-shell') mount(document);

  const reportedTarget = detail?.target as HTMLElement | undefined;
  const target = reportedTarget?.isConnected
    ? reportedTarget
    : reportedTarget?.id
      ? document.getElementById(reportedTarget.id) ?? undefined
      : undefined;
  const chapterNote = target?.querySelector?.<HTMLElement>('.chapter-note');
  const firstInvalid = target?.querySelector?.<HTMLElement>('[aria-invalid="true"]');
  const success = target?.querySelector?.<HTMLElement>('.form-success');
  focusAndReveal(chapterNote ?? firstInvalid ?? success ?? null);
});
document.body.addEventListener('htmx:responseError', () => {
  const status = document.querySelector<HTMLElement>('#global-status');
  if (status) status.textContent = 'The server could not complete that request. Native links and form submission remain available.';
});
window.addEventListener('pagehide', destroy, { once: true });

export { destroy, mount };
