// 절차적 개체 — 물고기/쓰레기/기포/낚싯바늘. 전부 canvas path로 직접 그린다(에셋 0).
import { rnd, rint, pick, clamp, lerp } from './rng.js'

/* ─────────── 기포 ─────────── */
export class Bubble {
  constructor(w, h) { this.reset(w, h, true) }
  reset(w, h, spread = false) {
    this.x = rnd(0, w)
    this.y = spread ? rnd(h * 0.2, h) : h + 8
    this.r = rnd(1.2, 4)
    this.spd = rnd(14, 42)
    this.wob = rnd(0, Math.PI * 2)
    this.w = w; this.h = h
  }
  update(dt, w, h) {
    this.y -= this.spd * dt
    this.wob += dt * 2
    this.x += Math.sin(this.wob) * 6 * dt
    if (this.y < h * 0.09) this.reset(w, h)
  }
  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(200,235,255,0.35)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

/* ─────────── 떠다니는 쓰레기 ─────────── */
const TRASH_KINDS = ['bag', 'bottle', 'tire', 'can']
export class Trash {
  constructor(w, h) {
    this.kind = pick(TRASH_KINDS)
    this.x = rnd(0, w); this.y = rnd(h * 0.2, h * 0.85)
    this.vx = rnd(-10, 10); this.spin = rnd(-0.4, 0.4); this.rot = rnd(0, Math.PI * 2)
    this.s = rnd(0.8, 1.4)
  }
  update(dt, w, h) {
    this.x += this.vx * dt
    this.y += Math.sin(this.rot) * 4 * dt
    this.rot += this.spin * dt
    if (this.x < -30) this.x = w + 20
    if (this.x > w + 30) this.x = -20
  }
  draw(ctx) {
    ctx.save()
    ctx.translate(this.x, this.y); ctx.rotate(this.rot * 0.3); ctx.scale(this.s, this.s)
    ctx.globalAlpha = 0.5
    if (this.kind === 'bag') {
      ctx.fillStyle = 'rgba(230,240,245,0.6)'
      ctx.beginPath()
      ctx.moveTo(-8, -6); ctx.quadraticCurveTo(0, -14, 8, -6)
      ctx.quadraticCurveTo(12, 6, 0, 12); ctx.quadraticCurveTo(-12, 6, -8, -6)
      ctx.fill()
    } else if (this.kind === 'bottle') {
      ctx.fillStyle = 'rgba(120,200,180,0.6)'
      ctx.fillRect(-3, -10, 6, 18); ctx.fillRect(-1.5, -13, 3, 4)
    } else if (this.kind === 'tire') {
      ctx.strokeStyle = 'rgba(20,20,20,0.7)'; ctx.lineWidth = 4
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke()
    } else {
      ctx.fillStyle = 'rgba(180,180,190,0.6)'
      ctx.fillRect(-5, -8, 10, 16)
      ctx.fillStyle = 'rgba(120,120,130,0.6)'; ctx.fillRect(-5, -8, 10, 3)
    }
    ctx.restore()
  }
}

/* ─────────── 물고기 ─────────── */
// grotesque(0~1): 오염도에서 유도. 색이 병들고, 형태가 뒤틀리고, 비닐이 걸린다.
export class Fish {
  constructor(w, h, opts = {}) {
    this.w = w; this.h = h
    this.reset(w, h)
    this.clean = !!opts.clean
    if (opts.x != null) this.x = opts.x
    if (opts.y != null) this.y = opts.y
  }
  reset(w, h) {
    this.dir = Math.random() < 0.5 ? 1 : -1
    this.x = this.dir === 1 ? -40 : w + 40
    this.y = rnd(h * 0.2, h * 0.82)
    this.baseY = this.y
    this.len = rnd(20, 40)
    this.spd = rnd(20, 55)
    this.wob = rnd(0, Math.PI * 2)
    this.hueSeed = rnd(0, 1)
    this.tailPhase = rnd(0, Math.PI * 2)
    this.hooked = false
    this.escaping = false
  }
  // 미끼로 유영
  seekTo(tx, ty, dt) {
    const dx = tx - this.x, dy = ty - this.y
    const d = Math.hypot(dx, dy) || 1
    this.dir = dx >= 0 ? 1 : -1
    this.x += (dx / d) * this.spd * 1.6 * dt
    this.y += (dy / d) * this.spd * 1.6 * dt
    this.tailPhase += dt * 14
  }
  update(dt, w, h) {
    if (this.hooked) return
    this.x += this.spd * this.dir * dt
    this.wob += dt * 2.5
    this.y = this.baseY + Math.sin(this.wob) * 8
    this.tailPhase += dt * (6 + this.spd * 0.1)
    if (this.dir === 1 && this.x > w + 50) this.reset(w, h)
    if (this.dir === -1 && this.x < -50) this.reset(w, h)
  }
  draw(ctx, grotesque = 0) {
    const g = this.clean ? 0 : grotesque
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.dir, 1)
    const L = this.len, H = L * 0.5

