import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import { Stars, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGame } from "@/store/gameContext";
import { useGetBattle, useBattleAction, useGetCharacter } from "@workspace/api-client-react";
import { MagicAura, AttackSlash, HitEffect, HealEffect, ParticleSystem } from "@/components/3d/SkillEffects";
import { useToast } from "@/hooks/use-toast";

const CLASS_COLORS: Record<string, string> = {
  "Chiến Binh": "#e05c4b", "Pháp Sư": "#7c3aed", "Thích Khách": "#16a34a", "Cung Thủ": "#b45309",
};
const DIFF_COLORS: Record<string, string> = {
  Easy: "#22cc44", Normal: "#2288ff", Hard: "#ff2222", Boss: "#cc44ff",
};

function Arena({ biome }: { biome: number }) {
  const cfg: Record<number, { floor: string; ring: string; light: string }> = {
    1: { floor: "#1a3a0a", ring: "#44ff44", light: "#44ff44" },
    2: { floor: "#3a2a0a", ring: "#ffaa22", light: "#ffaa22" },
    3: { floor: "#0a1a3a", ring: "#44aaff", light: "#44aaff" },
    4: { floor: "#1a0500", ring: "#ff3300", light: "#ff3300" },
    5: { floor: "#0a0020", ring: "#aa44ff", light: "#aa44ff" },
  };
  const c = cfg[biome] ?? cfg[1];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial color={c.floor} roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.5, 12, 32]} />
        <meshStandardMaterial color={c.ring} emissive={c.ring} emissiveIntensity={0.9} />
      </mesh>
      {[0,1,2,3,4,5].map(i => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <group key={i} position={[Math.cos(angle)*10, 0, Math.sin(angle)*10]}>
            <mesh position={[0,2,0]} castShadow>
              <cylinderGeometry args={[0.4,0.5,4,8]} />
              <meshStandardMaterial color="#333" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[0,4.3,0]}>
              <boxGeometry args={[1,0.5,1]} />
              <meshStandardMaterial color={c.ring} emissive={c.ring} emissiveIntensity={0.6} />
            </mesh>
            <pointLight position={[0,4.5,0]} color={c.light} intensity={1.5} distance={8} />
          </group>
        );
      })}
      <ParticleSystem position={[0, 0.2, 0]} color={c.light} count={25} speed={0.3} size={0.12} type="orbit" />
    </group>
  );
}

