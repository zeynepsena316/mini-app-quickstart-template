"use client";
import React from "react";

type Vec = { x: number; y: number };

const TILE = 24;
const MAP_W = 15;
const MAP_H = 21;

// handcrafted maze: '#' = wall, '.' = floor
const MAP_STR = [
  "###############",
  "#.............#",
  "#.###.###.###.#",
  "#.#.#.#.#.#.#.#",
  "#.#.#.#.#.#.#.#",
  "#...#.....#...#",
  "###.#.###.#.###",
  "#.....#.#.....#",
  "#.#####.#####.#",
  "#.............#",
  "#.###.#.#.###.#",
  "#.#...#.#...#.#",
  "#.#.#####.#.#.#",
  "#.#.......#.#.#",
  "#.#########.#.#",
  "#.............#",
  "###.####.#######",
  "#.............#",
  "#.###########.#",
  "#.............#",
  "###############",
];

// 0 = floor, 1 = wall
const MAP: number[] = [];
for (let r = 0; r < MAP_H; r++) {
  for (let c = 0; c < MAP_W; c++) {
    MAP.push(MAP_STR[r][c] === "#" ? 1 : 0);
  }
}

function idx(x: number, y: number) {
  return y * MAP_W + x;
}

export default function Game() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = React.useState(true);
  const [anxiety, setAnxiety] = React.useState(0); // 0 - 100
  const [message, setMessage] = React.useState<string | null>(null);
  const [lives, setLives] = React.useState(3);
  const [score, setScore] = React.useState(0);
  const [runKey, setRunKey] = React.useState(0);
  const anxietyRef = React.useRef(anxiety);
  React.useEffect(() => { anxietyRef.current = anxiety; }, [anxiety]);

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = MAP_W * TILE;
    canvas.height = MAP_H * TILE;

    // preload images
    const playerImg = new Image();
    playerImg.src = "/bears/sad.png";
    const ghostImg = new Image();
    ghostImg.src = "/bears/scared.png";

    let req = 0;
    const startPos = { x: 2 * TILE + TILE / 2, y: 2 * TILE + TILE / 2 };
    const player: Vec & { speed: number; invulnerableUntil?: number } = { x: startPos.x, y: startPos.y, speed: 2 };
    const ghostSpawns = [
      { x: 11 * TILE + TILE / 2, y: 3 * TILE + TILE / 2 },
      { x: 12 * TILE + TILE / 2, y: 16 * TILE + TILE / 2 },
      { x: 7 * TILE + TILE / 2, y: 9 * TILE + TILE / 2 },
    ];
    const ghosts: Array<Vec & { vx: number; vy: number; speed: number; disabledUntil?: number; target?: {x:number;y:number}; lastPick?: number }> = ghostSpawns.map((p, i) => ({ x: p.x, y: p.y, vx: 0, vy: 0, speed: 0.55 + i * 0.08, target: undefined, lastPick: performance.now() }));

    let last = performance.now();
    let keys: Record<string, boolean> = {};
    let pausedUntil = 0; // breathe pause

    function handleKey(e: KeyboardEvent) {
      if (e.type === "keydown") keys[e.key] = true;
      else keys[e.key] = false;
      // Space = stop & breathe mechanic
      if (e.type === "keydown" && e.key === " ") {
        // prevent default page scroll
        e.preventDefault();
        // attempt a timed breath: reduces anxiety if not too close to a ghost
        const now = performance.now();
        pausedUntil = now + 3000; // 3s pause
        // check distances
        const close = ghosts.some((g) => distance(g, player) < 80 && (!g.disabledUntil || g.disabledUntil < now));
        if (!close) {
          setAnxiety((a) => Math.max(0, a - 20));
          setMessage("You breathed — calmer now");
          setTimeout(() => setMessage(null), 1500);
        } else {
          setAnxiety((a) => Math.min(100, a + 10));
          setMessage("Too close — not safe to breathe!");
          setTimeout(() => setMessage(null), 1500);
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);

    function distance(a: Vec, b: Vec) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function tileAtXY(x: number, y: number) {
      const tx = Math.floor(x / TILE);
      const ty = Math.floor(y / TILE);
      if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 1;
      return MAP[idx(tx, ty)];
    }

    // BFS pathfinder on grid to get the next step from start tile to target tile
    function nextStepTowards(sx: number, sy: number, tx: number, ty: number) {
      const start = { x: sx, y: sy };
      const goal = { x: tx, y: ty };
      const q: Array<{ x: number; y: number }> = [start];
      const prev = new Map<string, string | null>();
      const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
      prev.set(key(start), null);
      const dirs = [ [1,0],[-1,0],[0,1],[0,-1] ];
      while (q.length) {
        const p = q.shift()!;
        if (p.x === goal.x && p.y === goal.y) break;
        for (const d of dirs) {
          const nx = p.x + d[0];
          const ny = p.y + d[1];
          if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
          if (MAP[idx(nx, ny)] === 1) continue;
          const k = `${nx},${ny}`;
          if (prev.has(k)) continue;
          prev.set(k, key(p));
          q.push({ x: nx, y: ny });
        }
      }
      // reconstruct: build path from goal back to start, then return the tile right after the start
      const kGoal = key(goal);
      if (!prev.has(kGoal)) return null;
      const path: string[] = [];
      let curKey: string | undefined = kGoal;
      while (curKey) {
        path.push(curKey);
        curKey = prev.get(curKey) ?? undefined;
      }
      // path is [goal, ..., start]; if length < 2 no step
      if (path.length < 2) return null;
      const nextKey = path[path.length - 2]; // the tile just after start
      const [nx, ny] = nextKey.split(",").map((v) => parseInt(v, 10));
      return { x: nx, y: ny };
    }

    let lastPowerSpawn = 0;
    const powerUps: Array<{ x: number; y: number; type: string; taken?: boolean }> = [];
    // pellets collectible like pac-man dots
    const pellets: Array<{ tx: number; ty: number; taken?: boolean }> = [];
    for (let ry = 1; ry < MAP_H - 1; ry++) {
      for (let rx = 1; rx < MAP_W - 1; rx++) {
        if (MAP[idx(rx, ry)] === 0) {
          // avoid spawning on start or ghost spawns
          if ((rx === 2 && ry === 2) || (rx === 11 && ry === 3) || (rx === 12 && ry === 16) || (rx ===7 && ry ===9)) continue;
          pellets.push({ tx: rx, ty: ry });
        }
      }
    }

    function spawnPower() {
      // pick a random empty tile
      for (let i = 0; i < 20; i++) {
        const rx = 1 + Math.floor(Math.random() * (MAP_W - 2));
        const ry = 1 + Math.floor(Math.random() * (MAP_H - 2));
        if (MAP[idx(rx, ry)] === 0) {
          const types = ["coffee", "breath", "music", "journal"];
          powerUps.push({ x: rx * TILE + TILE / 2, y: ry * TILE + TILE / 2, type: types[Math.floor(Math.random() * types.length)] });
          break;
        }
      }
    }

    let powerTimers: any = { coffee: 0, breath: 0, journalGhostDisabledUntil: 0 };

    function step(now: number) {
      const dt = Math.min(40, now - last) / 16.67; // normalize to ~60fps
      last = now;

      // controls lag when anxiety high (simulate small delay)
      const curAnx = anxietyRef.current;
      const controlLag = curAnx > 70 ? 80 : curAnx > 40 ? 30 : 0;

      // handle input, respect pause
      if (now > pausedUntil) {
        let dx = 0;
        let dy = 0;
        if (keys.ArrowUp || keys.w) dy -= 1;
        if (keys.ArrowDown || keys.s) dy += 1;
        if (keys.ArrowLeft || keys.a) dx -= 1;
        if (keys.ArrowRight || keys.d) dx += 1;
        if (dx !== 0 || dy !== 0) {
          const mag = Math.sqrt(dx * dx + dy * dy) || 1;
          const anxietySlow = curAnx > 70 ? 0.6 : curAnx > 40 ? 0.85 : 1;
          const speedMult = (powerTimers.coffee > now ? 1.8 : 1) * anxietySlow;
          // dash (Shift) to run away — gives a temporary speed boost
          const shiftMultiplier = keys.Shift ? 1.6 : 1;
          // fleeing assist: if moving away from nearest ghost while dashing, give additional boost
          let fleeBoost = 1;
          if (keys.Shift) {
            // find nearest active ghost
            let nearest: (typeof ghosts)[0] | null = null;
            let best = Infinity;
            for (const g of ghosts) {
              const d = Math.hypot(g.x - player.x, g.y - player.y);
              if (d < best) { best = d; nearest = g; }
            }
            if (nearest && best < 160) {
              // vector away
              const awayX = player.x - nearest.x;
              const awayY = player.y - nearest.y;
              const dot = (dx / mag) * (awayX / Math.hypot(awayX, awayY) || 0) + (dy / mag) * (awayY / Math.hypot(awayX, awayY) || 0);
              if (dot > 0.3) fleeBoost = 1.25;
            }
          }
          // attempt to move but block on walls per axis
          const nextX = player.x + (dx / mag) * player.speed * speedMult * shiftMultiplier * fleeBoost * dt * 8;
          const nextY = player.y + (dy / mag) * player.speed * speedMult * shiftMultiplier * fleeBoost * dt * 8;
          // check X move alone
          if (tileAtXY(nextX, player.y) === 0) player.x = nextX;
          // check Y move alone
          if (tileAtXY(player.x, nextY) === 0) player.y = nextY;
        }
      }

      // clamp player inside
      player.x = Math.max(12, Math.min(player.x, canvas.width - 12));
      player.y = Math.max(12, Math.min(player.y, canvas.height - 12));

      // update ghosts: passive roaming / patrol behavior (do NOT aggressively chase the player)
      for (const g of ghosts) {
        const nowTime = performance.now();
        if (g.disabledUntil && g.disabledUntil > nowTime) continue;
        // pick a random floor tile every 2-4s
        if (!g.target || nowTime - (g.lastPick || 0) > 2000 + Math.random() * 2000) {
          // pick random floor tile
          let tries = 0;
          while (tries++ < 40) {
            const rx = 1 + Math.floor(Math.random() * (MAP_W - 2));
            const ry = 1 + Math.floor(Math.random() * (MAP_H - 2));
            if (MAP[idx(rx, ry)] === 0) { g.target = { x: rx, y: ry }; g.lastPick = nowTime; break; }
          }
        }
        // follow the target via grid steps
        const tx = Math.floor(g.x / TILE);
        const ty = Math.floor(g.y / TILE);
        let targX = g.x;
        let targY = g.y;
        if (g.target) {
          const next = nextStepTowards(tx, ty, g.target.x, g.target.y);
          if (next) { targX = next.x * TILE + TILE / 2; targY = next.y * TILE + TILE / 2; }
        }
        // small random jitter to feel organic
        targX += (Math.random() - 0.5) * 4;
        targY += (Math.random() - 0.5) * 4;
        const dx = targX - g.x;
        const dy = targY - g.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const speedFactor = powerTimers.breath > nowTime ? 0.6 : 1;
        // intentionally slow, non-aggressive speeds
        g.vx = (dx / dist) * (g.speed * 0.7) * speedFactor;
        g.vy = (dy / dist) * (g.speed * 0.7) * speedFactor;
        g.x += g.vx * dt * 6;
        g.y += g.vy * dt * 6;
        g.x = Math.max(12, Math.min(g.x, canvas.width - 12));
        g.y = Math.max(12, Math.min(g.y, canvas.height - 12));
      }

      // anxiety changes based on proximity and collisions
      let a = 0;
      const nowTime = performance.now();
      for (const g of ghosts) {
        if (g.disabledUntil && g.disabledUntil > nowTime) continue;
        const d = distance(g, player);
        if (d < 12 && (!player.invulnerableUntil || player.invulnerableUntil < nowTime)) {
          // collision: lose life
          setLives((l) => {
            const nl = l - 1;
            setMessage("You were caught!");
            setTimeout(() => setMessage(null), 1200);
            if (nl <= 0) {
              setAnxiety(100);
              setRunning(false);
            } else {
              // reset positions and temporary invulnerability
              player.x = startPos.x; player.y = startPos.y;
              let i = 0;
              for (const s of ghostSpawns) { ghosts[i].x = s.x; ghosts[i].y = s.y; i++; }
              player.invulnerableUntil = performance.now() + 1500;
              setAnxiety((_) => Math.min(100, 50));
            }
            return nl;
          });
        }
        if (d < 220) {
          a += Math.max(0, (220 - d) / 220) * 0.9; // accumulate per ghost (stronger anxiety since ghosts are passive)
        }
      }
      // music reduces anxiety when picked; otherwise anxiety slowly decays a bit
      setAnxiety((prev) => Math.max(0, Math.min(100, prev + a - 0.02)));

      // handle power-up collisions
      for (const p of powerUps) {
        if (p.taken) continue;
        const d = distance(p as Vec, player);
        if (d < 24) {
          p.taken = true;
          // apply effect
          const now = performance.now();
          if (p.type === "coffee") powerTimers.coffee = now + 5000;
          if (p.type === "breath") powerTimers.breath = now + 5000;
          if (p.type === "music") setAnxiety((v) => Math.max(0, v - 25));
          if (p.type === "journal") {
            // disable the nearest ghost temporarily
            let nearest = ghosts[0];
            let best = Infinity;
            for (const g of ghosts) {
              const d2 = distance(g, player);
              if (d2 < best) { best = d2; nearest = g; }
            }
            nearest.disabledUntil = now + 6000;
          }
        }
      }

      // pellet pickups
      const ptx = Math.floor(player.x / TILE);
      const pty = Math.floor(player.y / TILE);
      for (const pel of pellets) {
        if (pel.taken) continue;
        if (pel.tx === ptx && pel.ty === pty) {
          pel.taken = true;
          setScore((s) => s + 10);
          setAnxiety((a) => Math.max(0, a - 1));
        }
      }

      // spawn powers occasionally
      if (now - lastPowerSpawn > 4000 && powerUps.filter(p => !p.taken).length < 3) { spawnPower(); lastPowerSpawn = now; }

      // draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // map
      for (let ry = 0; ry < MAP_H; ry++) {
        for (let rx = 0; rx < MAP_W; rx++) {
          const v = MAP[idx(rx, ry)];
          if (v === 1) { ctx.fillStyle = "#0f172a"; ctx.fillRect(rx * TILE, ry * TILE, TILE, TILE); }
          else if (v === 2) { ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(rx * TILE, ry * TILE, TILE, TILE); }
        }
      }

      // draw powerups
      for (const p of powerUps) {
        if (p.taken) continue;
        ctx.beginPath();
        ctx.fillStyle = p.type === "coffee" ? "#f59e0b" : p.type === "breath" ? "#10b981" : p.type === "music" ? "#60a5fa" : "#a78bfa";
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw pellets (small dots)
      for (const pel of pellets) {
        if (pel.taken) continue;
        const cx = pel.tx * TILE + TILE / 2;
        const cy = pel.ty * TILE + TILE / 2;
        ctx.fillStyle = "#fde68a";
        ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
      }

      // draw ghosts
      for (const g of ghosts) {
        const nowTime = performance.now();
        ctx.save();
        if (g.disabledUntil && g.disabledUntil > nowTime) {
          ctx.globalAlpha = 0.25;
        }
        // ghost sprite fallback (if image loaded draw it)
        if (ghostImg.complete && ghostImg.naturalWidth) {
          const s = 36;
          ctx.drawImage(ghostImg, g.x - s / 2, g.y - s / 2 - 6, s, s);
        } else {
          ctx.beginPath();
          ctx.fillStyle = "rgba(180,200,255,0.95)";
          ctx.arc(g.x, g.y - 4, 14, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(g.x - 14, g.y - 4, 28, 18);
          // eyes
          ctx.fillStyle = "#06202a";
          ctx.beginPath(); ctx.ellipse(g.x - 6, g.y - 6, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(g.x + 6, g.y - 6, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      // draw player (kunduz) - prefer sprite
      if (playerImg.complete && playerImg.naturalWidth) {
        const s = 36;
        ctx.drawImage(playerImg, player.x - s / 2, player.y - s / 2 - 2, s, s);
      } else {
        ctx.save();
        const nowTimeForDraw = performance.now();
        if (player.invulnerableUntil && player.invulnerableUntil > nowTimeForDraw) ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.fillStyle = "#b5651d"; ctx.arc(player.x, player.y, 14, 0, Math.PI * 2); ctx.fill();
        // eyes & sweat when anxious
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(player.x - 5, player.y - 4, 3, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(player.x + 5, player.y - 4, 3, 4, 0, 0, Math.PI*2); ctx.fill();
        if (anxiety > 50) { ctx.fillStyle = "#7dd3fc"; ctx.beginPath(); ctx.ellipse(player.x + 10, player.y - 10, 3, 6, 0, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
      }

      // HUD
      // anxiety bar
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(8, 8, canvas.width - 16, 12);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(8, 8, ((canvas.width - 16) * anxiety) / 100, 12);
      ctx.strokeStyle = "#0f172a";
      ctx.strokeRect(8, 8, canvas.width - 16, 12);
      ctx.fillStyle = "#0f172a";
      ctx.fillText(`${Math.round(anxiety)}%`, canvas.width - 44, 18);

      // lives (hearts)
      for (let i = 0; i < lives; i++) {
        const hx = 12 + i * 18;
        const hy = 28;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(hx+8, hy, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(hx, hy, 12, 10);
      }
      // score
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`Score: ${score}`, canvas.width - 90, 28);

      // messages
      if (message) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(canvas.width / 2 - 120, 28, 240, 28);
        ctx.fillStyle = "#fff";
        ctx.fillText(message, canvas.width / 2 - 100, 46);
      }

      // apply visual effects when anxiety high
      if (anxiety >= 100) {
        // game over
        setRunning(false);
        setMessage("Overwhelmed — game over");
        // show a short reflective line
        setTimeout(() => setMessage("Kaçmak bazen iyidir, ama yüzleşmek kazandırır."), 1600);
      }

      req = requestAnimationFrame(step);
    }

    req = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(req);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
    };
  }, [runKey]);

  const vignette = anxiety > 70;

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <h2 className="text-xl font-bold">Mini Anxiety Game — Prototype</h2>
      <div className="relative bg-white/5 p-2 rounded shadow-inner">
        <canvas ref={canvasRef} style={{ width: MAP_W * TILE, height: MAP_H * TILE, imageRendering: 'pixelated' }} />
        {vignette && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(3px) brightness(0.8)' }} />
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <button onClick={() => { setAnxiety(0); setMessage(null); setRunning(true); setLives(3); setScore(0); setRunKey(k => k + 1); }} className="px-4 py-2 bg-cyan-500 rounded text-white">Restart</button>
        <div className="text-sm text-gray-300">Controls: Arrow keys / WASD — Shift: Dash — Space: Stop & Breathe</div>
      </div>
      <div className="text-sm text-gray-200 mt-1">Lives: <strong>{lives}</strong> — Score: <strong>{score}</strong></div>
      {!running && (
        <div className="mt-2 text-sm text-yellow-200">Kaçmak bazen iyidir, ama yüzleşmek kazandırır.</div>
      )}
      <div className="text-xs text-gray-400 mt-2">Power-ups: Coffee (speed), Breath (slow ghosts), Music (reduce anxiety), Journal (disable ghost)</div>
    </div>
  );
}
