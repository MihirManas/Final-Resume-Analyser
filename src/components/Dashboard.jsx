"use client";
import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target, Briefcase, Zap, Star, Compass, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Dashboard({ result, onReset }) {
  const [usedAI, setUsedAI] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(result.real_result ? true : false);

  const handleResultSubmit = async (gotShortlisted) => {
    setSubmittedResult(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      await fetch(`${API_BASE_URL}/api/analysis/${result.analysis_id}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: gotShortlisted ? 'Yes' : 'No' })
      });
    } catch (e) {
      console.error("Failed to update result:", e);
    }
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReset]);

  if (!result) return null;

  const scoreColor = (score) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-[#009DFF]';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-green-400';
    if (score >= 70) return 'bg-[#009DFF]';
    if (score >= 50) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const ScoreRing = ({ label, score, icon: Icon, isMain = false, delay = '' }) => (
    <div className={`flex flex-col items-center justify-center p-6 bg-white/30 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/60 dark:border-[#009DFF]/20 rounded-3xl animate-in fade-in zoom-in duration-700 fill-mode-both hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,157,255,0.2)] transition-all ${delay} ${isMain ? 'col-span-2 md:col-span-1 shadow-[0_0_30px_rgba(0,157,255,0.15)] ring-1 ring-[#009DFF]/30' : 'shadow-inner'}`}>
      <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs font-bold">
        {Icon && <Icon size={14} className={scoreColor(score)} />}
        {label}
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-sm">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-gray-800" />
          <circle 
            cx="48" cy="48" r="40" 
            stroke="currentColor" strokeWidth="6" fill="none" 
            strokeDasharray="251.2" 
            strokeDashoffset={251.2 - (251.2 * score) / 100}
            strokeLinecap="round"
            className={`${scoreColor(score)} transition-all duration-1500 ease-out`} 
          />
        </svg>
        <div className={`text-3xl font-black ${scoreColor(score)}`}>{score}</div>
      </div>
    </div>
  );

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="flex flex-col mb-10 gap-6">
        <button 
          onClick={onReset}
          className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2">Analysis Complete</h1>
            <p className="text-gray-600 dark:text-gray-400">Deep AI insights into your career trajectory.</p>
          </div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-[#009DFF]/10 hover:bg-[#009DFF]/20 text-[#009DFF] border border-[#009DFF]/30 backdrop-blur-md rounded-full font-bold transition-all shadow-[0_0_15px_rgba(0,157,255,0.2)]"
          >
            <RefreshCw size={18} /> Analyze Another
          </button>
        </div>
      </div>

      {/* Probability Banner */}
      <div className="mb-8 p-6 bg-[#009DFF]/10 dark:bg-[#009DFF]/5 backdrop-blur-3xl border border-[#009DFF]/30 rounded-3xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#009DFF] shadow-[0_0_10px_#009DFF]"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="flex items-center gap-2 text-2xl font-black text-gray-900 dark:text-white mb-1">
              <Target className="text-[#009DFF]" size={28} /> Chance of Interview Call
            </h3>
            <p className="text-gray-700 dark:text-gray-300">Based on competitive benchmarking against the target role.</p>
          </div>
          <div className="text-5xl font-black text-[#009DFF] drop-shadow-[0_0_15px_rgba(0,157,255,0.3)]">
            {result.shortlist_probability}
          </div>
        </div>
        {result.jd_date_analysis && result.jd_date_analysis !== "Not Applicable" && (
          <div className="mt-4 pt-4 border-t border-[#009DFF]/20 flex items-start gap-3">
            <Lightbulb className="text-[#009DFF] mt-0.5" size={18} />
            <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
              <strong className="text-[#009DFF]">Timeline Insight: </strong>
              {result.jd_date_analysis}
            </p>
          </div>
        )}
      </div>

      {/* JD vs Resume Comparison Table */}
      {result.jd_resume_comparison && result.jd_resume_comparison.length > 0 && (
        <div className="mb-8 relative overflow-hidden rounded-[2rem] p-[1px] group animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="absolute inset-0 bg-gradient-to-br from-[#009DFF]/50 via-transparent to-transparent opacity-30"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#009DFF]/30 blur-3xl rounded-full mix-blend-screen group-hover:bg-[#009DFF]/40 transition-all duration-700"></div>
          
          <div className="relative bg-[#F5F5F0]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[2rem] border border-white/40 dark:border-[#009DFF]/30 p-8 shadow-[0_0_30px_rgba(0,157,255,0.1)]">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Compass className="text-[#009DFF]" /> JD vs Resume Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#009DFF]/20 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-bold w-1/4">Criteria</th>
                    <th className="pb-3 px-4 font-bold w-1/3">JD Requirement</th>
                    <th className="pb-3 px-4 font-bold w-1/3">Your Resume</th>
                    <th className="pb-3 pl-4 font-bold text-center">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-white/5">
                  {result.jd_resume_comparison.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#009DFF]/5 transition-colors">
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white align-top">
                        {item.criteria}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 align-top">
                        {item.jd_requirement}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 align-top">
                        {item.resume_status}
                      </td>
                      <td className="py-4 pl-4 align-top text-center">
                        {item.match ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                            <CheckCircle2 size={16} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                            <XCircle size={16} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Primary Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <ScoreRing label="Employability" score={result.employability_score} icon={Star} isMain={true} delay="delay-100" />
        <ScoreRing label="ATS Match" score={result.ats_score} icon={Target} delay="delay-150" />
        <ScoreRing label="Skills" score={result.skill_score} icon={Zap} delay="delay-200" />
        <ScoreRing label="Projects" score={result.project_score} icon={Briefcase} delay="delay-300" />
        <ScoreRing label="Interview Chance" score={result.interview_score} icon={CheckCircle2} delay="delay-500" />
      </div>

      {/* Real Result Feedback Loop */}
      {!submittedResult && (
        <div className="mb-8 p-6 bg-white/20 dark:bg-black/30 backdrop-blur-3xl border border-white/40 dark:border-[#009DFF]/20 rounded-3xl text-center relative overflow-hidden shadow-[0_0_20px_rgba(0,157,255,0.05)]">
          {!usedAI ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Did you use our AI suggestions to update your resume?</h3>
              <div className="flex justify-center gap-4">
                <button onClick={() => setUsedAI(true)} className="px-6 py-2 bg-[#009DFF]/20 hover:bg-[#009DFF]/30 text-[#009DFF] border border-[#009DFF]/30 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(0,157,255,0.2)]">
                  Yes, I did
                </button>
                <button onClick={() => setSubmittedResult(true)} className="px-6 py-2 bg-white/30 dark:bg-white/5 border border-white/50 dark:border-white/10 hover:bg-white/50 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-full font-bold transition-all">
                  No, not yet
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in slide-in-from-right-8 duration-500">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Awesome! And did you get shortlisted for an interview?</h3>
              <div className="flex justify-center gap-4">
                <button onClick={() => handleResultSubmit(true)} className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  <ThumbsUp size={18} /> Yes, I got shortlisted!
                </button>
                <button onClick={() => handleResultSubmit(false)} className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <ThumbsDown size={18} /> No, rejected
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alternative Pathways Banner */}
      {result.alternative_roles_suggested?.length > 0 && (
        <div className="mb-8 p-6 bg-white/20 dark:bg-[#009DFF]/5 backdrop-blur-3xl border border-white/40 dark:border-[#009DFF]/20 rounded-3xl relative overflow-hidden shadow-inner">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#009DFF]"></div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-[#009DFF] dark:text-[#009DFF] mb-3">
            <Compass size={24} /> Consider Alternative Pathways
          </h3>
          <p className="text-gray-800 dark:text-gray-300 mb-4 text-sm md:text-base">Based on your deep technical skill stack, our AI strongly suggests you would also be highly competitive for:</p>
          <div className="flex flex-wrap gap-3">
            {result.alternative_roles_suggested.map((role, i) => (
              <span key={i} className="px-4 py-2 bg-white/50 dark:bg-[#009DFF]/10 border border-white/80 dark:border-[#009DFF]/30 text-gray-900 dark:text-[#009DFF] rounded-full text-sm font-bold shadow-sm">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="p-8 bg-white/30 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/60 dark:border-green-500/20 rounded-3xl shadow-inner hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:border-green-500/40 transition-all animate-in fade-in slide-in-from-left-8 duration-700 delay-500 fill-mode-both">
          <h3 className="flex items-center gap-2 text-xl font-bold text-green-600 dark:text-green-400 mb-6">
            <CheckCircle2 /> Key Strengths
          </h3>
          <ul className="space-y-4">
            {result.strengths?.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-300">
                <span className="mt-1 w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="leading-relaxed text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-8 bg-white/30 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/60 dark:border-red-500/20 rounded-3xl shadow-inner hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:border-red-500/40 transition-all animate-in fade-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
          <h3 className="flex items-center gap-2 text-xl font-bold text-red-600 dark:text-red-400 mb-6">
            <XCircle /> Critical Weaknesses
          </h3>
          <ul className="space-y-4">
            {[...(result.weaknesses || []), ...(result.missing_skills || [])].slice(0, 7).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-300">
                <span className="mt-1 w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className="leading-relaxed text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skill Acquisition Guide */}
        {result.skill_acquisition_guide?.length > 0 && (
          <div className="p-8 bg-white/30 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/60 dark:border-[#009DFF]/20 rounded-3xl md:col-span-2 shadow-inner hover:shadow-[0_0_20px_rgba(0,157,255,0.1)] transition-all animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both">
            <h3 className="flex items-center gap-2 text-xl font-bold text-[#009DFF] mb-6">
              <Lightbulb /> Actionable Skill Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.skill_acquisition_guide.map((item, i) => (
                <div key={i} className="p-5 bg-white/50 dark:bg-[#009DFF]/5 border border-white/80 dark:border-[#009DFF]/10 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-[#009DFF] flex-shrink-0 shadow-[0_0_8px_#009DFF]" />
                    <span className="text-gray-800 dark:text-gray-300 text-sm leading-relaxed">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Plan */}
        <div className="p-8 bg-white/30 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-white/60 dark:border-orange-500/20 rounded-3xl md:col-span-2 shadow-inner hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all animate-in fade-in slide-in-from-bottom-8 duration-700 delay-1000 fill-mode-both">
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-6">
            <AlertTriangle className="text-orange-500 dark:text-orange-400" /> Strategic Improvement Plan
          </h3>
          <div className="space-y-4">
            {result.improvement_plan?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/80 dark:border-transparent">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-400/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-gray-800 dark:text-gray-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Non-intrusive Ad Space Example (e.g., Carbon Ads or Native Sponsorship) */}
      <div className="mt-12 flex justify-center animate-in fade-in duration-1000 delay-1000">
        <div className="max-w-md w-full p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center gap-4 text-left hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Briefcase className="text-blue-500" size={24} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider mb-1">Sponsored</div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-blue-500 transition-colors">Level up your data career with DataCamp</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Join 12 million learners and master Python, SQL, and Machine Learning today.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

