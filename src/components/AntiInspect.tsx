"use client";
import { useEffect } from 'react';

export default function AntiInspect() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return; // Allow inspect in dev mode

    // 1. Disable Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, etc.)
    const handleKeyDown = (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl/Cmd + Shift + I/J/C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key === 'I' || e.key === 'i' || e.keyCode === 73 || 
            e.key === 'J' || e.key === 'j' || e.keyCode === 74 ||
            e.key === 'C' || e.key === 'c' || e.keyCode === 67) {
          e.preventDefault();
          return false;
        }
      }

      // Ctrl/Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
    };

    // 3. DevTools Detection trick (basic size check)
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        console.warn("Security Warning");
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', detectDevTools);
    
    // Clear console continuously
    const clearConsole = setInterval(() => {
      console.clear();
      console.log("%cStop!", "color: red; font-size: 50px; font-weight: bold;");
      console.log("%cThis is a secured application. Inspecting the source code is prohibited.", "font-size: 18px;");
    }, 1000);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', detectDevTools);
      clearInterval(clearConsole);
    };
  }, []);

  return null;
}
