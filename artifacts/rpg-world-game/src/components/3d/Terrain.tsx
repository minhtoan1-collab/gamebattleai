import { useMemo, useRef } from "react";
import * as THREE from "three";

interface TerrainProps {
  biome: number;
  size?: number;
  segments?: number;
}

const BIOME_COLORS: Record<number, { base: string; high: string; low: string; water?: string }> = {
  1: { base: "#3a8a2a", high: "#78c840", low: "#1e6010", water: "#1a6090" },
  2: { base: "#e0b464", high: "#f8d884", low: "#b87c28", water: "#c09830" },
  3: { base: "#e0eef8", high: "#ffffff", low: "#90b8d8" },
  4: { base: "#6a1a00", high: "#aa2800", low: "#ff3300" },
  5: { base: "#2a0a5a", high: "#6030aa", low: "#0a0528" },
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

export default function Terrain({ biome, size = 200, segments = 100 }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const colorsArr = new Float32Array(positions.count * 3);
    const bc = BIOME_COLORS[biome] ?? BIOME_COLORS[1];

    const baseColor = new THREE.Color(bc.base);
    const highColor = new THREE.Color(bc.high);
    const lowColor = new THREE.Color(bc.low);

    const heightScale = biome === 3 ? 20 : biome === 4 ? 16 : biome === 2 ? 8 : biome === 5 ? 24 : 12;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      const distFromCenter = Math.sqrt(x * x + z * z) / (size * 0.5);
      const edgeFade = Math.max(0, 1 - distFromCenter * 1.1);

      let h = noise(x, z) * heightScale * edgeFade;

      if (biome === 3) {
        h = Math.abs(h) * 1.2 + noise(x * 2, z * 2) * 4;
      } else if (biome === 4) {
        h = Math.abs(h) * 1.4;
        const craterDist = Math.sqrt((x - 20) ** 2 + (z - 10) ** 2);
        if (craterDist < 25) h = Math.max(0, h - (25 - craterDist) * 0.6);
      } else if (biome === 5) {
        h = noise(x * 0.5, z * 0.5) * heightScale + Math.sin(x * 0.2) * Math.cos(z * 0.2) * 10;
      }

      positions.setY(i, h);

      const t = Math.max(0, Math.min(1, (h / heightScale + 1) / 2));
      let col: THREE.Color;
      if (t > 0.65) {
        col = new THREE.Color().lerpColors(baseColor, highColor, (t - 0.65) / 0.35);
      } else {
        col = new THREE.Color().lerpColors(lowColor, baseColor, t / 0.65);
      }

      // Lava for biome 4 at low points
      if (biome === 4 && h < 1.5) {
        col.set("#ff2200").multiplyScalar(0.5 + Math.random() * 0.4);
      }

      colorsArr[i * 3] = col.r;
      colorsArr[i * 3 + 1] = col.g;
      colorsArr[i * 3 + 2] = col.b;
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colorsArr, 3));
    geo.computeVertexNormals();
    return { geometry: geo };
  }, [biome, size, segments]);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.7}
        metalness={biome === 4 ? 0.1 : 0.0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

export function getTerrainHeight(x: number, z: number, biome: number): number {
  const size = 200;
  const distFromCenter = Math.sqrt(x * x + z * z) / (size * 0.5);
  const edgeFade = Math.max(0, 1 - distFromCenter * 1.1);
  const heightScale = biome === 3 ? 20 : biome === 4 ? 16 : biome === 2 ? 8 : biome === 5 ? 24 : 12;
  let h = noise(x, z) * heightScale * edgeFade;
  if (biome === 3) h = Math.abs(h) * 1.2 + noise(x * 2, z * 2) * 4;
  else if (biome === 4) h = Math.abs(h) * 1.4;
  return h;
}
