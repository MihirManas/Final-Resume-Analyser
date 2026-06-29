"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const frames = [
  '/video/frame_01.png',
  '/video/frame_02.png',
  '/video/frame_03.png',
  '/video/frame_04.png',
  '/video/frame_05.png',
  '/video/frame_06.png',
  '/video/frame_07.png',
  '/video/frame_08.png',
  '/video/frame_09.png',
];

export default function HeroAnimation() {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    // Preload images
    frames.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 150); // Adjust speed here, ~6.6 fps seems reasonable for 9 frames to loop

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
      <img
        src={frames[currentFrame]}
        alt="Animated burning resume"
        className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,157,255,0.2)]"
      />
    </div>
  );
}
