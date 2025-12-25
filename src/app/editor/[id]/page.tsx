'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useProposals } from '@/lib/store-api';
import { ProtectedRoute } from '@/lib/protected-route';
import { Proposal } from '@/types';
import { ArrowLeft, Save, Eye, Layout, Type, Image as ImageIcon, Plus, CheckCircle2, ChevronRight, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ProcessEditor } from '@/components/ProcessEditor';
import AddPageModal from '@/components/AddPageModal';
import { SyncIndicator } from '@/components/SyncIndicator';
import { AIRequirementsGenerator } from '@/components/AIRequirementsGenerator';

export default function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { proposals, updateProposal, loading, addPage, updatePage: updatePageApi, togglePageVisibility: togglePageVisibilityApi, deletePage, reorderPages, getProposal } = useProposals();
  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [activeSection, setActiveSection] = useState<'cover' | 'static' | string>('cover');
  const [isEditingClientName, setIsEditingClientName] = useState(false);
  const [tempClientName, setTempClientName] = useState('');
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const hasLoadedRef = useRef(false);

  // Load full proposal from API on mount
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

  if (!proposal) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading Studio...</div>;

  const refreshProposal = async () => {
    const updated = await getProposal(id);
    if (updated) {
      setProposal(updated);
    }
  };

  const handleUpdate = async (updates: Partial<Proposal>) => {
    await updateProposal(proposal.id, updates);
    // Don't refresh immediately - it causes input lag
  };

  const updateCover = (field: string, value: string) => {
    if (!proposal) return;
    
    // Immediate local update for responsive UI
    const updatedCover = { 
      preparedFor: proposal.cover?.preparedFor || '',
      preparedBy: proposal.cover?.preparedBy || '',
      projectType: proposal.cover?.projectType || '',
      date: proposal.cover?.date || '',
      subHeading: proposal.cover?.subHeading,
      [field]: value 
    };
    setProposal({ ...proposal, cover: updatedCover });
    
    // Debounce API call - save after user stops typing
    const updates: any = {};
    if (field === 'preparedFor') updates.prepared_for = value;
    else if (field === 'preparedBy') updates.prepared_by = value;
    else if (field === 'projectType') updates.project_type = value;
    else if (field === 'date') updates.date = value;
    
    // Save to backend without blocking UI
    setTimeout(async () => {
      try {
        setIsSyncing(true);
        await handleUpdate(updates);
      } catch (error) {
        console.error('Failed to update cover:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 800);
  };

  const updatePage = async (pageId: string, field: string, value: any) => {
    if (!proposal) return;
    
    console.log('[updatePage] Called with:', { pageId, field, valueLength: value?.length });
    
    // Optimistic update - update local state immediately
    const updatedPages = proposal.pages.map(p =>
      p.id === pageId ? { ...p, [field]: value } : p
    );
    setProposal({ ...proposal, pages: updatedPages });
    
    console.log('[updatePage] Local state updated');
    
    // Save to backend
    const updates: any = {};
    if (field === 'title') updates.title = value;
    else if (field === 'content') updates.content = value;
    else if (field === 'isVisible') updates.is_visible = value;
    
    try {
      setIsSyncing(true);
      await updatePageApi(pageId, updates);
      // Only refresh if it's not a title/content change (to avoid interrupting typing)
      if (field !== 'title' && field !== 'content') {
        await refreshProposal();
      }
    } catch (error) {
      // On error, refresh to get correct state
      await refreshProposal();
    } finally {
      setIsSyncing(false);
    }
  };

  const togglePageVisibility = async (pageId: string) => {
    if (!proposal) return;
    await togglePageVisibilityApi(pageId);
    await refreshProposal();
  };

  const handleAddPage = async (type: string, title: string, content: string) => {
    if (!proposal) return;
    try {
      setIsSyncing(true);
      await addPage(proposal.id, type, title, content);
      await refreshProposal();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!proposal) return;
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        setIsSyncing(true);
        await deletePage(proposal.id, pageId);
        // If the deleted page was active, switch to cover
        if (activeSection === pageId) {
          setActiveSection('cover');
        }
        await refreshProposal();
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleReorderPage = async (index: number, direction: 'up' | 'down') => {
    if (!proposal) return;
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



  return (
    <ProtectedRoute>
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Modern Professional Sidebar */}
      <aside className="w-80 bg-gradient-to-b from-[#1A1A1D] to-[#0F0F11] text-gray-400 flex flex-col border-r border-[#2C2C2F]/50 shadow-2xl z-20">
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#2C2C2F]/50 shrink-0 bg-[#1C1C1F]/50 backdrop-blur-sm">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2.5 text-sm font-medium group">
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-white font-semibold">Dashboard</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar">
          {/* Project Basics */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-3 px-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              <span>Project Basics</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            </div>
            <button 
              onClick={() => setActiveSection('cover')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all group ${
                activeSection === 'cover' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30 scale-[1.02]' 
                  : 'hover:bg-[#2C2C2F]/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeSection === 'cover' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                <Layout size={16} />
              </div>
              <span className="flex-1">Cover Page</span>
              {activeSection === 'cover' && <ChevronRight size={16} className="animate-pulse" />}
            </button>
          </div>

          {/* Portfolio Showcase */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-3 px-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              <span>Portfolio</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            </div>
            <button 
              onClick={() => setActiveSection('static')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 transition-all group ${
                activeSection === 'static' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30 scale-[1.02]' 
                  : 'hover:bg-[#2C2C2F]/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeSection === 'static' ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                <ImageIcon size={16} />
              </div>
              <span className="flex-1">Static Slides (2-13)</span>
              {activeSection === 'static' && <ChevronRight size={16} className="animate-pulse" />}
            </button>
          </div>

          {/* Proposal Content */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-3 px-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
              <span>Content Pages</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            </div>
            <div className="space-y-1.5">
              {proposal?.pages?.map((page, index) => (
                <div 
                  key={page.id}
                  className={`group relative rounded-xl transition-all ${
                    activeSection === page.id 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-900/30 scale-[1.02]' 
                      : 'hover:bg-[#2C2C2F]/50'
                  }`}
                >
                  <button 
                    onClick={() => setActiveSection(page.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm font-medium transition-all"
                  >
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      activeSection === page.id ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Type size={16} className={activeSection === page.id ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <span className={`flex-1 truncate ${
                      activeSection === page.id 
                        ? 'text-white font-semibold' 
                        : !page.isVisible 
                          ? 'text-gray-600 line-through' 
                          : 'text-gray-300 group-hover:text-white'
                    }`}>
                      {page.title}
                    </span>
                    {activeSection === page.id && <ChevronRight size={16} className="text-white animate-pulse" />}
                  </button>
                  
                  {/* Action Buttons - Show on Hover */}
                  <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity ${
                    activeSection === page.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {/* Reorder Up */}
                    {index > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReorderPage(index, 'up'); }}
                        className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                    )}
                    
                    {/* Reorder Down */}
                    {index < proposal.pages.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReorderPage(index, 'down'); }}
                        className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    )}
                    
                    {/* Visibility Toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePageVisibility(page.id); }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        !page.isVisible 
                          ? 'text-gray-600 hover:bg-gray-700/20 hover:text-gray-500' 
                          : 'text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300'
                      }`}
                      title={page.isVisible ? 'Hide page' : 'Show page'}
                    >
                      <Eye size={14} />
                    </button>
                    
                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete page"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Page Button */}
            <button 
              onClick={() => setIsAddPageModalOpen(true)}
              className="mt-4 w-full border-2 border-dashed border-[#2C2C2F] hover:border-blue-500/50 rounded-xl p-3.5 text-xs font-semibold text-gray-500 hover:text-blue-400 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 group"
            >
              <div className="p-1 rounded-lg bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                <Plus size={14} />
              </div>
              Add Dynamic Page
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-[#2C2C2F]/50 bg-[#1C1C1F]/50 backdrop-blur-sm space-y-3">
          <div className="text-xs text-emerald-500 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <CheckCircle2 size={14} />
            <span className="font-medium">All changes saved</span>
          </div>
          
          <Link 
            href={`/proposal/${proposal?.id}/view`} 
            target="_blank"
            className="w-full bg-gradient-to-r from-white to-gray-100 text-black hover:from-gray-100 hover:to-white h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] group"
          >
            <Eye size={16} className="group-hover:scale-110 transition-transform" />
            Preview Proposal
            </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background relative">
        <div className="max-w-6xl mx-auto py-12 px-12">
          
          <div className="bg-card rounded-2xl shadow-sm border border-border min-h-[600px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-gray-100 flex items-center px-8 justify-between bg-white sticky top-0 z-10">
               <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 Editor <ChevronRight size={12} /> 
                 <span className="text-gray-900">
                    {activeSection === 'cover' ? 'Cover Page' : activeSection === 'static' ? 'Static Showcase' : proposal?.pages?.find(p => p.id === activeSection)?.title}
                 </span>
               </h2>
            </div>

            <div className="p-10 flex-1 flex flex-col">
              {/* Form: Cover */}
              {activeSection === 'cover' && (
                <div className="grid gap-8 max-w-2xl">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">Client Name (Prepared For)</label>
                    {isEditingClientName ? (
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={tempClientName}
                          onChange={(e) => setTempClientName(e.target.value)}
                          className="flex-1 px-4 py-3 text-lg font-semibold border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Enter Client Name"
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            if (!proposal) return;
                            await updateCover('preparedFor', tempClientName);
                            setIsEditingClientName(false);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingClientName(false)}
                          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-3 text-lg font-semibold bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900">
                          {proposal?.cover?.preparedFor || 'Not set'}
                        </div>
                        <button
                          onClick={() => {
                            setTempClientName(proposal?.cover?.preparedFor || '');
                            setIsEditingClientName(true);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">Project Title</label>
                    <input 
                      type="text" 
                      value={proposal?.cover?.projectType || ''} 
                      onChange={(e) => updateCover('projectType', e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition-all font-medium"
                      placeholder="e.g. Website Redesign"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">Prepared By</label>
                      <input 
                        type="text" 
                        value={proposal?.cover?.preparedBy || ''}
                        onChange={(e) => updateCover('preparedBy', e.target.value)}
                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none transition-all"
                        placeholder="Agency Name"
                      />
                    </div>
                     <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-900">Date</label>
                      <input 
                        type="text" 
                        value={proposal?.cover?.date || ''}
                        onChange={(e) => updateCover('date', e.target.value)}
                         className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form: Static */}
              {activeSection === 'static' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Company Portfolio Slides</h4>
                      <p className="text-sm text-gray-500">Enable to include pages 2-13 in the final PDF.</p>
                    </div>
                    <button 
                      onClick={() => handleUpdate({ includeShowcase: !proposal?.includeShowcase })}
                       className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${proposal?.includeShowcase ? 'bg-black' : 'bg-gray-200'}`}
                    >
                      <span className={`transform transition-transform inline-block h-6 w-6 rounded-full bg-white shadow-sm ${proposal?.includeShowcase ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(12)].map((_, i) => (
                       <div key={i} className={`aspect-[3/4] rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all ${proposal?.includeShowcase ? 'border-gray-100 bg-white shadow-sm opacity-100' : 'border-gray-100 bg-gray-50 opacity-40 grayscale'}`}>
                         <span className="text-gray-400 mb-2">Slide</span>
                         <span className="text-xl text-gray-700">{i + 2}</span>
                       </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form: Dynamic */}
              {!['cover', 'static'].includes(activeSection) && (
                (() => {
                  const page = proposal?.pages?.find(p => p.id === activeSection);
                  if (!page) return null;
                  
                  return (
                    <div className="h-full flex flex-col space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Page Headline</label>
                        <input 
                          type="text" 
                          value={page.title}
                          onChange={(e) => updatePage(page.id, 'title', e.target.value)}
                          className="w-full text-3xl font-bold text-gray-900 border-none p-0 focus:ring-0 placeholder:text-gray-300 outline-none"
                          placeholder="Untitled Page"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-400 uppercase">Content</label>
                          {(page.title.toLowerCase().includes('requirement') || page.type === 'requirements') && (
                            <AIRequirementsGenerator 
                              onGenerate={(content) => updatePage(page.id, 'content', content)}
                              currentContent={page.content}
                            />
                          )}
                        </div>
                        {page.type === 'process' || page.title.toLowerCase().includes('process') ? (
                          <ProcessEditor
                            content={page.content}
                            onChange={(html) => updatePage(page.id, 'content', html)}
                          />
                        ) : (
                          <RichTextEditor 
                            editorKey={page.id}
                            content={page.content}
                            onChange={(html) => updatePage(page.id, 'content', html)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </main>

      <AddPageModal
        isOpen={isAddPageModalOpen}
        onClose={() => setIsAddPageModalOpen(false)}
        onAddPage={handleAddPage}
      />
      
      <SyncIndicator isSyncing={isSyncing} />
    </div>
    </ProtectedRoute>
  );
}
