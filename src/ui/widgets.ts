// 画面の部品：下のタブバー、上のタブと横スワイプで切り替えるページ、スライドして決める操作
import { SLIDE_DONE } from '../data/ui';

export type Tab = 'home' | 'halls' | 'shop' | 'me';

const ICON: Record<Tab, string> = {
  home: '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z"/>',
  halls: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><rect x="6.5" y="7" width="11" height="6" rx="1" fill="var(--bg)"/><path d="M9 8.5h2.6l-1.6 3.4M12.4 8.5H15l-1.6 3.4" stroke="var(--tab-on)" stroke-width="1.2" fill="none"/><circle cx="12" cy="17" r="1.6" fill="var(--bg)"/>',
  shop: '<path d="M5 8h14l-1.2 12.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z"/><path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6z"/>',
};
const NAMES: [Tab, string][] = [['home', 'ホーム'], ['halls', 'パチ屋'], ['shop', '買い物'], ['me', '自分']];

/** 下のタブバー。active が null なら隠す（打っている最中・バイト・ルーレットの途中など） */
export function setTabbar(active: Tab | null, onGo: (t: Tab) => void): void {
  let bar = document.getElementById('tabbar');
  if (!bar) {
    bar = document.createElement('nav');
    bar.id = 'tabbar';
    bar.className = 'tabbar';
    bar.setAttribute('aria-label', 'メニュー');
    bar.innerHTML = NAMES.map(([k, n]) => `<button type="button" data-tab="${k}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${ICON[k]}</svg><span>${n}</span></button>`).join('');
    document.body.append(bar);
  }
  bar.onclick = e => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-tab]');
    if (b) onGo(b.dataset.tab as Tab);
  };
  bar.hidden = active === null;
  document.body.classList.toggle('has-tabs', active !== null);
  for (const b of bar.querySelectorAll<HTMLButtonElement>('[data-tab]')) {
    const on = b.dataset.tab === active;
    b.classList.toggle('on', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
}

export interface Page { key: string; label: string; html: string }

/** 上のタブ＋横スワイプで切り替えるページ */
export function pagesHTML(pages: Page[], current: string): string {
  return `<div class="seg" role="tablist">${pages.map(p => `<button type="button" role="tab" data-page="${p.key}" aria-selected="${p.key === current}">${p.label}</button>`).join('')}</div>
  <div class="pages">${pages.map(p => `<section class="page" data-key="${p.key}" aria-label="${p.label}">${p.html}</section>`).join('')}</div>`;
}

/** ページを開いた位置に合わせ、タブを押すと移動、スワイプで止まった位置にタブを合わせる */
export function bindPages(root: HTMLElement, current: string, onChange: (key: string) => void): void {
  const box = root.querySelector<HTMLElement>('.pages'), seg = root.querySelector<HTMLElement>('.seg');
  if (!box || !seg) return;
  const pages = [...box.querySelectorAll<HTMLElement>('.page')];
  const keyAt = () => pages[Math.round(box.scrollLeft / Math.max(1, box.clientWidth))]?.dataset.key ?? current;
  const mark = (k: string) => {
    for (const b of seg.querySelectorAll<HTMLElement>('[data-page]')) b.setAttribute('aria-selected', String(b.dataset.page === k));
    seg.querySelector<HTMLElement>(`[data-page="${k}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    // ページの高さを今のページに合わせる（短いページの下に大きな空きができないように）
    const p = pages.find(x => x.dataset.key === k);
    if (p) box.style.height = p.scrollHeight + 'px';
  };
  const i0 = Math.max(0, pages.findIndex(p => p.dataset.key === current));
  box.scrollLeft = i0 * box.clientWidth;
  mark(current);
  let last = current, timer = 0;
  box.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => { const k = keyAt(); if (k !== last) { last = k; mark(k); onChange(k); } }, 90);
  }, { passive: true });
  seg.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-page]');
    if (!b) return;
    const i = pages.findIndex(p => p.dataset.key === b.dataset.page);
    box.scrollTo({ left: i * box.clientWidth, behavior: 'smooth' });
  });
}

/** スライドして決めるボタン。data-* はそのまま決めたときの処理に渡る */
export function slideHTML(label: string, act: string, data: Record<string, string | number>, disabled: boolean): string {
  const attrs = Object.entries(data).map(([k, v]) => `data-${k}="${v}"`).join(' ');
  return `<div class="slide${disabled ? ' off' : ''}" data-slide="${act}" ${attrs}><span class="slide-label">${label}</span><button type="button" class="knob" aria-label="${label}（Enterでも決定）" ${disabled ? 'disabled' : ''}>›</button></div>`;
}

/** 右端まで（SLIDE_DONE の割合以上）動かしたら onDone。途中で離すと戻る */
export function bindSlides(root: HTMLElement, onDone: (el: HTMLElement) => void): void {
  for (const el of root.querySelectorAll<HTMLElement>('.slide:not(.off)')) {
    const knob = el.querySelector<HTMLButtonElement>('.knob')!;
    let x0 = 0, dx = 0, max = 0, drag = false;
    const set = (v: number) => { knob.style.transform = `translateX(${v}px)`; el.style.setProperty('--fill', `${v + knob.offsetWidth}px`); };
    const back = () => { knob.style.transition = 'transform .2s'; set(0); el.style.setProperty('--fill', '0px'); setTimeout(() => { knob.style.transition = ''; }, 200); };
    knob.addEventListener('pointerdown', e => {
      drag = true; x0 = e.clientX; dx = 0; max = el.clientWidth - knob.offsetWidth - 8;
      knob.setPointerCapture(e.pointerId); knob.style.transition = '';
    });
    knob.addEventListener('pointermove', e => { if (!drag) return; dx = Math.min(max, Math.max(0, e.clientX - x0)); set(dx); });
    const end = () => {
      if (!drag) return; drag = false;
      if (dx >= max * SLIDE_DONE) { set(max); el.classList.add('done'); onDone(el); } else back();
    };
    knob.addEventListener('pointerup', end);
    knob.addEventListener('pointercancel', () => { drag = false; back(); });
    knob.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.classList.add('done'); onDone(el); } });
  }
}
