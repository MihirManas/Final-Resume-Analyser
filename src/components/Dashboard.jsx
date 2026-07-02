"use client";
import React, { useState } from 'react';
import { 
  Shield, Home, Target, FileText, Briefcase, FileCheck, Sparkles, Network,
  ArrowLeft, Download, RefreshCw, Star, Zap, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, ExternalLink, Bot
} from 'lucide-react';

const scoreColor = (score) => {
  if (score >= 80) return 'text-[#22C55E]';
  if (score >= 70) return 'text-[#3B82F6]';
  if (score >= 50) return 'text-[#F97316]';
  return 'text-[#EF4444]';
};

const getScoreBg = (score) => {
  if (score >= 80) return '#22C55E';
  if (score >= 70) return '#3B82F6';
  if (score >= 50) return '#F97316';
  return '#EF4444';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
};

const CircularProgress = ({ score, size = 120, strokeWidth = 8, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreBg(score);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.15)]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1A2642"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Foreground circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}%</span>
        </div>
      </div>
      {label && <span className={`text-sm font-bold ${scoreColor(score)}`}>{label}</span>}
    </div>
  );
};

const ScoreCard = ({ title, icon: Icon, score, isEmployability }) => (
  <div className={`flex flex-col items-center justify-center p-6 bg-[#0B1221] border ${isEmployability ? 'border-[#3B82F6]/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-[#1A2642] hover:border-[#2A3F6C]'} rounded-2xl transition-all`}>
    <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
      {Icon && <Icon size={14} className={isEmployability ? 'text-[#3B82F6]' : 'text-gray-500'} />}
      {title}
    </div>
    <CircularProgress score={score} size={100} strokeWidth={6} label={getScoreLabel(score)} />
  </div>
);

// --- Sub Views ---

