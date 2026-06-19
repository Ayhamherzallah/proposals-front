'use client';

import { ProposalContentPage } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { ProcessPage } from './ProcessPage';
import {
  ProposalPageShell,
  proposalProseClasses,
} from './ProposalPageShell';

interface DynamicPageProps {
  page: ProposalContentPage;
  startPageNumber?: number;
  totalPages?: number;
  onPaginated?: (pageId: string, physicalPageCount: number) => void;
}

export function DynamicPage({ page, startPageNumber, totalPages, onPaginated }: DynamicPageProps) {
  if (page.type === 'process' || page.title.toLowerCase().includes('process')) {
    return (
      <ProcessPage
        page={page}
        pageNumber={startPageNumber}
        totalPages={totalPages}
      />
    );
  }

  const [contentChunks, setContentChunks] = useState<string[]>([page.content]);
  const measureRef = useRef<HTMLDivElement>(null);
  const proseClasses = proposalProseClasses;

  useEffect(() => {
    if (measureRef.current) {
      const sourceDiv = document.createElement('div');
      sourceDiv.innerHTML = page.content;
      sourceDiv.className = proseClasses;
      sourceDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        width: 210mm;
        padding: 0 56px;
        box-sizing: border-box;
      `;
      document.body.appendChild(sourceDiv);

      // Style helper used so every off-screen measurement matches the real page.
      // Many proposal styles (table padding, gradients, etc.) are scoped to the
      // `.page-break` class, so measurements MUST happen inside that scope or the
      // computed heights (especially for tables) won't match the rendered output.
      const makeMeasureNode = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'page-break';
        wrapper.style.cssText = `
          position: absolute;
          visibility: hidden;
          top: 0;
          left: 0;
          width: 210mm;
        `;
        const inner = document.createElement('div');
        inner.className = proseClasses;
        inner.style.cssText = `
          width: 210mm;
          padding: 0 56px;
          box-sizing: border-box;
        `;
        wrapper.appendChild(inner);
        return { wrapper, inner };
      };

      // Measure the REAL available content height from the live A4 page so
      // pagination fills the page right down to the footer regardless of how
      // tall the header/footer are. measureRef is on the prose div whose
      // parent is the page's flex-1 content area.
      const contentWrapper = measureRef.current.parentElement as HTMLElement | null;
      let availableHeight = 820;
      if (contentWrapper) {
        const cs = getComputedStyle(contentWrapper);
        const padY =
          parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');
        const usable = contentWrapper.clientHeight - padY;
        if (usable > 200) availableHeight = usable;
      }
      // Leave a small, even breathing margin above the footer.
      const MAX_HEIGHT_FIRST = Math.round(availableHeight - 8);
      const MAX_HEIGHT_STD = Math.round(availableHeight - 8);

      const { wrapper: measureWrapper, inner: measureContainer } = makeMeasureNode();
      document.body.appendChild(measureWrapper);

      const chunks: string[] = [];
      const queue = Array.from(sourceDiv.children) as HTMLElement[];

      const isHeading = (el: HTMLElement) => /^H[1-6]$/.test(el.tagName);

      while (queue.length > 0) {
        measureContainer.innerHTML = '';
        const pageElements: HTMLElement[] = [];
        let contentAdded = false;

        const CURRENT_MAX_HEIGHT = chunks.length === 0 ? MAX_HEIGHT_FIRST : MAX_HEIGHT_STD;

        while (queue.length > 0) {
          const el = queue[0];
          const clone = el.cloneNode(true) as HTMLElement;
          measureContainer.appendChild(clone);

          const fits = measureContainer.scrollHeight <= CURRENT_MAX_HEIGHT;

          if (isHeading(el) && queue.length > 1 && queue[1].tagName === 'TABLE') {
            const tableEl = queue[1];
            const tableClone = tableEl.cloneNode(true) as HTMLElement;
            measureContainer.appendChild(tableClone);
            const combinedFits = measureContainer.scrollHeight <= CURRENT_MAX_HEIGHT;

            if (combinedFits) {
              pageElements.push(el);
              pageElements.push(tableEl);
              queue.shift();
              queue.shift();
              contentAdded = true;
              continue;
            } else {
              measureContainer.removeChild(tableClone);
              measureContainer.removeChild(clone);

              if (pageElements.length > 0) {
                break;
              }

              pageElements.push(el);
              queue.shift();
              measureContainer.appendChild(clone);

              const usedHeight = measureContainer.scrollHeight;
              const remainingHeight = CURRENT_MAX_HEIGHT - usedHeight - 20;

              const { wrapper: tempWrapper, inner: tempContainer } = makeMeasureNode();
              document.body.appendChild(tempWrapper);
              tempContainer.appendChild(tableEl.cloneNode(true));
              const naturalTableHeight = tempContainer.scrollHeight;
              document.body.removeChild(tempWrapper);

              const scaleFactor = Math.min(1, remainingHeight / naturalTableHeight);

              const wrapper = document.createElement('div');
              wrapper.style.width = '100%';
              wrapper.style.height = `${naturalTableHeight * scaleFactor}px`;
              wrapper.style.overflow = 'hidden';

              const scaledTable = tableEl.cloneNode(true) as HTMLElement;
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

          if (el.tagName === 'TABLE') {
            const currentHeight = measureContainer.scrollHeight;
            if (fits) {
              pageElements.push(el);
              queue.shift();
              contentAdded = true;
              continue;
            } else {
              measureContainer.removeChild(clone);

              if (pageElements.length > 0) {
                break;
              }

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

          if (fits && isHeading(el) && queue.length > 1) {
            const nextEl = queue[1];
            if (nextEl.tagName !== 'TABLE') {
              // Avoid an orphan heading at the very bottom, but DON'T require the
              // heading's entire following block to fit (that leaves big gaps).
              // Only require the heading + the first line/item to fit; long lists
              // and paragraphs then flow/split right under the heading.
              let probe: HTMLElement;
              if (nextEl.tagName === 'UL' || nextEl.tagName === 'OL') {
                probe = nextEl.cloneNode(false) as HTMLElement;
                if (nextEl.children[0]) {
                  probe.appendChild(nextEl.children[0].cloneNode(true));
                }
              } else {
                probe = nextEl.cloneNode(true) as HTMLElement;
              }
              measureContainer.appendChild(probe);
              const probeFits = measureContainer.scrollHeight <= CURRENT_MAX_HEIGHT;
              if (measureContainer.contains(probe)) measureContainer.removeChild(probe);
              if (!probeFits && pageElements.length > 0) {
                measureContainer.removeChild(clone);
                break;
              }
            }
          }

          if (fits) {
            pageElements.push(el);
            queue.shift();
            contentAdded = true;
          } else {
            measureContainer.removeChild(clone);

            const isList = el.tagName === 'UL' || el.tagName === 'OL';
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
                  partialList.removeChild(item);
                  break;
                }
              }

              if (itemsAdded) {
                // For ordered lists, keep numbering continuous across page
                // breaks by carrying a running offset.
                const isOrdered = el.tagName === 'OL';
                const baseOffset = isOrdered
                  ? parseInt(el.getAttribute('data-start-offset') || '0', 10)
                  : 0;

                const finalPartial = el.cloneNode(false) as HTMLElement;
                if (isOrdered) {
                  finalPartial.style.counterReset = `proposal-item ${baseOffset}`;
                }
                for (let i = 0; i < splitIndex; i++) {
                  finalPartial.appendChild(listItems[i].cloneNode(true));
                }
                pageElements.push(finalPartial);
                contentAdded = true;

                const remainingList = el.cloneNode(false) as HTMLElement;
                if (isOrdered) {
                  const nextOffset = baseOffset + splitIndex;
                  remainingList.style.counterReset = `proposal-item ${nextOffset}`;
                  remainingList.setAttribute('data-start-offset', String(nextOffset));
                }
                for (let i = splitIndex; i < listItems.length; i++) {
                  remainingList.appendChild(listItems[i].cloneNode(true));
                }
                queue[0] = remainingList;
                break;
              } else {
                measureContainer.removeChild(partialList);
              }
            }

            if (!contentAdded) {
              if (pageElements.length === 0) {
                pageElements.push(el);
                queue.shift();
              }
            }
            break;
          }
        }

        if (pageElements.length > 0) {
          chunks.push(pageElements.map((e) => e.outerHTML).join(''));
        } else {
          break;
        }
      }

      document.body.removeChild(sourceDiv);
      document.body.removeChild(measureWrapper);

      const finalChunks = chunks.length > 0 ? chunks : [page.content];
      setContentChunks(finalChunks);
      onPaginated?.(page.id, finalChunks.length);
    }
  }, [page.content, page.id, proseClasses, onPaginated]);

  return (
    <>
      {contentChunks.map((chunk, index) => {
        const pageNumber =
          startPageNumber !== undefined ? startPageNumber + index : undefined;

        const chunkIsArabic = /[\u0600-\u06FF]/.test(chunk);

        return (
          <ProposalPageShell
            key={index}
            title={page.title}
            pageNumber={pageNumber}
            totalPages={totalPages}
          >
            <div
              ref={index === 0 ? measureRef : null}
              className={proseClasses}
              dir={chunkIsArabic ? 'rtl' : undefined}
              style={{
                textAlign: chunkIsArabic ? 'right' : undefined,
                height: '100%',
              }}
              dangerouslySetInnerHTML={{ __html: chunk }}
            />
          </ProposalPageShell>
        );
      })}
    </>
  );
}
