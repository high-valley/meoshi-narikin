// リールの図柄の画像。読み込みが済むまでは呼び出し側の手描きの図柄を使う
import { SYMBOL_FILES, SYMBOL_GLOW, type Sym } from '../data/reels';

const imgs = new Map<Sym, HTMLImageElement>();
// 拡大・縮小と光の処理を毎フレームしないよう、表示する大きさごとに描いておく
const cache = new Map<string, HTMLCanvasElement>();

export function loadSymbols(onReady: () => void): void {
  let left = 0;
  for (const [k, file] of Object.entries(SYMBOL_FILES) as [Sym, string][]) {
    const im = new Image();
    left++;
    const done = () => { if (--left === 0) onReady(); };
    im.onload = () => { imgs.set(k, im); done(); };
    im.onerror = done;
    im.src = import.meta.env.BASE_URL + 'symbols/' + file;
  }
}

function render(im: HTMLImageElement, k: Sym, pw: number, ph: number, glow: boolean): HTMLCanvasElement {
  const g = glow ? SYMBOL_GLOW[k] : undefined, m = g ? Math.ceil(g.blur * ph) : 0;
  const cv = document.createElement('canvas');
  cv.width = pw + 2 * m; cv.height = ph + 2 * m;
  const c = cv.getContext('2d')!;
  c.imageSmoothingQuality = 'high';
  const r = Math.min(pw / im.naturalWidth, ph / im.naturalHeight), dw = im.naturalWidth * r, dh = im.naturalHeight * r;
  const dx = m + (pw - dw) / 2, dy = m + (ph - dh) / 2;
  if (g) {
    const cx = m + pw / 2, cy = m + ph / 2, bg = c.createRadialGradient(cx, cy, 0, cx, cy, pw * .55);
    bg.addColorStop(0, g.back); bg.addColorStop(1, 'rgba(255,255,255,0)');
    c.save(); c.translate(cx, cy); c.scale(1, ph / pw); c.translate(-cx, -cy);
    c.fillStyle = bg; c.fillRect(-1e4, -1e4, 2e4, 2e4); c.restore();
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
