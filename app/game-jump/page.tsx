"use client";

import JumpGame from "../login/components/JumpGame";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
export default function Page() {
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();
  const gameOverRef = useRef(false);

  // JumpGame'a gameOver callback'i ilet
  function JumpGameWithGameOver() {
    return <JumpGame onGameOver={() => { setGameOver(true); setStarted(false); gameOverRef.current = true; }} onScoreChange={setScore} key={restartKey} />;
  }

  return (
    <div style={{ minHeight: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {/* Skor üstte sol köşe */}
      {started && !gameOver && (
        <div style={{ position: "absolute", top: 18, left: 18, zIndex: 20, background: "#fff", color: "#1e90ff", fontWeight: 700, fontSize: 22, borderRadius: 10, padding: "6px 18px", boxShadow: "0 2px 8px #1e90ff33" }}>
          Score: {score}
        </div>
      )}
      {/* Home tuşu */}
      {started && !gameOver && (
        <button
          onClick={() => setShowMenu(true)}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            zIndex: 10,
            background: "#fff",
            color: "#1e90ff",
            fontWeight: 700,
            fontSize: 20,
            border: "2px solid #1e90ff",
            borderRadius: 10,
            padding: "8px 18px",
            boxShadow: "0 2px 8px #1e90ff33",
            cursor: "pointer"
          }}
        >Home</button>
      )}
      {/* Menü Modalı */}
      {showMenu && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(30,30,30,0.85)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
        }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 220, boxShadow: "0 4px 24px #0003", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <h3 style={{ color: "#1e90ff", fontWeight: 900, fontSize: 24, marginBottom: 18 }}>Menu</h3>
            <button onClick={() => setShowMenu(false)} style={{ fontSize: 20, padding: "10px 32px", borderRadius: 10, background: "#1e90ff", color: "#fff", fontWeight: 700, border: "none", marginBottom: 8 }}>Resume</button>
            <button onClick={() => { setShowMenu(false); setGameOver(false); setStarted(true); setRestartKey(k => k + 1); }} style={{ fontSize: 20, padding: "10px 32px", borderRadius: 10, background: "#FFD700", color: "#222", fontWeight: 700, border: "none", marginBottom: 8 }}>Restart</button>
            <button onClick={() => router.push("/")} style={{ fontSize: 20, padding: "10px 32px", borderRadius: 10, background: "#fff", color: "#b80000", fontWeight: 700, border: "2px solid #b80000" }}>Home</button>
          </div>
        </div>
      )}
      {!started && !gameOver && (
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
          <img src="/bears/happy.png" alt="Happy Beaver" style={{ width: 120, height: 120, marginBottom: 18, borderRadius: "50%", boxShadow: "0 4px 24px #1e90ff33" }} />
          <h2 style={{ color: "#1e90ff", fontWeight: 900, fontSize: 28, margin: 0, marginBottom: 10 }}>Jumping Beaver</h2>
          <div style={{ color: "#1e90ff", fontSize: 18, marginBottom: 18, textAlign: "center", maxWidth: 320 }}>
            Jump as high as you can without falling off the platforms!<br /><br />
            <b>Rules:</b><br />
            Move the beaver.<br />
            Jump up by landing on platforms.<br />
            If you fall, the game is over.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => setStarted(true)} style={{ fontSize: 22, padding: "12px 38px", borderRadius: 12, background: "#1e90ff", color: "#fff", fontWeight: 700, border: "none", boxShadow: "0 2px 8px #1e90ff33", marginBottom: 10 }}>Start</button>
            <button onClick={() => router.push("/")} style={{ fontSize: 22, padding: "12px 38px", borderRadius: 12, background: "#fff", color: "#b80000", fontWeight: 700, border: "none", boxShadow: "0 2px 8px #b8000033", marginBottom: 10 }}>Go Back</button>
          </div>
        </div>
      )}
      {started && !gameOver && <JumpGameWithGameOver />}
      {gameOver && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(30,30,30,0.97)",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
        }}>
          <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 32, margin: 0, marginBottom: 18, letterSpacing: 2 }}>GAME OVER</h2>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => { setGameOver(false); setStarted(true); setRestartKey(k => k + 1); }} style={{ fontSize: 22, padding: "12px 38px", borderRadius: 12, background: "#1e90ff", color: "#fff", fontWeight: 700, border: "none", boxShadow: "0 2px 8px #1e90ff33", marginBottom: 10 }}>Restart</button>
            <button onClick={() => router.push("/")} style={{ fontSize: 22, padding: "12px 38px", borderRadius: 12, background: "#fff", color: "#b80000", fontWeight: 700, border: "none", boxShadow: "0 2px 8px #b8000033", marginBottom: 10 }}>Go Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
