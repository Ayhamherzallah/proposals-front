'use client';

interface StudioCanvasProps {
  children: React.ReactNode;
  centered?: boolean;
  bleed?: boolean;
}

export function StudioCanvas({ children, centered = true, bleed = false }: StudioCanvasProps) {
  return (
    <div className={`studio-canvas flex-1 min-h-0 overflow-y-auto ${bleed ? '' : 'p-6 lg:p-10'}`}>
      <div className={centered && !bleed ? 'max-w-[920px] mx-auto' : 'h-full min-h-0'}>
        {children}
      </div>
    </div>
  );
}
