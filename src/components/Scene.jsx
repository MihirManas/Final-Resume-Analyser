"use client";
import React, { useRef, useEffect } from 'react';
import { useGLTF, Environment, ContactShadows, Html, PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Scene() {
  const paper = useGLTF('/3d/paper_-_3mb.glb');
  const hand = useGLTF('/3d/hand_gesture_1.glb');
  
  const sceneRef = useRef();
  const paperRef = useRef();
  const handRef = useRef();
  const cameraRef = useRef();
  const htmlRef = useRef();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth scrubbing
        }
      });

      // 1. Initial State (Resume floating)
      tl.to(paperRef.current.rotation, { x: Math.PI / 8, y: -Math.PI / 4, z: 0.1, duration: 1 }, 0);
      tl.to(cameraRef.current.position, { z: 6, x: 2, y: 1, duration: 1 }, 0);

      // 2. Burning / Inspecting (Camera moves closer)
      tl.to(paperRef.current.position, { z: 1, duration: 1 }, 1);
      tl.to(paperRef.current.rotation, { x: 0, y: Math.PI, z: 0, duration: 1 }, 1); // Flip it around

      // 3. Hands come up
      tl.to(handRef.current.position, { y: -2, z: 1, duration: 1 }, 2);
      tl.to(handRef.current.rotation, { x: 0, y: Math.PI / 2, z: 0, duration: 1 }, 2);

      // 4. Hand pushes paper away / gives new paper
      tl.to(paperRef.current.position, { y: 2, duration: 1 }, 3);
      tl.to(handRef.current.position, { y: -5, duration: 1 }, 3.5);

    }, sceneRef);

    return () => ctx.revert();
  }, []);

  return (
    <group ref={sceneRef}>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={45} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <Environment preset="city" />

      {/* The Paper */}
      <primitive 
        ref={paperRef}
        object={paper.scene} 
        position={[2, 0, 0]} 
        scale={0.5}
        rotation={[0, -Math.PI / 6, 0]}
      >
        <Html transform position={[0, 0, 0.1]} distanceFactor={2}>
          <div className="w-[300px] h-[400px] bg-black/80 backdrop-blur-md rounded-xl border border-white/20 p-4 text-white flex flex-col pointer-events-none">
             <h3 className="text-xl font-bold mb-4 text-[#009DFF]">Resume Analysis</h3>
             <div className="w-full h-4 bg-gray-700 rounded mb-2"></div>
             <div className="w-3/4 h-4 bg-gray-700 rounded mb-2"></div>
             <div className="w-5/6 h-4 bg-gray-700 rounded mb-6"></div>
             <div className="mt-auto flex justify-between">
                <div className="w-12 h-4 bg-green-500/50 rounded"></div>
                <div className="w-12 h-4 bg-blue-500/50 rounded"></div>
             </div>
          </div>
        </Html>
      </primitive>

      {/* The Hands */}
      <primitive 
        ref={handRef}
        object={hand.scene} 
        position={[2, -10, 0]} // Start way below
        scale={2}
      />

      {/* Contact Shadows for realism */}
      <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </group>
  );
}
