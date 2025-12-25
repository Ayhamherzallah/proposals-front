'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';

interface AIRequirementsGeneratorProps {
  onGenerate: (requirements: string) => void;
}

export function AIRequirementsGenerator({ onGenerate }: AIRequirementsGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const generateRequirements = async () => {
    if (!projectDescription.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a professional project requirements analyst. Generate detailed, well-structured project requirements in HTML format with proper headings, lists, and formatting. Use <h2> for main sections, <h3> for subsections, <ul> and <li> for lists, and <p> for paragraphs. Make it comprehensive and professional.'
            },
            {
              role: 'user',
              content: `Generate detailed project requirements for the following project:

Project Type: ${projectType || 'General'}
Project Description: ${projectDescription}
${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}

Please include:
1. Project Overview
2. Functional Requirements
3. Technical Requirements
4. Design Requirements
5. Timeline Considerations
6. Deliverables

Format the output in clean HTML with proper structure.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate requirements');
      }
      
      const generatedContent = data.choices?.[0]?.message?.content || '';
      
      if (!generatedContent) {
        throw new Error('No content generated');
      }
      
      onGenerate(generatedContent);
      setIsOpen(false);
      setProjectDescription('');
      setProjectType('');
      setAdditionalInfo('');
    } catch (error: any) {
      console.error('Failed to generate requirements:', error);
      alert(error.message || 'Failed to generate requirements. Please check your API key in environment variables and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
      >
        <Sparkles size={18} />
        <span className="font-medium">Generate with AI</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Requirements Generator</h2>
                    <p className="text-purple-100 text-sm">Powered by Llama 3.3 70B</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Project Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                >
                  <option value="">Select project type...</option>
                  <option value="Website Development">Website Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="E-commerce Platform">E-commerce Platform</option>
                  <option value="SaaS Application">SaaS Application</option>
                  <option value="Custom Software">Custom Software</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project in detail... What are you building? Who is it for? What problems does it solve?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                  rows={6}
                />
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Information (Optional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Any specific features, technologies, or constraints you want to mention?"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                  rows={4}
                />
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong className="text-purple-700">💡 Tip:</strong> The more details you provide, the better and more accurate the generated requirements will be!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={generateRequirements}
                disabled={!projectDescription.trim() || isGenerating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Requirements
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
