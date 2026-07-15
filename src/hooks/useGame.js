// React 게임 상태 오케스트레이션. 캔버스 엔진과 이벤트로 통신, localStorage 영속.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GEAR, resolveCatch, rollClean, pollutionGain } from '../lib/economy.js'
import { loadStats, saveStats, mergeRun } from '../lib/storage.js'
import { sfx, setMuted as setAudioMuted, primeAudio } from '../lib/audio.js'

const START_POLLUTION = 20

export function useGame() {
  const [stats, setStats] = useState(() => loadStats())
  const [screen, setScreen] = useState('start') // start | play | ending
  const [tab, setTab] = useState('fish')

  const [money, setMoney] = useState(0)
  const [gearTier, setGearTier] = useState(0)
  const [inventory, setInventory] = useState([])
  const [caught, setCaught] = useState(0)
  const [pollution, setPollution] = useState(START_POLLUTION)
  const [phase, setPhase] = useState('idle')
  const [lastResult, setLastResult] = useState(null)
  const [log, setLog] = useState([])
  const [muted, setMuted] = useState(() => loadStats().muted)
  const [foundClean, setFoundClean] = useState(false)

  const engineRef = useRef(null)
  const savedRef = useRef(false)

  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  // 엔진이 매 프레임 끌어가는 스냅샷
  const stateRef = useRef({ pollution: START_POLLUTION, gearTier: 0, muted, reduceMotion })
  useEffect(() => {
    stateRef.current = { pollution, gearTier, muted, reduceMotion }
  }, [pollution, gearTier, muted, reduceMotion])

  useEffect(() => { setAudioMuted(muted) }, [muted])

  // 오염도 변화 → 개체 밀도 갱신
  useEffect(() => {
    engineRef.current && engineRef.current.refreshPopulation()
  }, [Math.round(pollution / 4)])

  const getState = useCallback(() => stateRef.current, [])

  const finalizeEnding = useCallback(() => {
    if (savedRef.current) return
    savedRef.current = true
    setStats((prev) => {
      const next = mergeRun(prev, { money, caught, pollution, foundClean: true })
      saveStats(next)
      return next
    })
    setScreen('ending')
  }, [money, caught, pollution])

  // 엔진 → React 이벤트 처리
  const onEvent = useCallback((e) => {
    switch (e.type) {
      case 'cast': sfx.cast(); setLastResult(null); break
      case 'phase': setPhase(e.phase); break
      case 'bite': sfx.bite(); setPhase('timing'); break
      case 'result': {
        if (e.quality === 'miss') {
          sfx.miss(); setPhase('reeling'); setLastResult({ miss: true })
          break
        }
        const g = stateRef.current.gearTier
        const fish = resolveCatch(g, e.quality)
        if (rollClean()) {
          sfx.clean()
          setFoundClean(true)
          setPhase('ending')
          engineRef.current && engineRef.current.triggerEnding()
          break
        }
        e.quality === 'perfect' ? sfx.perfect() : sfx.good()
        setInventory((v) => [{ ...fish, uid: Date.now() + Math.random() }, ...v].slice(0, 50))
        setCaught((c) => c + 1)
        setPollution((p) => Math.min(100, p + pollutionGain(g)))
        setLastResult(fish)
        setLog((l) => [`${fish.e} ${fish.n} · +${fish.price.toLocaleString()}₩`, ...l].slice(0, 6))
        setPhase('reeling')
        break
      }
      case 'ended': finalizeEnding(); break
      default: break
    }
  }, [finalizeEnding])

  /* ── 액션 ── */
  const startGame = useCallback(() => { primeAudio(); setScreen('play') }, [])

  const doAction = useCallback(() => {
    primeAudio()
    engineRef.current && engineRef.current.action()
  }, [])

  const sellAll = useCallback(() => {
    setInventory((inv) => {
      const sum = inv.reduce((a, f) => a + f.price, 0)
      if (sum > 0) { sfx.buy(); setMoney((m) => m + sum) }
      return []
    })
  }, [])

  const sellOne = useCallback((uid) => {
    setInventory((inv) => {
      const f = inv.find((x) => x.uid === uid)
      if (f) { setMoney((m) => m + f.price); sfx.buy() }
      return inv.filter((x) => x.uid !== uid)
    })
  }, [])

  const buyGear = useCallback((id) => {
    const g = GEAR[id]
    setMoney((m) => {
      if (m < g.price || id <= gearTier) return m
      sfx.buy(); setGearTier(id); setTab('fish')
      return m - g.price
    })
  }, [gearTier])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const nv = !m
      setStats((prev) => { const nx = { ...prev, muted: nv }; saveStats(nx); return nx })
      return nv
    })
  }, [])

  const inventoryValue = useMemo(
    () => inventory.reduce((a, f) => a + f.price, 0), [inventory]
  )

  return {
    // 상태
    stats, screen, tab, money, gearTier, inventory, caught, pollution,
    phase, lastResult, log, muted, foundClean, inventoryValue, reduceMotion,
    // 엔진 연결
    engineRef, getState, onEvent,
    // 액션
    setTab, startGame, doAction, sellAll, sellOne, buyGear, toggleMute,
  }
}
