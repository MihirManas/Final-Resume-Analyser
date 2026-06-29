"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Mail, Phone, Building2, User, Code2 } from 'lucide-react';
import ParticleCanvas from '@/components/ParticleCanvas';

export default function APIAccessPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    useCase: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submission failed');
      
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center relative overflow-hidden pt-20">
      <ParticleCanvas theme="dark" />
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#009DFF]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="relative z-10 w-full max-w-xl px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#009DFF]/10 border border-[#009DFF]/30 text-[#009DFF] mb-6 shadow-[0_0_30px_rgba(0,157,255,0.2)]">
            <Code2 size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Request API Access
          </h1>
          <p className="text-gray-400 text-lg">
            Integrate the world's most advanced resume analysis AI directly into your platform. Drop your details and we'll reach out.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Request Received</h2>
              <p className="text-gray-400 mb-8">We will review your application and contact you shortly to discuss integration.</p>
              <button 
                onClick={() => {setStatus('idle'); setFormData({name: '', email: '', phone: '', company: '', useCase: ''})}}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-colors"
              >
                Submit another request
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#009DFF] transition-colors" placeholder="John Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#009DFF] transition-colors" placeholder="Startup Inc." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#009DFF] transition-colors" placeholder="john@company.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#009DFF] transition-colors" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Use Case (Optional)</label>
                <textarea value={formData.useCase} onChange={e => setFormData({...formData, useCase: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#009DFF] transition-colors h-24 resize-none" placeholder="How do you plan to use our API?" />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-400 text-center">
                  Failed to submit request. Please try again later.
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full py-4 mt-4 bg-[#009DFF] hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,157,255,0.4)] hover:shadow-[0_0_30px_rgba(0,157,255,0.6)] disabled:opacity-70 disabled:pointer-events-none"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  "Request API Key"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
