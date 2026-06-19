import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGame } from "@/store/gameContext";
import { useListNpcs, useStartBattle } from "@workspace/api-client-react";
import type { Npc } from "@workspace/api-client-react";
import Terrain, { getTerrainHeight } from "@/components/3d/Terrain";
import WorldEnvironment from "@/components/3d/Environment";
import PlayerCharacter from "@/components/3d/PlayerCharacter";
import NpcCharacter from "@/components/3d/NpcCharacter";
import Vegetation from "@/components/3d/Vegetation";
import { useToast } from "@/hooks/use-toast";

const NPC_POSITIONS: [number, number, number][] = [
  [15, 0, -20], [-20, 0, 15], [30, 0, 10], [-15, 0, -25], [25, 0, 25],
  [-30, 0, -10], [10, 0, 35], [-35, 0, 20], [40, 0, -15], [-5, 0, -40],
  [20, 0, -40], [-40, 0, -30], [35, 0, 30], [-25, 0, 40], [50, 0, 0],
  [-50, 0, 5], [0, 0, 50], [0, 0, -50], [45, 0, 40], [-45, 0, -40],
];

function PlayerController({
  playerPos,
  setPlayerPos,
  biome,
}: {
  playerPos: [number, number, number];
  setPlayerPos: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  biome: number;
}) {
  const keys = useRef<Record<string, boolean>>({});
  const { camera } = useThree();

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useFrame((_, delta) => {
    const speed = 12;
    const k = keys.current;
    const dir = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0; camDir.normalize();
    const right = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

    if (k["KeyW"] || k["ArrowUp"]) dir.add(camDir);
    if (k["KeyS"] || k["ArrowDown"]) dir.sub(camDir);
    if (k["KeyA"] || k["ArrowLeft"]) dir.sub(right);
    if (k["KeyD"] || k["ArrowRight"]) dir.add(right);

    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(speed * delta);
      const nx = Math.max(-90, Math.min(90, playerPos[0] + dir.x));
      const nz = Math.max(-90, Math.min(90, playerPos[2] + dir.z));
      const ny = getTerrainHeight(nx, nz, biome);
      setPlayerPos([nx, ny, nz]);
    }
  });
  return null;
}

function CameraFollow({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  const smoothPos = useRef(new THREE.Vector3(...target));

  useFrame(() => {
    smoothPos.current.lerp(new THREE.Vector3(...target), 0.08);
    const offset = new THREE.Vector3(0, 18, 28);
    camera.position.lerp(smoothPos.current.clone().add(offset), 0.06);
    camera.lookAt(smoothPos.current.clone().add(new THREE.Vector3(0, 1, 0)));
  });
  return null;
}

function DoubleClickMove({
  setPlayerPos, biome,
}: {
  setPlayerPos: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  biome: number;
}) {
  const { camera, gl } = useThree();
  useEffect(() => {
    const handleDbl = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName !== "CANVAS") return;
      const rect = (gl.domElement as HTMLCanvasElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x, y }, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hit);
      if (hit) {
        const nx = Math.max(-90, Math.min(90, hit.x));
        const nz = Math.max(-90, Math.min(90, hit.z));
        setPlayerPos([nx, getTerrainHeight(nx, nz, biome), nz]);
      }
    };
    window.addEventListener("dblclick", handleDbl);
    return () => window.removeEventListener("dblclick", handleDbl);
  }, [camera, gl, biome, setPlayerPos]);
  return null;
}

