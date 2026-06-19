import { ProposalContentPage } from '@/types';
import { ProposalPageShell } from './ProposalPageShell';

interface ProcessPageProps {
  page: ProposalContentPage;
  pageNumber?: number;
  totalPages?: number;
}

export function ProcessPage({ page, pageNumber, totalPages }: ProcessPageProps) {
  const isArabic = /[\u0600-\u06FF]/.test(page.content || page.title);

  return (
    <ProposalPageShell
      title={page.title}
      pageNumber={pageNumber}
      totalPages={totalPages}
    >
      <div
        className="process-display h-full"
        dir={isArabic ? 'rtl' : 'ltr'}
        style={{ textAlign: isArabic ? 'right' : undefined }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </ProposalPageShell>
  );
}
