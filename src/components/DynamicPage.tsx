'use client';

import { ProposalContentPage } from '@/types';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

const SAFETY_MARGIN = 32;

function isHeading(el: HTMLElement) {
  return /^H[1-6]$/.test(el.tagName);
}

function getTableBodyRows(table: HTMLTableElement): HTMLTableRowElement[] {
  const tbody = table.querySelector('tbody');
  if (tbody) return Array.from(tbody.querySelectorAll('tr'));
  const allRows = Array.from(table.querySelectorAll('tr'));
  const thead = table.querySelector('thead');
  if (thead) {
    const headerCount = thead.querySelectorAll('tr').length;
    return allRows.slice(headerCount);
  }
  if (allRows[0]?.querySelector('th')) return allRows.slice(1);
  return allRows;
}

function buildPartialTable(
  table: HTMLTableElement,
  bodyRows: HTMLTableRowElement[]
): HTMLTableElement {
  const clone = table.cloneNode(false) as HTMLTableElement;
  clone.className = table.className;

  const colgroup = table.querySelector('colgroup');
  if (colgroup) clone.appendChild(colgroup.cloneNode(true));

  const thead = table.querySelector('thead');
  if (thead) {
    clone.appendChild(thead.cloneNode(true));
  } else {
    const allRows = Array.from(table.querySelectorAll('tr'));
    const firstRow = allRows[0];
    if (firstRow?.querySelector('th')) {
      const headerSection = document.createElement('thead');
      headerSection.appendChild(firstRow.cloneNode(true));
      clone.appendChild(headerSection);
    }
  }

  const tbody = document.createElement('tbody');
  bodyRows.forEach((row) => tbody.appendChild(row.cloneNode(true)));
  clone.appendChild(tbody);
  return clone;
}

function measureContentHeight(container: HTMLElement) {
  return container.scrollHeight;
}

function setContainerHtml(container: HTMLElement, elements: HTMLElement[]) {
  container.innerHTML = elements.map((e) => e.outerHTML).join('');
}

