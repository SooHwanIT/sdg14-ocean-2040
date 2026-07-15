// WebAudio 기반 초경량 효과음. 에셋/키 없음. 음소거 가능, 실패해도 게임에 영향 없음.
let ctx = null
let muted = false

function ac() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) ctx = new AC()
    } catch {
      ctx = null
    }
  }
  // 브라우저 자동재생 정책: 사용자 제스처 후 resume
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function blip(freq, dur = 0.12, type = 'sine', gain = 0.06, slideTo = null) {
  if (muted) return
  const c = ac()
  if (!c) return
  try {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, c.currentTime)
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur)
    g.gain.setValueAtTime(gain, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
    osc.connect(g).connect(c.destination)
    osc.start()
    osc.stop(c.currentTime + dur + 0.02)
  } catch {
    /* 무시 */
  }
}

export const sfx = {
  cast:   () => blip(220, 0.18, 'sine', 0.05, 90),
  bite:   () => { blip(880, 0.08, 'square', 0.05); setTimeout(() => blip(1100, 0.08, 'square', 0.05), 90) },
  perfect:() => { blip(660, 0.09, 'triangle', 0.06); setTimeout(() => blip(990, 0.14, 'triangle', 0.06), 90) },
  good:   () => blip(520, 0.12, 'triangle', 0.05),
  miss:   () => blip(160, 0.22, 'sawtooth', 0.05, 70),
  buy:    () => { blip(700, 0.07, 'sine', 0.05); setTimeout(() => blip(1050, 0.1, 'sine', 0.05), 70) },
  clean:  () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.5, 'sine', 0.07), i * 160)) },
}

export function setMuted(m) { muted = !!m }
export function isMuted() { return muted }
export function primeAudio() { ac() } // 첫 제스처에서 오디오 컨텍스트 깨우기
