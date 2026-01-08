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

      // Helper: Check if element is a heading
      const isHeading = (el: HTMLElement) => /^H[1-6]$/.test(el.tagName);

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

          const currentHeight = measureContainer.scrollHeight;
          const fits = currentHeight <= CURRENT_MAX_HEIGHT;

          // STRATEGY: Look ahead! 
          // If we have [Header -> Table], treat them as a SINGLE INDIVISIBLE UNIT.
          if (isHeading(el) && queue.length > 1 && queue[1].tagName === 'TABLE') {
            const tableEl = queue[1];
            
            // Check if Header + Table fits on THIS page (without scaling first)
            const tableClone = tableEl.cloneNode(true) as HTMLElement;
            measureContainer.appendChild(tableClone);
            const combinedFits = measureContainer.scrollHeight <= CURRENT_MAX_HEIGHT;
            
            if (combinedFits) {
               // Simple case: Both fit perfectly on current page.
               pageElements.push(el);
               pageElements.push(tableEl);
               queue.shift(); // Remove Header
               queue.shift(); // Remove Table
               contentAdded = true;
               continue;
            } else {
               // They don't fit normally.
               measureContainer.removeChild(tableClone);
               measureContainer.removeChild(clone); // Remove header from measure check
               
               // CASE 1: We are not on a fresh page. 
               // Move BOTH to the next page to give them maximum room.
               if (pageElements.length > 0) {
                 break; // Force new page
               }
               
               // CASE 2: We ARE on a fresh page (or forced to be).
               // It means the Table is huge. We MUST Add Header + Scaled Table.
               
               // 1. Add Header (it definitely fits on a fresh page unless it's 800px tall??)
               pageElements.push(el);
               queue.shift();
               measureContainer.appendChild(clone); 
               
               // 2. Calculate remaining space for Table
               const usedHeight = measureContainer.scrollHeight;
               const remainingHeight = CURRENT_MAX_HEIGHT - usedHeight - 20; // 20px buffer
               
               // 3. Create wrapper and scale table to fit remaining space
               const tableHeight = tableEl.scrollHeight || 600; // heuristic if not rendered
               // We need to render table off-screen to get true height if possible, 
               // but tableClone was just measured.
               // Let's rely on visual scaling logic.
               
               // We assume tableClone natural height is what we saw before.
               // Re-measure table safely
               const tempContainer = document.createElement('div');
               tempContainer.className = proseClasses;
               tempContainer.style.width = '210mm';
               tempContainer.style.position = 'absolute';
               tempContainer.style.visibility = 'hidden';
               document.body.appendChild(tempContainer);
               tempContainer.appendChild(tableEl.cloneNode(true));
               const naturalTableHeight = tempContainer.scrollHeight;
               document.body.removeChild(tempContainer);
               
               const scaleFactor = Math.min(1, remainingHeight / naturalTableHeight);
               
               const wrapper = document.createElement('div');
               wrapper.style.width = '100%';
               wrapper.style.height = `${naturalTableHeight * scaleFactor}px`; // Exact scaled height
               wrapper.style.overflow = 'hidden';
               wrapper.style.marginBottom = '0'; // Clean
               
               const scaledTable = tableEl.cloneNode(true) as HTMLElement;
               scaledTable.style.transform = `scale(${scaleFactor})`;
               scaledTable.style.transformOrigin = 'top left';
               scaledTable.style.width = `${100 / scaleFactor}%`;
               
               wrapper.appendChild(scaledTable);
               pageElements.push(wrapper);
               queue.shift(); // Remove Table
               contentAdded = true;
               
               // We filled the page with this scaled table.
               break; 
            }
          }

          // SPECIAL HANDLING: Table Alone (not following header immediately)
          // Just scale it if it doesn't fit.
          if (el.tagName === 'TABLE') {
             if (fits) {
               pageElements.push(el);
               queue.shift();
               contentAdded = true;
               continue;
             } else {
               measureContainer.removeChild(clone);
               
               // If not fresh page, move to next
               if (pageElements.length > 0) {
                 break;
               }
               
               // Fresh page -> Scale to fit
               const scaleFactor = Math.min(1, (CURRENT_MAX_HEIGHT - 20) / currentHeight);
               
               const wrapper = document.createElement('div');
               wrapper.style.width = '100%';
               wrapper.style.height = `${currentHeight * scaleFactor}px`;
               wrapper.style.overflow = 'hidden';
               
               const scaledTable = el.cloneNode(true) as HTMLElement;
               scaledTable.style.transform = `scale(${scaleFactor})`;
               scaledTable.style.transformOrigin = 'top left';
               scaledTable.style.width = `${100 / scaleFactor}%`;
               
               wrapper.appendChild(scaledTable);
               pageElements.push(wrapper);
               queue.shift();
               contentAdded = true;
               break;
             }
          }

          // SPECIAL HANDLING: Standard Orphans (Header at bottom)
          if (fits && isHeading(el) && queue.length > 1) {
             // Standard orphan check for non-table elements
             const nextEl = queue[1];
             if (nextEl.tagName !== 'TABLE') { // Tables handled above
                const nextClone = nextEl.cloneNode(true) as HTMLElement;
                measureContainer.appendChild(nextClone);
                if (measureContainer.scrollHeight > CURRENT_MAX_HEIGHT) {
                   if (pageElements.length > 0) {
                     measureContainer.removeChild(clone);
                     measureContainer.removeChild(nextClone);
                     break; 
                   }
                }
                if (measureContainer.contains(nextClone)) measureContainer.removeChild(nextClone);
             }
          }

          // NORMAL ELEMENT HANDLING
          if (fits) {
            pageElements.push(el);
            queue.shift();
            contentAdded = true;
          } else {
            measureContainer.removeChild(clone);

            // List Splitting Logic
            const isList = (el.tagName === 'UL' || el.tagName === 'OL');
            if (isList && el.children.length > 0) {
              const partialList = el.cloneNode(false) as HTMLElement;
              measureContainer.appendChild(partialList);
              const listItems = Array.from(el.children);
              let splitIndex = 0;
              let itemsAdded = false;

              for (let i = 0; i < listItems.length; i++) {
                const item = listItems[i].cloneNode(true) as HTMLElement;
                partialList.appendChild(item);
                if (measureContainer.scrollHeight <= CURRENT_MAX_HEIGHT) {
                  splitIndex = i + 1;
                  itemsAdded = true;
                } else {
                  partialList.removeChild(item); break;
                }
              }

              if (itemsAdded) {
                const finalPartial = el.cloneNode(false) as HTMLElement;
                for (let i = 0; i < splitIndex; i++) finalPartial.appendChild(listItems[i].cloneNode(true));
                pageElements.push(finalPartial);
                contentAdded = true;

                const remainingList = el.cloneNode(false) as HTMLElement;
                for (let i = splitIndex; i < listItems.length; i++) remainingList.appendChild(listItems[i].cloneNode(true));
                queue[0] = remainingList;
                break; 
              } else {
                 measureContainer.removeChild(partialList);
              }
            }

            // Fallback
            if (!contentAdded) {
               if (pageElements.length === 0) {
                 pageElements.push(el);
                 queue.shift();
               }
            }
            break; // Page full
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
        setContentChunks(chunks);
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
        @media print {
          table {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
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
