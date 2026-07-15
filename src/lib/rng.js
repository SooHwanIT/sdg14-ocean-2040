// 순수 유틸 + 결정적 난수 (mulberry32). 게임 로직/렌더에서 공용 사용.

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const rnd = (a = 0, b = 1) => a + Math.random() * (b - a)
export const rint = (a, b) => Math.floor(rnd(a, b + 1))
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
export const chance = (p) => Math.random() < p

// 시드 기반 PRNG — 파티클/물고기 배치를 프레임마다 흔들리지 않게 고정.
export function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// HSL 문자열 헬퍼
export const hsl = (h, s, l, a = 1) =>
  a === 1 ? `hsl(${h} ${s}% ${l}%)` : `hsl(${h} ${s}% ${l}% / ${a})`
