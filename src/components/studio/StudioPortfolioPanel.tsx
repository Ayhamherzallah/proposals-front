'use client';

import { Proposal } from '@/types';
import { Layers } from 'lucide-react';

interface StudioPortfolioPanelProps {
  proposal: Proposal;
  onToggleShowcase: () => void;
}

export function StudioPortfolioPanel({ proposal, onToggleShowcase }: StudioPortfolioPanelProps) {
  const enabled = !!proposal.includeShowcase;

  return (
    <div className="w-full">
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#94a3b8] mb-1">
          Portfolio
        </p>
        <h3 className="text-xl font-semibold text-[#1e293b]">Showcase slides</h3>
        <p className="text-sm text-[#64748b] mt-1">
          Include your branded portfolio pages between the cover and custom content.
        </p>
      </div>

      <div className="studio-panel p-5 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#252E5D] to-[#0230F5] flex items-center justify-center shrink-0">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1e293b]">Include portfolio section</h4>
            <p className="text-xs text-[#64748b] mt-0.5">Slides 2–13 · company showcase & credentials</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleShowcase}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
            enabled ? 'bg-gradient-to-r from-[#252E5D] to-[#0230F5]' : 'bg-[#cbd5e1]'
          }`}
          aria-pressed={enabled}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
              enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`studio-slide-thumb aspect-[3/4] rounded-xl border flex flex-col items-center justify-center transition-all ${
              enabled
                ? 'border-[#e2e8f0] bg-white shadow-sm text-[#64748b]'
                : 'border-[#eef1f6] bg-[#f8fafc] text-[#cbd5e1] opacity-60'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-1">
              Slide
            </span>
            <span className="text-lg font-bold">{i + 2}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
