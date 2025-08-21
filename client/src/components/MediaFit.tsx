import { useEffect, useRef, useState } from "react";

/**
 * Decides whether to use object-contain (no crop) or object-cover (fill) based on
 * natural aspect ratio vs container. Defaults to contain to avoid cutting cars.
 */
export default function MediaFit({ src, alt = "", className = "", bg = "#0b1220" }: { src: string; alt?: string; className?: string; bg?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<'contain'|'cover'>('contain');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
      const cr = (ref.current?.clientWidth || 1) / (ref.current?.clientHeight || 1);
      const ir = iw/ih;
      // If image is near container ratio, allow cover; else contain (avoid cropping)
      const close = Math.abs(ir - cr) < 0.25; // tolerance
      setFit(close ? 'cover' : 'contain');
    };
  }, [src]);

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden ${className}`} style={{backgroundColor: bg}}>
      {/* subtle blurred backdrop from the same image */}
      <img src={src} aria-hidden className="absolute inset-0 h-full w-full object-cover blur-sm opacity-30" />
      <img src={src} alt={alt} className={`relative z-10 h-full w-full object-${fit}`} />
    </div>
  );
}