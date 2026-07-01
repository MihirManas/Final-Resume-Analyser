"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const STAGES = [
  { title: 'INITIALIZING ANALYSIS', subtitle: 'Preparing your resume for deep analysis...' },
  { title: 'SCANNING DOCUMENT', subtitle: 'Reading through your resume...' },
  { title: 'EXTRACTING SECTIONS', subtitle: 'Identifying key sections and content...' },
  { title: 'ANALYZING CONTENT', subtitle: 'Understanding your experience and skills...' },
  { title: 'PROCESSING DATA', subtitle: 'Running advanced AI algorithms...' },
  { title: 'BUILDING INSIGHTS', subtitle: 'Generating personalized insights...' },
  { title: 'RECONSTRUCTING RESUME', subtitle: 'Rebuilding your data in 3D...' },
  { title: 'FINALIZING ANALYSIS', subtitle: 'Almost done...' },
  { title: 'ANALYSIS COMPLETE', subtitle: 'Redirecting to your results...' },
];
const STAGE_DURATIONS = [3, 3, 3, 3.5, 4, 3.5, 4, 3.5, 3];
const MAX_AUTO_STAGE = 7;

// ===================== PARTICLE CUBES STREAMS =====================
const StreamShader = {
  uniforms: { uTime: { value: 0 }, uStage: { value: 0 } },
  vertexShader: `
    uniform float uTime;
    uniform float uStage;
    
    attribute float aCurveIndex; 
    attribute float aOffset;
    attribute float aSize;
    attribute vec3 aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // Colors matching image exactly
      vec3 colBlue = vec3(0.0, 0.6, 1.0) * 3.0;
      vec3 colPurple = vec3(0.6, 0.0, 1.0) * 2.5;
      vec3 colGreen = vec3(0.0, 1.0, 0.4) * 2.5;
      vec3 colOrange = vec3(1.0, 0.4, 0.0) * 3.0;
      
      vec3 color = colBlue;
      float splitPhase = smoothstep(2.0, 3.0, uStage);
      if (aCurveIndex > 0.5 && aCurveIndex < 1.5) color = mix(colBlue, colPurple, splitPhase);
      if (aCurveIndex > 1.5 && aCurveIndex < 2.5) color = mix(colBlue, colGreen, splitPhase);
      if (aCurveIndex > 2.5) color = mix(colBlue, colOrange, splitPhase);
      
      // Core Brightness
      if (aSize > 0.1) color = mix(color, vec3(1.0,1.0,1.0)*2.0, 0.4);
      vColor = color;
      
      float speed = mix(0.1, 0.25, smoothstep(2.0, 5.0, uStage));
      float progress = fract(aOffset + uTime * speed);
      
      float startX = -9.0;
      float endX = 3.0; // Central Core X Position
      vec3 corePos = vec3(3.0, 0.0, 0.0);
      
      vec3 pos = vec3(mix(startX, endX, progress), 0.0, 0.0);
      
      float waveFreq = 1.2;
      float waveAmp = 1.5;
      pos.y = sin(progress * waveFreq * 3.14159 + uTime) * waveAmp;
      pos.z = cos(progress * waveFreq * 3.14159 + uTime * 0.5) * waveAmp * 0.5;
      
      // Stream Spread
      if (uStage >= 2.0) {
        float spreadAmount = mix(0.0, 1.8, smoothstep(2.0, 3.0, uStage));
        if (aCurveIndex == 0.0) pos.y += spreadAmount * 0.9;
        if (aCurveIndex == 1.0) pos.y += spreadAmount * 0.3;
        if (aCurveIndex == 2.0) pos.y -= spreadAmount * 0.3;
        if (aCurveIndex == 3.0) pos.y -= spreadAmount * 0.9;
        
        // Converge to Cube Core
        float convergePhase = smoothstep(3.5, 4.5, uStage);
        if (convergePhase > 0.0) {
           vec3 targetPoint = corePos + vec3(-1.0, (aCurveIndex - 1.5) * 0.3, aRandom.z * 0.5);
           float pull = pow(progress, 2.0) * convergePhase;
           pos = mix(pos, targetPoint, pull);
        }
      }
      
      pos += aRandom * mix(0.1, 0.6, smoothstep(1.0, 3.0, uStage));
      
      vAlpha = smoothstep(0.0, 0.1, progress) * smoothstep(1.0, 0.8, progress);
      vAlpha *= (1.0 - smoothstep(6.0, 7.0, uStage)); // Fade out when resume builds
      
      // Spin the cubes
      float angle = uTime * 2.0 + aOffset * 10.0;
      float s = sin(angle); float c = cos(angle);
      mat3 rotY = mat3(c, 0, s, 0, 1, 0, -s, 0, c);
      mat3 rotX = mat3(1, 0, 0, 0, c, -s, 0, s, c);
      
      vec3 finalPos = pos + rotX * rotY * position * aSize;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      if (vAlpha < 0.01) discard;
      // Solid glowing cubes with bright edges (pseudo-wireframe look)
      gl_FragColor = vec4(vColor, vAlpha * 0.8);
    }
  `
};

