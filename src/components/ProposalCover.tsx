import { Proposal } from '@/types';

/* eslint-disable @next/next/no-img-element */
export function ProposalCover({ proposal }: { proposal: Proposal }) {
  const isArabic = proposal.language === 'ar';
  
  const labels = {
    title: isArabic ? 'عرض\nالمشروع' : 'Project\nProposal',
    preparedFor: isArabic ? 'مُعد لـ:' : 'Prepared For:',
    preparedBy: isArabic ? 'مُعد بواسطة:' : 'Prepared By:',
    projectType: isArabic ? 'نوع المشروع:' : 'Project Type:',
    date: isArabic ? 'التاريخ:' : 'Date:',
  };

  return (
    <div className="w-[210mm] h-[297mm] relative bg-gray-50 overflow-hidden flex flex-col shadow-lg mb-8 print:shadow-none print:mb-0 page-break">
      {/* Blue Gradient Header */}
      <div className={`relative h-[280px] bg-gradient-to-r from-[#252E5D] to-[#0230F5] flex items-center justify-between px-16 ${isArabic ? 'flex-row-reverse' : ''}`}>
        {/* Title */}
        <h1 className={`text-6xl font-bold text-white leading-tight whitespace-pre-line ${isArabic ? 'text-right font-arabic' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
          {labels.title}
        </h1>
        
        {/* Logo */}
        <img 
          src="/assets/slides/logo_white_top.png" 
          alt="Clicks Digitals" 
          className="h-16 object-contain"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative px-16 py-16">
        {/* Info Section */}
        <div className="max-w-4xl">
          {/* Prepared For and Prepared By - Side by Side */}
          <div className={`grid grid-cols-2 gap-12 mb-8 ${isArabic ? 'text-right' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">{labels.preparedFor}</p>
              <p className={`text-gray-900 text-2xl font-bold ${isArabic ? 'font-arabic' : ''}`}>{proposal.prepared_for || proposal.cover?.preparedFor || 'Client Name'}</p>
            </div>

            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">{labels.preparedBy}</p>
              <p className={`text-gray-900 text-xl font-semibold ${isArabic ? 'font-arabic' : ''}`}>{proposal.prepared_by || proposal.cover?.preparedBy || 'Clicks Digitals'}</p>
            </div>
          </div>

          {/* Project Type and Date - Side by Side */}
          <div className={`grid grid-cols-2 gap-12 ${isArabic ? 'text-right' : ''}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">{labels.projectType}</p>
              <p className={`text-gray-900 text-xl font-semibold ${isArabic ? 'font-arabic' : ''}`}>{proposal.project_type || proposal.cover?.projectType || 'Development'}</p>
            </div>

            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">{labels.date}</p>
              <p className={`text-gray-900 text-xl font-semibold ${isArabic ? 'font-arabic' : ''}`}>{proposal.date || proposal.cover?.date || new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Footer Pattern */}
        <div className="absolute bottom-0 -right-4 w-[650px] h-[500px]">
          <img 
            src="/assets/slides/footer_right_pattern.png" 
            alt="" 
            className="w-full h-full object-contain object-right"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-16 text-gray-700 text-sm space-y-1 z-10">
        <p className="font-medium">www.clicksdigitals.com</p>
        <p className="font-medium">info@clicksdigitals.com</p>
      </div>
    </div>
  );
}
