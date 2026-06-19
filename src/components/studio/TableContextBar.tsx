'use client';

import {
  Columns3,
  Plus,
  Minus,
  Table2,
} from 'lucide-react';

interface TableContextBarProps {
  onAddRow: () => void;
  onRemoveRow: () => void;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  onDeleteTable: () => void;
}

function Action({
  label,
  onClick,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  onClick: () => void;
  icon: React.ElementType;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
        tone === 'danger'
          ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
          : 'text-[#334155] bg-white hover:bg-[#f8fafc] border border-[#e2e8f0]'
      }`}
    >
      <Icon size={14} className="shrink-0" />
      {label}
    </button>
  );
}

export function TableContextBar({
  onAddRow,
  onRemoveRow,
  onAddColumn,
  onRemoveColumn,
  onDeleteTable,
}: TableContextBarProps) {
  return (
    <div className="shrink-0 border-b border-[#dbeafe] bg-[#eff6ff] px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#1e40af] uppercase tracking-wide">
            Table
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-[#64748b] mr-1">Rows</span>
          <Action label="Add row" icon={Plus} onClick={onAddRow} />
          <Action label="Remove row" icon={Minus} onClick={onRemoveRow} />
        </div>

        <div className="hidden sm:block w-px h-6 bg-[#bfdbfe]" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-[#64748b] mr-1">Columns</span>
          <Action label="Add column" icon={Plus} onClick={onAddColumn} />
          <Action label="Remove column" icon={Columns3} onClick={onRemoveColumn} />
        </div>

        <div className="hidden sm:block w-px h-6 bg-[#bfdbfe]" />

        <Action
          label="Delete entire table"
          icon={Table2}
          onClick={onDeleteTable}
          tone="danger"
        />

        <span className="ml-auto hidden md:inline text-[11px] text-[#64748b]">
          Tip: drag a column border to resize it
        </span>
      </div>
    </div>
  );
}
