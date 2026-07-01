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

// Exact colors from the image
const C_BLUE = new THREE.Color(0.0, 0.5, 1.0).multiplyScalar(3.0);
const C_PURPLE = new THREE.Color(0.6, 0.0, 1.0).multiplyScalar(2.5);
const C_GREEN = new THREE.Color(0.0, 1.0, 0.4).multiplyScalar(2.5);
const C_ORANGE = new THREE.Color(1.0, 0.4, 0.0).multiplyScalar(3.0);

// ===================== PARTICLE STREAMS =====================
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
    
    varying vec3 vColor;
    varying float vAlpha;
    
    void main() {
      // 1. Determine Color based on curve index and stage
      vec3 colBlue = vec3(0.0, 0.5, 1.0) * 3.0;
      vec3 colPurple = vec3(0.6, 0.0, 1.0) * 2.5;
      vec3 colGreen = vec3(0.0, 1.0, 0.4) * 2.5;
      vec3 colOrange = vec3(1.0, 0.4, 0.0) * 3.0;
      
      vec3 color = colBlue; // Default all blue for early stages
      
      // Stage 3 (index 2) starts splitting colors, Stage 4 (index 3) fully split
      float splitPhase = smoothstep(2.0, 3.0, uStage);
      if (aCurveIndex > 0.5 && aCurveIndex < 1.5) color = mix(colBlue, colPurple, splitPhase);
      if (aCurveIndex > 1.5 && aCurveIndex < 2.5) color = mix(colBlue, colGreen, splitPhase);
      if (aCurveIndex > 2.5) color = mix(colBlue, colOrange, splitPhase);
      vColor = color;
      
      // 2. Flow Progress
      // Particles move from 0 to 1 over time.
      float speed = mix(0.15, 0.3, smoothstep(2.0, 5.0, uStage));
      float progress = fract(aOffset + uTime * speed);
      
      // 3. Base path (Sine wave moving left to right)
      float startX = -6.0;
      float endX = 6.0;
      
      // Core target position (right side over platform)
      vec3 corePos = vec3(2.5, -0.5, 0.0);
      
      // Interpolate along X
      vec3 pos = vec3(mix(startX, endX, progress), 0.0, 0.0);
      
      // Add Sine wave motion
      float waveFreq = 2.0;
      float waveAmp = 0.8;
      pos.y = sin(progress * waveFreq * 3.14159 + uTime) * waveAmp;
      pos.z = cos(progress * waveFreq * 3.14159 + uTime * 0.8) * waveAmp * 0.5;
      
      // 4. Spread and Target logic (Stage 3+)
      if (uStage >= 2.0) {
        float spreadAmount = mix(0.0, 1.5, smoothstep(2.0, 3.0, uStage));
        
        // Spread the 4 colored streams vertically
        if (aCurveIndex == 0.0) pos.y += spreadAmount * 0.8;
        if (aCurveIndex == 1.0) pos.y += spreadAmount * 0.3;
        if (aCurveIndex == 2.0) pos.y -= spreadAmount * 0.3;
        if (aCurveIndex == 3.0) pos.y -= spreadAmount * 0.8;
        
        // Converge into the Core (Stage 4+)
        float convergePhase = smoothstep(3.0, 4.0, uStage);
        if (convergePhase > 0.0) {
           // Target is the left side of the core
           vec3 targetPoint = corePos + vec3(-0.5, (aCurveIndex - 1.5) * 0.2, (fract(aOffset*13.0)-0.5)*0.5);
           // As progress gets closer to 1, snap to target
           float pull = pow(progress, 3.0) * convergePhase;
           pos = mix(pos, targetPoint, pull);
        }
      }
      
      // 5. Calculate Alpha and Size
      vAlpha = smoothstep(0.0, 0.1, progress) * smoothstep(1.0, 0.8, progress);
      
      // Fade out completely in final stages (Stage 7+)
      float fadeOutPhase = smoothstep(6.0, 7.0, uStage);
      vAlpha *= (1.0 - fadeOutPhase);
      
      // Add random scatter based on aSize
      vec3 scatter = vec3(
        (fract(aOffset * 17.0) - 0.5),
        (fract(aOffset * 23.0) - 0.5),
        (fract(aOffset * 29.0) - 0.5)
      ) * 0.4;
      
      pos += scatter;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos + position * aSize, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      if (vAlpha < 0.01) discard;
      // Soft circular particle
      float d = distance(gl_PointCoord, vec2(0.5));
      // gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.2, d)); // If using Points
      gl_FragColor = vec4(vColor, vAlpha); // Using InstancedMesh cubes, no point coord needed
    }
  `
};

const ParticleStreams = ({ currentStage }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const count = 4000; // 1000 per color stream
  
  const { offsets, curveIndices, sizes } = useMemo(() => {
    const offsets = new Float32Array(count);
    const curveIndices = new Float32Array(count);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      offsets[i] = Math.random();
      curveIndices[i] = i % 4; // 0, 1, 2, 3
      sizes[i] = Math.random() * 0.03 + 0.01;
      // Make 10% of them larger "bright" cubes
      if (Math.random() > 0.9) sizes[i] *= 3.0;
    }
    return { offsets, curveIndices, sizes };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly interpolate stage for shader
      materialRef.current.uniforms.uStage.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uStage.value,
        currentStage,
        0.05
      );
    }
  });

  // Dummy matrix for instancing (positions handled in vertex shader)
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
        <instancedBufferAttribute attach="attributes-aCurveIndex" args={[curveIndices, 1]} />
        <instancedBufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
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

// ===================== PROCESSING CORE / DOCUMENT =====================
const ProcessingCore = ({ currentStage, texture }) => {
  const coreRef = useRef();
  const documentRef = useRef();
  
  // Dimensions for the final document
  const DOC_W = 3.0;
  const DOC_H = 4.24;
  
  useFrame((state, delta) => {
    if (!coreRef.current || !documentRef.current) return;
    
    // Core appears at Stage 4 (Processing Data)
    const showCore = currentStage >= 4;
    // Core transforms to Document at Stage 6 (Reconstructing Resume)
    const isDocument = currentStage >= 6;
    
    // Animate Core Wireframe (Scale and Rotation)
    let targetScaleX = 0.01;
    let targetScaleY = 0.01;
    let targetScaleZ = 0.01;
    let targetOpacity = 0.0;
    
    if (showCore) {
      if (isDocument) {
        // Expand to Document Plane
        targetScaleX = DOC_W;
        targetScaleY = DOC_H;
        targetScaleZ = 0.01;
        targetOpacity = 0.2; // Fade wireframe out slightly when document is visible
      } else {
        // Wireframe Cube (Processing Core)
        targetScaleX = 1.0;
        targetScaleY = 1.0;
        targetScaleZ = 1.0;
        targetOpacity = 1.0;
        // Spin the core
        coreRef.current.rotation.y += delta * 0.5;
        coreRef.current.rotation.x += delta * 0.3;
      }
    }
    
    // Smooth Lerp Scale
    coreRef.current.scale.x = THREE.MathUtils.lerp(coreRef.current.scale.x, targetScaleX, 0.05);
    coreRef.current.scale.y = THREE.MathUtils.lerp(coreRef.current.scale.y, targetScaleY, 0.05);
    coreRef.current.scale.z = THREE.MathUtils.lerp(coreRef.current.scale.z, targetScaleZ, 0.05);
    coreRef.current.material.opacity = THREE.MathUtils.lerp(coreRef.current.material.opacity, targetOpacity, 0.05);
    
    // Snap rotation back to 0 when becoming document
    if (isDocument) {
      coreRef.current.rotation.y = THREE.MathUtils.lerp(coreRef.current.rotation.y, 0, 0.08);
      coreRef.current.rotation.x = THREE.MathUtils.lerp(coreRef.current.rotation.x, 0, 0.08);
    }
    
    // Animate Document PDF Mesh
    let docOpacityTarget = isDocument ? 1.0 : 0.0;
    documentRef.current.material.opacity = THREE.MathUtils.lerp(documentRef.current.material.opacity, docOpacityTarget, 0.03);
  });

  return (
    <group position={[2.5, -0.5, 0]}>
      {/* The Wireframe Core (morphs into document edges) */}
      <mesh ref={coreRef} scale={[0.01, 0.01, 0.01]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={C_BLUE} wireframe transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* The Real PDF Document Plane */}
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

// ===================== VERTICAL LIGHT RAYS =====================
const LightRays = ({ currentStage }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (!meshRef.current) return;
    // Rays appear at Stage 4, get stronger, then slightly fade at end
    let targetOpacity = 0.0;
    if (currentStage >= 4 && currentStage < 8) targetOpacity = 0.6;
    if (currentStage >= 8) targetOpacity = 0.3; // Stabilize
    
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, targetOpacity, 0.05);
  });
  
  const shader = {
    uniforms: { uColor: { value: C_BLUE } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        // Fade out at the top (vUv.y = 1) and bottom
        float alpha = smoothstep(1.0, 0.2, vUv.y) * smoothstep(0.0, 0.1, vUv.y);
        // Vertical streaks using noise or sine
        float streak = sin(vUv.x * 50.0) * 0.5 + 0.5;
        alpha *= mix(0.5, 1.0, streak);
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  };

  return (
    <mesh ref={meshRef} position={[2.5, 1.5, -0.5]} scale={[4, 6, 1]}>
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

// ===================== PLATFORM RINGS =====================
const Platform = ({ currentStage }) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
  });
  const rings = [
    { r: 2.2, thick: 0.015, op: 0.8 },
    { r: 1.8, thick: 0.012, op: 0.6 },
    { r: 1.3, thick: 0.010, op: 0.4 },
  ];
  return (
    <group position={[2.5, -2.6, 0]} rotation={[Math.PI / 2.5, 0, 0]} ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i}>
          <torusGeometry args={[ring.r, ring.thick, 32, 100]} />
          <meshBasicMaterial color={C_BLUE} transparent opacity={ring.op} />
        </mesh>
      ))}
    </group>
  );
};

// ===================== HTML LABELS =====================
const LabelsOverlay = ({ currentStage }) => {
  // Show labels only in stages 2 to 4
  const visible = currentStage >= 2 && currentStage <= 4;
  
  const labels = [
    { text: 'EXPERIENCE', color: '#009DFF', top: '35%', left: '15%', linePath: 'M 50,50 L 150,150' },
    { text: 'SKILLS', color: '#9D00FF', top: '25%', left: '35%', linePath: 'M 50,50 L 50,150' },
    { text: 'PROJECTS', color: '#00FF66', top: '35%', left: '55%', linePath: 'M 50,50 L -50,150' },
    { text: 'EDUCATION', color: '#FF6600', top: '45%', left: '75%', linePath: 'M 50,50 L -150,150' },
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
            animation: `fadeIn 0.5s ${i * 0.2}s ease-out both` 
          }}
        >
          {/* Glowing Label Box */}
          <div 
            className="px-4 py-1 border rounded-lg text-[10px] font-bold tracking-widest bg-[#020408]/80 backdrop-blur-sm"
            style={{ 
              borderColor: lbl.color, 
              color: lbl.color, 
              boxShadow: `0 0 15px ${lbl.color}40` 
            }}
          >
            {lbl.text}
          </div>
          
          {/* SVG Connecting Line (Simulating 3D connection to the stream) */}
          <svg className="absolute top-full left-1/2 overflow-visible" style={{ width: 1, height: 1 }}>
             <path 
               d={lbl.linePath} 
               fill="none" 
               stroke={lbl.color} 
               strokeWidth="1.5" 
               opacity="0.6"
               strokeDasharray="4 4"
               style={{ animation: 'dash 10s linear infinite' }}
             />
          </svg>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dash { to { stroke-dashoffset: -100; } }
      `}} />
    </div>
  );
};


