"use client";
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Briefcase, ChevronRight, X, AlertTriangle, RefreshCw, Loader2, ArrowLeft, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

import { useTheme } from './hooks/useTheme';
import { styles } from './utils/styles';
import ParticleCanvas from './components/ParticleCanvas';
import TicTacToeGame from './components/TicTacToeGame';
import Dashboard from './components/Dashboard';

export default function App() {
  const [bootComplete, setBootComplete] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  
  // JD can be text or file
  const [jdMode, setJdMode] = useState('type'); // 'type' | 'upload'
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);

  const [userProblems, setUserProblems] = useState('');

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

  // Timer + rotating tips during loading
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
    setUserProblems('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setErrorMessage("Please upload a resume before analyzing.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    if (!targetRole.trim()) {
      setErrorMessage("Please enter a target job role.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setErrorMessage(null);
    setLoadingStage('Uploading resume...');

    const formData = new FormData();
    formData.append("resume_file", resumeFile);
    formData.append("target_role", targetRole);
    if (jdMode === "upload" && jdFile) {
      formData.append("jd_file", jdFile);
    } else if (jdMode === "type" && jdText.trim()) {
      formData.append("jd_text", jdText.trim());
    }
    if (userProblems.trim()) {
      formData.append("user_problems", userProblems.trim());
    }
    // We append guest user data for MVP
    formData.append("user_name", "Demo User");
    formData.append("user_email", "demo@example.com");

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      // 1. Upload & Analyze
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

      // 2. Fetch Report
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

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans selection:bg-[#009DFF]/30 selection:text-[#009DFF] overflow-x-clip transition-colors duration-1000 flex flex-col items-center relative">
      
      {/* Background Gradients */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out z-0 bg-gradient-to-tr from-[#009DFF]/10 via-[#F5F5F0]/80 to-[#F5F5F0] ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out z-0 bg-gradient-to-tr from-[#009DFF]/15 via-[#0A0A0A] to-[#0A0A0A] ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-[#009DFF]/30 text-gray-800 dark:text-[#009DFF] hover:bg-white/40 dark:hover:bg-[#009DFF]/20 transition-all shadow-[0_4px_20px_rgba(0,157,255,0.15)] group"
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sunrise size={20} className="group-hover:scale-110 transition-transform" /> : <Sunset size={20} className="group-hover:scale-110 transition-transform" />}
      </button>

      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <ParticleCanvas theme={theme} />

      {bootComplete && isLoading && (
        <div className="relative z-10 w-full max-w-lg px-6 py-16 flex flex-col items-center justify-center animate-in fade-in duration-700 my-auto">
          {/* Pulsing glow ring */}
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full border-2 border-[#009DFF]/30 flex items-center justify-center relative backdrop-blur-sm">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#009DFF] animate-spin" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-2 rounded-full border border-transparent border-b-[#009DFF]/40 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              <span className="text-4xl">{loadingTipIndex % 2 === 0 ? '🧠' : '☕'}</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-[#009DFF]/10 blur-xl animate-pulse" />
          </div>

          {/* Stage text */}
          <h2 className="text-xl font-bold text-center mb-2">{loadingStage || 'Analyzing your resume...'}</h2>
          <p className="text-sm text-gray-500 dark:text-white/40 mb-6">This usually takes 15–30 seconds</p>

          {/* Progress bar */}
          <div className="w-full max-w-sm h-1.5 bg-gray-200/50 dark:bg-white/10 backdrop-blur-md rounded-full overflow-hidden mb-6 border border-white/20 dark:border-white/5">
            <div className="h-full bg-[#009DFF] rounded-full animate-pulse shadow-[0_0_10px_#009DFF]" style={{ width: elapsedTime < 10 ? `${elapsedTime * 8}%` : elapsedTime < 90 ? `${80 + (elapsedTime - 10) * 0.2}%` : '95%', transition: 'width 1s ease' }} />
          </div>

          {/* MINIGAME: Tic Tac Toe Game */}
          <TicTacToeGame />

          {/* Rotating tips */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-center max-w-sm" key={loadingTipIndex}>
            <p className="text-sm text-gray-600 dark:text-white/60 animate-in fade-in duration-500">{loadingTips[loadingTipIndex]}</p>
          </div>

          {/* Timer */}
          <p className="mt-4 text-xs text-gray-400 dark:text-white/30 font-mono">
            {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')} elapsed
          </p>
          
          {/* Cancel Button */}
          <button onClick={handleReset} className="mt-8 px-4 py-2 flex items-center gap-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white bg-gray-200/50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-all">
            <ArrowLeft size={16} /> Cancel Analysis
          </button>
        </div>
      )}

      {bootComplete && !isLoading && !analysisResult && (
        <main className="relative z-10 w-full max-w-2xl px-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700 my-auto">
          <div className="text-center mb-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/30 dark:bg-[#009DFF]/10 text-[#009DFF] dark:text-[#009DFF] text-sm font-semibold mb-6 border border-white/50 dark:border-[#009DFF]/30 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#009DFF] animate-pulse shadow-[0_0_8px_#009DFF]" />
              AI-Powered Career Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-[#009DFF] to-gray-900 dark:from-white dark:via-[#009DFF] dark:to-white drop-shadow-sm">
              Unlock Your <br className="hidden md:block" />
              <span className="text-[#009DFF]">True Potential</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Our advanced AI dissects your resume against top industry benchmarks to reveal hidden strengths, critical gaps, and your exact probability of getting hired.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-white/30 dark:bg-[#0A0A0A]/30 backdrop-blur-3xl border border-white/60 dark:border-[#009DFF]/20 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_32px_rgba(0,157,255,0.08)] relative overflow-hidden group transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,157,255,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#009DFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* SECTION 1: UPLOAD RESUME */}
            <div className="space-y-3 relative z-10">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white/80 uppercase tracking-widest">
                <span className="w-6 h-6 rounded-full bg-white/50 dark:bg-[#009DFF]/20 text-[#009DFF] flex items-center justify-center text-xs backdrop-blur-sm border border-white/50 dark:border-[#009DFF]/30">1</span>
                Upload Resume
              </label>
              
              <div className="w-full h-32 border border-white/60 dark:border-[#009DFF]/30 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white/30 dark:bg-black/40 backdrop-blur-md hover:bg-white/50 dark:hover:bg-[#009DFF]/10 transition-all cursor-pointer group/drop shadow-inner">
                {!resumeFile ? (
                  <>
                    <Upload className="w-6 h-6 text-[#009DFF]/60 dark:text-[#009DFF]/60 group-hover/drop:text-[#009DFF] transition-colors" />
                    <span className="text-sm text-gray-600 dark:text-white/60">Click to upload PDF or DOCX</span>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-[#009DFF]">
                    <FileText className="w-6 h-6" />
                    <span className="font-medium text-sm">{resumeFile.name}</span>
                    <X className="w-4 h-4 cursor-pointer hover:text-red-400 ml-2" onClick={(e) => { e.preventDefault(); setResumeFile(null); }} />
                  </div>
                )}
                <input required={!resumeFile} type="file" accept=".pdf,.docx" className="hidden" id="resume" onChange={(e) => setResumeFile(e.target.files[0])} />
                <label htmlFor="resume" className="absolute inset-0 cursor-pointer" />
              </div>
            </div>

            {/* SECTION 2: TARGETED JOB ROLE */}
            <div className="space-y-3 relative z-10">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white/80 uppercase tracking-widest">
                <span className="w-6 h-6 rounded-full bg-white/50 dark:bg-[#009DFF]/20 text-[#009DFF] flex items-center justify-center text-xs backdrop-blur-sm border border-white/50 dark:border-[#009DFF]/30">2</span>
                Targeted Job Role
              </label>
              <input 
                required 
                type="text" 
                value={targetRole} 
                onChange={(e) => setTargetRole(e.target.value)} 
                className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/60 dark:border-[#009DFF]/30 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#009DFF] focus:ring-1 focus:ring-[#009DFF] transition-all shadow-inner" 
                placeholder="e.g. Data Analyst, Frontend Developer..." 
              />
            </div>

            {/* SECTION 3: JOB DESCRIPTION (OPTIONAL) */}
            <div className="space-y-3 relative z-10">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white/80 uppercase tracking-widest">
                <span className="w-6 h-6 rounded-full bg-white/50 dark:bg-[#009DFF]/20 text-[#009DFF] flex items-center justify-center text-xs backdrop-blur-sm border border-white/50 dark:border-[#009DFF]/30">3</span>
                Job Description <span className="text-xs text-gray-500 dark:text-white/40 normal-case">(Optional)</span>
              </label>
              
              <div className="flex bg-white/30 dark:bg-black/40 backdrop-blur-md rounded-xl p-1 w-full max-w-[240px] mb-2 border border-white/60 dark:border-[#009DFF]/20 shadow-inner">
                <button type="button" onClick={() => setJdMode('type')} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${jdMode === 'type' ? 'bg-white/80 dark:bg-[#009DFF]/20 text-gray-900 dark:text-white shadow-sm border border-white/50 dark:border-[#009DFF]/30' : 'text-gray-600 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/80'}`}>Type / Paste</button>
                <button type="button" onClick={() => setJdMode('upload')} className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${jdMode === 'upload' ? 'bg-white/80 dark:bg-[#009DFF]/20 text-gray-900 dark:text-white shadow-sm border border-white/50 dark:border-[#009DFF]/30' : 'text-gray-600 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/80'}`}>Upload File</button>
              </div>

              {jdMode === 'type' ? (
                <textarea 
                  value={jdText} 
                  onChange={(e) => setJdText(e.target.value)} 
                  className="w-full h-32 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/60 dark:border-[#009DFF]/30 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#009DFF] transition-all resize-none shadow-inner" 
                  placeholder="Paste the job description here..." 
                />
              ) : (
                <div className="w-full h-32 border border-white/60 dark:border-[#009DFF]/30 rounded-xl flex flex-col items-center justify-center gap-2 bg-white/30 dark:bg-black/40 backdrop-blur-md hover:bg-white/50 dark:hover:bg-[#009DFF]/10 transition-all cursor-pointer group/drop shadow-inner">
                  {!jdFile ? (
                    <>
                      <Upload className="w-6 h-6 text-[#009DFF]/60 dark:text-[#009DFF]/60 group-hover/drop:text-[#009DFF] transition-colors" />
                      <span className="text-xs text-gray-600 dark:text-white/60 text-center px-4">Upload PDF, DOCX, or Image (JPG/PNG)</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-[#009DFF]">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium text-xs max-w-[200px] truncate">{jdFile.name}</span>
                      <X className="w-4 h-4 cursor-pointer hover:text-red-400 ml-1" onClick={(e) => { e.preventDefault(); setJdFile(null); }} />
                    </div>
                  )}
                  <input type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" className="hidden" id="jd" onChange={(e) => setJdFile(e.target.files[0])} />
                  <label htmlFor="jd" className="absolute inset-0 cursor-pointer" />
                </div>
              )}
            </div>

            {/* SECTION 4: CURRENT CHALLENGES (OPTIONAL) */}
            <div className="space-y-3 relative z-10">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-white/80 uppercase tracking-widest">
                <span className="w-6 h-6 rounded-full bg-white/50 dark:bg-[#009DFF]/20 text-[#009DFF] flex items-center justify-center text-xs backdrop-blur-sm border border-white/50 dark:border-[#009DFF]/30">4</span>
                Current Challenges <span className="text-xs text-gray-500 dark:text-white/40 normal-case">(Optional)</span>
              </label>
              <textarea 
                value={userProblems} 
                onChange={(e) => setUserProblems(e.target.value)} 
                className="w-full h-24 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/60 dark:border-[#009DFF]/30 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#009DFF] transition-all resize-none shadow-inner" 
                placeholder="e.g. I keep failing technical rounds, or I am not getting callbacks..." 
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-[#009DFF]/10 dark:bg-[#009DFF]/10 backdrop-blur-xl border border-white/80 dark:border-[#009DFF]/40 text-[#009DFF] px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#009DFF]/20 dark:hover:bg-[#009DFF]/20 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,157,255,0.2)] relative z-10 mt-4 disabled:opacity-70 disabled:pointer-events-none">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {loadingStage || 'AI is Analyzing...'}
                </span>
              ) : (
                <>Analyze <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          {/* ERROR / STATUS MESSAGE */}
          {errorMessage && (
            <div className="mt-4 relative z-10 bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400 mb-1">Analysis Error</p>
                <p className="text-sm text-gray-600 dark:text-white/60">{errorMessage}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { setErrorMessage(null); handleSubmit(new Event('submit')); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3B82F6]/20 text-[#3B82F6] rounded-lg text-xs font-bold hover:bg-[#3B82F6]/30 transition-all">
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
                <button onClick={() => setErrorMessage(null)} className="px-3 py-1.5 text-gray-400 hover:text-white rounded-lg text-xs transition-all">
                  Dismiss
                </button>
              </div>
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

