/* eslint-disable @next/next/no-img-element */

interface ProposalPageShellProps {
  title: string;
  children: React.ReactNode;
  pageNumber?: number;
  totalPages?: number;
  showHeader?: boolean;
}

function isArabicText(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

export function ProposalPageHeader({
  title,
  pageNumber,
}: {
  title: string;
  pageNumber?: number;
}) {
  const isArabic = isArabicText(title);

  return (
    <header className="shrink-0 relative overflow-hidden bg-gradient-to-r from-[#252E5D] to-[#0230F5] px-14 pt-7 pb-6 print:bg-gradient-to-r">
      <div
        className={`absolute inset-0 opacity-[0.12] pointer-events-none ${isArabic ? 'scale-x-[-1]' : ''}`}
      >
        <img
          src="/assets/slides/headers_right_pattern.png"
          alt=""
          className="w-full h-full object-cover object-right"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>

      <div className={`relative z-10 flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
        <img
          src="/assets/slides/logo_white_top.png"
          alt="Clicks Digitals"
          className="h-8 object-contain shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/55">
          {isArabic ? 'عرض المشروع' : 'Project Proposal'}
        </span>
      </div>

      <div className="relative z-10 mt-4 h-px bg-white/15" />

      <div className={`relative z-10 mt-4 flex items-end justify-between gap-6 ${isArabic ? 'flex-row-reverse' : ''}`}>
        <div className={isArabic ? 'text-right' : 'text-left'}>
          <h1
            className={`text-[1.6rem] font-bold text-white leading-tight ${isArabic ? 'font-arabic' : ''}`}
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            {title}
          </h1>
          <div
            className={`mt-2.5 h-[3px] w-12 rounded-full bg-white/70 ${isArabic ? 'ml-auto' : ''}`}
          />
        </div>
        {pageNumber !== undefined && (
          <span className="shrink-0 text-[2.25rem] font-bold leading-none text-white/15 tabular-nums select-none">
            {String(pageNumber).padStart(2, '0')}
          </span>
        )}
      </div>
    </header>
  );
}

export function ProposalPageFooter({
  pageNumber,
  totalPages,
}: {
  pageNumber?: number;
  totalPages?: number;
}) {
  return (
    <footer className="shrink-0 mt-auto px-14 pb-7 pt-4">
      <div className="h-px bg-[#e8edf5]" />
      <div className="mt-3 flex items-center justify-between text-[9.5px]">
        <span className="font-bold uppercase tracking-[0.2em] text-[#252E5D]">
          Clicks Digitals
        </span>
        <span className="text-[#aab2c5] font-medium tracking-wide">www.clicksdigitals.com</span>
        {pageNumber !== undefined && (
          <span className="font-semibold text-[#252E5D] tabular-nums">
            {totalPages !== undefined ? `${pageNumber} / ${totalPages}` : pageNumber}
          </span>
        )}
      </div>
    </footer>
  );
}

export function ProposalPageShell({
  title,
  children,
  pageNumber,
  totalPages,
  showHeader = true,
}: ProposalPageShellProps) {
  return (
    <article className="proposal-page w-[210mm] h-[297mm] bg-white flex flex-col page-break shadow-[0_12px_48px_rgba(37,46,93,0.14)] mb-8 last:mb-0 print:shadow-none print:mb-0 mx-auto overflow-hidden">
      {showHeader && <ProposalPageHeader title={title} pageNumber={pageNumber} />}
      <div className="flex-1 min-h-0 px-14 py-7 overflow-hidden">{children}</div>
      <ProposalPageFooter pageNumber={pageNumber} totalPages={totalPages} />
    </article>
  );
}

export const proposalProseClasses = `
  proposal-prose max-w-none
  text-[15px] leading-[1.68] text-[#475569] font-sans

  [&_h1]:text-[1.375rem] [&_h1]:font-bold [&_h1]:text-[#252E5D] [&_h1]:mb-4 [&_h1]:mt-5
  [&_h2]:text-[1.125rem] [&_h2]:font-bold [&_h2]:text-[#252E5D] [&_h2]:mb-3 [&_h2]:mt-5
  [&_h3]:text-[1rem] [&_h3]:font-semibold [&_h3]:text-[#252E5D] [&_h3]:mb-2 [&_h3]:mt-4
  [&_p]:mb-3 [&_p]:text-[#475569]

  [&_ul]:my-3 [&_ul]:space-y-2 [&_ul]:list-none
  [&_ol]:my-3 [&_ol]:space-y-2 [&_ol]:list-none

  [&_li]:relative [&_li]:text-[#334155]
  [&_ul>li]:pl-5
  [&_ul>li]:before:content-[''] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:top-[0.65em] [&_ul>li]:before:w-1.5 [&_ul>li]:before:h-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-[#0230F5]

  [&_strong]:font-semibold [&_strong]:text-[#252E5D]
  [&_a]:text-[#0230F5] [&_a]:font-medium
  [&_blockquote]:my-4 [&_blockquote]:pl-4 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#0230F5] [&_blockquote]:text-[#475569]

  [&_.proposal-section-label]:block [&_.proposal-section-label]:text-[10px] [&_.proposal-section-label]:font-bold [&_.proposal-section-label]:uppercase [&_.proposal-section-label]:tracking-[0.22em] [&_.proposal-section-label]:text-[#0230F5] [&_.proposal-section-label]:border-l-2 [&_.proposal-section-label]:border-[#0230F5] [&_.proposal-section-label]:pl-3 [&_.proposal-section-label]:mt-7 [&_.proposal-section-label]:mb-4

  [&_.proposal-two-col]:grid [&_.proposal-two-col]:grid-cols-2 [&_.proposal-two-col]:gap-8 [&_.proposal-two-col]:my-5
  [&_.proposal-note]:text-[12px] [&_.proposal-note]:text-[#64748b] [&_.proposal-note]:mt-5 [&_.proposal-note]:italic
`.trim();
