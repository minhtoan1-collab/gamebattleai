import { useRef } from "react";
import { Sky, Stars, Cloud } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface EnvironmentProps {
  biome: number;
}

const BIOME_ENV: Record<number, {
  sunPosition: [number, number, number];
  fogColor: string;
  fogNear: number;
  fogFar: number;
  ambientColor: string;
  ambientIntensity: number;
  sunColor: string;
  sunIntensity: number;
  fillColor: string;
  fillIntensity: number;
  hasClouds: boolean;
  hasStars: boolean;
  skyTurbidity: number;
  skyRayleigh: number;
}> = {
  1: {
    sunPosition: [100, 80, -200], fogColor: "#b8e0b8", fogNear: 80, fogFar: 200,
    ambientColor: "#c8f0c8", ambientIntensity: 1.8,
    sunColor: "#fffbee", sunIntensity: 4.0,
    fillColor: "#88ccff", fillIntensity: 1.2,
    hasClouds: true, hasStars: false, skyTurbidity: 6, skyRayleigh: 2,
  },
  2: {
    sunPosition: [200, 50, -100], fogColor: "#e8c090", fogNear: 70, fogFar: 180,
    ambientColor: "#ffe0a0", ambientIntensity: 2.0,
    sunColor: "#ffdd44", sunIntensity: 5.0,
    fillColor: "#ffaa44", fillIntensity: 1.0,
    hasClouds: false, hasStars: false, skyTurbidity: 18, skyRayleigh: 3,
  },
  3: {
    sunPosition: [-100, 40, -200], fogColor: "#cce8f0", fogNear: 50, fogFar: 150,
    ambientColor: "#d0eeff", ambientIntensity: 1.6,
    sunColor: "#ddeeff", sunIntensity: 3.0,
    fillColor: "#aaccff", fillIntensity: 1.4,
    hasClouds: true, hasStars: false, skyTurbidity: 4, skyRayleigh: 1,
  },
  4: {
    sunPosition: [0, 20, -200], fogColor: "#5a1500", fogNear: 30, fogFar: 120,
    ambientColor: "#ff6620", ambientIntensity: 1.2,
    sunColor: "#ff4400", sunIntensity: 3.0,
    fillColor: "#ff2200", fillIntensity: 1.5,
    hasClouds: false, hasStars: false, skyTurbidity: 28, skyRayleigh: 5,
  },
  5: {
    sunPosition: [-50, 10, -200], fogColor: "#080230", fogNear: 60, fogFar: 160,
    ambientColor: "#6644aa", ambientIntensity: 1.0,
    sunColor: "#aa88ff", sunIntensity: 2.0,
    fillColor: "#4422cc", fillIntensity: 0.8,
    hasClouds: false, hasStars: true, skyTurbidity: 1, skyRayleigh: 0.1,
  },
};

function LavaGlow() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 4 + Math.sin(clock.elapsedTime * 3) * 1.5;
    }
  });
  return (
    <>
      <pointLight ref={lightRef} position={[20, 5, 10]} color="#ff4400" intensity={4} distance={80} />
      <pointLight position={[-20, 3, -15]} color="#ff2200" intensity={3} distance={60} />
    </>
  );
}

function MagicOrbs() {
  const orbs: { pos: [number, number, number]; color: string; speed: number }[] = [
    { pos: [15, 10, -20], color: "#cc66ff", speed: 1.2 },
    { pos: [-25, 15, 10], color: "#6688ff", speed: 0.8 },
    { pos: [5, 18, 30], color: "#ff66cc", speed: 1.5 },
    { pos: [-10, 8, -35], color: "#66ffcc", speed: 1.0 },
  ];
  return (
    <>
      {orbs.map((orb, i) => (
        <OrbLight key={i} {...orb} />
      ))}
    </>
  );
}

function OrbLight({ pos, color, speed }: { pos: [number, number, number]; color: string; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(clock.elapsedTime * speed) * 4;
      ref.current.rotation.y += 0.01 * speed;
    }
  });
  return (
    <group ref={ref} position={pos}>
      <pointLight color={color} intensity={5} distance={40} />
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
      </mesh>
    </group>
  );
}

export default function WorldEnvironment({ biome }: EnvironmentProps) {
  const env = BIOME_ENV[biome] ?? BIOME_ENV[1];

  return (
    <>
      <fog attach="fog" color={env.fogColor} near={env.fogNear} far={env.fogFar} />

      <Sky
        distance={45000}
        sunPosition={env.sunPosition}
        inclination={0}
        azimuth={0.25}
        turbidity={env.skyTurbidity}
        rayleigh={env.skyRayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      {env.hasStars && <Stars radius={100} depth={60} count={8000} factor={5} saturation={0.5} fade speed={0.5} />}

      <ambientLight color={env.ambientColor} intensity={env.ambientIntensity} />

      <directionalLight
        color={env.sunColor}
        intensity={env.sunIntensity}
        position={env.sunPosition}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={300}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />

      <directionalLight
        color={env.fillColor}
        intensity={env.fillIntensity}
        position={[-env.sunPosition[0] * 0.3, 30, env.sunPosition[2] * 0.5]}
      />

      {env.hasClouds && (
        <>
          <Cloud position={[-40, 45, -60]} speed={0.2} opacity={0.7} segments={20} />
          <Cloud position={[50, 55, -80]} speed={0.15} opacity={0.5} segments={15} />
          <Cloud position={[10, 50, 40]} speed={0.25} opacity={0.6} segments={18} />
        </>
      )}

      {biome === 4 && <LavaGlow />}
      {biome === 5 && <MagicOrbs />}
    </>
  );
}
