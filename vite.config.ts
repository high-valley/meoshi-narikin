import { defineConfig } from 'vitest/config';

// Node の型定義を入れていないので、使う分だけ宣言する（ビルドは Node で動く）
declare const process: { env: Record<string, string | undefined> };

// ビルドの印（版の表示用）。GitHub Actions では GITHUB_SHA が入る
const BUILD_ID = (process.env.GITHUB_SHA ?? 'local').slice(0, 7);
const BUILD_TIME = new Date().toISOString();

// GitHub Pages のプロジェクトページ（https://high-valley.github.io/meoshi-narikin/）に合わせる
export default defineConfig(({ command }) => ({
  base: '/meoshi-narikin/',
  define:
    command === 'build'
      ? {
          __BUILD_ID__: JSON.stringify(BUILD_ID),
          __BUILD_TIME__: JSON.stringify(BUILD_TIME),
        }
      : {},
  plugins: [
    {
      // 公開している版を確かめられるようにする
      name: 'version-json',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: BUILD_ID, time: BUILD_TIME }) });
      },
    },
  ],
  test: {
    include: ['tests/**/*.test.ts'],
  },
}));
