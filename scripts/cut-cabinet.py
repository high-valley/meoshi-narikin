"""台全体の絵の緑の窓（#00FF00）を透明に切り抜き、窓の位置を src/data/cabinet.ts 用に出す。

使い方: python3 scripts/cut-cabinet.py 元の絵.png public/cabinet/cabinet.webp
出力された位置（台に対する %）を src/data/cabinet.ts の CAB_BOXES・CAB_STOPS に写す。
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA')
a = np.array(im).astype(int)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
# 緑らしさ（g が r・b より十分に大きい）。縁のにじみも拾うよう少し広げる
green = (g > 150) & (g - np.maximum(r, b) > 90)
green = nd.binary_closing(green, iterations=2)
lab, n = nd.label(green)
H, W = green.shape
boxes = []
for i in range(1, n + 1):
    ys, xs = np.where(lab == i)
    if len(xs) < W * H * 0.0008:
        continue
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    fill = len(xs) / ((x1 - x0 + 1) * (y1 - y0 + 1))
    boxes.append(dict(x=x0 / W * 100, y=y0 / H * 100, w=(x1 - x0 + 1) / W * 100, h=(y1 - y0 + 1) / H * 100, fill=fill,
                      cx=(x0 + x1) / 2 / W * 100, cy=(y0 + y1) / 2 / H * 100, area=len(xs)))
# 窓を透明に（縁を1px 広げてにじみを消す）
mask = nd.binary_dilation(green, iterations=2)
alpha = np.where(mask, 0, 255).astype(np.uint8)
im.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(.6)))
out = im.copy()
out.thumbnail((1080, 1920), Image.LANCZOS)
out.save(dst, 'WEBP', quality=82, method=6)
print('size', W, H, 'aspect', round(W / H, 4))
for bx in sorted(boxes, key=lambda b: (round(b['cy']), b['cx'])):
    kind = 'circle' if 0.7 < bx['fill'] < 0.85 and abs(bx['w'] * W - bx['h'] * H) < 0.15 * bx['w'] * W else 'rect'
    print(kind, {k: round(v, 1) for k, v in bx.items() if k != 'area'})
