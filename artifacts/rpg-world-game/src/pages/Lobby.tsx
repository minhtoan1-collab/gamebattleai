import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls, Float } from "@react-three/drei";
import { Suspense, useState } from "react";
import { useRef } from "react";
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
      ref.current.rotation.y += delta * 0.8;
      ref.current.rotation.x += delta * 0.3;
    }
  });
  return (
    <mesh ref={ref} castShadow>
      <octahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

function LobbyCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }} gl={{ antialias: true, failIfMajorPerformanceCaveat: false, powerPreference: "default" }}>
      <color attach="background" args={["#050510"]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#ff4444" />
      <pointLight position={[-5, -3, 3]} intensity={1.5} color="#4444ff" />
      <Stars radius={80} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <RotatingGem color="#dc2626" />
      </Float>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
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
      <div className="absolute inset-0">
        <LobbyCanvas />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <header className="p-6 text-center">
          <h1 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-red-500 drop-shadow-2xl">
            RPG WORLD
          </h1>
          <p className="text-amber-400/80 text-sm tracking-[0.4em] mt-1">NHẬP VAI · CHIẾN ĐẤU · 3D</p>
        </header>

        <div className="flex-1 flex flex-col items-center px-4 pb-6 overflow-auto">
          <div className="w-full max-w-2xl">
            <div className="flex gap-1 mb-4 bg-black/40 backdrop-blur rounded-lg p-1">
              {(["chars", "worlds", "create"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                    tab === t
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/50"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t === "chars" ? "👤 Nhân Vật" : t === "worlds" ? "🌍 Thế Giới" : "✨ Tạo Mới"}
                </button>
              ))}
            </div>

            {tab === "chars" && (
              <div className="space-y-3">
                {characters.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">⚔️</div>
                    <p>Chưa có nhân vật. Hãy tạo nhân vật đầu tiên!</p>
                    <button onClick={() => setTab("create")} className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-white text-sm font-bold hover:bg-red-500">
                      Tạo ngay
                    </button>
                  </div>
                ) : (
                  (characters as Character[]).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectCharacter(c)}
                      className={`w-full text-left p-4 rounded-xl border transition-all backdrop-blur-sm ${
                        character?.id === c.id
                          ? "border-amber-400 bg-amber-900/30 shadow-lg shadow-amber-900/30"
                          : "border-gray-700/50 bg-black/30 hover:border-gray-500 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 shadow-inner"
                          style={{ borderColor: CLASS_COLORS[c.class] ?? "#888", background: `${CLASS_COLORS[c.class] ?? "#444"}22` }}
                        >
                          {CLASS_ICONS[c.class] ?? "🧙"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-lg">{c.name}</span>
                            {character?.id === c.id && <span className="text-xs text-amber-400 font-bold">● ĐANG CHỌN</span>}
                          </div>
                          <div className="text-sm" style={{ color: CLASS_COLORS[c.class] ?? "#aaa" }}>{c.class}</div>
                          <div className="flex gap-4 mt-1 text-xs text-gray-400">
                            <span>Lv.{c.level}</span>
                            <span>❤️ {c.hp}/{c.maxHp}</span>
                            <span>💙 {c.mana}/{c.maxMana}</span>
                            <span>💰 {c.gold}</span>
                          </div>
                        </div>
                        {character?.id === c.id && (
                          <div className="text-amber-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {tab === "worlds" && (
              <div className="space-y-3">
                {(worlds as World[]).map((w) => {
                  const minLv = w.requiredLevel ?? 1;
                  const canEnter = character && character.level >= minLv;
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleEnterWorld(w)}
                      disabled={!canEnter}
                      className={`w-full text-left p-4 rounded-xl border transition-all backdrop-blur-sm ${
                        canEnter
                          ? "border-gray-600/50 bg-black/30 hover:border-amber-500/50 hover:bg-amber-900/10 cursor-pointer"
                          : "border-gray-800/30 bg-black/20 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${WORLD_BG[w.id] ?? "from-gray-800 to-gray-700"} flex items-center justify-center text-xl border border-white/10`}>
                          {WORLD_ICONS[w.id] ?? "🌍"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{w.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">Lv.{minLv}+</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{w.description}</p>
                        </div>
                        {canEnter ? (
                          <span className="text-green-400 text-xs font-bold">VÀO →</span>
                        ) : (
                          <span className="text-gray-600 text-xs">🔒</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "create" && (
              <div className="bg-black/40 backdrop-blur rounded-xl border border-gray-700/50 p-6">
                <h2 className="text-white font-bold text-xl mb-6 text-center">✨ Tạo Nhân Vật Mới</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Tên nhân vật</label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Nhập tên..."
                      className="w-full bg-white/5 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
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
                          className={`p-3 rounded-lg border text-left transition-all ${
                            newClass === cls
                              ? "border-amber-400 bg-amber-900/20 shadow-lg"
                              : "border-gray-700 bg-white/5 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-xl mb-1">{icon}</div>
                          <div className="text-sm font-bold text-white">{cls}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {cls === "Chiến Binh" ? "HP cao, giáp dày" :
                             cls === "Pháp Sư" ? "Mana, phép mạnh" :
                             cls === "Thích Khách" ? "Tốc độ, crit cao" :
                             "Tầm xa, linh hoạt"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim() || createMut.isPending}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg text-white font-bold text-lg hover:from-red-500 hover:to-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-900/50"
                  >
                    {createMut.isPending ? "Đang tạo..." : "⚔️ Tạo Nhân Vật"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
