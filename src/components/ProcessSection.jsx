import React from 'react';
import { Shield, Target, Lock, TrendingUp, ArrowRight } from 'lucide-react';

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
    <section className="w-full max-w-[1400px] mx-auto px-6 py-12 flex flex-col items-center">
      
      {/* Cards Row */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-stretch gap-4 relative mb-16">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Card */}
            <div className="flex-1 min-w-[160px] flex flex-col bg-[#0f1115] border border-white/5 rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 relative group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {/* Image Container */}
              <div className="w-full aspect-[4/5] bg-black/40 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors z-10 pointer-events-none"></div>
                <img src={step.img} alt={step.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              </div>
              
              {/* Content */}
              <div className="p-5 flex flex-col flex-1 bg-[#0f1115]">
                <span className="text-[#40b8ff] font-bold text-sm mb-1">{step.num}</span>
                <h3 className="text-white font-bold text-[15px] leading-tight mb-2">{step.title}</h3>
                <p className="text-gray-400 text-[13px] leading-relaxed">{step.desc}</p>
              </div>
            </div>
            
            {/* Arrow separator */}
            {index < steps.length - 1 && (
              <div className="hidden lg:flex flex-col justify-center items-center w-4 z-10 shrink-0 opacity-50">
                <ArrowRight className="w-4 h-4 text-[#40b8ff]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Feature Banner */}
      <div className="w-full max-w-[1100px] mx-auto bg-[#0a0c10] border border-white/10 rounded-2xl p-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* subtle glow background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#40b8ff]/5 via-transparent to-[#40b8ff]/5 pointer-events-none"></div>

        {/* Feature 1 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-start">
          <div className="w-10 h-10 rounded-xl bg-[#141a23] border border-white/5 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#40b8ff]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[14px]">ATS-Proof</h4>
            <p className="text-gray-400 text-[12px]">Beat the bots</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-10 bg-white/10 relative z-10"></div>

        {/* Feature 2 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-start">
          <div className="w-10 h-10 rounded-xl bg-[#141a23] border border-white/5 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#40b8ff]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[14px]">AI-Powered</h4>
            <p className="text-gray-400 text-[12px]">Deep resume analysis</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-10 bg-white/10 relative z-10"></div>

        {/* Feature 3 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-start">
          <div className="w-10 h-10 rounded-xl bg-[#141a23] border border-white/5 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#40b8ff]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[14px]">Privacy First</h4>
            <p className="text-gray-400 text-[12px]">Your data, always safe</p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-10 bg-white/10 relative z-10"></div>

        {/* Feature 4 */}
        <div className="flex items-center gap-4 relative z-10 flex-1 justify-center md:justify-start">
          <div className="w-10 h-10 rounded-xl bg-[#141a23] border border-white/5 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#40b8ff]" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[14px]">Better Matches</h4>
            <p className="text-gray-400 text-[12px]">Get matched smarter</p>
          </div>
        </div>

      </div>
    </section>
  );
}
