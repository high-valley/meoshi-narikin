// 画面の部品：下のタブバー、上のタブと横スワイプで切り替えるページ、購入の確認画面

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
  <div class="pages"><div class="track">${pages.map(p => `<section class="page" data-key="${p.key}" aria-label="${p.label}">${p.html}</section>`).join('')}</div></div>`;
}

/**
 * ページ送り。横に指を動かしたときだけページをめくり、縦の動きはふつうに画面をスクロールさせる。
 * ブラウザの横スクロールに任せると、iPhone で途中のページに止まることがあるため、自前で動かす
 */
export function bindPages(root: HTMLElement, current: string, onChange: (key: string) => void): void {
  const box = root.querySelector<HTMLElement>('.pages'), seg = root.querySelector<HTMLElement>('.seg'), track = box?.querySelector<HTMLElement>('.track');
  if (!box || !seg || !track) return;
  const pages = [...track.querySelectorAll<HTMLElement>('.page')];
  let idx = Math.max(0, pages.findIndex(p => p.dataset.key === current));
  // ページの高さを今のページに合わせる（短いページの下に大きな空きができないように）。中身が増えたら合わせ直す
  const fit = () => { box.style.height = pages[idx].offsetHeight + 'px'; };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
  const place = (dx: number, anim: boolean) => {
    track.style.transition = anim ? 'transform .26s cubic-bezier(.2,.8,.2,1)' : 'none';
    track.style.transform = `translateX(calc(${-idx * 100}% + ${dx}px))`;
  };
  const go = (i: number, anim = true) => {
    const was = idx;
    idx = Math.max(0, Math.min(pages.length - 1, i));
    place(0, anim);
    const k = pages[idx].dataset.key!;
    for (const b of seg.querySelectorAll<HTMLElement>('[data-page]')) b.setAttribute('aria-selected', String(b.dataset.page === k));
    // 上のタブを横にだけ動かして見えるようにする（画面全体は動かさない）
    const t = seg.querySelector<HTMLElement>(`[data-page="${k}"]`);
    if (t) seg.scrollTo({ left: t.offsetLeft - (seg.clientWidth - t.offsetWidth) / 2, behavior: anim ? 'smooth' : 'auto' });
    // 見えていないページはキーボードでも届かないようにする
    pages.forEach((p, n) => { p.inert = n !== idx; });
    if (ro) { ro.disconnect(); ro.observe(pages[idx]); }
    fit();
    if (idx !== was) onChange(k);
  };
  go(idx, false);
  seg.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-page]');
    if (b) go(pages.findIndex(p => p.dataset.key === b.dataset.page));
  });
  // 指の動き：はじめの 10px で横か縦かを決める
  let x0 = 0, y0 = 0, dx = 0, mode: 'none' | 'h' | 'v' = 'none', id = -1, moved = false;
  box.addEventListener('pointerdown', e => {
    if (id !== -1 || !e.isPrimary) return; // 2本目以降の指は使わない
    if (e.pointerType === 'mouse' && e.button !== 0) { moved = false; return; }
    x0 = e.clientX; y0 = e.clientY; dx = 0; mode = 'none'; id = e.pointerId; moved = false;
  });
  box.addEventListener('pointermove', e => {
    if (e.pointerId !== id) return;
    if (e.pointerType === 'mouse' && e.buttons === 0) { id = -1; mode = 'none'; return; } // ページの外で離された
    const mx = e.clientX - x0, my = e.clientY - y0;
    if (mode === 'none') {
      if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my) * 1.2) { mode = 'h'; box.setPointerCapture(id); }
      else if (Math.abs(my) > 10) { mode = 'v'; }
    }
    if (mode !== 'h') return;
    moved = true;
    // 端のページではそれ以上めくれないので、重く動かす
    const edge = (idx === 0 && mx > 0) || (idx === pages.length - 1 && mx < 0);
    dx = edge ? mx / 3 : mx;
    place(dx, false);
  });
  const end = (e: PointerEvent, cancel: boolean) => {
    if (e.pointerId !== id) return;
    id = -1;
    if (mode !== 'h') { mode = 'none'; return; }
    mode = 'none';
    const w = box.clientWidth;
    // 割り込まれたとき（OS の操作など）は元のページに戻すだけ
    if (!cancel && dx < -w * .18) go(idx + 1); else if (!cancel && dx > w * .18) go(idx - 1); else place(0, true);
    // めくった直後の click だけを止め、あとのキーボード操作は止めない
    setTimeout(() => { moved = false; }, 350);
  };
  box.addEventListener('pointerup', e => end(e, false));
  box.addEventListener('pointercancel', e => end(e, true));
  // めくった直後の指離しでボタンが押されないようにする
  box.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
}

/**
 * 下からせり上がる確認の画面。yes を押すと onYes。背景を押すか Esc で閉じる（no と同じ）
 */
let closeSheet: (() => void) | null = null;
export function openSheet(o: { title: string; body: string; yes: string; no?: string; ok?: boolean; onYes?: () => void }): void {
  closeSheet?.();
  const back = document.createElement('div');
  back.id = 'sheet';
  back.className = 'sheet-back';
  back.innerHTML = `<div class="sheet${o.ok ? ' ok' : ''}" role="dialog" aria-modal="true" aria-labelledby="sheetT">
    ${o.ok ? '<div class="sheet-check" aria-hidden="true">✓</div>' : ''}<h2 id="sheetT">${o.title}</h2><div class="sheet-body">${o.body}</div>
    <div class="sheet-btns">${o.no ? `<button type="button" class="btn alt" data-s="no">${o.no}</button>` : ''}<button type="button" class="btn" data-s="yes">${o.yes}</button></div></div>`;
  const prev = document.activeElement as HTMLElement | null;
  // 開いている間は後ろの画面とタブに触れない（キーボードでも届かない）
  const behind = [document.getElementById('app'), document.getElementById('tabbar')].filter((x): x is HTMLElement => !!x);
  for (const el of behind) el.inert = true;
  const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  const close = () => {
    back.remove(); document.removeEventListener('keydown', key);
    for (const el of behind) el.inert = false;
    closeSheet = null;
    if (prev && document.contains(prev)) prev.focus();
  };
  closeSheet = close;
  back.addEventListener('click', e => {
    const s = (e.target as HTMLElement).closest<HTMLElement>('[data-s]')?.dataset.s;
    if (e.target === back || s === 'no') close();
    else if (s === 'yes') { close(); o.onYes?.(); }
  });
  // 押し続けた Enter で確認を飛ばさないよう、最初は「やめる」にフォーカス（完了の画面は OK）
  back.addEventListener('keydown', e => { if (e.repeat && (e.key === 'Enter' || e.key === ' ')) e.preventDefault(); });
  document.addEventListener('keydown', key);
  document.body.append(back);
  back.querySelector<HTMLElement>(o.no ? '[data-s="no"]' : '[data-s="yes"]')?.focus();
}
