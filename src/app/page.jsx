"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Zap, Play } from "lucide-react";
import { motion } from "framer-motion";
import ProcessSection from "@/components/ProcessSection";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="bg-[#020408] text-white min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-[#009DFF]/30">
      
      {/* 
        Background Image (frame_02) handled with Framer Motion 
        for precise sizing, subtle parallax blending, and masking.
      */}
      <div className="absolute top-0 right-0 bottom-0 left-0 z-0 flex justify-end pointer-events-none overflow-hidden h-[100vh]">
        <motion.div 
          className="relative w-[130%] md:w-[85%] lg:w-[65%] h-full -right-[15%] md:-right-[5%] lg:right-0 mt-20 lg:mt-0"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            x: mousePosition.x * 15,
            y: mousePosition.y * 15,
          }}
        >
          <img 
            src="/video/frame_02.png" 
            alt="Burning Resume Magic" 
            className="w-full h-full object-cover md:object-contain object-right opacity-95"
            style={{
              WebkitMaskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)',
              maskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)'
            }}
          />
        </motion.div>
      </div>

      <main className="flex-1 flex flex-col w-full relative z-10 pt-28 pb-10">
        
        {/* Hero Content */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full flex-1 flex flex-col justify-center min-h-[calc(100vh-180px)]">
          <motion.div 
            className="max-w-2xl mt-16 lg:mt-0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#009DFF]/30 mb-7 shadow-[0_0_15px_rgba(0,157,255,0.1)] backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-[#009DFF]" />
              <span className="text-[13px] font-medium text-[#009DFF] tracking-wide">AI-Powered Resume Intelligence</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="text-white drop-shadow-md">Unlock the</span> <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#009DFF] to-[#b866ff] drop-shadow-[0_0_25px_rgba(0,157,255,0.3)]">
                Job Secret
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-gray-400 text-[17px] sm:text-lg leading-relaxed mb-10 max-w-lg font-light tracking-wide">
              Bypass HR filters and ATS bots. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <Link href="/analyzer" className="w-full sm:w-auto">
                <div className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#009DFF] to-[#8c52ff] text-white rounded-full font-bold text-[15px] hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(0,157,255,0.3)] hover:shadow-[0_0_30px_rgba(0,157,255,0.5)]">
                  <Zap className="w-4 h-4 fill-current" />
                  Analyze My Resume
                </div>
              </Link>
              
              <Link href="/demo" className="w-full sm:w-auto">
                <div className="group flex items-center justify-center gap-3 px-6 py-4 text-white hover:text-[#009DFF] transition-colors cursor-pointer">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-500 group-hover:border-[#009DFF] group-hover:bg-[#009DFF]/10 transition-colors">
                    <Play className="w-4 h-4 ml-1 fill-current opacity-90 group-hover:opacity-100" />
                  </div>
                  <span className="font-semibold text-[15px]">See How It Works</span>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Transition Element */}
        <motion.div 
          className="w-full pt-8 flex flex-col items-center justify-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="flex items-center justify-center w-full max-w-[1400px] opacity-50 hover:opacity-100 transition-opacity duration-500">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
            <div className="px-6 flex items-center gap-2">
              <span className="text-xl font-bold tracking-wide text-white">See the Magic Happen</span>
              <Sparkles className="w-5 h-5 text-[#009DFF]" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
          </div>
        </motion.div>

        {/* Process Section */}
        <ProcessSection />

      </main>
    </div>
  );
}
