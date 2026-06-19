import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";

interface PlayerCharacterProps {
  position: [number, number, number];
  charClass: string;
  name: string;
  hp: number;
  maxHp: number;
  isMoving?: boolean;
  targetPos?: [number, number, number] | null;
  onReached?: () => void;
}

const CLASS_CONFIG: Record<string, { bodyColor: string; accentColor: string; weaponColor: string; scale: number }> = {
  "Chiến Binh": { bodyColor: "#8B3A2A", accentColor: "#C0392B", weaponColor: "#95A5A6", scale: 1.1 },
  "Pháp Sư": { bodyColor: "#2C3E7A", accentColor: "#8E44AD", weaponColor: "#9B59B6", scale: 0.95 },
  "Thích Khách": { bodyColor: "#1A3A1A", accentColor: "#27AE60", weaponColor: "#2ECC71", scale: 0.9 },
  "Cung Thủ": { bodyColor: "#5D4037", accentColor: "#D4A017", weaponColor: "#8D6E63", scale: 1.0 },
};

function CharacterMesh({ charClass }: { charClass: string }) {
  const cfg = CLASS_CONFIG[charClass] ?? CLASS_CONFIG["Chiến Binh"];
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        if (i > 0) child.rotation.z = Math.sin(clock.elapsedTime * 2 + i) * 0.05;
      });
    }
  });

  return (
    <group ref={ref} scale={cfg.scale}>
      {/* Legs */}
      <mesh position={[-0.18, 0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={cfg.bodyColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.18, 0.4, 0]} castShadow>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={cfg.bodyColor} roughness={0.6} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.3]} />
        <meshStandardMaterial color={cfg.accentColor} roughness={0.5} metalness={charClass === "Chiến Binh" ? 0.4 : 0.1} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.38, 0.92, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color={cfg.bodyColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.38, 0.92, 0]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color={cfg.bodyColor} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.35]} />
        <meshStandardMaterial color="#F5CBA7" roughness={0.7} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 1.42, 0.18]}>
        <boxGeometry args={[0.08, 0.06, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#0044ff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.1, 1.42, 0.18]}>
        <boxGeometry args={[0.08, 0.06, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#0044ff" emissiveIntensity={0.5} />
      </mesh>
      {/* Weapon based on class */}
      {charClass === "Chiến Binh" && (
        <group position={[0.55, 0.85, 0]} rotation={[0, 0, -0.3]}>
          <mesh>
            <boxGeometry args={[0.08, 0.7, 0.05]} />
            <meshStandardMaterial color={cfg.weaponColor} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.2, 0.15, 0.06]} />
            <meshStandardMaterial color={cfg.weaponColor} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}
      {charClass === "Pháp Sư" && (
        <group position={[0.55, 0.85, 0]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color={cfg.weaponColor} emissive={cfg.weaponColor} emissiveIntensity={1} />
          </mesh>
          <pointLight position={[0, 0.55, 0]} color={cfg.weaponColor} intensity={1} distance={3} />
        </group>
      )}
      {charClass === "Thích Khách" && (
        <group position={[0.5, 0.8, 0]} rotation={[0, 0, -0.5]}>
          <mesh>
            <boxGeometry args={[0.04, 0.6, 0.02]} />
            <meshStandardMaterial color={cfg.weaponColor} metalness={0.9} roughness={0.1} emissive="#00ff44" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}
      {charClass === "Cung Thủ" && (
        <group position={[0.5, 0.85, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.25, 0.02, 8, 20, Math.PI]} />
            <meshStandardMaterial color={cfg.weaponColor} roughness={0.6} />
          </mesh>
        </group>
      )}
      {/* Helmet/hat for Chiến Binh */}
      {charClass === "Chiến Binh" && (
        <mesh position={[0, 1.65, 0]}>
          <boxGeometry args={[0.44, 0.18, 0.38]} />
          <meshStandardMaterial color="#95A5A6" metalness={0.8} roughness={0.2} />
        </mesh>
      )}
      {/* Robe for Pháp Sư */}
      {charClass === "Pháp Sư" && (
        <mesh position={[0, 0.72, 0]}>
          <coneGeometry args={[0.35, 0.3, 8]} />
          <meshStandardMaterial color={cfg.accentColor} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

export default function PlayerCharacter({ position, charClass, name, hp, maxHp, isMoving }: PlayerCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bobRef = useRef(0);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      if (isMoving) {
        bobRef.current += delta * 8;
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(bobRef.current)) * 0.08;
      } else {
        groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.03;
        bobRef.current = 0;
      }
    }
  });

  const hpRatio = Math.max(0, hp / maxHp);

  return (
    <group ref={groupRef} position={position}>
      <CharacterMesh charClass={charClass} />
      {/* HP bar + name label */}
      <Billboard position={[0, 2.2, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 0.22, 0]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1, 0.12]} />
          <meshBasicMaterial color="#1a1a1a" transparent opacity={0.7} />
        </mesh>
        <mesh position={[-(1 - hpRatio) * 0.5, 0, 0.01]}>
          <planeGeometry args={[hpRatio, 0.12]} />
          <meshBasicMaterial color={hpRatio > 0.5 ? "#22cc44" : hpRatio > 0.25 ? "#ffaa00" : "#ff2222"} />
        </mesh>
      </Billboard>
      {/* Ground shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
