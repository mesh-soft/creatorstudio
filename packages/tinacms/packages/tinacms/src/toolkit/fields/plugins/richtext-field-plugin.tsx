import * as React from 'react';
import { wrapFieldsWithMeta } from './wrap-field-with-meta';

/**
 * Minimal contenteditable WYSIWYG editor for body / description / answer fields.
 *
 * Stored value: HTML string (e.g. "<p>Hello <strong>world</strong></p>").
 * Rendered by MarkdownText in SiteRenderer, which detects HTML vs plain text.
 *
 * Design goals:
 *  - No external dependencies (execCommand is deprecated but universal)
 *  - Toolbar: Bold, Italic, H2, Bullet list, Link
 *  - Works with TinaCMS field API (input.value / input.onChange)
 */

const RichtextEditorInner = ({ input }: { input: any }) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  // Track whether the user is currently typing so we don't clobber the caret.
  const isEditingRef = React.useRef(false);

  // Sync external value → DOM only when NOT editing (e.g. draft-update from parent).
  React.useEffect(() => {
    if (isEditingRef.current) return;
    if (!editorRef.current) return;
    const html = typeof input.value === 'string' ? input.value : '';
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.value]);

  const commitValue = () => {
    if (editorRef.current) {
      input.onChange(editorRef.current.innerHTML);
    }
  };

  /** Run a document.execCommand and then commit the new HTML to Tina state. */
  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand(cmd, false, value);
    commitValue();
  };

  const handleH2 = () => {
    editorRef.current?.focus();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand('formatBlock', false, 'h2');
    commitValue();
  };

  const handleLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const handleUnlink = () => exec('unlink');

  const toolbarButtons: Array<{
    label: string;
    title: string;
    action: () => void;
    style?: React.CSSProperties;
  }> = [
    { label: 'B',  title: 'Bold',        action: () => exec('bold'),                 style: { fontWeight: 700 } },
    { label: 'I',  title: 'Italic',      action: () => exec('italic'),               style: { fontStyle: 'italic' } },
    { label: 'H2', title: 'Heading 2',   action: handleH2 },
    { label: '≡',  title: 'Bullet list', action: () => exec('insertUnorderedList') },
    { label: '🔗', title: 'Link',        action: handleLink },
    { label: '✂🔗', title: 'Remove link', action: handleUnlink },
  ];

  return (
    <div
      style={{
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        overflow: 'hidden',
        background: 'white',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '2px',
          padding: '4px 6px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
        }}
      >
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            type='button'
            title={btn.title}
            onMouseDown={(e) => {
              // Prevent blur on the editor so selection is preserved.
              e.preventDefault();
              btn.action();
            }}
            style={{
              minWidth: '28px',
              height: '24px',
              fontSize: '12px',
              padding: '0 4px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '3px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...btn.style,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => { isEditingRef.current = true; }}
        onBlur={() => {
          isEditingRef.current = false;
          commitValue();
        }}
        onInput={commitValue}
        style={{
          minHeight: '90px',
          maxHeight: '260px',
          overflowY: 'auto',
          padding: '8px 10px',
          fontSize: '13px',
          lineHeight: '1.6',
          outline: 'none',
          fontFamily: 'inherit',
          color: '#1e293b',
        }}
      />
    </div>
  );
};

export const RichtextEditor = wrapFieldsWithMeta(RichtextEditorInner);

export const RichtextFieldPlugin = {
  name: 'richtext',
  Component: RichtextEditor,
  parse: (value: any) => (value == null ? '' : String(value)),
  format: (value: any) => (value == null ? '' : String(value)),
};
