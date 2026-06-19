import { useRef } from "react";
import { Sky, Stars, Cloud, Environment as DreiEnv } from "@react-three/drei";
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
  hasClouds: boolean;
  hasStars: boolean;
  skyTurbidity: number;
  skyRayleigh: number;
}> = {
  1: { sunPosition: [100, 60, -200], fogColor: "#8fbc8f", fogNear: 60, fogFar: 180, ambientColor: "#90c090", ambientIntensity: 0.6, sunColor: "#fffadd", sunIntensity: 2.5, hasClouds: true, hasStars: false, skyTurbidity: 8, skyRayleigh: 2 },
  2: { sunPosition: [200, 30, -100], fogColor: "#d4956a", fogNear: 50, fogFar: 160, ambientColor: "#d4956a", ambientIntensity: 0.7, sunColor: "#ffcc44", sunIntensity: 3.5, hasClouds: false, hasStars: false, skyTurbidity: 20, skyRayleigh: 3 },
  3: { sunPosition: [-100, 20, -200], fogColor: "#aaccdd", fogNear: 30, fogFar: 120, ambientColor: "#aaccee", ambientIntensity: 0.5, sunColor: "#ccddff", sunIntensity: 1.5, hasClouds: true, hasStars: false, skyTurbidity: 4, skyRayleigh: 1 },
  4: { sunPosition: [0, 10, -200], fogColor: "#3a0a00", fogNear: 20, fogFar: 100, ambientColor: "#ff4400", ambientIntensity: 0.4, sunColor: "#ff3300", sunIntensity: 1.5, hasClouds: false, hasStars: false, skyTurbidity: 30, skyRayleigh: 5 },
  5: { sunPosition: [-50, -10, -200], fogColor: "#050218", fogNear: 40, fogFar: 130, ambientColor: "#220044", ambientIntensity: 0.3, sunColor: "#8866ff", sunIntensity: 1.0, hasClouds: false, hasStars: true, skyTurbidity: 1, skyRayleigh: 0.1 },
};

function LavaGlow() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(clock.elapsedTime * 3) * 0.8;
    }
  });
  return <pointLight ref={lightRef} position={[20, 5, 10]} color="#ff3300" intensity={2} distance={60} />;
}

function MagicOrbs() {
  const orbs = [
    { pos: [15, 8, -20] as [number, number, number], color: "#aa44ff", speed: 1.2 },
    { pos: [-25, 12, 10] as [number, number, number], color: "#4488ff", speed: 0.8 },
    { pos: [5, 15, 30] as [number, number, number], color: "#ff44aa", speed: 1.5 },
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
      ref.current.position.y = pos[1] + Math.sin(clock.elapsedTime * speed) * 3;
      ref.current.rotation.y += 0.01 * speed;
    }
  });
  return (
    <group ref={ref} position={pos}>
      <pointLight color={color} intensity={3} distance={30} />
      <mesh>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
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
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {env.hasClouds && (
        <>
          <Cloud position={[-40, 40, -60]} speed={0.2} opacity={0.6} segments={20} />
          <Cloud position={[50, 50, -80]} speed={0.15} opacity={0.4} segments={15} />
          <Cloud position={[10, 45, 40]} speed={0.25} opacity={0.5} segments={18} />
        </>
      )}

      {biome === 4 && <LavaGlow />}
      {biome === 5 && <MagicOrbs />}
    </>
  );
}
