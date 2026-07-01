"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

// ===================== CHIP ASSEMBLY SHADER =====================
const ChipShader = {
  uniforms: { uTime: { value: 0 }, uStage: { value: 0 }, uColor: { value: new THREE.Color("#009DFF") } },
  vertexShader: `
    uniform float uTime;
    uniform float uStage;
    
    attribute vec3 aStartPos;
    attribute vec3 aTargetPos;
    attribute float aDelay;
    
    varying float vAlpha;
    varying float vGlow;
    
    void main() {
      // Build wave sweeps from bottom to top of document (-1.98 to 1.98)
      float normalizedY = (aTargetPos.y + 1.98) / 3.96;
      
      // Stages 1 to 6 represent the building process
      float buildProgress = smoothstep(1.0, 6.0, uStage);
      
      // Each chip's progress is based on global wave and its vertical position
      float chipStart = normalizedY * 0.7 + aDelay * 0.2; 
      float localProgress = smoothstep(chipStart, chipStart + 0.15, buildProgress);
      
      // Easing (Cubic Out)
      float p = localProgress;
      float easeOut = 1.0 - pow(1.0 - p, 3.0);
      
      vec3 pos = mix(aStartPos, aTargetPos, easeOut);
      
      // Add subtle floating to assembled pieces before final solidification
      if (localProgress >= 1.0 && uStage < 7.0) {
          pos.z += sin(uTime * 3.0 + aTargetPos.x * 10.0 + aTargetPos.y * 10.0) * 0.02;
      }
      
      // Tumbling effect while flying up
      float angle = (1.0 - easeOut) * 15.0 * aDelay;
      float s = sin(angle); float c = cos(angle);
      mat3 rotY = mat3(c, 0, s, 0, 1, 0, -s, 0, c);
      mat3 rotX = mat3(1, 0, 0, 0, c, -s, 0, s, c);
      
      vec3 finalPos = pos + rotX * rotY * position;
      
      // Fade out slowly in the final stages to reveal the clean document underneath
      vAlpha = smoothstep(0.0, 0.1, localProgress) * (1.0 - smoothstep(6.5, 7.5, uStage));
      vGlow = 1.0 - localProgress; // Glows brightly while flying
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    varying float vAlpha;
    varying float vGlow;
    void main() {
      if (vAlpha < 0.01) discard;
      vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), vGlow * 0.6);
      gl_FragColor = vec4(finalColor, vAlpha * (0.6 + vGlow * 0.4));
    }
  `
};

const ChipAssembly = ({ currentStage }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  
  const COLS = 45;
  const ROWS = 65;
  const count = COLS * ROWS; 
  
  const { startPos, targetPos, delays } = useMemo(() => {
    const start = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Target is grid on document (-1.4 to 1.4, -1.98 to 1.98)
        const tx = (c / COLS) * 2.8 - 1.4;
        const ty = (r / ROWS) * 3.96 - 1.98;
        
        target[i*3] = tx;
        target[i*3+1] = ty;
        target[i*3+2] = (Math.random() - 0.5) * 0.05; // Tight depth variation for assembled pieces
        
        // Start is scattered widely on the floor
        start[i*3] = (Math.random() - 0.5) * 12.0;
        start[i*3+1] = -4.0 + (Math.random() - 0.5) * 1.5; // Below view
        start[i*3+2] = (Math.random() - 0.5) * 10.0 - 2.0;
        
        delays[i] = Math.random();
        i++;
      }
    }
    return { startPos: start, targetPos: target, delays };
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
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false} position={[0, 0.2, 0]}>
      <boxGeometry args={[0.04, 0.04, 0.04]}>
        <instancedBufferAttribute attach="attributes-aStartPos" args={[startPos, 3]} />
        <instancedBufferAttribute attach="attributes-aTargetPos" args={[targetPos, 3]} />
        <instancedBufferAttribute attach="attributes-aDelay" args={[delays, 1]} />
      </boxGeometry>
      <shaderMaterial 
        ref={materialRef}
        args={[{
          uniforms: ChipShader.uniforms,
          vertexShader: ChipShader.vertexShader,
          fragmentShader: ChipShader.fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          wireframe: false 
        }]} 
      />
    </instancedMesh>
  );
};

// ===================== DOCUMENT MORPH =====================
const DOC_W = 2.8;
const DOC_H = 3.96;

