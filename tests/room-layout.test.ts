import { describe, expect, it } from 'vitest';
import {
  FURNITURE_ASPECT, FURNITURE_IMAGES, ROOM_ANCHORS, ROOM_ASPECT,
  ROOM_IMAGES, ROOM_SCALES, roomPlayerSpot, roomSlot,
} from '../src/data/room';

describe('住居ごとの家具レイアウト', () => {
  it('すべての住居にレイアウトが用意される', () => {
    expect(ROOM_ANCHORS).toHaveLength(ROOM_IMAGES.length);
    expect(ROOM_SCALES).toHaveLength(ROOM_IMAGES.length);
    for (let home = 0; home < ROOM_IMAGES.length; home++) {
      expect(roomPlayerSpot(home)).toBeDefined();
      expect(roomSlot(home, 'sofa')).not.toBeNull();
    }
  });

  it('家具が部屋の画像の範囲内に収まる', () => {
    for (let home = 0; home < ROOM_IMAGES.length; home++) {
      for (const id of FURNITURE_IMAGES) {
        const spot = roomSlot(home, id);
        expect(spot, id).not.toBeNull();
        if (!spot) continue;
        const height = spot.w * ROOM_ASPECT * FURNITURE_ASPECT[id];
        expect(spot.x - spot.w / 2, id).toBeGreaterThanOrEqual(0);
        expect(spot.x + spot.w / 2, id).toBeLessThanOrEqual(100);
        expect(spot.y - height, id).toBeGreaterThanOrEqual(0);
        expect(spot.y, id).toBeLessThanOrEqual(100);
      }
    }
  });

  it('寝具の種類を変えても同じ床の位置に置ける', () => {
    for (let home = 0; home < ROOM_IMAGES.length; home++) {
      expect(roomSlot(home, 'futon')?.x).toEqual(roomSlot(home, 'bed')?.x);
      expect(roomSlot(home, 'bed')?.y).toEqual(roomSlot(home, 'lbed')?.y);
    }
  });

  it('高級な広い家では同じ家具が相対的に小さくなる', () => {
    expect(roomSlot(4, 'sofa')!.w).toBeLessThan(roomSlot(0, 'sofa')!.w);
    expect(roomPlayerSpot(4).w).toBeLessThan(roomPlayerSpot(0).w);
  });
});
