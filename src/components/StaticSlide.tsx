/* eslint-disable @next/next/no-img-element */
// The user has images 2.png through 13.png
// We render them as full page images

export function StaticSlide({ index }: { index: number }) {
  // index is 2 through 13
  return (
    <div className="w-[210mm] h-[297mm] relative bg-white overflow-hidden flex flex-col shadow-lg mb-8 print:shadow-none print:mb-0 page-break">
      <img 
        src={`/assets/slides/${index}.png`} 
        alt={`Slide ${index}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