function paginateHtmlContent(
  html: string,
  proseClasses: string,
  maxHeight: number
): string[] {
  const sourceDiv = document.createElement('div');
  sourceDiv.innerHTML = html;
  sourceDiv.className = proseClasses;

  const measureWrapper = document.createElement('div');
  measureWrapper.className = 'page-break';
  measureWrapper.style.cssText = `
    position: absolute;
    visibility: hidden;
    top: 0;
    left: 0;
    width: 210mm;
    padding: 28px 56px;
    box-sizing: border-box;
  `;

  const measureContainer = document.createElement('div');
  measureContainer.className = proseClasses;
  measureWrapper.appendChild(measureContainer);
  document.body.appendChild(measureWrapper);

  const chunks: string[] = [];
  const queue = Array.from(sourceDiv.children) as HTMLElement[];

  const fitsInPage = (elements: HTMLElement[]) => {
    setContainerHtml(measureContainer, elements);
    return measureContentHeight(measureContainer) <= maxHeight;
  };

  const trimPageUntilFits = (pageElements: HTMLElement[], elementQueue: HTMLElement[]) => {
    while (pageElements.length > 0 && !fitsInPage(pageElements)) {
      const last = pageElements.pop();
      if (last) elementQueue.unshift(last);
    }
  };

  const splitTableOntoPage = (
    table: HTMLTableElement,
    pageElements: HTMLElement[],
    elementQueue: HTMLElement[]
  ): boolean => {
    const bodyRows = getTableBodyRows(table);
    if (bodyRows.length === 0) {
      pageElements.push(table.cloneNode(true) as HTMLTableElement);
      elementQueue.shift();
      return true;
    }

    let splitIndex = 0;
    for (let i = 0; i < bodyRows.length; i++) {
      const candidate = buildPartialTable(table, bodyRows.slice(0, i + 1));
      setContainerHtml(measureContainer, [...pageElements, candidate]);
      if (measureContentHeight(measureContainer) <= maxHeight) {
        splitIndex = i + 1;
      } else {
        break;
      }
    }

    if (splitIndex === 0) {
      // At least one row must appear; put the table on the next page instead.
      if (pageElements.length > 0) return false;
      splitIndex = 1;
    }

    pageElements.push(buildPartialTable(table, bodyRows.slice(0, splitIndex)));

    if (splitIndex < bodyRows.length) {
      elementQueue[0] = buildPartialTable(table, bodyRows.slice(splitIndex));
    } else {
      elementQueue.shift();
    }
    return true;
  };

  while (queue.length > 0) {
    const pageElements: HTMLElement[] = [];

    while (queue.length > 0) {
      const el = queue[0];
      const candidate = [...pageElements, el];

      if (fitsInPage(candidate)) {
        if (isHeading(el) && queue.length > 1 && queue[1].tagName === 'TABLE') {
          const withTable = [...pageElements, el, queue[1]];
          if (fitsInPage(withTable)) {
            pageElements.push(el);
            pageElements.push(queue[1]);
            queue.shift();
            queue.shift();
            continue;
          }
          if (pageElements.length > 0) break;
        }

        if (isHeading(el) && queue.length > 1 && queue[1].tagName !== 'TABLE') {
          const nextEl = queue[1];
          let probe: HTMLElement;
          if (nextEl.tagName === 'UL' || nextEl.tagName === 'OL') {
            probe = nextEl.cloneNode(false) as HTMLElement;
            if (nextEl.children[0]) {
              probe.appendChild(nextEl.children[0].cloneNode(true));
            }
          } else {
            probe = nextEl.cloneNode(true) as HTMLElement;
          }
          setContainerHtml(measureContainer, [...pageElements, el, probe]);
          const probeFits = measureContentHeight(measureContainer) <= maxHeight;
          if (!probeFits && pageElements.length > 0) break;
        }

        pageElements.push(el);
        queue.shift();
        continue;
      }

      // Doesn't fit — try splitting lists
      if ((el.tagName === 'UL' || el.tagName === 'OL') && el.children.length > 0) {
        const listItems = Array.from(el.children);
        let splitIndex = 0;

        for (let i = 0; i < listItems.length; i++) {
          const partialList = el.cloneNode(false) as HTMLElement;
          for (let j = 0; j <= i; j++) {
            partialList.appendChild(listItems[j].cloneNode(true));
          }
          setContainerHtml(measureContainer, [...pageElements, partialList]);
          if (measureContentHeight(measureContainer) <= maxHeight) {
            splitIndex = i + 1;
          } else {
            break;
          }
        }

        if (splitIndex > 0) {
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
        }
      }

      if (el.tagName === 'TABLE') {
        if (pageElements.length > 0) break;
        if (splitTableOntoPage(el as HTMLTableElement, pageElements, queue)) break;
        continue;
      }

      if (pageElements.length > 0) break;

      // Single oversized block on an empty page — push to next page via row split or force one element
      if (el.tagName === 'TABLE') {
        splitTableOntoPage(el as HTMLTableElement, pageElements, queue);
      } else {
        pageElements.push(el);
        queue.shift();
      }
      break;
    }

    trimPageUntilFits(pageElements, queue);

    if (pageElements.length === 0 && queue.length > 0) {
      const el = queue[0];
      if (el.tagName === 'TABLE') {
        splitTableOntoPage(el as HTMLTableElement, pageElements, queue);
        trimPageUntilFits(pageElements, queue);
      } else {
        pageElements.push(el);
        queue.shift();
      }
    }

    if (pageElements.length > 0) {
      chunks.push(pageElements.map((e) => e.outerHTML).join(''));
    } else {
      break;
    }
  }

  document.body.removeChild(measureWrapper);
  return chunks.length > 0 ? chunks : [html];
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

  const [contentChunks, setContentChunks] = useState<string[] | null>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const proseClasses = proposalProseClasses;

  const runPagination = useCallback(() => {
    const contentWrapper = measureRef.current?.parentElement as HTMLElement | null;
    if (!contentWrapper) return;

    const cs = getComputedStyle(contentWrapper);
    const padY =
      parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');
    const usable = contentWrapper.clientHeight - padY - SAFETY_MARGIN;
    if (usable < 200) return;

    const maxHeight = Math.round(usable);
    const chunks = paginateHtmlContent(page.content, proseClasses, maxHeight);
    setContentChunks(chunks);
    onPaginated?.(page.id, chunks.length);
  }, [page.content, page.id, proseClasses, onPaginated]);

  useLayoutEffect(() => {
    runPagination();
  }, [runPagination]);

  useEffect(() => {
    const wrapper = measureRef.current?.parentElement;
    if (!wrapper) return;

    const observer = new ResizeObserver(() => {
      runPagination();
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [runPagination, contentChunks]);

  if (contentChunks === null) {
    return (
      <ProposalPageShell
        title={page.title}
        pageNumber={startPageNumber}
        totalPages={totalPages}
      >
        <div ref={measureRef} className={`${proseClasses} proposal-page-content`} aria-hidden />
      </ProposalPageShell>
    );
  }

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
              className={`${proseClasses} proposal-page-content`}
              dir={chunkIsArabic ? 'rtl' : undefined}
              style={{ textAlign: chunkIsArabic ? 'right' : undefined }}
              dangerouslySetInnerHTML={{ __html: chunk }}
            />
          </ProposalPageShell>
        );
      })}
    </>
  );
}
