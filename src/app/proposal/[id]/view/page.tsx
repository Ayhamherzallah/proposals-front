'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useProposals } from '@/lib/store-api';
import { ProtectedRoute } from '@/lib/protected-route';
import { Proposal } from '@/types';
import { ProposalCover } from '@/components/ProposalCover';
import { StaticSlide } from '@/components/StaticSlide';
import { DynamicPage } from '@/components/DynamicPage';
import { 
  ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, 
  Maximize2, Minimize2, FileText, Home
} from 'lucide-react';

export default function ProposalViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getProposal, loading } = useProposals();
  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const hasLoadedRef = useRef(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  if (!proposal) return <div className="p-20 text-center print:hidden">Loading Proposal...</div>;

  const totalPages = 1 + (proposal.includeShowcase ? 12 : 0) + proposal.pages.filter(p => p.isVisible).length;
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoom(100);
  
  const scrollToPage = (pageNum: number) => {
    const pageElement = pageRefs.current[pageNum - 1];
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(pageNum);
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 print:bg-white print:p-0">
      
      {/* Professional Toolbar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 print:hidden">
        <div className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <div>
              <h1 className="text-lg font-bold text-gray-900">{proposal.cover?.preparedFor || 'Untitled'}</h1>
              <p className="text-xs text-gray-500">Proposal Preview</p>
            </div>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
              Page {currentPage} / {totalPages}
            </div>
            
            <button
              onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded hover:bg-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <span className="px-3 text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded hover:bg-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 rounded hover:bg-white transition-colors text-xs font-medium"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>

            {/* Thumbnails Toggle */}
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-2 rounded-lg transition-colors ${showThumbnails ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Toggle Thumbnails"
            >
              {showThumbnails ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {/* Download/Print */}
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex pt-16 print:pt-0 h-screen">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-lg print:hidden">
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Pages</h3>
              
              {/* Cover Thumbnail */}
              <button
                onClick={() => scrollToPage(1)}
                className={`w-full p-2 rounded-lg border-2 transition-all ${
                  currentPage === 1
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-xs font-medium text-gray-600 mb-2">Page 1</div>
                <div className="aspect-[210/297] bg-white rounded overflow-hidden shadow-sm border border-gray-200">
                  <div className="scale-[0.15] origin-top-left" style={{ width: '666.67%', height: '666.67%' }}>
                    <ProposalCover proposal={proposal} />
                  </div>
                </div>
              </button>

              {/* Static Slides Thumbnails */}
              {proposal.includeShowcase && Array.from({ length: 12 }, (_, i) => i + 2).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => scrollToPage(pageNum)}
                  className={`w-full p-2 rounded-lg border-2 transition-all ${
                    currentPage === pageNum
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-600 mb-2">Page {pageNum}</div>
                  <div className="aspect-[210/297] bg-white rounded overflow-hidden shadow-sm border border-gray-200">
                    <div className="scale-[0.15] origin-top-left" style={{ width: '666.67%', height: '666.67%' }}>
                      <StaticSlide index={pageNum} />
                    </div>
                  </div>
                </button>
              ))}

              {/* Dynamic Pages Thumbnails */}
              {proposal.pages.filter(p => p.isVisible).map((page, idx) => {
                const pageNum = 1 + (proposal.includeShowcase ? 12 : 0) + idx + 1;
                return (
                  <button
                    key={page.id}
                    onClick={() => scrollToPage(pageNum)}
                    className={`w-full p-2 rounded-lg border-2 transition-all ${
                      currentPage === pageNum
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-600 mb-2 truncate">Page {pageNum}</div>
                    <div className="aspect-[210/297] bg-white rounded overflow-hidden shadow-sm border border-gray-200">
                      <div className="scale-[0.15] origin-top-left" style={{ width: '666.67%', height: '666.67%' }}>
                        <DynamicPage page={page} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pages Container - Fixed height with scroll */}
        <div 
          className={`flex-1 overflow-y-auto print:overflow-visible ${showThumbnails ? 'ml-64' : ''} transition-all`}
          style={{ 
            height: 'calc(100vh - 4rem)',
          }}
        >
          <div 
            className="p-8 print:p-0"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease'
            }}
          >
            <div className="max-w-[210mm] mx-auto space-y-8 print:space-y-0">
              {/* Page 1: Cover */}
              <div ref={el => { pageRefs.current[0] = el; }}>
                <ProposalCover proposal={proposal} />
              </div>

              {/* Pages 2-13: Static Slides */}
              {proposal.includeShowcase && Array.from({ length: 12 }, (_, i) => i + 2).map((num, idx) => (
                <div key={num} ref={el => { pageRefs.current[num - 1] = el; }}>
                  <StaticSlide index={num} />
                </div>
              ))}

              {/* Dynamic Pages */}
              {proposal.pages.filter(p => p.isVisible).map((page, idx) => {
                const pageNum = 1 + (proposal.includeShowcase ? 12 : 0) + idx + 1;
                return (
                  <div key={page.id} ref={el => { pageRefs.current[pageNum - 1] = el; }}>
                    <DynamicPage page={page} />
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
