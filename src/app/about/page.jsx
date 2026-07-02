"use client";
import React from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="bg-[#020408] text-white min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-[#009DFF]/30">
      <main className="flex-1 flex flex-col w-full relative z-10 pt-36 pb-10">
        
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full text-center flex flex-col items-center justify-center min-h-[50vh]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-[2.5rem] sm:text-[3.5rem] font-bold tracking-tight leading-[1.1] mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#009DFF] to-[#b866ff] drop-shadow-[0_0_25px_rgba(0,157,255,0.3)]">
                What you will do learnign about me !!
              </span>
            </h1>
            <p className="text-gray-300 text-[19px] sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium tracking-wide">
              Think me as your job getting buddy only.
            </p>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
