"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Zap } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import Lenis from "lenis";
import Scene from "@/components/Scene";

export default function LandingPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for smooth scroll hijacking
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} id="scroll-container" className="bg-[#0A0A0A] text-white relative">
      
      {/* 
        WebGL Canvas fixed in background. 
        It handles all 3D rendering and is controlled by GSAP ScrollTrigger inside Scene.jsx 
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas shadows dpr={[1, 2]}>
          <React.Suspense fallback={null}>
            <Scene />
          </React.Suspense>
        </Canvas>
      </div>

      {/* HTML OVERLAYS - This is what creates the scroll height */}
      <div className="relative z-10 pointer-events-none">
        
        {/* Section 1: Intro */}
        <section className="h-[150vh] flex flex-col justify-start pt-40 px-6 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl pointer-events-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Sparkles className="w-4 h-4" /> The AI Engine for Elite Engineers.
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-500 leading-tight">
              Unlock the <br />
              <span className="text-[#009DFF] drop-shadow-[0_0_20px_rgba(0,157,255,0.4)]">Job Secret</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
              Bypass HR filters and ATS bots. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/analyzer" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                <Zap className="w-5 h-5 text-yellow-500" />
                Analyze Resume
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: The Burning / Flip Phase */}
        <section className="h-[150vh] flex flex-col justify-center items-start px-6 max-w-7xl mx-auto w-full">
          <div className="max-w-xl pointer-events-auto">
             <h2 className="text-4xl md:text-5xl font-bold mb-4">Your current resume <br/>is burning opportunities.</h2>
             <p className="text-gray-400 text-lg">Stop sending generic PDFs. Our AI analyzes, restructures, and mathematically aligns your experience with the JD.</p>
          </div>
        </section>

        {/* Section 3: The Hands / Resolution Phase */}
        <section className="h-[150vh] flex flex-col justify-center items-end text-right px-6 max-w-7xl mx-auto w-full">
          <div className="max-w-xl pointer-events-auto">
             <h2 className="text-4xl md:text-5xl font-bold mb-4">Hand-delivered perfection.</h2>
             <p className="text-gray-400 text-lg mb-8">Ready to integrate our intelligence into your own platform?</p>
             
             <Link href="/api-access" className="inline-flex group items-center justify-center gap-3 px-8 py-4 bg-[#009DFF]/10 text-[#009DFF] border border-[#009DFF]/30 rounded-full font-bold text-lg hover:bg-[#009DFF]/20 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,157,255,0.1)]">
                <Code2 className="w-5 h-5" />
                Get API Access
              </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
