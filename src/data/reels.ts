// リールの数値（仕様書 4章）。実機と同じ 21コマ・1周0.75秒・最大4コマ滑り
export type Sym = 'R7' | 'B7' | 'BAR' | 'BL' | 'RP' | 'WM' | 'CH';

export const N = 21;
export const ROT_MS = 750;
export const FRAME_MS = ROT_MS / N;
export const MAX_SLIP = 4;

// 番号が大きいほど上（上から下へ流れる）。
// ベルとリプレイは最大5コマ間隔で、順押しなら必ずそろう。左のチェリーはBARの真下、
// スイカは左でBARの3コマ上・中右でBARの2コマ上。右は赤7の2コマ上にBAR（REGで滑ってくる）
export const STRIPS: Sym[][] = [
  ['R7','RP','R7','BL','RP','BL','CH','BAR','RP','BL','WM','RP','RP','RP','BL','CH','BAR','RP','BL','WM','BL'],
  ['R7','BL','RP','RP','BL','BAR','RP','WM','RP','BL','R7','RP','RP','RP','BL','BAR','RP','WM','BL','BL','RP'],
  ['R7','RP','BAR','BL','WM','RP','BL','BL','BL','RP','BL','R7','RP','BAR','BL','WM','RP','RP','RP','BL','BL'],
];

/** 左リールの「赤7・リプレイ・赤7」の真ん中のリプレイ（福招きBIG中のビタ押しポイント） */
export const BITA_IDX = 1;

/** 有効ライン（段：0上段・1中段・2下段）。上段・中段・下段・右下がり・右上がり */
export const LINES: readonly (readonly [number, number, number])[] = [[0,0,0],[1,1,1],[2,2,2],[0,1,2],[2,1,0]];
export const LINE_NAMES = ['上段','中段','下段','右下がり','右上がり'];
