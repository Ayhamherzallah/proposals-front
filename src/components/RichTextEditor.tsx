'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize } from '@/lib/tiptap-font-size';
import { Fragment, Slice, type Node as PMNode } from '@tiptap/pm/model';
import { TableContextBar } from '@/components/studio/TableContextBar';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Table as TableIcon, Heading1, Heading2, Heading3,
  Undo, Redo, Palette, Highlighter, AlignLeft, AlignRight,
  Minus, Plus,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editorKey?: string;
}

const ARABIC_RE = /[\u0600-\u06FF]/;

// Tables are rendered/edited left-to-right so ProseMirror's (LTR-only) column
// resizing works smoothly. For an RTL document we reverse the columns of any
// pasted table so it keeps the SAME visual order as the user's source.
function reverseTableColumns(node: PMNode): PMNode {
  if (node.type.name === 'table') {
    let hasSpan = false;
    node.descendants((n) => {
      if ((n.attrs?.colspan ?? 1) > 1 || (n.attrs?.rowspan ?? 1) > 1) hasSpan = true;
    });
    // Skip merged-cell tables to avoid corrupting the layout.
    if (hasSpan) return node;

    const rows: PMNode[] = [];
    node.forEach((row) => {
      const cells: PMNode[] = [];
      row.forEach((cell) => cells.push(cell));
      cells.reverse();
      rows.push(row.copy(Fragment.fromArray(cells)));
    });
    return node.copy(Fragment.fromArray(rows));
  }

  if (node.childCount > 0) {
    const children: PMNode[] = [];
    node.forEach((child) => children.push(reverseTableColumns(child)));
    return node.copy(Fragment.fromArray(children));
  }

  return node;
}

function ToolBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 min-w-8 px-2 inline-flex items-center justify-center rounded-md text-sm transition-colors disabled:opacity-30 ${
        active
          ? 'bg-[#252E5D] text-white'
          : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
      }`}
    >
      {children}
    </button>
  );
}

function ToolSep() {
  return <div className="w-px h-5 bg-[#e2e8f0] mx-1 shrink-0" />;
}

export function RichTextEditor({ content, onChange, editorKey }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [inTable, setInTable] = useState(false);

  const isRtl = !!content && ARABIC_RE.test(content);
  const isRtlRef = useRef(isRtl);
  isRtlRef.current = isRtl;

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      transformPasted(slice) {
        // Reverse table columns when the document OR the pasted content is
        // Arabic, so an RTL table keeps the same visual order as the source
        // (first column on the right) even on an otherwise-empty page.
        const pastedText = slice.content.textBetween(0, slice.content.size, '\n', ' ');
        const rtl = isRtlRef.current || ARABIC_RE.test(pastedText);
        if (!rtl) return slice;
        const children: PMNode[] = [];
        slice.content.forEach((child) => children.push(reverseTableColumns(child)));
        return new Slice(Fragment.fromArray(children), slice.openStart, slice.openEnd);
      },
    },
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { HTMLAttributes: { class: 'bullet-list' } },
        orderedList: { HTMLAttributes: { class: 'ordered-list' } },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'bulletList', 'orderedList', 'listItem'],
        alignments: ['left', 'center', 'right'],
      }),
      Table.configure({
        resizable: true,
        handleWidth: 6,
        cellMinWidth: 48,
        HTMLAttributes: { class: 'premium-table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
      setInTable(ed.isActive('table'));
    },
    onSelectionUpdate: ({ editor: ed }) => {
      setInTable(ed.isActive('table'));
    },
  }, [editorKey]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Navy', value: '#252E5D' },
    { name: 'Brand Blue', value: '#0230F5' },
    { name: 'Gray', value: '#64748b' },
  ];

  const highlightColors = [
    { name: 'Light Blue', value: '#DBEAFE' },
    { name: 'Gray', value: '#F3F4F6' },
    { name: 'None', value: 'transparent' },
  ];

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
    setShowTableModal(false);
    setTableRows(3);
    setTableCols(3);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#e8ebf0]">
      {/* Format bar — full width, fixed height */}
      <div className="shrink-0 bg-white border-b border-[#e2e8f0] px-4 py-2">
        <div className="flex flex-wrap items-center gap-0.5">
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
            <Bold size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
            <Italic size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
            <UnderlineIcon size={15} />
          </ToolBtn>

          <ToolSep />

          <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
            <Heading1 size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
            <Heading2 size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
            <Heading3 size={15} />
          </ToolBtn>

          <ToolSep />

          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
            <List size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
            <ListOrdered size={15} />
          </ToolBtn>

          <ToolSep />

          <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align left">
            <AlignLeft size={15} />
          </ToolBtn>
          <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align right">
            <AlignRight size={15} />
          </ToolBtn>

          <ToolSep />

          <div className="relative">
            <ToolBtn onClick={() => { setShowHighlightPicker(false); setShowColorPicker(!showColorPicker); }} title="Text color">
              <Palette size={15} />
            </ToolBtn>
            {showColorPicker && (
              <div className="absolute top-9 left-0 z-50 bg-white border border-[#e2e8f0] rounded-lg shadow-xl p-2 flex gap-1.5">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.name}
                    onClick={() => { editor.chain().focus().setColor(color.value).run(); setShowColorPicker(false); }}
                    className="w-7 h-7 rounded-md border border-[#e2e8f0]"
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <ToolBtn onClick={() => { setShowColorPicker(false); setShowHighlightPicker(!showHighlightPicker); }} title="Highlight">
              <Highlighter size={15} />
            </ToolBtn>
            {showHighlightPicker && (
              <div className="absolute top-9 left-0 z-50 bg-white border border-[#e2e8f0] rounded-lg shadow-xl p-2 flex gap-1.5">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    title={color.name}
                    onClick={() => {
                      if (color.value === 'transparent') editor.chain().focus().unsetHighlight().run();
                      else editor.chain().focus().setHighlight({ color: color.value }).run();
                      setShowHighlightPicker(false);
                    }}
                    className="w-7 h-7 rounded-md border border-[#e2e8f0]"
                    style={{ backgroundColor: color.value === 'transparent' ? '#fff' : color.value }}
                  />
                ))}
              </div>
            )}
          </div>

          <ToolSep />

          <ToolBtn onClick={() => setShowTableModal(true)} title="Insert table">
            <TableIcon size={15} />
          </ToolBtn>

          <ToolSep />

          <ToolBtn disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo size={15} />
          </ToolBtn>
          <ToolBtn disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo size={15} />
          </ToolBtn>
        </div>
      </div>

      {inTable && (
        <TableContextBar
          onAddRow={() => editor.chain().focus().addRowAfter().run()}
          onRemoveRow={() => editor.chain().focus().deleteRow().run()}
          onAddColumn={() => editor.chain().focus().addColumnAfter().run()}
          onRemoveColumn={() => editor.chain().focus().deleteColumn().run()}
          onDeleteTable={() => {
            if (confirm('Delete this entire table?')) {
              editor.chain().focus().deleteTable().run();
            }
          }}
        />
      )}

      {/* Canvas — centered A4 sheet */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 studio-canvas px-5 py-8"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="mx-auto w-full max-w-[820px]">
          <div className="studio-artboard studio-page-sheet bg-white overflow-hidden min-h-[1160px]">
            <EditorContent
              editor={editor}
              className="studio-editor max-w-none px-14 py-14 focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[1000px] [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-6"
            />
          </div>
        </div>
      </div>

      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-[#e2e8f0]">
            <h3 className="text-base font-semibold text-[#0f172a] mb-1">Insert table</h3>
            <p className="text-sm text-[#64748b] mb-5">Tables fit the page width automatically.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-2">Rows</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setTableRows(Math.max(1, tableRows - 1))} className="p-2 rounded-lg bg-[#f1f5f9]"><Minus size={14} /></button>
                  <input type="number" value={tableRows} onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-lg text-center text-sm" min={1} max={20} />
                  <button type="button" onClick={() => setTableRows(Math.min(20, tableRows + 1))} className="p-2 rounded-lg bg-[#f1f5f9]"><Plus size={14} /></button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-2">Columns</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setTableCols(Math.max(1, tableCols - 1))} className="p-2 rounded-lg bg-[#f1f5f9]"><Minus size={14} /></button>
                  <input type="number" value={tableCols} onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-lg text-center text-sm" min={1} max={8} />
                  <button type="button" onClick={() => setTableCols(Math.min(8, tableCols + 1))} className="p-2 rounded-lg bg-[#f1f5f9]"><Plus size={14} /></button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={() => setShowTableModal(false)} className="flex-1 py-2.5 rounded-lg border border-[#e2e8f0] text-sm font-medium text-[#475569]">Cancel</button>
              <button type="button" onClick={insertTable} className="flex-1 py-2.5 rounded-lg bg-[#252E5D] text-white text-sm font-semibold">Insert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
