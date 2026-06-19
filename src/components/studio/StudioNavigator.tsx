'use client';

import Link from 'next/link';
import {
  ChevronUp,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  FileSignature,
  FileText,
  Image as ImageIcon,
  Layout,
  ListChecks,
  MoreHorizontal,
  Plus,
  Receipt,
  StickyNote,
  Trash2,
  Wallet,
  Workflow,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Proposal, ProposalContentPage } from '@/types';

interface StudioNavigatorProps {
  proposal: Proposal;
  activeSection: 'cover' | 'static' | string;
  onSelect: (section: 'cover' | 'static' | string) => void;
  onAddPage: () => void;
  onReorderPage: (index: number, direction: 'up' | 'down') => void;
  onToggleVisibility: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
}

function pageIcon(type: string, title: string): React.ElementType {
  const t = (type || '').toLowerCase();
  const name = (title || '').toLowerCase();
  if (t === 'process' || name.includes('process')) return Workflow;
  if (t === 'requirements' || name.includes('requirement')) return ListChecks;
  if (t === 'timeline' || name.includes('timeline')) return Clock;
  if (t === 'investment' || name.includes('invest') || name.includes('pricing')) return Wallet;
  if (t === 'fees' || name.includes('fee')) return Receipt;
  if (t === 'agreement' || name.includes('agreement') || name.includes('terms')) return FileSignature;
  if (t === 'notes' || name.includes('note')) return StickyNote;
  return FileText;
}

function StructureItem({
  active,
  icon: Icon,
  label,
  meta,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition-colors ${
        active ? 'bg-[#252E5D] text-white shadow-sm' : 'text-[#cbd5e1] hover:bg-white/[0.05] hover:text-white'
      }`}
    >
      <span
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          active ? 'bg-white/15' : 'bg-white/[0.06]'
        }`}
      >
        <Icon size={16} className={active ? 'text-white' : 'text-white/55'} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-medium truncate">{label}</span>
        <span className={`block text-[11px] ${active ? 'text-white/60' : 'text-white/35'}`}>{meta}</span>
      </span>
    </button>
  );
}

function PageRow({
  active,
  index,
  total,
  page,
  pageNum,
  onSelect,
  onReorder,
  onToggle,
  onDelete,
}: {
  active: boolean;
  index: number;
  total: number;
  page: ProposalContentPage;
  pageNum: number;
  onSelect: () => void;
  onReorder: (direction: 'up' | 'down') => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = page.isVisible !== false && page.is_visible !== false;
  const Icon = pageIcon(page.type, page.title);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="group relative" ref={ref}>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex items-center gap-2.5 pl-2.5 pr-9 py-2 rounded-lg text-left transition-colors ${
          active ? 'bg-[#252E5D] text-white shadow-sm' : 'text-[#cbd5e1] hover:bg-white/[0.05] hover:text-white'
        } ${!isVisible ? 'opacity-45' : ''}`}
      >
        <Icon size={15} className={`shrink-0 ${active ? 'text-white' : 'text-white/45'}`} />
        <span className={`flex-1 text-[13px] truncate ${!isVisible ? 'line-through' : ''}`}>
          {page.title || 'Untitled'}
        </span>
        <span
          className={`shrink-0 text-[10px] tabular-nums font-medium ${
            active ? 'text-white/55' : 'text-white/30'
          }`}
        >
          {pageNum}
        </span>
      </button>

      {/* Kebab trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        className={`absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
          menuOpen
            ? 'bg-white/15 text-white opacity-100'
            : 'text-white/50 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100'
        }`}
        title="Page options"
      >
        <MoreHorizontal size={14} />
      </button>

      {menuOpen && (
        <div className="absolute right-1 top-9 z-30 w-44 py-1 rounded-lg bg-[#1e2433] border border-white/10 shadow-2xl">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => { e.stopPropagation(); onReorder('up'); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/75 hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronUp size={14} /> Move up
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={(e) => { e.stopPropagation(); onReorder('down'); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/75 hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronDown size={14} /> Move down
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-white/75 hover:bg-white/[0.06]"
          >
            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            {isVisible ? 'Hide from deck' : 'Show in deck'}
          </button>
          <div className="my-1 h-px bg-white/10" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={14} /> Delete page
          </button>
        </div>
      )}
    </div>
  );
}

export function StudioNavigator({
  proposal,
  activeSection,
  onSelect,
  onAddPage,
  onReorderPage,
  onToggleVisibility,
  onDeletePage,
}: StudioNavigatorProps) {
  const clientName = proposal.cover?.preparedFor || proposal.prepared_for || 'Untitled proposal';
  const projectType = proposal.cover?.projectType || proposal.project_type || 'Proposal';
  const visiblePages = proposal.pages.filter(
    (p) => p.isVisible !== false && p.is_visible !== false
  ).length;
  const totalDeckPages = 1 + (proposal.includeShowcase ? 12 : 0) + visiblePages;

  return (
    <aside className="w-[260px] shrink-0 flex flex-col bg-[#13161f] border-r border-black/40">
      {/* Document header */}
      <div className="px-4 pt-4 pb-3.5 border-b border-white/[0.06]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-1.5">
          Document
        </p>
        <h2 className="text-[15px] font-semibold text-white leading-snug truncate" title={clientName}>
          {clientName}
        </h2>
        <p className="text-[12px] text-white/40 truncate mt-0.5">{projectType}</p>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-2.5 py-4 space-y-5">
        <section>
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
            Structure
          </p>
          <div className="space-y-1">
            <StructureItem
              active={activeSection === 'cover'}
              icon={Layout}
              label="Cover"
              meta="Page 1"
              onClick={() => onSelect('cover')}
            />
            <StructureItem
              active={activeSection === 'static'}
              icon={ImageIcon}
              label="Portfolio"
              meta={proposal.includeShowcase ? 'Slides 2–13 · on' : 'Slides 2–13 · off'}
              onClick={() => onSelect('static')}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
              Content pages
            </p>
            <span className="text-[10px] font-medium text-white/30 tabular-nums px-1.5 py-0.5 rounded bg-white/[0.05]">
              {proposal.pages.length}
            </span>
          </div>

          <div className="space-y-0.5">
            {proposal.pages.map((page, index) => (
              <PageRow
                key={page.id}
                active={activeSection === page.id}
                index={index}
                total={proposal.pages.length}
                page={page}
                pageNum={index + 14}
                onSelect={() => onSelect(page.id)}
                onReorder={(dir) => onReorderPage(index, dir)}
                onToggle={() => onToggleVisibility(page.id)}
                onDelete={() => onDeletePage(page.id)}
              />
            ))}

            {proposal.pages.length === 0 && (
              <p className="px-2 py-3 text-[12px] text-white/30">No content pages yet.</p>
            )}
          </div>

          <button
            type="button"
            onClick={onAddPage}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-white/[0.12] text-[12px] font-medium text-white/50 hover:text-white hover:border-[#0230F5]/60 hover:bg-[#0230F5]/10 transition-all"
          >
            <Plus size={14} />
            Add page
          </button>
        </section>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.06] space-y-2.5">
        <div className="flex items-center justify-between px-1 text-[11px]">
          <span className="text-white/35">Deck length</span>
          <span className="font-semibold text-white/70 tabular-nums">{totalDeckPages} pages</span>
        </div>
        <Link
          href={`/proposal/${proposal.id}/view`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[13px] font-medium text-white/75 hover:text-white transition-colors"
        >
          <Eye size={15} />
          Open full preview
        </Link>
      </div>
    </aside>
  );
}
