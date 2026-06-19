import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface TerrainProps {
  biome: number;
  size?: number;
  segments?: number;
}

const BIOME_COLORS: Record<number, { base: string; high: string; low: string }> = {
  1: { base: "#2d6a2d", high: "#5a8a3a", low: "#1a4a1a" },
  2: { base: "#c8a45a", high: "#e8c87a", low: "#a07a30" },
  3: { base: "#c8dce8", high: "#ffffff", low: "#8aaccc" },
  4: { base: "#3a1a0a", high: "#5a2a10", low: "#7a1a00" },
  5: { base: "#1a0a3a", high: "#3a1a6a", low: "#0a0520" },
};

function noise(x: number, z: number, octaves = 6): number {
  let val = 0;
  let amp = 1;
  let freq = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    val += Math.sin(x * freq * 0.15 + i * 2.3) * Math.cos(z * freq * 0.13 + i * 1.7) * amp;
    val += Math.sin(x * freq * 0.07 + z * freq * 0.09 + i * 3.1) * amp * 0.5;
    max += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return val / max;
}

export default function Terrain({ biome, size = 200, segments = 120 }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const colorsArr = new Float32Array(positions.count * 3);
    const biomeColors = BIOME_COLORS[biome] ?? BIOME_COLORS[1];

    const baseColor = new THREE.Color(biomeColors.base);
    const highColor = new THREE.Color(biomeColors.high);
    const lowColor = new THREE.Color(biomeColors.low);

    const heightScale = biome === 3 ? 18 : biome === 4 ? 14 : biome === 2 ? 6 : biome === 5 ? 22 : 10;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      const distFromCenter = Math.sqrt(x * x + z * z) / (size * 0.5);
      const edgeFade = Math.max(0, 1 - distFromCenter * 1.2);

      let h = noise(x, z) * heightScale * edgeFade;

      if (biome === 3) {
        h = Math.abs(h) + noise(x * 2, z * 2) * 3;
      } else if (biome === 4) {
        h = Math.abs(h) * 1.2;
        const craterDist = Math.sqrt((x - 20) ** 2 + (z - 10) ** 2);
        if (craterDist < 25) h = Math.max(0, h - (25 - craterDist) * 0.5);
      } else if (biome === 5) {
        h = noise(x * 0.5, z * 0.5) * heightScale + Math.sin(x * 0.2) * Math.cos(z * 0.2) * 8;
      }

      positions.setY(i, h);

      const t = Math.max(0, Math.min(1, (h / heightScale + 1) / 2));
      const col = new THREE.Color().lerpColors(lowColor, t > 0.6 ? highColor : baseColor, t > 0.6 ? (t - 0.6) / 0.4 : t / 0.6);

      if (biome === 4 && h < 1) {
        col.set("#ff2200").multiplyScalar(0.4 + Math.random() * 0.3);
      }

      colorsArr[i * 3] = col.r;
      colorsArr[i * 3 + 1] = col.g;
      colorsArr[i * 3 + 2] = col.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colorsArr, 3));
    geo.computeVertexNormals();
    return { geometry: geo, colors: colorsArr };
  }, [biome, size, segments]);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.85}
        metalness={biome === 4 ? 0.2 : 0.05}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

export function getTerrainHeight(x: number, z: number, biome: number): number {
  const size = 200;
  const distFromCenter = Math.sqrt(x * x + z * z) / (size * 0.5);
  const edgeFade = Math.max(0, 1 - distFromCenter * 1.2);
  const heightScale = biome === 3 ? 18 : biome === 4 ? 14 : biome === 2 ? 6 : biome === 5 ? 22 : 10;
  let h = noise(x, z) * heightScale * edgeFade;
  if (biome === 3) h = Math.abs(h) + noise(x * 2, z * 2) * 3;
  else if (biome === 4) h = Math.abs(h) * 1.2;
  return h;
}
