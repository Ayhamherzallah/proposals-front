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
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.id} className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-100 relative group">
          {/* Drag Handle */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
            <GripVertical size={20} className="text-gray-400" />
          </div>

          <div className="flex gap-6">
            {/* Number */}
            <div className="flex-shrink-0">
              <input
                type="text"
                value={step.number}
                onChange={(e) => updateStep(step.id, 'number', e.target.value)}
                className="w-24 text-6xl font-bold text-blue-600 bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none transition-colors text-center"
              />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={step.title}
                onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                className="w-full text-2xl font-bold text-blue-600 bg-transparent border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 outline-none transition-colors"
                placeholder="Step Title"
              />
              
              <textarea
                value={step.description}
                onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                className="w-full text-base text-gray-700 bg-transparent border-2 border-transparent hover:border-blue-200 focus:border-blue-400 outline-none transition-colors rounded-lg p-3 resize-none"
                rows={3}
                placeholder="Step description..."
              />
            </div>

            {/* Delete Button */}
            {steps.length > 1 && (
              <button
                onClick={() => removeStep(step.id)}
                className="flex-shrink-0 h-10 w-10 rounded-lg hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add Step Button */}
      <button
        onClick={addStep}
        className="w-full py-4 border-2 border-dashed border-blue-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-blue-600 font-semibold"
        type="button"
      >
        <Plus size={20} />
        Add Step
      </button>
    </div>
  );
}
