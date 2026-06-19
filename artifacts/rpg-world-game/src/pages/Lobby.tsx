import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, Float } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect } from "react";
import { useListCharacters, useCreateCharacter, useListWorlds } from "@workspace/api-client-react";
import { useGame } from "@/store/gameContext";
import { useToast } from "@/hooks/use-toast";
import type { Character, World } from "@workspace/api-client-react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const CLASS_COLORS: Record<string, string> = {
  "Chiến Binh": "#e05c4b",
  "Pháp Sư": "#7c3aed",
  "Thích Khách": "#16a34a",
  "Cung Thủ": "#b45309",
};

const CLASS_ICONS: Record<string, string> = {
  "Chiến Binh": "⚔️",
  "Pháp Sư": "🔮",
  "Thích Khách": "🗡️",
  "Cung Thủ": "🏹",
};

const WORLD_BG: Record<number, string> = {
  1: "from-emerald-950 to-green-900",
  2: "from-orange-950 to-amber-900",
  3: "from-blue-950 to-cyan-900",
  4: "from-red-950 to-rose-900",
  5: "from-purple-950 to-indigo-900",
};
const WORLD_ICONS: Record<number, string> = { 1: "🌿", 2: "🏜️", 3: "❄️", 4: "🌋", 5: "🌌" };

function RotatingGem({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 1.2;
      ref.current.rotation.x += delta * 0.4;
    }
  });
  return (
    <mesh ref={ref} castShadow>
      <octahedronGeometry args={[1.6, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.9} roughness={0.05} />
    </mesh>
  );
}

function LobbyCanvas3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{ antialias: true, failIfMajorPerformanceCaveat: false, powerPreference: "default" }}
      onCreated={({ gl }) => gl.setClearColor("#050510")}
    >
      <ambientLight intensity={1.5} color="#aa88ff" />
      <pointLight position={[5, 5, 5]} intensity={8} color="#ff4444" />
      <pointLight position={[-5, -3, 3]} intensity={5} color="#4444ff" />
      <pointLight position={[0, 0, 4]} intensity={3} color="#ffffff" />
      <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
        <RotatingGem color="#dc2626" />
      </Float>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}

function CSSBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-red-950/30 to-purple-950/20" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(220,38,38,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(245,158,11,0.1) 0%, transparent 40%)`,
        }}
      />
      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 3) * 25}%`,
              background: i % 3 === 0 ? "rgba(220,38,38,0.2)" : i % 3 === 1 ? "rgba(124,58,237,0.2)" : "rgba(245,158,11,0.15)",
              filter: "blur(20px)",
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          />
        ))}
      </div>
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-up ${4 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.25}s`,
            }}
          />
        ))}
      </div>
      {/* 3D gem (CSS) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-24 h-24 opacity-60"
          style={{
            background: "linear-gradient(135deg, #dc2626, #7c3aed, #b45309)",
            clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            filter: "drop-shadow(0 0 30px rgba(220,38,38,0.8))",
            animation: "spin-gem 8s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

function WebGLCanvas() {
  const [webglFailed, setWebglFailed] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setTried(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false })
        || canvas.getContext("experimental-webgl");
      if (!ctx) { setWebglFailed(true); return; }
      const gl = ctx as WebGLRenderingContext;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebglFailed(true);
    }
  }, []);

  if (!tried) return <CSSBackground />;
  if (webglFailed) return <CSSBackground />;

  return (
    <Suspense fallback={<CSSBackground />}>
      <div className="absolute inset-0">
        <LobbyCanvas3D />
      </div>
    </Suspense>
  );
}

export default function Lobby() {
  const { character, selectCharacter, enterWorld } = useGame();
  const { toast } = useToast();
  const { data: characters = [], refetch } = useListCharacters();
  const { data: worlds = [] } = useListWorlds();
  const createMut = useCreateCharacter();

  const [tab, setTab] = useState<"chars" | "worlds" | "create">("chars");
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("Chiến Binh");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const c = await createMut.mutateAsync({ data: { name: newName.trim(), class: newClass } });
      selectCharacter(c);
      setNewName("");
      refetch();
      setTab("chars");
      toast({ title: "Tạo nhân vật thành công!", description: `${c.name} — ${c.class}` });
    } catch {
      toast({ title: "Lỗi", description: "Không thể tạo nhân vật", variant: "destructive" });
    }
  };

  const handleEnterWorld = (w: World) => {
    if (!character) {
      toast({ title: "Chưa chọn nhân vật", description: "Hãy chọn nhân vật trước", variant: "destructive" });
      return;
    }
    const minLv = w.requiredLevel ?? 1;
    if (character.level < minLv) {
      toast({ title: "Cấp độ không đủ", description: `Cần cấp ${minLv} để vào ${w.name}`, variant: "destructive" });
      return;
    }
    enterWorld(w);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 font-sans">
      {/* Background */}
      <WebGLCanvas />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/70 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="p-6 text-center">
          <h1
            className="text-5xl font-black tracking-widest drop-shadow-2xl"
            style={{
              background: "linear-gradient(90deg, #f87171, #fbbf24, #ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 12px rgba(239,68,68,0.6))",
            }}
          >
            RPG WORLD
          </h1>
          <p className="text-amber-400/80 text-sm tracking-[0.4em] mt-1">NHẬP VAI · CHIẾN ĐẤU · 3D</p>
          <a
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            🚀 Mở tab mới để xem 3D đầy đủ
          </a>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center px-4 pb-6 overflow-auto">
          <div className="w-full max-w-2xl">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-black/50 backdrop-blur rounded-xl p-1 border border-white/5">
              {(["chars", "worlds", "create"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    tab === t
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/50"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t === "chars" ? "👤 Nhân Vật" : t === "worlds" ? "🌍 Thế Giới" : "✨ Tạo Mới"}
                </button>
              ))}
            </div>

            {/* Characters */}
            {tab === "chars" && (
              <div className="space-y-3">
                {characters.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <div className="text-5xl mb-3">⚔️</div>
                    <p className="text-base">Chưa có nhân vật. Hãy tạo nhân vật đầu tiên!</p>
                    <button
                      onClick={() => setTab("create")}
                      className="mt-4 px-5 py-2.5 bg-red-600 rounded-xl text-white text-sm font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/50"
                    >
                      ✨ Tạo ngay
                    </button>
                  </div>
                ) : (
                  (characters as Character[]).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCharacter(c)}
                      className={`w-full text-left p-4 rounded-xl border transition-all backdrop-blur-sm ${
                        character?.id === c.id
                          ? "border-amber-400 bg-amber-900/25 shadow-lg shadow-amber-900/25"
                          : "border-gray-700/50 bg-black/40 hover:border-gray-500 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 shadow-inner flex-shrink-0"
                          style={{
                            borderColor: CLASS_COLORS[c.class] ?? "#888",
                            background: `${CLASS_COLORS[c.class] ?? "#444"}22`,
                          }}
                        >
                          {CLASS_ICONS[c.class] ?? "🧙"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-lg">{c.name}</span>
                            {character?.id === c.id && (
                              <span className="text-xs text-amber-400 font-bold">● ĐANG CHỌN</span>
                            )}
                          </div>
                          <div className="text-sm font-medium" style={{ color: CLASS_COLORS[c.class] ?? "#aaa" }}>
                            {c.class}
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            <span>⭐ Lv.{c.level}</span>
                            <span>❤️ {c.hp}/{c.maxHp}</span>
                            <span>💙 {c.mana}/{c.maxMana}</span>
                            <span>💰 {c.gold}</span>
                          </div>
                        </div>
                        {character?.id === c.id && (
                          <div className="flex-shrink-0">
                            {character && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setTab("worlds"); }}
                                className="px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-white text-xs font-bold transition-all"
                              >
                                🌍 Vào thế giới
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Worlds */}
            {tab === "worlds" && (
              <div className="space-y-3">
                {!character && (
                  <div className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-3 text-amber-300 text-sm text-center">
                    ⚠️ Chọn nhân vật trước khi vào thế giới
                  </div>
                )}
                {(worlds as World[]).map((w) => {
                  const minLv = w.requiredLevel ?? 1;
                  const canEnter = !!character && character.level >= minLv;
                  const biomeEmojis: Record<number, string> = { 1: "🌿 Rừng Xanh", 2: "🏜️ Sa Mạc", 3: "❄️ Tuyết Nguyên", 4: "🌋 Núi Lửa", 5: "🌌 Vùng Hư Không" };
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleEnterWorld(w)}
                      disabled={!canEnter}
                      className={`w-full text-left p-4 rounded-xl border transition-all backdrop-blur-sm ${
                        canEnter
                          ? "border-gray-600/50 bg-black/40 hover:border-amber-500/60 hover:bg-amber-900/10 cursor-pointer"
                          : "border-gray-800/30 bg-black/20 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border border-white/10 flex-shrink-0 bg-gradient-to-br ${WORLD_BG[w.id] ?? "from-gray-800 to-gray-700"}`}
                        >
                          {WORLD_ICONS[w.id] ?? "🌍"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">{w.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                              Lv.{minLv}+
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{biomeEmojis[w.id] ?? ""}</div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{w.description}</p>
                        </div>
                        {canEnter ? (
                          <span className="text-green-400 text-sm font-bold flex-shrink-0">→</span>
                        ) : (
                          <span className="text-gray-600 text-sm flex-shrink-0">🔒</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Create */}
            {tab === "create" && (
              <div className="bg-black/50 backdrop-blur rounded-xl border border-gray-700/50 p-6">
                <h2 className="text-white font-bold text-xl mb-6 text-center">✨ Tạo Nhân Vật Mới</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Tên nhân vật</label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nhập tên nhân vật..."
                      className="w-full bg-white/5 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-400 transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Lớp nhân vật</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(CLASS_ICONS).map(([cls, icon]) => (
                        <button
                          key={cls}
                          onClick={() => setNewClass(cls)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            newClass === cls
                              ? "border-amber-400 bg-amber-900/25 shadow-lg shadow-amber-900/25"
                              : "border-gray-700 bg-white/5 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-xl mb-1">{icon}</div>
                          <div className="text-sm font-bold text-white">{cls}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {cls === "Chiến Binh" ? "HP cao, giáp dày" :
                              cls === "Pháp Sư" ? "Mana, phép mạnh" :
                                cls === "Thích Khách" ? "Tốc độ, crit cao" : "Tầm xa, linh hoạt"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || createMut.isPending}
                    className="w-full py-3 rounded-xl text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      boxShadow: "0 4px 24px rgba(220,38,38,0.4)",
                    }}
                  >
                    {createMut.isPending ? "Đang tạo..." : "⚔️ Tạo Nhân Vật"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.7; }
        }
        @keyframes spin-gem {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
    </div>
  );
}
