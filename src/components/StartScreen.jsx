// 시작 화면 — 컨셉 소개 + 최고기록 + 시작 버튼.
import { GEAR } from '../lib/economy.js'

export default function StartScreen({ stats, onStart, muted, onToggleMute }) {
  return (
    <div className="relative mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <span className="text-6xl">🎣</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white">Ocean 2040</h1>
        <p className="mt-2 text-sm font-bold text-sky-300">SDG 14 · 해양 생태계</p>
        <p className="mx-auto mt-4 max-w-xs text-[13px] leading-relaxed text-white/60">
          2040년의 바다. 오염된 물고기를 낚아 팔고, 더 큰 낚시도구를 삽니다.
          잡을수록 바다는 빠르게 비어갑니다. 그리고 아주 드물게—
          <b className="text-sky-200"> 확률 0.1%</b>로 깨끗한 물고기가 걸립니다.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2">
        {[
          ['최고 수익', `${stats.best.money.toLocaleString()}₩`],
          ['최다 어획', `${stats.best.caught}마리`],
          ['플레이', `${stats.totalRuns}회`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white/[.04] p-3 text-center ring-1 ring-white/10">
            <p className="text-sm font-black text-sky-200">{v}</p>
            <p className="mt-0.5 text-[10px] text-white/40">{k}</p>
          </div>
        ))}
      </div>

      {stats.everFoundClean && (
        <p className="mt-3 text-center text-[11px] text-sky-300/80">
          ✨ 당신은 이미 깨끗한 물고기를 만난 적이 있습니다
        </p>
      )}

      <button onClick={onStart}
        className="mt-8 w-full rounded-2xl bg-sky-400 py-4 text-lg font-black text-sky-950 transition active:scale-[.98]">
        낚시 시작
      </button>

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-white/40">
        <button onClick={onToggleMute} className="underline-offset-2 hover:underline">
          {muted ? '🔇 소리 꺼짐' : '🔊 소리 켜짐'}
        </button>
        <span>· 데스크톱/모바일 지원</span>
      </div>
    </div>
  )
}
