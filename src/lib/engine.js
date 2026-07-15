// 캔버스 게임 엔진 — requestAnimationFrame + delta-time 루프. React 상태와 분리.
// React는 HUD/메뉴, 엔진은 렌더+상호작용. 통신은 getState()(끌어오기)와 onEvent()(밀어내기).
import { clamp, lerp, rnd } from './rng.js'
import { drawWater, drawSeabed, waterColors, SURFACE } from './scene.js'
import { Fish, Bubble, Trash, Splash, drawHook } from './entities.js'

const PHASE = { IDLE: 'idle', CASTING: 'casting', WAITING: 'waiting', TIMING: 'timing', REELING: 'reeling', ENDING: 'ending' }

export function createGame(canvas, { getState, onEvent }) {
  const ctx = canvas.getContext('2d')
  let w = 0, h = 0, dpr = 1
  let raf = 0, last = 0, t = 0, running = false
  let phase = PHASE.IDLE

  let bubbles = [], fishes = [], trash = [], splashes = []
  let hookX = 0, hookTop = 0, hookY = 0, hookRest = 0, hookDeep = 0
  let target = null
  let phaseT = 0            // 현재 페이즈 경과(초)
  let gauge = { pos: 0, dir: 1, speed: 1.4, target: 0.5, green: 0.12, yellow: 0.26, life: 0 }
  let cleanEnding = false
  let endGlow = 0

  const emit = (e) => { try { onEvent && onEvent(e) } catch { /* */ } }
  const S = () => getState() || { pollution: 20, gearTier: 0, muted: false, reduceMotion: false }
  const pol = () => S().pollution

  /* ── 리사이즈(DPR 대응) ── */
  function resize() {
    const rect = canvas.getBoundingClientRect()
    const cw = Math.max(1, rect.width), ch = Math.max(1, rect.height)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(cw * dpr)
    canvas.height = Math.round(ch * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    w = cw; h = ch
    hookX = w / 2
    hookTop = h * SURFACE
    hookRest = h * (SURFACE + 0.06)
    hookDeep = h * 0.6
    if (phase === PHASE.IDLE) hookY = hookRest
    populate(true)
  }

  // 오염도에 따른 개체 수 재구성
  function populate(initial = false) {
    const p = pol() / 100
    const rm = S().reduceMotion
    const nFish = Math.round(lerp(9, 2, p))
    const nTrash = Math.round(lerp(1, 14, p))
    const nBub = rm ? 6 : Math.round(lerp(26, 14, p))

    while (fishes.length < nFish) fishes.push(new Fish(w, h))
    if (fishes.length > nFish) fishes = fishes.filter((f) => f === target).concat(
      fishes.filter((f) => f !== target).slice(0, nFish - (fishes.includes(target) ? 1 : 0)))
    while (trash.length < nTrash) trash.push(new Trash(w, h))
    if (trash.length > nTrash) trash.length = nTrash
    if (initial || bubbles.length !== nBub) {
      bubbles = Array.from({ length: nBub }, () => new Bubble(w, h))
    }
  }

  /* ── 상호작용: 문맥에 따라 던지기/챔질 ── */
  function action() {
    if (phase === PHASE.IDLE) return cast()
    if (phase === PHASE.TIMING) return strike()
    // casting/waiting/reeling/ending 중에는 무시
  }

  function cast() {
    phase = PHASE.CASTING; phaseT = 0
    target = null
    emit({ type: 'phase', phase })
    emit({ type: 'cast' })
  }

  function beginWaiting() {
    phase = PHASE.WAITING; phaseT = 0
    // 오염될수록·저급 장비일수록 입질이 느리다(어군 희소)
    const st = S()
    const p = pol() / 100
    const gearSpeed = 1 + st.gearTier * 0.28
    waitDuration = lerp(0.9, 2.8, Math.random()) * lerp(1, 1.9, p) / gearSpeed
    // 미끼로 향할 물고기 지정(없으면 생성)
    let cand = fishes.filter((f) => f !== target)
    target = cand.length ? cand[Math.floor(Math.random() * cand.length)] : new Fish(w, h)
    if (!fishes.includes(target)) fishes.push(target)
  }
  let waitDuration = 1.5

  function beginTiming() {
    phase = PHASE.TIMING; phaseT = 0
    const st = S()
    const p = pol() / 100
    gauge.pos = 0; gauge.dir = 1
    // 장비가 강할수록·바다가 탁할수록 물고기가 격렬 → 마커가 빨라짐(난이도)
    gauge.speed = lerp(1.15, 1.7, p) + st.gearTier * 0.14
    gauge.target = rnd(0.28, 0.72)
    gauge.green = lerp(0.14, 0.10, p)
    gauge.yellow = lerp(0.30, 0.22, p)
    gauge.life = 0
    emit({ type: 'bite' })
    emit({ type: 'phase', phase })
  }

  function strike() {
    const d = Math.abs(gauge.pos - gauge.target)
    let quality
    if (d <= gauge.green / 2) quality = 'perfect'
    else if (d <= gauge.yellow / 2) quality = 'good'
    else quality = 'miss'
    resolve(quality)
  }

  function resolve(quality) {
    phase = PHASE.REELING; phaseT = 0
    if (quality === 'miss') {
      if (target) { target.hooked = false; target.escaping = true; target.dir = target.x < w / 2 ? -1 : 1; target.spd = 140 }
      emit({ type: 'result', quality: 'miss' })
    } else {
      if (target) target.hooked = true
      splashes.push(new Splash(hookX, hookY, quality === 'perfect' ? '253,224,71' : '200,235,255'))
      emit({ type: 'result', quality })
      // React가 이 시점에 clean 여부를 getState().cleanNext 로 알려줄 수 있음
    }
    reelSuccess = quality !== 'miss'
  }
  let reelSuccess = false

  // React가 깨끗한 물고기 판정을 엔진에 통지 → 시네마틱 엔딩 연출
  function triggerEnding() {
    cleanEnding = true
    if (target) { target.clean = true; target.hooked = true }
  }

  /* ── 업데이트 ── */
  function update(dt) {
    t += dt * 1000
    phaseT += dt
    const p = pol()
    const rm = S().reduceMotion

    for (const b of bubbles) b.update(dt, w, h)
    for (const tr of trash) tr.update(dt, w, h)
    for (const s of splashes) s.update(dt)
    splashes = splashes.filter((s) => !s.done)

    // 물고기 유영
    for (const f of fishes) {
      if (f === target && (phase === PHASE.WAITING || phase === PHASE.TIMING)) continue
      if (f.escaping) { f.x += f.spd * f.dir * dt; f.update(dt, w, h); continue }
      f.update(dt, w, h)
    }

    if (phase === PHASE.CASTING) {
      hookY = lerp(hookRest, hookDeep, clamp(phaseT / 0.55, 0, 1))
      if (phaseT >= 0.55) beginWaiting()
    } else if (phase === PHASE.WAITING) {
      hookY = hookDeep + Math.sin(t * 0.003) * 4
      if (target) {
        // 지정 물고기가 미끼로 접근
        const arrived = phaseT >= waitDuration
        const tx = hookX, ty = hookY + 4
        if (arrived) {
          target.seekTo(tx, ty, dt)
          if (Math.hypot(target.x - tx, target.y - ty) < 22) beginTiming()
        } else {
          target.update(dt, w, h)
        }
      }
    } else if (phase === PHASE.TIMING) {
      hookY = hookDeep + Math.sin(t * 0.01) * 3
      gauge.pos += gauge.dir * gauge.speed * dt
      if (gauge.pos >= 1) { gauge.pos = 1; gauge.dir = -1 }
      if (gauge.pos <= 0) { gauge.pos = 0; gauge.dir = 1 }
      gauge.life += dt
      // 미끼에 문 물고기는 바늘 곁에서 파닥임
      if (target) { target.x = lerp(target.x, hookX, dt * 6); target.y = lerp(target.y, hookY + 4, dt * 6) + Math.sin(t * 0.02) * 3 }
      if (gauge.life > 3.4) resolve('miss') // 반응 못하면 놓침
    } else if (phase === PHASE.REELING) {
      if (reelSuccess && target) {
        target.x = lerp(target.x, hookX, dt * 5)
        target.y = lerp(target.y, hookY, dt * 5)
        hookY = lerp(hookY, hookRest, dt * (cleanEnding ? 1.6 : 3.2))
      } else {
        hookY = lerp(hookY, hookRest, dt * 4)
      }
      if (cleanEnding) { endGlow = clamp(endGlow + dt * 0.6, 0, 1) }
      const dur = cleanEnding ? 1.6 : 0.7
      if (phaseT >= dur) {
        if (cleanEnding) { phase = PHASE.ENDING; phaseT = 0 }
        else {
          if (target) target.hooked = false
          fishes.forEach((f) => (f.escaping = false))
          target = null
          hookY = hookRest
          phase = PHASE.IDLE
          emit({ type: 'phase', phase })
        }
      }
    } else if (phase === PHASE.ENDING) {
      endGlow = clamp(endGlow + dt * 0.35, 0, 1)
      if (target) { target.y = lerp(target.y, hookTop - 30, dt * 1.2); target.x = lerp(target.x, hookX, dt * 2) }
      if (phaseT >= 2.2) emit({ type: 'ended' })
    }
  }

  /* ── 렌더 ── */
  function render() {
    const p = pol()
    const rm = S().reduceMotion
    const surfaceY = drawWater(ctx, w, h, t, p, rm)

    // 원경 물고기(시차) — 흐릿하고 느리게
    ctx.save(); ctx.globalAlpha = 0.35
    const gro = clamp(p / 100, 0, 1)
    for (const tr of trash) tr.draw(ctx)
    ctx.restore()

    for (const f of fishes) {
      if (f === target && cleanEnding) continue
      f.draw(ctx, gro)
    }

    // 낚싯줄/바늘
    const st = S()
    drawHook(ctx, hookX, hookTop, hookY, phase === PHASE.TIMING)

    // 목표 물고기(엔딩 시 빛나게)
    if (target && (cleanEnding || phase === PHASE.REELING || phase === PHASE.ENDING)) {
      target.draw(ctx, cleanEnding ? 0 : gro)
    }

    for (const b of bubbles) b.draw(ctx)
    drawSeabed(ctx, w, h, p)
    for (const s of splashes) s.draw(ctx)

    // 챔질 게이지
    if (phase === PHASE.TIMING) drawGauge()

    // 엔딩 빛
    if (endGlow > 0) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const g = ctx.createRadialGradient(hookX, hookTop, 0, hookX, hookTop, Math.max(w, h))
      g.addColorStop(0, `rgba(210,245,255,${0.5 * endGlow})`)
      g.addColorStop(0.4, `rgba(150,220,255,${0.18 * endGlow})`)
      g.addColorStop(1, 'rgba(150,220,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      ctx.restore()
    }
  }

  function drawGauge() {
    const gw = Math.min(w * 0.78, 320), gh = 16
    const gx = (w - gw) / 2, gy = h * 0.86
    // 트랙
    roundRect(ctx, gx, gy, gw, gh, 8)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke()
    // yellow zone
    const yzW = gauge.yellow * gw
    roundRect(ctx, gx + gauge.target * gw - yzW / 2, gy, yzW, gh, 6)
    ctx.fillStyle = 'rgba(251,191,36,0.35)'; ctx.fill()
    // green zone
    const gzW = gauge.green * gw
    roundRect(ctx, gx + gauge.target * gw - gzW / 2, gy, gzW, gh, 6)
    ctx.fillStyle = 'rgba(52,211,153,0.65)'; ctx.fill()
    // 마커
    const mx = gx + clamp(gauge.pos, 0, 1) * gw
    ctx.fillStyle = '#fff'
    ctx.fillRect(mx - 2, gy - 5, 4, gh + 10)
    // 라벨
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.font = '700 12px Pretendard, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('지금 챔질!', w / 2, gy - 12)
    ctx.textAlign = 'left'
  }

  function roundRect(c, x, y, ww, hh, r) {
    c.beginPath()
    c.moveTo(x + r, y)
    c.arcTo(x + ww, y, x + ww, y + hh, r)
    c.arcTo(x + ww, y + hh, x, y + hh, r)
    c.arcTo(x, y + hh, x, y, r)
    c.arcTo(x, y, x + ww, y, r)
    c.closePath()
  }

  /* ── 루프 ── */
  function frame(now) {
    if (!running) return
    if (!last) last = now
    let dt = (now - last) / 1000
    last = now
    dt = Math.min(dt, 0.05) // 탭 비활성 후 점프 방지
    update(dt)
    render()
    raf = requestAnimationFrame(frame)
  }

  /* ── 라이프사이클 ── */
  let ro
  function start() {
    if (running) return
    resize()
    running = true; last = 0
    raf = requestAnimationFrame(frame)
    ro = new ResizeObserver(resize)
    ro.observe(canvas)
    canvas.addEventListener('pointerdown', onPointer)
  }
  function onPointer(e) { e.preventDefault(); action() }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
    if (ro) ro.disconnect()
    canvas.removeEventListener('pointerdown', onPointer)
  }

  return {
    start, stop,
    action,
    triggerEnding,
    getPhase: () => phase,
    refreshPopulation: () => populate(),
  }
}

export { PHASE }
