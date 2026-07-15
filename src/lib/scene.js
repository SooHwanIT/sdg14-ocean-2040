// 절차적 바다 렌더 — 이미지 파일 0개. 오염도에 따라 물빛/시야가 실시간으로 변한다.
import { clamp, lerp } from './rng.js'

export const SURFACE = 0.11 // 수면 높이 비율

// 오염도(0~100) → 물빛. 맑은 청록에서 탁한 회녹색으로.
export function waterColors(pollution) {
  const p = clamp(pollution, 0, 100) / 100
  const topH = lerp(196, 150, p), botH = lerp(205, 120, p)
  const topS = lerp(70, 22, p), botS = lerp(72, 16, p)
  const topL = lerp(46, 20, p), botL = lerp(20, 7, p)
  return {
    top: `hsl(${topH} ${topS}% ${topL}%)`,
    mid: `hsl(${lerp(200, 135, p)} ${lerp(65, 18, p)}% ${lerp(30, 12, p)}%)`,
    bottom: `hsl(${botH} ${botS}% ${botL}%)`,
    murk: clamp(p, 0, 1),
  }
}

// 파도치는 수면 + 물기둥 그라디언트(원경/근경 시차) + 신광(God ray)
export function drawWater(ctx, w, h, t, pollution, reduceMotion) {
  const c = waterColors(pollution)
  const surfaceY = h * SURFACE

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, c.top)
  grad.addColorStop(0.45, c.mid)
  grad.addColorStop(1, c.bottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // 하늘빛 얇은 띠(수면 위)
  const sky = ctx.createLinearGradient(0, 0, 0, surfaceY)
  sky.addColorStop(0, `hsl(${lerp(30, 24, c.murk)} ${lerp(60, 20, c.murk)}% ${lerp(70, 30, c.murk)}%)`)
  sky.addColorStop(1, c.top)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, surfaceY)

  // 신광 — 오염될수록 흐려짐
  const rays = 4
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < rays; i++) {
    const drift = reduceMotion ? 0 : Math.sin(t * 0.0003 + i) * 30
    const x = (w / (rays + 1)) * (i + 1) + drift
    const g = ctx.createLinearGradient(x, surfaceY, x - 40, h * 0.85)
    const a = lerp(0.10, 0.015, c.murk)
    g.addColorStop(0, `rgba(180,230,255,${a})`)
    g.addColorStop(1, 'rgba(180,230,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(x - 26, surfaceY)
    ctx.lineTo(x + 26, surfaceY)
    ctx.lineTo(x + 70, h * 0.9)
    ctx.lineTo(x - 110, h * 0.9)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()

  // 파도 수면선
  ctx.beginPath()
  ctx.moveTo(0, surfaceY)
  for (let x = 0; x <= w; x += 12) {
    const wave = reduceMotion ? 0 : Math.sin(x * 0.03 + t * 0.002) * 3
    ctx.lineTo(x, surfaceY + wave)
  }
  ctx.lineTo(w, 0); ctx.lineTo(0, 0); ctx.closePath()
  ctx.fillStyle = `rgba(255,255,255,${lerp(0.10, 0.03, c.murk)})`
  ctx.fill()

  // 탁도 오버레이 — 오염 심할수록 시야가 뿌옇게
  if (c.murk > 0.02) {
    ctx.fillStyle = `rgba(60,74,60,${c.murk * 0.28})`
    ctx.fillRect(0, surfaceY, w, h - surfaceY)
  }
  return surfaceY
}

// 바닥 실루엣(해저) — 오염되면 쓰레기 더미 융기
export function drawSeabed(ctx, w, h, pollution) {
  const c = waterColors(pollution)
  const baseY = h * 0.9
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(0, baseY)
  const lumps = 6
  for (let i = 0; i <= lumps; i++) {
    const x = (w / lumps) * i
    const lump = Math.sin(i * 1.7) * 10 + (c.murk * Math.sin(i * 3.1) * 14)
    ctx.lineTo(x, baseY - lump)
  }
  ctx.lineTo(w, h); ctx.closePath()
  ctx.fillStyle = `hsl(${lerp(190, 90, c.murk)} ${lerp(30, 14, c.murk)}% ${lerp(10, 6, c.murk)}%)`
  ctx.fill()
}
