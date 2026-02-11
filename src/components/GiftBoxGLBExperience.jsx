"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";

export default function GiftBoxGLBExperience({ onReveal }) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0.9, 3.6], fov: 42 }}>
        <color attach="background" args={["#000"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 3]} intensity={1.2} />
        <Environment preset="city" />

        <GiftScene onReveal={onReveal} />

        {/* Optional: keep controls subtle */}
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-10">
        <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
          Click the present
        </div>
      </div>
    </div>
  );
}

function GiftScene({ onReveal }) {
  const groupRef = useRef();
  const lidRef = useRef();
  const [phase, setPhase] = useState("idle"); // idle -> lift -> zoom -> done
  const revealedOnce = useRef(false);

  // animation progress
  const liftT = useRef(0);
  const zoomT = useRef(0);

  // Load your exact GLB
  const gltf = useGLTF("/models/wrapped_present.glb");

  /**
   * Your GLB has 2 meshes:
   * - Mesh 0: the present wrapper/box
   * - Mesh 1: ribbon/bow
   *
   * Lid isn't separate, so we split Mesh 0 by height.
   */
  const { bodyGeom, lidGeom, bodyMat, ribbonMesh } = useMemo(() => {
    // find meshes in scene
    const meshes = [];
    gltf.scene.traverse((o) => {
      if (o.isMesh) meshes.push(o);
    });

    // Use biggest "box" mesh as base (usually first one)
    const boxMesh = meshes.reduce((a, b) => {
      const aSize = getMeshSize(a);
      const bSize = getMeshSize(b);
      return bSize > aSize ? b : a;
    }, meshes[0]);

    // other mesh = ribbon/bow
    const other = meshes.find((m) => m !== boxMesh) || null;

    // clone geometry so we can split safely
    const cloned = boxMesh.geometry.clone();
    cloned.computeBoundingBox();

    // split plane: we treat top ~20% as lid
    const bb = cloned.boundingBox;
    const zMin = bb.min.z;
    const zMax = bb.max.z;
    const cutZ = zMin + (zMax - zMin) * 0.82; // tweak if needed (0.78–0.86)

    const { lower, upper } = splitGeometryByZ(cloned, cutZ);

    return {
      bodyGeom: lower,
      lidGeom: upper,
      bodyMat: boxMesh.material,
      ribbonMesh: other,
    };
  }, [gltf]);

  useFrame((state, dt) => {
    const cam = state.camera;

    if (phase === "lift") {
      liftT.current = Math.min(1, liftT.current + dt * 0.9);
      const lift = easeOutCubic(liftT.current) * 0.55; // how far lid floats
      if (lidRef.current) lidRef.current.position.z = lift;

      if (liftT.current >= 1) setPhase("zoom");
    }

    if (phase === "zoom") {
      zoomT.current = Math.min(1, zoomT.current + dt * 0.7);

      // camera goes into the gap between lid and body
      const start = new THREE.Vector3(0, 0.9, 3.6);
      const end = new THREE.Vector3(0, 0.25, 0.65); // “inside”
      cam.position.lerpVectors(start, end, easeInOutCubic(zoomT.current));

      // look into the gap
      cam.lookAt(0, 0.25, 0.9);

      // hide 3D + reveal UI at the end
      if (zoomT.current >= 0.98 && !revealedOnce.current) {
        revealedOnce.current = true;
        setPhase("done");
        onReveal?.();
      }
    }

    // small idle rotation
    if (phase === "idle" && groupRef.current) {
      groupRef.current.rotation.y += dt * 0.25;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={() => phase === "idle" && setPhase("lift")}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    >
      {/* BODY (bottom) */}
      <mesh geometry={bodyGeom} material={bodyMat} castShadow receiveShadow />

      {/* LID (top) - floats upward */}
      <group ref={lidRef}>
        <mesh geometry={lidGeom} material={bodyMat} castShadow receiveShadow />
      </group>

      {/* Ribbon/Bow mesh stays in place (looks identical to GLB) */}
      {ribbonMesh ? (
        <primitive object={ribbonMesh.clone()} />
      ) : null}
    </group>
  );
}

/** Split a BufferGeometry into two by triangle centroid Z */
function splitGeometryByZ(geometry, cutZ) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry.clone();

  const pos = g.attributes.position.array;
  const triCount = pos.length / 9;

  const lower = [];
  const upper = [];

  for (let i = 0; i < triCount; i++) {
    const base = i * 9;

    const z1 = pos[base + 2];
    const z2 = pos[base + 5];
    const z3 = pos[base + 8];
    const cz = (z1 + z2 + z3) / 3;

    const target = cz < cutZ ? lower : upper;
    for (let k = 0; k < 9; k++) target.push(pos[base + k]);
  }

  const lowerGeom = new THREE.BufferGeometry();
  lowerGeom.setAttribute("position", new THREE.Float32BufferAttribute(lower, 3));
  lowerGeom.computeVertexNormals();

  const upperGeom = new THREE.BufferGeometry();
  upperGeom.setAttribute("position", new THREE.Float32BufferAttribute(upper, 3));
  upperGeom.computeVertexNormals();

  return { lower: lowerGeom, upper: upperGeom };
}

function getMeshSize(mesh) {
  const geom = mesh.geometry;
  geom.computeBoundingBox();
  const bb = geom.boundingBox;
  const size = new THREE.Vector3();
  bb.getSize(size);
  return size.length();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

useGLTF.preload("/models/wrapped_present.glb");
