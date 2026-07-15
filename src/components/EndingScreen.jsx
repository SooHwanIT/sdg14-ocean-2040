// 엔딩 — 전체 화면 시네마틱. 자체 캔버스로 깨끗한 물고기가 맑아지는 물 속을 떠오른다.
import { useEffect, useRef, useState } from 'react'
import { ENDING } from '../lib/economy.js'
import { Fish } from '../lib/entities.js'

function Cinematic({ reduceMotion }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0, t = 0, running = true
    let w = 0, h = 0, dpr = 1
    let fish, particles = []
    function resize() {
      const r = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width; h = r.height
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fish = new Fish(w, h, { clean: true, x: w / 2, y: h + 40 })
      fish.len = 46; fish.dir = 1
      particles = Array.from({ length: reduceMotion ? 10 : 40 }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 0.6,
        s: Math.random() * 18 + 6, ph: Math.random() * 6.28,
      }))
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas)
    let start = performance.now()
    function frame(now) {
      if (!running) return
      const dt = Math.min((now - (frame.last || now)) / 1000, 0.05)
      frame.last = now
      t += dt
      // 맑아지는 물
      const clear = Math.min(t / 2.5, 1)
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, `hsl(198 ${60 + clear * 15}% ${18 + clear * 22}%)`)
      g.addColorStop(1, `hsl(205 ${55 + clear * 15}% ${8 + clear * 14}%)`)
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      // 빛기둥
      ctx.save(); ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 3; i++) {
        const x = (w / 4) * (i + 1) + (reduceMotion ? 0 : Math.sin(t + i) * 20)
        const lg = ctx.createLinearGradient(x, 0, x - 30, h)
        lg.addColorStop(0, `rgba(200,240,255,${0.12 * clear})`)
        lg.addColorStop(1, 'rgba(200,240,255,0)')
        ctx.fillStyle = lg
        ctx.beginPath(); ctx.moveTo(x - 30, 0); ctx.lineTo(x + 30, 0)
        ctx.lineTo(x + 80, h); ctx.lineTo(x - 90, h); ctx.closePath(); ctx.fill()
      }
      ctx.restore()
      // 상승 기포
      for (const p of particles) {
        p.y -= p.s * dt
        p.x += reduceMotion ? 0 : Math.sin(t + p.ph) * 6 * dt
        if (p.y < -5) p.y = h + 5
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28)
        ctx.fillStyle = `rgba(200,240,255,${0.4 * clear})`; ctx.fill()
      }
      // 깨끗한 물고기 상승
      const targetY = h * 0.42
      fish.y += (targetY - fish.y) * (reduceMotion ? 1 : dt * 0.9)
      fish.x = w / 2 + (reduceMotion ? 0 : Math.sin(t * 0.8) * 14)
      fish.tailPhase = t * 6
      fish.draw(ctx, 0)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { running = false; cancelAnimationFrame(raf); ro.disconnect() }
  }, [reduceMotion])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

export default function EndingScreen({ caught, pollution, stats, onRestart, reduceMotion }) {
  const [reveal, setReveal] = useState(false)
  useEffect(() => { const id = setTimeout(() => setReveal(true), 1400); return () => clearTimeout(id) }, [])

  return (
    <div className="relative min-h-full overflow-hidden bg-black text-white">
      <div className="fixed inset-0 h-[45vh]"><Cinematic reduceMotion={reduceMotion} /></div>
      <div className="pointer-events-none fixed inset-x-0 top-[38vh] h-24 bg-gradient-to-b from-transparent to-black" />

      <div className={`relative mx-auto max-w-md px-5 pt-[40vh] pb-14 transition-opacity duration-1000 ${reveal ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center">
          <h1 className="text-3xl font-black text-sky-200">깨끗한 물고기</h1>
          <p className="mt-1 text-sm font-bold text-sky-400">확률 0.1% — 당신은 그것을 낚았습니다</p>
        </div>

        <div className="mt-8 rounded-3xl bg-white/[.04] p-6 ring-1 ring-sky-400/25">
          <p className="whitespace-pre-line text-[15px] leading-loose text-white/80">{ENDING}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ['낚은 물고기', `${caught}마리`],
            ['오염된 비율', `${caught ? '99.9' : '0'}%`],
            ['해양 오염도', `${Math.round(pollution)}%`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white/[.04] p-3 text-center ring-1 ring-white/10">
              <p className="text-base font-black text-sky-200">{v}</p>
              <p className="mt-0.5 text-[10px] text-white/40">{k}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-sky-400/10 p-4 ring-1 ring-sky-400/25">
          <p className="text-xs font-bold text-sky-200">SDG 14 — 해양 생태계 보전</p>
          <p className="mt-1.5 text-xs leading-relaxed text-white/60">
            버려진 플라스틱과 남획은 지금도 널리 지적되는 해양의 위기입니다.
            지금의 속도가 이어진다면, 우리가 먹는 물고기 대부분이 미세플라스틱과
            중금속을 품게 될 수 있습니다. 이 게임의 0.1%는 그 방향을 향한 경고입니다.
          </p>
        </div>

        <button onClick={onRestart}
          className="mt-6 w-full rounded-2xl bg-sky-400 py-4 font-black text-sky-950 transition active:scale-[.98]">
          다시 시작
        </button>
        <p className="mt-3 text-center text-[11px] text-white/35">
          누적 플레이 {stats.totalRuns}회 · 최고 수익 {stats.best.money.toLocaleString()}₩
        </p>
      </div>
    </div>
  )
}
