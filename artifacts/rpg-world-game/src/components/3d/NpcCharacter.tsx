import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import type { Npc } from "@workspace/api-client-react";

interface NpcCharacterProps {
  npc: Npc;
  position: [number, number, number];
  onClick: (npc: Npc) => void;
  playerPos: [number, number, number];
}

const DIFF: Record<string, { body: string; accent: string; glow: string; scale: number; label: string }> = {
  Easy:   { body: "#2E7D32", accent: "#4CAF50", glow: "#00ff44", scale: 0.85, label: "⚡ Dễ" },
  Normal: { body: "#1565C0", accent: "#2196F3", glow: "#4488ff", scale: 1.0,  label: "⚔️ Bình" },
  Hard:   { body: "#B71C1C", accent: "#F44336", glow: "#ff2222", scale: 1.15, label: "💀 Khó" },
  Boss:   { body: "#4A148C", accent: "#9C27B0", glow: "#cc44ff", scale: 1.4,  label: "👑 Boss" },
};

function NpcMesh({ difficulty, hovered }: { difficulty: string; hovered: boolean }) {
  const cfg = DIFF[difficulty] ?? DIFF.Normal;
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current && difficulty === "Boss") {
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.25;
    }
  });

  return (
    <group ref={ref} scale={cfg.scale}>
      {/* Legs */}
      <mesh position={[-0.15,0.35,0]} castShadow>
        <boxGeometry args={[0.22,0.5,0.22]} />
        <meshStandardMaterial color={cfg.body} roughness={0.5} />
      </mesh>
      <mesh position={[0.15,0.35,0]} castShadow>
        <boxGeometry args={[0.22,0.5,0.22]} />
        <meshStandardMaterial color={cfg.body} roughness={0.5} />
      </mesh>
      {/* Body */}
      <mesh position={[0,0.85,0]} castShadow>
        <boxGeometry args={[0.6,0.6,0.35]} />
        <meshStandardMaterial color={cfg.accent} roughness={0.4} metalness={difficulty==="Boss"?0.5:0.1}
          emissive={hovered ? cfg.glow : "#000"} emissiveIntensity={hovered ? 0.3 : 0} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.42,0.82,0]} castShadow>
        <boxGeometry args={[0.22,0.55,0.22]} />
        <meshStandardMaterial color={cfg.body} roughness={0.5} />
      </mesh>
      <mesh position={[0.42,0.82,0]} castShadow>
        <boxGeometry args={[0.22,0.55,0.22]} />
        <meshStandardMaterial color={cfg.body} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0,1.35,0]} castShadow>
        <boxGeometry args={[0.45,0.42,0.38]} />
        <meshStandardMaterial color={cfg.body} roughness={0.6} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[-0.12,1.37,0.2]}>
        <boxGeometry args={[0.1,0.07,0.02]} />
        <meshStandardMaterial color={cfg.glow} emissive={cfg.glow} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.12,1.37,0.2]}>
        <boxGeometry args={[0.1,0.07,0.02]} />
        <meshStandardMaterial color={cfg.glow} emissive={cfg.glow} emissiveIntensity={2} />
      </mesh>
      {/* Boss crown */}
      {difficulty === "Boss" && (
        <>
          <mesh position={[0,1.65,0]}>
            <cylinderGeometry args={[0.28,0.3,0.25,6]} />
            <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} emissive="#ffaa00" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0,1.9,0]} color={cfg.glow} intensity={2} distance={6} />
        </>
      )}
      {/* Hard horns */}
      {difficulty === "Hard" && (
        <>
          <mesh position={[-0.18,1.62,0]} rotation={[0,0,-0.4]}>
            <coneGeometry args={[0.06,0.35,4]} />
            <meshStandardMaterial color="#8B0000" roughness={0.4} />
          </mesh>
          <mesh position={[0.18,1.62,0]} rotation={[0,0,0.4]}>
            <coneGeometry args={[0.06,0.35,4]} />
            <meshStandardMaterial color="#8B0000" roughness={0.4} />
          </mesh>
        </>
      )}
      {hovered && <pointLight position={[0,0.8,0]} color={cfg.glow} intensity={3} distance={4} />}
    </group>
  );
}

export default function NpcCharacter({ npc, position, onClick, playerPos }: NpcCharacterProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Group>(null);
  const difficulty = npc.difficulty ?? "Normal";
  const cfg = DIFF[difficulty] ?? DIFF.Normal;

  const dist = Math.sqrt((position[0]-playerPos[0])**2 + (position[2]-playerPos[2])**2);
  const canInteract = dist < 12;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime*1.2 + position[0])*0.04;
    const dx = playerPos[0]-position[0];
    const dz = playerPos[2]-position[2];
    ref.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group
      ref={ref}
      position={position}
      onClick={(e) => { e.stopPropagation(); if (canInteract) onClick(npc); }}
      onPointerOver={(e) => { e.stopPropagation(); if (canInteract) { setHovered(true); document.body.style.cursor="pointer"; } }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor="default"; }}
    >
      <NpcMesh difficulty={difficulty} hovered={hovered && canInteract} />

      {canInteract && (
        <Billboard position={[0, 2.4*cfg.scale, 0]}>
          <Text fontSize={0.2} color="white" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000">
            {npc.name}
          </Text>
          <Text position={[0,-0.28,0]} fontSize={0.16} color={cfg.glow} anchorX="center" anchorY="middle">
            {cfg.label} · Lv.{npc.level}
          </Text>
          {hovered && (
            <Text position={[0,-0.52,0]} fontSize={0.17} color="#ffdd44" anchorX="center" anchorY="middle">
              ⚔️ Click để chiến đấu
            </Text>
          )}
        </Billboard>
      )}

      {/* Ground indicator */}
      <mesh position={[0,0.01,0]} rotation={[-Math.PI/2,0,0]}>
        <circleGeometry args={[0.45*cfg.scale, 16]} />
        <meshBasicMaterial color={cfg.glow} transparent opacity={hovered && canInteract ? 0.4 : 0.12} />
      </mesh>
    </group>
  );
}
