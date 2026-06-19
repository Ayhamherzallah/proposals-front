'use client';

import { X, FileText, ListChecks, Clock, DollarSign, StickyNote, Receipt, FileSignature, Workflow } from 'lucide-react';
import { useState } from 'react';
import { agreementTemplates } from '@/lib/agreement-templates';

interface AddPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPage: (type: string, title: string, content: string) => void;
  language?: string; // 'en' or 'ar'
}

const pageTemplates = [
  {
    type: 'text',
    title: 'General Page',
    icon: FileText,
    description: 'A blank page with rich text editor',
    defaultContent: `<p class="proposal-section-label">Overview</p>
<p>Start writing your content here. Use section labels, tables, and two-column layouts for a structured page.</p>
<div class="proposal-two-col">
<div>
<h3>Left Column</h3>
<ul><li>Key point one</li><li>Key point two</li></ul>
</div>
<div>
<h3>Right Column</h3>
<ul><li>Key point one</li><li>Key point two</li></ul>
</div>
</div>`
  },
  {
    type: 'process',
    title: 'Project Process',
    icon: Workflow,
    description: 'Structured process steps with numbers',
    defaultContent: `
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
    `
  },
  {
    type: 'requirements',
    title: 'Requirements',
    icon: ListChecks,
    description: 'Project requirements and scope',
    defaultContent: `<p class="proposal-section-label">Scope</p>
<ul><li>Requirement 1</li><li>Requirement 2</li><li>Requirement 3</li></ul>`
  },
  {
    type: 'timeline',
    title: 'Timeline',
    icon: Clock,
    description: 'Project timeline and milestones',
    defaultContent: `<p class="proposal-section-label">Project Schedule</p>
<table class="premium-table">
<thead><tr><th>Phase</th><th>Duration</th><th>Deliverables</th></tr></thead>
<tbody>
<tr><td><strong>Phase 1</strong></td><td>Week 1–2</td><td>Milestone deliverables</td></tr>
<tr><td><strong>Phase 2</strong></td><td>Week 3–6</td><td>Milestone deliverables</td></tr>
</tbody>
</table>`
  },
  {
    type: 'investment',
    title: 'Investment',
    icon: DollarSign,
    description: 'Pricing and cost breakdown',
    defaultContent: `<p class="proposal-section-label">Cost Breakdown</p>
<table class="premium-table">
<thead><tr><th>Item</th><th>Description</th><th>Cost</th></tr></thead>
<tbody>
<tr><td><strong>Development</strong></td><td>Core build and integration</td><td>$XX,XXX</td></tr>
<tr class="total-row"><td colspan="2"><strong>Total</strong></td><td><strong>$XX,XXX</strong></td></tr>
</tbody>
</table>`
  },
  {
    type: 'notes',
    title: 'Notes',
    icon: StickyNote,
    description: 'Additional notes and information',
    defaultContent: '<h2>Notes</h2><ul><li>Note 1</li><li>Note 2</li></ul>'
  },
  {
    type: 'fees',
    title: 'Additional Fees',
    icon: Receipt,
    description: 'Extra costs and fees',
    defaultContent: '<h2>Additional Fees</h2><p>Additional fee details...</p>'
  },
  {
    type: 'agreement',
    title: 'Agreement',
    icon: FileSignature,
    description: 'Terms and conditions - Choose template',
    defaultContent: agreementTemplates['IT Project - English'],
    hasTemplates: true
  }
];

export default function AddPageModal({ isOpen, onClose, onAddPage, language = 'en' }: AddPageModalProps) {
  const [customTitle, setCustomTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof pageTemplates[0] | null>(null);
  const [selectedAgreementTemplate, setSelectedAgreementTemplate] = useState<string>(
    language === 'ar' ? 'IT Project - Arabic' : 'IT Project - English'
  );

  if (!isOpen) return null;

  const handleAddPage = () => {
    if (!selectedTemplate) return;
    
    const title = customTitle.trim() || selectedTemplate.title;
    let content = selectedTemplate.defaultContent;
    
    // For agreement pages, use selected agreement template
    if (selectedTemplate.type === 'agreement') {
      content = agreementTemplates[selectedAgreementTemplate as keyof typeof agreementTemplates] || content;
    }
    
    onAddPage(selectedTemplate.type, title, content);
    
    // Reset and close
    setCustomTitle('');
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0f1219]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#141824] border border-white/[0.08] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35 mb-1">Studio</p>
            <h2 className="text-lg font-semibold text-white">Add a new page</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <X size={18} className="text-white/50" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {pageTemplates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate?.type === template.type;

              return (
                <button
                  key={template.type}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'border-[#0230F5]/60 bg-[#0230F5]/10 ring-1 ring-[#0230F5]/30'
                      : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#0230F5]/20' : 'bg-white/[0.05]'}`}>
                      <Icon size={18} className={isSelected ? 'text-[#93b4ff]' : 'text-white/40'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium mb-1 text-sm ${isSelected ? 'text-[#93b4ff]' : 'text-white/80'}`}>
                        {template.title}
                      </h3>
                      <p className="text-xs text-white/35 line-clamp-2">{template.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedTemplate && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-white/40 mb-2 block">
                  Page title <span className="text-white/25">(optional)</span>
                </span>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={selectedTemplate.title}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-[#0230F5]/60 focus:ring-2 focus:ring-[#0230F5]/20"
                />
              </label>

              {selectedTemplate.hasTemplates && (
                <label className="block">
                  <span className="text-sm text-white/40 mb-2 block">Agreement template</span>
                  <select
                    value={selectedAgreementTemplate}
                    onChange={(e) => setSelectedAgreementTemplate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#0230F5]/60"
                  >
                    <option value="IT Project - English">IT Solutions - English</option>
                    <option value="IT Project - Arabic">IT Solutions - Arabic (حلول تقنية)</option>
                    <option value="Design Project - English">Design Services - English</option>
                    <option value="Design Project - Arabic">Design Services - Arabic (خدمات تصميم)</option>
                  </select>
                </label>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white/45 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPage}
            disabled={!selectedTemplate}
            className="px-6 py-2.5 bg-gradient-to-r from-[#252E5D] to-[#0230F5] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all text-sm font-semibold"
          >
            Add page
          </button>
        </div>
      </div>
    </div>
  );
}
