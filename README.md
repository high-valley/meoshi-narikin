# 目押し成金

ボロアパートから始まるスロッター生活シミュレーション。架空のホールで、目押し・ビタ押し・台選びの腕を磨いて、ゲーム内のお金で暮らしを良くしていく。スマホ縦画面向けの Web アプリ。仕様は [`docs/game-spec.md`](docs/game-spec.md)、仕様を決めた・変えた理由は [`docs/decisions.md`](docs/decisions.md)。

公開版：https://high-valley.github.io/meoshi-narikin/

ゲーム内のお金は現実のお金や景品には換わりません。

## 構成

- `src/data/` … 数値の設定データ（`reels.ts` リール配列・ライン・速さ・図柄の光、`machines.ts` 3機種の確率・払い出し・天井・設定の出方、`life.ts` 家・店・ごはん・家具、`dev.ts` 開発者画面のパスワードなど）。仕様書の数値は仮
- `src/game/` … ゲームエンジン（画面に依存しない関数）
  - `reels.ts` リールの停止制御（引き込み・蹴り・先読み・ライン判定）／`machines.ts` 抽選・設定・イベント日／`life.ts` 寝たときの効果
- `src/ui/app.ts` … 画面（試作品から移したもの。作り直すときに分割する）
- `src/ui/symbols.ts` … リールの図柄の画像とボーナス図柄の光（画像は `public/symbols/`、作ったときのプロンプトは `docs/art-prompts.md`）
- `src/version.ts` … 版の表示（ビルドの印）と、公開されている最新の版の確かめ方
- `public/` … 図柄の画像（`symbols/`）、アプリのアイコン（`icons/`・`apple-touch-icon.png`）、`manifest.webmanifest`
- `tests/` … Vitest の単体テスト（停止制御の約束、抽選、生活）
- `prototype/narikin.html` … 試作品の単一ファイル（参考用）

## 開発

```
npm install
npm run dev      # http://localhost:5173/meoshi-narikin/
npm test         # エンジンの単体テスト
npm run build    # 型チェック ＋ dist/ へビルド
```

## 公開（GitHub Pages）

`main` への push で `.github/workflows/deploy-pages.yml` がテスト・ビルドして Pages に公開する。PR ではテストとビルドだけ流す。Settings → Pages → Source は **GitHub Actions**。
