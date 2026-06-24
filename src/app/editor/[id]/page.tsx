'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useProposals } from '@/lib/store-api';
import { ProtectedRoute } from '@/lib/protected-route';
import { Proposal } from '@/types';
import { useRouter } from 'next/navigation';
import AddPageModal from '@/components/AddPageModal';
import { StudioLoading } from '@/components/studio/StudioLoading';
import { StudioTopBar } from '@/components/studio/StudioTopBar';
import { StudioNavigator } from '@/components/studio/StudioNavigator';
import { StudioCanvas } from '@/components/studio/StudioCanvas';
import { StudioCoverPanel } from '@/components/studio/StudioCoverPanel';
import { StudioPortfolioPanel } from '@/components/studio/StudioPortfolioPanel';
import { StudioPageEditor } from '@/components/studio/StudioPageEditor';

export default function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    updateProposal,
    loading,
    addPage,
    updatePage: updatePageApi,
    togglePageVisibility: togglePageVisibilityApi,
    deletePage,
    reorderPages,
    getProposal,
  } = useProposals();
  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [activeSection, setActiveSection] = useState<'cover' | 'static' | string>('cover');
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const router = useRouter();
  const hasLoadedRef = useRef(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasSyncingRef = useRef(false);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingValuesRef = useRef<Record<string, unknown>>({});
  const saveGenerationRef = useRef<Record<string, number>>({});
  const savingFieldRef = useRef<Record<string, boolean>>({});
  const inFlightSavesRef = useRef(0);

  useEffect(() => {
    return () => {
      Object.values(saveTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const loadProposalDetails = async () => {
      if (hasLoadedRef.current) return;

      try {
        const fullProposal = await getProposal(id);
        if (fullProposal) {
          setProposal(fullProposal);
          hasLoadedRef.current = true;
        } else if (!loading) {
          router.push('/');
        }
      } catch (err) {
        console.error('Failed to load proposal:', err);
        router.push('/');
      }
    };

    if (!loading) {
      loadProposalDetails();
    }
  }, [id, loading, getProposal, router]);

  useEffect(() => {
    if (isSyncing) {
      wasSyncingRef.current = true;
      setShowSaved(false);
      return;
    }
    if (!wasSyncingRef.current) return;
    wasSyncingRef.current = false;
    setShowSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setShowSaved(false), 2500);
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, [isSyncing]);

  if (!proposal) {
    return (
      <ProtectedRoute>
        <StudioLoading />
      </ProtectedRoute>
    );
  }

  const refreshProposal = async () => {
    const updated = await getProposal(id);
    if (updated) setProposal(updated);
  };

  const handleUpdate = async (updates: Partial<Proposal>) => {
    await updateProposal(proposal.id, updates);
  };

  const updateCover = (field: string, value: string) => {
    const updatedCover = {
      preparedFor: proposal.cover?.preparedFor || '',
      preparedBy: proposal.cover?.preparedBy || '',
      projectType: proposal.cover?.projectType || '',
      date: proposal.cover?.date || '',
      subHeading: proposal.cover?.subHeading,
      [field]: value,
    };

    setProposal({
      ...proposal,
      cover: updatedCover,
      ...(field === 'language' && { language: value }),
    } as Proposal);

    const updates: Record<string, string> = {};
    if (field === 'preparedFor') updates.prepared_for = value;
    else if (field === 'preparedBy') updates.prepared_by = value;
    else if (field === 'projectType') updates.project_type = value;
    else if (field === 'date') updates.date = value;
    else if (field === 'language') updates.language = value;

    setTimeout(async () => {
      try {
        setIsSyncing(true);
        await handleUpdate(updates);
      } catch (error) {
        console.error('Failed to update cover:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 500);
  };

  const persistPageField = async (
    pageId: string,
    field: 'title' | 'content' | 'isVisible'
  ) => {
    const key = `${pageId}:${field}`;

    // Serialize saves per field so an older in-flight request can't win on the server.
    if (savingFieldRef.current[key]) return;
    savingFieldRef.current[key] = true;

    const generationAtSave = saveGenerationRef.current[key] ?? 0;
    const value = pendingValuesRef.current[key];
    if (value === undefined) {
      savingFieldRef.current[key] = false;
      return;
    }

    const updates: Record<string, unknown> = {};
    if (field === 'title') updates.title = value;
    else if (field === 'content') updates.content = value;
    else if (field === 'isVisible') updates.is_visible = value;

    inFlightSavesRef.current += 1;
    setIsSyncing(true);
    try {
      await updatePageApi(pageId, updates);
    } catch (error) {
      console.error('Failed to save page field:', field, error);
      // Never reload the whole proposal here — that reverts in-progress edits.
    } finally {
      savingFieldRef.current[key] = false;
      inFlightSavesRef.current -= 1;
      if (inFlightSavesRef.current <= 0) {
        inFlightSavesRef.current = 0;
        setIsSyncing(false);
      }

      // User kept typing (or cleared the field) while this save was in flight.
      if ((saveGenerationRef.current[key] ?? 0) !== generationAtSave) {
        void persistPageField(pageId, field);
      }
    }
  };

  const schedulePageSave = (
    pageId: string,
    field: 'title' | 'content' | 'isVisible',
    delayMs: number
  ) => {
    const key = `${pageId}:${field}`;
    if (saveTimersRef.current[key]) clearTimeout(saveTimersRef.current[key]);

    if (delayMs === 0) {
      void persistPageField(pageId, field);
      return;
    }

    saveTimersRef.current[key] = setTimeout(() => {
      delete saveTimersRef.current[key];
      void persistPageField(pageId, field);
    }, delayMs);
  };

  const flushPageSave = (pageId: string, field: 'title' | 'content') => {
    const key = `${pageId}:${field}`;
    if (saveTimersRef.current[key]) {
      clearTimeout(saveTimersRef.current[key]);
      delete saveTimersRef.current[key];
    }
    void persistPageField(pageId, field);
  };

  const updatePage = (pageId: string, field: string, value: unknown) => {
    const key = `${pageId}:${field}`;
    pendingValuesRef.current[key] = value;
    saveGenerationRef.current[key] = (saveGenerationRef.current[key] ?? 0) + 1;

    // Functional update so concurrent title/content edits never clobber each other.
    setProposal((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((p) =>
          p.id === pageId ? { ...p, [field]: value } : p
        ),
      };
    });

    if (field === 'title') {
      schedulePageSave(pageId, 'title', 600);
    } else if (field === 'content') {
      schedulePageSave(pageId, 'content', 1000);
    } else if (field === 'isVisible') {
      schedulePageSave(pageId, 'isVisible', 0);
    }
  };

  const togglePageVisibility = async (pageId: string) => {
    await togglePageVisibilityApi(pageId);
    await refreshProposal();
  };

  const handleAddPage = async (type: string, title: string, content: string) => {
    try {
      setIsSyncing(true);
      await addPage(proposal.id, type, title, content);
      await refreshProposal();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Delete this page from the proposal?')) return;
    try {
      setIsSyncing(true);
      await deletePage(proposal.id, pageId);
      if (activeSection === pageId) setActiveSection('cover');
      await refreshProposal();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReorderPage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= proposal.pages.length) return;
    try {
      setIsSyncing(true);
      await reorderPages(proposal.id, index, newIndex);
      await refreshProposal();
    } finally {
      setIsSyncing(false);
    }
  };

  const activePageTitle =
    activeSection === 'cover'
      ? 'Cover page'
      : activeSection === 'static'
        ? 'Portfolio showcase'
        : proposal.pages.find((p) => p.id === activeSection)?.title || 'Page';

  const clientLabel = proposal.cover?.preparedFor || proposal.prepared_for || 'Untitled';
  const isContentPage = !['cover', 'static'].includes(activeSection);
  const activePage = proposal.pages.find((p) => p.id === activeSection);

  const deckPosition =
    activeSection === 'cover'
      ? 'Cover · Page 1'
      : activeSection === 'static'
        ? 'Portfolio · Slides 2–13'
        : `Page ${proposal.pages.findIndex((p) => p.id === activeSection) + 14}`;

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0f1219]">
        <StudioTopBar
          clientName={clientLabel}
          activeTitle={activePageTitle}
          activeBadge={deckPosition}
          proposalId={proposal.id}
          isSyncing={isSyncing}
          showSaved={showSaved}
        />

        <div className="flex flex-1 min-h-0">
          <StudioNavigator
            proposal={proposal}
            activeSection={activeSection}
            onSelect={setActiveSection}
            onAddPage={() => setIsAddPageModalOpen(true)}
            onReorderPage={handleReorderPage}
            onToggleVisibility={togglePageVisibility}
            onDeletePage={handleDeletePage}
          />

          <div className="flex-1 min-w-0 flex flex-col bg-[#e9ecf2]">
            <div className="flex-1 min-h-0 flex flex-col">
            {activeSection === 'cover' && (
              <StudioCoverPanel proposal={proposal} onUpdateCover={updateCover} />
            )}

            {activeSection === 'static' && (
              <StudioCanvas centered={false}>
                <StudioPortfolioPanel
                  proposal={proposal}
                  onToggleShowcase={() => handleUpdate({ includeShowcase: !proposal.includeShowcase })}
                />
              </StudioCanvas>
            )}

            {isContentPage && activePage && (
              <StudioPageEditor
                page={activePage}
                onTitleChange={(value) => updatePage(activePage.id, 'title', value)}
                onTitleCommit={() => flushPageSave(activePage.id, 'title')}
                onContentChange={(html) => updatePage(activePage.id, 'content', html)}
              />
            )}
            </div>

            <footer className="shrink-0 h-7 flex items-center justify-between px-4 bg-white border-t border-[#e2e8f0] text-[11px] text-[#94a3b8]">
              <span className="font-medium text-[#64748b]">{deckPosition}</span>
              <span className="tabular-nums">A4 · 210 × 297 mm</span>
            </footer>
          </div>
        </div>

        <AddPageModal
          isOpen={isAddPageModalOpen}
          onClose={() => setIsAddPageModalOpen(false)}
          onAddPage={handleAddPage}
          language={proposal.language}
        />
      </div>
    </ProtectedRoute>
  );
}