export default function WorldScene() {
  const { character, world, goLobby, startBattle } = useGame();
  const { toast } = useToast();
  const biome = world?.id ?? 1;
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, getTerrainHeight(0, 0, biome), 0]);
  const [freeCamera, setFreeCamera] = useState(false);

  const { data: allNpcs = [] } = useListNpcs();
  const startBattleMut = useStartBattle();

  // Filter NPCs to this world, show up to 20
  const worldNpcs = (allNpcs as Npc[]).filter((n) => n.worldId === biome).slice(0, NPC_POSITIONS.length);

  const handleNpcClick = useCallback(async (npc: Npc) => {
    if (!character) return;
    try {
      const battle = await startBattleMut.mutateAsync({
        data: { characterId: character.id, npcId: npc.id },
      });
      startBattle(npc, battle.id);
    } catch {
      toast({ title: "Lỗi", description: "Không thể bắt đầu chiến đấu", variant: "destructive" });
    }
  }, [character, startBattleMut, startBattle, toast]);

  const heightFn = useCallback((x: number, z: number) => getTerrainHeight(x, z, biome), [biome]);

  if (!character || !world) { goLobby(); return null; }

  const hpRatio = character.hp / character.maxHp;
  const mpRatio = character.mana / character.maxMana;
  const xpRatio = character.xp / character.xpToNext;
  const worldMinLv = world.requiredLevel ?? 1;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
        camera={{ position: [0, 18, 28], fov: 55, near: 0.5, far: 500 }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <WorldEnvironment biome={biome} />
          <Terrain biome={biome} size={200} segments={100} />
          <Vegetation biome={biome} count={70} getHeight={heightFn} />

          {worldNpcs.map((npc, i) => {
            const rawPos = NPC_POSITIONS[i] ?? [i * 10, 0, 0];
            const h = getTerrainHeight(rawPos[0], rawPos[2], biome);
            const pos: [number, number, number] = [rawPos[0], h, rawPos[2]];
            return (
              <NpcCharacter
                key={npc.id}
                npc={npc}
                position={pos}
                onClick={handleNpcClick}
                playerPos={playerPos}
              />
            );
          })}

          <PlayerCharacter
            position={playerPos}
            charClass={character.class}
            name={character.name}
            hp={character.hp}
            maxHp={character.maxHp}
          />

          {!freeCamera ? (
            <>
              <CameraFollow target={playerPos} />
              <PlayerController playerPos={playerPos} setPlayerPos={setPlayerPos} biome={biome} />
              <DoubleClickMove setPlayerPos={setPlayerPos} biome={biome} />
            </>
          ) : (
            <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
          )}
        </Suspense>
      </Canvas>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex items-start justify-between">
          {/* Character stats */}
          <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4 min-w-[220px] pointer-events-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold text-sm border border-red-400/30">
                {character.level}
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">{character.name}</div>
                <div className="text-red-400 text-xs">{character.class}</div>
              </div>
            </div>
            <StatBar label="❤️ HP" value={character.hp} max={character.maxHp} ratio={hpRatio} color="from-red-700 to-red-400" />
            <StatBar label="💙 MP" value={character.mana} max={character.maxMana} ratio={mpRatio} color="from-blue-700 to-blue-400" />
            <StatBar label="⭐ XP" value={character.xp} max={character.xpToNext} ratio={xpRatio} color="from-amber-700 to-amber-300" thin />
            <div className="text-amber-400 text-xs font-bold mt-2">💰 {character.gold} vàng</div>
          </div>

          {/* World + controls */}
          <div className="flex flex-col items-end gap-2">
            <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-3 pointer-events-auto">
              <div className="text-white font-bold text-sm">{world.name}</div>
              <div className="text-gray-400 text-xs mt-0.5">Yêu cầu cấp {worldMinLv}+ · {worldNpcs.length} NPC</div>
            </div>
            <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-400 pointer-events-auto max-w-[180px]">
              <div className="font-bold text-gray-300 mb-1">Điều khiển</div>
              <div>WASD / ↑↓←→ — Di chuyển</div>
              <div>Double-click — Đến vị trí</div>
              <div>Kéo chuột — Xoay camera</div>
              <button
                onClick={() => setFreeCamera(f => !f)}
                className="mt-2 w-full text-center text-amber-400 hover:text-amber-300 font-bold text-xs"
              >
                {freeCamera ? "🎮 Chế độ nhân vật" : "🎥 Camera tự do"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto">
        <button
          onClick={goLobby}
          className="px-5 py-2.5 bg-black/70 backdrop-blur border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:border-gray-500 transition-all text-sm font-bold"
        >
          🏠 Sảnh chờ
        </button>
        <div className="px-5 py-2.5 bg-black/70 backdrop-blur border border-amber-700/40 rounded-xl text-amber-400 text-sm font-bold">
          {startBattleMut.isPending ? "⚔️ Đang vào trận..." : "🗺️ Tiến lại gần NPC để chiến đấu"}
        </div>
      </div>

      {/* Compass */}
      <div className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-black/70 backdrop-blur border border-white/20 flex items-center justify-center pointer-events-none">
        <span className="text-2xl">🧭</span>
      </div>
    </div>
  );
}

function StatBar({
  label, value, max, ratio, color, thin,
}: {
  label: string; value: number; max: number; ratio: number; color: string; thin?: boolean;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}/{max}</span>
      </div>
      <div className={`bg-gray-800 rounded-full overflow-hidden ${thin ? "h-1.5" : "h-2"}`}>
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
          style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }}
        />
      </div>
    </div>
  );
}
