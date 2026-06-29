"use client";
import React, { useEffect, useRef } from 'react';

const ParticleCanvas = ({ theme }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Opaque background for performance
    let animationFrameId;
    let particles = [];
    
    const accentColor = '0, 157, 255'; // #009DFF
    
    // Physics constants (Adjusted per user feedback)
    const G = 0.05; // Adjusted gravitational constant to 0.05
    const maxVelocity = 1.5; // Cap speed
    const minDistanceSq = 400; // 20^2 to prevent infinite acceleration
    const interactionRadiusSq = 22500; // 150^2
    const interactionRadius = 150;
    
    // Max particle mass is 3. Exactly 0.001% more than 3 is 3 * 1.00001 = 3.00003
    let mouse = { x: -1000, y: -1000, mass: 3.00003, radiusSq: 90000 }; // 300^2

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.mass = Math.random() * 2 + 1; // Mass is between 1 and 3
        this.radius = this.mass * 1.5;
        // Zero initial movement, all movement is generated purely by gravity
        this.vx = 0;
        this.vy = 0;
      }

      applyGravity(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        let distSq = dx * dx + dy * dy;
        
        // Fast optimization: only apply gravity if close, use pre-calculated squares
        if (distSq > minDistanceSq && distSq < 60000) {
          let dist = Math.sqrt(distSq);
          let force = (G * this.mass * other.mass) / distSq;
          
          let ax = (force * dx) / dist;
          let ay = (force * dy) / dist;
          
          this.vx += ax / this.mass;
          this.vy += ay / this.mass;
        }
      }

      applyMouseGravity() {
        if (mouse.x === -1000) return;
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distSq = dx * dx + dy * dy;
        
        if (distSq < mouse.radiusSq && distSq > minDistanceSq) {
          let dist = Math.sqrt(distSq);
          let force = (G * this.mass * mouse.mass) / distSq; // True gravitational pull
          
          let ax = (force * dx) / dist;
          let ay = (force * dy) / dist;
          
          this.vx += ax / this.mass;
          this.vy += ay / this.mass;
          
          // Add tangential velocity for orbiting
          this.vx += (dy / dist) * 0.15;
          this.vy += (-dx / dist) * 0.15;
        }
      }

      update() {
        let speedSq = this.vx * this.vx + this.vy * this.vy;
        if (speedSq > maxVelocity * maxVelocity) {
          let speed = Math.sqrt(speedSq);
          this.vx = (this.vx / speed) * maxVelocity;
          this.vy = (this.vy / speed) * maxVelocity;
        }
        
        // Less drag for faster continuous movement
        this.vx *= 0.995;
        this.vy *= 0.995;

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0) { this.x = 0; this.vx *= -0.9; }
        if (this.x > canvas.width) { this.x = canvas.width; this.vx *= -0.9; }
        if (this.y < 0) { this.y = 0; this.vy *= -0.9; }
        if (this.y > canvas.height) { this.y = canvas.height; this.vy *= -0.9; }
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${accentColor}, 0.85)`;
        ctx.fill();
        // Removed shadowBlur to fix performance lagging
      }
    }

    const initParticles = () => {
      particles = [];
      // Increased particle count by 10%
      const numParticles = window.innerWidth < 768 ? 44 : 99;
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      // Solid fill for better performance
      if (theme === 'dark') {
        ctx.fillStyle = '#0A0A0A';
      } else {
        ctx.fillStyle = '#F5F5F0';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].applyMouseGravity();
        
        // Draw connections and calculate gravity
        for (let j = i + 1; j < particles.length; j++) {
          particles[i].applyGravity(particles[j]);
          particles[j].applyGravity(particles[i]);
          
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distSq = dx * dx + dy * dy;
          
          if (distSq < interactionRadiusSq) {
            let dist = Math.sqrt(distSq);
            let opacity = 1 - (dist / interactionRadius);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${accentColor}, ${opacity * 0.45})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        particles[i].update();
        particles[i].draw(ctx);
      }

      // Note: Removed the custom drawn mouse cursor per user request
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default ParticleCanvas;

