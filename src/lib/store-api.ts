'use client';

import { useState, useEffect } from 'react';
import { Proposal, ContentPageType } from '@/types';
import { proposalApi, authApi } from './api';

// For development: Mock auth token (remove this in production)
const MOCK_TOKEN = 'your-jwt-token-here';

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth token for development
  useEffect(() => {
    // Check if token exists, if not set mock token for development
    if (!authApi.getToken() && process.env.NODE_ENV === 'development') {
      // For now, we'll work without auth in development
      // authApi.setToken(MOCK_TOKEN);
    }
  }, []);

  // Load proposals from API
  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proposalApi.getAll();
      console.log('[Store] Loaded proposals from API:', data.length);
      // Transform to match frontend expectations
      const transformed = data.map(p => ({
        ...p,
        lastModified: p.last_modified,
        title: p.prepared_for || 'Untitled',
        clientName: p.prepared_for || '',
        cover: {
          preparedFor: p.prepared_for,
          preparedBy: p.prepared_by,
          projectType: p.project_type,
          date: p.date,
        },
        includeShowcase: true,
        pages: p.pages || [],
      }));
      setProposals(transformed);
    } catch (err: any) {
      console.error('[Store] Failed to load proposals:', err);
      setError(err.message || 'Failed to load proposals');
      // Fallback to empty array on error
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (): Promise<string> => {
    try {
      const newProposal = await proposalApi.create({
        prepared_for: '',
        prepared_by: 'Clicks Digitals',
        project_type: '',
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        pages: [],
        last_modified: Date.now(),
      });

      // Add all default pages
      const defaultPages = [
        {
          type: 'requirements',
          title: 'Project Requirements',
          content: getDefaultRequirementsContent(),
          is_visible: true,
          order: 0,
        },
        {
          type: 'process',
          title: 'Project Process',
          content: getDefaultProcessContent(),
          is_visible: true,
          order: 1,
        },
        {
          type: 'timeline',
          title: 'Timeline',
          content: '<h2>Project Timeline</h2><p>Timeline details...</p>',
          is_visible: true,
          order: 2,
        },
        {
          type: 'investment',
          title: 'Investment',
          content: getDefaultInvestmentContent(),
          is_visible: true,
          order: 3,
        },
        {
          type: 'notes',
          title: 'Notes',
          content: '<h2>Notes</h2><ul><li>Note 1</li><li>Note 2</li></ul>',
          is_visible: true,
          order: 4,
        },
        {
          type: 'agreement',
          title: 'Agreement',
          content: '<h2>Agreement</h2><p>Agreement terms...</p>',
          is_visible: true,
          order: 5,
        },
      ];

      // Add pages to the proposal
      for (const page of defaultPages) {
        await proposalApi.addPage(newProposal.id, {
          ...page,
          type: page.type as ContentPageType,
        });
      }

      // Reload proposals to get updated data
      await loadProposals();
      
      return newProposal.id;
    } catch (err: any) {
      console.error('[Store] Failed to create proposal:', err);
      setError(err.message || 'Failed to create proposal');
      throw err;
    }
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    try {
      await proposalApi.update(id, updates);
      await loadProposals();
    } catch (err: any) {
      console.error('[Store] Failed to update proposal:', err);
      setError(err.message || 'Failed to update proposal');
      throw err;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      await proposalApi.delete(id);
      setProposals(proposals.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('[Store] Failed to delete proposal:', err);
      setError(err.message || 'Failed to delete proposal');
      throw err;
    }
  };

  const duplicateProposal = async (id: string) => {
    try {
      const newProposal = await proposalApi.duplicate(id);
      await loadProposals();
      return newProposal;
    } catch (err: any) {
      console.error('[Store] Failed to duplicate proposal:', err);
      setError(err.message || 'Failed to duplicate proposal');
      throw err;
    }
  };

  const getProposal = async (id: string): Promise<Proposal | undefined> => {
    try {
      return await proposalApi.getById(id);
    } catch (err: any) {
      console.error('[Store] Failed to get proposal:', err);
      setError(err.message || 'Failed to get proposal');
      return undefined;
    }
  };

  const addPage = async (proposalId: string, pageType: string, pageTitle: string, defaultContent: string = '') => {
    try {
      // Fetch fresh proposal data to get accurate page count
      const freshProposal = await proposalApi.getById(proposalId);
      const maxOrder = freshProposal.pages && freshProposal.pages.length > 0
        ? Math.max(...freshProposal.pages.map(p => p.order || 0)) + 1
        : 0;
      
      console.log('[AddPage] Current pages:', freshProposal.pages?.map(p => ({ title: p.title, order: p.order })));
      console.log('[AddPage] Calculated maxOrder:', maxOrder);
      console.log('[AddPage] Adding page with order:', maxOrder);
      
      await proposalApi.addPage(proposalId, {
        type: pageType as ContentPageType,
        title: pageTitle,
        content: defaultContent,
        is_visible: true,
        order: maxOrder,
      });
      await loadProposals();
    } catch (err: any) {
      console.error('[Store] Failed to add page:', err);
      setError(err.message || 'Failed to add page');
      throw err;
    }
  };

  const deletePage = async (proposalId: string, pageId: string) => {
    try {
      await proposalApi.deletePage(pageId);
      await loadProposals();
    } catch (err: any) {
      console.error('[Store] Failed to delete page:', err);
      setError(err.message || 'Failed to delete page');
      throw err;
    }
  };

  const reorderPages = async (proposalId: string, startIndex: number, endIndex: number) => {
    try {
      // Fetch full proposal to get pages
      const proposal = await proposalApi.getById(proposalId);
      if (!proposal || !proposal.pages) return;

      const newPages = Array.from(proposal.pages);
      const [removed] = newPages.splice(startIndex, 1);
      newPages.splice(endIndex, 0, removed);

      // Create page orders array
      const pageOrders = newPages.map((page, index) => ({
        id: page.id,
        order: index,
      }));

      await proposalApi.reorderPages(proposalId, pageOrders);
      await loadProposals();
    } catch (err: any) {
      console.error('[Store] Failed to reorder pages:', err);
      setError(err.message || 'Failed to reorder pages');
      throw err;
    }
  };

  const updatePage = async (pageId: string, updates: Partial<any>) => {
    try {
      await proposalApi.updatePage(pageId, updates);
      await loadProposals();
    } catch (err: any) {
      console.error('[Store] Failed to update page:', err);
      setError(err.message || 'Failed to update page');
      throw err;
    }
  };

  const togglePageVisibility = async (pageId: string) => {
    try {
      await proposalApi.togglePageVisibility(pageId);
      await loadProposals();
    } catch (err: any) {
      console.error('[Store] Failed to toggle page visibility:', err);
      setError(err.message || 'Failed to toggle page visibility');
      throw err;
    }
  };

  return {
    proposals,
    loading,
    error,
    createProposal,
    updateProposal,
    deleteProposal,
    duplicateProposal,
    getProposal,
    addPage,
    updatePage,
    togglePageVisibility,
    deletePage,
    reorderPages,
    refreshProposals: loadProposals,
  };
}

// Default content helpers
function getDefaultRequirementsContent(): string {
  return `<div class="mb-6">
<span style="background-color: #2563eb; color: white; padding: 8px 24px; border-radius: 24px; font-weight: 600; display: inline-block;">Objectives</span>
</div>
<ul>
<li>Automate all business operations (wash services, detailing, product sales).</li>
<li>Centralize data for customers, vehicles, and transactions.</li>
<li>Improve service efficiency and reduce manual tracking.</li>
<li>Enable the owner to monitor performance and profit in real time.</li>
<li>Simplify employee task management and commission tracking.</li>
</ul>

<div class="mt-8 mb-6">
<span style="background-color: #2563eb; color: white; padding: 8px 24px; border-radius: 24px; font-weight: 600; display: inline-block;">Core Modules</span>
</div>
<h3><strong>Dashboard</strong></h3>
<ul>
<li>Daily summary of income, sales, and completed services</li>
<li>Pending services, appointments, and staff performance overview</li>
<li>Quick KPIs (today's car count, total sales, average ticket value)</li>
</ul>`;
}

function getDefaultProcessContent(): string {
  return `<div class="process-container">
  <div class="process-step">
    <div class="step-number">01</div>
    <div class="step-content">
      <h3 class="step-title">Planning</h3>
      <p class="step-description">We begin with structured planning sessions (BRG) to fully understand your business, followed by creating a detailed Business Requirements Document (BRD) that sets the foundation for the project.</p>
    </div>
  </div>
  <div class="process-step">
    <div class="step-number">02</div>
    <div class="step-content">
      <h3 class="step-title">UI/UX Design</h3>
      <p class="step-description">Our design team transforms ideas into intuitive, visually appealing interfaces, ensuring a seamless experience for your users across all devices.</p>
    </div>
  </div>
  <div class="process-step">
    <div class="step-number">03</div>
    <div class="step-content">
      <h3 class="step-title">Development</h3>
      <p class="step-description">Using cutting-edge technologies, we build robust, scalable solutions with clean code, following industry best practices and agile methodologies.</p>
    </div>
  </div>
  <div class="process-step">
    <div class="step-number">04</div>
    <div class="step-content">
      <h3 class="step-title">Testing & Launch</h3>
      <p class="step-description">Rigorous testing ensures quality and performance before deployment. We provide full support during launch and beyond to ensure your success.</p>
    </div>
  </div>
</div>`;
}

function getDefaultInvestmentContent(): string {
  return `<h2>Project Investment</h2>
<table>
<thead>
<tr>
<th>Item</th>
<th>Cost</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Development</strong></td>
<td>$XX,XXX</td>
</tr>
<tr>
<td><strong>Design</strong></td>
<td>$XX,XXX</td>
</tr>
<tr>
<td><strong>Testing & QA</strong></td>
<td>$XX,XXX</td>
</tr>
</tbody>
</table>`;
}
