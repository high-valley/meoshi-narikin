// リールの数値（仕様書 4章）。実機と同じ 21コマ・1周0.75秒・最大4コマ滑り
export type Sym = 'R7' | 'B7' | 'BAR' | 'BL' | 'RP' | 'WM' | 'CH';

export const N = 21;
export const ROT_MS = 750;
export const FRAME_MS = ROT_MS / N;
export const MAX_SLIP = 4;

// 番号が大きいほど上（上から下へ流れる）。
// ベルとリプレイは最大5コマ間隔で、順押しなら必ずそろう。左のチェリーはBARの真下、
// スイカは左でBARの3コマ上・中右でBARの2コマ上。中の赤7は1つ。右は赤7とBARが1つずつで、赤7の2コマ上にBAR（1周に1か所だけの目印。REGで滑ってくる）
export const STRIPS: Sym[][] = [
  ['R7','RP','R7','BL','RP','BL','CH','BAR','RP','BL','WM','RP','RP','RP','BL','CH','BAR','RP','BL','WM','BL'],
  ['R7','BL','RP','RP','BL','BAR','RP','WM','RP','BL','BL','RP','RP','RP','BL','BAR','RP','WM','BL','BL','RP'],
  ['R7','RP','BAR','BL','WM','RP','BL','BL','BL','RP','BL','RP','RP','BL','BL','WM','RP','RP','RP','BL','BL'],
];

/** 左リールの「赤7・リプレイ・赤7」の真ん中のリプレイ（福招きBIG中のビタ押しポイント） */
export const BITA_IDX = 1;

/** 有効ライン（段：0上段・1中段・2下段）。上段・中段・下段・右下がり・右上がり */
export const LINES: readonly (readonly [number, number, number])[] = [[0,0,0],[1,1,1],[2,2,2],[0,1,2],[2,1,0]];
export const LINE_NAMES = ['上段','中段','下段','右下がり','右上がり'];

/** 図柄の画像（public/symbols/ のファイル名） */
export const SYMBOL_FILES: Record<Sym, string> = {
  R7: 'r7.webp', B7: 'b7.webp', BAR: 'bar.webp', BL: 'bell.webp', RP: 'replay.webp', WM: 'watermelon.webp', CH: 'cherry.webp',
};

/** 図柄を描く大きさ（枠に対する割合）。ボーナス図柄を目立たせるため、ほかの図柄は小さめに描く */
export const SYMBOL_SCALE: Partial<Record<Sym, number>> = { BL: .72, RP: .72, WM: .72, CH: .72 };

/**
 * ボーナス図柄の光（実機のリールで、ボーナス図柄だけ明るく見えて狙いやすいのに合わせる）。
 * panel は図柄の枠全体を照らす明かり、halo は図柄の縁の光（blur は図柄の高さに対する割合）
 */
export const SYMBOL_GLOW: Partial<Record<Sym, { panel: string; edge: string; halo: string; blur: number }>> = {
  R7: { panel: 'rgba(255,238,150,1)', edge: 'rgba(255,165,25,.95)', halo: 'rgba(255,170,20,1)', blur: .2 },
  BAR: { panel: 'rgba(255,238,150,1)', edge: 'rgba(255,165,25,.95)', halo: 'rgba(255,190,30,1)', blur: .2 },
  B7: { panel: 'rgba(210,240,255,1)', edge: 'rgba(80,180,255,.85)', halo: 'rgba(40,150,255,1)', blur: .2 },
};
