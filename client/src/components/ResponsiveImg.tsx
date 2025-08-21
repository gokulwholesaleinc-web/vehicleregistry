export type Asset = { 
  sources: { url: string; width: number; type: string }[]; 
  placeholder?: string; 
};

export default function ResponsiveImg({ asset, alt = '' }: { asset: Asset; alt?: string }) {
  const webp = asset.sources.filter(s => s.type === 'webp');
  const srcset = webp.map(s => `${s.url} ${s.width}w`).join(', ');
  const src = webp[0]?.url || asset.sources[0]?.url || '';
  
  return (
    <img 
      src={src} 
      srcSet={srcset} 
      sizes="(max-width:768px) 100vw, 1024px" 
      alt={alt} 
      loading="lazy" 
      decoding="async" 
      className="w-full h-full object-contain" 
    />
  );
}