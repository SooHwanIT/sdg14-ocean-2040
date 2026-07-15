// 판매 탭 — 보관함 총액, 전부/개별 판매.
export default function SellPanel({ inventory, inventoryValue, onSellAll, onSellOne }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-white">판매</h2>
        <p className="mt-1 text-sm text-white/45">오염된 물고기를 팔아 장비를 삽니다</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-amber-500/25 to-transparent p-5 text-center ring-1 ring-amber-400/30">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">보관함 총액</p>
        <p className="mt-1 text-4xl font-black text-white">{inventoryValue.toLocaleString()} ₩</p>
        <button onClick={onSellAll} disabled={!inventory.length}
          className="mt-3 w-full rounded-xl bg-amber-400 py-3 font-black text-amber-950 disabled:bg-white/10 disabled:text-white/25">
          전부 판매 ({inventory.length}마리)
        </button>
      </div>

      <div className="space-y-1.5">
        {inventory.map((f) => (
          <div key={f.uid} className="flex items-center gap-3 rounded-xl bg-white/[.04] p-3 ring-1 ring-white/10">
            <span className="text-xl">{f.e}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{f.n}</p>
              <p className="text-[10px] text-rose-300">{f.tag}</p>
            </div>
            <button onClick={() => onSellOne(f.uid)}
              className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
              {f.price.toLocaleString()}₩
            </button>
          </div>
        ))}
        {!inventory.length && <p className="py-10 text-center text-sm text-white/25">보관함이 비어 있습니다</p>}
      </div>
    </div>
  )
}
