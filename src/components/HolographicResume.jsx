"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path to local or CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Custom Shader for Burning Coals Transition
const BurningCoalsShader = {
  uniforms: {
    tDiffuse: { value: null },
    uProgress: { value: 0.0 }, // 0 to 1
    uTime: { value: 0.0 },
  },
  vertexShader: `
    uniform float uProgress;
    uniform float uTime;
    varying vec2 vUv;
    varying float vNoise;

    // Simple noise function
    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
    float noise(vec2 x) {
      vec2 i = floor(x);
      vec2 f = fract(x);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
      vUv = uv;
      // Generate noise based on UV
      float n = noise(uv * 20.0 + uTime * 0.5);
      vNoise = n;

      // Displacement
      vec3 pos = position;
      // If progress > 0, start displacing outwards in Z and XY
      if (uProgress > 0.0) {
        float displacement = smoothstep(0.3, 1.0, uProgress * n);
        pos.z += displacement * 2.0; // pop out
        pos.x += (hash(uv) - 0.5) * displacement * 1.5;
        pos.y += (hash(uv + 1.0) - 0.5) * displacement * 1.5;
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uProgress;
    varying vec2 vUv;
    varying float vNoise;

    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      
      if (uProgress == 0.0) {
        gl_FragColor = texColor;
        return;
      }

      // Burning effect logic
      float burnEdge = uProgress * 1.5; 
      
      if (vNoise < burnEdge - 0.2) {
        // Fully burned away (transparent)
        discard;
      } else if (vNoise < burnEdge) {
        // Burning edge (Glowing Red/Orange/Blue)
        // Mix between deep red and bright blue
        vec3 fireColor = mix(vec3(1.0, 0.2, 0.0), vec3(0.0, 0.6, 1.0), vNoise);
        // Increase intensity for bloom
        gl_FragColor = vec4(fireColor * 2.5, 1.0);
      } else {
        // Still normal document, but darken slightly based on progress
        gl_FragColor = mix(texColor, vec4(0.0,0.0,0.0,1.0), uProgress * 0.5);
      }
    }
  `
};

const PDFMesh = ({ texture, isTransitioning }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating (bobbing up and down)
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      
      // Gentle rotation (2-5 degrees on Y axis) -> roughly 0.035 to 0.087 radians
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Animate progress if transitioning
      if (isTransitioning) {
        if (materialRef.current.uniforms.uProgress.value < 1.0) {
          materialRef.current.uniforms.uProgress.value += 0.01;
        }
      } else {
        if (materialRef.current.uniforms.uProgress.value > 0.0) {
          materialRef.current.uniforms.uProgress.value -= 0.02; // Reverse quickly if transition cancels
          if (materialRef.current.uniforms.uProgress.value < 0.0) materialRef.current.uniforms.uProgress.value = 0.0;
        }
      }
    }
  });

  const shaderArgs = useMemo(() => {
    return {
      uniforms: {
        tDiffuse: { value: texture },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      vertexShader: BurningCoalsShader.vertexShader,
      fragmentShader: BurningCoalsShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    };
  }, [texture]);

  // Dimensions of a standard A4 page scaled down
  // Aspect ratio is typically 1:1.414
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3, 4.24, 64, 64]} />
      <shaderMaterial 
        ref={materialRef}
        attach="material"
        args={[shaderArgs]}
      />
      {/* Edge glow effect */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(3, 4.24)]} />
        <lineBasicMaterial color="#009DFF" linewidth={2} transparent opacity={0.6} />
      </lineSegments>
    </mesh>
  );
};

export default function HolographicResume({ file, isTransitioning }) {
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!file) return;

    const loadPDF = async () => {
      try {
        const fileURL = URL.createObjectURL(file);
        const loadingTask = pdfjsLib.getDocument(fileURL);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // High resolution scale for pixel-perfect rendering
        const scale = 3; 
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        
        setTexture(tex);
        URL.revokeObjectURL(fileURL);
      } catch (err) {
        console.error("Error rendering PDF:", err);
        setError(true);
      }
    };

    loadPDF();
  }, [file]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 bg-black/50 border border-red-500/50 rounded-xl">
        Failed to render PDF preview
      </div>
    );
  }

  if (!texture) {
    return (
      <div className="w-[280px] h-[380px] bg-[#020408]/40 border border-[#009DFF]/40 rounded-xl flex items-center justify-center">
        <span className="text-[#009DFF] text-sm animate-pulse">Rendering PDF...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" style={{ perspective: '1000px' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        {/* Soft rim lighting */}
        <pointLight position={[-5, -5, -5]} intensity={2} color="#009DFF" />
        
        <PDFMesh texture={texture} isTransitioning={isTransitioning} />
        
        <EffectComposer>
          <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>
      </Canvas>
      
      {/* Surrounding effects */}
      <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[0_20px_60px_-15px_rgba(0,157,255,0.4)]" />
    </div>
  );
}
