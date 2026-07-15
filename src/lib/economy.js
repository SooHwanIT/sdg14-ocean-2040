// 게임 경제 · 데이터 모델 · 순수 함수. React/엔진 어디서도 import 가능.
import { rnd, pick, chance } from './rng.js'

export const CLEAN_RATE = 0.001 // 0.1% — 이 게임의 수사(修辭)적 장치

// 낚싯대 → 그물망 → 저인망. mult=수익, speed=입질 속도, pollute=1회 오염 증가폭.
export const GEAR = [
  { id: 0, name: '낡은 대나무 낚싯대', emoji: '🎋', price: 0,     mult: 1.0, speed: 1.0, pollute: 0.22, desc: '2020년대 유물. 그래도 물고기는 잡힌다.' },
  { id: 1, name: '탄소 낚싯대',       emoji: '🎣', price: 1200,  mult: 1.6, speed: 1.2, pollute: 0.30, desc: '가볍고 튼튼하다. 잡히는 물고기가 커진다.' },
  { id: 2, name: '전동 릴 낚싯대',     emoji: '⚙️', price: 4500,  mult: 2.4, speed: 1.5, pollute: 0.42, desc: '모터가 대신 감아준다. 손목이 편하다.' },
  { id: 3, name: '소나 탐지 낚싯대',   emoji: '📡', price: 12000, mult: 3.5, speed: 1.9, pollute: 0.60, desc: '어군을 탐지한다. 빈 낚시가 거의 없다.' },
  { id: 4, name: '소형 그물망',       emoji: '🕸️', price: 30000, mult: 5.5, speed: 2.4, pollute: 0.85, desc: '한 번에 여러 마리. 바다가 조금 더 빨리 비어간다.' },
  { id: 5, name: '대형 저인망',       emoji: '🚢', price: 80000, mult: 9.0, speed: 3.0, pollute: 1.25, desc: '해저를 통째로 긁는다. 가장 효율적이고, 가장 파괴적이다.' },
]

export const POLLUTED = [
  { n: '기름 범벅 고등어',    e: '🐟', base: 40,  tag: '유막 오염' },
  { n: '미세플라스틱 갈치',   e: '🐠', base: 55,  tag: '미세플라스틱' },
  { n: '중금속 광어',        e: '🐡', base: 80,  tag: '수은 축적' },
  { n: '변형된 오징어',      e: '🦑', base: 65,  tag: '기형' },
  { n: '폐그물 걸린 게',     e: '🦀', base: 45,  tag: '유령어업' },
  { n: '표백된 산호 조각',   e: '🪸', base: 30,  tag: '백화 현상' },
  { n: '비닐봉지 (물고기 아님)', e: '🛍️', base: 5, tag: '해양 쓰레기' },
  { n: '폐타이어',           e: '🛞', base: 8,   tag: '해양 쓰레기' },
  { n: '방사능 참치',        e: '🐋', base: 150, tag: '방사성 오염' },
  { n: '기형 복어',          e: '🐟', base: 70,  tag: '내분비 교란' },
]

export const CLEAN = { n: '깨끗한 물고기', e: '✨🐟', tag: '오염 없음' }

// 챔질 품질 → 가격 배율
export const QUALITY = {
  perfect: { mult: 1.6, label: '완벽한 챔질!', tone: 'perfect' },
  good:    { mult: 1.0, label: '챔질 성공',   tone: 'good' },
}

// 성공 시 잡힌 물고기 데이터 산출 (순수)
export function resolveCatch(gearTier, quality) {
  const g = GEAR[gearTier]
  const f = pick(POLLUTED)
  const q = QUALITY[quality] || QUALITY.good
  const price = Math.max(1, Math.round(f.base * g.mult * q.mult * rnd(0.85, 1.3)))
  return { ...f, price, quality }
}

// 깨끗한 물고기를 낚았는가 (성공한 챔질에서만 굴림)
export const rollClean = () => chance(CLEAN_RATE)

// 1회 낚시 후 오염도 증가
export const pollutionGain = (gearTier) => GEAR[gearTier].pollute

export const ENDING = `당신은 방금, 이 바다에서 마지막으로 남아 있던 깨끗한 물고기를 낚았습니다.

지느러미에 비닐이 걸려 있지 않고,
몸속에 미세플라스틱이 없고,
살에서 수은이 검출되지 않는 물고기.

2040년 바다에서 이런 물고기가 잡힐 확률은 0.1%입니다.
당신이 지금까지 낚아 올린 나머지 99.9%는 전부 오염된 것이었고,
당신은 그것들을 팔아 더 큰 그물을 샀습니다.

돈은 늘었습니다.
바다는 줄었습니다.

이 게임의 확률은 경고입니다.
지금 이 속도라면, 2040년의 바다는 정말로 이렇게 됩니다.

— 게임 종료 —`
