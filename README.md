# Ocean 2040 🎣

> 2040년 바다 낚시 게임 — 깨끗한 물고기를 낚을 확률 0.1%

**SDG 목표:** SDG 14 — 해양 생태계 (Life Below Water)

오염된 물고기를 낚아 팔고, 더 큰 낚시도구를 삽니다. 잡을수록 바다는 빠르게 비어갑니다.
그리고 아주 드물게 — **확률 0.1%** — 깨끗한 물고기가 걸리면, 게임이 끝납니다.

> 돈은 늘었습니다. 바다는 줄었습니다.

## 게임 방식

1. **던지기** — 수면을 탭하거나 버튼으로 미끼를 내립니다.
2. **챔질 타이밍** — 입질이 오면 게이지의 마커가 좌우로 움직입니다. **초록 구간**에서 챔질하면 완벽(수익 ×1.6), 노랑이면 성공, 빗나가면 놓칩니다.
3. **판매 → 업그레이드** — 대나무 낚싯대 → 탄소 → 전동 릴 → 소나 → **소형 그물망** → 대형 저인망. 좋은 장비일수록 수익이 크지만 **바다는 더 빨리 오염**됩니다.
4. **엔딩(0.1%)** — 깨끗한 물고기를 낚으면 시네마틱 엔딩과 SDG 14 메시지가 뜨고 게임이 끝납니다.

## 기술 하이라이트

- **실제 Canvas 게임 엔진** — `requestAnimationFrame` + delta-time 루프, DPR 대응 반응형, 페이즈 상태기계 (`src/lib/engine.js`).
- **절차적 렌더링** — 물빛·신광·파도·해저·물고기·쓰레기·기포·파티클을 전부 canvas path로 생성. **이미지 파일 0개**.
- **타이밍 스킬 메커닉** — 챔질 게이지(초록/노랑/놓침), 오염도·장비에 따라 난이도 변화.
- **동적 바다** — 오염도가 오르면 물이 탁해지고, 어군이 희소해지며, 물고기가 기형화되고 쓰레기가 늘어납니다.
- **React ↔ 엔진 분리** — React는 HUD·메뉴, 캔버스는 게임. 통신은 `getState()`(pull) + 이벤트(push).
- **WebAudio 효과음** (에셋·키 0, 음소거 가능), **버전드 localStorage**(최고기록/누적), `prefers-reduced-motion` 존중.

자세한 내용은 [`IMPROVEMENTS.md`](./IMPROVEMENTS.md) 참고.

## 구조

```
src/
  App.jsx                # 얇은 오케스트레이터 (화면/탭 라우팅)
  hooks/useGame.js       # 게임 상태·경제·엔진 이벤트 오케스트레이션 + 영속
  lib/
    engine.js            # 캔버스 게임 루프 (rAF, delta-time, 페이즈 상태기계)
    entities.js          # 물고기·쓰레기·기포·파티클·바늘 (절차적 draw)
    scene.js             # 물·신광·파도·해저 렌더
    economy.js           # 장비·어종·가격·오염·엔딩 텍스트 (순수 함수)
    rng.js               # 난수/보간 유틸 (mulberry32)
    audio.js             # WebAudio 블립
    storage.js           # 버전드 localStorage
  components/
    StartScreen · Hud · FishPanel · GameCanvas
    SellPanel · ShopPanel · WhyPanel · EndingScreen
```

## 기술 스택

- Vite 6 + React 18
- Tailwind CSS v4 (`@tailwindcss/vite`) — UI 크롬 전용
- HTML5 Canvas — 게임 렌더
- 저장: `localStorage` (백엔드·API 키 없음)

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 미리보기
```

## 임팩트

이 게임의 논증은 텍스트가 아니라 **메커니즘**에 있습니다. 오염된 어획을 팔아 더 큰 그물을
사는 순환을 반복할수록, 깨끗함은 예외가 됩니다. 0.1%는 정밀 통계가 아니라 그 방향을
가리키는 **수사적 장치**이며, 근거는 “왜 이 게임인가” 패널에 정직하게(과장 수치 없이) 밝혀 둡니다.
