// 상점 탭 — 장비 업그레이드. 좋은 장비일수록 오염이 빠르다(아이러니).
import { GEAR } from '../lib/economy.js'

export default function ShopPanel({ money, gearTier, pollution, onBuy }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-white">낚시 도구 상점</h2>
        <p className="mt-1 text-sm text-white/45">좋은 장비일수록 바다는 빨리 망가집니다</p>
      </div>

      <div className="space-y-2">
        {GEAR.map((tItem) => {
          const owned = tItem.id <= gearTier
          const can = money >= tItem.price && !owned
          const current = tItem.id === gearTier
          return (
            <div key={tItem.id}
              className={`rounded-2xl p-4 ring-1 transition ${
                current ? 'bg-sky-400/10 ring-sky-400/50' :
                owned ? 'bg-white/[.02] opacity-50 ring-white/5' : 'bg-white/[.04] ring-white/10'
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tItem.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">{tItem.name}</p>
                  <p className="truncate text-[11px] text-white/40">{tItem.desc}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-lg bg-black/25 px-2 py-1 text-[11px] font-bold text-emerald-300">수익 ×{tItem.mult}</span>
                <span className="rounded-lg bg-black/25 px-2 py-1 text-[11px] font-bold text-rose-300">오염 +{tItem.pollute}</span>
                <button onClick={() => onBuy(tItem.id)} disabled={!can}
                  className={`ml-auto shrink-0 rounded-xl px-4 py-2 text-sm font-black transition ${
                    current ? 'bg-sky-400 text-sky-950' :
                    owned ? 'bg-white/10 text-white/30' :
                    can ? 'bg-amber-400 text-amber-950' : 'bg-white/[.08] text-white/25'
                  }`}>
                  {current ? '사용 중' : owned ? '보유' : `${tItem.price.toLocaleString()}₩`}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl bg-rose-500/10 p-4 ring-1 ring-rose-500/25">
        <p className="text-xs font-bold text-rose-200">⚠ 현재 오염도 {Math.round(pollution)}%</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">
          장비 등급이 높을수록 한 번 낚을 때 바다가 더 빨리 오염됩니다.
          더 많이 잡을수록, 깨끗한 물고기는 더 사라집니다.
        </p>
      </div>
    </div>
  )
}
