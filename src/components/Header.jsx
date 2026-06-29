"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Analyzer', path: '/analyzer' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-md border-b border-white/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#40b8ff] to-[#0070f3] flex items-center justify-center shadow-[0_0_15px_rgba(64,184,255,0.4)]">
            <Shield className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white flex gap-1">
            My Job <span className="text-[#40b8ff]">Secret</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = link.name === 'Home'; // Hardcoding Home as active based on screenshot
            return (
              <Link
                key={link.name}
                href={link.path}
                className="relative flex flex-col items-center group text-[15px] font-medium transition-colors"
              >
                <span className={`${isActive ? 'text-[#40b8ff]' : 'text-gray-300 hover:text-white'}`}>
                  {link.name}
                </span>
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-[#40b8ff] shadow-[0_0_8px_rgba(64,184,255,1)]"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center">
          <Link
            href="/start"
            className="group flex items-center gap-2 bg-gradient-to-r from-[#40b8ff] to-[#8c52ff] text-white px-7 py-3 rounded-full text-[15px] font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(140,82,255,0.4)]"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </header>
  );
}
