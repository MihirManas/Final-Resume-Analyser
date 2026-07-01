"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ===================== GLOWING PLATFORM RINGS =====================
const Platform = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  const rings = [
    { r: 2.5, thick: 0.015, op: 0.8 },
    { r: 2.1, thick: 0.012, op: 0.5 },
    { r: 1.6, thick: 0.010, op: 0.3 },
    { r: 1.0, thick: 0.008, op: 0.2 },
  ];

  return (
    <group position={[0, -2.5, 0]} rotation={[Math.PI / 2.3, 0, 0]} ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i}>
          <torusGeometry args={[ring.r, ring.thick, 32, 100]} />
          <meshBasicMaterial color={new THREE.Color(0.0, 0.5, 1.0).multiplyScalar(2.0)} transparent opacity={ring.op} />
        </mesh>
      ))}
      
      {/* Platform inner glow */}
      <mesh>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.3, 0.8)} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ===================== VERTICAL LIGHT RAYS =====================
const LightRays = () => {
  const shader = {
    uniforms: { uColor: { value: new THREE.Color(0.0, 0.5, 1.0).multiplyScalar(1.5) } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float alpha = smoothstep(1.0, 0.0, vUv.y) * smoothstep(0.0, 0.2, vUv.y);
        float streak = sin(vUv.x * 40.0) * 0.5 + 0.5;
        alpha *= mix(0.2, 0.8, streak);
        gl_FragColor = vec4(uColor, alpha * 0.4);
      }
    `
  };

  return (
    <mesh position={[0, -0.5, -0.5]} scale={[4, 5, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial args={[{
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }]} />
    </mesh>
  );
};

// ===================== DOCUMENT PLANE =====================
const DocumentMesh = ({ texture, visible }) => {
  const meshRef = useRef();
  
  const DOC_W = 2.8;
  const DOC_H = 3.96; // 1:1.414 aspect ratio (A4)
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Gentle floating bob
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    
    // Fade in/out based on visibility
    const targetOpacity = visible ? 1 : 0;
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, targetOpacity, 0.05);
  });

  return (
    <group>
      {/* The actual PDF Plane */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[DOC_W, DOC_H]} />
        {texture ? (
           <meshBasicMaterial map={texture} transparent opacity={0} color="#e0e0e0" />
        ) : (
           <meshBasicMaterial transparent opacity={0} color="#ffffff" />
        )}
      </mesh>
      
      {/* Glowing Edges Border */}
      {visible && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[DOC_W + 0.04, DOC_H + 0.04]} />
          <meshBasicMaterial color={new THREE.Color(0.0, 0.5, 1.0).multiplyScalar(2.0)} wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

// ===================== MAIN COMPONENT =====================
export default function HolographicResume({ file, currentStep }) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!file) {
      setTexture(null);
      return;
    }
    const load = async () => {
      try {
        const url = URL.createObjectURL(file);
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 3 });
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, c.width, c.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 16;
        setTexture(t);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('PDF error:', e);
      }
    };
    load();
  }, [file]);

  // Show document only if step > 1 (meaning file is uploaded and they are on Role/JD/Challenges)
  const showDocument = currentStep > 1 && file != null;

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ toneMapping: THREE.NoToneMapping, alpha: true }}>
      <ambientLight intensity={0.5} />
      
      <Platform />
      <LightRays />
      <DocumentMesh texture={texture} visible={showDocument} />
      
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.3} intensity={1.5} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
