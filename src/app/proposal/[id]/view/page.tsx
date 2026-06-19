'use client';

import { use, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useProposals } from '@/lib/store-api';
import { ProtectedRoute } from '@/lib/protected-route';
import { Proposal } from '@/types';
import { ProposalCover } from '@/components/ProposalCover';
import { StaticSlide } from '@/components/StaticSlide';
import { DynamicPage } from '@/components/DynamicPage';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  PanelLeftClose,
  PanelLeft,
  Minus,
  Plus,
} from 'lucide-react';

type PageEntry = {
  num: number;
  physStart: number;
  physCount: number;
  label: string;
  type: 'cover' | 'slide' | 'content';
  pageId?: string;
};

export default function ProposalViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getProposal, loading } = useProposals();
  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [zoom, setZoom] = useState(85);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chunkCounts, setChunkCounts] = useState<Record<string, number>>({});
  const hasLoadedRef = useRef(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProposal = async () => {
      if (hasLoadedRef.current || loading) return;
      const p = await getProposal(id);
      if (p) {
        setProposal(p);
        hasLoadedRef.current = true;
      }
    };
    loadProposal();
  }, [id, loading, getProposal]);

  const handlePaginated = useCallback((pageId: string, count: number) => {
    setChunkCounts((prev) => (prev[pageId] === count ? prev : { ...prev, [pageId]: count }));
  }, []);

  const { pageList, totalPhysical } = useMemo(() => {
    if (!proposal) return { pageList: [] as PageEntry[], totalPhysical: 0 };
    const list: PageEntry[] = [];
    let logical = 0;
    let phys = 0;

    logical += 1;
    phys += 1;
    list.push({ num: logical, physStart: phys, physCount: 1, label: 'Cover', type: 'cover' });

    if (proposal.includeShowcase) {
      for (let i = 0; i < 12; i++) {
        logical += 1;
        phys += 1;
        list.push({
          num: logical,
          physStart: phys,
          physCount: 1,
          label: `Portfolio ${i + 1}`,
          type: 'slide',
        });
      }
    }

    proposal.pages
      .filter((p) => p.isVisible)
      .forEach((p) => {
        logical += 1;
        const count = chunkCounts[p.id] ?? 1;
        list.push({
          num: logical,
          physStart: phys + 1,
          physCount: count,
          label: p.title,
          type: 'content',
          pageId: p.id,
        });
        phys += count;
      });

    return { pageList: list, totalPhysical: phys };
  }, [proposal, chunkCounts]);

  const totalPages = totalPhysical;

  const contentMeta = useMemo(() => {
    const m: Record<string, { physStart: number; logicalNum: number }> = {};
    pageList.forEach((e) => {
      if (e.type === 'content' && e.pageId) {
        m[e.pageId] = { physStart: e.physStart, logicalNum: e.num };
      }
    });
    return m;
  }, [pageList]);

  const currentPhysical = pageList[currentPage - 1]?.physStart ?? currentPage;

  const scrollToPage = (pageNum: number) => {
    pageRefs.current[pageNum - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentPage(pageNum);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = pageRefs.current.indexOf(visible.target as HTMLDivElement);
          if (idx >= 0) setCurrentPage(idx + 1);
        }
      },
      { root: container, threshold: [0.4, 0.6] }
    );

    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [proposal]);

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef1f6] print:hidden">
        <div className="w-8 h-8 border-2 border-[#252E5D]/20 border-t-[#252E5D] rounded-full animate-spin" />
      </div>
    );
  }

  const clientName = proposal.cover?.preparedFor || proposal.prepared_for || 'Untitled';

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[#eef1f6] print:bg-white print:h-auto">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-white border-b border-[#dde3ed] flex items-center justify-between px-4 print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-[#64748b] hover:bg-[#f1f4f9] hover:text-[#1e293b]"
              title={sidebarOpen ? 'Hide pages' : 'Show pages'}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1e293b] truncate">{clientName}</p>
              <p className="text-[11px] text-[#94a3b8]">Document preview</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <button
                onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md text-[#64748b] hover:bg-[#f1f4f9] disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-medium text-[#64748b] tabular-nums min-w-[72px] text-center">
                {currentPhysical} / {totalPages}
              </span>
              <button
                onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md text-[#64748b] hover:bg-[#f1f4f9] disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center border border-[#dde3ed] rounded-lg overflow-hidden bg-[#fafbfd]">
              <button
                onClick={() => setZoom((z) => Math.max(z - 10, 50))}
                className="px-2.5 py-1.5 text-[#64748b] hover:bg-white"
              >
                <Minus size={14} />
              </button>
              <span className="px-2 text-xs font-medium text-[#64748b] tabular-nums min-w-[44px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(z + 10, 150))}
                className="px-2.5 py-1.5 text-[#64748b] hover:bg-white"
              >
                <Plus size={14} />
              </button>
            </div>

            <Link
              href={`/editor/${proposal.id}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dde3ed] text-sm text-[#475569] hover:bg-[#f8fafc] transition-colors"
            >
              <Pencil size={14} />
              Edit
            </Link>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252E5D] hover:bg-[#1e2860] text-white text-sm font-medium transition-colors"
            >
              <Download size={14} />
              Export PDF
            </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 print:block">
          {/* Page navigator */}
          {sidebarOpen && (
            <aside className="w-[240px] shrink-0 bg-[#252E5D] text-white overflow-y-auto print:hidden">
              <div className="p-4 border-b border-white/10">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  Pages
                </p>
              </div>
              <nav className="p-2 space-y-0.5">
                {pageList.map((page) => (
                  <button
                    key={page.num}
                    onClick={() => scrollToPage(page.num)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      currentPage === page.num
                        ? 'bg-white/15 text-white font-medium'
                        : 'text-white/65 hover:bg-white/8 hover:text-white/90'
                    }`}
                  >
                    <span className="text-[10px] text-white/40 mr-2 tabular-nums">
                      {String(page.physStart).padStart(2, '0')}
                    </span>
                    <span className="truncate">{page.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* Canvas */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto print:overflow-visible">
            <div
              className="py-10 px-6 proposal-preview-scale print:p-0 print:py-0"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              <div className="max-w-[210mm] mx-auto space-y-10 print:space-y-0">
                <div ref={(el) => { pageRefs.current[0] = el; }}>
                  <ProposalCover proposal={proposal} />
                </div>

                {proposal.includeShowcase &&
                  Array.from({ length: 12 }, (_, i) => i + 2).map((num) => (
                    <div key={num} ref={(el) => { pageRefs.current[num - 1] = el; }}>
                      <StaticSlide index={num} />
                    </div>
                  ))}

                {proposal.pages
                  .filter((p) => p.isVisible)
                  .map((page) => {
                    const meta = contentMeta[page.id];
                    const logicalNum = meta?.logicalNum ?? 1;
                    return (
                      <div key={page.id} ref={(el) => { pageRefs.current[logicalNum - 1] = el; }}>
                        <DynamicPage
                          page={page}
                          startPageNumber={meta?.physStart}
                          totalPages={totalPages}
                          onPaginated={handlePaginated}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
