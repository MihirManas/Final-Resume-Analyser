"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// ===================== STAGE DEFINITIONS =====================
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

// Exact color matching from the AI generated image (HDR multipliers for bloom)
const C_BLUE = new THREE.Color(0.0, 0.4, 1.0).multiplyScalar(4.0);
const C_PURPLE = new THREE.Color(0.5, 0.0, 1.0).multiplyScalar(3.0);
const C_GREEN = new THREE.Color(0.0, 1.0, 0.3).multiplyScalar(3.0);
const C_ORANGE = new THREE.Color(1.0, 0.3, 0.0).multiplyScalar(4.0);
const C_WHITE = new THREE.Color(1.0, 1.0, 1.0).multiplyScalar(2.0);

// ===================== HIGH FIDELITY PARTICLE STREAMS =====================
const StreamShader = {
  uniforms: {
    uTime: { value: 0 },
    uStage: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uStage;
    
    attribute float aCurveIndex; // 0=Blue, 1=Purple, 2=Green, 3=Orange
    attribute float aOffset;
    attribute float aSize;
    attribute vec3 aRandom;
    
    varying vec3 vColor;
    varying float vAlpha;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      
      // 1. Color Selection
      vec3 colBlue = vec3(0.0, 0.4, 1.0) * 4.0;
      vec3 colPurple = vec3(0.5, 0.0, 1.0) * 3.0;
      vec3 colGreen = vec3(0.0, 1.0, 0.3) * 3.0;
      vec3 colOrange = vec3(1.0, 0.3, 0.0) * 4.0;
      
      vec3 color = colBlue;
      float splitPhase = smoothstep(2.0, 3.0, uStage);
      if (aCurveIndex > 0.5 && aCurveIndex < 1.5) color = mix(colBlue, colPurple, splitPhase);
      if (aCurveIndex > 1.5 && aCurveIndex < 2.5) color = mix(colBlue, colGreen, splitPhase);
      if (aCurveIndex > 2.5) color = mix(colBlue, colOrange, splitPhase);
      
      // Occasionally mix in white for bright core particles
      if (aSize > 0.08) color = mix(color, vec3(1.0)*2.0, 0.5);
      
      vColor = color;
      
      // 2. Flow Progress (left to right)
      float speed = mix(0.12, 0.25, smoothstep(2.0, 5.0, uStage));
      float progress = fract(aOffset + uTime * speed);
      
      // 3. Mathematical Spline (Sine wave base)
      float startX = -8.0;
      float endX = 5.0;
      vec3 corePos = vec3(2.5, -0.5, 0.0);
      
      vec3 pos = vec3(mix(startX, endX, progress), 0.0, 0.0);
      
      float waveFreq = 1.5;
      float waveAmp = 1.2;
      pos.y = sin(progress * waveFreq * 3.14159 + uTime) * waveAmp;
      pos.z = cos(progress * waveFreq * 3.14159 + uTime * 0.7) * waveAmp * 0.5;
      
      // 4. Spread and Target (Stages 3+)
      if (uStage >= 2.0) {
        float spreadAmount = mix(0.0, 1.8, smoothstep(2.0, 3.0, uStage));
        
        if (aCurveIndex == 0.0) pos.y += spreadAmount * 0.9;
        if (aCurveIndex == 1.0) pos.y += spreadAmount * 0.3;
        if (aCurveIndex == 2.0) pos.y -= spreadAmount * 0.3;
        if (aCurveIndex == 3.0) pos.y -= spreadAmount * 0.9;
        
        // Converge to Core (Stage 4+)
        float convergePhase = smoothstep(3.0, 4.0, uStage);
        if (convergePhase > 0.0) {
           // Target left face of core
           vec3 targetPoint = corePos + vec3(-0.6, (aCurveIndex - 1.5) * 0.25, aRandom.z * 0.5);
           float pull = pow(progress, 2.5) * convergePhase;
           pos = mix(pos, targetPoint, pull);
        }
      }
      
      // Add particle specific random scatter
      pos += aRandom * mix(0.2, 0.5, smoothstep(1.0, 3.0, uStage));
      
      // 5. Alpha & Size
      vAlpha = smoothstep(0.0, 0.1, progress) * smoothstep(1.0, 0.8, progress);
      float fadeOutPhase = smoothstep(6.0, 7.0, uStage);
      vAlpha *= (1.0 - fadeOutPhase);
      
      // Billboard the plane to face camera (simple approach: cancel out view matrix rotation)
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      mvPosition.xy += (position.xy * aSize); // apply size after matrix to keep them facing screen
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    varying vec2 vUv;
    void main() {
      if (vAlpha < 0.01) discard;
      // Draw a soft glowing circle
      float d = distance(vUv, vec2(0.5));
      // Sharp core, soft glow edge
      float circle = smoothstep(0.5, 0.1, d);
      float core = smoothstep(0.15, 0.0, d);
      
      vec3 finalColor = mix(vColor, vec3(1.0), core * 0.5); // Whitish core
      
      gl_FragColor = vec4(finalColor, vAlpha * circle);
    }
  `
};

const ParticleStreams = ({ currentStage }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const count = 5000; // Dense high-fidelity particle count
  
  const { offsets, curveIndices, sizes, randoms } = useMemo(() => {
    const offsets = new Float32Array(count);
    const curveIndices = new Float32Array(count);
    const sizes = new Float32Array(count);
    const randoms = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      offsets[i] = Math.random();
      curveIndices[i] = i % 4; // 0, 1, 2, 3
      // Most particles are tiny dust, some are large glowing orbs
      const rand = Math.random();
      sizes[i] = rand > 0.95 ? 0.15 : (rand > 0.8 ? 0.08 : 0.02 + Math.random() * 0.03);
      
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
        materialRef.current.uniforms.uStage.value,
        currentStage,
        0.05
      );
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      {/* Use PlaneGeometry for proper circular sprites facing the camera via vertex shader */}
      <planeGeometry args={[1, 1]}>
        <instancedBufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
        <instancedBufferAttribute attach="attributes-aCurveIndex" args={[curveIndices, 1]} />
        <instancedBufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 3]} />
      </planeGeometry>
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

// ===================== PROCESSING CORE / DOCUMENT =====================
const ProcessingCore = ({ currentStage, texture }) => {
  const coreRef = useRef();
  const documentRef = useRef();
  const innerCubesRef = useRef();
  
  const DOC_W = 2.8;
  const DOC_H = 3.96;
  
  useFrame((state, delta) => {
    if (!coreRef.current || !documentRef.current || !innerCubesRef.current) return;
    
    const showCore = currentStage >= 4;
    const isDocument = currentStage >= 6;
    
    let targetScaleX = 0.01;
    let targetScaleY = 0.01;
    let targetScaleZ = 0.01;
    let targetOpacity = 0.0;
    
    if (showCore) {
      if (isDocument) {
        targetScaleX = DOC_W;
        targetScaleY = DOC_H;
        targetScaleZ = 0.01;
        targetOpacity = 0.15; // Faint edge remaining
      } else {
        targetScaleX = 1.2;
        targetScaleY = 1.2;
        targetScaleZ = 1.2;
        targetOpacity = 1.0;
        
        // Complex spin
        coreRef.current.rotation.y += delta * 0.4;
        coreRef.current.rotation.x += delta * 0.2;
        innerCubesRef.current.rotation.y -= delta * 0.6;
      }
    }
    
    coreRef.current.scale.lerp(new THREE.Vector3(targetScaleX, targetScaleY, targetScaleZ), 0.05);
    innerCubesRef.current.scale.lerp(new THREE.Vector3(targetScaleX, targetScaleY, targetScaleZ), 0.05);
    coreRef.current.material.opacity = THREE.MathUtils.lerp(coreRef.current.material.opacity, targetOpacity, 0.05);
    innerCubesRef.current.material.opacity = THREE.MathUtils.lerp(innerCubesRef.current.material.opacity, isDocument ? 0 : targetOpacity, 0.1);
    
    if (isDocument) {
      coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, 0, 0.08);
      coreRef.current.rotation.x = THREE.MathUtils.lerp(coreRef.current.rotation.x, 0, 0.08);
      
      // Floating document bob
      documentRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      coreRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
    
    let docOpacityTarget = isDocument ? 1.0 : 0.0;
    documentRef.current.material.opacity = THREE.MathUtils.lerp(documentRef.current.material.opacity, docOpacityTarget, 0.04);
  });

  return (
    <group position={[2.5, -0.5, 0]}>
      {/* Outer Wireframe Core */}
      <mesh ref={coreRef} scale={[0.01, 0.01, 0.01]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={C_BLUE} wireframe transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Inner Dense Processing Nodes (Disappears when becoming document) */}
      <mesh ref={innerCubesRef} scale={[0.01, 0.01, 0.01]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.8, 1.0).multiplyScalar(3.0)} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* The Actual PDF Document Plane */}
      <mesh ref={documentRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[DOC_W, DOC_H]} />
        {texture ? (
           <meshBasicMaterial map={texture} color="#e0e0e0" transparent opacity={0} side={THREE.DoubleSide} />
        ) : (
           <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} />
        )}
      </mesh>
    </group>
  );
};

// ===================== VOLUMETRIC LIGHT RAYS =====================
const LightRays = ({ currentStage }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    let targetOpacity = 0.0;
    if (currentStage >= 4 && currentStage < 8) targetOpacity = 0.8;
    if (currentStage >= 8) targetOpacity = 0.4;
    
    meshRef.current.material.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      meshRef.current.material.uniforms.uOpacity.value, targetOpacity, 0.05
    );
    meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
  });
  
  const shader = {
    uniforms: { uColor: { value: C_BLUE }, uOpacity: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        // Vertical fade
        float alpha = smoothstep(1.0, 0.0, vUv.y) * smoothstep(0.0, 0.2, vUv.y);
        // Dynamic streaks
        float streak1 = sin(vUv.x * 50.0 + uTime * 2.0) * 0.5 + 0.5;
        float streak2 = sin(vUv.x * 20.0 - uTime * 1.0) * 0.5 + 0.5;
        alpha *= mix(0.1, 1.0, streak1 * streak2);
        gl_FragColor = vec4(uColor, alpha * uOpacity);
      }
    `
  };

  return (
    <mesh ref={meshRef} position={[2.5, 1.0, -0.5]} scale={[4, 7, 1]}>
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

// ===================== GLOWING PLATFORM =====================
const Platform = ({ currentStage }) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
  });
  const rings = [
    { r: 2.5, thick: 0.015, op: 0.8 },
    { r: 2.1, thick: 0.012, op: 0.5 },
    { r: 1.6, thick: 0.010, op: 0.3 },
  ];
  return (
    <group position={[2.5, -2.5, 0]} rotation={[Math.PI / 2.3, 0, 0]} ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i}>
          <torusGeometry args={[ring.r, ring.thick, 32, 100]} />
          <meshBasicMaterial color={C_BLUE} transparent opacity={ring.op} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <mesh>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.3, 0.8)} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ===================== CSS OVERLAYS =====================
