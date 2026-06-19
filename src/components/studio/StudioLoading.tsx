'use client';

export function StudioLoading() {
  return (
    <div className="studio-loading min-h-screen flex flex-col items-center justify-center bg-[#0f1219]">
      <div className="relative mb-8">
        <div className="studio-loading-ring" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#252E5D] to-[#0230F5]" />
        </div>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/40 mb-2">
        Clicks Studio
      </p>
      <p className="text-sm text-white/70">Opening your proposal…</p>
    </div>
  );
}
