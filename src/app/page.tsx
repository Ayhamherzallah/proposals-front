'use client';

import Link from 'next/link';
import { useProposals } from '@/lib/store-api';
import { useAuth } from '@/lib/auth-context';
import { ProtectedRoute } from '@/lib/protected-route';
import { Plus, FileText, Trash2, Calendar, User, ArrowRight, Eye, Edit3, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { proposals, loading, createProposal, deleteProposal } = useProposals();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleCreate = async () => {
    try {
      const id = await createProposal();
      router.push(`/editor/${id}`);
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#252E5D] via-[#1a2347] to-[#0230F5]">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 h-16 w-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
        </div>
        <p className="mt-6 text-white/80 font-medium">Loading workspace...</p>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Dark Gradient Navigation Bar */}
      <nav className="bg-gradient-to-r from-[#252E5D] via-[#1a2347] to-[#0230F5] border-b border-white/10 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-bold text-xl text-white">
                Clicks Digitals
              </h1>
              <p className="text-xs text-white/60 font-medium">Proposal Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                <User size={16} className="text-white/80" />
                <span className="text-sm font-medium text-white">{user.username}</span>
              </div>
            )}
            
            <button 
              onClick={handleCreate}
              className="group relative px-6 py-3 bg-white text-[#252E5D] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Plus size={20} className="relative z-10" />
              <span className="relative z-10">New Proposal</span>
            </button>
            
            {user && (
              <button
                onClick={logout}
                className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Simple Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-[#0230F5] to-[#252E5D] rounded-full"></div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Workspace</h2>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Your Proposals
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Create, manage, and share professional proposals with your clients.
          </p>
        </div>

        {/* Proposals Grid */}
        {proposals.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl flex items-center justify-center mx-auto transform rotate-3">
                  <FileText className="text-blue-600" size={40} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#0230F5] to-[#252E5D] rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="text-white" size={16} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No proposals yet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Get started by creating your first proposal. The system will guide you through with pre-built templates.
              </p>
              
              <button 
                onClick={handleCreate}
                className="group px-8 py-4 bg-gradient-to-r from-[#0230F5] to-[#252E5D] text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 inline-flex items-center gap-3"
              >
                <Plus size={20} />
                <span>Create Your First Proposal</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Card Header with Gradient */}
                <div className="h-2 bg-gradient-to-r from-[#0230F5] via-[#252E5D] to-[#0230F5] bg-[length:200%_100%] group-hover:animate-[shimmer_2s_linear_infinite]"></div>
                
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); deleteProposal(proposal.id); }}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                      title="Delete proposal"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <Link href={`/editor/${proposal.id}`} className="block mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {proposal.cover?.preparedFor || proposal.prepared_for || 'Untitled Proposal'}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 line-clamp-1">
                      {proposal.cover?.projectType || proposal.project_type || 'Project Proposal'}
                    </p>
                  </Link>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-gray-500">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <Calendar size={12} />
                      </div>
                      <span>Updated {new Date(proposal.lastModified || proposal.last_modified || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-medium text-gray-500">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <User size={12} />
                      </div>
                      <span>{proposal.cover?.preparedBy || proposal.prepared_by || 'Clicks Digitals'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex gap-3">
                  <Link 
                    href={`/editor/${proposal.id}`} 
                    className="flex-1 py-2.5 text-sm font-semibold text-center text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} />
                    Edit
                  </Link>
                  <Link 
                    href={`/proposal/${proposal.id}/view`} 
                    target="_blank"
                    className="flex-1 py-2.5 text-sm font-semibold text-center text-white bg-gradient-to-r from-[#0230F5] to-[#252E5D] rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <Eye size={16} />
                    Preview
                    <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shimmer Animation */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
    </ProtectedRoute>
  );
}
