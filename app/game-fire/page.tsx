"use client"

import React, { useEffect, useRef, useState } from "react"

type Fire = {
  id: number
  x: number
  y: number
  hitsLeft: number
  timeoutId?: number
}

export default function GameFirePage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const beaverRef = useRef<HTMLDivElement | null>(null)
  const nextId = useRef(1)
  const timers = useRef<Record<number, number>>({})
  const [fires, setFires] = useState<Fire[]>([])
  const [playing, setPlaying] = useState(false)
  const [score, setScore] = useState(0)
  // Mobil/dikey için daha hızlı ve kısa süreli ateşler
  const [spawnInterval, setSpawnInterval] = useState(450) // ms between spawns (daha hızlı)
  const [fireLifespan, setFireLifespan] = useState(800) // ms before it burns out (daha kısa)
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
    // spawn near beaver: left or right side randomly
    const rect = el.getBoundingClientRect()
    // Kunduzun çevresinde, ekranın üst yarısında rastgele konum
    let baseX = rect.width / 2
    let baseY = rect.height * 0.38
    if (beaverRef.current) {
      const brect = beaverRef.current.getBoundingClientRect()
      baseX = (brect.left - rect.left) + brect.width / 2
      baseY = (brect.top - rect.top) + brect.height * 0.45
    }
    // Ekranın üst yarısında, kunduzun çevresinde random
    const angle = Math.random() * Math.PI * 2
    const radius = 90 + Math.random() * 60
    const x = Math.max(36, Math.min(rect.width - 36, baseX + Math.cos(angle) * radius))
    const y = Math.max(36, Math.min(rect.height * 0.7, baseY + Math.sin(angle) * radius))
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
        // penalize for unsmitten fire
        setScore((sc) => sc - 5)
        return prev.filter((f) => f.id !== id)
      })
      delete timers.current[id]
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <div style={{ background: "#fff", padding: 8, borderRadius: 6 }}>
            <strong>Skor:</strong> {score}
          </div>
          <div style={{ background: "#fff", padding: 8, borderRadius: 6 }}>
            <strong>Aktif Ateş:</strong> {fires.length}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
          {!playing ? (
            <button onClick={() => { setScore(0); setPlaying(true); }} style={{ fontSize: 18, padding: "8px 24px", borderRadius: 8, background: "#fff", color: "#b80000", fontWeight: 700, border: "2px solid #b80000", boxShadow: "0 2px 8px #b8000033" }}>Başlat</button>
          ) : (
            <button onClick={() => setPlaying(false)} style={{ fontSize: 16, padding: "7px 18px", borderRadius: 8, background: "#fff", color: "#b80000", fontWeight: 700, border: "2px solid #b80000" }}>Durdur</button>
          )}
          <button onClick={() => { setScore(0); setFires([]); clearAllFireTimers(); }} style={{ fontSize: 16, padding: "7px 18px", borderRadius: 8, background: "#fff", color: "#b80000", fontWeight: 700, border: "2px solid #b80000" }}>Sıfırla</button>
        </div>
      </div>

      {/* Mobilde sadeleştirilmiş ayarlar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center", fontSize: 13 }}>
        <span>Spawn: {spawnInterval} ms</span>
        <input type="range" min={200} max={1500} step={50} value={spawnInterval}
          onChange={(e) => setSpawnInterval(Number(e.target.value))} style={{ width: 80 }} />
        <span>Ömür: {fireLifespan} ms</span>
        <input type="range" min={400} max={2000} step={50} value={fireLifespan}
          onChange={(e) => setFireLifespan(Number(e.target.value))} style={{ width: 80 }} />
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        style={{
          width: 360,
          height: 600,
          maxWidth: "98vw",
          maxHeight: "90vh",
          margin: "12px auto",
          background: "linear-gradient(180deg, #ff3c3c 0%, #b80000 100%)",
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
            onClick={(e) => handleClickFire(e, f.id)}
            title={`${f.hitsLeft + 1} vuruş kaldı`}
            style={{
              position: "absolute",
              left: f.x - 32,
              top: f.y - 64,
              width: 64,
              height: 96,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              cursor: "pointer",
              userSelect: "none",
              zIndex: 2
            }}
          >
            <img src="/fireandbeaver/fire.png" alt="Ateş" style={{ width: 64, height: 96, objectFit: "contain", filter: "drop-shadow(0 0 16px #ffb) drop-shadow(0 0 32px #f00)" }} />
            <div style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              width: "100%",
              textAlign: "center",
              color: '#fff',
              fontWeight: 700,
              fontSize: 20,
              textShadow: '0 2px 8px #d63900, 0 0px 2px #fff'
            }}>{f.hitsLeft + 1}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, color: "#333", fontSize: 14 }}>
        Kurallar: Ateşler kunduzun yanlarından çıkıyor. Bir ateşi söndürmek için iki kere tıkla (her tıklama sayılır). Söndürdüğün ateş +10 puan, süresi dolan ateş -5 puan.
      </div>
    </div>
  )
}
