import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import useLockBodyScroll from '@/lib/useLockBodyScroll';

export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') onClose(); 
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const root = document.getElementById('modal-root');
  if (!root) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="absolute inset-0 grid place-items-center p-4" aria-modal onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>,
    root
  );
}