const ParticleStreams = ({ currentStage }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const count = 3000;
  
  const { offsets, curveIndices, sizes, randoms } = useMemo(() => {
    const offsets = new Float32Array(count);
    const curveIndices = new Float32Array(count);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      offsets[i] = Math.random();
      curveIndices[i] = i % 4;
      const rand = Math.random();
      // Most are small, some are huge hero cubes
      sizes[i] = rand > 0.98 ? 0.3 : (rand > 0.9 ? 0.15 : 0.03 + Math.random() * 0.05);
      randoms[i*3] = (Math.random() - 0.5) * 2;
      randoms[i*3+1] = (Math.random() - 0.5) * 2;
      randoms[i*3+2] = (Math.random() - 0.5) * 2;
    }
    return { offsets, curveIndices, sizes, randoms };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uStage.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uStage.value, currentStage, 0.05
      );
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      {/* BoxGeometry creates exactly what was shown in the image */}
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
        <instancedBufferAttribute attach="attributes-aCurveIndex" args={[curveIndices, 1]} />
        <instancedBufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 3]} />
      </boxGeometry>
      <shaderMaterial 
        ref={materialRef}
        args={[{
          uniforms: StreamShader.uniforms,
          vertexShader: StreamShader.vertexShader,
          fragmentShader: StreamShader.fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        }]} 
      />
    </instancedMesh>
  );
};

// ===================== PROCESSING CORE / DOCUMENT MORPH =====================
const DOC_W = 2.8;
const DOC_H = 3.96;
const FOLD = 0.4;

const DocumentShader = {
  uniforms: { tDiffuse: { value: null }, uOpacity: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = vec2((position.x + ${DOC_W / 2.0}) / ${DOC_W}, (position.y + ${DOC_H / 2.0}) / ${DOC_H});
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      vec3 inverted = 1.0 - texColor.rgb;
      vec3 tinted = inverted * vec3(0.5, 0.8, 1.0) + vec3(0.0, 0.1, 0.2);
      float alpha = mix(0.7, 1.0, max(inverted.r, max(inverted.g, inverted.b)));
      gl_FragColor = vec4(tinted, uOpacity * alpha);
    }
  `
};

const ProcessingCore = ({ currentStage, texture }) => {
  const coreRef = useRef();
  const documentRef = useRef();
  
  useFrame((state, delta) => {
    if (!coreRef.current || !documentRef.current) return;
    
    const showCore = currentStage >= 4;
    const morphToDocument = currentStage >= 6;
    
    // Core scales up during stages 4-5
    let coreScale = showCore ? (morphToDocument ? 0 : 1.5) : 0.01;
    let coreOpacity = showCore ? (morphToDocument ? 0 : 1.0) : 0.0;
    
    coreRef.current.scale.lerp(new THREE.Vector3(coreScale, coreScale, coreScale), 0.05);
    coreRef.current.material.opacity = THREE.MathUtils.lerp(coreRef.current.material.opacity, coreOpacity, 0.1);
    
    // Spin the core
    if (showCore && !morphToDocument) {
      coreRef.current.rotation.y += delta * 0.5;
      coreRef.current.rotation.x += delta * 0.3;
    }

    // Document fades in and bobs slightly
    let docOpacityTarget = morphToDocument ? 1.0 : 0.0;
    if (documentRef.current.material.uniforms) {
      documentRef.current.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        documentRef.current.material.uniforms.uOpacity.value, docOpacityTarget, 0.04
      );
    }
    
    if (morphToDocument) {
      documentRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
  });

  const docGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-DOC_W/2, -DOC_H/2);
    shape.lineTo(DOC_W/2, -DOC_H/2);
    shape.lineTo(DOC_W/2, DOC_H/2 - FOLD);
    shape.lineTo(DOC_W/2 - FOLD, DOC_H/2);
    shape.lineTo(-DOC_W/2, DOC_H/2);
    shape.lineTo(-DOC_W/2, -DOC_H/2);
    return new THREE.ShapeGeometry(shape);
  }, []);

  const edges = useMemo(() => new THREE.EdgesGeometry(docGeometry), [docGeometry]);

  return (
    <group position={[3.0, 0, 0]}>
      {/* Wireframe Data Core */}
      <mesh ref={coreRef} scale={[0.01, 0.01, 0.01]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.6, 1.0).multiplyScalar(2.0)} wireframe transparent opacity={0} blending={THREE.AdditiveBlending} />
        {/* Inner solid core */}
        <mesh scale={[0.6, 0.6, 0.6]}>
           <boxGeometry args={[1, 1, 1]} />
           <meshBasicMaterial color={new THREE.Color(0.0, 0.3, 1.0).multiplyScalar(3.0)} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
      </mesh>
      
      {/* Target Document */}
      <mesh ref={documentRef} geometry={docGeometry} position={[0, 0, 0.01]}>
        {texture ? (
           <shaderMaterial args={[{
             uniforms: { tDiffuse: { value: texture }, uOpacity: { value: 0 } },
             vertexShader: DocumentShader.vertexShader,
             fragmentShader: DocumentShader.fragmentShader,
             transparent: true,
             side: THREE.DoubleSide
           }]} />
        ) : (
           <meshBasicMaterial color="#010409" transparent opacity={0} side={THREE.DoubleSide} />
        )}
        {/* Edge Glow for Document */}
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={new THREE.Color(0.0, 0.5, 1.0).multiplyScalar(2.0)} transparent opacity={0.5} />
        </lineSegments>
      </mesh>
    </group>
  );
};

// ===================== GLOWING PLATFORM =====================
const Platform = ({ currentStage }) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
  });
  
  // Platform appears under the core location
  return (
    <group position={[3.0, -2.5, 0]} rotation={[Math.PI / 2.3, 0, 0]} ref={groupRef}>
      <mesh>
        <torusGeometry args={[2.8, 0.015, 32, 100]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.4, 1.0).multiplyScalar(2.0)} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.0, 0.01, 16, 100]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.4, 1.0).multiplyScalar(1.5)} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.3, 0.8)} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ===================== CSS OVERLAYS =====================
const LabelsOverlay = ({ currentStage }) => {
  const visible = currentStage >= 2 && currentStage <= 4;
  
  const labels = [
    { text: 'EXPERIENCE', color: '#0066ff', top: '35%', left: '10%', linePath: 'M 50,30 L 150,150' },
    { text: 'SKILLS', color: '#8800ff', top: '25%', left: '30%', linePath: 'M 50,30 L 70,180' },
    { text: 'PROJECTS', color: '#00ff44', top: '30%', left: '50%', linePath: 'M 50,30 L -10,160' },
    { text: 'EDUCATION', color: '#ff6600', top: '40%', left: '75%', linePath: 'M 50,30 L -150,120' },
  ];

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {labels.map((lbl, i) => (
        <div 
          key={i} 
          className="absolute" 
          style={{ 
            top: lbl.top, left: lbl.left,
            animation: `fadeIn 0.5s ${i * 0.2}s ease-out both` 
          }}
        >
          <div 
            className="px-4 py-1.5 border rounded-lg text-[10px] font-bold tracking-widest bg-[#010409]/90 backdrop-blur-md"
            style={{ borderColor: lbl.color, color: 'white', boxShadow: `0 0 15px ${lbl.color}60` }}
          >
            {lbl.text}
          </div>
          <svg className="absolute top-full left-1/2 overflow-visible" style={{ width: 1, height: 1 }}>
             <path 
               d={lbl.linePath} fill="none" stroke={lbl.color} strokeWidth="1" opacity="0.6"
               strokeDasharray="2 4" style={{ animation: 'dash 15s linear infinite' }}
             />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dash { to { stroke-dashoffset: -200; } }
      `}</style>
    </div>
  );
};