function Fighter({
  position, color, isHit, isAttacking, hp, maxHp, name, isPlayer,
}: {
  position: [number, number, number]; color: string; isHit: boolean; isAttacking: boolean;
  hp: number; maxHp: number; name: string; isPlayer: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const hpRatio = Math.max(0, maxHp > 0 ? hp / maxHp : 0);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (isAttacking) {
      ref.current.position.x = position[0] + Math.sin(clock.elapsedTime * 20) * 0.3 * (isPlayer ? 1 : -1);
    } else if (isHit) {
      ref.current.position.x = position[0] + Math.sin(clock.elapsedTime * 28) * 0.25;
    } else {
      ref.current.position.x = position[0];
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0,1,0]} castShadow>
        <capsuleGeometry args={[0.45, 1.0, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.2}
          emissive={isHit ? "#ff0000" : "#000"} emissiveIntensity={isHit ? 0.6 : 0} />
      </mesh>
      <mesh position={[0,2.05,0]} castShadow>
        <sphereGeometry args={[0.33, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[isPlayer ? -0.12 : 0.12, 2.1, isPlayer ? 0.26 : -0.26]}>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial color="white" emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh position={[isPlayer ? 0.12 : -0.12, 2.1, isPlayer ? 0.26 : -0.26]}>
        <sphereGeometry args={[0.055, 6, 6]} />
        <meshStandardMaterial color="white" emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* HP bar */}
      <group position={[0, 2.85, 0]}>
        <mesh><planeGeometry args={[1.5,0.14]} /><meshBasicMaterial color="#111" transparent opacity={0.8} /></mesh>
        <mesh position={[-(1.5-hpRatio*1.5)/2, 0, 0.01]}>
          <planeGeometry args={[hpRatio*1.5, 0.14]} />
          <meshBasicMaterial color={hpRatio>0.5?"#22cc44":hpRatio>0.25?"#ffaa00":"#ff2222"} />
        </mesh>
      </group>
      <Text position={[0,3.15,0]} fontSize={0.2} color="white" anchorX="center" outlineWidth={0.03} outlineColor="#000">{name}</Text>
      <mesh position={[0,0.01,0]} rotation={[-Math.PI/2,0,0]}>
        <circleGeometry args={[0.5,16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
      <pointLight position={[0,1.5,0]} color={color} intensity={0.8} distance={5} />
    </group>
  );
}

function BattleCanvas({
  biome, playerClass, playerName, playerHp, playerMaxHp,
  npcDifficulty, npcName, npcHp, npcMaxHp, effect,
}: {
  biome: number; playerClass: string; playerName: string; playerHp: number; playerMaxHp: number;
  npcDifficulty: string; npcName: string; npcHp: number; npcMaxHp: number; effect: string | null;
}) {
  const bg: Record<number,string> = {1:"#050e05",2:"#0e0800",3:"#030818",4:"#0e0200",5:"#030010"};
  const playerColor = CLASS_COLORS[playerClass] ?? "#ff4444";
  const npcColor = DIFF_COLORS[npcDifficulty] ?? "#ff0000";

  return (
    <Canvas shadows gl={{ antialias: true, failIfMajorPerformanceCaveat: false, powerPreference: "default" }} camera={{ position:[0,6,14], fov:55 }} dpr={1}>
      <color attach="background" args={[bg[biome] ?? "#050508"]} />
      <fog attach="fog" color={bg[biome] ?? "#050508"} near={22} far={60} />
      <ambientLight intensity={0.4} color="#aaaacc" />
      <directionalLight position={[5,10,5]} intensity={1.5} castShadow />
      {biome === 5 && <Stars radius={50} depth={30} count={4000} factor={3} fade />}

      <Suspense fallback={null}>
        <Arena biome={biome} />
        <Fighter position={[-3.5,0,0]} color={playerColor} isPlayer isAttacking={effect==="playerAttack"} isHit={effect==="playerHit"} hp={playerHp} maxHp={playerMaxHp} name={playerName} />
        <Fighter position={[3.5,0,0]} color={npcColor} isPlayer={false} isAttacking={effect==="npcAttack"} isHit={effect==="npcHit"} hp={npcHp} maxHp={npcMaxHp} name={npcName} />

        {effect==="playerAttack" && <AttackSlash position={[1,1.5,0]} color={playerColor} />}
        {effect==="npcHit" && <HitEffect position={[3.5,1.5,0]} color="#ff4444" />}
        {effect==="npcAttack" && <AttackSlash position={[-1,1.5,0]} color={npcColor} />}
        {effect==="playerHit" && <HitEffect position={[-3.5,1.5,0]} color="#ff4444" />}
        {effect==="skill" && <MagicAura position={[-3.5,1.5,0]} color={playerColor} />}
        {effect==="heal" && <HealEffect position={[-3.5,1,0]} />}

        <OrbitControls enablePan={false} minDistance={8} maxDistance={20}
          minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.2} autoRotate autoRotateSpeed={0.3} />
      </Suspense>
    </Canvas>
  );
}

const ACTIONS = [
  { key: "attack", icon: "⚔️", label: "Tấn Công", desc: "Tấn công cơ bản", color: "from-red-800 to-red-700" },
  { key: "skill",  icon: "✨", label: "Kỹ Năng",  desc: "Chiêu thức đặc biệt", color: "from-purple-800 to-purple-700" },
  { key: "defend", icon: "🛡️", label: "Phòng Thủ", desc: "Giảm sát thương", color: "from-blue-800 to-blue-700" },
  { key: "flee",   icon: "🏃", label: "Tẩu Thoát", desc: "Bỏ chạy", color: "from-gray-800 to-gray-700" },
];

export default function BattleScene() {
  const { character, targetNpc, battleId, endBattle, world } = useGame();
  const { toast } = useToast();
  const [effect, setEffect] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [battleDone, setBattleDone] = useState(false);
  const [battleResult, setBattleResult] = useState<string | null>(null);
  const [currentCharHp, setCurrentCharHp] = useState(character?.hp ?? 0);
  const [currentNpcHp, setCurrentNpcHp] = useState(targetNpc?.hp ?? 0);
  const logRef = useRef<HTMLDivElement>(null);

  const { data: battle } = useGetBattle(battleId ?? 0, {
    query: { enabled: !!battleId },
  });
  const { data: freshChar } = useGetCharacter(character?.id ?? 0, {
    query: { enabled: !!character?.id },
  });
  const actionMut = useBattleAction();

  const biome = world?.id ?? 1;
  const playerHp = currentCharHp;
  const playerMaxHp = character?.maxHp ?? 100;
  const npcMaxHp = targetNpc?.hp ?? 100;

  const flash = useCallback((eff: string, delayMs = 0) => {
    setTimeout(() => {
      setEffect(eff);
      setTimeout(() => setEffect(null), 700);
    }, delayMs);
  }, []);

  const handleAction = useCallback(async (action: string) => {
    if (!battleId || !character || battleDone) return;

    if (action === "attack") flash("playerAttack");
    else if (action === "skill") flash("skill");
    else if (action === "defend") flash("heal");

    try {
      const res = await actionMut.mutateAsync({
        id: battleId,
        data: { action: action as "attack" | "skill" | "defend" | "flee" },
      });

      const newLogs = [...res.log];
      setLog(prev => [...prev, ...newLogs].slice(-24));

      // Update HP from battle state
      setCurrentCharHp(res.battle.characterHp);
      setCurrentNpcHp(res.battle.npcHp);

      // NPC reaction animation
      if (action === "attack" || action === "skill") flash("npcHit", 200);
      else if (res.battle.characterHp < (character.hp)) flash("playerHit", 200);

      if (res.isOver) {
        setBattleDone(true);
        setBattleResult(res.result ?? "won");
        const result = res.result;
        if (result === "won") {
          const xp = res.battle.xpGained ?? 0;
          const gold = res.battle.goldGained ?? 0;
          setLog(prev => [...prev, `🏆 CHIẾN THẮNG! +${xp} XP, +${gold} vàng`]);
        } else if (result === "lost") {
          setLog(prev => [...prev, "💀 THẤT BẠI..."]);
        } else {
          setLog(prev => [...prev, "🏃 Đã tẩu thoát!"]);
        }
      }
    } catch {
      toast({ title: "Lỗi", description: "Không thể thực hiện hành động", variant: "destructive" });
    }
  }, [battleId, character, battleDone, actionMut, flash, toast]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Init HP from battle if available
  useEffect(() => {
    if (battle) {
      setCurrentCharHp(battle.characterHp);
      setCurrentNpcHp(battle.npcHp);
      if (battle.log?.length > 0) {
        setLog(battle.log.slice(-5));
      }
    }
  }, []);

  if (!character || !targetNpc || !battleId) { endBattle(); return null; }

  const charHpRatio = playerHp / playerMaxHp;
  const npcHpRatio = currentNpcHp / npcMaxHp;
  const charMana = freshChar?.mana ?? character.mana;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950">
      <div className="absolute inset-0">
        <BattleCanvas
          biome={biome}
          playerClass={character.class}
          playerName={character.name}
          playerHp={playerHp}
          playerMaxHp={playerMaxHp}
          npcDifficulty={targetNpc.difficulty ?? "Normal"}
          npcName={targetNpc.name}
          npcHp={currentNpcHp}
          npcMaxHp={npcMaxHp}
          effect={effect}
        />
      </div>

      {/* Top stats */}
      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="flex justify-between items-start gap-4">
          {/* Player */}
          <div className="bg-black/75 backdrop-blur-md rounded-xl border border-white/10 p-3 min-w-[200px]">
            <div className="text-sm font-bold text-white mb-0.5">{character.name}</div>
            <div className="text-xs text-gray-400 mb-2">{character.class} · Lv.{character.level}</div>
            <BattleBar label="❤️" value={playerHp} max={playerMaxHp} ratio={charHpRatio} color={charHpRatio > 0.5 ? "from-red-700 to-red-400" : charHpRatio > 0.25 ? "from-orange-700 to-orange-400" : "from-red-900 to-red-600"} />
            <BattleBar label="💙" value={charMana} max={character.maxMana} ratio={charMana/character.maxMana} color="from-blue-700 to-blue-400" />
          </div>

          {/* VS */}
          <div className="text-center pt-2">
            <div className="text-4xl font-black text-red-500 drop-shadow-lg leading-none">VS</div>
            <div className="text-xs text-gray-500 mt-1">Lượt {battle?.currentTurn ?? 1}</div>
          </div>

          {/* NPC */}
          <div className="bg-black/75 backdrop-blur-md rounded-xl border border-white/10 p-3 min-w-[200px]">
            <div className="text-sm font-bold text-white mb-0.5">{targetNpc.name}</div>
            <div className="text-xs mb-2" style={{ color: DIFF_COLORS[targetNpc.difficulty ?? "Normal"] ?? "#fff" }}>
              {targetNpc.difficulty ?? "Normal"} · Lv.{targetNpc.level}
            </div>
            <BattleBar label="❤️" value={currentNpcHp} max={npcMaxHp} ratio={npcHpRatio} color={npcHpRatio > 0.5 ? "from-red-700 to-red-400" : npcHpRatio > 0.25 ? "from-orange-700 to-orange-400" : "from-red-900 to-red-600"} />
          </div>
        </div>
      </div>

      {/* Battle log */}
      <div className="absolute left-4 bottom-32">
        <div className="bg-black/75 backdrop-blur-md rounded-xl border border-white/10 p-3 w-64">
          <div className="text-xs text-gray-400 font-bold mb-2">📜 Nhật ký</div>
          <div ref={logRef} className="space-y-1 max-h-28 overflow-y-auto">
            {log.length === 0 ? (
              <div className="text-xs text-gray-600 italic">Trận chiến bắt đầu...</div>
            ) : log.map((l, i) => (
              <div key={i} className="text-xs text-gray-300 leading-relaxed">{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {battleDone ? (
          <div className="flex justify-center gap-4 items-center">
            <div className={`px-6 py-3 rounded-xl font-bold text-xl shadow-xl ${
              battleResult === "won" ? "bg-amber-600 text-white shadow-amber-900/50"
              : battleResult === "fled" ? "bg-gray-700 text-white"
              : "bg-red-950 text-red-300"
            }`}>
              {battleResult === "won" ? "🏆 CHIẾN THẮNG!" : battleResult === "lost" ? "💀 THẤT BẠI" : "🏃 TẨU THOÁT"}
            </div>
            <button onClick={endBattle} className="px-6 py-3 bg-blue-700 hover:bg-blue-600 rounded-xl text-white font-bold transition-all shadow-lg">
              🌍 Quay về thế giới
            </button>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            {ACTIONS.map(a => (
              <button
                key={a.key}
                onClick={() => handleAction(a.key)}
                disabled={actionMut.isPending}
                className={`flex flex-col items-center px-5 py-3 bg-gradient-to-b ${a.color} rounded-xl border border-white/10 hover:brightness-125 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg min-w-[95px]`}
              >
                <span className="text-2xl mb-0.5">{a.icon}</span>
                <span className="text-white text-sm font-bold">{a.label}</span>
                <span className="text-white/50 text-xs">{a.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BattleBar({ label, value, max, ratio, color }: { label: string; value: number; max: number; ratio: number; color: string }) {
  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-white text-xs">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, ratio*100))}%` }} />
      </div>
    </div>
  );
}
