"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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
    <>
      {/* Invisible hit area to trigger hover when hidden on analyzer page */}
      {pathname === '/analyzer' && (
        <div 
          className="fixed top-0 left-0 right-0 h-20 z-[60]" 
          onMouseEnter={() => setIsHovered(true)} 
        />
      )}

      <header 
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled && (pathname !== '/analyzer' || isHovered)
            ? 'bg-[#020408]/90 backdrop-blur-md' 
            : 'bg-transparent'
        } ${
          pathname === '/analyzer' && !isHovered
            ? '-translate-y-full opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
      >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-28 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#009DFF] flex items-center justify-center">
            <Shield className="w-6 h-6 text-black" fill="currentColor" strokeWidth={0} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white flex gap-1.5">
            My Job <span className="text-[#009DFF]">Secret</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className="relative flex flex-col items-center group text-[15px] font-semibold tracking-wide transition-colors"
              >
                <span className={`${isActive ? 'text-[#009DFF]' : 'text-gray-400 hover:text-gray-200'}`}>
                  {link.name}
                </span>
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-4 w-1.5 h-1.5 rounded-full bg-[#009DFF]"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center">
          <Link
            href="/start"
            className="flex items-center gap-2 bg-gradient-to-r from-[#009DFF] to-[#8c52ff] text-white px-7 py-3 rounded-full text-[15px] font-bold hover:opacity-90 transition-opacity"
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}