// ===================== MAIN COMPONENT =====================
export default function AnalysisAnimation({ file, onCancel }) {
  const [texture, setTexture] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!file) return;
    const load = async () => {
      try {
        const url = URL.createObjectURL(file);
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 5 });
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, c.width, c.height);
        
        await page.render({ canvasContext: ctx, viewport: vp, background: 'rgba(255,255,255,1)' }).promise;
        
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 16;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = true;
        setTexture(t);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('PDF error:', e);
      }
    };
    load();
  }, [file]);

  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      let acc = 0;
      for (let i = 0; i <= MAX_AUTO_STAGE; i++) {
        if (elapsed < acc + STAGE_DURATIONS[i]) {
          setCurrentStage(i);
          return;
        }
        acc += STAGE_DURATIONS[i];
      }
      setCurrentStage(MAX_AUTO_STAGE);
    }, 100);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#010409] overflow-hidden flex items-center justify-center">
      
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ toneMapping: THREE.NoToneMapping, alpha: false }} style={{ background: '#010409' }}>
        <ambientLight intensity={0.5} />
        <ParticleStreams currentStage={currentStage} />
        <ProcessingCore currentStage={currentStage} texture={texture} />
        <Platform currentStage={currentStage} />
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.4} intensity={2.5} mipmapBlur />
        </EffectComposer>
      </Canvas>

      <LabelsOverlay currentStage={currentStage} />

      <div className="absolute top-12 left-12 z-50 pointer-events-none flex flex-col gap-2 transition-opacity duration-300" key={currentStage}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#010409] border border-[#0066ff]/40 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(0,102,255,0.3)]">
            {currentStage + 1}
          </div>
          <h2 className="text-xl font-bold tracking-[0.15em] text-white uppercase animate-[fadeInLeft_0.5s_ease-out]">
            {STAGES[currentStage]?.title || 'ANALYZING'}
          </h2>
        </div>
        <p className="text-white/50 text-sm ml-14 animate-[fadeIn_0.5s_0.2s_both]">
          {STAGES[currentStage]?.subtitle || 'Please wait...'}
        </p>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
        <button onClick={onCancel} className="px-6 py-2 border border-white/10 text-white/40 hover:text-white bg-[#010409]/50 hover:bg-white/10 rounded-full transition-all text-sm tracking-wider uppercase backdrop-blur-md">
          Cancel Analysis
        </button>
      </div>

      <style>{`
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
