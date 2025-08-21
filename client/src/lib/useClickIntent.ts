import { useRef } from 'react';

export default function useClickIntent({ maxMove = 6, maxMs = 300 } = {}) {
  const start = useRef<{x: number; y: number; t: number} | null>(null);
  
  function onPointerDown(e: React.PointerEvent) { 
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() }; 
  }
  
  function onPointerUp(e: React.PointerEvent) {
    const s = start.current; 
    start.current = null; 
    if (!s) return false;
    const dx = Math.abs(e.clientX - s.x), dy = Math.abs(e.clientY - s.y);
    const dt = Date.now() - s.t;
    return dx <= maxMove && dy <= maxMove && dt <= maxMs;
  }
  
  return { onPointerDown, onPointerUp };
}