const OverviewView = ({ result }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="bg-[#0B1221] border border-[#1A2642] rounded-2xl p-6 relative overflow-hidden group hover:border-[#22C55E]/30 transition-colors">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#22C55E]/50 group-hover:bg-[#22C55E] transition-colors"></div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-[#22C55E] mb-6">
          <CheckCircle2 size={20} /> Key Strengths
        </h3>
        <ul className="space-y-4">
          {(result.strengths && result.strengths.length > 0 ? result.strengths : [
            "Strong technical skills match",
            "Good project diversity",
            "Relevant work experience",
            "Well-structured resume"
          ]).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mt-2 shadow-[0_0_5px_#22C55E] shrink-0"></div>
              <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="bg-[#0B1221] border border-[#1A2642] rounded-2xl p-6 relative overflow-hidden group hover:border-[#EF4444]/30 transition-colors">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#EF4444]/50 group-hover:bg-[#EF4444] transition-colors"></div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-[#EF4444] mb-6">
          <XCircle size={20} /> Areas to Build On
        </h3>
        <ul className="space-y-4">
          {([...(result.weaknesses || []), ...(result.missing_skills || [])].length > 0 ? [...(result.weaknesses || []), ...(result.missing_skills || [])] : [
            "Missing few important keywords",
            "Limited quantifiable achievements",
            "Skills section needs improvement",
            "Education section not optimized"
          ]).slice(0,4).map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-2 shadow-[0_0_5px_#EF4444] shrink-0"></div>
              <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Improvement Plan (Col 3) */}
    <div className="bg-[#0B1221] border border-[#1A2642] rounded-2xl p-6 lg:col-span-1">
      <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
        <AlertTriangle size={20} className="text-[#F97316]" /> Strategic Improvement Plan
      </h3>
      <div className="space-y-6">
        {(result.improvement_plan && result.improvement_plan.length > 0 ? result.improvement_plan : [
          "Optimize your resume for ATS",
          "Highlight measurable achievements",
          "Strengthen your skills section"
        ]).map((item, i) => {
            let title = item;
            let desc = "Follow this recommendation closely.";
            if (item.includes(':')) {
              const parts = item.split(':');
              title = parts[0].trim();
              desc = parts.slice(1).join(':').trim();
            }

            return (
          <div key={i} className="flex items-start gap-4 group cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.4)] mt-1">
              {i + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-white text-sm font-bold mb-1 group-hover:text-[#3B82F6] transition-colors">{title}</h4>
              <p className="text-gray-400 text-xs">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors mt-1" />
          </div>
        )})}
      </div>
    </div>
  </div>
);

const ATSScoreView = ({ result }) => (
  <div className="bg-[#0B1221] border border-[#1A2642] rounded-2xl p-8 relative overflow-hidden">
    <div className="flex items-center gap-6 mb-8">
      <div className="w-16 h-16 rounded-full bg-[#091529] border border-[#1E3A8A] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
        <Target size={32} className="text-[#3B82F6]" strokeWidth={2} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">ATS Score Breakdown</h2>
        <p className="text-gray-400">Understanding how applicant tracking systems read your resume.</p>
      </div>
      <div className="ml-auto">
         <CircularProgress score={result.ats_score || 0} size={120} strokeWidth={8} label="ATS Score" />
      </div>
    </div>

    <div className="p-6 bg-[#070D18] border border-[#1A2642] rounded-xl text-gray-300 leading-relaxed">
      <h3 className="font-bold text-white mb-4 text-lg">ATS Logic & Feedback</h3>
      {result.ats_logic ? (
        <p>{result.ats_logic}</p>
      ) : (
        <p>Your ATS score reflects how easily software can parse and interpret your resume structure. Ensure you use standard fonts, avoid complex tables or graphics, and include standard section headers (Experience, Education, Skills).</p>
      )}
    </div>
  </div>
);

const SkillsAnalysisView = ({ result }) => (
  <div className="space-y-6">
    <div className="bg-[#0B1221] border border-[#1A2642] rounded-2xl p-8 relative overflow-hidden">
       <div className="flex items-center gap-6 mb-6">
         <div className="w-16 h-16 rounded-full bg-[#091529] border border-[#F97316] flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] shrink-0">
            <Zap size={32} className="text-[#F97316]" strokeWidth={2} />
         </div>
         <div>
            <h2 className="text-2xl font-bold text-white mb-2">Skills Analysis</h2>
            <p className="text-gray-400">A detailed breakdown of required and nice-to-have skills for your target role.</p>
         </div>
         <div className="ml-auto">
            <CircularProgress score={result.skill_score || 0} size={120} strokeWidth={8} label="Skill Score" />
         </div>
       </div>

       {result.skills_logic && (
         <div className="p-6 bg-[#070D18] border border-[#1A2642] rounded-xl text-gray-300 leading-relaxed mb-8">
            <h3 className="font-bold text-white mb-2 text-lg">Analysis Logic</h3>
            <p>{result.skills_logic}</p>
         </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070D18] border border-[#22C55E]/30 rounded-xl p-5">
             <h3 className="text-[#22C55E] font-bold flex items-center gap-2 mb-4"><CheckCircle2 size={18}/> Absolute Necessary</h3>
             <ul className="space-y-2">
                {(result.absolute_necessary_skills || []).map((skill, i) => (
                   <li key={i} className="text-sm text-gray-300 bg-[#0B1221] px-3 py-2 rounded-lg border border-[#1A2642]">{skill}</li>
                ))}
                {(!result.absolute_necessary_skills || result.absolute_necessary_skills.length === 0) && <p className="text-sm text-gray-500 italic">No skills listed.</p>}
             </ul>
          </div>

          <div className="bg-[#070D18] border border-[#3B82F6]/30 rounded-xl p-5">
             <h3 className="text-[#3B82F6] font-bold flex items-center gap-2 mb-4"><Star size={18}/> Good to Have</h3>
             <ul className="space-y-2">
                {(result.good_to_have_skills || []).map((skill, i) => (
                   <li key={i} className="text-sm text-gray-300 bg-[#0B1221] px-3 py-2 rounded-lg border border-[#1A2642]">{skill}</li>
                ))}
                {(!result.good_to_have_skills || result.good_to_have_skills.length === 0) && <p className="text-sm text-gray-500 italic">No skills listed.</p>}
             </ul>
          </div>

          <div className="bg-[#070D18] border border-[#F97316]/30 rounded-xl p-5">
             <h3 className="text-[#F97316] font-bold flex items-center gap-2 mb-4"><AlertTriangle size={18}/> Need to Learn</h3>
             <ul className="space-y-2">
                {(result.need_to_learn_skills || []).map((skill, i) => (
                   <li key={i} className="text-sm text-gray-300 bg-[#0B1221] px-3 py-2 rounded-lg border border-[#1A2642]">{skill}</li>
                ))}
                {(!result.need_to_learn_skills || result.need_to_learn_skills.length === 0) && <p className="text-sm text-gray-500 italic">No skills listed.</p>}
             </ul>
          </div>
       </div>
    </div>
  </div>
);

const JobMatchView = ({ result }) => (
  <div className="bg-[#0B1221] border border-[#1A2642] rounded-2xl p-8 relative overflow-hidden">
     <div className="flex items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-[#091529] border border-[#10B981] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
           <Briefcase size={32} className="text-[#10B981]" strokeWidth={2} />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-white mb-2">Recommended Job Matches</h2>
           <p className="text-gray-400">Roles that strictly align with your current resume and skills.</p>
        </div>
     </div>

     <div className="space-y-4">
        {(result.recommended_job_matches && result.recommended_job_matches.length > 0) ? (
           result.recommended_job_matches.map((job, idx) => (
              <div key={idx} className="bg-[#070D18] border border-[#1A2642] rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                 <div>
                    <h3 className="text-lg font-bold text-white mb-1">{job.job_title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{job.match_logic}</p>
                 </div>
                 <button className="px-5 py-2 bg-[#1E40AF] hover:bg-[#1D4ED8] rounded-full text-white text-xs font-bold transition-colors whitespace-nowrap">
                    Search Jobs
                 </button>
              </div>
           ))
        ) : (
           <div className="text-center p-10 border border-dashed border-[#1A2642] rounded-xl text-gray-400">
              No specific job matches could be found based on the provided resume and target role. Try updating your resume with more targeted keywords.
           </div>
        )}
     </div>
  </div>
);

// --- Main Dashboard Component ---

export default function Dashboard({ result, onReset }) {
  const [usedAI, setUsedAI] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // If no result is passed (e.g. initial state), return null or loading
  if (!result) return null;

  const handleResultSubmit = async (gotShortlisted) => {
    setSubmittedResult(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${API_BASE_URL}/api/analysis/${result.analysis_id}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: gotShortlisted ? 'Yes' : 'No' })
      });
    } catch (e) {
      console.error("Failed to update result:", e);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'ats', label: 'ATS Score', icon: Target },
    { id: 'skills', label: 'Skills Analysis', icon: Zap },
    { id: 'jobs', label: 'Job Match', icon: Briefcase },
  ];

  return (
    <div className="flex h-full w-full bg-[#02050A] text-white overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR */}
      <div className="w-64 flex flex-col bg-[#02050A] border-r border-[#111A2C] flex-shrink-0 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-8 h-8 bg-[#3B82F6] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
             <Shield size={18} className="text-white fill-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">My Job <span className="text-[#3B82F6]">Secret</span></span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto hide-scrollbar">
           {tabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium cursor-pointer transition-colors ${
                   activeTab === tab.id 
                     ? 'bg-[#0B1A38] text-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.1)] border border-[#1A2C56]' 
                     : 'text-gray-400 hover:text-white hover:bg-[#0B1221]'
                }`}
              >
                 <tab.icon size={18} /> {tab.label}
              </div>
           ))}
        </nav>

        {/* Overall Score Widget */}
        <div className="p-6 m-4 bg-[#070D18] border border-[#111A2C] rounded-2xl flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50"></div>
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Overall Score</span>
          <CircularProgress score={result.employability_score || 82} size={110} strokeWidth={8} />
          <p className="mt-4 text-[#22C55E] font-bold text-sm text-center">{getScoreLabel(result.employability_score || 82)} Score!</p>
          <p className="mt-2 text-gray-400 text-xs text-center leading-relaxed">
            Your resume is strong. A few targeted improvements can make it exceptional.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto scroll-smooth hide-scrollbar bg-[#02050A]">
        <div className="max-w-6xl mx-auto p-8 lg:p-10 space-y-6">
          
          {/* Top Navbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <button 
              onClick={onReset}
              className="flex items-center gap-2 text-[#3B82F6] hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back <span className="text-gray-500">to Dashboard</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-white/5 border border-[#1A2642] rounded-full text-white text-sm font-medium transition-colors">
                <Download size={16} className="text-[#3B82F6]" /> Download Report
              </button>
              <button 
                onClick={onReset}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338ca] border border-[#4F46E5]/50 rounded-full text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]"
              >
                <RefreshCw size={16} /> Analyze Another
              </button>
            </div>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              {activeTab === 'overview' && <>Analysis <span className="text-[#3B82F6] font-black drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Complete</span></>}
              {activeTab === 'ats' && <>ATS <span className="text-[#3B82F6] font-black drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Breakdown</span></>}
              {activeTab === 'skills' && <>Skill <span className="text-[#3B82F6] font-black drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Analysis</span></>}
              {activeTab === 'jobs' && <>Job <span className="text-[#3B82F6] font-black drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">Matches</span></>}
            </h1>
            <p className="text-gray-400 flex items-center gap-2 text-sm">
              Deep AI insights into your career trajectory. <Sparkles size={14} className="text-[#3B82F6]" />
            </p>
          </div>

          {activeTab === 'overview' && (
             <>
                {/* Probability Banner */}
                <div className="w-full bg-[#0B1221] border border-[#1A2642] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                  {/* Glowing orb in bg */}
                  <div className="absolute right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#3B82F6]/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
                  
                  <div className="flex items-center gap-6 z-10 w-1/2">
                    <div className="w-14 h-14 rounded-full bg-[#091529] border border-[#1E3A8A] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
                      <Target size={28} className="text-[#3B82F6]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Chance of Interview Call</h3>
                      <p className="text-sm text-gray-400">Based on competitive benchmarking against the target role.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-12 z-10 w-1/2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#0F172A] border border-[#3B82F6]/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)] shrink-0">
                        <span className="text-xl font-bold text-white">{result.shortlist_probability || '72%'}</span>
                      </div>
                      <div>
                        <h4 className="text-[#3B82F6] font-bold mb-1">Good Chance</h4>
                        <p className="text-xs text-gray-400 max-w-[150px]">You have a good chance of getting shortlisted.</p>
                      </div>
                    </div>
                    
                    {/* Dummy Chart Line */}
                    <div className="hidden lg:block flex-1 h-12 relative">
                      <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <path 
                          d="M 0 30 C 20 30, 30 25, 50 20 C 70 15, 80 5, 100 0" 
                          fill="none" 
                          stroke="url(#gradient)" 
                          strokeWidth="1.5"
                          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                        />
                        <circle cx="100" cy="0" r="1.5" fill="#3B82F6" className="drop-shadow-[0_0_5px_#3B82F6]" />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <ScoreCard title="Employability" icon={Star} score={result.employability_score || 84} isEmployability={true} />
                  <ScoreCard title="ATS Match" icon={Target} score={result.ats_score || 76} />
                  <ScoreCard title="Skills" icon={Zap} score={result.skill_score || 81} />
                  <ScoreCard title="Projects" icon={Briefcase} score={result.project_score || 78} />
                  <ScoreCard title="Interview Chance" icon={Target} score={result.interview_score || 72} />
                </div>
             </>
          )}

          {activeTab === 'overview' && <OverviewView result={result} />}
          {activeTab === 'ats' && <ATSScoreView result={result} />}
          {activeTab === 'skills' && <SkillsAnalysisView result={result} />}
          {activeTab === 'jobs' && <JobMatchView result={result} />}

          {/* Sponsored Ad Banner */}
          <div className="w-full bg-[#070D18] border border-[#1A2642] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group cursor-pointer hover:border-[#1E3A8A] transition-colors mt-4 mb-10">
             {/* Glowing Grid Background */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
             <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#3B82F6]/10 to-transparent pointer-events-none mix-blend-screen"></div>

             <div className="flex items-center gap-4 z-10">
                <div className="w-12 h-12 rounded-xl bg-[#091529] border border-[#1E3A8A] flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">
                   <Briefcase size={24} className="text-[#3B82F6]" />
                </div>
                <div>
                   <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Sponsored</div>
                   <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-[#3B82F6] transition-colors">Level up your data career with DataCamp</h4>
                   <p className="text-xs text-gray-400">Join 12 million learners and master Python, SQL, and Machine Learning.</p>
                </div>
             </div>
             
             <button className="z-10 flex items-center gap-2 px-5 py-2 bg-transparent border border-[#1A2642] rounded-full text-[#3B82F6] text-xs font-bold hover:bg-[#1E3A8A]/30 hover:border-[#3B82F6]/50 transition-all shrink-0">
                Explore DataCamp <ExternalLink size={14} />
             </button>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}} />
    </div>
  );
}
