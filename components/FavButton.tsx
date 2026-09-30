'use client';

import { useEffect, useState } from 'react';
import { isFav, toggleFav } from '@/lib/storage';

export function FavButton({ slug, title }: { slug: string; title: string }) {
  const [fav, setFav] = useState(false);
  const [popKey, setPopKey] = useState(0);
  useEffect(() => {
    setFav(isFav(slug));
  }, [slug]);
  return (
    <button
      onClick={() => {
        setFav(toggleFav(slug).includes(slug));
        setPopKey((k) => k + 1);
      }}
      className="icon-btn"
      aria-label={fav ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      aria-pressed={fav}
      title="Favorite"
    >
      <span key={popKey} className={popKey > 0 ? 'pop' : undefined}>
        {fav ? '♥' : '♡'}
      </span>
    </button>
  );
}
