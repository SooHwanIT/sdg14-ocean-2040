// 낚시 탭 — 캔버스 게임 + 장비 카드 + 문맥 액션 버튼 + 통계 + 로그.
import GameCanvas from './GameCanvas.jsx'
import { GEAR } from '../lib/economy.js'

export default function FishPanel({
  engineRef, getState, onEvent, phase, gearTier, caught, inventory, pollution, log, lastResult, onAction, onWhy,
}) {
  const g = GEAR[gearTier]
  const busy = phase === 'casting' || phase === 'waiting' || phase === 'reeling'
  const label =
    phase === 'timing' ? '🎣 챔질!' :
    phase === 'casting' ? '미끼 내리는 중…' :
    phase === 'waiting' ? '입질 대기…' :
    phase === 'reeling' ? '릴 감는 중…' : '낚싯대 던지기'

  return (
    <div className="space-y-4">
      <GameCanvas engineRef={engineRef} getState={getState} onEvent={onEvent} phase={phase} />

      <div className="rounded-2xl bg-white/[.04] p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{g.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-white">{g.name}</p>
            <p className="truncate text-[11px] text-white/40">{g.desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-black text-emerald-300">×{g.mult}</p>
            <p className="text-[10px] text-white/35">가격 배율</p>
          </div>
        </div>
      </div>

      <button
        onClick={onAction}
        disabled={busy}
        className={`w-full rounded-2xl py-5 text-lg font-black transition active:scale-[.98] disabled:opacity-40 ${
          phase === 'timing' ? 'animate-pulse bg-amber-400 text-amber-950' : 'bg-sky-400 text-sky-950'
        }`}>
        {label}
      </button>

      {lastResult && !lastResult.miss && (
        <p className="text-center text-xs text-emerald-300">
          {lastResult.e} {lastResult.n} · +{lastResult.price.toLocaleString()}₩
          {lastResult.quality === 'perfect' && ' · 완벽!'}
        </p>
      )}
      {lastResult && lastResult.miss && (
        <p className="text-center text-xs text-rose-300/80">놓쳤습니다… 다시 던지세요</p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[['낚은 수', caught], ['보관함', inventory.length], ['오염도', `${Math.round(pollution)}%`]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white/[.04] p-3 text-center ring-1 ring-white/10">
            <p className="text-sm font-black text-white">{v}</p>
            <p className="text-[10px] text-white/40">{k}</p>
          </div>
        ))}
      </div>

      {log.length > 0 && (
        <div className="rounded-2xl bg-white/[.03] p-3 ring-1 ring-white/10">
          {log.map((l, i) => <p key={i} className="py-0.5 text-xs text-white/40">{l}</p>)}
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl bg-white/[.03] p-3 ring-1 ring-white/10">
        <p className="text-[11px] text-white/45">
          깨끗한 물고기 확률 <b className="text-sky-300">0.1%</b> · 낚으면 게임 종료
        </p>
        <button onClick={onWhy} className="shrink-0 rounded-lg bg-sky-400/15 px-3 py-1.5 text-[11px] font-bold text-sky-300">
          왜 이 게임인가
        </button>
      </div>
    </div>
  )
}
