"use client";
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const DOC_W = 2.8;
const DOC_H = 3.96;
const FOLD = 0.4;

// ===================== GLOWING PLATFORM RINGS =====================
const Platform = () => {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  const rings = [
    { r: 2.8, thick: 0.015, op: 0.8 },
    { r: 2.4, thick: 0.012, op: 0.5 },
    { r: 1.8, thick: 0.010, op: 0.3 },
    { r: 1.2, thick: 0.008, op: 0.2 },
  ];

  return (
    <group position={[0, -2.5, 0]} rotation={[Math.PI / 2.3, 0, 0]} ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i}>
          <torusGeometry args={[ring.r, ring.thick, 64, 100]} />
          <meshBasicMaterial color={new THREE.Color(0.0, 0.4, 1.0).multiplyScalar(2.5)} transparent opacity={ring.op} />
        </mesh>
      ))}
      
      {/* Dashed outer ring */}
      <mesh>
        <torusGeometry args={[3.2, 0.01, 16, 100]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.4, 1.0)} transparent opacity={0.6} wireframe />
      </mesh>
      
      <mesh>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial color={new THREE.Color(0.0, 0.2, 0.6)} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// ===================== DOCUMENT PLANE (WITH FOLDED CORNER) =====================
const DocumentShader = {
  uniforms: { tDiffuse: { value: null }, uOpacity: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      // Calculate UV based on position to map full texture onto custom shape
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
      
      // If it's a white resume, invert it. Black text becomes white.
      vec3 inverted = 1.0 - texColor.rgb;
      
      // Apply dark blue glassmorphism background and bright cyan text
      vec3 darkGlass = vec3(0.01, 0.05, 0.15); // Deep blue background
      vec3 brightText = vec3(0.8, 0.9, 1.0);   // Cyan-tinted white text
      
      // Determine what is text vs background. The brighter the inverted, the more it is text.
      float isText = max(inverted.r, max(inverted.g, inverted.b));
      
      vec3 finalColor = mix(darkGlass, brightText, isText);
      float alpha = mix(0.6, 1.0, isText); // Background is semi-transparent, text is solid
      
      gl_FragColor = vec4(finalColor, uOpacity * alpha);
    }
  `
};

const DocumentMesh = ({ texture, visible }) => {
  const groupRef = useRef();
  const materialRef = useRef();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Gentle floating bob
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    
    // Fade in/out based on visibility
    const targetOpacity = visible ? 1 : 0;
    if (materialRef.current) {
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value, targetOpacity, 0.05
      );
    }
  });

  // Create Custom Shape with Top-Right Folded Corner
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

  const foldGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(DOC_W/2 - FOLD, DOC_H/2);
    shape.lineTo(DOC_W/2, DOC_H/2 - FOLD);
    shape.lineTo(DOC_W/2 - FOLD, DOC_H/2 - FOLD);
    shape.lineTo(DOC_W/2 - FOLD, DOC_H/2);
    return new THREE.ShapeGeometry(shape);
  }, []);

  const edges = useMemo(() => new THREE.EdgesGeometry(docGeometry), [docGeometry]);
  const foldEdges = useMemo(() => new THREE.EdgesGeometry(foldGeometry), [foldGeometry]);

  return (
    <group ref={groupRef}>
      {/* Main Glass Document */}
      <mesh geometry={docGeometry}>
        {texture ? (
           <shaderMaterial ref={materialRef} args={[{
             uniforms: { tDiffuse: { value: texture }, uOpacity: { value: 0 } },
             vertexShader: DocumentShader.vertexShader,
             fragmentShader: DocumentShader.fragmentShader,
             transparent: true,
             side: THREE.DoubleSide
           }]} />
        ) : (
           <meshBasicMaterial color="#010409" transparent opacity={visible ? 0.6 : 0} side={THREE.DoubleSide} />
        )}
      </mesh>

      {/* The Folded Flap */}
      <mesh geometry={foldGeometry} position={[0, 0, 0.02]}>
         <meshBasicMaterial color={new THREE.Color(0.0, 0.4, 1.0)} transparent opacity={visible ? 0.4 : 0} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Glowing Outlines */}
      {visible && (
        <group>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color={new THREE.Color(0.0, 0.5, 1.0).multiplyScalar(2.5)} transparent opacity={0.8} />
          </lineSegments>
          <lineSegments geometry={foldEdges} position={[0, 0, 0.02]}>
            <lineBasicMaterial color={new THREE.Color(0.0, 0.5, 1.0).multiplyScalar(2.5)} transparent opacity={0.8} />
          </lineSegments>
        </group>
      )}
    </group>
  );
};

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
        const vp = page.getViewport({ scale: 5 }); // High resolution
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        const ctx = c.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, c.width, c.height);
        
        await page.render({ 
          canvasContext: ctx, 
          viewport: vp,
          background: 'rgba(255,255,255,1)'
        }).promise;
        
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

  const showDocument = currentStep > 1 && file != null;

  return (
    <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} gl={{ toneMapping: THREE.NoToneMapping, alpha: true }}>
      <ambientLight intensity={0.5} />
      
      <Platform />
      <DocumentMesh texture={texture} visible={showDocument} />
      
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.3} intensity={2.0} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
