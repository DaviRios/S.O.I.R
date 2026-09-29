import { useRef, useEffect, useState } from 'react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 160,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  function syncFormats(e: Editor) {
    const active = new Set<string>();
    if (e.isActive('bold')) active.add('bold');
    if (e.isActive('italic')) active.add('italic');
    if (e.isActive('strike')) active.add('strike');
    if (e.isActive('heading', { level: 2 })) active.add('h2');
    if (e.isActive('heading', { level: 3 })) active.add('h3');
    if (e.isActive('bulletList')) active.add('bulletList');
    if (e.isActive('orderedList')) active.add('orderedList');
    if (e.isActive('blockquote')) active.add('blockquote');
    setActiveFormats(new Set(active));
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = new Editor({
      element: containerRef.current,
      extensions: [StarterKit],
      content: value || '',
      onUpdate({ editor: e }) {
        const html = e.getHTML();
        onChange(html === '<p></p>' ? '' : html);
        syncFormats(e);
      },
      onSelectionUpdate({ editor: e }) {
        syncFormats(e);
      },
      editorProps: {
        attributes: {
          class:
            '[padding:12px_14px] outline-none [font-size:14px] [color:#1e1b2e] [line-height:1.65] [font-family:inherit] [box-sizing:border-box] w-full [&_p]:[margin:0_0_8px] [&_p:last-child]:[margin-bottom:0] [&_strong]:font-bold [&_em]:[font-style:italic] [&_s]:[text-decoration:line-through] [&_h2]:[font-size:18px] [&_h2]:font-bold [&_h2]:[color:#1e1b2e] [&_h2]:[margin:12px_0_6px] [&_h2]:[line-height:1.3] [&_h3]:[font-size:15px] [&_h3]:font-bold [&_h3]:[color:#1e1b2e] [&_h3]:[margin:10px_0_4px] [&_h3]:[line-height:1.3] [&_ul]:[padding-left:22px] [&_ul]:[margin:6px_0] [&_ol]:[padding-left:22px] [&_ol]:[margin:6px_0] [&_li]:[margin:3px_0] [&_li]:[line-height:1.6] [&_blockquote]:[border-left:3px_solid_#6BA3E3] [&_blockquote]:[margin:8px_0] [&_blockquote]:[padding:4px_12px] [&_blockquote]:[color:#5b4b8a] [&_blockquote]:[font-style:italic] [&_blockquote]:[background:#EBF9FD] [&_blockquote]:[border-radius:0_6px_6px_0]',
          style: `min-height:${minHeight}px`,
        },
      },
    });

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const e = editorRef.current;
    if (!e) return;
    const current = e.getHTML();
    const normalised = current === '<p></p>' ? '' : current;
    if (normalised !== value && (value === '' || value === undefined)) {
      e.commands.setContent('');
    }
  }, [value]);

  const on = (format: string) => activeFormats.has(format);
  const cmd = () => editorRef.current?.chain().focus();

  const ToolBtn = ({
    active,
    title,
    onClick,
    children,
  }: {
    active?: boolean;
    title: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      className={`${'inline-flex items-center justify-center [min-width:30px] [height:28px] [padding:0_6px] border-0 [background:transparent] [color:#5b4b8a] [border-radius:6px] [font-size:14px] [font-family:inherit] cursor-pointer [transition:background_0.12s,_color_0.12s] [line-height:1] hover:[background:#C5EDF8] hover:[color:#3783D1]'} ${active ? '[background:#C5EDF8] [color:#3783D1]' : ''}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className={
        'flex flex-col [border:1px_solid_#BAE8F6] [border-radius:10px] [background:#f0fcff] overflow-hidden [transition:border-color_0.2s,_box-shadow_0.2s] focus-within:[border-color:#3783D1] focus-within:[box-shadow:0_0_0_3px_rgba(84,_200,_232,_0.12)] focus-within:[background:#ffffff]'
      }
    >
      <div
        className={
          'flex items-center [gap:2px] [padding:8px_10px] [border-bottom:1px_solid_#C5EDF8] [background:#EBF9FD] [flex-wrap:wrap]'
        }
      >
        <ToolBtn
          title="Negrito"
          active={on('bold')}
          onClick={() => cmd()?.toggleBold().run()}
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          title="Itálico"
          active={on('italic')}
          onClick={() => cmd()?.toggleItalic().run()}
        >
          <em>I</em>
        </ToolBtn>
        <ToolBtn
          title="Tachado"
          active={on('strike')}
          onClick={() => cmd()?.toggleStrike().run()}
        >
          <s>S</s>
        </ToolBtn>

        <span
          className={
            '[width:1px] [height:18px] [background:#BAE8F6] [margin:0_4px] shrink-0'
          }
        />

        <ToolBtn
          title="Título H2"
          active={on('h2')}
          onClick={() => cmd()?.toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolBtn>
        <ToolBtn
          title="Título H3"
          active={on('h3')}
          onClick={() => cmd()?.toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolBtn>

        <span
          className={
            '[width:1px] [height:18px] [background:#BAE8F6] [margin:0_4px] shrink-0'
          }
        />

        <ToolBtn
          title="Lista de marcadores"
          active={on('bulletList')}
          onClick={() => cmd()?.toggleBulletList().run()}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </ToolBtn>
        <ToolBtn
          title="Lista numerada"
          active={on('orderedList')}
          onClick={() => cmd()?.toggleOrderedList().run()}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path
              d="M4 6h1v4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M4 10h2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </ToolBtn>
        <ToolBtn
          title="Citação"
          active={on('blockquote')}
          onClick={() => cmd()?.toggleBlockquote().run()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
          </svg>
        </ToolBtn>

        <span
          className={
            '[width:1px] [height:18px] [background:#BAE8F6] [margin:0_4px] shrink-0'
          }
        />

        <ToolBtn title="Desfazer" onClick={() => cmd()?.undo().run()}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M3 13C5.4 7.4 12.2 5 18 8s7 10 3 14" />
          </svg>
        </ToolBtn>
        <ToolBtn title="Refazer" onClick={() => cmd()?.redo().run()}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7v6h-6" />
            <path d="M21 13C18.6 7.4 11.8 5 6 8S-1 18 3 22" />
          </svg>
        </ToolBtn>
      </div>

      <div
        className={
          'relative flex-1 before:[content:attr(data-placeholder)] before:absolute before:[top:12px] before:[left:14px] before:[color:#6BA3E3] before:[font-size:14px] before:pointer-events-none before:[user-select:none]'
        }
        data-placeholder={!value ? placeholder : undefined}
      >
        <div ref={containerRef} />
      </div>
    </div>
  );
}

export default RichTextEditor;
