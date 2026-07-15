// Ocean 2040 — 얇은 오케스트레이터. 상태/로직은 hooks·lib, 렌더는 components·canvas.
import { useState } from 'react'
import { useGame } from './hooks/useGame.js'
import StartScreen from './components/StartScreen.jsx'
import Hud from './components/Hud.jsx'
import FishPanel from './components/FishPanel.jsx'
import SellPanel from './components/SellPanel.jsx'
import ShopPanel from './components/ShopPanel.jsx'
import WhyPanel from './components/WhyPanel.jsx'
import EndingScreen from './components/EndingScreen.jsx'

const TABS = [
  { id: 'fish', l: '낚시', e: '🎣' },
  { id: 'sell', l: '판매', e: '💰' },
  { id: 'shop', l: '상점', e: '🛒' },
]

export default function App() {
  const gm = useGame()
  const [whyOpen, setWhyOpen] = useState(false)

  if (gm.screen === 'start') {
    return (
      <div className="min-h-full bg-neutral-950 text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,.16),transparent_55%)]" />
        <div className="relative">
          <StartScreen stats={gm.stats} muted={gm.muted} onStart={gm.startGame} onToggleMute={gm.toggleMute} />
        </div>
      </div>
    )
  }

  if (gm.screen === 'ending') {
    return (
      <EndingScreen
        caught={gm.caught}
        pollution={gm.pollution}
        stats={gm.stats}
        reduceMotion={gm.reduceMotion}
        onRestart={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,.14),transparent_55%)]" />
      <div className="relative mx-auto max-w-md px-4 pb-28 pt-6">
        <Hud money={gm.money} pollution={gm.pollution} muted={gm.muted} onToggleMute={gm.toggleMute} />

        {gm.tab === 'fish' && (
          <FishPanel
            engineRef={gm.engineRef} getState={gm.getState} onEvent={gm.onEvent} phase={gm.phase}
            gearTier={gm.gearTier} caught={gm.caught} inventory={gm.inventory} pollution={gm.pollution}
            log={gm.log} lastResult={gm.lastResult} onAction={gm.doAction} onWhy={() => setWhyOpen(true)}
          />
        )}
        {gm.tab === 'sell' && (
          <SellPanel inventory={gm.inventory} inventoryValue={gm.inventoryValue}
            onSellAll={gm.sellAll} onSellOne={gm.sellOne} />
        )}
        {gm.tab === 'shop' && (
          <ShopPanel money={gm.money} gearTier={gm.gearTier} pollution={gm.pollution} onBuy={gm.buyGear} />
        )}
      </div>

      {whyOpen && <WhyPanel onClose={() => setWhyOpen(false)} />}

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="flex">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => gm.setTab(t.id)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 transition ${
                gm.tab === t.id ? 'text-sky-300' : 'text-white/35'}`}>
              <span className="text-lg">{t.e}</span>
              <span className="text-[10px] font-semibold">{t.l}</span>
              {t.id === 'sell' && gm.inventory.length > 0 && (
                <span className="absolute right-[26%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-amber-950">
                  {gm.inventory.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
