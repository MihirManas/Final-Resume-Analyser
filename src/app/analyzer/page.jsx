"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Upload, ChevronRight, Check, Search, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';

const HolographicResume = dynamic(() => import('@/components/HolographicResume'), { ssr: false });
const AnalysisAnimation = dynamic(() => import('@/components/AnalysisAnimation'), { ssr: false });

export default function AnalyzerPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  
  // Step 2 State
  const [targetRole, setTargetRole] = useState('');
  
  // Step 3 State
  const [jdMode, setJdMode] = useState('paste'); // paste | upload
  const [jdText, setJdText] = useState('');
  
  // Step 4 State
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [otherChallenge, setOtherChallenge] = useState('');
  
  // Global State
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Constants
  const popularRoles = [
    { icon: '📊', name: 'Data Analyst' },
    { icon: '🧬', name: 'Data Scientist' },
    { icon: '🧠', name: 'Machine Learning Engineer' },
    { icon: '⚙️', name: 'Backend Developer' },
    { icon: '💻', name: 'Frontend Developer' },
    { icon: '📦', name: 'Product Manager' },
    { icon: '🎨', name: 'UX Designer' },
    { icon: '📈', name: 'Business Analyst' },
  ];

  const challengesList = [
    "Not getting interview calls",
    "Career transition",
    "ATS keeps rejecting my resume",
    "Fresher looking for first job",
    "Technical interviews are difficult",
    "Improve resume writing",
    "HR rounds are difficult",
  ];

  // Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
    else handleStartAnalysis();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStartAnalysis = () => {
    setIsLoading(true);
    // Simulate backend processing time (animation takes over)
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisResult({ complete: true }); // Fake result for now
    }, 30000); // 30 seconds for the cinematic sequence
  };

  const handleCancelAnalysis = () => {
    setIsLoading(false);
  };

  const toggleChallenge = (c) => {
    if (selectedChallenges.includes(c)) {
      setSelectedChallenges(selectedChallenges.filter(x => x !== c));
    } else {
      setSelectedChallenges([...selectedChallenges, c]);
    }
  };

  // If Analysis is complete, show dashboard
  if (analysisResult) {
    return (
      <div className="min-h-screen bg-[#010409]">
         <Dashboard />
      </div>
    );
  }

  // If Loading, show Cinematic Animation Full Screen
  if (isLoading) {
    return <AnalysisAnimation file={resumeFile} onCancel={handleCancelAnalysis} />;
  }

  return (
    <div className="min-h-screen bg-[#010409] text-white flex flex-col font-sans selection:bg-[#009DFF]/30">
      
      {/* NAVBAR */}
      <header className="w-full h-20 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#009DFF] to-[#8c52ff] flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">My Job Secret</span>
        </div>
        <nav className="flex items-center gap-8 text-sm text-white/60">
          <a href="#" className="text-[#009DFF] font-medium border-b border-[#009DFF] pb-1">Analyzer</a>
          <a href="#" className="hover:text-white transition">How It Works</a>
          <a href="#" className="hover:text-white transition">Pricing</a>
          <a href="#" className="hover:text-white transition">About</a>
        </nav>
        <button className="px-6 py-2 rounded-full bg-[#009DFF] hover:bg-[#007acc] text-white font-medium text-sm transition-all shadow-[0_0_15px_rgba(0,157,255,0.4)]">
          Get Started ➔
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col pt-8 px-6 relative">
        
        {/* HORIZONTAL PROGRESS BAR */}
        <div className="w-full max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-4 left-[5%] right-[5%] h-[1px] bg-white/10 z-0" />
          
          <div className="flex justify-between relative z-10">
            {[1, 2, 3, 4].map((step) => {
              const isActive = currentStep === step;
              const isPast = currentStep > step;
              return (
                <div key={step} className="flex flex-col items-center gap-3 w-32 cursor-pointer" onClick={() => (isPast || resumeFile) && setCurrentStep(step)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#009DFF] text-white shadow-[0_0_15px_rgba(0,157,255,0.5)] border-2 border-[#009DFF]' 
                      : isPast
                        ? 'bg-[#009DFF] text-white border-2 border-[#009DFF]'
                        : 'bg-[#010409] text-white/40 border border-white/20'
                  }`}>
                    {isPast ? <Check size={14} strokeWidth={3} /> : step}
                  </div>
                  <span className={`text-[11px] font-medium transition-all ${isActive ? 'text-[#009DFF]' : 'text-white/40'}`}>
                    {step === 1 && 'Upload Resume'}
                    {step === 2 && 'Target Role'}
                    {step === 3 && 'Job Description (Optional)'}
                    {step === 4 && 'Challenges (Optional)'}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Active progress line connecting completed steps */}
          <div 
            className="absolute top-4 left-[5%] h-[2px] bg-[#009DFF] z-0 transition-all duration-500 shadow-[0_0_10px_rgba(0,157,255,0.5)]"
            style={{ width: `${((currentStep - 1) / 3) * 90}%` }}
          />
        </div>

        {/* TWO COLUMN CONTENT */}
        <div className="flex-1 flex w-full relative z-10 h-[500px]">
          
          {/* LEFT COLUMN: Input Form Card */}
          <div className="w-[55%] h-full pr-12 flex flex-col">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: UPLOAD */}
              {currentStep === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <h1 className="text-3xl font-bold mb-2">Upload Your <span className="text-[#009DFF]">Resume</span></h1>
                  <p className="text-white/50 text-sm mb-8">Upload your resume and let our AI begin the magic ✨</p>
                  
                  <div className="w-full h-64 border border-dashed border-white/20 hover:border-[#009DFF]/50 rounded-2xl bg-[#030812]/50 flex flex-col items-center justify-center transition-all cursor-pointer relative group">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                    <div className="w-16 h-16 rounded-2xl bg-[#009DFF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-[#009DFF]" />
                    </div>
                    <p className="font-semibold text-lg">{resumeFile ? resumeFile.name : 'Drop your resume here'}</p>
                    <p className="text-white/40 text-sm mt-1">or <span className="text-[#009DFF]">browse files</span></p>
                  </div>
                  
                  <div className="flex gap-8 mt-6">
                    <div className="flex gap-3 items-center text-xs text-white/40">
                      <div className="p-1.5 rounded-full bg-white/5"><Upload size={14} /></div>
                      <div>Supported formats: PDF, DOCX<br/>Max file size: 10MB</div>
                    </div>
                    <div className="flex gap-3 items-center text-xs text-white/40">
                      <div className="p-1.5 rounded-full bg-white/5"><Check size={14} /></div>
                      <div>We keep your data safe<br/>Your files are encrypted and never shared.</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: ROLE */}
              {currentStep === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <h1 className="text-3xl font-bold mb-2">What role are you <span className="text-[#009DFF]">targeting?</span></h1>
                  <p className="text-white/50 text-sm mb-8">Tell us the role you want and our AI will tailor the analysis for that position.</p>
                  
                  <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Search or enter target role..." 
                      className="w-full bg-[#030812] border border-white/10 focus:border-[#009DFF]/50 rounded-xl py-4 pl-12 pr-4 text-sm text-white outline-none transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  
                  <p className="text-xs text-white/40 mb-4 font-medium uppercase tracking-wider">Popular roles</p>
                  <div className="grid grid-cols-2 gap-3">
                    {popularRoles.map((role, i) => (
                      <button 
                        key={i} 
                        onClick={() => setTargetRole(role.name)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-all ${targetRole === role.name ? 'border-[#009DFF] bg-[#009DFF]/10 shadow-[0_0_15px_rgba(0,157,255,0.15)] text-white' : 'border-white/5 bg-[#030812] text-white/60 hover:border-white/20'}`}
                      >
                        <span className="text-base">{role.icon}</span> {role.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: JOB DESCRIPTION */}
              {currentStep === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full flex flex-col h-full"
                >
                  <h1 className="text-3xl font-bold mb-2">Job Description <span className="text-white/40 text-2xl font-normal">(Optional)</span></h1>
                  <p className="text-white/50 text-sm mb-6">Add the job description to get more accurate analysis and better recommendations.</p>
                  
                  <div className="flex gap-2 mb-4 bg-[#030812] p-1 rounded-xl w-max border border-white/5">
                    <button onClick={() => setJdMode('paste')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${jdMode === 'paste' ? 'bg-[#009DFF]/20 text-[#009DFF] border border-[#009DFF]/30 shadow-[0_0_10px_rgba(0,157,255,0.2)]' : 'text-white/40 hover:text-white'}`}>
                      Paste Job Description
                    </button>
                    <button onClick={() => setJdMode('upload')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${jdMode === 'upload' ? 'bg-[#009DFF]/20 text-[#009DFF] border border-[#009DFF]/30 shadow-[0_0_10px_rgba(0,157,255,0.2)]' : 'text-white/40 hover:text-white'}`}>
                      <Upload size={14} /> Upload JD
                    </button>
                  </div>
                  
                  {jdMode === 'paste' ? (
                    <div className="relative flex-1 min-h-[200px]">
                      <textarea 
                        placeholder="Paste the job description here..."
                        className="w-full h-full bg-[#030812] border border-white/10 focus:border-[#009DFF]/50 rounded-xl p-4 text-sm text-white/80 outline-none resize-none transition-all"
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-white/20">{jdText.length} / 5000</div>
                    </div>
                  ) : (
                    <div className="flex-1 border border-dashed border-white/20 rounded-xl bg-[#030812]/50 flex flex-col items-center justify-center hover:border-[#009DFF]/50 transition-all cursor-pointer">
                       <Upload className="w-8 h-8 text-white/30 mb-2" />
                       <span className="text-sm text-white/50">Click to upload JD file</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 mt-4 text-xs text-[#009DFF]/70 bg-[#009DFF]/5 p-3 rounded-lg border border-[#009DFF]/10">
                    <div className="p-0.5 border border-[#009DFF]/40 rounded-full mt-0.5">i</div>
                    <p>Optional - Improves keyword matching and role alignment by up to 40%</p>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: CHALLENGES */}
              {currentStep === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">What's your biggest <br/> <span className="text-[#009DFF]">challenge?</span></h1>
                  <p className="text-white/50 text-sm mb-8">This helps our AI give you personalised advice and better recommendations.</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {challengesList.map((c, i) => {
                      const isSelected = selectedChallenges.includes(c);
                      return (
                        <button 
                          key={i} 
                          onClick={() => toggleChallenge(c)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm text-left transition-all ${isSelected ? 'border-[#009DFF] bg-[#009DFF]/10 text-white shadow-[0_0_15px_rgba(0,157,255,0.1)]' : 'border-white/5 bg-[#030812] text-white/60 hover:border-white/20'}`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Dummy icon for layout */}
                            <div className="w-4 h-4 text-[#009DFF] opacity-70">
                               {i%2===0 ? <FileText size={16}/> : <Target size={16}/>}
                            </div>
                            <span className="truncate pr-2">{c}</span>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-[#009DFF] border-[#009DFF]' : 'border-white/20'}`}>
                             {isSelected && <Check size={10} className="text-white" strokeWidth={4} />}
                          </div>
                        </button>
                      );
                    })}
                    
                    {/* Other Box */}
                    <button 
                      onClick={() => toggleChallenge('Other')}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ${selectedChallenges.includes('Other') ? 'border-[#009DFF] bg-[#009DFF]/10 text-white shadow-[0_0_15px_rgba(0,157,255,0.1)]' : 'border-white/5 bg-[#030812] text-white/60 hover:border-white/20'}`}
                    >
                      <span>Other (please specify)</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedChallenges.includes('Other') ? 'bg-[#009DFF] border-[#009DFF]' : 'border-white/20'}`}>
                         {selectedChallenges.includes('Other') && <Check size={10} className="text-white" strokeWidth={4} />}
                      </div>
                    </button>
                  </div>
                  
                  {selectedChallenges.includes('Other') && (
                    <input 
                      type="text" 
                      placeholder="Please specify your challenge..." 
                      className="w-full bg-[#030812] border border-[#009DFF]/30 focus:border-[#009DFF] rounded-xl py-3 px-4 text-sm text-white outline-none transition-all mt-2"
                      value={otherChallenge}
                      onChange={(e) => setOtherChallenge(e.target.value)}
                    />
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* BUTTONS ROW */}
            <div className="mt-auto pt-8 flex items-center justify-between w-full border-t border-white/5">
              <button 
                onClick={handleBack} 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${currentStep > 1 ? 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10' : 'text-transparent pointer-events-none'}`}
              >
                &lt; Back
              </button>
              
              <button 
                onClick={handleNext} 
                disabled={currentStep === 1 && !resumeFile}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  (currentStep === 1 && !resumeFile)
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0055ff] to-[#8c52ff] text-white shadow-[0_0_20px_rgba(0,85,255,0.4)] hover:shadow-[0_0_30px_rgba(0,85,255,0.6)] hover:scale-[1.02]'
                }`}
              >
                {currentStep === 4 ? 'Start AI Analysis' : 'Next'} 
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          {/* RIGHT COLUMN: Holographic Canvas */}
          <div className="w-[45%] h-full relative border-l border-white/5 pl-4 flex items-center justify-center">
             <div className="absolute inset-0 w-full h-[600px] mt-[-50px]">
                <HolographicResume file={resumeFile} currentStep={currentStep} />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
