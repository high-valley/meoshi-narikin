// リールの図柄の画像。読み込みが済むまでは呼び出し側の手描きの図柄を使う
import { SYMBOL_FILES, SYMBOL_GLOW, SYMBOL_SCALE, type Sym } from '../data/reels';

const imgs = new Map<Sym, HTMLImageElement>();
// 拡大・縮小と光の処理を毎フレームしないよう、表示する大きさごとに描いておく
const cache = new Map<string, HTMLCanvasElement>();

/** 全部そろってから画像に切り替える（画像と手描きが混ざらないように）。1枚でも失敗したら手描きのまま */
export function loadSymbols(onReady: () => void): void {
  const list = Object.entries(SYMBOL_FILES) as [Sym, string][], got = new Map<Sym, HTMLImageElement>();
  let left = list.length, failed = false;
  const done = () => {
    if (--left > 0) return;
    if (failed) { console.warn('図柄の画像を読み込めなかったので、手描きの図柄を使います'); return; }
    for (const [k, im] of got) imgs.set(k, im);
    onReady();
  };
  for (const [k, file] of list) {
    const im = new Image();
    im.onload = () => { got.set(k, im); done(); };
    im.onerror = () => { failed = true; done(); };
    im.src = import.meta.env.BASE_URL + 'symbols/' + file;
  }
}

function render(im: HTMLImageElement, k: Sym, pw: number, ph: number, glow: boolean): HTMLCanvasElement {
  const g = glow ? SYMBOL_GLOW[k] : undefined, m = g ? Math.ceil(1.5 * g.blur * ph) : 0; // 影のぼかしは指定値の約1.5倍まで広がる
  const cv = document.createElement('canvas');
  cv.width = pw + 2 * m; cv.height = ph + 2 * m;
  const c = cv.getContext('2d')!;
  c.imageSmoothingQuality = 'high';
  const r = Math.min(pw / im.naturalWidth, ph / im.naturalHeight), dw = im.naturalWidth * r, dh = im.naturalHeight * r;
  const dx = m + (pw - dw) / 2, dy = m + (ph - dh) / 2;
  if (g) {
    // 枠全体を裏から照らす（真ん中が明るく、縁が金色）
    const bg = c.createRadialGradient(m + pw / 2, m + ph / 2, ph * .15, m + pw / 2, m + ph / 2, pw * .62);
    bg.addColorStop(0, g.panel); bg.addColorStop(1, g.edge);
    c.save(); c.shadowColor = g.edge; c.shadowBlur = g.blur * ph;
    c.beginPath();
    if (c.roundRect) c.roundRect(m + pw * .02, m + ph * .04, pw * .96, ph * .92, ph * .12); else c.rect(m + pw * .02, m + ph * .04, pw * .96, ph * .92);
    c.fillStyle = bg; c.fill(); c.restore();
    c.shadowColor = g.halo; c.shadowBlur = g.blur * ph;
    c.drawImage(im, dx, dy, dw, dh);
    c.shadowBlur = 0; c.shadowColor = 'transparent';
  }
  c.drawImage(im, dx, dy, dw, dh);
  return cv;
}

/**
 * 図柄 k を (x, y, w, h) の枠に描く。glow ならボーナス図柄を光らせる。
 * 画像がまだなければ何もせず false を返す
 */
export function drawSymImage(c: CanvasRenderingContext2D, k: Sym, x: number, y: number, w: number, h: number, glow = false): boolean {
  const im = imgs.get(k);
  if (!im) return false;
  const sc = SYMBOL_SCALE[k] ?? 1;
  if (sc !== 1) { x += w * (1 - sc) / 2; y += h * (1 - sc) / 2; w *= sc; h *= sc; }
  const t = c.getTransform(), s = Math.hypot(t.a, t.b) || 1;
  const pw = Math.max(1, Math.round(w * s)), ph = Math.max(1, Math.round(h * s)), lit = glow && !!SYMBOL_GLOW[k];
  const key = `${k}:${pw}:${ph}:${lit ? 1 : 0}`;
  let cv = cache.get(key);
  if (!cv) {
    if (cache.size > 60) cache.clear();
    cv = render(im, k, pw, ph, lit);
    cache.set(key, cv);
  }
  const m = (cv.width - pw) / 2 / s;
  c.drawImage(cv, x - m, y - m, w + 2 * m, h + 2 * m);
  return true;
}
