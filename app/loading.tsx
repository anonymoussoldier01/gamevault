import { GameGridSkeleton } from '@/components/GameGrid';

export default function Loading() {
  return (
    <div>
      <div className="skel mx-auto h-10 w-64 rounded-full" />
      <div className="mt-6">
        <GameGridSkeleton count={12} />
      </div>
    </div>
  );
}
