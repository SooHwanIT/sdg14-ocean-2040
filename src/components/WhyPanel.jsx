// "왜 이 게임인가" — SDG 14 임팩트 패널. 정성적 서술(과장된 수치 없음).
export default function WhyPanel({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-neutral-900 p-6 ring-1 ring-white/10 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">왜 이 게임인가</h2>
          <button onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1 text-sm font-bold text-white/70">닫기</button>
        </div>

        <p className="text-sm font-bold text-sky-300">SDG 14 · 해양 생태계 보전</p>
        <p className="mt-2 text-[13px] leading-relaxed text-white/70">
          지속가능발전목표 14번은 “바다와 해양 자원을 보전하고 지속가능하게 이용하자”는
          국제 목표입니다. 이 게임은 그 목표가 왜 절박한지를 <b className="text-white">플레이의 문법</b>으로 말합니다.
        </p>

        <div className="mt-5 space-y-3">
          {[
            ['🛍️', '해양 플라스틱', '버려진 봉지·병·미세플라스틱이 바다로 흘러들어 먹이사슬을 타고 다시 식탁으로 돌아온다는 우려가 널리 보고되고 있습니다.'],
            ['🕸️', '유령어업', '버려진 그물과 어구가 계속해서 해양 생물을 얽어매는 문제가 지속적으로 지적됩니다.'],
            ['🚢', '남획', '잡는 능력이 재생 속도를 앞지르면 어족 자원은 회복하지 못합니다. 이 게임의 장비 업그레이드가 그 가속을 은유합니다.'],
            ['🪸', '백화 현상', '수온 상승과 오염으로 산호가 하얗게 죽어가는 현상이 여러 해역에서 관측되고 있습니다.'],
          ].map(([e, t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl bg-white/[.04] p-3 ring-1 ring-white/10">
              <span className="text-xl">{e}</span>
              <div>
                <p className="text-sm font-bold text-white">{t}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-white/55">{d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-sky-400/10 p-4 ring-1 ring-sky-400/25">
          <p className="text-xs font-bold text-sky-200">0.1%라는 장치</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">
            게임 속 “깨끗한 물고기 0.1%”는 정밀한 통계가 아니라 <b className="text-white">수사(修辭)적 장치</b>입니다.
            오염된 어획을 팔아 더 큰 장비를 사는 순환을 반복할수록, 깨끗함은 예외가 됩니다.
            숫자보다 그 감각을 남기는 것이 이 게임의 목표입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
