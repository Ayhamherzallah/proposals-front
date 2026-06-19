import { Proposal } from '@/types';

/* eslint-disable @next/next/no-img-element */
export function ProposalCover({ proposal }: { proposal: Proposal }) {
  const isArabic = proposal.language === 'ar';

  const labels = {
    eyebrow: isArabic ? 'عرض تجاري' : 'Commercial Proposal',
    preparedFor: isArabic ? 'مُعد حصرياً لـ' : 'Prepared exclusively for',
    projectType: isArabic ? 'نوع المشروع' : 'Project',
    date: isArabic ? 'التاريخ' : 'Date',
    preparedBy: isArabic ? 'مُعد بواسطة' : 'Prepared by',
  };

  const client = proposal.prepared_for || proposal.cover?.preparedFor || 'Client Name';
  const projectType = proposal.project_type || proposal.cover?.projectType || 'Development';
  const date = proposal.date || proposal.cover?.date || new Date().toLocaleDateString();
  const preparedBy = proposal.prepared_by || proposal.cover?.preparedBy || 'Clicks Digitals';

  return (
    <div className="proposal-page w-[210mm] h-[297mm] relative bg-white overflow-hidden flex flex-col shadow-[0_12px_48px_rgba(37,46,93,0.14)] mb-8 print:shadow-none print:mb-0 page-break">
      <div className={`flex flex-1 min-h-0 ${isArabic ? 'flex-row-reverse' : ''}`}>
        {/* Brand panel */}
        <aside className="relative w-[38%] shrink-0 bg-gradient-to-b from-[#252E5D] to-[#0230F5] flex flex-col justify-between p-10 print:bg-gradient-to-b">
          <div className={`absolute inset-0 opacity-20 pointer-events-none ${isArabic ? 'scale-x-[-1]' : ''}`}>
            <img src="/assets/slides/headers_right_pattern.png" alt="" className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10">
            <img src="/assets/slides/logo_white_top.png" alt="Clicks Digitals" className="h-32 object-contain mb-12" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50 mb-3">
              {labels.eyebrow}
            </p>
            <h1 className={`text-[2rem] font-bold text-white leading-[1.15] ${isArabic ? 'font-arabic text-right' : ''}`}>
              {isArabic ? 'عرض المشروع' : 'Project Proposal'}
            </h1>
          </div>

          <div className={`relative z-10 space-y-1 text-white/70 text-[11px] ${isArabic ? 'text-right' : ''}`}>
            <p>www.clicksdigitals.com</p>
            <p>info@clicksdigitals.com</p>
          </div>
        </aside>

        {/* Client panel */}
        <main
          className="flex-1 flex flex-col justify-center px-12 py-10 relative bg-white"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0230F5] mb-4">
            {labels.preparedFor}
          </p>
          <h2 className={`text-[2.5rem] font-bold text-[#1a2347] leading-[1.1] mb-12 max-w-md ${isArabic ? 'font-arabic' : ''}`}>
            {client}
          </h2>

          <div className="space-y-6 max-w-md">
            <div className={`flex items-start gap-4 pb-6 border-b border-[#e8edf5] ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#252E5D] to-[#0230F5] shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1">{labels.projectType}</p>
                <p className={`text-lg font-semibold text-[#1e293b] ${isArabic ? 'font-arabic' : ''}`}>{projectType}</p>
              </div>
            </div>
            <div className={`flex items-start gap-4 pb-6 border-b border-[#e8edf5] ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#252E5D] to-[#0230F5] shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1">{labels.date}</p>
                <p className={`text-lg font-semibold text-[#1e293b] ${isArabic ? 'font-arabic' : ''}`}>{date}</p>
              </div>
            </div>
            <div className={`flex items-start gap-4 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
              <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#252E5D] to-[#0230F5] shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] mb-1">{labels.preparedBy}</p>
                <p className={`text-lg font-semibold text-[#1e293b] ${isArabic ? 'font-arabic' : ''}`}>{preparedBy}</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-[600px] h-[440px] opacity-15 pointer-events-none">
            <img src="/assets/slides/footer_right_pattern.png" alt="" className="w-full h-full object-contain object-right-bottom" />
          </div>
        </main>
      </div>
    </div>
  );
}
