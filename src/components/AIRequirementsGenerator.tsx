'use client';

import { useState } from 'react';
import { Sparkles, Loader2, RotateCcw, X } from 'lucide-react';

interface AIRequirementsGeneratorProps {
  onGenerate: (requirements: string) => void;
  currentContent?: string;
}

export function AIRequirementsGenerator({ onGenerate, currentContent }: AIRequirementsGeneratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [feedback, setFeedback] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateRequirements = async () => {
    if (!projectDescription.trim()) {
      alert('Please enter a project description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-5.2-chat-latest',
          messages: [
            {
              role: 'system',
              content: `You are a senior business analyst specializing in project requirements.

You handle TWO types of projects:

**IT SOLUTIONS** (websites, mobile apps, web systems, software):
- Generate functional and technical requirements
- Focus on features, user flows, and system capabilities

**DESIGN SOLUTIONS** (branding, packaging, UI/UX, social media, graphics):
- Generate design specifications and creative requirements
- Focus on visual deliverables, brand guidelines, and design assets

Use professional, clear language. No fluff or marketing speak.

Output in clean HTML:
- <h2> for main sections
- <h3> for subsections
- <ul><li> for lists
- <p> for paragraphs

NO markdown. Start with <h2>.`
            },
            {
              role: 'user',
              content: `${currentContent && feedback ? `Current requirements:
${currentContent}

User feedback: ${feedback}

Refine and improve based on this feedback.

` : ''}Generate comprehensive, detailed professional project requirements:

**Project Type:** ${projectType || 'Not specified'}

**Project Description:**
${projectDescription}

Your task:
Generate EXTREMELY detailed and comprehensive project requirements suitable for a professional proposal. 

Be creative and adapt the structure based on the project type. Include everything relevant:
- Project context and objectives
- All features, functionalities, or design elements (be very detailed - minimum 20-30 items)
- User roles and permissions (if applicable)
- Admin/management capabilities (if applicable)
- Technical or design specifications
- Deliverables and outputs

Important guidelines:
- Write naturally, not like a template
- Be VERY detailed and specific (aim for 2000-3000+ words)
- Each feature/requirement should have proper explanation
- Adapt sections based on whether it's IT (website/app) or Design (branding/graphics)
- Use professional language
- NO pricing, timelines, or assumptions
- Format in clean HTML with <h2>, <h3>, <ul>, <li>, <p> tags
- Start with <h2>Project Overview</h2>

Generate comprehensive, detailed requirements that feel natural and specific to THIS project.`
            }
          ],
          max_completion_tokens: 30000,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate');
      }
      
      let content = data.choices?.[0]?.message?.content || '';
      
      // Clean markdown code blocks
      content = content.trim();
      content = content.replace(/^```html\n?/, '');
      content = content.replace(/^```\n?/, '');
      content = content.replace(/\n?```$/, '');
      content = content.trim();
      
      // Apply directly to editor
      onGenerate(content);
      
      // Collapse the form
      setHasGenerated(true);
      setFeedback('');
      
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert(error.message || 'Failed to generate. Check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] border border-[#e2e8f0] rounded-lg hover:border-[#0230F5] hover:text-[#0230F5] bg-white transition-colors"
      >
        <Sparkles size={13} />
        AI assist
      </button>
    );
  }

  return (
    <div className="fixed top-14 right-4 z-50 w-[min(420px,calc(100vw-2rem))] border border-[#e2e8f0] rounded-xl bg-white shadow-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
        <div>
          <h3 className="font-semibold text-[#0f172a] text-sm">Generate requirements</h3>
          <p className="text-[#64748b] text-xs">Describe the project — content fills the page below.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="p-1.5 hover:bg-[#e2e8f0] rounded-md transition-colors"
        >
          <X size={16} className="text-[#64748b]" />
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1.5">Project type</label>
          <input
            type="text"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            placeholder="Website, mobile app, branding…"
            className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:border-[#0230F5] outline-none text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[#64748b]">
              Description <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setProjectDescription(`Describe your project requirements:\n\n- Main objectives and goals\n- Key features or deliverables needed\n- Target users or audience (if applicable)\n- Any specific requirements or constraints\n- Desired outcomes`)}
              className="text-xs text-[#0230F5] hover:underline"
            >
              Use template
            </button>
          </div>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="What are you building? Who is it for?"
            className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:border-[#0230F5] outline-none resize-none text-sm"
            rows={4}
          />
        </div>

        {hasGenerated && (
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1.5">
              Refinement notes <span className="text-[#94a3b8]">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What should change in the generated content?"
              className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg focus:border-[#0230F5] outline-none resize-none text-sm"
              rows={2}
            />
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={generateRequirements}
            disabled={!projectDescription.trim() || isGenerating}
            className="flex-1 px-4 py-2 bg-[#252E5D] text-white rounded-lg hover:bg-[#1a2347] text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating…
              </>
            ) : hasGenerated ? (
              <>
                <RotateCcw size={14} />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="px-4 py-2 border border-[#e2e8f0] text-[#475569] rounded-lg hover:bg-[#f8fafc] text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
