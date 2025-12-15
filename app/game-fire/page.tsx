"use client"

import React, { useEffect, useRef, useState } from "react"

type Fire = {
  id: number
  x: number
  y: number
  hitsLeft: number
  timeoutId?: number
  exploding?: boolean // patlama animasyonu için
}

const MAX_UNEXTINGUISHED = 10; // Oyun bitirme eşiği (ateş sayısı)
const GAME_OVER_SCORE = -200; // Skor eşiği
export default function GameFirePage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const beaverRef = useRef<HTMLDivElement | null>(null)
  const nextId = useRef(1)
  const timers = useRef<Record<number, number>>({})
  const [fires, setFires] = useState<Fire[]>([])
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  // Zorluk ilerlemesi için başlangıç değerleri (orta seviye)
  const [spawnInterval, setSpawnInterval] = useState(500) // orta seviye başlasın
  const [fireLifespan, setFireLifespan] = useState(900) // orta seviye başlasın
  const [elapsed, setElapsed] = useState(0) // geçen süre (ms)
  const difficultyTimer = useRef<number | null>(null)
  const [flash, setFlash] = useState(false) // patlama flaşı için
  const [gameOver, setGameOver] = useState(false)
  // Zaman ilerledikçe zorluk artsın: her 12 saniyede bir spawnInterval ve fireLifespan azalsın
  useEffect(() => {
    if (!playing) {
      if (difficultyTimer.current) {
        window.clearInterval(difficultyTimer.current)
        difficultyTimer.current = null
      }
      setElapsed(0)
      return
    }
    const start = Date.now()
    difficultyTimer.current = window.setInterval(() => {
      setElapsed(Date.now() - start)
      setSpawnInterval((prev) => Math.max(250, prev - 60)) // min 250ms
      setFireLifespan((prev) => Math.max(400, prev - 80)) // min 400ms
    }, 12000) // her 12 saniyede bir zorlaşsın
    return () => {
      if (difficultyTimer.current) {
        window.clearInterval(difficultyTimer.current)
        difficultyTimer.current = null
      }
    }
  }, [playing])
  const spawnTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) {
      clearSpawnTimer()
      clearAllFireTimers()
      setFires([])
      return
    }
    startSpawnTimer()
    return () => {
      clearSpawnTimer()
      clearAllFireTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, spawnInterval, fireLifespan])

  // Oyun bitiş kontrolü
  useEffect(() => {
    if (playing && (fires.length >= MAX_UNEXTINGUISHED || score <= GAME_OVER_SCORE)) {
      setPlaying(false)
      setGameOver(true)
      clearSpawnTimer()
      clearAllFireTimers()
    }
  }, [fires, playing, score])

  function clearSpawnTimer() {
    if (spawnTimer.current) {
      window.clearInterval(spawnTimer.current)
      spawnTimer.current = null
    }
  }

  function startSpawnTimer() {
    clearSpawnTimer()
    spawnTimer.current = window.setInterval(() => {
      spawnFire()
    }, spawnInterval)
  }

  function clearAllFireTimers() {
    for (const idStr in timers.current) {
      const id = Number(idStr)
      window.clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }

  function spawnFire() {
    const el = containerRef.current
    if (!el) return
    // Ateşler ekranın her yerinde rastgele çıksın
    const rect = el.getBoundingClientRect()
    const x = Math.random() * (rect.width - 72) + 36 // 36px kenarlardan boşluk
    const y = Math.random() * (rect.height - 100) + 36 // üst-alt boşluk
    const id = nextId.current++
    // Rastgele fire tipi seç: 1, 2 veya 3 vuruşta sönsün
    let hitsLeft = 0
    const r = Math.random()
    if (r < 0.33) {
      hitsLeft = 0 // 1 vuruşta sönsün
    } else if (r < 0.66) {
      hitsLeft = 1 // 2 vuruşta sönsün
    } else {
      hitsLeft = 2 // 3 vuruşta sönsün
    }
  const fire: Fire = { id, x, y, hitsLeft }
  setFires((s) => [...s, fire])

    // set timeout for burn out (penalty) unless cleared
    const tId = window.setTimeout(() => {
      setFires((prev) => {
        const exists = prev.find((f) => f.id === id)
        if (!exists) return prev
        // penalize for unsmitten fire, show explosion
        setScore((sc) => sc - 5)
        // Arka plan flaşı tetikle
        setFlash(true)
        setTimeout(() => setFlash(false), 350)
        return prev.map((f) => f.id === id ? { ...f, exploding: true } : f)
      })
      // Patlama animasyonu için kısa bir süre sonra kaldır
      setTimeout(() => {
        setFires((prev) => prev.filter((f) => f.id !== id))
        delete timers.current[id]
      }, 600)
    }, fireLifespan)
  timers.current[id] = tId
  }

  function extinguishFire(id: number) {
    setFires((prev) => {
      const next: Fire[] = []
      for (const f of prev) {
        if (f.id === id) {
          const newHits = f.hitsLeft - 1
          if (newHits <= 0 && !('immortal' in f && f.immortal)) {
            // extinguished -> reward, clear timer
            if (timers.current[id]) {
              window.clearTimeout(timers.current[id])
              delete timers.current[id]
            }
            setScore((s) => s + 10)
            continue // remove this fire
          } else {
            next.push({ ...f, hitsLeft: newHits })
          }
        } else {
          next.push(f)
        }
      }
      return next
    })
  }

  function handleClickFire(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    extinguishFire(id)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginTop: 0 }}>Küçük Kunduz — Ateş Söndürme</h2>
      {/* Skor tabelası sol üst köşede sabit */}
      <div style={{
        position: "absolute",
        top: 18,
        left: 18,
        zIndex: 10,
        background: "#fff",
        padding: "8px 18px",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 20,
        color: "#b80000",
        boxShadow: "0 2px 8px #b8000033"
      }}>
        Skor: {score}
      </div>
      {/* Sıfırla butonu sağ üst köşede */}
      <button
        onClick={() => {
          setScore(0);
          setFires([]);
          setGameOver(false);
          setPlaying(false);
        }}
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          zIndex: 10,
          background: "#fff",
          color: "#b80000",
          fontWeight: 700,
          fontSize: 16,
          border: "2px solid #b80000",
          borderRadius: 10,
          padding: "8px 18px",
          boxShadow: "0 2px 8px #b8000033",
          cursor: "pointer"
        }}
      >Sıfırla</button>

      {/* Mobilde sadeleştirilmiş ayarlar */}
      {/* Oyun ayarları ve zorluk göstergesi kaldırıldı */}

      {/* Start ekranı */}
      {/* Game Over ekranı */}
      {gameOver && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#3a001aee",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
        }}>
          <img src="/fireandbeaver/boom.png" alt="Patlama" style={{ width: 120, height: 120, marginBottom: 18, borderRadius: "50%", boxShadow: "0 4px 24px #b8000033", animation: "boom-anim 1.2s infinite alternate" }} />
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 32, margin: 0, marginBottom: 10, letterSpacing: 2 }}>GAME OVER</h2>
          <div style={{ color: "#fff", fontSize: 20, marginBottom: 18, textAlign: "center", maxWidth: 260 }}>
            Çok fazla ateş patladı!<br />Skorun: <b>{score}</b>
          </div>
          <button onClick={() => { setScore(0); setFires([]); setGameOver(false); setPlaying(false); }} style={{ fontSize: 22, padding: "12px 38px", borderRadius: 12, background: "#fff", color: "#b80000", fontWeight: 700, border: "none", boxShadow: "0 2px 8px #b8000033", marginBottom: 10 }}>Tekrar Oyna</button>
        </div>
      )}
      {/* Start ekranı */}
      {!playing && !gameOver && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(255,255,255,0.97)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
        }}>
          <img src="/fireandbeaver/coolbeaver.png" alt="Kunduz" style={{ width: 120, height: 120, marginBottom: 18, borderRadius: "50%", boxShadow: "0 4px 24px #b8000033" }} />
          <h2 style={{ color: "#b80000", fontWeight: 900, fontSize: 28, margin: 0, marginBottom: 10 }}>Ateş Söndürme Oyunu</h2>
          <div style={{ color: "#b80000", fontSize: 18, marginBottom: 18, textAlign: "center", maxWidth: 260 }}>
            Ekrana çıkan ateşleri hızlıca tıkla ve söndür! Ateşler patlarsa puan kaybedersin.
          </div>
          <button onClick={() => { setScore(0); setFires([]); setPlaying(true); }} style={{ fontSize: 22, padding: "12px 38px", borderRadius: 12, background: "#b80000", color: "#fff", fontWeight: 700, border: "none", boxShadow: "0 2px 8px #b8000033", marginBottom: 10 }}>Başla</button>
        </div>
      )}
      <div
        ref={containerRef}
        tabIndex={0}
        style={{
          width: 360,
          height: 600,
          maxWidth: "98vw",
          maxHeight: "90vh",
          margin: "12px auto",
          background: (() => {
            if (gameOver) return "#1a0010";
            if (flash) return "radial-gradient(circle at 50% 50%, #fffbe6 0%, #ffe066 40%, #ff3c3c 80%, #b80000 100%)";
            // Sönmeyen ateş ve skor ile renk geçişi
            const fireRatio = Math.min(fires.length, MAX_UNEXTINGUISHED) / MAX_UNEXTINGUISHED;
            const scoreRatio = Math.max(0, Math.min(1, -score / Math.abs(GAME_OVER_SCORE)));
            // Mavi -> Kırmızı -> Bordo -> Siyah
            // 0: mavi, 0.4: kırmızı, 0.7: bordo, 1: siyah
            let bg = "#1e90ff"; // Başlangıç mavi
            if (fireRatio + scoreRatio > 0.95) {
              bg = "#0a0000"; // siyaha yakın
            } else if (fireRatio + scoreRatio > 0.7) {
              bg = "#3a001a"; // bordo
            } else if (fireRatio + scoreRatio > 0.4) {
              bg = "#ff3c3c"; // kırmızı
            }
            return `linear-gradient(180deg, ${bg} 0%, #b80000 100%)`;
          })(),
          transition: flash || gameOver ? "background 0.15s" : "background 0.5s",
          border: "2px solid #a80000",
          borderRadius: 18,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 24px #0002"
        }}
        onClick={() => {}}
      >
        {/* beaver top center */}
        <div
          ref={beaverRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -54%)",
            textAlign: "center",
            pointerEvents: "none",
            width: 300,
            height: 300,
            zIndex: 1
          }}
        >
          <img src="/fireandbeaver/coolbeaver.png" alt="Kunduz" style={{ width: 300, height: 300, objectFit: "contain", boxShadow: "0 8px 32px #0003", borderRadius: "50%" }} />
        </div>

        {/* fires */}
        {fires.map((f) => (
          <div
            key={f.id}
            onClick={f.exploding ? undefined : (e) => handleClickFire(e, f.id)}
            title={f.exploding ? "Patladı!" : `${f.hitsLeft + 1} vuruş kaldı`}
            style={{
              position: "absolute",
              left: f.x - 32,
              top: f.y - 64,
              width: 64,
              height: 96,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              cursor: f.exploding ? "not-allowed" : "pointer",
              userSelect: "none",
              zIndex: 2,
              pointerEvents: f.exploding ? "none" : undefined,
              transition: f.exploding ? "transform 0.3s, opacity 0.6s" : undefined,
              transform: f.exploding ? "scale(1.3) rotate(-10deg)" : undefined,
              opacity: f.exploding ? 0.3 : 1
            }}
          >
            {f.exploding ? (
              <>
                <img src="/fireandbeaver/boom.png" alt="Boom!" style={{
                  width: 90,
                  height: 90,
                  objectFit: "contain",
                  position: "absolute",
                  left: -13,
                  top: 0,
                  zIndex: 3,
                  opacity: 0.92,
                  animation: "boom-anim 0.6s linear"
                }} />
              </>
            ) : (
              <img src="/fireandbeaver/fire.png" alt="Ateş" style={{ width: 64, height: 96, objectFit: "contain", filter: "drop-shadow(0 0 16px #ffb) drop-shadow(0 0 32px #f00)" }} />
            )}
            {!f.exploding && <div style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              width: "100%",
              textAlign: "center",
              color: '#fff',
              fontWeight: 700,
              fontSize: 20,
              textShadow: '0 2px 8px #d63900, 0 0px 2px #fff'
            }}>{f.hitsLeft + 1}</div>}
          </div>
        ))}
<style>{`
@keyframes boom-anim {
  0% { opacity: 0.2; transform: scale(0.7) rotate(-10deg); }
  60% { opacity: 1; transform: scale(1.2) rotate(8deg); }
  100% { opacity: 0.1; transform: scale(1.7) rotate(-20deg); }
}
`}</style>
      </div>

      <div style={{ marginTop: 10, color: "#333", fontSize: 14 }}>
        Kurallar: Ateşler kunduzun yanlarından çıkıyor. Bir ateşi söndürmek için iki kere tıkla (her tıklama sayılır). Söndürdüğün ateş +10 puan, süresi dolan ateş -5 puan.
      </div>
    </div>
  )
}
