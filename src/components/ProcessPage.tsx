import { ProposalContentPage } from '@/types';

interface ProcessPageProps {
  page: ProposalContentPage;
}

function PageHeader({ title }: { title: string }) {
  return (
    <div className="relative h-48 bg-gradient-to-r from-[#252E5D] to-[#0230F5] overflow-hidden flex-shrink-0">
      <div className="absolute top-0 right-0 h-full w-auto">
        <img 
          src="/assets/slides/headers_right_pattern.png" 
          alt="" 
          className="h-full w-auto object-cover opacity-40"
        />
      </div>
      <div className="relative z-10 h-full flex flex-col justify-center px-10">
        <h1 className="text-4xl font-bold text-white">{title}</h1>
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

export function ProcessPage({ page }: ProcessPageProps) {
  return (
    <div className="w-[210mm] h-[297mm] bg-white flex flex-col page-break shadow-lg mb-8 print:shadow-none print:mb-0">
      <PageHeader title={page.title} />
      
      <div className="flex-1 px-10 py-8 overflow-hidden bg-gray-50">
        <div 
          className="process-display"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      <PageFooter />
    </div>
  );
}
