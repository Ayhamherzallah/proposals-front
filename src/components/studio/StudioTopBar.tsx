'use client';

import Link from 'next/link';
import { ArrowLeft, Check, ExternalLink, Loader2 } from 'lucide-react';

interface StudioTopBarProps {
  clientName: string;
  activeTitle: string;
  activeBadge?: string;
  proposalId: string;
  isSyncing: boolean;
  showSaved?: boolean;
}

export function StudioTopBar({
  clientName,
  activeTitle,
  activeBadge,
  proposalId,
  isSyncing,
  showSaved,
}: StudioTopBarProps) {
  return (
    <header className="shrink-0 h-12 flex items-center justify-between pl-2 pr-3 bg-[#13161f] border-b border-black/40">
      {/* Left: navigation + brand */}
      <div className="flex items-center gap-1 min-w-0">
        <Link
          href="/"
          className="group flex items-center gap-1.5 h-8 pl-2 pr-2.5 rounded-lg text-white/55 hover:text-white hover:bg-white/[0.07] transition-colors"
          title="Back to all proposals"
        >
          <ArrowLeft size={16} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline text-[13px] font-medium">Proposals</span>
        </Link>

        <div className="mx-2 h-5 w-px bg-white/10 shrink-0" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-linear-to-br from-[#252E5D] to-[#0230F5] flex items-center justify-center shrink-0 ring-1 ring-white/10">
            <span className="text-white text-[11px] font-bold leading-none">C</span>
          </div>
          <div className="min-w-0 flex items-baseline gap-1.5 text-[13px]">
            <span className="truncate font-semibold text-white/90 max-w-[110px] sm:max-w-[200px]">
              {clientName}
            </span>
            <span className="text-white/20 shrink-0">/</span>
            <span className="truncate text-white/55 max-w-[120px] sm:max-w-[260px]">{activeTitle}</span>
            {activeBadge && (
              <span className="hidden md:inline shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide text-white/45 bg-white/[0.06]">
                {activeBadge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: status + actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
            isSyncing ? 'text-white/50' : showSaved ? 'text-emerald-400' : 'text-white/30'
          }`}
        >
          {isSyncing ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span className="hidden sm:inline">Saving…</span>
            </>
          ) : showSaved ? (
            <>
              <Check size={13} />
              <span className="hidden sm:inline">Saved</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
              <span className="hidden sm:inline">All changes saved</span>
            </>
          )}
        </span>

        <div className="h-5 w-px bg-white/10" />

        <Link
          href={`/proposal/${proposalId}/view`}
          target="_blank"
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[#0230F5] hover:bg-[#0228d4] text-white text-[13px] font-semibold shadow-sm shadow-[#0230F5]/30 transition-colors"
        >
          <ExternalLink size={14} />
          Preview
        </Link>
      </div>
    </header>
  );
}
