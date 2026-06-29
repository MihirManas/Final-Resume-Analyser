"use client";
import React from 'react';
import { Shield, Target, Lock, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: "01",
    title: "The Old You",
    desc: "Your resume gets lost in the crowd.",
    img: "/images/card-1.png"
  },
  {
    num: "02",
    title: "We Take Control",
    desc: "Our AI hands step in to analyze deeply.",
    img: "/images/card-2.png"
  },
  {
    num: "03",
    title: "Deep Analysis",
    desc: "AI scans, understands your true potential.",
    img: "/images/card-3.png"
  },
  {
    num: "04",
    title: "Rebuilding You",
    desc: "We optimize, enhance and restructure.",
    img: "/images/card-4.png"
  },
  {
    num: "05",
    title: "The New You",
    desc: "A powerful, ATS-proof resume is ready.",
    img: "/images/card-5.png"
  },
  {
    num: "06",
    title: "Handed Back",
    desc: "A new you. A new story. A new opportunity.",
    img: "/images/card-6.png"
  }
];

export default function ProcessSection() {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 flex flex-col items-center">
      
      {/* 6 Cards Row */}
      <div className="w-full flex flex-col xl:flex-row justify-between items-stretch gap-3 relative mb-16">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-1 min-w-[170px] flex flex-col bg-[#0b0e14] border border-white/5 rounded-2xl overflow-hidden hover:border-[#009DFF]/30 transition-colors group shadow-lg"
            >
              {/* Image Container */}
              <div className="w-full aspect-[1/1.1] bg-[#050608] relative overflow-hidden flex items-center justify-center p-0">
                <div className="absolute inset-0 bg-[#009DFF]/0 group-hover:bg-[#009DFF]/10 transition-colors duration-500 z-10 pointer-events-none"></div>
                <img 
                  src={step.img} 
                  alt={step.title} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                />
              </div>
              
              {/* Content */}
              <div className="p-5 flex flex-col flex-1 bg-[#0b0e14]">
                <span className="text-[#009DFF] font-semibold text-[13px] mb-1.5">{step.num}</span>
                <h3 className="text-white font-bold text-[16px] leading-tight mb-2.5">{step.title}</h3>
                <p className="text-gray-400 text-[13px] leading-[1.6]">{step.desc}</p>
              </div>
            </motion.div>
            
            {/* Arrow separator */}
            {index < steps.length - 1 && (
              <div className="hidden xl:flex flex-col justify-center items-center shrink-0 w-4">
                <ArrowRight className="w-4 h-4 text-[#009DFF] opacity-60" strokeWidth={2.5} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Feature Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="w-full max-w-[1200px] mx-auto bg-[#0b0e14] border border-white/5 rounded-[2rem] p-6 lg:px-10 lg:py-7 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* subtle glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#009DFF]/5 via-transparent to-[#009DFF]/5 pointer-events-none"></div>

        {/* Feature 1 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-start">
          <div className="w-12 h-12 rounded-xl bg-[#131b26] border border-white/5 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#009DFF]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[15px]">ATS-Proof</h4>
            <p className="text-gray-400 text-[13px] mt-0.5">Beat the bots</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-12 bg-white/10 relative z-10"></div>

        {/* Feature 2 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#131b26] border border-white/5 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#009DFF]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[15px]">AI-Powered</h4>
            <p className="text-gray-400 text-[13px] mt-0.5">Deep resume analysis</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-12 bg-white/10 relative z-10"></div>

        {/* Feature 3 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#131b26] border border-white/5 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#009DFF]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[15px]">Privacy First</h4>
            <p className="text-gray-400 text-[13px] mt-0.5">Your data, always safe</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-12 bg-white/10 relative z-10"></div>

        {/* Feature 4 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-end">
          <div className="w-12 h-12 rounded-xl bg-[#131b26] border border-white/5 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#009DFF]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[15px]">Better Matches</h4>
            <p className="text-gray-400 text-[13px] mt-0.5">Get matched smarter</p>
          </div>
        </div>

      </motion.div>
    </section>
  );
}
