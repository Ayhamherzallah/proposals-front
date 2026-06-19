'use client';

import { Proposal } from '@/types';
import { ProposalCover } from '@/components/ProposalCover';

interface StudioCoverPanelProps {
  proposal: Proposal;
  onUpdateCover: (field: string, value: string) => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#1e293b] outline-none transition-all placeholder:text-[#cbd5e1] focus:border-[#0230F5] focus:ring-4 focus:ring-[#0230F5]/10';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#334155] mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] text-[#94a3b8]">{hint}</p>}
    </div>
  );
}

export function StudioCoverPanel({ proposal, onUpdateCover }: StudioCoverPanelProps) {
  const preparedFor = proposal.cover?.preparedFor ?? proposal.prepared_for ?? '';
  const projectType = proposal.cover?.projectType ?? proposal.project_type ?? '';
  const preparedBy = proposal.cover?.preparedBy ?? proposal.prepared_by ?? '';
  const date = proposal.cover?.date ?? proposal.date ?? '';

  return (
    <div className="flex-1 flex min-h-0">
      {/* Canvas — cover preview as the hero */}
      <div className="flex-1 min-w-0 overflow-auto studio-canvas px-6 py-10 flex flex-col items-center">
        <div className="mb-3 flex items-center justify-between w-[520px] max-w-full">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94a3b8]">
            Live cover preview
          </span>
          <span className="text-[10px] text-[#cbd5e1]">A4 · Page 1</span>
        </div>
        <div
          className="relative overflow-hidden rounded-sm shrink-0 shadow-[0_20px_60px_-12px_rgba(15,23,42,0.28)] ring-1 ring-black/5"
          style={{ width: 520, height: 735 }}
        >
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{ width: '210mm', transform: 'scale(0.6552)' }}
          >
            <ProposalCover proposal={proposal} />
          </div>
        </div>
      </div>

      {/* Inspector — comfortable, uncompressed form */}
      <aside className="w-[360px] shrink-0 flex flex-col bg-white border-l border-[#e2e8f0]">
        <div className="px-5 py-4 border-b border-[#eef1f6]">
          <h3 className="text-[15px] font-semibold text-[#0f172a]">Cover details</h3>
          <p className="text-[12px] text-[#64748b] mt-0.5">
            Shown on the opening page of the proposal.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Field label="Client name" hint="Appears as the main headline on the cover.">
            <input
              type="text"
              value={preparedFor}
              onChange={(e) => onUpdateCover('preparedFor', e.target.value)}
              className={inputClass}
              placeholder="e.g. Telegraph"
            />
          </Field>

          <Field label="Project type">
            <input
              type="text"
              value={projectType}
              onChange={(e) => onUpdateCover('projectType', e.target.value)}
              className={inputClass}
              placeholder="e.g. Brand Identity"
            />
          </Field>

          <Field label="Prepared by">
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => onUpdateCover('preparedBy', e.target.value)}
              className={inputClass}
              placeholder="Clicks Digitals"
            />
          </Field>

          <Field label="Date">
            <input
              type="text"
              value={date}
              onChange={(e) => onUpdateCover('date', e.target.value)}
              className={inputClass}
              placeholder="June 2026"
            />
          </Field>

          <Field label="Document language">
            <select
              value={proposal.language || 'en'}
              onChange={(e) => onUpdateCover('language', e.target.value)}
              className={inputClass}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </Field>
        </div>
      </aside>
    </div>
  );
}
