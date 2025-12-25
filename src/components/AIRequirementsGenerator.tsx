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
        onClick={() => setIsExpanded(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#252E5D] to-[#0230F5] text-white rounded-lg hover:from-[#1a2347] hover:to-[#0226d9] transition-all shadow-md hover:shadow-lg font-medium text-sm"
      >
        <Sparkles size={16} />
        <span>Generate with AI</span>
      </button>
    );
  }

  return (
    <div className="mb-6 border-2 border-[#0230F5]/20 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#252E5D] to-[#0230F5] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Requirements Generator</h3>
            <p className="text-blue-100 text-xs">Powered by GPT-4o</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Project Type */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Project Type
          </label>
          <input
            type="text"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            placeholder="e.g., Website, Mobile App, Branding, UI/UX Design, Packaging..."
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#0230F5] focus:ring-2 focus:ring-[#0230F5]/20 outline-none transition-all text-sm"
          />
        </div>

        {/* Project Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
              Project Description <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setProjectDescription(`Describe your project requirements:\n\n- Main objectives and goals\n- Key features or deliverables needed\n- Target users or audience (if applicable)\n- Any specific requirements or constraints\n- Desired outcomes`)}
              className="text-xs text-[#0230F5] hover:underline font-medium"
            >
              Use Template
            </button>
          </div>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your project in detail... What are you building? Who is it for? What are the main features?"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#0230F5] focus:ring-2 focus:ring-[#0230F5]/20 outline-none transition-all resize-none text-sm"
            rows={5}
          />
        </div>

        {/* Feedback (shown after first generation) */}
        {hasGenerated && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
              Improvements / Changes <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What would you like to improve, add, or change? e.g., 'Add more payment options', 'Include social media integration', 'Focus more on design specifications'"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#0230F5] focus:ring-2 focus:ring-[#0230F5]/20 outline-none transition-all resize-none text-sm"
              rows={3}
            />
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
          <p className="text-xs text-gray-700">
            <strong className="text-[#0230F5]">💡 Tip:</strong> {hasGenerated ? 'Add specific feedback to improve the requirements. The AI will refine based on your input.' : 'The more details you provide, the better the AI-generated requirements will be.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={generateRequirements}
            disabled={!projectDescription.trim() || isGenerating}
            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-[#252E5D] to-[#0230F5] text-white rounded-lg hover:from-[#1a2347] hover:to-[#0226d9] transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : hasGenerated ? (
              <>
                <RotateCcw size={16} />
                Regenerate with Feedback
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Requirements
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
