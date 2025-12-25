'use client';

import { useState, useEffect } from 'react';
import { Proposal } from '@/types';

const STORAGE_KEY = 'proposals_db';

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('[Store] Loaded proposals from localStorage:', parsed.length);
        setProposals(parsed);
      } catch (e) {
        console.error('[Store] Failed to parse proposals', e);
      }
    } else {
      console.log('[Store] No proposals found in localStorage');
    }
    setLoading(false);
  }, []);

  const saveToStorage = (updatedProposals: Proposal[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProposals));
    setProposals(updatedProposals);
  };

  const createProposal = () => {
    const newProposal: Proposal = {
      id: crypto.randomUUID(),
      title: 'Untitled Proposal',
      clientName: '',
      lastModified: Date.now(),
      cover: {
        preparedFor: '',
        preparedBy: 'Clicks Digitals',
        projectType: '',
        date: new Date().toLocaleDateString(),
      },
      includeShowcase: true,
      pages: [
        { 
          id: '1', 
          type: 'requirements', 
          title: 'Project Requirements', 
          content: `<div class="mb-6">
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
</ul>

<h3><strong>Customer & Vehicle Management</strong></h3>
<ul>
<li>Customer database with contact info and visit history</li>
<li>Vehicle records (plate number, model, color, etc.)</li>
<li>Link each vehicle to its owner</li>
<li>Service history per vehicle</li>
</ul>`, 
          isVisible: true 
        },
        { 
          id: '1.5', 
          type: 'process', 
          title: 'Project Process', 
          content: `
      <div class="process-container">
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
            <p class="step-description">We handle full-stack development — building the backend, frontend, and integrating all systems to deliver a fast, secure, and scalable solution.</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-number">04</div>
          <div class="step-content">
            <h3 class="step-title">Quality Assurance & Launch</h3>
            <p class="step-description">Rigorous QA is performed to catch any issues before launch. Once everything is polished and tested, we go live with confidence and support.</p>
          </div>
        </div>
      </div>
    `, 
          isVisible: true 
        },
        { 
          id: '2', 
          type: 'timeline', 
          title: 'Project Timeline', 
          content: `<table>
<thead>
<tr>
<th>Phase Title</th>
<th>Timeline</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Planning & Data Gathering</strong></td>
<td>open</td>
</tr>
<tr>
<td><strong>Development</strong></td>
<td>60 Working Days</td>
</tr>
<tr>
<td colspan="2" style="text-align: right;"><strong>Total: 60 Working Days</strong></td>
</tr>
</tbody>
</table>

<div class="mt-8">
<span style="background-color: #2563eb; color: white; padding: 8px 24px; border-radius: 24px; font-weight: 600; display: inline-block;">Notes:</span>
</div>
<ul>
<li>The timeline is organized into clear phases: Planning, Design, Development, Launch.</li>
<li>Each phase has an estimated duration based on smooth collaboration.</li>
<li>Delays in feedback or approvals from your side won't be counted within the timeline.</li>
<li>This helps us stay aligned, deliver with quality, and keep everything on track.</li>
</ul>`, 
          isVisible: true 
        },
        { 
          id: '3', 
          type: 'investment', 
          title: 'Investment', 
          content: `<h2>Project Investment</h2>
<p>The total investment for this project is calculated based on the scope, timeline, and deliverables outlined in this proposal.</p>

<table>
<thead>
<tr>
<th>Item</th>
<th>Cost</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Development & Implementation</strong></td>
<td>$XX,XXX</td>
</tr>
<tr>
<td><strong>Design & UX</strong></td>
<td>$X,XXX</td>
</tr>
<tr>
<td><strong>Testing & QA</strong></td>
<td>$X,XXX</td>
</tr>
<tr>
<td colspan="2" style="text-align: right;"><strong>Total Investment: $XX,XXX</strong></td>
</tr>
</tbody>
</table>`, 
          isVisible: true 
        },
        { 
          id: '4', 
          type: 'notes', 
          title: 'Notes', 
          content: `<ul>
<li>All deliverables will be provided as per the agreed timeline.</li>
<li>Any additional features or scope changes will be quoted separately.</li>
<li>Payment terms: 50% upfront, 50% upon completion.</li>
<li>We provide 30 days of post-launch support for bug fixes.</li>
</ul>`, 
          isVisible: true 
        },
        { 
          id: '5', 
          type: 'fees', 
          title: 'Additional Fees', 
          content: `<p>The following services are available as add-ons:</p>
<ul>
<li>Extended support and maintenance packages</li>
<li>Additional training sessions</li>
<li>Custom integrations with third-party services</li>
</ul>`, 
          isVisible: false 
        },
        { 
          id: '6', 
          type: 'agreement', 
          title: 'Agreement', 
          content: `<p>By signing this proposal, both parties agree to the terms, timeline, and investment outlined above.</p>
<p><strong>Client Signature:</strong> _______________________</p>
<p><strong>Date:</strong> _______________________</p>
<br/>
<p><strong>Clicks Digitals Representative:</strong> _______________________</p>
<p><strong>Date:</strong> _______________________</p>`, 
          isVisible: true 
        },
      ]
    };

    const updated = [newProposal, ...proposals];
    saveToStorage(updated);
    return newProposal.id;
  };

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    const updated = proposals.map(p => p.id === id ? { ...p, ...updates, lastModified: Date.now() } : p);
    saveToStorage(updated);
  };

  const deleteProposal = (id: string) => {
    if (confirm('Are you sure you want to delete this proposal?')) {
      const updated = proposals.filter(p => p.id !== id);
      saveToStorage(updated);
    }
  };

  const getProposal = (id: string) => {
    return proposals.find(p => p.id === id);
  };

  const addPage = (proposalId: string, pageType: string, pageTitle: string, defaultContent: string = '') => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    const newPage = {
      id: crypto.randomUUID(),
      type: pageType as any,
      title: pageTitle,
      content: defaultContent,
      isVisible: true
    };

    const updated = proposals.map(p => 
      p.id === proposalId 
        ? { ...p, pages: [...p.pages, newPage], lastModified: Date.now() }
        : p
    );
    saveToStorage(updated);
  };

  const deletePage = (proposalId: string, pageId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    const updated = proposals.map(p => 
      p.id === proposalId 
        ? { ...p, pages: p.pages.filter(page => page.id !== pageId), lastModified: Date.now() }
        : p
    );
    saveToStorage(updated);
  };

  const reorderPages = (proposalId: string, startIndex: number, endIndex: number) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    const newPages = Array.from(proposal.pages);
    const [removed] = newPages.splice(startIndex, 1);
    newPages.splice(endIndex, 0, removed);

    const updated = proposals.map(p => 
      p.id === proposalId 
        ? { ...p, pages: newPages, lastModified: Date.now() }
        : p
    );
    saveToStorage(updated);
  };

  return {
    proposals,
    loading,
    createProposal,
    updateProposal,
    deleteProposal,
    getProposal,
    addPage,
    deletePage,
    reorderPages
  };
}
