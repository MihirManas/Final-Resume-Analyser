"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Zap } from "lucide-react";

import ParticleCanvas from "@/components/ParticleCanvas";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 3D Parallax and Magic Transformation calculations
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 0, 15]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);
  
  // The "Burning" to "Golden" effect
  const borderColor = useTransform(
    scrollYProgress, 
    [0, 0.4, 0.6, 1], 
    ["rgba(239, 68, 68, 1)", "rgba(249, 115, 22, 1)", "rgba(0, 157, 255, 1)", "rgba(16, 185, 129, 1)"]
  );
  
  const glowColor = useTransform(
    scrollYProgress, 
    [0, 0.4, 0.6, 1], 
    ["0 0 50px rgba(239, 68, 68, 0.6)", "0 0 70px rgba(249, 115, 22, 0.6)", "0 0 100px rgba(0, 157, 255, 0.8)", "0 0 80px rgba(16, 185, 129, 0.6)"]
  );

  const filterBlur = useTransform(scrollYProgress, [0, 0.4, 0.5, 0.6, 1], ["blur(0px)", "blur(4px)", "blur(10px)", "blur(2px)", "blur(0px)"]);

  const docOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1, 0, 1, 1]);
  const newDocOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 0, 1, 1]);

  return (
    <div className="bg-[#0A0A0A] min-h-[300vh] text-white relative overflow-hidden" ref={containerRef}>
      <ParticleCanvas theme="dark" />

      {/* Hero Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden perspective-[2000px]">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A] z-10 pointer-events-none" />
        
        {/* Headlines */}
        <motion.div 
          className="absolute top-32 z-20 text-center px-4"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" /> Your current resume is burning opportunities.
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
            My Job Secret
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            Scroll down to witness the transformation.
          </p>
        </motion.div>

        {/* The 3D Resume Object */}
        <motion.div
          style={{
            rotateX,
            rotateY,
            scale,
            borderColor,
            boxShadow: glowColor,
            filter: filterBlur,
          }}
          className="relative z-30 w-[300px] md:w-[400px] h-[400px] md:h-[550px] bg-black/80 backdrop-blur-3xl rounded-2xl border-[4px] p-6 flex flex-col gap-4 transform-gpu"
        >
          {/* Old Resume Content (Fades out) */}
          <motion.div style={{ opacity: docOpacity }} className="absolute inset-6 flex flex-col gap-4">
            <div className="w-3/4 h-8 bg-red-500/20 rounded-md" />
            <div className="w-full h-4 bg-red-500/10 rounded-md" />
            <div className="w-5/6 h-4 bg-red-500/10 rounded-md" />
            <div className="w-full h-4 bg-red-500/10 rounded-md" />
            <div className="mt-8 w-1/2 h-6 bg-red-500/20 rounded-md" />
            <div className="w-full h-24 bg-red-500/10 rounded-md" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-red-500/50 rotate-[-15deg] border-4 border-red-500/50 p-2 rounded-xl">REJECTED</span>
            </div>
          </motion.div>

          {/* New Resume Content (Fades in) */}
          <motion.div style={{ opacity: newDocOpacity }} className="absolute inset-6 flex flex-col gap-4">
            <div className="w-3/4 h-8 bg-green-400/30 rounded-md" />
            <div className="w-full h-4 bg-[#009DFF]/20 rounded-md" />
            <div className="w-5/6 h-4 bg-[#009DFF]/20 rounded-md" />
            <div className="w-full h-4 bg-[#009DFF]/20 rounded-md" />
            <div className="mt-8 w-1/2 h-6 bg-green-400/30 rounded-md" />
            <div className="w-full h-24 bg-[#009DFF]/20 rounded-md flex flex-wrap gap-2 p-2">
              <div className="w-12 h-6 bg-[#009DFF]/40 rounded-sm" />
              <div className="w-16 h-6 bg-[#009DFF]/40 rounded-sm" />
              <div className="w-10 h-6 bg-[#009DFF]/40 rounded-sm" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-green-400/80 rotate-[-15deg] border-4 border-green-400/80 p-2 rounded-xl backdrop-blur-sm">HIRED</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Final CTA (Fades in at the end) */}
        <motion.div 
          className="absolute bottom-20 z-40 text-center px-4 w-full flex flex-col md:flex-row items-center justify-center gap-6"
          style={{ opacity: useTransform(scrollYProgress, [0.8, 1], [0, 1]) }}
        >
          <Link href="/analyzer" className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)]">
            <Zap className="w-5 h-5 text-yellow-500" />
            Transform My Resume
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="/api-access" className="group flex items-center gap-3 px-8 py-4 bg-[#009DFF]/10 text-[#009DFF] border border-[#009DFF]/30 rounded-full font-bold text-lg hover:bg-[#009DFF]/20 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,157,255,0.2)]">
            <Code2 className="w-5 h-5" />
            Integrate Our API
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
