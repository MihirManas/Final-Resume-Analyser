"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Zap, Play } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="bg-[#020408] text-white min-h-screen relative overflow-hidden flex flex-col font-sans">
      
      {/* 
        Background Image (frame_02) handled with Framer Motion 
        for precise sizing, subtle parallax blending, and masking.
      */}
      <div className="absolute inset-0 z-0 flex justify-end pointer-events-none">
        <motion.div 
          className="relative w-[150%] md:w-full lg:w-[70%] h-[120%] md:h-full -right-[20%] md:right-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            x: mousePosition.x * 20,
            y: mousePosition.y * 20,
          }}
        >
          <img 
            src="/video/frame_02.png" 
            alt="Burning Resume Magic" 
            className="w-full h-full object-cover md:object-contain object-right"
            style={{
              WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, black 30%, transparent 70%)',
              maskImage: 'radial-gradient(ellipse at 70% 50%, black 30%, transparent 70%)'
            }}
          />
        </motion.div>
      </div>

      <main className="flex-1 flex flex-col w-full relative z-10 pt-32 pb-12">
        
        {/* Hero Content */}
        <div className="max-w-[1400px] mx-auto px-8 w-full flex-1 flex flex-col justify-center min-h-[calc(100vh-200px)]">
          <motion.div 
            className="max-w-2xl mt-12 lg:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#40b8ff]/30 bg-[#050508]/50 backdrop-blur-md mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-[#40b8ff]" />
              <span className="text-sm font-medium text-[#40b8ff]">AI-Powered Resume Intelligence</span>
            </motion.div>
            
            {/* Heading */}
            <h1 className="text-[4rem] md:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-6">
              Unlock the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#40b8ff] via-[#759cff] to-[#bd75ff] drop-shadow-[0_0_20px_rgba(64,184,255,0.3)]">
                Job Secret
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-lg font-light">
              Bypass HR filters and ATS bots. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link href="/analyzer" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#40b8ff] to-[#8c52ff] text-white rounded-full font-bold text-lg shadow-[0_0_30px_rgba(64,184,255,0.4)]"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  Analyze My Resume
                </motion.div>
              </Link>
              
              <Link href="/demo" className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="group flex items-center justify-center gap-3 px-6 py-4 text-white hover:text-[#40b8ff] transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-600 group-hover:border-[#40b8ff] group-hover:bg-[#40b8ff]/10 transition-colors">
                    <Play className="w-4 h-4 ml-1 fill-current" />
                  </div>
                  <span className="font-semibold text-lg">See How It Works</span>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom Transition Element */}
        <motion.div 
          className="w-full mt-auto pt-12 flex flex-col items-center justify-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="flex items-center justify-center w-full max-w-[1400px] opacity-60">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
            <div className="px-6 flex items-center gap-2">
              <span className="text-xl font-bold tracking-wide text-gray-300">See the Magic Happen</span>
              <Sparkles className="w-5 h-5 text-[#40b8ff]" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
