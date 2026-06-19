'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface ProcessStep {
  id: string;
  number: string;
  title: string;
  description: string;
}

interface ProcessEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function ProcessEditor({ content, onChange }: ProcessEditorProps) {
  const [steps, setSteps] = useState<ProcessStep[]>(() => {
    // Parse existing content or start with default
    try {
      if (content && content.includes('process-step')) {
        // Parse from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const stepElements = doc.querySelectorAll('.process-step');
        return Array.from(stepElements).map((el, idx) => ({
          id: `step-${idx}`,
          number: el.querySelector('.step-number')?.textContent || `0${idx + 1}`,
          title: el.querySelector('.step-title')?.textContent || '',
          description: el.querySelector('.step-description')?.textContent || '',
        }));
      }
    } catch (e) {
      console.error('Failed to parse process content', e);
    }
    
    // Default steps
    return [
      { id: 'step-1', number: '01', title: 'Planning', description: 'We begin with structured planning sessions (BRG) to fully understand your business, followed by creating a detailed Business Requirements Document (BRD) that sets the foundation for the project.' },
      { id: 'step-2', number: '02', title: 'UI/UX Design', description: 'Our design team transforms ideas into intuitive, visually appealing interfaces, ensuring a seamless experience for your users across all devices.' },
      { id: 'step-3', number: '03', title: 'Development', description: 'We handle full-stack development — building the backend, frontend, and integrating all systems to deliver a fast, secure, and scalable solution.' },
      { id: 'step-4', number: '04', title: 'Quality Assurance & Launch', description: 'Rigorous QA is performed to catch any issues before launch. Once everything is polished and tested, we go live with confidence and support.' },
    ];
  });

  const updateSteps = (newSteps: ProcessStep[]) => {
    setSteps(newSteps);
    
    // Generate HTML
    const html = `
      <div class="process-container">
        ${newSteps.map(step => `
          <div class="process-step">
            <div class="step-number">${step.number}</div>
            <div class="step-content">
              <h3 class="step-title">${step.title}</h3>
              <p class="step-description">${step.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    onChange(html);
  };

  const addStep = () => {
    const newStep: ProcessStep = {
      id: `step-${Date.now()}`,
      number: `0${steps.length + 1}`,
      title: 'New Step',
      description: 'Step description goes here...',
    };
    updateSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    const newSteps = steps.filter(s => s.id !== id);
    // Renumber
    const renumbered = newSteps.map((s, idx) => ({
      ...s,
      number: `0${idx + 1}`,
    }));
    updateSteps(renumbered);
  };

  const updateStep = (id: string, field: keyof ProcessStep, value: string) => {
    const newSteps = steps.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    updateSteps(newSteps);
  };

  return (
    <div className="h-full flex flex-col studio-artboard overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className="rounded-xl border border-[#e2e8f0] bg-[#fafbfd] p-5 relative group hover:border-[#cbd5e1] hover:shadow-sm transition-all"
          >
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity cursor-move">
              <GripVertical size={16} className="text-[#94a3b8]" />
            </div>

            <div className="flex gap-5 pl-4">
              <div className="shrink-0 w-16">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-1">No.</label>
                <input
                  type="text"
                  value={step.number}
                  onChange={(e) => updateStep(step.id, 'number', e.target.value)}
                  className="w-full text-2xl font-bold text-[#252E5D] bg-transparent border-b border-transparent hover:border-[#dde3ed] focus:border-[#0230F5] outline-none transition-colors text-center"
                />
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-1">Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                    className="w-full text-lg font-semibold text-[#1e293b] bg-white border border-[#dde3ed] rounded-md px-3 py-2 outline-none focus:border-[#0230F5] transition-colors"
                    placeholder="Step title"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] mb-1">Description</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                    className="w-full text-sm text-[#475569] bg-white border border-[#dde3ed] rounded-md px-3 py-2 outline-none focus:border-[#0230F5] transition-colors resize-y min-h-[80px]"
                    rows={3}
                    placeholder="Step description..."
                  />
                </div>
              </div>

              {steps.length > 1 && (
                <button
                  onClick={() => removeStep(step.id)}
                  className="shrink-0 self-start h-8 w-8 rounded-md hover:bg-red-50 text-[#94a3b8] hover:text-red-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  type="button"
                  title="Remove step"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 px-8 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
        <button
          onClick={addStep}
          className="w-full py-3 border border-dashed border-[#cbd5e1] rounded-xl hover:border-[#0230F5] hover:bg-white transition-all flex items-center justify-center gap-2 text-sm font-medium text-[#64748b] hover:text-[#0230F5]"
          type="button"
        >
          <Plus size={16} />
          Add step
        </button>
      </div>
    </div>
  );
}
