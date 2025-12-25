'use client';

import { ProposalContentPage } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { ProcessPage } from './ProcessPage';

interface DynamicPageProps {
  page: ProposalContentPage;
}

function PageHeader({ title }: { title: string }) {
  // Detect if title contains Arabic characters
  const isArabic = /[\u0600-\u06FF]/.test(title);
  
  return (
    <div className="relative h-48 bg-gradient-to-r from-[#252E5D] to-[#0230F5] overflow-hidden flex-shrink-0">
      <div className="absolute top-0 right-0 h-full w-auto">
        <img 
          src="/assets/slides/headers_right_pattern.png" 
          alt="" 
          className="h-full w-auto object-cover opacity-40"
        />
      </div>
      <div className={`relative z-10 h-full flex flex-col justify-center px-10 ${isArabic ? 'text-right' : 'text-left'}`}>
        <h1 className={`text-4xl font-bold text-white ${isArabic ? 'font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>{title}</h1>
      </div>
    </div>
  );
}

function PageFooter() {
  return (
    <div className="border-t border-gray-200 px-10 py-4 flex items-center justify-between text-xs flex-shrink-0">
      <p className="text-gray-600">info@clicksdigitals.com</p>
      <div className="flex items-center gap-2">
        <img 
          src="/assets/slides/footer_logo.png" 
          alt="Clicks Digitals" 
          className="h-6 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <p className="text-gray-600">www.clicksdigitals.com</p>
    </div>
  );
}

export function DynamicPage({ page }: DynamicPageProps) {
  // Use ProcessPage for process-type pages
  if (page.type === 'process' || page.title.toLowerCase().includes('process')) {
    return <ProcessPage page={page} />;
  }
  
  const [contentChunks, setContentChunks] = useState<string[]>([page.content]);
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Split content into chunks that fit on one page
    if (measureRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = page.content;
      tempDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: 210mm;
        padding: 0 40px;
        font-size: 14px;
        line-height: 1.5;
      `;
      document.body.appendChild(tempDiv);

      const maxHeight = 500; // Max content height with bottom padding safe area
      const elements = Array.from(tempDiv.children);
      const chunks: string[] = [];
      let currentChunk: HTMLElement[] = [];
      let currentHeight = 0;

      elements.forEach((element) => {
        const el = element as HTMLElement;
        const elHeight = el.offsetHeight;

        if (currentHeight + elHeight > maxHeight && currentChunk.length > 0) {
          // Start new chunk
          const chunkDiv = document.createElement('div');
          currentChunk.forEach(item => chunkDiv.appendChild(item.cloneNode(true)));
          chunks.push(chunkDiv.innerHTML);
          currentChunk = [el];
          currentHeight = elHeight;
        } else {
          currentChunk.push(el);
          currentHeight += elHeight;
        }
      });

      // Add remaining chunk
      if (currentChunk.length > 0) {
        const chunkDiv = document.createElement('div');
        currentChunk.forEach(item => chunkDiv.appendChild(item.cloneNode(true)));
        chunks.push(chunkDiv.innerHTML);
      }

      document.body.removeChild(tempDiv);

      if (chunks.length > 0) {
        setContentChunks(chunks);
      }
    }
  }, [page.content]);

  const proseClasses = `
    max-w-none
    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h1]:mt-6
    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-3 [&_h2]:mt-5
    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mb-2 [&_h3]:mt-4
    [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mb-2 [&_h4]:mt-3
    [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-3 [&_p]:text-sm
    [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
    [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
    [&_li]:text-gray-700 [&_li]:text-sm [&_li]:leading-relaxed
    [&_li::marker]:text-blue-600 [&_li::marker]:font-bold
    [&_strong]:text-gray-900 [&_strong]:font-bold
    [&_em]:italic
    [&_u]:underline
    [&_s]:line-through
    [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
    [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
    [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
    [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
    [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-lg [&_table]:overflow-hidden
    [&_mark]:bg-yellow-200 [&_mark]:px-1 [&_mark]:rounded
    [&_span[style*='color']]:inline
    [&_span[style*='background']]:inline
  `.trim();

  return (
    <>
      <style jsx>{`
        table {
          border-spacing: 0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        table thead,
        table thead tr {
          background: linear-gradient(135deg, #252E5D 0%, #0230F5 100%) !important;
        }
        table th {
          background: transparent !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 1rem 1.25rem !important;
          border: none !important;
          border-bottom: 2px solid #0230F5 !important;
        }
        table tbody tr {
          transition: background-color 0.15s ease;
        }
        table tbody tr:nth-child(odd) td {
          background-color: #ffffff !important;
        }
        table tbody tr:nth-child(even) td {
          background-color: #f8fafc !important;
        }
        table td {
          padding: 0.875rem 1.25rem !important;
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          color: #334155 !important;
        }
        table tbody tr:last-child td {
          border-bottom: none !important;
        }
      `}</style>
      {contentChunks.map((chunk, index) => (
        <div 
          key={index}
          className="w-[210mm] h-[297mm] bg-white flex flex-col page-break shadow-lg mb-8 print:shadow-none print:mb-0"
        >
          <PageHeader title={page.title} />
          
          <div className="flex-1 px-10 pt-8 pb-24 min-h-0 overflow-hidden">
            <div 
              ref={index === 0 ? measureRef : null}
              className={proseClasses}
              dangerouslySetInnerHTML={{ __html: chunk }}
            />
          </div>

          <PageFooter />
        </div>
      ))}
    </>
  );
}
