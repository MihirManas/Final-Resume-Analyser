"use client";
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const COLS = 100;
const ROWS = 141;
const COUNT = COLS * ROWS;
const WIDTH = 3;
const HEIGHT = 4.24;
const CUBE_W = WIDTH / COLS;
const CUBE_H = HEIGHT / ROWS;

// Custom Shader for the Shattering Cubes
const ShatterShader = {
  uniforms: {
    tDiffuse: { value: null },
    uProgress: { value: 0.0 },
  },
  vertexShader: `
    uniform float uProgress;
    attribute vec2 instanceUv;
    attribute vec3 aRandom;
    varying vec2 vUv;
    varying float vProgress;
    varying vec3 vRandom;

    mat4 rotationMatrix(vec3 axis, float angle) {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;
      return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                  0.0,                                0.0,                                0.0,                                1.0);
    }

    void main() {
      vUv = instanceUv;
      vProgress = uProgress;
      vRandom = aRandom;

      vec3 pos = position;
      
      if (uProgress > 0.0) {
        // Delay explosion based on y so it shatters from bottom to top
        float delay = (1.0 - instanceUv.y) * 0.3;
        float localProgress = clamp((uProgress - delay) * 2.0, 0.0, 1.0);
        float ease = pow(localProgress, 2.0);
        
        // Scatter outward violently across the entire page
        vec3 targetPos = aRandom * vec3(50.0, 50.0, 30.0); 
        
        // Individual cube rotation
        mat4 rot = rotationMatrix(aRandom, localProgress * 30.0);
        pos = (rot * vec4(pos, 1.0)).xyz;
        
        vec4 instancePosition = instanceMatrix * vec4(pos, 1.0);
        instancePosition.xyz += targetPos * ease;
        
        gl_Position = projectionMatrix * modelViewMatrix * instancePosition;
      } else {
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      }
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uProgress;
    varying vec2 vUv;
    varying float vProgress;
    varying vec3 vRandom;

    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      
      if (vProgress == 0.0) {
        gl_FragColor = texColor;
        return;
      }

      // Exactly matching the reference image colors
      // Electric Blue Energy
      vec3 blueCore = vec3(0.0, 0.9, 1.0) * 4.0; 
      vec3 blueEdge = vec3(0.0, 0.3, 0.8) * 2.0;
      
      // Burning Coals / Fire (Orange/Yellow/Red)
      vec3 fireCore = vec3(1.0, 0.7, 0.1) * 4.5;
      vec3 fireEdge = vec3(1.0, 0.2, 0.0) * 2.5;
      
      // Select Blue or Fire based on aRandom
      float isBlue = step(0.5, vRandom.x);
      
      vec3 targetColor;
      if (isBlue > 0.5) {
        targetColor = mix(blueEdge, blueCore, fract(vRandom.y * 10.0));
      } else {
        targetColor = mix(fireEdge, fireCore, fract(vRandom.y * 10.0));
      }
      
      // Mix from original document color to the glowing color as it shatters
      float localProgress = clamp(vProgress * 2.0, 0.0, 1.0);
      vec3 finalColor = mix(texColor.rgb, targetColor, localProgress);
      
      // Fade out at the very end
      float alpha = 1.0 - pow(localProgress, 3.0);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

const PDFMesh = ({ texture, isTransitioning }) => {
  const groupRef = useRef();
  const solidPlaneRef = useRef();
  const instancedMeshRef = useRef();
  const materialRef = useRef();
  
  // Setup Instances Data
  const { uvs, randoms } = useMemo(() => {
    const uvs = new Float32Array(COUNT * 2);
    const randoms = new Float32Array(COUNT * 3);
    
    let i = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        // UV mapping
        uvs[i*2] = x / COLS;
        uvs[i*2+1] = 1.0 - (y / ROWS); // Flip Y for correct mapping
        
        // Random vectors for explosion trajectory
        randoms[i*3] = (Math.random() - 0.5) * 2.0;
        randoms[i*3+1] = (Math.random() - 0.5) * 2.0;
        randoms[i*3+2] = Math.random(); // Push forward mostly
        
        i++;
      }
    }
    return { uvs, randoms };
  }, []);

  // Set Instance Matrices once
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    const dummy = new THREE.Object3D();
    let i = 0;
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        // Centered coordinates
        const px = (x / COLS) * WIDTH - WIDTH/2 + CUBE_W/2;
        // Y starts from top to bottom
        const py = (1.0 - y / ROWS) * HEIGHT - HEIGHT/2 - CUBE_H/2;
        
        dummy.position.set(px, py, 0);
        dummy.updateMatrix();
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      if (isTransitioning) {
        // 360 degree spin on Y axis during transition
        // We use Math.PI * 2 multiplied by progress
        if (materialRef.current) {
          const currentProgress = materialRef.current.uniforms.uProgress.value;
          groupRef.current.rotation.y = currentProgress * Math.PI * 2;
        }
      } else {
        // Reset rotation if not transitioning
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
      }
    }
    
    if (materialRef.current) {
      if (isTransitioning) {
        // Swap to instanced mesh
        solidPlaneRef.current.visible = false;
        instancedMeshRef.current.visible = true;
        
        if (materialRef.current.uniforms.uProgress.value < 1.0) {
          materialRef.current.uniforms.uProgress.value += 0.012; // Controls speed of shatter
        }
      } else {
        // Swap to solid plane
        solidPlaneRef.current.visible = true;
        instancedMeshRef.current.visible = false;
        materialRef.current.uniforms.uProgress.value = 0.0;
      }
    }
  });

  const shaderArgs = useMemo(() => {
    return {
      uniforms: {
        tDiffuse: { value: texture },
        uProgress: { value: 0.0 },
      },
      vertexShader: ShatterShader.vertexShader,
      fragmentShader: ShatterShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    };
  }, [texture]);

  return (
    <group ref={groupRef}>
      
      {/* Solid Plane - Visible when idle for perfect quality */}
      <mesh ref={solidPlaneRef}>
        <planeGeometry args={[WIDTH, HEIGHT, 1, 1]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>

      {/* Instanced Mesh - Visible only during shatter transition */}
      <instancedMesh ref={instancedMeshRef} args={[null, null, COUNT]} visible={false}>
        <boxGeometry args={[CUBE_W * 1.05, CUBE_H * 1.05, 0.05]}>
          <instancedBufferAttribute attach="attributes-instanceUv" args={[uvs, 2]} />
          <instancedBufferAttribute attach="attributes-aRandom" args={[randoms, 3]} />
        </boxGeometry>
        <shaderMaterial 
          ref={materialRef}
          attach="material"
          args={[shaderArgs]}
        />
      </instancedMesh>
      
    </group>
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

        const scale = 5; 
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          background: 'rgba(255,255,255,1)' // Ensure pdf.js fills background
        };
        
        // Also manually fill just in case
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render(renderContext).promise;

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = true;
        
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
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }} 
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={2} color="#009DFF" />
        
        <PDFMesh texture={texture} isTransitioning={isTransitioning} />
        
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={1.5} 
            luminanceSmoothing={0.1} 
            intensity={2.0} 
            mipmapBlur 
          />
        </EffectComposer>
      </Canvas>
      
      {/* Surrounding effects */}
      <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[0_20px_60px_-15px_rgba(0,157,255,0.4)]" />
    </div>
  );
}
