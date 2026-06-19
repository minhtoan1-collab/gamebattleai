import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ParticleSystemProps {
  position: [number, number, number];
  color: string;
  count?: number;
  speed?: number;
  size?: number;
  lifetime?: number;
  type?: "burst" | "stream" | "orbit";
}

export function ParticleSystem({ position, color, count = 40, speed = 3, size = 0.08, type = "burst" }: ParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const { positions, velocities, lifetimes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      if (type === "orbit") {
        const angle = (i / count) * Math.PI * 2;
        pos[i * 3] = Math.cos(angle) * 0.5;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = Math.sin(angle) * 0.5;
        vel[i * 3] = -Math.sin(angle) * speed * 0.5;
        vel[i * 3 + 1] = (Math.random() - 0.5) * speed;
        vel[i * 3 + 2] = Math.cos(angle) * speed * 0.5;
      } else {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[i * 3] = 0; pos[i * 3 + 1] = 0; pos[i * 3 + 2] = 0;
        vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed * (0.5 + Math.random());
        vel[i * 3 + 1] = Math.abs(Math.cos(phi)) * speed + Math.random() * speed;
        vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * (0.5 + Math.random());
      }
      life[i] = Math.random();
    }
    return { positions: pos, velocities: vel, lifetimes: life };
  }, [count, speed, type]);

  const currentPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    timeRef.current += delta;

    for (let i = 0; i < count; i++) {
      lifetimes[i] -= delta * 1.5;
      if (lifetimes[i] <= 0) {
        lifetimes[i] = 1;
        currentPositions[i * 3] = positions[i * 3];
        currentPositions[i * 3 + 1] = positions[i * 3 + 1];
        currentPositions[i * 3 + 2] = positions[i * 3 + 2];
      }

      if (type === "orbit") {
        const t = timeRef.current;
        const angle = (i / count) * Math.PI * 2 + t * speed * 0.3;
        const r = 0.6 + Math.sin(t * 2 + i) * 0.2;
        currentPositions[i * 3] = Math.cos(angle) * r;
        currentPositions[i * 3 + 1] = Math.sin(t * 1.5 + i * 0.5) * 0.5;
        currentPositions[i * 3 + 2] = Math.sin(angle) * r;
      } else {
        currentPositions[i * 3] += velocities[i * 3] * delta * lifetimes[i];
        currentPositions[i * 3 + 1] += velocities[i * 3 + 1] * delta * lifetimes[i];
        currentPositions[i * 3 + 2] += velocities[i * 3 + 2] * delta * lifetimes[i];
        currentPositions[i * 3 + 1] -= delta * 2;
      }

      pos.setXYZ(i, currentPositions[i * 3], currentPositions[i * 3 + 1], currentPositions[i * 3 + 2]);
    }
    pos.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[currentPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={size}
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export function AttackSlash({ position, color = "#ffffff" }: { position: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.elapsedTime * 8;
      const s = 1 + Math.sin(clock.elapsedTime * 12) * 0.3;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <torusGeometry args={[0.6, 0.05, 4, 6, Math.PI * 1.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      <ParticleSystem position={[0, 0, 0]} color={color} count={20} speed={2} size={0.1} type="burst" />
    </group>
  );
}

export function MagicAura({ position, color = "#aa44ff" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <ParticleSystem position={[0, 0, 0]} color={color} count={50} speed={1.5} size={0.12} type="orbit" />
      <pointLight color={color} intensity={3} distance={8} />
    </group>
  );
}

export function HitEffect({ position, color = "#ff4444" }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <ParticleSystem position={[0, 0, 0]} color={color} count={30} speed={4} size={0.15} type="burst" />
    </group>
  );
}

export function HealEffect({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <ParticleSystem position={[0, 0.5, 0]} color="#44ff88" count={25} speed={1} size={0.1} type="stream" />
      <pointLight position={[0, 1, 0]} color="#44ff88" intensity={2} distance={6} />
    </group>
  );
}
