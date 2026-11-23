import { describe, it, expect } from 'vitest';
import { upgCost, speedMul, maxSlip, kibanPrice, bustRate, kibanFine, jobPay, sleepMeters } from '../src/game/growth';
import { UPG } from '../src/data/growth';

describe('自己投資（仕様書 8.1）', () => {
  it('動体視力と体力づくりは段階の2乗で上がる', () => {
    for (let l = 0; l < UPG.eye.max; l++) expect(upgCost('eye', l)).toBe(20000 * (l + 1) ** 2);
    for (let l = 0; l < UPG.body.max; l++) expect(upgCost('body', l)).toBe(15000 * (l + 1) ** 2);
    expect([0, 1, 2].map(l => upgCost('data', l))).toEqual([30000, 120000, 400000]);
  });
  it('最大まで上げたら値段は0', () => {
    expect(upgCost('eye', 5)).toBe(0);
    expect(upgCost('data', 3)).toBe(0);
  });
});

describe('目押しへの影響（仕様書 3章）', () => {
  it('お腹25未満で12%速く、動体視力1段階で1%、目薬で3%ゆっくり', () => {
    expect(speedMul(50, 0, false)).toBe(1);
    expect(speedMul(24, 0, false)).toBeCloseTo(1.12);
    expect(speedMul(25, 0, false)).toBe(1);
    expect(speedMul(50, 5, true)).toBeCloseTo(0.95 * 0.97);
  });
  it('体調25未満は2コマまで、ほかは4コマ', () => {
    expect(maxSlip(24)).toBe(2);
    expect(maxSlip(25)).toBe(4);
  });
});

describe('裏市場（仕様書 8.2）', () => {
  it('値段は家の段階で上がる', () => {
    expect(kibanPrice(0)).toBe(50000);
    expect(kibanPrice(2)).toBe(150000);
  });
  it('見つかる確率は20%から10%ずつ、最大60%', () => {
    expect([0, 1, 4, 9].map(bustRate)).toEqual([20, 30, 60, 60]);
  });
  it('罰金は所持金の3割、最低5万円', () => {
    expect(kibanFine(0)).toBe(50000);
    expect(kibanFine(1000000)).toBe(300000);
    expect(kibanFine(-20000)).toBe(50000);
  });
});

describe('日雇いバイト（仕様書 7.4）', () => {
  it('基本給＋1箱160円−ミス200円、最低1,000円', () => {
    expect(jobPay(0, 0)).toBe(1500);
    expect(jobPay(23, 0)).toBe(1500 + 23 * 160);
    expect(jobPay(0, 10)).toBe(1000);
  });
  it('検品のプロは1割増し', () => {
    expect(jobPay(23, 0, true)).toBe(Math.round((1500 + 23 * 160) * 1.1));
  });
});

describe('寝たとき（仕様書 3章）', () => {
  const ev = { sleep: 5, fun: 0, hp: 0, keep: 0 };
  it('お腹−25、娯楽−8、体調は寝具＋家＋家具＋10', () => {
    expect(sleepMeters({ hun: 70, fun: 50, hp: 50 }, ev)).toEqual({ hun: 45, fun: 42, hp: 65 });
  });
  it('冷蔵庫でお腹の減りが少ない', () => {
    expect(sleepMeters({ hun: 70, fun: 50, hp: 50 }, { ...ev, keep: 10 }).hun).toBe(55);
  });
  it('娯楽20未満で回復は半分、お腹10未満で−10', () => {
    expect(sleepMeters({ hun: 70, fun: 20, hp: 50 }, ev).hp).toBe(58);
    expect(sleepMeters({ hun: 30, fun: 50, hp: 50 }, ev).hp).toBe(55);
  });
  it('0〜100に収まる', () => {
    const r = sleepMeters({ hun: 5, fun: 0, hp: 99 }, { sleep: 30, fun: 0, hp: 0, keep: 0 });
    expect(r.hun).toBe(0);
    expect(r.hp).toBe(100);
  });
});
