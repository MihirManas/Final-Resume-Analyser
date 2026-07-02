"use client";
import React from "react";
import ProcessSection from "@/components/ProcessSection";
import { motion } from "framer-motion";

export default function HowItWorksPage() {
  return (
    <div className="bg-[#020408] text-white min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-[#009DFF]/30">
      <main className="flex-1 flex flex-col w-full relative z-10 pt-36 pb-10">
        
        {/* Header Section */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 className="text-[3rem] sm:text-[4rem] font-bold tracking-tight leading-[1.05] mb-6">
              <span className="text-white drop-shadow-md">See</span> <br className="md:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#009DFF] to-[#b866ff] drop-shadow-[0_0_25px_rgba(0,157,255,0.3)]">
                How It Works
              </span>
            </h1>
            <p className="text-gray-400 text-[17px] sm:text-lg leading-relaxed max-w-2xl mx-auto font-light tracking-wide">
              Discover the magic behind our AI-powered resume intelligence and how we transform your job prospects.
            </p>
          </motion.div>
        </div>

        {/* Process Section */}
        <ProcessSection />
      </main>
    </div>
  );
}
