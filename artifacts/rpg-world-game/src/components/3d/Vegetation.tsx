import { useMemo } from "react";
import * as THREE from "three";

interface VegetationProps {
  biome: number;
  count?: number;
  getHeight: (x: number, z: number) => number;
}

function Tree({ position, scale, biome }: { position: [number, number, number]; scale: number; biome: number }) {
  const trunkColor = biome === 2 ? "#8B6914" : biome === 4 ? "#1a0800" : "#5D4037";
  const leafColor = biome === 1 ? "#2E7D32" : biome === 3 ? "#B2EBF2" : biome === 5 ? "#4A148C" : biome === 2 ? "#DAA520" : "#1B5E20";
  const leafEmissive = biome === 5 ? "#6A0DAD" : biome === 4 ? "#FF1100" : "#000000";

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.2, 6]} />
        <meshStandardMaterial color={trunkColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.7, 1.6, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} emissive={leafEmissive} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <coneGeometry args={[0.5, 1.2, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} emissive={leafEmissive} emissiveIntensity={0.3} />
      </mesh>
      {biome === 5 && (
        <pointLight position={[0, 2, 0]} color="#aa44ff" intensity={0.5} distance={5} />
      )}
    </group>
  );
}

function Rock({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position}>
      <mesh scale={[scale * 0.8, scale * 0.5, scale * 0.7]} castShadow>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#607D8B" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

function DesertCactus({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 1.6, 8]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.7} />
      </mesh>
      <mesh position={[-0.4, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 6]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.7} />
      </mesh>
      <mesh position={[0.4, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.7, 6]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.7} />
      </mesh>
    </group>
  );
}

function SnowPatch({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1] + 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.8, 8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} transparent opacity={0.9} />
    </mesh>
  );
}

function LavaRock({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#1a0000" roughness={0.6} metalness={0.3} emissive="#ff1100" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function MagicCrystal({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#9C27B0" metalness={0.9} roughness={0.05} emissive="#6A0DAD" emissiveIntensity={0.8} transparent opacity={0.85} />
      </mesh>
      <pointLight position={[0, 0.8, 0]} color="#aa44ff" intensity={0.8} distance={6} />
    </group>
  );
}

export default function Vegetation({ biome, count = 60, getHeight }: VegetationProps) {
  const items = useMemo(() => {
    const arr: { type: string; pos: [number, number, number]; scale: number }[] = [];
    const rng = (seed: number) => {
      const x = Math.sin(seed) * 43758.5453123;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const angle = rng(i * 7.3) * Math.PI * 2;
      const radius = 10 + rng(i * 3.7) * 75;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const h = getHeight(x, z);
      const scale = 0.7 + rng(i * 11.1) * 0.6;

      if (h < 0.5) continue;

      let type = "tree";
      if (biome === 2) type = rng(i * 5) > 0.5 ? "cactus" : "rock";
      else if (biome === 3) type = rng(i * 5) > 0.4 ? "snow" : "tree";
      else if (biome === 4) type = rng(i * 5) > 0.4 ? "lavarock" : "rock";
      else if (biome === 5) type = rng(i * 5) > 0.3 ? "crystal" : "rock";
      else type = rng(i * 5) > 0.2 ? "tree" : "rock";

      arr.push({ type, pos: [x, h, z], scale });
    }
    return arr;
  }, [biome, count, getHeight]);

  return (
    <>
      {items.map((item, i) => {
        if (item.type === "tree") return <Tree key={i} position={item.pos} scale={item.scale} biome={biome} />;
        if (item.type === "rock") return <Rock key={i} position={item.pos} scale={item.scale} />;
        if (item.type === "cactus") return <DesertCactus key={i} position={item.pos} scale={item.scale} />;
        if (item.type === "snow") return <SnowPatch key={i} position={item.pos} />;
        if (item.type === "lavarock") return <LavaRock key={i} position={item.pos} scale={item.scale} />;
        if (item.type === "crystal") return <MagicCrystal key={i} position={item.pos} scale={item.scale} />;
        return null;
      })}
    </>
  );
}
