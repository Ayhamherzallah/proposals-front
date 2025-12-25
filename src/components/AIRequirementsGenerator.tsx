'use client';

import { useState } from 'react';
import { Sparkles, Loader2, X, Edit2, Check } from 'lucide-react';

interface AIRequirementsGeneratorProps {
  onGenerate: (requirements: string) => void;
}

export function AIRequirementsGenerator({ onGenerate }: AIRequirementsGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showHTMLEditor, setShowHTMLEditor] = useState(false);

  const generateRequirements = async () => {
    if (!projectDescription.trim()) return;

    setIsGenerating(true);
    try {
      console.log('Starting AI generation...');
      console.log('API Key exists:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Better quality, still affordable
          messages: [
            {
              role: 'system',
              content: `You are an expert requirements analyst for both DEVELOPMENT and DESIGN projects. Generate professional, detailed requirements in HTML format.

FORMATTING RULES:
- Use <h2> for main sections
- Use <h3> for subsections  
- Use <ul> and <li> for lists
- Use <p> for paragraphs
- Use <strong> for emphasis
- NO personas or user stories
- Focus on FEATURES and REQUIREMENTS
- Adapt based on project type (development vs design)`
            },
            {
              role: 'user',
              content: `Generate detailed professional requirements for:

Project Type: ${projectType || 'Digital Project'}
Description: ${projectDescription}
${additionalInfo ? `Additional: ${additionalInfo}` : ''}

Sections:

<h2>Project Overview</h2>
- Brief context and goals
- Success criteria

<h2>Core Features & Requirements</h2>
- 12-15 specific, detailed features/requirements
- Focus on WHAT needs to be built/designed
- Be extremely specific and actionable

<h2>Design Requirements</h2>
- Visual specifications
- UI/UX requirements
- Branding and style
- Responsive design

<h2>Deliverables</h2>
- Specific outputs
- File formats
- Documentation

Format in clean HTML. Be professional and detailed.`
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate requirements');
      }
      
      const content = data.choices?.[0]?.message?.content || '';
      console.log('Generated content length:', content.length);
      
      if (!content) {
        throw new Error('No content generated');
      }
      
      setGeneratedContent(content);
      setIsEditing(true); // Show preview for editing
      
    } catch (error: any) {
      console.error('Failed to generate requirements:', error);
      alert(error.message || 'Failed to generate requirements. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onGenerate(generatedContent);
    setIsOpen(false);
    setProjectDescription('');
    setProjectType('');
    setAdditionalInfo('');
    setGeneratedContent('');
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setGeneratedContent('');
    setIsEditing(false);
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Requirements Generator</h2>
                    <p className="text-purple-100 text-sm">Powered by ChatGPT 3.5</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!isEditing ? (
                <div className="space-y-6">
                  {/* Project Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Type
                    </label>
                    <input
                      type="text"
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      placeholder="e.g., E-commerce Website, Mobile App, SaaS Platform..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe your project in detail... What are you building? Who is it for? What problems does it solve? What are the main features?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                      rows={8}
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
                      placeholder="Any specific features, user types, integrations, or constraints you want to mention?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                      rows={5}
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong className="text-purple-700">💡 Tip:</strong> The more details you provide, the better and more comprehensive the generated requirements will be! Include target audience, key features, and specific goals.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Generated Requirements - Review & Edit</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowHTMLEditor(!showHTMLEditor)}
                        className="px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Edit2 size={14} />
                        {showHTMLEditor ? 'Show Preview' : 'Edit HTML'}
                      </button>
                      <span className="text-sm text-gray-500">{generatedContent.length} characters</span>
                    </div>
                  </div>
                  
                  {showHTMLEditor ? (
                    <div>
                      <textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="w-full h-[500px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2">Editing HTML source code</p>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-[500px] px-6 py-4 border-2 border-gray-200 rounded-lg overflow-y-auto bg-white prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: generatedContent }}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              {!isEditing ? (
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
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setGeneratedContent('');
                    }}
                    className="px-6 py-3 border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Apply to Proposal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
