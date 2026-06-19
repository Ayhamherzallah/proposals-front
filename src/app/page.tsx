'use client';

import Link from 'next/link';
import { useProposals } from '@/lib/store-api';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';
import {
  Plus, Trash2, Eye, Pencil, LogOut, Copy, FileText, Loader2, RefreshCw, AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Dashboard() {
  const { proposals, loading, error, createProposal, deleteProposal, duplicateProposal, refreshProposals } =
    useProposals();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const id = await createProposal();
      router.push(`/editor/${id}`);
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setCreating(false);
    }
  };

  const handleDelete = async (proposalId: string, clientName: string) => {
    if (deletingId) return;
    if (!confirm(`Delete proposal for "${clientName}"? This cannot be undone.`)) return;
    setDeletingId(proposalId);
    try {
      await deleteProposal(proposalId);
    } catch (err) {
      console.error('Failed to delete proposal:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (proposalId: string) => {
    if (duplicatingId) return;
    setDuplicatingId(proposalId);
    try {
      const newProposal = await duplicateProposal(proposalId);
      if (newProposal) router.push(`/editor/${newProposal.id}`);
    } catch (err) {
      console.error('Failed to duplicate proposal:', err);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProposals();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f6fa] gap-3">
        <Loader2 size={28} className="text-[#252E5D] animate-spin" />
        <p className="text-sm text-[#64748b]">Loading proposals…</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f4f6fa]">
        <header className="bg-white border-b border-[#e5e9f0] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#252E5D] to-[#0230F5] flex items-center justify-center">
                <FileText size={17} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1e293b] leading-none">Clicks Digitals</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">Proposal Studio</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <span className="hidden sm:block text-sm text-[#64748b] mr-2">{user.username}</span>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg text-[#64748b] hover:bg-[#f1f4f9] disabled:opacity-50"
                title="Refresh list"
              >
                <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0230F5] hover:bg-[#252E5D] text-white text-sm font-medium transition-colors disabled:opacity-70 min-w-[140px] justify-center"
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    New proposal
                  </>
                )}
              </button>
              {user && (
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f4f9]"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1e293b]">Your proposals</h1>
              <p className="text-sm text-[#64748b] mt-1">
                {proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'} total
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
              <button onClick={handleRefresh} className="ml-auto underline text-red-800">
                Retry
              </button>
            </div>
          )}

          {proposals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e5e9f0] p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#f1f4f9] flex items-center justify-center mx-auto mb-5">
                <FileText size={24} className="text-[#64748b]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1e293b] mb-2">No proposals yet</h3>
              <p className="text-sm text-[#64748b] mb-8 max-w-md mx-auto">
                Build a client-ready proposal with requirements, timeline, investment, and agreement sections.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#252E5D] text-white text-sm font-medium hover:bg-[#1e2860] disabled:opacity-70"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {creating ? 'Creating…' : 'Create your first proposal'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {proposals.map((proposal) => {
                const client =
                  proposal.cover?.preparedFor || proposal.prepared_for || 'Untitled Proposal';
                const project =
                  proposal.cover?.projectType || proposal.project_type || 'No project type';
                const updated = new Date(
                  proposal.lastModified || proposal.last_modified || Date.now()
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const isDeleting = deletingId === proposal.id;
                const isDuplicating = duplicatingId === proposal.id;

                return (
                  <article
                    key={proposal.id}
                    className={`bg-white rounded-2xl border border-[#e5e9f0] overflow-hidden flex flex-col transition-opacity ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="h-1.5 bg-gradient-to-r from-[#252E5D] to-[#0230F5]" />

                    <div className="p-5 flex-1">
                      <Link href={`/editor/${proposal.id}`} className="block group">
                        <h3 className="text-base font-bold text-[#1e293b] group-hover:text-[#0230F5] transition-colors line-clamp-2 mb-1">
                          {client}
                        </h3>
                        <p className="text-sm text-[#64748b] line-clamp-1 mb-4">{project}</p>
                      </Link>
                      <p className="text-xs text-[#94a3b8]">Updated {updated}</p>
                    </div>

                    <div className="px-5 pb-5 flex items-center gap-2">
                      <Link
                        href={`/editor/${proposal.id}`}
                        className="flex-1 py-2 rounded-lg border border-[#e5e9f0] text-sm font-medium text-[#475569] hover:border-[#0230F5] hover:text-[#0230F5] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                      <Link
                        href={`/proposal/${proposal.id}/view`}
                        target="_blank"
                        className="flex-1 py-2 rounded-lg bg-[#252E5D] text-sm font-medium text-white hover:bg-[#1e2860] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} />
                        Preview
                      </Link>
                      <button
                        onClick={() => handleDuplicate(proposal.id)}
                        disabled={!!duplicatingId || !!deletingId}
                        className="p-2 rounded-lg border border-[#e5e9f0] text-[#64748b] hover:text-[#0230F5] disabled:opacity-50"
                        title="Duplicate"
                      >
                        {isDuplicating ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(proposal.id, client)}
                        disabled={!!deletingId || !!duplicatingId}
                        className="p-2 rounded-lg border border-[#e5e9f0] text-[#64748b] hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                        title="Delete"
                      >
                        {isDeleting ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
