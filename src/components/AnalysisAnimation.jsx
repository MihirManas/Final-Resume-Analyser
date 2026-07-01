"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';
import { ArrowLeft } from 'lucide-react';

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

const STAGE_DURATIONS = [3, 3.5, 3, 3.5, 4, 3.5, 4, 3.5, 3];
const MAX_AUTO_STAGE = 7; // Hold at stage 7 (Finalizing) until backend responds

const SECTION_LABELS = [
  { text: 'EXPERIENCE', x: '12%', y: '28%' },
  { text: 'SKILLS', x: '38%', y: '20%' },
  { text: 'PROJECTS', x: '62%', y: '28%' },
  { text: 'EDUCATION', x: '80%', y: '45%' },
];

// ===================== PARTICLE GRID =====================

const COLS = 80;
const ROWS = 113;
const COUNT = COLS * ROWS;
const DOC_W = 3;
const DOC_H = DOC_W * (ROWS / COLS);
const CUBE_W = DOC_W / COLS;
const CUBE_H = DOC_H / ROWS;

// ===================== GLSL SHADERS =====================

const vertexShader = `
  uniform float uTime;
  uniform float uAssembly;
  uniform float uWaveIntensity;
  
  attribute vec2 instanceUv;
  attribute vec3 aRandom;
  
  varying vec2 vUv;
  varying float vAssembly;
  varying vec3 vRandom;
  
  void main() {
    vUv = instanceUv;
    vAssembly = uAssembly;
    vRandom = aRandom;
    
    vec3 pos = position;
    
    // Scale cubes larger when scattered for visual impact, shrink when assembling
    float scaleBoost = mix(2.2, 1.0, smoothstep(0.2, 0.75, uAssembly));
    pos *= scaleBoost;
    
    // Home position from instance matrix (document grid slot)
    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
    
    // Calculate how scattered the particles are
    float scatterAmount = 1.0 - smoothstep(0.0, 0.85, uAssembly);
    
    if (scatterAmount > 0.001) {
      // Base random scatter position
      vec3 scatter = aRandom * vec3(30.0, 18.0, 10.0);
      
      // Flowing horizontal wave (scanning effect)
      float waveX = sin(uTime * 0.5 + aRandom.x * 10.0 + worldPos.y * 0.3) * 6.0;
      float waveY = cos(uTime * 0.35 + aRandom.y * 8.0) * 3.5;
      float waveZ = sin(uTime * 0.4 + aRandom.z * 6.28) * 2.5;
      
      scatter.x += waveX * uWaveIntensity;
      scatter.y += waveY * uWaveIntensity;
      scatter.z += waveZ * uWaveIntensity;
      
      // Global horizontal drift — creates the "scanning wave" sweep
      scatter.x += sin(uTime * 0.3) * 8.0 * uWaveIntensity;
      
      worldPos.xyz += scatter * scatterAmount;
    }
    
    // Gentle floating bob when nearly assembled
    if (uAssembly > 0.85) {
      float f = smoothstep(0.85, 1.0, uAssembly);
      worldPos.y += sin(uTime * 0.6 + instanceUv.x * 5.0) * 0.025 * f;
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float uAssembly;
  uniform float uColorMix;
  uniform float uTime;
  
  varying vec2 vUv;
  varying float vAssembly;
  varying vec3 vRandom;
  
  void main() {
    // PDF texture — slightly darkened for realistic paper under dim lighting
    vec4 texColor = texture2D(tDiffuse, vUv);
    texColor.rgb *= 0.88;
    
    // ---------- Reference-image–exact color palettes ----------
    // Electric blue energy (HDR values to trigger bloom)
    vec3 blueCore  = vec3(0.0, 0.85, 1.0) * 3.5;
    vec3 blueEdge  = vec3(0.0, 0.35, 0.85) * 2.0;
    
    // Burning coal fire (orange / amber / red)
    vec3 fireCore  = vec3(1.0, 0.7, 0.1)  * 4.0;
    vec3 fireEdge  = vec3(1.0, 0.25, 0.0) * 2.5;
    
    // Green accent trail
    vec3 greenGlow = vec3(0.1, 1.0, 0.5)  * 2.0;
    
    // Pick per-particle shade using random seed
    vec3 blueColor = mix(blueEdge, blueCore, fract(vRandom.y * 7.0));
    vec3 fireColor = mix(fireEdge, fireCore, fract(vRandom.z * 7.0));
    float seed     = fract(vRandom.x * 13.0);
    vec3 warmColor = seed > 0.7 ? greenGlow : fireColor;
    
    // Blend blue vs warm based on uColorMix uniform
    float isWarm       = step(0.55, vRandom.x) * uColorMix;
    vec3 particleColor = mix(blueColor, warmColor, isWarm);
    
    // Transition from glowing particles → readable PDF texture
    float texBlend  = smoothstep(0.6, 0.95, vAssembly);
    vec3 finalColor = mix(particleColor, texColor.rgb, texBlend);
    
    // Alpha pulsing for scattered particles
    float alpha = 1.0;
    if (vAssembly < 0.5) {
      alpha = 0.75 + 0.25 * sin(uTime * 2.0 + vRandom.x * 6.28);
    }
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ===================== PARTICLE FIELD (Three.js) =====================

const ParticleField = ({ texture }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const startRef = useRef(null);

  const { uvs, randoms } = useMemo(() => {
    const uvs = new Float32Array(COUNT * 2);
    const randoms = new Float32Array(COUNT * 3);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x;
        uvs[i * 2]     = x / COLS;
        uvs[i * 2 + 1] = 1.0 - y / ROWS;
        randoms[i * 3]     = (Math.random() - 0.5) * 2;
        randoms[i * 3 + 1] = (Math.random() - 0.5) * 2;
        randoms[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
    }
    return { uvs, randoms };
  }, []);

  // Build the document grid (home positions for each cube)
  useEffect(() => {
    if (!meshRef.current) return;
    const d = new THREE.Object3D();
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x;
        d.position.set(
          (x / COLS) * DOC_W - DOC_W / 2 + CUBE_W / 2,
          (1 - y / ROWS) * DOC_H - DOC_H / 2 - CUBE_H / 2,
          0
        );
        d.updateMatrix();
        meshRef.current.setMatrixAt(i, d.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Animate shader uniforms at 60 fps
  useFrame((state) => {
    if (!startRef.current) startRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startRef.current;
    const u = materialRef.current?.uniforms;
    if (!u) return;

    u.uTime.value = elapsed;

    // ---- Determine current stage from elapsed time ----
    let acc = 0, stage = 0, prog = 0;
    for (let i = 0; i <= MAX_AUTO_STAGE; i++) {
      if (elapsed < acc + STAGE_DURATIONS[i]) {
        stage = i; prog = (elapsed - acc) / STAGE_DURATIONS[i]; break;
      }
      acc += STAGE_DURATIONS[i];
      if (i === MAX_AUTO_STAGE) { stage = MAX_AUTO_STAGE; prog = 1; }
    }

    // ---- Map stage → uAssembly ----
    let assembly = 0;
    if (stage <= 4) assembly = 0;
    else if (stage === 5) assembly = prog * 0.3;
    else if (stage === 6) assembly = 0.3 + prog * 0.45;
    else {
      // Stage 7 — breathing pulse while holding
      const breathe = 0.85 + Math.sin(elapsed * 0.5) * 0.08;
      assembly = prog < 1 ? 0.75 + prog * 0.2 : breathe;
    }
    u.uAssembly.value = THREE.MathUtils.lerp(u.uAssembly.value, assembly, 0.04);

    // ---- Map stage → uWaveIntensity ----
    let wave = 0;
    if (stage === 0) wave = prog * 0.6;
    else if (stage <= 4) wave = 1.0;
    else if (stage === 5) wave = 1.0 - prog * 0.6;
    else if (stage === 6) wave = 0.4 - prog * 0.4;
    u.uWaveIntensity.value = THREE.MathUtils.lerp(u.uWaveIntensity.value, wave, 0.04);

    // ---- Map stage → uColorMix (blue-only vs orange/green mix) ----
    let colorMix = 0;
    if (stage <= 2) colorMix = stage === 2 ? prog * 0.4 : 0;
    else if (stage <= 5) colorMix = 1.0;
    else if (stage === 6) colorMix = 1.0 - prog;
    u.uColorMix.value = THREE.MathUtils.lerp(u.uColorMix.value, colorMix, 0.04);

    // Keep texture up to date
    if (texture) u.tDiffuse.value = texture;
  });

  const shaderArgs = useMemo(() => ({
    uniforms: {
      tDiffuse: { value: texture },
      uTime: { value: 0 },
      uAssembly: { value: 0 },
      uWaveIntensity: { value: 0 },
      uColorMix: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [texture]);

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]} frustumCulled={false}>
      <boxGeometry args={[CUBE_W, CUBE_H, 0.04]}>
        <instancedBufferAttribute attach="attributes-instanceUv" args={[uvs, 2]} />
        <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 3]} />
      </boxGeometry>
      <shaderMaterial ref={materialRef} attach="material" args={[shaderArgs]} />
    </instancedMesh>
  );
};

// ===================== GLOWING PLATFORM RINGS =====================

const GlowingPlatform = ({ visible, intensity }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = state.clock.elapsedTime * 0.12;
  });

  if (!visible) return null;

  const rings = [
    { r: 2.2, thick: 0.014, col: [0, 2.4, 4.0], op: 0.6 },
    { r: 1.8, thick: 0.012, col: [0, 3.0, 5.5], op: 0.5 },
    { r: 1.3, thick: 0.010, col: [0, 3.6, 7.0], op: 0.4 },
    { r: 0.8, thick: 0.008, col: [0, 4.0, 8.5], op: 0.3 },
  ];

  return (
    <group ref={groupRef} position={[0, -DOC_H / 2 - 0.35, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
      {rings.map((ring, i) => (
        <mesh key={i}>
          <torusGeometry args={[ring.r, ring.thick, 16, 128]} />
          <meshBasicMaterial
            color={ring.col}
            transparent
            opacity={ring.op * intensity}
          />
        </mesh>
      ))}
    </group>
  );
};

// ===================== MAIN COMPONENT =====================

export default function AnalysisAnimation({ file, onCancel }) {
  const [texture, setTexture] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);

  // Fallback white texture so particles render immediately (before PDF loads)
  const defaultTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 4; c.height = 4;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 4, 4);
    return new THREE.CanvasTexture(c);
  }, []);

  // Load uploaded PDF as a high-res texture
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
        t.generateMipmaps = true;
        setTexture(t);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error('PDF texture load error:', e);
      }
    };
    load();
  }, [file]);

  // Drive stage progression (for the CSS overlay — 60 ms tick)
  useEffect(() => {
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      let acc = 0;
      for (let i = 0; i <= MAX_AUTO_STAGE; i++) {
        if (elapsed < acc + STAGE_DURATIONS[i]) {
          setCurrentStage(i);
          setStageProgress(Math.min(1, (elapsed - acc) / STAGE_DURATIONS[i]));
          return;
        }
        acc += STAGE_DURATIONS[i];
      }
      setCurrentStage(MAX_AUTO_STAGE);
      setStageProgress(1);
    }, 60);
    return () => clearInterval(iv);
  }, []);

  const showPlatform = currentStage >= 5;
  const platformIntensity = showPlatform
    ? Math.min(1, (currentStage - 4 + stageProgress) * 0.25)
    : 0;
  const showLabels = currentStage >= 2 && currentStage <= 4;
  const activeTexture = texture || defaultTexture;

  return (
    <div className="fixed inset-0 z-40 bg-[#020408]">
      {/* =========== Full-Screen WebGL Canvas =========== */}
      {activeTexture && (
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{ toneMapping: THREE.NoToneMapping, alpha: false }}
          style={{ background: '#020408' }}
        >
          <ambientLight intensity={0.3} />
          <ParticleField texture={activeTexture} />
          <GlowingPlatform visible={showPlatform} intensity={platformIntensity} />
          <EffectComposer disableNormalPass>
            <Bloom
              luminanceThreshold={1.3}
              luminanceSmoothing={0.2}
              intensity={currentStage <= 5 ? 2.5 : 1.5}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      )}

      {/* =========== Stage Title (top-left) =========== */}
      <div className="absolute top-10 left-10 z-50 pointer-events-none" key={currentStage}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#009DFF] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_20px_rgba(0,157,255,0.5)]">
            {currentStage + 1}
          </div>
          <h2
            className="text-xl font-bold tracking-[0.2em] text-white uppercase"
            style={{ animation: 'slideInTitle 0.5s ease-out both' }}
          >
            {STAGES[currentStage].title}
          </h2>
        </div>
        <p
          className="text-white/50 text-sm ml-14"
          style={{ animation: 'fadeInSub 0.7s 0.15s ease-out both' }}
        >
          {STAGES[currentStage].subtitle}
        </p>
      </div>

      {/* =========== Floating Section Labels (stages 3–5) =========== */}
      {showLabels && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          {SECTION_LABELS.map((label, i) => (
            <div
              key={label.text}
              className="absolute px-4 py-2 bg-[#0a0f1a]/70 backdrop-blur-md border border-[#009DFF]/40 rounded-lg text-white text-xs font-bold tracking-[0.15em] shadow-[0_0_15px_rgba(0,157,255,0.25)]"
              style={{
                left: label.x,
                top: label.y,
                animation: `fadeInLabel 0.5s ${i * 0.15}s ease-out both`,
              }}
            >
              {label.text}
            </div>
          ))}
        </div>
      )}

      {/* =========== Bottom: progress bar + cancel =========== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
        <div className="w-72 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#009DFF] to-[#8c52ff] rounded-full transition-all duration-300 shadow-[0_0_10px_#009DFF]"
            style={{
              width: `${((currentStage + stageProgress) / STAGES.length) * 100}%`,
            }}
          />
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 flex items-center gap-2 text-sm text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
        >
          <ArrowLeft size={16} /> Cancel Analysis
        </button>
      </div>

      {/* =========== CSS Keyframes =========== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideInTitle {
              from { opacity: 0; transform: translateX(-20px); }
              to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes fadeInSub {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes fadeInLabel {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `,
        }}
      />
    </div>
  );
}
