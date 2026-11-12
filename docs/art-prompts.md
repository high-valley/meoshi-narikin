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
