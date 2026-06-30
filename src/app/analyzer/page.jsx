"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, FileText, ChevronRight, X, AlertTriangle, RefreshCw, Loader2, ArrowLeft, Target, FileSearch, Sparkles, Check, ChevronLeft, ShieldCheck, UserCircle, Briefcase, Target as TargetIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

import { styles } from '@/utils/styles';
import TicTacToeGame from '@/components/TicTacToeGame';
import Dashboard from '@/components/Dashboard';

export default function App() {
  const [bootComplete, setBootComplete] = useState(true);

  // Multistep State
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [jdMode, setJdMode] = useState('type'); // 'type' | 'upload'
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [selectedChallenges, setSelectedChallenges] = useState([]);
  const [otherChallenge, setOtherChallenge] = useState('');

  // UI/Animation State
  const [isHologramReconstructing, setIsHologramReconstructing] = useState(false);
  const [isHoveringUpload, setIsHoveringUpload] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const platformRef = useRef(null);
  const beamRef = useRef(null);

  // Original Analysis State
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loadingStage, setLoadingStage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingTipIndex, setLoadingTipIndex] = useState(0);

  const loadingTips = [
    "☕ Why not grab a coffee while our AI does the heavy lifting?",
    "📊 We're cross-referencing your skills against 10,000+ job listings...",
    "🔍 Our AI is reading your resume more carefully than most recruiters do!",
    "🎯 Comparing your profile against industry benchmarks...",
    "💡 Tip: Resumes with quantified achievements score 40% higher!",
    "🚀 Almost there... generating your personalized roadmap!",
    "📝 Fun fact: The average recruiter spends 7.4 seconds on a resume. We spend way more.",
    "🏆 Building your career intelligence report...",
  ];

  const roleSuggestions = [
    "Data Analyst", "Machine Learning Engineer", "Data Scientist", 
    "Backend Developer", "Frontend Developer", "Product Manager"
  ];

  const challengesOptions = [
    "Not getting interview calls", "ATS rejections", "Technical interviews",
    "HR interviews", "Career switch", "Fresher", "Resume improvement"
  ];

  useEffect(() => {
    let timerInterval, tipInterval;
    if (isLoading) {
      setElapsedTime(0);
      setLoadingTipIndex(0);
      timerInterval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
      tipInterval = setInterval(() => setLoadingTipIndex(prev => (prev + 1) % loadingTips.length), 4000);
    }
    return () => { clearInterval(timerInterval); clearInterval(tipInterval); };
  }, [isLoading]);

  const handleReset = () => {
    setIsLoading(false);
    setAnalysisResult(null);
    setResumeFile(null);
    setTargetRole('');
    setJdText('');
    setJdFile(null);
    setSelectedChallenges([]);
    setOtherChallenge('');
    setCurrentStep(1);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!resumeFile) {
      setErrorMessage("Please upload a resume before analyzing.");
      return;
    }
    if (!targetRole.trim()) {
      setErrorMessage("Please enter a target job role.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setErrorMessage(null);
    setLoadingStage('Uploading resume...');

    // Combine challenges for backend
    let finalProblems = [...selectedChallenges];
    if (finalProblems.includes("Other") && otherChallenge.trim()) {
      finalProblems = finalProblems.filter(c => c !== "Other");
      finalProblems.push(`Other: ${otherChallenge.trim()}`);
    }
    const userProblemsStr = finalProblems.join(", ");

    const formData = new FormData();
    formData.append("resume_file", resumeFile);
    formData.append("target_role", targetRole);
    if (jdMode === "upload" && jdFile) {
      formData.append("jd_file", jdFile);
    } else if (jdMode === "type" && jdText.trim()) {
      formData.append("jd_text", jdText.trim());
    }
    if (userProblemsStr) {
      formData.append("user_problems", userProblemsStr);
    }
    formData.append("user_name", "Demo User");
    formData.append("user_email", "demo@example.com");

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      setLoadingStage('Extracting document content...');
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || "Analysis failed. Please try again.");
      }

      setLoadingStage('AI is scoring your resume...');
      const { analysis_id } = await uploadRes.json();

      setLoadingStage('Generating your report...');
      const reportRes = await fetch(`${API_BASE_URL}/api/report/${analysis_id}`);
      const reportData = await reportRes.json();
      
      setAnalysisResult({ ...reportData, analysis_id });
      setLoadingStage('');
    } catch (error) {
      console.error(error);
      const msg = error.message || 'Something went wrong.';
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        setErrorMessage('Sorry! Our AI is feeling thirsty and needs some water. Coming back......😉');
      } else if (msg.includes('high demand') || msg.includes('unavailable') || msg.includes('busy') || msg.includes('503') || msg.includes('overload')) {
        setErrorMessage('The AI service is currently experiencing high demand. Please wait a moment and try again.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hologram Reconstruction Animation Sequence
  const triggerHologramAnimation = (file) => {
    setIsHologramReconstructing(true);
    
    // GSAP Timeline for the cinematic effect
    const tl = gsap.timeline({
      onComplete: () => {
        setResumeFile(file);
        setIsHologramReconstructing(false);
        setTimeout(() => setCurrentStep(2), 600); // Move to next step shortly after
      }
    });

    // 1. Pull down the document
    tl.to(".drop-icon", { y: 50, scale: 0, opacity: 0, duration: 0.5, ease: "back.in(1.7)" })
      // 2. Pulse the platform
      .to(".platform-ring", { scale: 1.5, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, "-=0.2")
      // 3. Shoot energy beam up
      .fromTo(beamRef.current, 
        { scaleY: 0, opacity: 0 }, 
        { scaleY: 1, opacity: 0.8, duration: 0.4, transformOrigin: "bottom center", ease: "power4.out" }
      )
      // 4. Fade beam out while hologram appears
      .to(beamRef.current, { opacity: 0, duration: 0.3, ease: "power2.in" })
      .fromTo(".hologram-resume-preview", 
        { y: -100, scale: 0.8, opacity: 0, rotateY: 90 }, 
        { y: 0, scale: 1, opacity: 1, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" }, 
        "-=0.3"
      );
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        triggerHologramAnimation(file);
      }
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      triggerHologramAnimation(e.target.files[0]);
    }
  };

  const toggleChallenge = (challenge) => {
    setSelectedChallenges(prev => 
      prev.includes(challenge) 
        ? prev.filter(c => c !== challenge) 
        : [...prev, challenge]
    );
  };

  return (
    <div className="bg-[#020408] text-white min-h-screen relative overflow-x-clip flex flex-col font-sans selection:bg-[#009DFF]/30 selection:text-[#009DFF]">
      
      {/* Background - Particles Removed, keeping only smooth gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#009DFF]/10 via-[#020408] to-[#020408]" />
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Top Navigation Steps Bar (Only visible on Steps 2-4) */}
      {bootComplete && !isLoading && !analysisResult && currentStep > 1 && (
        <div className="w-full max-w-4xl mx-auto pt-8 px-6 relative z-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 z-0" />
            
            {[1, 2, 3, 4].map(stepNum => (
              <div key={stepNum} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => currentStep > stepNum && setCurrentStep(stepNum)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${currentStep >= stepNum ? 'bg-[#009DFF] text-white shadow-[0_0_15px_rgba(0,157,255,0.5)]' : 'bg-[#0a0f1a] text-white/40 border border-white/10'}`}>
                  {stepNum}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-semibold transition-colors duration-500 ${currentStep >= stepNum ? 'text-[#009DFF]' : 'text-white/40'}`}>
                  {stepNum === 1 ? 'Upload Resume' : stepNum === 2 ? 'Target Role' : stepNum === 3 ? 'Job Description' : 'Challenges'}
                </span>
              </div>
            ))}
            
            {/* Active Progress Line */}
            <div className="absolute top-1/2 left-0 h-[2px] bg-[#009DFF] -translate-y-1/2 z-0 transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(0,157,255,0.5)]" 
                 style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
          </div>
        </div>
      )}

      {bootComplete && isLoading && (
        <div className="relative z-10 w-full max-w-lg px-6 mx-auto py-16 flex flex-col items-center justify-center animate-in fade-in duration-700 my-auto flex-1">
          {/* Pulsing glow ring */}
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full border-2 border-[#009DFF]/30 flex items-center justify-center relative backdrop-blur-sm">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#009DFF] animate-spin" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-2 rounded-full border border-transparent border-b-[#009DFF]/40 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              <span className="text-4xl">{loadingTipIndex % 2 === 0 ? '🧠' : '☕'}</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-[#009DFF]/10 blur-xl animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-center mb-2">{loadingStage || 'Analyzing your resume...'}</h2>
          <p className="text-sm text-white/40 mb-6">This usually takes 15–30 seconds</p>

          <div className="w-full max-w-sm h-1.5 bg-white/10 backdrop-blur-md rounded-full overflow-hidden mb-6 border border-white/20">
            <div className="h-full bg-[#009DFF] rounded-full animate-pulse shadow-[0_0_10px_#009DFF]" style={{ width: elapsedTime < 10 ? `${elapsedTime * 8}%` : elapsedTime < 90 ? `${80 + (elapsedTime - 10) * 0.2}%` : '95%', transition: 'width 1s ease' }} />
          </div>

          <TicTacToeGame />

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 text-center max-w-sm" key={loadingTipIndex}>
            <p className="text-sm text-white/60 animate-in fade-in duration-500">{loadingTips[loadingTipIndex]}</p>
          </div>

          <p className="mt-4 text-xs text-white/30 font-mono">
            {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')} elapsed
          </p>
          
          <button onClick={handleReset} className="mt-8 px-4 py-2 flex items-center gap-2 text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft size={16} /> Cancel Analysis
          </button>
        </div>
      )}

      {bootComplete && !isLoading && !analysisResult && (
        <main className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-8 flex-1 flex flex-col justify-center min-h-[80vh]">
          
          {/* STEP 1: UPLOAD (Specific Layout matching reference) */}
          {currentStep === 1 && !resumeFile && !isHologramReconstructing && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.5 }}
              className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
            >
              {/* Left Column */}
              <div className="flex flex-col items-start justify-center">
                <div className="px-4 py-1.5 rounded-full border border-[#009DFF]/30 bg-[#009DFF]/10 text-[#009DFF] text-xs font-semibold mb-6">
                  Step 1 of 4
                </div>
                <h1 className="text-5xl font-bold mb-2 tracking-tight">
                  Upload Your <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009DFF] to-[#8c52ff]">Resume</span>
                </h1>
                <p className="text-white/50 text-base mb-10 mt-4 max-w-xs">
                  Upload your resume and let our AI begin the magic ✨
                </p>

                <div className="p-4 rounded-2xl bg-[#0a0f1a]/40 border border-white/5 flex items-start gap-3 max-w-xs">
                  <ShieldCheck className="w-6 h-6 text-[#009DFF] shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-white/90">We keep your data safe</h4>
                    <p className="text-xs text-white/40 mt-1">Your files are encrypted and never shared.</p>
                  </div>
                </div>
                
                <div className="mt-20 flex items-start gap-2 text-white/40">
                  <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] shrink-0 mt-0.5">?</div>
                  <div className="text-xs">
                    Supported formats: PDF, DOCX<br/>
                    Max file size: 10MB
                  </div>
                </div>
              </div>

              {/* Center Column: Platform & Dropzone */}
              <div className="relative h-[500px] flex flex-col items-center justify-center">
                <label 
                  className={`w-[400px] h-[300px] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative overflow-hidden backdrop-blur-xl bg-[#020408]/40 group z-20 ${isDraggingOver ? 'border-[#009DFF] bg-[#009DFF]/10 shadow-[0_0_50px_rgba(0,157,255,0.2)] scale-105' : 'border-[#009DFF]/30 hover:border-[#009DFF]/60 hover:bg-[#009DFF]/5'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onMouseEnter={() => setIsHoveringUpload(true)}
                  onMouseLeave={() => setIsHoveringUpload(false)}
                >
                  <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileInput} />
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  
                  <motion.div 
                    className="drop-icon w-20 h-24 rounded-xl border border-[#009DFF]/50 flex flex-col items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,157,255,0.2)] relative z-10 overflow-hidden group-hover:shadow-[0_0_50px_rgba(0,157,255,0.4)] transition-all duration-500"
                    animate={{ y: isDraggingOver ? -10 : 0 }}
                  >
                    <div className="absolute inset-0 bg-[#009DFF]/10 group-hover:bg-[#009DFF]/20 transition-colors duration-500" />
                    <FileText className={`w-10 h-10 transition-colors duration-300 ${isDraggingOver ? 'text-[#009DFF]' : 'text-[#009DFF]/80 group-hover:text-[#009DFF]'}`} />
                  </motion.div>
                  
                  <h3 className="text-lg font-medium mb-1 relative z-10 text-white/90">Drop your resume here</h3>
                  <p className="text-sm text-white/40 relative z-10">or <span className="text-[#009DFF] font-medium group-hover:underline">browse files</span></p>
                </label>

                {/* Glowing Platform directly under dropzone */}
                <div className="absolute bottom-10 flex items-center justify-center w-full z-10" ref={platformRef}>
                  {/* Energy Beam */}
                  <div ref={beamRef} className="absolute bottom-0 w-32 h-[400px] bg-gradient-to-t from-[#009DFF]/80 via-[#009DFF]/20 to-transparent blur-md opacity-0 origin-bottom z-10" />
                  
                  {/* Rings */}
                  <div className={`absolute w-[450px] h-[120px] rounded-[100%] border border-[#009DFF]/20 platform-ring ${isHoveringUpload ? 'opacity-100' : 'opacity-40'} transition-opacity duration-500`} style={{ transform: 'rotateX(75deg)' }} />
                  <div className={`absolute w-[350px] h-[90px] rounded-[100%] border border-[#009DFF]/40 platform-ring ${isHoveringUpload ? 'border-[#009DFF]/80 shadow-[0_0_20px_#009DFF] animate-spin-slow' : ''} transition-all duration-500`} style={{ transform: 'rotateX(75deg)' }} />
                  <div className="absolute w-[250px] h-[60px] rounded-[100%] bg-[#009DFF]/10 shadow-[0_0_60px_#009DFF] blur-md platform-ring" style={{ transform: 'rotateX(75deg)' }} />
                  <div className={`absolute w-[120px] h-[30px] rounded-[100%] bg-[#009DFF] blur-xl platform-ring ${isDraggingOver ? 'scale-150 opacity-100' : 'opacity-60'} transition-all duration-300`} style={{ transform: 'rotateX(75deg)' }} />
                </div>
              </div>

              {/* Right Column: How it works timeline */}
              <div className="flex flex-col items-end justify-center">
                <div className="w-full max-w-[320px] bg-[#0a0f1a]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8">
                  <h3 className="text-lg font-semibold text-white/90 mb-8">How it works</h3>
                  
                  <div className="relative border-l border-white/10 ml-5 space-y-10">
                    
                    {/* Timeline Item 1 */}
                    <div className="relative pl-8">
                      <div className="absolute -left-5 top-0 w-10 h-10 rounded-xl bg-[#009DFF]/10 border border-[#009DFF]/40 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-[#009DFF]" />
                      </div>
                      <h4 className="text-sm font-semibold text-white/90">Upload Resume</h4>
                      <p className="text-xs text-white/40 mt-1">Upload your resume in PDF or DOCX format.</p>
                    </div>

                    {/* Timeline Item 2 */}
                    <div className="relative pl-8 opacity-40">
                      <div className="absolute -left-5 top-0 w-10 h-10 rounded-full border border-white/20 bg-[#020408] flex items-center justify-center">
                        <UserCircle className="w-4 h-4 text-white/60" />
                      </div>
                      <h4 className="text-sm font-medium text-white/80">Target Role</h4>
                      <p className="text-xs text-white/40 mt-1">Tell us the role you are targeting.</p>
                    </div>

                    {/* Timeline Item 3 */}
                    <div className="relative pl-8 opacity-40">
                      <div className="absolute -left-5 top-0 w-10 h-10 rounded-full border border-white/20 bg-[#020408] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white/60" />
                      </div>
                      <h4 className="text-sm font-medium text-white/80">Job Description</h4>
                      <p className="text-xs text-white/40 mt-1">Add the job description (optional).</p>
                    </div>

                    {/* Timeline Item 4 */}
                    <div className="relative pl-8 opacity-40">
                      <div className="absolute -left-5 top-0 w-10 h-10 rounded-full border border-white/20 bg-[#020408] flex items-center justify-center">
                        <TargetIcon className="w-4 h-4 text-white/60" />
                      </div>
                      <h4 className="text-sm font-medium text-white/80">Challenges</h4>
                      <p className="text-xs text-white/40 mt-1">Share your current challenges (optional).</p>
                    </div>

                  </div>
                </div>
              </div>
              
              {/* Bottom Badge */}
              <div className="col-span-1 lg:col-span-3 flex justify-center mt-auto pb-4">
                <div className="flex items-center gap-2 text-xs text-[#009DFF] font-medium opacity-70">
                  <ShieldCheck className="w-4 h-4" /> Trusted by job seekers worldwide
                </div>
              </div>
            </motion.div>
          )}

          {/* STEPS 2-4: HOLOGRAPHIC LAYOUT */}
          {(currentStep > 1 || isHologramReconstructing) && (
            <div className="relative w-full h-[600px] flex items-center justify-center">
              
              {/* =========================================
                  RIGHT SIDE / CENTER: HOLOGRAPHIC RESUME
                  ========================================= */}
              <motion.div 
                className="absolute z-0 flex flex-col items-center justify-center pointer-events-none"
                initial={false}
                animate={{
                  x: currentStep === 1 ? 0 : '15vw', // Move right on steps 2-4
                  scale: currentStep === 1 ? 1.2 : 1,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              >
                {/* Holographic Document (Only visible if uploaded or reconstructing) */}
                {(resumeFile || isHologramReconstructing) && (
                  <motion.div 
                    className="hologram-resume-preview relative mb-12 z-20"
                    animate={{ 
                      rotateY: [0, 360], 
                      y: [0, -15, 0] 
                    }}
                    transition={{ 
                      rotateY: { repeat: Infinity, duration: 20, ease: "linear" },
                      y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                    }}
                  >
                    <div className="w-[280px] h-[380px] bg-[#020408]/40 backdrop-blur-md border border-[#009DFF]/40 rounded-xl p-6 shadow-[0_0_30px_rgba(0,157,255,0.2)] overflow-hidden relative">
                      {/* Scan line effect inside document */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#009DFF]/60 shadow-[0_0_15px_#009DFF] animate-scan" />
                      
                      {/* Mock Document Content with glow */}
                      <div className="space-y-4 opacity-70">
                        <div className="w-1/2 h-4 bg-[#009DFF]/40 rounded blur-[1px]" />
                        <div className="w-full h-2 bg-white/20 rounded blur-[0.5px]" />
                        <div className="w-5/6 h-2 bg-white/20 rounded blur-[0.5px]" />
                        <div className="w-full h-2 bg-white/20 rounded blur-[0.5px]" />
                        <div className="py-2" />
                        <div className="w-1/3 h-3 bg-[#009DFF]/30 rounded blur-[1px]" />
                        <div className="w-full h-2 bg-white/10 rounded" />
                        <div className="w-4/5 h-2 bg-white/10 rounded" />
                        <div className="w-full h-2 bg-white/10 rounded" />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-b from-[#009DFF]/10 to-transparent pointer-events-none" />
                      
                      {resumeFile && (
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="bg-[#020408]/80 text-[#009DFF] px-3 py-1 rounded-full text-xs font-semibold border border-[#009DFF]/30 backdrop-blur-xl">
                            {resumeFile.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Glowing Platform (Always visible during transition) */}
                <div className="relative flex items-center justify-center mt-32" ref={platformRef}>
                  {/* Energy Beam (Hidden by default, triggered by GSAP) */}
                  <div ref={beamRef} className="absolute bottom-0 w-32 h-[400px] bg-gradient-to-t from-[#009DFF]/80 via-[#009DFF]/20 to-transparent blur-md opacity-0 origin-bottom z-10" />
                  
                  {/* Rings */}
                  <div className={`absolute w-[400px] h-[100px] rounded-[100%] border border-[#009DFF]/20 platform-ring ${isHoveringUpload ? 'opacity-100' : 'opacity-40'} transition-opacity duration-500`} style={{ transform: 'rotateX(75deg)' }} />
                  <div className={`absolute w-[300px] h-[75px] rounded-[100%] border border-[#009DFF]/40 platform-ring ${isHoveringUpload ? 'border-[#009DFF]/80 shadow-[0_0_20px_#009DFF] animate-spin-slow' : ''} transition-all duration-500`} style={{ transform: 'rotateX(75deg)' }} />
                  <div className="absolute w-[200px] h-[50px] rounded-[100%] bg-[#009DFF]/10 shadow-[0_0_50px_#009DFF] blur-md platform-ring" style={{ transform: 'rotateX(75deg)' }} />
                  <div className={`absolute w-[100px] h-[25px] rounded-[100%] bg-[#009DFF] blur-xl platform-ring ${isDraggingOver ? 'scale-150 opacity-100' : 'opacity-60'} transition-all duration-300`} style={{ transform: 'rotateX(75deg)' }} />
                </div>
              </motion.div>

              {/* =========================================
                  LEFT SIDE: INTERACTIVE WIZARD
                  ========================================= */}
              <AnimatePresence mode="wait">

                {/* STEP 2: TARGET ROLE */}
                {currentStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: '-20vw', filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute z-30 w-full max-w-md"
                  >
                    <div className="bg-[#0a0f1a]/60 backdrop-blur-2xl border border-[#009DFF]/20 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                      <h2 className="text-3xl font-bold mb-2">What role are you <span className="text-[#009DFF]">targeting?</span></h2>
                      <p className="text-white/50 text-sm mb-8">Tell us the role you want and our AI will tailor the analysis for that position.</p>

                      <div className="relative group mb-8">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#009DFF]/50 group-focus-within:text-[#009DFF] transition-colors" />
                        <input 
                          type="text" 
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="Search or enter target role..."
                          className="w-full bg-[#020408]/80 border border-[#009DFF]/20 focus:border-[#009DFF] focus:ring-1 focus:ring-[#009DFF] rounded-xl py-4 pl-12 pr-4 text-white outline-none transition-all shadow-inner"
                        />
                      </div>

                      <div className="mb-6">
                        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Popular Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {roleSuggestions.map(role => (
                            <button
                              key={role}
                              onClick={() => setTargetRole(role)}
                              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#009DFF]/20 border border-white/5 hover:border-[#009DFF]/40 text-sm text-white/80 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-10">
                        <button onClick={() => setCurrentStep(1)} className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button 
                          onClick={() => setCurrentStep(3)}
                          disabled={!targetRole.trim()}
                          className="bg-[#009DFF] hover:bg-[#009DFF]/90 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,157,255,0.3)]"
                        >
                          Continue <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: JOB DESCRIPTION */}
                {currentStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: '-20vw', filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute z-30 w-full max-w-md"
                  >
                    <div className="bg-[#0a0f1a]/60 backdrop-blur-2xl border border-[#009DFF]/20 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                      <h2 className="text-3xl font-bold mb-2">Help AI understand your <span className="text-[#009DFF]">dream job</span></h2>
                      <p className="text-white/50 text-sm mb-6">Add the job description to get more accurate analysis and better recommendations.</p>

                      <div className="flex bg-[#020408] rounded-xl p-1 mb-6 border border-white/5">
                        <button 
                          onClick={() => setJdMode('type')} 
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${jdMode === 'type' ? 'bg-[#009DFF]/20 text-[#009DFF] shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                        >
                          Paste Job Description
                        </button>
                        <button 
                          onClick={() => setJdMode('upload')} 
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${jdMode === 'upload' ? 'bg-[#009DFF]/20 text-[#009DFF] shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                        >
                          Upload JD
                        </button>
                      </div>

                      <div className="relative mb-6">
                        {jdMode === 'type' ? (
                          <textarea 
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the job description here..."
                            className="w-full h-40 bg-[#020408]/80 border border-[#009DFF]/20 focus:border-[#009DFF] focus:ring-1 focus:ring-[#009DFF] rounded-xl p-4 text-white outline-none transition-all resize-none shadow-inner text-sm"
                          />
                        ) : (
                          <label className="w-full h-40 border border-dashed border-[#009DFF]/30 hover:border-[#009DFF]/60 bg-[#020408]/50 hover:bg-[#009DFF]/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group">
                            <input type="file" accept=".pdf,.docx,.jpg,.png" className="hidden" onChange={(e) => setJdFile(e.target.files[0])} />
                            {!jdFile ? (
                              <>
                                <FileSearch className="w-8 h-8 text-[#009DFF]/50 group-hover:text-[#009DFF] mb-2 transition-colors" />
                                <span className="text-sm text-white/60">Upload PDF, DOCX, or Image</span>
                              </>
                            ) : (
                              <div className="flex flex-col items-center text-center px-4">
                                <Check className="w-8 h-8 text-green-400 mb-2" />
                                <span className="text-sm font-medium text-white/90 truncate max-w-full">{jdFile.name}</span>
                                <span className="text-xs text-[#009DFF] mt-2 underline">Click to change file</span>
                              </div>
                            )}
                          </label>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-[#009DFF]/10 border border-[#009DFF]/20 rounded-lg p-3 mb-8">
                        <Sparkles className="w-4 h-4 text-[#009DFF]" />
                        <span className="text-xs text-white/70">Optional • Improves keyword matching and role alignment</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <button onClick={() => setCurrentStep(2)} className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button 
                          onClick={() => setCurrentStep(4)}
                          className="bg-[#009DFF] hover:bg-[#009DFF]/90 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,157,255,0.3)]"
                        >
                          Continue <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: CHALLENGES */}
                {currentStep === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: '-20vw', filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -100, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute z-30 w-full max-w-md"
                  >
                    <div className="bg-[#0a0f1a]/60 backdrop-blur-2xl border border-[#009DFF]/20 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                      <h2 className="text-3xl font-bold mb-2">What's your biggest <span className="text-[#009DFF]">challenge?</span></h2>
                      <p className="text-white/50 text-sm mb-6">This helps our AI give you personalized advice and better recommendations.</p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {challengesOptions.map(challenge => (
                          <button
                            key={challenge}
                            onClick={() => toggleChallenge(challenge)}
                            className={`p-3 rounded-xl text-left text-sm font-medium border transition-all duration-300 ${
                              selectedChallenges.includes(challenge) 
                                ? 'bg-[#009DFF]/20 border-[#009DFF] text-white shadow-[0_0_15px_rgba(0,157,255,0.2)]' 
                                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border ${selectedChallenges.includes(challenge) ? 'bg-[#009DFF] border-[#009DFF]' : 'border-white/20'}`}>
                                {selectedChallenges.includes(challenge) && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="leading-tight">{challenge}</span>
                            </div>
                          </button>
                        ))}
                        <button
                          onClick={() => toggleChallenge("Other")}
                          className={`p-3 rounded-xl text-left text-sm font-medium border transition-all duration-300 ${
                            selectedChallenges.includes("Other") 
                              ? 'bg-[#009DFF]/20 border-[#009DFF] text-white' 
                              : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border ${selectedChallenges.includes("Other") ? 'bg-[#009DFF] border-[#009DFF]' : 'border-white/20'}`}>
                              {selectedChallenges.includes("Other") && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span>Other</span>
                          </div>
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {selectedChallenges.includes("Other") && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6"
                          >
                            <textarea
                              value={otherChallenge}
                              onChange={(e) => setOtherChallenge(e.target.value)}
                              placeholder="Please specify your challenge..."
                              className="w-full mt-2 bg-[#020408]/80 border border-[#009DFF]/20 focus:border-[#009DFF] rounded-xl p-3 text-white text-sm outline-none resize-none"
                              rows={2}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-between items-center mt-6">
                        <button onClick={() => setCurrentStep(3)} className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        
                        <button 
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#009DFF] to-[#8c52ff] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,157,255,0.4)] disabled:opacity-50"
                        >
                          Start AI Analysis <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-white/80">{errorMessage}</p>
              <button onClick={() => setErrorMessage(null)} className="ml-4 text-white/40 hover:text-white"><X className="w-4 h-4"/></button>
            </div>
          )}
        </main>
      )}

      {bootComplete && !isLoading && analysisResult && (
        <Dashboard result={analysisResult} onReset={handleReset} />
      )}
    </div>
  );
}