const LabelsOverlay = ({ currentStage }) => {
  const visible = currentStage >= 2 && currentStage <= 4;
  
  const labels = [
    { text: 'EXPERIENCE', color: '#0044ff', top: '30%', left: '15%', linePath: 'M 50,30 L 120,150' },
    { text: 'SKILLS', color: '#8800ff', top: '22%', left: '35%', linePath: 'M 50,30 L 50,160' },
    { text: 'PROJECTS', color: '#00ff44', top: '28%', left: '55%', linePath: 'M 50,30 L -20,150' },
    { text: 'EDUCATION', color: '#ff6600', top: '38%', left: '75%', linePath: 'M 50,30 L -120,130' },
  ];

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {labels.map((lbl, i) => (
        <div 
          key={i} 
          className="absolute" 
          style={{ 
            top: lbl.top, 
            left: lbl.left,
            animation: \`fadeIn 0.5s \${i * 0.2}s ease-out both\` 
          }}
        >
          <div 
            className="px-4 py-1.5 border rounded-lg text-[11px] font-bold tracking-widest bg-[#010409]/90 backdrop-blur-md"
            style={{ 
              borderColor: lbl.color, 
              color: 'white', 
              boxShadow: \`0 0 20px \${lbl.color}60\` 
            }}
          >
            {lbl.text}
          </div>
          
          <svg className="absolute top-full left-1/2 overflow-visible" style={{ width: 1, height: 1 }}>
             <path 
               d={lbl.linePath} 
               fill="none" 
               stroke={lbl.color} 
               strokeWidth="1.5" 
               opacity="0.8"
               strokeDasharray="3 4"
               style={{ animation: 'dash 15s linear infinite' }}
             />
          </svg>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dash { to { stroke-dashoffset: -200; } }
      \`}} />
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
        const vp = page.getViewport({ scale: 4 });
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
    <div className="fixed inset-0 z-40 bg-[#010409] overflow-hidden flex items-center justify-center">
      
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ toneMapping: THREE.NoToneMapping, alpha: false }} style={{ background: '#010409' }}>
        <ambientLight intensity={0.5} />
        <ParticleStreams currentStage={currentStage} />
        <ProcessingCore currentStage={currentStage} texture={texture} />
        <LightRays currentStage={currentStage} />
        <Platform currentStage={currentStage} />
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.4} intensity={2.5} mipmapBlur />
        </EffectComposer>
      </Canvas>

      <LabelsOverlay currentStage={currentStage} />

      <div className="absolute top-12 left-12 z-50 pointer-events-none flex flex-col gap-2" key={currentStage}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-[#010409] border border-[#009DFF]/40 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(0,157,255,0.2)]">
            {currentStage + 1}
          </div>
          <h2 className="text-xl font-bold tracking-[0.15em] text-white uppercase" style={{ animation: 'fadeInTitle 0.5s ease-out both' }}>
            {STAGES[currentStage]?.title || 'ANALYZING'}
          </h2>
        </div>
        <p className="text-white/40 text-sm ml-14" style={{ animation: 'fadeInSub 0.7s 0.15s ease-out both' }}>
          {STAGES[currentStage]?.subtitle || 'Please wait...'}
        </p>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
        <button onClick={onCancel} className="px-6 py-2 border border-white/10 text-white/40 hover:text-white bg-[#010409]/50 hover:bg-white/10 rounded-full transition-all text-sm tracking-wider uppercase backdrop-blur-md">
          Cancel Analysis
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes fadeInTitle { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInSub { from { opacity: 0; } to { opacity: 1; } }
      \`}} />
    </div>
  );
}
