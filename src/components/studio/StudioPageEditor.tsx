'use client';

import { ProposalContentPage } from '@/types';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ProcessEditor } from '@/components/ProcessEditor';
import { AIRequirementsGenerator } from '@/components/AIRequirementsGenerator';

interface StudioPageEditorProps {
  page: ProposalContentPage;
  onTitleChange: (value: string) => void;
  onContentChange: (html: string) => void;
}

export function StudioPageEditor({ page, onTitleChange, onContentChange }: StudioPageEditorProps) {
  const isProcess = page.type === 'process' || page.title.toLowerCase().includes('process');
  const isRequirements =
    page.title.toLowerCase().includes('requirement') || page.type === 'requirements';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 bg-white border-b border-[#e2e8f0]">
        <input
          type="text"
          value={page.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="flex-1 min-w-0 text-[15px] font-medium text-[#0f172a] bg-transparent border-none p-0 outline-none placeholder:text-[#94a3b8]"
          placeholder="Page title"
        />
        {isRequirements && (
          <div className="shrink-0 relative">
            <AIRequirementsGenerator onGenerate={onContentChange} currentContent={page.content} />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {isProcess ? (
          <div className="studio-canvas h-full overflow-y-auto px-5 py-8">
            <div className="mx-auto w-full max-w-[820px]">
              <div className="studio-artboard studio-page-sheet bg-white overflow-hidden min-h-[1160px]">
                <ProcessEditor content={page.content} onChange={onContentChange} />
              </div>
            </div>
          </div>
        ) : (
          <RichTextEditor
            editorKey={page.id}
            content={page.content}
            onChange={onContentChange}
          />
        )}
      </div>
    </div>
  );
}