const DocumentShader = {
  uniforms: { tDiffuse: { value: null }, uStage: { value: 0 }, uTime: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uStage;
    void main() {
      vUv = vec2((position.x + ${DOC_W / 2.0}) / ${DOC_W}, (position.y + ${DOC_H / 2.0}) / ${DOC_H});
      
      vec3 pos = position;
      // Gentle floating motion
      pos.y += sin(uTime * 1.5) * 0.05;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uStage;
    varying vec2 vUv;
    void main() {
      // Reveal wave tracks slightly behind the chip assembly
      float revealProgress = smoothstep(1.5, 6.5, uStage);
      if (vUv.y > revealProgress * 1.1) discard; 
      
      vec4 texColor = texture2D(tDiffuse, vUv);
      vec3 inverted = 1.0 - texColor.rgb;
      
      // Stage 6-8: color deepening phase
      float deepen = smoothstep(6.0, 8.0, uStage);
      
      vec3 neonBlue = vec3(0.0, 0.6, 1.0);
      vec3 deepNavy = vec3(0.02, 0.05, 0.1);
      vec3 brightWhite = vec3(1.0, 1.0, 1.0);
      
      // Base holographic tint (while building)
      vec3 baseTint = inverted * mix(neonBlue, brightWhite, 0.5) + vec3(0.0, 0.05, 0.15);
      
      // Final deepened color (solidified document)
      // Make the background dark navy, and the text bright neon blue/white
      vec3 textGlow = inverted * vec3(0.2, 0.7, 1.0) * 1.5; 
      vec3 deepTint = mix(deepNavy, textGlow, max(inverted.r, max(inverted.g, inverted.b)));
      
      vec3 finalColor = mix(baseTint, deepTint, deepen);
      
      // Alpha becomes fully solid in deepened phase
      float baseAlpha = mix(0.4, 0.9, max(inverted.r, max(inverted.g, inverted.b)));
      float alpha = mix(baseAlpha, 1.0, deepen);
      
      // Add a scanline effect over the document
      float scanline = sin(vUv.y * 200.0 - uStage * 10.0) * 0.05;
      finalColor += scanline * (1.0 - deepen);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const DocumentAssembly = ({ currentStage, texture }) => {
  const documentRef = useRef();
  
  useFrame((state) => {
    if (!documentRef.current) return;
    if (documentRef.current.material.uniforms) {
      documentRef.current.material.uniforms.uStage.value = THREE.MathUtils.lerp(
        documentRef.current.material.uniforms.uStage.value, currentStage, 0.05
      );
      documentRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  const docGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-DOC_W/2, -DOC_H/2);
    shape.lineTo(DOC_W/2, -DOC_H/2);
    shape.lineTo(DOC_W/2, DOC_H/2);
    shape.lineTo(-DOC_W/2, DOC_H/2);
    shape.lineTo(-DOC_W/2, -DOC_H/2);
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <group position={[0, 0.2, -0.01]}>
      <mesh ref={documentRef} geometry={docGeometry}>
        {texture ? (
           <shaderMaterial args={[{
             uniforms: { tDiffuse: { value: texture }, uStage: { value: 0 }, uTime: { value: 0 } },
             vertexShader: DocumentShader.vertexShader,
             fragmentShader: DocumentShader.fragmentShader,
             transparent: true,
             side: THREE.DoubleSide
           }]} />
        ) : (
           <meshBasicMaterial color="#010409" transparent opacity={0} side={THREE.DoubleSide} />
        )}
      </mesh>
    </group>
  );
};

// ===================== GLOWING PLATFORM =====================
const Platform = ({ currentStage }) => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.z = state.clock.elapsedTime * 0.15;
  });
  
  // Platform appears directly under the center assembly
  return (
    <group position={[0, -3.5, 0]} rotation={[Math.PI / 2.2, 0, 0]} ref={groupRef}>
      <mesh>
        <torusGeometry args={[3.5, 0.02, 32, 100]} />
        <meshBasicMaterial color="#009DFF" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.5, 0.01, 16, 100]} />
        <meshBasicMaterial color="#0066ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <circleGeometry args={[3.5, 64]} />
        <meshBasicMaterial color="#002288" transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ===================== CSS OVERLAYS =====================
const LabelsOverlay = ({ currentStage }) => {
  const visible = currentStage >= 3 && currentStage <= 6;
  
  const labels = [
    { text: 'EXPERIENCE DATA', color: '#009DFF', top: '25%', left: '15%', linePath: 'M 50,30 L 150,150' },
    { text: 'SKILL VECTORS', color: '#009DFF', top: '40%', left: '20%', linePath: 'M 50,30 L 150,50' },
    { text: 'PROJECT METRICS', color: '#009DFF', top: '20%', left: '70%', linePath: 'M 50,30 L -100,160' },
    { text: 'STRUCTURAL INTEGRITY', color: '#009DFF', top: '55%', left: '75%', linePath: 'M 50,30 L -150,0' },
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
            animation: `fadeIn 0.5s ${i * 0.3}s ease-out both` 
          }}
        >
          <div 
            className="px-4 py-1.5 border rounded-lg text-[10px] font-bold tracking-widest bg-[#010409]/90 backdrop-blur-md"
            style={{ borderColor: lbl.color, color: 'white', boxShadow: `0 0 15px ${lbl.color}40` }}
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
        const vp = page.getViewport({ scale: 4 });
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
      
      <Canvas camera={{ position: [0, 0, 7.5], fov: 50 }} gl={{ toneMapping: THREE.NoToneMapping, alpha: false }} style={{ background: '#010409' }}>
        <ambientLight intensity={0.5} />
        <ChipAssembly currentStage={currentStage} />
        <DocumentAssembly currentStage={currentStage} texture={texture} />
        <Platform currentStage={currentStage} />
      </Canvas>

      <LabelsOverlay currentStage={currentStage} />

      <div className="absolute top-12 left-12 z-50 pointer-events-none flex flex-col gap-2 transition-opacity duration-300" key={currentStage}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#010409] border border-[#009DFF]/40 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_15px_rgba(0,157,255,0.3)]">
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