// ===================== MAIN COMPONENT =====================
export default function AnalysisAnimation({ file, onCancel }) {
  const [texture, setTexture] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);

  // Load PDF Texture
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

  // Stage Progression Timer
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
    <div className="fixed inset-0 z-40 bg-[#020408] overflow-hidden flex items-center justify-center">
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ toneMapping: THREE.NoToneMapping, alpha: false }}>
        <ambientLight intensity={0.5} />
        <ParticleStreams currentStage={currentStage} />
        <ProcessingCore currentStage={currentStage} texture={texture} />
        <LightRays currentStage={currentStage} />
        <Platform currentStage={currentStage} />
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1.2} luminanceSmoothing={0.3} intensity={2.0} mipmapBlur />
        </EffectComposer>
      </Canvas>

      {/* HTML Overlays */}
      <LabelsOverlay currentStage={currentStage} />

      {/* Top Left Title */}
      <div className="absolute top-10 left-10 z-50 pointer-events-none" key={currentStage}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#009DFF]/20 border border-[#009DFF] flex items-center justify-center text-sm font-bold text-[#009DFF] shadow-[0_0_20px_rgba(0,157,255,0.3)]">
            {currentStage + 1}
          </div>
          <h2 className="text-xl font-bold tracking-[0.2em] text-white uppercase" style={{ animation: 'fadeInTitle 0.5s ease-out both' }}>
            {STAGES[currentStage]?.title || 'ANALYZING'}
          </h2>
        </div>
        <p className="text-white/50 text-sm ml-14" style={{ animation: 'fadeInSub 0.7s 0.15s ease-out both' }}>
          {STAGES[currentStage]?.subtitle || 'Please wait...'}
        </p>
      </div>

      {/* Bottom Progress & Cancel */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
        <button onClick={onCancel} className="px-6 py-2 border border-white/10 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all text-sm tracking-wider uppercase">
          Cancel Analysis
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInTitle { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInSub { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </div>
  );
}
