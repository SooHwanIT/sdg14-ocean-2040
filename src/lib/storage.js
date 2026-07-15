// 버전 관리 localStorage — 안전한 하이드레이션(스키마 불일치/파손/차단 시 기본값).
const KEY = 'ocean2040'
const VERSION = 2

const DEFAULT = {
  version: VERSION,
  best: { money: 0, caught: 0, minPollution: 100 }, // 명예의 기록
  totalRuns: 0,
  everFoundClean: false,
  muted: false,
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    const data = JSON.parse(raw)
    if (!data || data.version !== VERSION) return { ...DEFAULT } // 마이그레이션 대신 초기화
    return {
      ...DEFAULT,
      ...data,
      best: { ...DEFAULT.best, ...(data.best || {}) },
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...stats, version: VERSION }))
  } catch {
    /* 사파리 프라이빗 모드 등 — 조용히 무시 */
  }
}

// 한 판 종료 시 최고 기록 갱신
export function mergeRun(stats, run) {
  const best = {
    money: Math.max(stats.best.money, run.money),
    caught: Math.max(stats.best.caught, run.caught),
    minPollution: Math.min(stats.best.minPollution, run.pollution),
  }
  return {
    ...stats,
    best,
    totalRuns: stats.totalRuns + 1,
    everFoundClean: stats.everFoundClean || !!run.foundClean,
  }
}
