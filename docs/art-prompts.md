# 画像生成のプロンプト

画像生成AIは英語の方が安定するので、プロンプトは英語。各図柄のプロンプトの後ろに共通スタイルを付けて使う。

- 横5:3、透過背景で作る。透過にできないツールなら白背景で作り、白を抜く
- 7とBARは枠の横幅いっぱい、ほかは6割くらい（リール上で7とBARを目立たせる）
- 実在の台に似せない。仕上がりが有名機種の図柄に似ていたら使わない
- 最初に作った赤7を参考画像にすると、線の太さや光沢がそろう。ばらつくときは共通スタイルの先頭に `consistent icon set,` を足す
- 光（ボーナス図柄の明るさ）は画像に描かず、画面側で付ける

## 共通スタイル（透過）

```
Japanese pachislot reel symbol, isolated game icon, transparent background, PNG with alpha channel, no background color, bold thick black outline, glossy enamel-like color with a soft top highlight and subtle bevel, flat front view, centered, clean vector-like illustration, crisp clean edges with no white halo, high contrast, readable at small size, no text, no frame, no drop shadow, original design not resembling any existing slot machine, aspect ratio 5:3
```

## 赤7（r7）

```
A big bold number "7" symbol, wide and heavy, slightly italic forward lean, deep crimson red with a bright scarlet gradient, thick opaque white inner outline then a black outer outline, a sharp glossy highlight streak on the upper part, fills the full width of the frame, powerful and celebratory feeling
```

## BAR（bar）

7と見分けられるよう、傾けない・赤を使わない。

```
A BAR symbol: a perfectly horizontal, upright rounded-rectangle plate with no slant, wide and short, glossy jet-black lacquer face, thick polished gold frame around the edge, a thin gold horizontal stripe running just inside the top edge and another just inside the bottom edge, the bold capital letters "BAR" centered in shiny gold with a dark outline, strong and solid feeling, fills the full width of the frame, clearly different in shape and color from a red number seven
```

## ベル（bell）

```
A golden bell symbol, classic church-bell silhouette with a flared bottom rim and a small round clapper, warm yellow gold with orange shading, a vertical white highlight on the left side, small and centered, occupying about 60 percent of the frame width
```

## リプレイ（replay）

```
A replay symbol shaped like a rounded blue ribbon badge, two curved arrows forming a circle around an empty center, cobalt blue with a light sky-blue highlight, opaque white inner outline, small and centered, occupying about 60 percent of the frame width, leave space in the center for lettering added later
```

## スイカ（watermelon）

```
A half-moon slice of watermelon symbol, curved side down, bright red flesh with five small black teardrop seeds, thin opaque white rind line, thick dark green striped skin along the bottom curve, juicy glossy highlight, small and centered, occupying about 60 percent of the frame width
```

## チェリー（cherry）

```
A pair of two round red cherries symbol, joined by two green stems meeting at the top with one small leaf, glossy crimson fruit with a white circular highlight on each cherry, one cherry slightly lower than the other, small and centered, occupying about 60 percent of the frame width
```

## 青7（b7・今は配列に入っていない予備）

```
A big bold number "7" symbol, same shape as a red seven but in deep royal blue with a bright azure gradient, thick opaque white inner outline then a black outer outline, glossy highlight streak on the upper part, fills the full width of the frame, cool and mysterious feeling
```

## アプリのアイコン（app-icon）

正方形・背景あり（iPhone のホーム画面のアイコンは透過にできない）、文字なし、角は四角のまま（丸みは端末が付ける）。使ったのは案B。

```
mobile game app icon, square 1:1, 1024x1024, full-bleed background with no transparency, no rounded corners, bold simple composition readable at very small size, single clear focal point, glossy enamel-like rendering with bold thick black outlines matching a Japanese pachislot reel symbol style, rich saturated colors, no text, no letters, no logo, no border frame, original design not resembling any existing slot machine or game
```

```
A big bold number "7" made of shiny solid gold with a red enamel inner stripe, standing on a small pile of gold coins, sparkles and a soft golden aura, a tiny glimpse of a city skyline with a tall tower apartment silhouette in the background at night, deep navy-purple background
```

## 部屋（アニメ調）

家ごとの部屋の背景（家具なし）と、家具ごとの絵を別々に作り、家具は種類ごとに決まった場所に重ねる（仕様書 9.4）。
背景はどれも同じカメラ位置（正面の壁と床が見える、立った目線から少し見下ろす）にそろえる。家具は透過背景で、同じ向き・同じ光の当たり方にそろえる。

### 部屋の背景の共通スタイル

```
Japanese anime background art, slice-of-life game style, clean line art with soft cel shading, warm cozy lighting, front-facing view of an empty room interior showing the back wall and the floor, camera at standing eye level looking slightly down, symmetrical composition, the room is completely empty with no furniture, no people, no text, no logos, aspect ratio 4:3, original illustration
```

| 家 | ファイル名 | 部屋ごとの部分 |
|---|---|---|
| ボロアパート | room0 | `a shabby old six-tatami Japanese apartment room, worn tatami mats, stained beige walls, an old sliding glass window with a slightly torn curtain, a bare light bulb hanging from the ceiling, faded afternoon light` |
| 1Kアパート | room1 | `a small clean one-room studio apartment, light wood flooring, white walls, a single window with simple curtains, modest and tidy` |
| 分譲マンション | room2 | `a spacious modern condominium living room, warm wooden floor, large window with city view in daylight, soft indirect ceiling lights` |
| 一戸建て | room3 | `a large bright living room of a detached house, high ceiling, big glass doors opening to a green garden, natural wood floor, sunlight` |
| タワマン最上階 | room4 | `a luxurious penthouse living room on the top floor of a tower, polished marble floor, floor-to-ceiling windows with a sparkling night city skyline, elegant gold accent lights` |

### 家具の共通スタイル

```
Japanese anime style game item, single isolated piece of furniture, clean line art with soft cel shading, warm cozy lighting from the upper left, three-quarter front view facing the camera, seen slightly from above, transparent background, no shadow on the background, no people, no text, original design
```

| 家具 | ファイル名 | 家具ごとの部分 |
|---|---|---|
| せんべい布団 | futon | `a thin worn-out Japanese futon mattress laid flat on the floor with a flat pillow and a thin blanket` |
| ベッド | bed | `a simple single bed with a wooden frame, white sheets and a blue blanket` |
| 高級ベッド | lbed | `a luxurious king-size bed with a tufted headboard, silky golden-beige bedding and many pillows` |
| 小型テレビ | tv | `a small old flat-screen TV on a low wooden stand` |
| ゲーム機 | game | `a home video game console with two controllers on a small low table, generic design not resembling any real console` |
| 本棚 | shelf | `a wooden bookshelf filled with colorful manga and books` |
| 観葉植物 | plant | `a potted leafy green houseplant in a ceramic pot` |
| 冷蔵庫 | fridge | `a compact two-door kitchen refrigerator, white` |
| ソファ | sofa | `a comfortable three-seat fabric sofa in navy blue with cushions` |
| 大型テレビ | bigtv | `a very large thin flat-screen TV on a modern low TV board` |
| 水槽 | tank | `a glowing aquarium fish tank with tropical fish and water plants on a black stand` |
| マッサージチェア | mchair | `a premium reclining massage chair in black leather` |

### 主人公

```
Japanese anime style game character, a young man in his twenties with messy dark hair, wearing a plain gray hoodie and jeans, slightly tired but hopeful expression, standing pose, full body, front view, clean line art with soft cel shading, transparent background, no text, original character
```
