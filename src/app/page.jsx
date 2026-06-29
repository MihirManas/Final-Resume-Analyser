"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Code2, Zap } from "lucide-react";
import ParticleCanvas from "@/components/ParticleCanvas";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white relative overflow-hidden flex items-center">
      <ParticleCanvas theme="dark" />

      {/* Main Container - Split Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 pt-20">
        
        {/* LEFT SIDE - TEXT CONTENT */}
        <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-bold mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Sparkles className="w-4 h-4" /> Your current resume is burning opportunities.
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-gray-500 leading-tight">
              Unlock the <br className="hidden lg:block" />
              <span className="text-[#009DFF] drop-shadow-[0_0_20px_rgba(0,157,255,0.4)]">Job Secret</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Bypass HR filters and ATS bots. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/analyzer" className="w-full sm:w-auto group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                <Zap className="w-5 h-5 text-yellow-500" />
                Analyze Resume
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/api-access" className="w-full sm:w-auto group flex items-center justify-center gap-3 px-8 py-4 bg-[#009DFF]/10 text-[#009DFF] border border-[#009DFF]/30 rounded-full font-bold text-lg hover:bg-[#009DFF]/20 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,157,255,0.1)]">
                <Code2 className="w-5 h-5" />
                Get API Access
              </Link>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE - ANIMATION SEQUENCE */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative h-[500px] md:h-[600px] perspective-[2000px]">
          
          {/* 
            Sequence timings (Total 6 seconds):
            0 - 1.5s: Old resume visible, catches fire (glows red).
            1.5s - 2.5s: Old resume flips and shrinks to 0 (burns away).
            2.5s - 3.5s: Hands slide up from bottom holding New Resume.
            3.5s - 4.5s: Pause.
            4.5s - 5.5s: Hands slide down, New Resume stays floating.
          */}

          {/* THE HANDS */}
          <motion.div 
            className="absolute bottom-[-150px] left-1/2 -translate-x-1/2 flex gap-40 md:gap-52 z-30 pointer-events-none"
            animate={{ 
              y: [200, 200, -180, -180, 200], // Start hidden -> stay hidden -> slide up -> stay -> slide down
              opacity: [0, 0, 1, 1, 0]
            }}
            transition={{ 
              duration: 6, 
              times: [0, 0.4, 0.55, 0.75, 1], 
              ease: "easeInOut" 
            }}
          >
            {/* Left Hand (Stylized robot/tech hand) */}
            <div className="relative w-12 h-40 bg-gradient-to-t from-gray-900 to-gray-400 rounded-t-full shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-white/40 overflow-hidden">
               <div className="absolute top-4 left-2 w-8 h-2 bg-blue-400/50 rounded-full blur-[2px]"></div>
            </div>
            {/* Right Hand */}
            <div className="relative w-12 h-40 bg-gradient-to-t from-gray-900 to-gray-400 rounded-t-full shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-white/40 overflow-hidden">
               <div className="absolute top-4 left-2 w-8 h-2 bg-blue-400/50 rounded-full blur-[2px]"></div>
            </div>
          </motion.div>

          {/* OLD RESUME (Burning) */}
          <motion.div
            className="absolute top-10 w-[280px] md:w-[360px] h-[380px] md:h-[480px] bg-black/90 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4 transform-gpu z-20"
            animate={{
              rotateY: [0, 0, 90, 90, 90], // Normal -> Normal -> Flip halfway -> Stay -> Stay
              scale: [1, 1.05, 0, 0, 0], // Normal -> slightly enlarge (burning) -> shrink to 0 -> Stay -> Stay
              opacity: [1, 1, 0, 0, 0],
              boxShadow: [
                "0 0 0px rgba(239,68,68,0)",
                "0 0 100px rgba(239,68,68,1)", // Intense red glow
                "0 0 0px rgba(239,68,68,0)",
                "0 0 0px rgba(239,68,68,0)",
                "0 0 0px rgba(239,68,68,0)"
              ],
              borderColor: [
                "rgba(255,255,255,0.1)",
                "rgba(239,68,68,1)",
                "rgba(239,68,68,0)",
                "rgba(239,68,68,0)",
                "rgba(239,68,68,0)"
              ],
              borderWidth: ["1px", "4px", "0px", "0px", "0px"]
            }}
            transition={{ duration: 6, times: [0, 0.25, 0.4, 0.75, 1], ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-red-500/10 rounded-2xl" />
            <div className="w-3/4 h-6 bg-red-500/30 rounded-md" />
            <div className="w-full h-3 bg-red-500/20 rounded-md" />
            <div className="w-5/6 h-3 bg-red-500/20 rounded-md" />
            <div className="mt-8 w-1/2 h-5 bg-red-500/30 rounded-md" />
            <div className="w-full h-20 bg-red-500/20 rounded-md" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl md:text-5xl font-black text-red-500/80 rotate-[-15deg] border-4 border-red-500/80 p-3 rounded-xl drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]">REJECTED</span>
            </div>
          </motion.div>

          {/* NEW RESUME (Approved) */}
          <motion.div
            className="absolute top-10 w-[280px] md:w-[360px] h-[380px] md:h-[480px] bg-[#0A0A0A]/90 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4 transform-gpu z-10 border-4 border-green-400"
            animate={{
              rotateY: [-90, -90, 0, 0, 0], // Start flipped -> stay flipped -> flip to front -> stay -> stay
              scale: [0.5, 0.5, 1, 1, 1], // Start small -> stay small -> normal -> stay -> stay
              y: [150, 150, 0, 0, 0], // Start low (with hands) -> stay low -> move up -> stay -> stay
              opacity: [0, 0, 1, 1, 1],
              boxShadow: [
                "0 0 0px rgba(34,197,94,0)",
                "0 0 0px rgba(34,197,94,0)",
                "0 0 80px rgba(34,197,94,0.6)", // Green glow when handed up
                "0 0 80px rgba(34,197,94,0.6)",
                "0 0 40px rgba(34,197,94,0.4)" // Settle glow
              ]
            }}
            transition={{ duration: 6, times: [0, 0.4, 0.55, 0.75, 1], ease: "easeInOut" }}
            style={{ y: 0 }} // Base floating animation after sequence
          >
            {/* Continuous float after sequence ends */}
            <motion.div 
              className="absolute inset-0"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 6 }}
            >
              <div className="absolute inset-0 bg-green-500/5 rounded-xl pointer-events-none" />
              <div className="absolute inset-6 flex flex-col gap-4">
                <div className="w-3/4 h-6 bg-green-400/40 rounded-md" />
                <div className="w-full h-3 bg-[#009DFF]/30 rounded-md" />
                <div className="w-5/6 h-3 bg-[#009DFF]/30 rounded-md" />
                <div className="mt-8 w-1/2 h-5 bg-green-400/40 rounded-md" />
                <div className="w-full h-20 bg-[#009DFF]/20 rounded-md flex flex-wrap gap-2 p-2">
                  <div className="w-12 h-6 bg-[#009DFF]/40 rounded-sm" />
                  <div className="w-16 h-6 bg-[#009DFF]/40 rounded-sm" />
                  <div className="w-10 h-6 bg-[#009DFF]/40 rounded-sm" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-4xl md:text-5xl font-black text-green-400 rotate-[-15deg] border-4 border-green-400 p-3 rounded-xl drop-shadow-[0_0_20px_rgba(34,197,94,0.8)] backdrop-blur-sm bg-black/40">APPROVED</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
