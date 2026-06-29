"use client";
import React from "react";
import Link from "next/link";
import { Sparkles, Zap, Play } from "lucide-react";
import HeroAnimation from "@/components/HeroAnimation";

export default function LandingPage() {
  return (
    <div className="bg-[#050508] text-white min-h-screen relative overflow-hidden flex flex-col pt-24">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#40b8ff]/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#8c52ff]/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <main className="flex-1 flex flex-col justify-center max-w-[1400px] mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#40b8ff]/30 bg-[#40b8ff]/5 mb-8">
              <Sparkles className="w-4 h-4 text-[#40b8ff]" />
              <span className="text-sm font-medium text-[#40b8ff]">AI-Powered Resume Intelligence</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[1.1] mb-6">
              Unlock the <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#40b8ff] via-[#668cff] to-[#b366ff] drop-shadow-[0_0_20px_rgba(64,184,255,0.3)]">
                Job Secret
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              Bypass HR filters and ATS bots. Build cryptographically verifiable project portfolios and prove your engineering competence directly to tech recruiters.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link
                href="/analyzer"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#40b8ff] to-[#8c52ff] text-white rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(64,184,255,0.4)]"
              >
                <Zap className="w-5 h-5 fill-current" />
                Analyze My Resume
              </Link>
              
              <Link
                href="/demo"
                className="group flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-4 text-white hover:text-[#40b8ff] transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-600 group-hover:border-[#40b8ff] transition-colors">
                  <Play className="w-4 h-4 ml-1 fill-current" />
                </div>
                <span className="font-semibold">See How It Works</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Image Animation */}
          <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative">
            <HeroAnimation />
          </div>
          
        </div>
      </main>

      {/* Bottom Element */}
      <div className="w-full pb-8 pt-12 flex flex-col items-center justify-center relative z-10 mt-auto">
        <div className="flex items-center justify-center w-full max-w-4xl opacity-70">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
          <div className="px-6 flex items-center gap-2">
            <span className="text-xl font-bold tracking-wide">See the Magic Happen</span>
            <Sparkles className="w-5 h-5 text-[#40b8ff]" />
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
        </div>
      </div>
      
    </div>
  );
}
