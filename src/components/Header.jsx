"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, Code, ChevronRight } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Analyzer', path: '/analyzer' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-b border-white/20 dark:border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#009DFF] to-blue-600 flex items-center justify-center shadow-lg shadow-[#009DFF]/30 group-hover:shadow-[#009DFF]/50 transition-all duration-500 group-hover:scale-105">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-[#009DFF] transition-colors duration-300">
            My Job Secret
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-white/5 p-1 rounded-full border border-gray-200 dark:border-white/10 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-white dark:bg-[#009DFF]/20 text-[#009DFF] shadow-sm border border-gray-200 dark:border-[#009DFF]/30'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <Link
            href="/api-access"
            className="group flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Code className="w-4 h-4" />
            <span>API Access</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <div
        className={`md:hidden absolute top-20 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-gray-200 dark:border-white/10 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-4 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-bold text-gray-800 dark:text-white hover:text-[#009DFF] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-2" />
          <Link
            href="/api-access"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-[#009DFF] text-white px-6 py-3 rounded-xl font-bold shadow-lg"
          >
            <Code className="w-5 h-5" />
            Request API Access
          </Link>
        </div>
      </div>
    </header>
  );
}
