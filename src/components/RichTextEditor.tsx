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
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Table as TableIcon, Heading1, Heading2, Heading3,
  Undo, Redo, Palette, Highlighter, Type, Trash2, Plus, Minus,
  ChevronDown, AlignLeft, AlignRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editorKey?: string;
}

export function RichTextEditor({ content, onChange, editorKey }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'premium-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  }, [editorKey]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#374151' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Light Gray', value: '#9CA3AF' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Dark Red', value: '#DC2626' },
    { name: 'Navy', value: '#252E5D' },
    { name: 'Brand Blue', value: '#0230F5' },
    { name: 'Sky Blue', value: '#3B82F6' },
    { name: 'Light Blue', value: '#60A5FA' },
    { name: 'Pale Blue', value: '#93C5FD' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Teal', value: '#14B8A6' },
  ];

  const highlightColors = [
    { name: 'Light Blue', value: '#DBEAFE' },
    { name: 'Pale Blue', value: '#BFDBFE' },
    { name: 'Sky', value: '#E0F2FE' },
    { name: 'Indigo', value: '#E0E7FF' },
    { name: 'Purple', value: '#EDE9FE' },
    { name: 'Red', value: '#FEE2E2' },
    { name: 'Gray', value: '#F3F4F6' },
    { name: 'None', value: 'transparent' },
  ];

  const fontSizes = [
    { label: 'Small', value: '14px' },
    { label: 'Normal', value: '16px' },
    { label: 'Medium', value: '18px' },
    { label: 'Large', value: '20px' },
    { label: 'Extra Large', value: '24px' },
    { label: 'Huge', value: '32px' },
  ];

  const insertTable = () => {
    editor.chain().focus().insertTable({ 
      rows: tableRows, 
      cols: tableCols, 
      withHeaderRow: true 
    }).run();
    setShowTableModal(false);
    setTableRows(3);
    setTableCols(3);
  };

  return (
    <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-lg">
      {/* Premium Toolbar */}
      <div className="border-b-2 border-gray-200 p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        <div className="flex flex-wrap gap-3">
          {/* Text Formatting */}
          <div className="flex gap-1.5 border-r-2 border-gray-200 pr-3">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all ${
                editor.isActive('bold') ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Bold (Ctrl+B)"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all ${
                editor.isActive('italic') ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Italic (Ctrl+I)"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all ${
                editor.isActive('underline') ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon size={18} />
            </button>
          </div>

          {/* Font Size */}
          <div className="flex gap-1.5 border-r-2 border-gray-200 pr-3 relative">
            <button
              onClick={() => {
                setShowFontSizePicker(!showFontSizePicker);
                setShowColorPicker(false);
                setShowHighlightPicker(false);
              }}
              className="px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all text-gray-700 hover:scale-105 flex items-center gap-2 font-medium"
              type="button"
              title="Font Size"
            >
              <Type size={18} />
              <ChevronDown size={14} />
            </button>
            {showFontSizePicker && (
              <div className="absolute top-14 left-0 z-50 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-2 min-w-[160px]">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => {
                      editor.chain().focus().setMark('textStyle', { fontSize: size.value }).run();
                      setShowFontSizePicker(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                    type="button"
                  >
                    <span style={{ fontSize: size.value }}>{size.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Headings */}
          <div className="flex gap-1.5 border-r-2 border-gray-200 pr-3">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all font-bold ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all font-bold ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-all font-bold ${
                editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Heading 3"
            >
              H3
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1.5 border-r-2 border-gray-200 pr-3">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all ${
                editor.isActive('bulletList') ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Bullet List"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all ${
                editor.isActive('orderedList') ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </button>
          </div>

          {/* Text Direction (RTL/LTR) */}
          <div className="flex gap-1.5 border-r-2 border-gray-200 pr-3">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all ${
                editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Left to Right (LTR)"
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`p-2.5 rounded-xl hover:bg-gray-100 transition-all ${
                editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-700 hover:scale-105'
              }`}
              type="button"
              title="Right to Left (RTL)"
            >
              <AlignRight size={18} />
            </button>
          </div>

          {/* Colors */}
          <div className="flex gap-1.5 border-r-2 border-gray-200 pr-3 relative">
            <div className="relative">
              <button
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowHighlightPicker(false);
                  setShowFontSizePicker(false);
                }}
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-all text-gray-700 hover:scale-105"
                type="button"
                title="Text Color"
              >
                <Palette size={18} />
              </button>
              {showColorPicker && (
                <div className="absolute top-14 left-0 z-50 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-5 w-[360px] max-h-[480px] overflow-y-auto">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Text Color</div>
                  <div className="grid grid-cols-5 gap-3 pb-2">
                    {textColors.map((color) => (
                      <div key={color.value} className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => {
                            editor.chain().focus().setColor(color.value).run();
                            setShowColorPicker(false);
                          }}
                          className="group relative"
                          type="button"
                          title={color.name}
                        >
                          <div 
                            className="w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:scale-110 transition-all shadow-md hover:shadow-lg"
                            style={{ backgroundColor: color.value }}
                          />
                        </button>
                        <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowColorPicker(false);
                  setShowFontSizePicker(false);
                }}
                className="p-2.5 rounded-xl hover:bg-gray-100 transition-all text-gray-700 hover:scale-105"
                type="button"
                title="Highlight"
              >
                <Highlighter size={18} />
              </button>
              {showHighlightPicker && (
                <div className="absolute top-14 left-0 z-50 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-5 w-[360px] max-h-[400px] overflow-y-auto">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Highlight Color</div>
                  <div className="grid grid-cols-4 gap-3 pb-2">
                    {highlightColors.map((color) => (
                      <div key={color.value} className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => {
                            if (color.value === 'transparent') {
                              editor.chain().focus().unsetHighlight().run();
                            } else {
                              editor.chain().focus().setHighlight({ color: color.value }).run();
                            }
                            setShowHighlightPicker(false);
                          }}
                          className="group relative"
                          type="button"
                          title={color.name}
                        >
                          <div 
                            className={`w-12 h-12 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:scale-110 transition-all shadow-md hover:shadow-lg flex items-center justify-center ${
                              color.value === 'transparent' ? 'bg-white' : ''
                            }`}
                            style={{ backgroundColor: color.value !== 'transparent' ? color.value : 'white' }}
                          >
                            {color.value === 'transparent' && <span className="text-red-500 font-bold text-xl">✕</span>}
                          </div>
                        </button>
                        <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="flex gap-1.5 border-r-2 border-gray-200 pr-3">
            <button
              onClick={() => setShowTableModal(true)}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all text-gray-700 hover:scale-105"
              type="button"
              title="Insert Table"
            >
              <TableIcon size={18} />
            </button>
            {editor.isActive('table') && (
              <>
                <button
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  className="p-2.5 rounded-xl hover:bg-green-100 transition-all text-green-600 hover:scale-105"
                  type="button"
                  title="Add Row Above"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="p-2.5 rounded-xl hover:bg-red-100 transition-all text-red-600 hover:scale-105"
                  type="button"
                  title="Delete Row"
                >
                  <Minus size={18} />
                </button>
                <button
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="p-2.5 rounded-xl hover:bg-red-100 transition-all text-red-600 hover:scale-105"
                  type="button"
                  title="Delete Table"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1.5">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
              type="button"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
              type="button"
              title="Redo (Ctrl+Y)"
            >
              <Redo size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose prose-lg prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 max-w-none p-8 min-h-[500px] focus:outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_li]:ml-6"
      />

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Insert Table</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Rows
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTableRows(Math.max(1, tableRows - 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    type="button"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-lg focus:outline-none focus:border-blue-500"
                    min="1"
                    max="20"
                  />
                  <button
                    onClick={() => setTableRows(Math.min(20, tableRows + 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    type="button"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Columns
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTableCols(Math.max(1, tableCols - 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    type="button"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-lg focus:outline-none focus:border-blue-500"
                    min="1"
                    max="10"
                  />
                  <button
                    onClick={() => setTableCols(Math.min(10, tableCols + 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    type="button"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTableModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-semibold transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={insertTable}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg"
                type="button"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
