"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, ArrowRight } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
          ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#40b8ff] to-[#0070f3] flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex gap-1">
            My Job <span className="text-[#40b8ff]">Secret</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <div className="flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className="relative flex flex-col items-center group text-sm font-medium transition-colors"
                >
                  <span className={`${isActive ? 'text-[#40b8ff]' : 'text-gray-300 hover:text-white'}`}>
                    {link.name}
                  </span>
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <span className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-[#40b8ff] shadow-[0_0_8px_rgba(64,184,255,0.8)]"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center">
          <Link
            href="/start"
            className="group flex items-center gap-2 bg-gradient-to-r from-[#40b8ff] to-[#8c52ff] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(140,82,255,0.3)] hover:shadow-[0_0_30px_rgba(140,82,255,0.5)]"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white rounded-full transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden absolute top-24 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-6 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-lg font-medium ${pathname === link.path ? 'text-[#40b8ff]' : 'text-gray-300 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="w-full h-px bg-white/10 my-2" />
          <Link
            href="/start"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#40b8ff] to-[#8c52ff] text-white px-6 py-3 rounded-full font-bold shadow-lg"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