    // 색: 깨끗하면 은청빛, 오염되면 병든 회녹색
    let hue, sat, lig
    if (this.clean) { hue = 195; sat = 55; lig = 72 }
    else {
      hue = lerp(lerp(30, 210, this.hueSeed), 95, g)
      sat = lerp(55, 18, g)
      lig = lerp(58, 34, g)
    }
    const body = `hsl(${hue} ${sat}% ${lig}%)`
    const belly = `hsl(${hue} ${sat}% ${lig + 14}%)`

    if (this.clean) { ctx.shadowColor = 'rgba(180,240,255,0.9)'; ctx.shadowBlur = 22 }

    // 꼬리
    const tw = Math.sin(this.tailPhase) * H * 0.35
    ctx.beginPath()
    ctx.moveTo(-L * 0.5, 0)
    ctx.lineTo(-L * 0.5 - L * 0.35, -H * 0.55 + tw)
    ctx.lineTo(-L * 0.5 - L * 0.28, 0)
    ctx.lineTo(-L * 0.5 - L * 0.35, H * 0.55 + tw)
    ctx.closePath()
    ctx.fillStyle = body; ctx.fill()

    // 등지느러미 — 오염되면 톱니처럼 뒤틀림
    ctx.beginPath()
    ctx.moveTo(-L * 0.1, -H * 0.55)
    if (g > 0.5) {
      ctx.lineTo(-L * 0.02, -H * (0.9 + g * 0.4))
      ctx.lineTo(L * 0.06, -H * 0.6)
      ctx.lineTo(L * 0.14, -H * (0.85 + g * 0.3))
    } else {
      ctx.quadraticCurveTo(L * 0.05, -H * 1.1, L * 0.2, -H * 0.5)
    }
    ctx.lineTo(L * 0.2, -H * 0.5)
    ctx.closePath()
    ctx.fillStyle = body; ctx.fill()

    // 몸통
    ctx.beginPath()
    ctx.moveTo(-L * 0.5, 0)
    const bump = g > 0.6 ? H * 0.25 * Math.sin(this.wob * 3) : 0 // 종양 같은 융기
    ctx.quadraticCurveTo(-L * 0.1, -H - bump, L * 0.45, -H * 0.2)
    ctx.quadraticCurveTo(L * 0.55, 0, L * 0.45, H * 0.2)
    ctx.quadraticCurveTo(-L * 0.1, H, -L * 0.5, 0)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, -H, 0, H)
    grad.addColorStop(0, body); grad.addColorStop(1, belly)
    ctx.fillStyle = grad; ctx.fill()
    ctx.shadowBlur = 0

    // 눈 — 오염되면 탁하게
    ctx.beginPath(); ctx.arc(L * 0.28, -H * 0.12, H * 0.16, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.beginPath(); ctx.arc(L * 0.3, -H * 0.12, H * 0.08, 0, Math.PI * 2)
    ctx.fillStyle = g > 0.6 ? 'rgba(120,120,120,0.9)' : '#111'; ctx.fill()

    // 오염 디테일: 비닐/유막
    if (!this.clean && g > 0.45) {
      ctx.globalAlpha = 0.4
      ctx.fillStyle = 'rgba(230,240,245,0.7)'
      ctx.beginPath()
      ctx.moveTo(-L * 0.2, -H * 0.2)
      ctx.quadraticCurveTo(0, -H * 0.9, L * 0.15, -H * 0.1)
      ctx.quadraticCurveTo(0, H * 0.3, -L * 0.2, -H * 0.2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }
}

/* ─────────── 낚싯바늘 ─────────── */
export function drawHook(ctx, x, topY, y, biting) {
  ctx.strokeStyle = 'rgba(230,240,255,0.5)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(x, topY); ctx.lineTo(x, y); ctx.stroke()
  // 바늘
  ctx.beginPath()
  ctx.arc(x, y + 6, 5, Math.PI * 0.1, Math.PI * 1.4)
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2; ctx.stroke()
  // 미끼/찌
  ctx.beginPath(); ctx.arc(x, y - 2, biting ? 4.5 : 3, 0, Math.PI * 2)
  ctx.fillStyle = biting ? '#fbbf24' : '#e2e8f0'; ctx.fill()
}

// 파티클(잡았을 때 물보라)
export class Splash {
  constructor(x, y, color = '200,235,255') {
    this.p = Array.from({ length: rint(10, 16) }, () => ({
      x, y, vx: rnd(-90, 90), vy: rnd(-140, -30), life: rnd(0.4, 0.9), age: 0, r: rnd(1.5, 3.5),
    }))
    this.color = color
    this.done = false
  }
  update(dt) {
    let alive = 0
    for (const q of this.p) {
      q.age += dt; if (q.age >= q.life) continue
      alive++
      q.vy += 260 * dt
      q.x += q.vx * dt; q.y += q.vy * dt
    }
    if (!alive) this.done = true
  }
  draw(ctx) {
    for (const q of this.p) {
      if (q.age >= q.life) continue
      ctx.globalAlpha = clamp(1 - q.age / q.life, 0, 1)
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${this.color},0.9)`; ctx.fill()
    }
    ctx.globalAlpha = 1
  }
}
