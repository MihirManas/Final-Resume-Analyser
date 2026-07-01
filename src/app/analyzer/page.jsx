"use client";
import React, { useState } from 'react';
import { Upload, Check, Search, FileText, Target, BarChart2, Cpu, Code, Database, Layout, Briefcase, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';

const HolographicResume = dynamic(() => import('@/components/HolographicResume'), { ssr: false });
const AnalysisAnimation = dynamic(() => import('@/components/AnalysisAnimation'), { ssr: false });

export default function AnalyzerPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [jdMode, setJdMode] = useState('paste'); // paste | upload
  const [jdText, setJdText] = useState('');
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [otherChallenge, setOtherChallenge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const steps = [
    { num: 1, label: 'Upload Resume' },
    { num: 2, label: 'Target Role' },
    { num: 3, label: 'Job Description (Optional)' },
    { num: 4, label: 'Challenges (Optional)' }
  ];

  const popularRoles = [
    { icon: <BarChart2 size={16} className="text-[#009DFF]" />, name: 'Data Analyst' },
    { icon: <Cpu size={16} className="text-[#ff6600]" />, name: 'Data Scientist' },
    { icon: <Database size={16} className="text-[#8800ff]" />, name: 'Machine Learning Engineer' },
    { icon: <Code size={16} className="text-[#00ff44]" />, name: 'Backend Developer' },
    { icon: <Layout size={16} className="text-[#ff00aa]" />, name: 'Frontend Developer' },
    { icon: <Briefcase size={16} className="text-[#ffdd00]" />, name: 'Product Manager' },
    { icon: <Target size={16} className="text-[#00ffcc]" />, name: 'UX Designer' },
    { icon: <BarChart2 size={16} className="text-[#009DFF]" />, name: 'Business Analyst' },
  ];

  const challengesList = [
    { id: 'c1', icon: <Target size={16} className="text-[#009DFF]" />, label: 'Not getting interview calls' },
    { id: 'c2', icon: <Briefcase size={16} className="text-[#009DFF]" />, label: 'Career transition' },
    { id: 'c3', icon: <FileText size={16} className="text-[#009DFF]" />, label: 'ATS keeps rejecting my resume' },
    { id: 'c4', icon: <Check size={16} className="text-[#009DFF]" />, label: 'Fresher looking for first job' },
    { id: 'c5', icon: <Code size={16} className="text-[#009DFF]" />, label: 'Technical interviews are difficult' },
    { id: 'c6', icon: <Layout size={16} className="text-[#009DFF]" />, label: 'Improve resume writing' },
    { id: 'c7', icon: <Target size={16} className="text-[#009DFF]" />, label: 'HR rounds are difficult' },
    { id: 'c8', icon: <Code size={16} className="text-[#009DFF]" />, label: 'Other (please specify)' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const toggleChallenge = (c) => {
    if (selectedChallenges.includes(c)) {
      setSelectedChallenges(selectedChallenges.filter(x => x !== c));
    } else {
      setSelectedChallenges([...selectedChallenges, c]);
    }
  };

  const handleStartAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisResult({ complete: true, real_result: null, analysis_id: 'dummy' });
    }, 31000); // 31 seconds for 9 stages
  };

  if (analysisResult) {
    return <div className="min-h-screen bg-[#010409]"><Dashboard result={analysisResult} onReset={() => setAnalysisResult(null)} /></div>;
  }

  if (isLoading) {
    return <AnalysisAnimation file={resumeFile} onCancel={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#010409] text-white overflow-hidden flex flex-col font-sans">
      
      {/* EXACT NAVBAR */}
      <nav className="w-full flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#010409]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-[#009DFF] flex items-center justify-center p-1.5">
             <div className="w-full h-full rounded-full border-2 border-[#010409]" />
          </div>
          <span className="font-bold text-lg tracking-wide">My Job <span className="text-[#009DFF]">Secret</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <span className="text-[#009DFF] border-b-2 border-[#009DFF] pb-1 cursor-pointer">Analyzer</span>
          <span className="text-white/60 hover:text-white cursor-pointer transition-colors">How It Works</span>
          <span className="text-white/60 hover:text-white cursor-pointer transition-colors">Pricing</span>
          <span className="text-white/60 hover:text-white cursor-pointer transition-colors">About</span>
        </div>
        
        <button className="px-6 py-2 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
          Get Started <ArrowRight size={16} />
        </button>
      </nav>

      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-6 lg:p-8">
        
        {/* EXACT PROGRESS BAR */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <div className="relative flex justify-between items-center px-4">
            {/* Background Line */}
            <div className="absolute top-4 left-0 w-full h-[1px] bg-white/10 -z-10" />
            
            {/* Active Line */}
            <div 
              className="absolute top-4 left-0 h-[1px] bg-[#009DFF] -z-10 transition-all duration-500 shadow-[0_0_10px_#009DFF]"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;
              return (
                <div key={step.num} className="flex flex-col items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted || isActive 
                      ? 'bg-[#009DFF] text-white shadow-[0_0_15px_rgba(0,157,255,0.5)]' 
                      : 'bg-[#010409] border border-[#009DFF]/30 text-[#009DFF]/50'
                  }`}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-sm font-bold">{step.num}</span>}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTENT SPLIT */}
        <div className="flex-1 flex flex-col lg:flex-row gap-12 relative h-full">
          
          {/* LEFT: FORM CARDS */}
          <div className="w-full lg:w-[50%] flex flex-col justify-center pb-12 relative z-10">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Upload Your <span className="text-[#009DFF]">Resume</span></h1>
                    <p className="text-white/60 text-sm">Upload your resume and let our AI begin the magic ✨</p>
                  </div>
                  
                  <div className="relative w-full h-64 rounded-2xl border-2 border-dashed border-[#009DFF]/30 bg-[#009DFF]/5 flex flex-col items-center justify-center gap-4 group hover:border-[#009DFF]/60 hover:bg-[#009DFF]/10 transition-all cursor-pointer">
                    <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-16 h-16 rounded-xl bg-[#009DFF]/10 flex items-center justify-center">
                      <Upload size={32} className="text-[#009DFF]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">{resumeFile ? resumeFile.name : 'Drop your resume here'}</p>
                      <p className="text-[#009DFF] text-sm">or browse files</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="flex-1 p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-3">
                        <FileText className="text-[#009DFF]" size={20} />
                        <div>
                          <p className="text-sm font-medium">Supported formats: PDF, DOCX</p>
                          <p className="text-xs text-white/40 mt-1">Max file size: 10MB</p>
                        </div>
                     </div>
                     <div className="flex-1 p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-3">
                        <Check className="text-[#009DFF]" size={20} />
                        <div>
                          <p className="text-sm font-medium">We keep your data safe</p>
                          <p className="text-xs text-white/40 mt-1">Your files are encrypted and never shared.</p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">What role <span className="text-[#009DFF]">are you</span><br/>targeting?</h1>
                    <p className="text-white/60 text-sm mt-4 leading-relaxed max-w-sm">Tell us the role you want and our AI will tailor the analysis for that position.</p>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search or enter target role..." 
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full bg-[#010409] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#009DFF] transition-colors"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-white/40 mb-4">Popular roles</p>
                    <div className="grid grid-cols-2 gap-3">
                      {popularRoles.map((role) => (
                        <button 
                          key={role.name}
                          onClick={() => setTargetRole(role.name)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-all text-left ${targetRole === role.name ? 'border-[#009DFF] bg-[#009DFF]/10 text-white' : 'border-white/5 bg-[#010409] text-white/60 hover:border-white/20'}`}
                        >
                          {role.icon} {role.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Job Description <span className="text-white/40 font-normal text-xl">(Optional)</span></h1>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm mt-4">Add the job description to get more accurate analysis and better recommendations.</p>
                  </div>
                  
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
                    <button onClick={() => setJdMode('paste')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${jdMode === 'paste' ? 'bg-[#009DFF]/20 text-[#009DFF]' : 'text-white/40 hover:text-white'}`}>Paste Job Description</button>
                    <button onClick={() => setJdMode('upload')} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${jdMode === 'upload' ? 'bg-[#009DFF]/20 text-[#009DFF]' : 'text-white/40 hover:text-white'}`}><Upload size={14}/> Upload JD</button>
                  </div>

                  {jdMode === 'paste' ? (
                    <div className="relative">
                      <textarea 
                        placeholder="Paste the job description here..."
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        className="w-full h-64 bg-[#010409] border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-[#009DFF] transition-colors resize-none"
                      />
                      <span className="absolute bottom-4 right-4 text-xs text-white/20">0 / 5000</span>
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:border-[#009DFF]/50 transition-colors">
                      <div className="text-center text-white/40 text-sm">
                        <Upload size={24} className="mx-auto mb-2" />
                        Click to upload Job Description PDF
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 mt-2">
                    <div className="w-5 h-5 rounded-full border border-[#009DFF]/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#009DFF]">i</div>
                    <p className="text-sm text-[#009DFF]/80">Optional - Improves keyword matching and role alignment by up to 40%</p>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">What's your biggest<br/><span className="text-[#009DFF]">challenge?</span></h1>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm mt-4">This helps our AI give you personalised advice and better recommendations.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {challengesList.map((c) => {
                      const isSelected = selectedChallenges.includes(c.label);
                      return (
                        <button 
                          key={c.id}
                          onClick={() => toggleChallenge(c.label)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm text-left transition-all ${isSelected ? 'border-[#009DFF] bg-[#009DFF]/10 text-white' : 'border-white/5 bg-[#010409] text-white/60 hover:border-white/20'}`}
                        >
                          <div className="flex items-center gap-3">
                            {c.icon} {c.label}
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-[#009DFF] border-[#009DFF]' : 'border-white/20'}`}>
                            {isSelected && <Check size={10} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedChallenges.includes('Other (please specify)') && (
                    <input 
                      type="text" 
                      placeholder="Please specify your challenge..." 
                      value={otherChallenge}
                      onChange={(e) => setOtherChallenge(e.target.value)}
                      className="w-full bg-[#010409] border border-white/10 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-[#009DFF] transition-colors mt-2"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
              <button 
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${currentStep > 1 ? 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10' : 'text-transparent pointer-events-none'}`}
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              {currentStep < 4 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-8 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338ca] font-bold text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleStartAnalysis}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-90 font-bold text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center gap-2"
                >
                  Start AI Analysis <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: HOLOGRAPHIC RESUME */}
          <div className="w-full lg:w-[50%] h-[600px] lg:h-auto absolute lg:relative inset-0 pointer-events-none z-0">
             <HolographicResume file={resumeFile} currentStep={currentStep} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
