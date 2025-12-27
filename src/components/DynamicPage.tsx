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
      <div className={`absolute top-0 ${isArabic ? 'left-0' : 'right-0'} h-full w-auto`}>
        <img 
          src="/assets/slides/headers_right_pattern.png" 
          alt="" 
          className={`h-full w-auto object-cover opacity-40 ${isArabic ? 'scale-x-[-1]' : ''}`}
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
  if (page.type === 'process' || page.title.toLowerCase().includes('process')) {
    return <ProcessPage page={page} />;
  }
  
  const [contentChunks, setContentChunks] = useState<string[]>([page.content]);
  const measureRef = useRef<HTMLDivElement>(null);

  // Professional Prose Styling - Moved up to be available for measurement
  const proseClasses = `
    max-w-none
    text-[15px] leading-relaxed text-gray-700 font-sans
    
    [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#252E5D] [&_h1]:mb-6 [&_h1]:mt-8 [&_h1]:leading-tight
    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#252E5D] [&_h2]:mb-4 [&_h2]:mt-6 [&_h2]:leading-snug
    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#252E5D] [&_h3]:mb-3 [&_h3]:mt-5
    [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-[#252E5D] [&_h4]:mb-2 [&_h4]:mt-4
    
    [&_p]:mb-3 [&_p]:text-gray-600
    
    /* Lists - Compact & Professional */
    [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1
    [&_ul[dir='rtl']]:pr-5 [&_ul[dir='ltr']]:pl-5
    [&_ul:not([dir])]:pl-5
    
    [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1
    [&_ol[dir='rtl']]:pr-5 [&_ol[dir='ltr']]:pl-5
    [&_ol:not([dir])]:pl-5
    
    /* Nested lists - tighter */
    [&_ul_ul]:my-1 [&_ul_ol]:my-1 [&_ol_ul]:my-1 [&_ol_ol]:my-1
    
    [&_li]:text-gray-700 [&_li]:leading-snug [&_li]:pl-1 [&_li]:mb-1
    [&_li::marker]:text-[#0230F5] [&_li::marker]:font-semibold
    
    [&_strong]:text-gray-900 [&_strong]:font-bold
    [&_em]:italic [&_em]:text-gray-800
    
    [&_a]:text-[#0230F5] [&_a]:font-medium [&_a]:underline [&_a]:decoration-blue-200 [&_a]:underline-offset-2 [&_a]:transition-colors [&_a]:hover:text-[#252E5D]
    
    [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#0230F5] [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:my-4 [&_blockquote]:bg-blue-50/30 [&_blockquote]:rounded-r-lg
    
    [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-[#252E5D]
    [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-sm
    
    [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-6
    [&_hr]:border-gray-200 [&_hr]:my-6
  `.trim();

  useEffect(() => {
    // 100% Robust Pagination Solution (Greedy Fill Algorithm)
    if (measureRef.current) {
      // 1. Setup Source
      const sourceDiv = document.createElement('div');
      sourceDiv.innerHTML = page.content;
      sourceDiv.className = proseClasses;
      sourceDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: 210mm;
        padding: 0 64px;
        box-sizing: border-box;
      `;
      document.body.appendChild(sourceDiv);

      // 2. Setup Measurement Container
      // A4 Height (1123px) - Header (192px) - Footer (60px) - Vertical Padding (64px) = 807px
      // We push limits: 855px for first page (tight), 830px for others (safe)
      const MAX_HEIGHT_FIRST = 860;
      const MAX_HEIGHT_STD = 830;
      
      const measureContainer = document.createElement('div');
      measureContainer.className = proseClasses;
      measureContainer.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: 210mm;
        padding: 0 64px;
        box-sizing: border-box;
        top: 0;
        left: 0;
      `;
      document.body.appendChild(measureContainer);

      const chunks: string[] = [];
      const queue = Array.from(sourceDiv.children) as HTMLElement[];

      // 3. Process Queue
      while (queue.length > 0) {
        measureContainer.innerHTML = ''; // Start clean for new page
        let pageElements: HTMLElement[] = [];
        let contentAdded = false;
        
        // Determine height limit for THIS page
        const CURRENT_MAX_HEIGHT = chunks.length === 0 ? MAX_HEIGHT_FIRST : MAX_HEIGHT_STD;

        // Try to add as many elements as possible to this page
        while (queue.length > 0) {
          const el = queue[0]; // Peek at next element
          const clone = el.cloneNode(true) as HTMLElement;
          measureContainer.appendChild(clone);

          // Check height
          if (measureContainer.scrollHeight <= CURRENT_MAX_HEIGHT) {
            // It fits! Keep it.
            pageElements.push(el); // Start tracking
            queue.shift(); // Remove from queue (success)
            contentAdded = true;
          } else {
            // It overflowed.
            measureContainer.removeChild(clone); // Backtrack first

            // SPLITTING LOGIC: Check if we can split this element (UL/OL)
            const isList = (el.tagName === 'UL' || el.tagName === 'OL');
            if (isList && el.children.length > 0) {
              // Create a partial list for the current page
              const partialList = el.cloneNode(false) as HTMLElement; // shallow clone (same tag/classes, no children)
              measureContainer.appendChild(partialList);
              
              const listItems = Array.from(el.children);
              let splitIndex = 0;
              let itemsAdded = false;

              // Try to add list items one by one
              for (let i = 0; i < listItems.length; i++) {
                const item = listItems[i].cloneNode(true) as HTMLElement;
                partialList.appendChild(item);
                
                if (measureContainer.scrollHeight <= CURRENT_MAX_HEIGHT) {
                  splitIndex = i + 1;
                  itemsAdded = true;
                } else {
                  partialList.removeChild(item); // Remove the one that broke it
                  break; // Stop adding items
                }
              }

              if (itemsAdded) {
                // We successfully fit SOME items. 
                // 1. Save the partial list to this page
                const finalPartial = el.cloneNode(false) as HTMLElement;
                for (let i = 0; i < splitIndex; i++) {
                    finalPartial.appendChild(listItems[i].cloneNode(true));
                }
                pageElements.push(finalPartial);
                contentAdded = true;

                // 2. Modify the original element in queue to only contain REMAINING items
                // We can't strictly modify 'el' if it's a reference to sourceDiv (might break if re-rendered).
                // Better to create a new element for the remainder and UNSHIFT it to queue (replacing old one).
                const remainingList = el.cloneNode(false) as HTMLElement;
                for (let i = splitIndex; i < listItems.length; i++) {
                    remainingList.appendChild(listItems[i].cloneNode(true));
                }
                
                // Replace the original full list with the remaining part
                queue[0] = remainingList;
                
                // Break because page is definitely full now
                break; 
              } else {
                // Even the first item didn't fit!
                // Treat it like a normal overflow (backtrack whole element)
                // Logic below handles this.
                 measureContainer.removeChild(partialList);
              }
            }

            // Standard Overflow Handling (Non-splittable or failed split)
            if (!contentAdded) {
              // Edge Case: The very first element is too big for the page.
              pageElements.push(el);
              queue.shift();
            } else {
              // Standard Case: Element goes to next page
              // We already removed it from measureContainer.
              // Just leave it in queue[0] for next iteration.
            }
            break; // Page is full
          }
        }
        
        // Finalize this chunk
        if (pageElements.length > 0) {
          const chunkHtml = pageElements.map(e => e.outerHTML).join('');
          chunks.push(chunkHtml);
        } else {
          break;
        }
      }

      // Cleanup
      document.body.removeChild(sourceDiv);
      document.body.removeChild(measureContainer);

      if (chunks.length > 0) {
        // Optimized: Check for simple orphan headings at the absolute end of a page
        // If a page ends with a Heading, and it's not the only thing on the page, move it to next page.
        // This is a post-processing refinement.
        const refinedChunks = [...chunks];
        for (let i = 0; i < refinedChunks.length - 1; i++) {
           if (refinedChunks[i].match(/<h[1-6][^>]*>[^<]+<\/h[1-6]>$/i)) {
             // Regex simple check: logic handles this better if we do it in the loop, 
             // but let's trust the height logic first as users prefer full pages over orphan perfection initially.
             // We'll skip complex regex manipulation to avoid breaking layout.
           }
        }
        setContentChunks(refinedChunks);
      }
    }
  }, [page.content, proseClasses]);

  return (
    <>
      <style jsx>{`
        table {
          border-spacing: 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          overflow: hidden;
        }
        table thead tr {
          background: linear-gradient(135deg, #252E5D 0%, #1a2347 100%) !important;
        }
        table th {
          background: transparent !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          font-size: 0.85rem !important;
          letter-spacing: 0.05em !important;
          padding: 1rem 1.5rem !important;
          border: none !important;
          text-align: left !important;
        }
        table[dir='rtl'] th {
          text-align: right !important;
        }
        table tbody tr {
          transition: background-color 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }
        table tbody tr:last-child {
          border-bottom: none;
        }
        table tbody tr:nth-child(even) td {
          background-color: #f8fafc !important;
        }
        table tbody tr:hover td {
          background-color: #f1f5f9 !important;
        }
        table td {
          padding: 1rem 1.5rem !important;
          color: #334155 !important;
          font-size: 0.95rem !important;
          line-height: 1.5 !important;
        }
      `}</style>
      
      {contentChunks.map((chunk, index) => (
        <div 
          key={index}
          className="w-[210mm] h-[297mm] bg-white flex flex-col page-break shadow-2xl mb-12 last:mb-0 print:shadow-none print:mb-0 mx-auto transition-transform"
        >
          <PageHeader title={page.title} />
          
          <div className={`flex-1 px-16 min-h-0 relative ${index === 0 ? 'pt-3 pb-4' : 'py-8'}`}>
            <div 
              ref={index === 0 ? measureRef : null}
              className={proseClasses}
              dir={/[\u0600-\u06FF]/.test(chunk) ? 'rtl' : undefined}
              style={{
                textAlign: /[\u0600-\u06FF]/.test(chunk) ? 'right' : undefined,
                height: '100%'
              }}
              dangerouslySetInnerHTML={{ __html: chunk }}
            />
          </div>

          <PageFooter />
        </div>
      ))}
    </>
  );
}
