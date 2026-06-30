"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Zap, Play } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import ProcessSection from "@/components/ProcessSection";

export default function LandingPage() {
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  // Motion values for subtle background parallax (optional, keeps it feeling alive)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Subtle parallax shifts
  const shiftX = useTransform(smoothMouseX, [0, 1], [-15, 15]);
  const shiftY = useTransform(smoothMouseY, [0, 1], [-15, 15]);

  const imageHoverX = useMotionValue(0.2); // Default to left side (hands)
  const smoothImageHoverX = useSpring(imageHoverX, { stiffness: 40, damping: 20 });
  
  // Opacities for smooth crossfading 3 frames based on X hover position over the image
  const frame02Opacity = useTransform(smoothImageHoverX, [0.1, 0.4], [1, 0]); // Left (default)
  const frame01Opacity = useTransform(smoothImageHoverX, [0.1, 0.4, 0.6, 0.9], [0, 1, 1, 0]); // Middle
  const frame03Opacity = useTransform(smoothImageHoverX, [0.6, 0.9], [0, 1]); // Right

  return (
    <div className="bg-[#020408] text-white min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-[#009DFF]/30">
      
      {/* 
        Background Image Experiment:
        When hovering directly over the image, it zooms in and crossfades.
      */}
      <div className="absolute top-0 right-0 bottom-0 left-0 z-0 flex justify-end pointer-events-none overflow-hidden h-[100vh]">
        <motion.div 
          className="relative w-[130%] md:w-[85%] lg:w-[65%] h-full -right-[15%] md:-right-[5%] lg:right-0 mt-20 lg:mt-0 pointer-events-auto cursor-default"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            imageHoverX.set(x / rect.width);
          }}
          onMouseLeave={() => {
            setIsHoveringImage(false);
            imageHoverX.set(0.2); // Reset to frame 2 position
          }}
          animate={{ scale: isHoveringImage ? 1.4 : 1.0 }}
          transition={{ type: "spring", stiffness: 30, damping: 15 }}
          style={{
            x: shiftX,
            y: shiftY,
          }}
        >
          {/* Frame 01 (Middle) */}
          <motion.img 
            src="/video/frame_01.png" 
            alt="Clear Burning Resume" 
            className="absolute inset-0 w-full h-full object-cover md:object-contain object-right opacity-95"
            style={{
              opacity: frame01Opacity,
              WebkitMaskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)',
              maskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)'
            }}
          />

          {/* Frame 02 (Left / Default) */}
          <motion.img 
            src="/video/frame_02.png" 
            alt="Burning Resume Magic with Hands" 
            className="absolute inset-0 w-full h-full object-cover md:object-contain object-right opacity-95"
            style={{
              opacity: frame02Opacity,
              WebkitMaskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)',
              maskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)'
            }}
          />

          {/* Frame 03 (Right) */}
          <motion.img 
            src="/video/frame_03.png" 
            alt="Burning Resume Further Interaction" 
            className="absolute inset-0 w-full h-full object-cover md:object-contain object-right opacity-95"
            style={{
              opacity: frame03Opacity,
              WebkitMaskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)',
              maskImage: 'radial-gradient(circle at 60% 50%, black 40%, transparent 80%)'
            }}
          />
        </motion.div>
      </div>

      <main className="flex-1 flex flex-col w-full relative z-10 pt-28 pb-10 pointer-events-none">
        
        {/* Hero Content */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full flex-1 flex flex-col justify-center min-h-[calc(100vh-180px)]">
          <motion.div 
            className="max-w-2xl mt-16 lg:mt-0 pointer-events-auto"
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
            <p className="text-gray-400 text-[17px] sm:text-lg leading-relaxed mb-10 max-w-lg font-light tracking-wide pointer-events-none">
              Bypass HR filters and ATS bots. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pointer-events-auto">
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
          className="w-full pt-8 flex flex-col items-center justify-center relative z-10 pointer-events-none"
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
        <div className="pointer-events-auto">
          <ProcessSection />
        </div>

      </main>
    </div>
  );
}
