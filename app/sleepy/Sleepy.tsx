"use client";
import React from "react";

export default function Sleepy() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const scoreRef = React.useRef(0);
  const [displayScore, setDisplayScore] = React.useState(0);
  const [gameOver, setGameOver] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(true);
  const [showHomeModal, setShowHomeModal] = React.useState(false);

  React.useEffect(() => {
      // Arka plan görseli
      const bgImg = new Image();
      bgImg.src = "/bears/night.jpg";
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    // Sabit mobil boyut: 360x640 (9:16 aspect ratio)
    canvas.width = 360;
    canvas.height = 640;

    // Görseller
    const playerImg = new Image();
    playerImg.src = "/bears/sleepy.png";
    
    const coffeeImg = new Image();
    coffeeImg.src = "/bears/coffee-emoji.svg"; // Çizilmiş kahve emojisi
    
        const pillowImg = new Image();
        pillowImg.src = "/bears/pillow.png";

    let player = { x: canvas.width / 2, y: canvas.height - 100, width: 60, height: 60, speed: 6 };
    let keys: Record<string, boolean> = {};
    
    // Düşen objeler
    type FallingItem = { x: number; y: number; type: "coffee" | "pillow"; speed: number; size: number };
    let items: FallingItem[] = [];
    let lastSpawn = 0;
    let gameSpeed = 1;
    let startTime = performance.now();

    // Ses efekti
    const audioCtx = typeof window !== 'undefined' && (new (window.AudioContext || (window as any).webkitAudioContext)());
    function playGameOverSound() {
      if (!audioCtx) return;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = 200;
      g.gain.value = 0.1;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      o.stop(audioCtx.currentTime + 0.6);
    }

    function playCoffeeSound() {
      if (!audioCtx) return;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'square';
      o.frequency.value = 800;
      g.gain.value = 0.05;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 0.1);
    }

    function handleKey(e: KeyboardEvent) {
      if (gameOver) return;
      if (e.type === "keydown") keys[e.key] = true;
      else keys[e.key] = false;
    }

    function handleTouchMove(e: TouchEvent) {
      if (gameOver || !running) return;
      if (e.touches.length === 0) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - canvasRect.left;
      
      // Sol taraf (< 1/3) - sola hareket
      if (touchX < canvas.width / 3) {
        player.x -= player.speed * 1.5;
      }
      // Sağ taraf (> 2/3) - sağa hareket
      else if (touchX > (canvas.width * 2) / 3) {
        player.x += player.speed * 1.5;
      }
      
      player.x = Math.max(player.width / 2, Math.min(player.x, canvas.width - player.width / 2));
    }

    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });

    let req = 0;
    let last = performance.now();

    function step(now: number) {
      const dt = Math.min(40, now - last) / 16.67;
      last = now;

      if (!running || gameOver) {
        req = requestAnimationFrame(step);
        return;
      }

      // Oyuncu hareketi (sadece sağ/sol)
      if (keys.ArrowLeft || keys.a) player.x -= player.speed * dt;
      if (keys.ArrowRight || keys.d) player.x += player.speed * dt;
      player.x = Math.max(player.width / 2, Math.min(player.x, canvas.width - player.width / 2));

      // Zamana göre hız artışı (her 5 saniyede %25 hızlanır)
      const elapsedSeconds = (now - startTime) / 1000;
      gameSpeed = 1 + Math.floor(elapsedSeconds / 5) * 0.25;

      // Obje spawn (kahve ve yatak)
      if (now - lastSpawn > 800 / gameSpeed) {
        // Daha fazla yatak gelsin: kahve olma ihtimali %35'e düşürüldü
        const type = Math.random() > 0.65 ? "coffee" : "pillow";
        const x = Math.random() * (canvas.width - 60) + 30;
        const size = type === "coffee" ? 40 : 50;
        items.push({ x, y: -30, type, speed: 2.5 + gameSpeed * 0.5, size });
        lastSpawn = now;
      }

      // Objeleri hareket ettir ve çarpışma kontrolü
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += item.speed * dt;

        // Çarpışma kontrolü
        const dist = Math.sqrt((item.x - player.x) ** 2 + (item.y - player.y) ** 2);
        if (dist < (player.width / 2 + item.size / 2)) {
          if (item.type === "coffee") {
            // Kahve topladı - puan (oyun devam eder)
            playCoffeeSound();
            scoreRef.current += 10;
            items.splice(i, 1);
          } else {
            // Yatağa çarptı - oyun bitti
            playGameOverSound();
            setGameOver(true);
            setRunning(false);
            setDisplayScore(scoreRef.current);
          }
        } else if (item.y > canvas.height + 50) {
          // Ekrandan çıktı
          items.splice(i, 1);
        }
      }

      // Çizim
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Arka plan görseli (night.jpg)
      if (bgImg.complete && bgImg.naturalWidth) {
        // Alttan %15'lik kısmı kırp
        const cropHeight = bgImg.naturalHeight * 0.85;
        ctx.drawImage(
          bgImg,
          0, 0, bgImg.naturalWidth, cropHeight, // Kaynak (orijinal görseldeki dikdörtgen)
          0, 0, canvas.width, canvas.height     // Canvas'a tam oturacak şekilde
        );
      } else {
        // Yüklenmezse eski gradient yedek
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(1, "#1e293b");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Düşen objeler (görseller)
      for (const item of items) {
        const img = item.type === "coffee" ? coffeeImg : pillowImg;
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, item.x - item.size / 2, item.y - item.size / 2, item.size, item.size);
        } else {
          // Yüklenmemişse emoji fallback - daha güzel gösterimi
          ctx.font = "bold 48px Arial";
          ctx.textAlign = "center";
          if (item.type === "coffee") {
            ctx.fillText("☕", item.x, item.y + 15);
          } else {
            ctx.fillText("🛏️", item.x, item.y + 15);
          }
          ctx.textAlign = "left";
        }
      }

      // Oyuncu karakteri
      if (playerImg.complete && playerImg.naturalWidth) {
        ctx.drawImage(playerImg, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
      } else {
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText(gameOver ? "😴" : "😵‍💫", player.x, player.y + 15);
        ctx.textAlign = "left";
      }

      // Sağ üst köşede skor ve hız göstergesi
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(canvas.width - 120, 10, 110, 70);
      
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`☕ ${scoreRef.current}`, canvas.width - 110, 35);
      
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";
      ctx.fillText(`Hız: ${gameSpeed.toFixed(1)}x`, canvas.width - 110, 60);
      
      ctx.textAlign = "left"; // Reset

      req = requestAnimationFrame(step);
    }

    req = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [running, gameOver]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 min-h-screen overflow-hidden">
      {/* Başlangıç menüsü */}
      {showMenu && !gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-gradient-to-b from-amber-600 to-amber-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 max-w-[320px]">
            <div className="text-6xl mb-4">☕</div>
            <h2 className="text-3xl text-white font-bold text-center">Coffee Run</h2>
            <p className="text-white text-center text-lg leading-relaxed">
              Finals week! Collect coffee and don't fall asleep! Avoid the pillows or you'll doze off!
            </p>
            <div className="w-full flex flex-col gap-3">
              <button
                className="w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-amber-900 rounded-lg font-bold text-lg transition transform hover:scale-105"
                onClick={() => { 
                  scoreRef.current = 0;
                  setDisplayScore(0);
                  setGameOver(false);
                  setRunning(true);
                  setShowMenu(false);
                }}
              >Start Game</button>
              <button
                className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-lg transition"
                onClick={() => { window.location.href = "/"; }}
              >Back to Home</button>
            </div>
            <div className="text-white text-sm text-center pt-4 border-t border-amber-500">
              <p>Touch left to move left</p>
              <p>Touch right to move right</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Home icon top-right */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={() => { setRunning(false); setShowHomeModal(true); }}
          className="bg-white text-slate-800 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-slate-200 focus:outline-none"
          aria-label="Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-7.5L21 12M4.5 10.5V19a1.5 1.5 0 001.5 1.5h3.75m6 0H18a1.5 1.5 0 001.5-1.5v-8.5" />
          </svg>
        </button>
      </div>
      {/* Home modal */}
      {showHomeModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 min-w-[260px] max-w-[90vw]">
            <div className="text-3xl text-slate-800 font-bold mb-2">Game Paused</div>
            <div className="flex flex-col gap-3 w-full">
              <button
                className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold text-lg transition"
                onClick={() => { window.location.href = "/"; }}
              >Return to Menu</button>
              <button
                className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-lg transition"
                onClick={() => { setShowHomeModal(false); setRunning(true); }}
              >Resume Game</button>
              <button
                className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-lg transition"
                onClick={() => {
                  scoreRef.current = 0;
                  setDisplayScore(0);
                  setGameOver(false);
                  setRunning(true);
                  setShowHomeModal(false);
                }}
              >Restart Game</button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-white mt-4">☕ Coffee Run ☕</h1>
      <p className="text-slate-300 text-center max-w-md px-4">
        Finals week! Collect coffee and don't fall asleep! Avoid the pillows or you'll doze off!
      </p>
      <div className="relative bg-slate-800 rounded-3xl shadow-2xl overflow-hidden" style={{ width: '360px', height: '640px' }}>
        <canvas ref={canvasRef} className="block" />
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center flex-col bg-black/80 rounded">
            <div className="text-6xl mb-4">😴</div>
            <div className="text-white text-3xl font-bold mb-2">GAME OVER</div>
            <div className="text-yellow-300 text-xl mb-4">You fell asleep!</div>
            <div className="text-white text-2xl mb-6">Total Coffee: {displayScore}</div>
            <button 
              onClick={() => { 
                scoreRef.current = 0;
                setDisplayScore(0); 
                setGameOver(false); 
                setRunning(true); 
              }} 
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg text-white font-bold text-lg transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <div className="text-slate-300 text-sm text-center mt-2">
        <div className="text-amber-400">The game speeds up over time!</div>
      </div>
    </div>
  );
}
