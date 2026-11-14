// 画面の操作に関わる数値（仕様書 9.4）
/** オートで回せるゲーム数（打つ画面のボタン） */
export const AUTO_GAMES = [10, 100];
/** 「自分」→「収支」に残す回数 */
export const HIST_MAX = 60;
/** 液晶に知らせを出しておく時間（ミリ秒） */
export const LCD_MS = 1800;
/** 次の知らせが待っているときの表示時間（ミリ秒） */
export const LCD_BUSY_MS = 1100;
/** ふつうの払い出し（ベル・リプレイなど）の表示時間（ミリ秒） */
export const LCD_SMALL_MS = 700;
/** この枚数以上の払い出しは金色の文字で出す */
export const LCD_GOLD = 30;
