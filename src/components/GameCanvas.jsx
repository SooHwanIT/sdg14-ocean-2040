// 캔버스 마운트 + 엔진 수명주기. 렌더 루프는 엔진(명령형), 이 컴포넌트는 얇은 껍데기.
import { useEffect, useRef, useState } from 'react'
import { createGame } from '../lib/engine.js'

export default function GameCanvas({ engineRef, getState, onEvent, phase }) {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const game = createGame(canvas, { getState, onEvent })
    engineRef.current = game
    game.start()
    const id = requestAnimationFrame(() => setReady(true))
    return () => { cancelAnimationFrame(id); game.stop(); engineRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hint =
    phase === 'idle' ? '수면을 탭하거나 아래 버튼으로 낚싯대를 던지세요' :
    phase === 'casting' ? '미끼를 내리는 중…' :
    phase === 'waiting' ? '입질을 기다리는 중…' :
    phase === 'timing' ? '초록 구간에서 챔질!' :
    phase === 'reeling' ? '' : ''

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 sm:aspect-[3/2]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none select-none" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-neutral-950">
          <p className="animate-pulse text-sm text-sky-300/70">바다를 불러오는 중…</p>
        </div>
      )}
      {ready && hint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur">
            {hint}
          </span>
        </div>
      )}
      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/35 px-2 py-1 text-[10px] font-bold text-white/60 backdrop-blur">
        2040 · 실시간 절차적 렌더
      </span>
    </div>
  )
}
