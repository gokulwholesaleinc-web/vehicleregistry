import { useLayoutEffect } from 'react';

export default function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    const { overflow, paddingRight } = getComputedStyle(document.body);
    if (locked) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [locked]);
}