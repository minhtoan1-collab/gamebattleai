import { useEffect, useRef } from "react";

/* ── Particle canvas overlay ─────────────────────────────── */
function ParticleCanvas({ color, count = 30 }: { color: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.2),
      alpha: Math.random() * 0.6 + 0.1,
      life: Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.004;
        if (p.life > 1) {
          p.life = 0;
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
        }
        const a = Math.sin(p.life * Math.PI) * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(a * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color, count]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ── Silhouette trees / ruins ────────────────────────────── */
function NatureTrees() {
  return (
    <svg viewBox="0 0 1280 320" className="absolute bottom-0 left-0 w-full" style={{ height: "45%" }} preserveAspectRatio="none">
      {/* Far trees */}
      {[60,180,320,480,640,800,960,1100,1220].map((x,i) => (
        <g key={i} transform={`translate(${x},0)`} style={{ animation: `sway ${2.5+i*0.3}s ease-in-out infinite alternate`, transformOrigin: `${x}px 220px` }}>
          <polygon points={`0,220 ${15+i%3*5},${120-i%4*10} ${30+i%3*5},220`} fill="rgba(0,20,5,0.7)" />
          <polygon points={`5,185 ${20+i%4*4},${80-i%3*15} ${35+i%4*4},185`} fill="rgba(0,30,8,0.5)" />
        </g>
      ))}
      {/* Ground */}
      <rect x="0" y="280" width="1280" height="40" fill="rgba(0,15,3,0.8)" />
    </svg>
  );
}

function DarkCastle() {
  return (
    <svg viewBox="0 0 1280 320" className="absolute bottom-0 left-0 w-full" style={{ height: "50%" }} preserveAspectRatio="none">
      <g fill="rgba(15,5,25,0.85)">
        {/* Main tower */}
        <rect x="560" y="40" width="160" height="260" />
        <polygon points="560,40 640,0 720,40" />
        {/* Battlements */}
        {[560,580,600,620,640,660,680,700].map((x,i) => i%2===0 && <rect key={x} x={x} y="30" width="16" height="20" />)}
        {/* Side walls */}
        <rect x="400" y="140" width="160" height="160" />
        <rect x="720" y="140" width="160" height="160" />
        {/* Windows - glowing */}
        <rect x="610" y="100" width="30" height="40" fill="rgba(120,60,180,0.5)" />
        <rect x="655" y="100" width="30" height="40" fill="rgba(120,60,180,0.5)" />
        <rect x="450" y="175" width="25" height="35" fill="rgba(80,40,120,0.4)" />
        <rect x="755" y="175" width="25" height="35" fill="rgba(80,40,120,0.4)" />
        {/* Ground */}
        <rect x="0" y="280" width="1280" height="40" />
      </g>
    </svg>
  );
}

function DragonCave() {
  return (
    <svg viewBox="0 0 1280 320" className="absolute bottom-0 left-0 w-full" style={{ height: "50%" }} preserveAspectRatio="none">
      <g fill="rgba(30,5,0,0.85)">
        {/* Rocky peaks */}
        <polygon points="0,320 0,180 100,80 200,160 300,60 400,140 500,30 600,120 700,40 800,130 900,50 1000,150 1100,70 1200,160 1280,100 1280,320" />
        {/* Lava glow at bottom */}
        <rect x="0" y="300" width="1280" height="20" fill="rgba(200,60,0,0.4)" />
        {/* Cave mouth */}
        <ellipse cx="640" cy="290" rx="120" ry="60" fill="rgba(150,30,0,0.6)" />
        <ellipse cx="640" cy="300" rx="90" ry="40" fill="rgba(200,80,0,0.4)" />
      </g>
      {/* Fire particles inside cave */}
      {[600,620,640,660,680].map((x,i) => (
        <ellipse key={x} cx={x} cy={295-i*3} rx="8" ry="12" fill={`rgba(255,${100+i*30},0,0.3)`}
          style={{ animation: `flicker ${0.6+i*0.1}s ease-in-out infinite alternate` }} />
      ))}
    </svg>
  );
}

function SteampunkCity() {
  return (
    <svg viewBox="0 0 1280 320" className="absolute bottom-0 left-0 w-full" style={{ height: "50%" }} preserveAspectRatio="none">
      <g fill="rgba(20,12,0,0.85)">
        {/* Factory buildings */}
        {[0,150,280,420,560,700,840,980,1120].map((x,i) => (
          <rect key={x} x={x} y={200-i%3*40} width={120+i%2*30} height={120+i%3*40} />
        ))}
        {/* Chimneys */}
        {[30,80,200,260,310,450,590,640,710,850,900,1010,1150].map((x,i) => (
          <g key={x}>
            <rect x={x} y={120-i%4*20} width={12} height={80+i%4*20} />
            {/* Smoke */}
            <ellipse cx={x+6} cy={115-i%4*20} rx="10" ry="8" fill="rgba(60,40,10,0.5)"
              style={{ animation: `rise ${1.5+i*0.2}s ease-out infinite` }} />
          </g>
        ))}
        {/* Gears (simplified circles) */}
        {[200,500,800,1100].map((x,i) => (
          <circle key={x} cx={x} cy={160+i%2*30} r={20+i*5} fill="none" stroke="rgba(80,50,0,0.6)" strokeWidth="6"
            style={{ animation: `spin ${3+i}s linear infinite` }} />
        ))}
        <rect x="0" y="290" width="1280" height="30" />
      </g>
    </svg>
  );
}

function MythicSky() {
  return (
    <svg viewBox="0 0 1280 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      {/* Stars */}
      {Array.from({length:60},(_,i)=>(
        <circle key={i}
          cx={Math.sin(i*137.5)*600+640}
          cy={Math.cos(i*97.3)*200+200}
          r={Math.random()*1.5+0.5}
          fill="rgba(255,240,180,0.8)"
          style={{ animation: `twinkle ${1+i%3}s ease-in-out ${i*0.1}s infinite alternate` }}
        />
      ))}
      {/* Divine pillars */}
      {[200,400,600,800,1000].map((x,i) => (
        <g key={x}>
          <rect x={x-15} y={100+i%2*40} width="30" height={300} fill="rgba(180,150,50,0.2)" />
          <rect x={x-25} y={95+i%2*40} width="50" height="12" fill="rgba(200,170,60,0.3)" />
        </g>
      ))}
      {/* Ground platform */}
      <ellipse cx="640" cy="380" rx="600" ry="30" fill="rgba(150,120,30,0.25)" />
    </svg>
  );
}

/* ── Fog layers ──────────────────────────────────────────── */
function FogLayer({ color, speed = 20 }: { color: string; speed?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[0, 1].map(i => (
        <div
          key={i}
          className="absolute inset-y-0 w-[200%]"
          style={{
            background: `radial-gradient(ellipse 40% 60% at 30% 80%, ${color}30 0%, transparent 70%),
                          radial-gradient(ellipse 50% 50% at 70% 90%, ${color}20 0%, transparent 60%)`,
            animation: `fogDrift ${speed}s linear ${i * speed / 2}s infinite`,
            transform: i === 1 ? "scaleX(-1)" : undefined,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

/* ── Map of world theme to scene ─────────────────────────── */
export function WorldScene({ theme }: { theme: string }) {
  const cfg: Record<string, { particle: string; fog: string; Scene: (() => JSX.Element) | null }> = {
    Nature:         { particle: "#4ade80", fog: "#064e1a", Scene: NatureTrees },
    "Dark Fantasy": { particle: "#a855f7", fog: "#2e1065", Scene: DarkCastle  },
    Dragon:         { particle: "#fb923c", fog: "#431407", Scene: DragonCave  },
    Steampunk:      { particle: "#fbbf24", fog: "#451a03", Scene: SteampunkCity },
    Mythic:         { particle: "#fde68a", fog: "#3b2200", Scene: MythicSky   },
  };
  const { particle, fog, Scene } = cfg[theme] ?? cfg["Nature"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Scene && <Scene />}
      <FogLayer color={fog} speed={25} />
      <FogLayer color={fog} speed={35} />
      <ParticleCanvas color={particle} count={40} />
    </div>
  );
}

/* ── Battle arena scene ──────────────────────────────────── */
export function BattleArenaScene({ theme }: { theme: string }) {
  const cfg: Record<string, { particle: string; fog: string }> = {
    Nature:         { particle: "#4ade80", fog: "#064e1a" },
    "Dark Fantasy": { particle: "#a855f7", fog: "#2e1065" },
    Dragon:         { particle: "#fb923c", fog: "#431407" },
    Steampunk:      { particle: "#fbbf24", fog: "#451a03" },
    Mythic:         { particle: "#fde68a", fog: "#3b2200" },
  };
  const { particle, fog } = cfg[theme] ?? cfg["Nature"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <FogLayer color={fog} speed={18} />
      <ParticleCanvas color={particle} count={20} />
      {/* Ground line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
    </div>
  );
}
