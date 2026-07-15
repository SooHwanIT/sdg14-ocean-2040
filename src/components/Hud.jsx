// 상단 HUD — 브랜드 · 오염도 게이지 · 소지금 · 음소거.
export default function Hud({ money, pollution, muted, onToggleMute }) {
  const p = Math.round(pollution)
  const hue = 150 - Math.min(pollution, 100) * 1.1 // 초록 → 붉게
  return (
    <header className="mb-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">🎣</span>
        <p className="font-black tracking-tight">Ocean 2040</p>
        <span className="rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">SDG 14</span>
        <button onClick={onToggleMute}
          className="ml-auto rounded-lg bg-white/5 px-2 py-1 text-sm ring-1 ring-white/10"
          aria-label="소리 켜기/끄기">
          {muted ? '🔇' : '🔊'}
        </button>
        <span className="rounded-lg bg-amber-400/15 px-2.5 py-1 text-sm font-black text-amber-300">
          {money.toLocaleString()} ₩
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-white/40">해양 오염도</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${p}%`, background: `hsl(${hue} 70% 50%)` }} />
        </div>
        <span className="w-9 text-right text-[10px] font-black" style={{ color: `hsl(${hue} 70% 65%)` }}>{p}%</span>
      </div>
    </header>
  )
}
