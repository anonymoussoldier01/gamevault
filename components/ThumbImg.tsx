'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ThumbImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  if (src.endsWith('.svg')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" draggable={false} className={className} onError={() => setErr(true)} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      loading="lazy"
      draggable={false}
      className={className}
      onError={() => setErr(true)}
    />
  );
}
