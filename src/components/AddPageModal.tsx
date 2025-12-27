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
    defaultContent: '<p>Start writing your content here...</p>'
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
    defaultContent: '<h2>Project Requirements</h2><ul><li>Requirement 1</li><li>Requirement 2</li></ul>'
  },
  {
    type: 'timeline',
    title: 'Timeline',
    icon: Clock,
    description: 'Project timeline and milestones',
    defaultContent: '<h2>Project Timeline</h2><p>Timeline details...</p>'
  },
  {
    type: 'investment',
    title: 'Investment',
    icon: DollarSign,
    description: 'Pricing and cost breakdown',
    defaultContent: `<h2>Project Investment</h2>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1F] border border-[#2C2C2F] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2C2C2F]">
          <h2 className="text-xl font-semibold text-white">Add New Page</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {pageTemplates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate?.type === template.type;
              
              return (
                <button
                  key={template.type}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#2C2C2F] hover:border-gray-600 bg-[#18181B]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-500/20' : 'bg-white/5'
                    }`}>
                      <Icon size={20} className={isSelected ? 'text-blue-400' : 'text-gray-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium mb-1 ${
                        isSelected ? 'text-blue-400' : 'text-white'
                      }`}>
                        {template.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedTemplate && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-400 mb-2 block">
                  Page Title (Optional - defaults to "{selectedTemplate.title}")
                </span>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={selectedTemplate.title}
                  className="w-full px-4 py-2.5 bg-[#18181B] border border-[#2C2C2F] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </label>
              
              {selectedTemplate.hasTemplates && (
                <label className="block">
                  <span className="text-sm text-gray-400 mb-2 block">
                    Agreement Template
                  </span>
                  <select
                    value={selectedAgreementTemplate}
                    onChange={(e) => setSelectedAgreementTemplate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#18181B] border border-[#2C2C2F] rounded-lg text-white focus:outline-none focus:border-blue-500"
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2C2C2F]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPage}
            disabled={!selectedTemplate}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors font-medium"
          >
            Add Page
          </button>
        </div>
      </div>
    </div>
  );
}
