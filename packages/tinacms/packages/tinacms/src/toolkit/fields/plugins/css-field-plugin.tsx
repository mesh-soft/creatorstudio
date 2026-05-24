import * as React from 'react';
import { wrapFieldsWithMeta } from './wrap-field-with-meta';
import { 
  Modal, 
  ModalPopup, 
  ModalHeader, 
  ModalBody, 
  ModalActions 
} from '@toolkit/react-modals';
import { Button } from '@toolkit/styles';
import { SearchIcon, CloseIcon, AddIcon, TrashIcon } from '@toolkit/icons';
import { MdSearch, MdImage } from 'react-icons/md';
import { CMSContext } from '@toolkit/react-tinacms';
import { useCMS } from '@toolkit/react-core';

const cssProperties = [
  'accent-color', 'align-content', 'align-items', 'align-self', 'all', 'animation', 
  'animation-delay', 'animation-direction', 'animation-duration', 'animation-fill-mode', 
  'animation-iteration-count', 'animation-name', 'animation-play-state', 'animation-timing-function',
  'aspect-ratio', 'backdrop-filter', 'backface-visibility', 'background', 'background-attachment', 
  'background-blend-mode', 'background-clip', 'background-color', 'background-image', 
  'background-origin', 'background-position', 'background-repeat', 'background-size', 
  'border', 'border-block', 'border-block-color', 'border-block-end', 'border-block-end-color', 
  'border-block-end-style', 'border-block-end-width', 'border-block-start', 'border-block-start-color', 
  'border-block-start-style', 'border-block-start-width', 'border-block-style', 'border-block-width', 
  'border-bottom', 'border-bottom-color', 'border-bottom-left-radius', 'border-bottom-right-radius', 
  'border-bottom-style', 'border-bottom-width', 'border-collapse', 'border-color', 
  'border-image', 'border-image-outset', 'border-image-repeat', 'border-image-slice', 
  'border-image-source', 'border-image-width', 'border-inline', 'border-inline-color', 
  'border-inline-end', 'border-inline-end-color', 'border-inline-end-style', 'border-inline-end-width', 
  'border-inline-start', 'border-inline-start-color', 'border-inline-start-style', 
  'border-inline-start-width', 'border-inline-style', 'border-inline-width', 'border-left', 
  'border-left-color', 'border-left-style', 'border-left-width', 'border-radius', 
  'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 
  'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-top-left-radius', 
  'border-top-right-radius', 'border-top-style', 'border-top-width', 'border-width', 
  'bottom', 'box-decoration-break', 'box-shadow', 'box-sizing', 'break-after', 
  'break-before', 'break-inside', 'caption-side', 'caret-color', 'clear', 'clip', 
  'clip-path', 'color', 'column-count', 'column-fill', 'column-gap', 'column-rule', 
  'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span', 'column-width', 
  'columns', 'content', 'counter-increment', 'counter-reset', 'cursor', 'direction', 
  'display', 'empty-cells', 'filter', 'flex', 'flex-basis', 'flex-direction', 'flex-flow', 
  'flex-grow', 'flex-shrink', 'flex-wrap', 'float', 'font', 'font-family', 'font-feature-settings', 
  'font-kerning', 'font-language-override', 'font-optical-sizing', 'font-size', 
  'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-variant-alternates', 
  'font-variant-caps', 'font-variant-east-asian', 'font-variant-ligatures', 'font-variant-numeric', 
  'font-variant-position', 'font-variation-settings', 'font-weight', 'gap', 'grid', 
  'grid-area', 'grid-auto-columns', 'grid-auto-flow', 'grid-auto-rows', 'grid-column', 
  'grid-column-end', 'grid-column-start', 'grid-row', 'grid-row-end', 'grid-row-start', 
  'grid-template', 'grid-template-areas', 'grid-template-columns', 'grid-template-rows', 
  'hanging-punctuation', 'height', 'hyphens', 'image-orientation', 'image-rendering', 
  'image-resolution', 'importance', 'inheritance', 'initial-letter', 'initial-letter-align', 
  'inline-size', 'inset', 'inset-block', 'inset-block-end', 'inset-block-start', 
  'inset-inline', 'inset-inline-end', 'inset-inline-start', 'isolation', 'justify-content', 
  'justify-items', 'justify-self', 'left', 'letter-spacing', 'line-break', 'line-height', 
  'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 
  'margin-block', 'margin-block-end', 'margin-block-start', 'margin-bottom', 'margin-inline', 
  'margin-inline-end', 'margin-inline-start', 'margin-left', 'margin-right', 'margin-top', 
  'mask', 'mask-clip', 'mask-composite', 'mask-image', 'mask-mode', 'mask-origin', 
  'mask-position', 'mask-repeat', 'mask-size', 'mask-type', 'max-block-size', 'max-height', 
  'max-inline-size', 'max-width', 'min-block-size', 'min-height', 'min-inline-size', 
  'min-width', 'mix-blend-mode', 'object-fit', 'object-position', 'offset', 'offset-anchor', 
  'offset-distance', 'offset-path', 'offset-position', 'offset-rotate', 'opacity', 
  'order', 'orphans', 'outline', 'outline-color', 'outline-offset', 'outline-style', 
  'outline-width', 'overflow', 'overflow-anchor', 'overflow-block', 'overflow-clip', 
  'overflow-inline', 'overflow-wrap', 'overflow-x', 'overflow-y', 'overscroll-behavior', 
  'overscroll-behavior-block', 'overscroll-behavior-inline', 'overscroll-behavior-x', 
  'overscroll-behavior-y', 'padding', 'padding-block', 'padding-block-end', 'padding-block-start', 
  'padding-bottom', 'padding-inline', 'padding-inline-end', 'padding-inline-start', 
  'padding-left', 'padding-right', 'padding-top', 'page-break-after', 'page-break-before', 
  'page-break-inside', 'paint-order', 'perspective', 'perspective-origin', 'place-content', 
  'place-items', 'place-self', 'pointer-events', 'position', 'quotes', 'resize', 'right', 
  'rotate', 'row-gap', 'scale', 'scroll-behavior', 'scroll-margin', 'scroll-margin-block', 
  'scroll-margin-block-end', 'scroll-margin-block-start', 'scroll-margin-bottom', 
  'scroll-margin-inline', 'scroll-margin-inline-end', 'scroll-margin-inline-start', 
  'scroll-margin-left', 'scroll-margin-right', 'scroll-margin-top', 'scroll-padding', 
  'scroll-padding-block', 'scroll-padding-block-end', 'scroll-padding-block-start', 
  'scroll-padding-bottom', 'scroll-padding-inline', 'scroll-padding-inline-end', 
  'scroll-padding-inline-start', 'scroll-padding-left', 'scroll-padding-right', 
  'scroll-padding-top', 'scroll-snap-align', 'scroll-snap-stop', 'scroll-snap-type', 
  'scrollbar-color', 'scrollbar-gutter', 'scrollbar-width', 'shape-image-threshold', 
  'shape-margin', 'shape-outside', 'tab-size', 'table-layout', 'text-align', 'text-align-last', 
  'text-combine-upright', 'text-decoration', 'text-decoration-color', 'text-decoration-line', 
  'text-decoration-skip-ink', 'text-decoration-style', 'text-decoration-thickness', 
  'text-emphasis', 'text-emphasis-color', 'text-emphasis-position', 'text-emphasis-style', 
  'text-indent', 'text-justify', 'text-orientation', 'text-overflow', 'text-rendering', 
  'text-shadow', 'text-transform', 'text-underline-offset', 'text-underline-position', 
  'top', 'touch-action', 'transform', 'transform-box', 'transform-origin', 'transform-style', 
  'transition', 'transition-delay', 'transition-duration', 'transition-property', 
  'transition-timing-function', 'translate', 'unicode-bidi', 'user-select', 'vertical-align', 
  'visibility', 'white-space', 'widows', 'width', 'will-change', 'word-break', 'word-spacing', 
  'word-wrap', 'writing-mode', 'z-index'
];

const cssValueSuggestions: Record<string, string[]> = {
  'display': ['block', 'inline', 'inline-block', 'flex', 'grid', 'none', 'inline-flex', 'inline-grid'],
  'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  'flex-direction': ['row', 'column', 'row-reverse', 'column-reverse'],
  'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
  'align-items': ['stretch', 'center', 'flex-start', 'flex-end', 'baseline'],
  'text-align': ['left', 'right', 'center', 'justify'],
  'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  'cursor': ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed'],
  'overflow': ['visible', 'hidden', 'scroll', 'auto'],
  'visibility': ['visible', 'hidden', 'collapse'],
  'object-fit': ['fill', 'contain', 'cover', 'none', 'scale-down'],
};

type Breakpoint = 'base' | 'mobile' | 'tablet';

const BREAKPOINTS: { key: Breakpoint; label: string; hint: string }[] = [
  { key: 'base', label: 'Base', hint: 'All screen sizes' },
  { key: 'mobile', label: 'Mobile', hint: '≤ 767 px' },
  { key: 'tablet', label: 'Tablet', hint: '768 – 1023 px' },
];

/** Detect whether a parsed CSS value is using the new breakpoint format */
function isBreakpointFormat(obj: Record<string, any>): boolean {
  return 'base' in obj || 'mobile' in obj || 'tablet' in obj;
}

/** Migrate old flat format → breakpoint format */
function migrateToBreakpointFormat(flat: Record<string, any>): Record<Breakpoint, Record<string, string>> {
  return { base: { ...flat }, mobile: {}, tablet: {} };
}

export const CssEditor = wrapFieldsWithMeta(({ input, field }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isRaw, setIsRaw] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [activeBreakpoint, setActiveBreakpoint] = React.useState<Breakpoint>('base');
  const cms = useCMS();

  const value = React.useMemo((): Record<Breakpoint, Record<string, string>> => {
    const raw = typeof input.value === 'string'
      ? (() => { try { return JSON.parse(input.value); } catch { return {}; } })()
      : (input.value || {});
    if (isBreakpointFormat(raw)) {
      return { base: raw.base || {}, mobile: raw.mobile || {}, tablet: raw.tablet || {} };
    }
    // Old flat format — migrate transparently
    return migrateToBreakpointFormat(raw);
  }, [input.value]);

  const { dispatch } = React.useContext(CMSContext);

  React.useEffect(() => {
    if (isOpen) {
      dispatch({
        type: 'set-active-css',
        value: { id: input.name, css: JSON.stringify(value) }
      });
    } else {
      dispatch({ type: 'set-active-css', value: null });
    }
  }, [value, isOpen, input.name, dispatch]);

  const bpValue = value[activeBreakpoint] || {};
  const properties = Object.entries(bpValue);

  const save = (next: Record<Breakpoint, Record<string, string>>) => {
    input.onChange(next);
    dispatch({ type: 'set-active-css', value: { id: input.name, css: JSON.stringify(next) } });
  };

  const addProperty = (prop: string) => {
    if (prop && !bpValue[prop]) {
      save({ ...value, [activeBreakpoint]: { ...bpValue, [prop]: '' } });
      setSearch('');
    }
  };

  const removeProperty = (prop: string) => {
    const next = { ...bpValue };
    delete next[prop];
    save({ ...value, [activeBreakpoint]: next });
  };

  const updateValue = (prop: string, val: string) => {
    save({ ...value, [activeBreakpoint]: { ...bpValue, [prop]: val } });
  };

  const updateRaw = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      // Accept either flat (migrate) or breakpoint format
      if (isBreakpointFormat(parsed)) {
        save({ base: parsed.base || {}, mobile: parsed.mobile || {}, tablet: parsed.tablet || {} });
      } else {
        save(migrateToBreakpointFormat(parsed));
      }
    } catch (e) {
      // Keep current value if JSON is invalid
    }
  };

  const openMediaManager = (prop: string) => {
    cms.media.persist({
      onSelect: (media: any) => {
        const url = media.src || `/${media.directory}/${media.filename}`;
        updateValue(prop, `url(${url})`);
      },
    });
  };

  const isImageProp = (prop: string) => 
    prop.toLowerCase().includes('image') || prop.toLowerCase().includes('icon');

const isColorProp = (prop: string) =>
  prop === 'color' || prop === 'background' || prop === 'background-color' ||
  prop.endsWith('-color') || prop === 'fill' || prop === 'stroke' ||
  prop === 'outline' || prop === 'border';

const isValidHex = (v: string) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v);

  const filteredProperties = Array.from(new Set(cssProperties)).filter(p => 
    p.toLowerCase().includes(search.toLowerCase()) && !value[p]
  ).slice(0, 10);

  const totalCount = Object.values(value).reduce((n, bp) => n + Object.keys(bp).length, 0);
  const cssSummary = totalCount > 0
    ? Object.entries(value)
        .flatMap(([bp, props]) => Object.entries(props).map(([k, v]) => bp === 'base' ? `${k}:${v}` : `@${bp} ${k}:${v}`))
        .join('; ')
    : 'No overrides';

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        style={{ 
          width: '100%', 
          textAlign: 'left', 
          fontSize: '11px', 
          padding: '8px 12px',
          height: 'auto',
          lineHeight: '1.4',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
          CSS Overrides ({totalCount})
        </div>
        <div style={{ 
          opacity: 0.6, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontFamily: 'monospace'
        }}>
          {cssSummary}
        </div>
      </Button>

      {isOpen && (
        <Modal>
          <ModalPopup>
            <ModalHeader close={() => setIsOpen(false)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '40px' }}>
                <span>CSS Property Editor</span>
                <Button size="small" onClick={() => setIsRaw(!isRaw)}>
                  {isRaw ? 'Structured View' : 'Raw JSON View'}
                </Button>
              </div>
            </ModalHeader>
            <ModalBody>
              {/* Breakpoint tabs */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                {BREAKPOINTS.map((bp) => {
                  const count = Object.keys(value[bp.key] || {}).length;
                  const isActive = activeBreakpoint === bp.key;
                  return (
                    <button
                      key={bp.key}
                      onClick={() => { setActiveBreakpoint(bp.key); setSearch(''); }}
                      title={bp.hint}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? '#2563eb' : '#64748b',
                        background: 'none',
                        border: 'none',
                        borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                        marginBottom: '-2px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {bp.label}
                      {count > 0 && (
                        <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isRaw ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                  <textarea
                    value={JSON.stringify(value, null, 2)}
                    onChange={(e) => updateRaw(e.target.value)}
                    style={{
                      width: '100%',
                      height: '400px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      padding: '12px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc'
                    }}
                  />
                  <p style={{ fontSize: '11px', color: '#64748b' }}>
                    Note: Changes are only applied if the JSON is valid.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search property (e.g. background-color)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 36px 10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px'
                        }}
                      />
                      <MdSearch style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '18px' }} />
                    </div>
                    
                    {search && filteredProperties.length > 0 && (
                      <div style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '6px', 
                        background: 'white',
                        marginTop: '4px',
                        maxHeight: '160px',
                        overflowY: 'auto',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        position: 'absolute',
                        width: 'calc(100% - 48px)',
                        zIndex: 100
                      }}>
                        {filteredProperties.map((prop, idx) => (
                          <div 
                            key={`search-prop-${prop}-${idx}`} 
                            onClick={() => addProperty(prop)}
                            style={{ 
                              padding: '10px 14px', 
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '13px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {prop}
                            <AddIcon style={{ width: '14px', height: '14px', opacity: 0.5 }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 2fr 40px', 
                      background: '#f1f5f9', 
                      padding: '10px 12px',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <div>Property</div>
                      <div>Value</div>
                      <div></div>
                    </div>
                    
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {properties.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                          No properties defined. Use the search above to start adding styles.
                        </div>
                      )}
                      {properties.map(([prop, val], idx) => (
                        <div key={`active-prop-${prop}-${idx}`} style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 2fr 40px', 
                          padding: '8px 12px',
                          borderBottom: '1px solid #f1f5f9',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#1e293b', fontFamily: 'monospace' }}>{prop}</div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <div key={`input-wrap-${prop}`} style={{ position: 'relative', flex: 1 }}>
                              <input
                                key={`input-${prop}`}
                                type="text"
                                value={val as string}
                                placeholder="Value..."
                                onChange={(e) => updateValue(prop, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '13px'
                                }}
                              />
                              {cssValueSuggestions[prop] && (
                                <select 
                                  key={`select-${prop}`}
                                  onChange={(e) => updateValue(prop, e.target.value)}
                                  value=""
                                  style={{
                                    position: 'absolute',
                                    right: '4px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '20px',
                                    opacity: 0,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option key="placeholder" value="">Suggestions</option>
                                  {cssValueSuggestions[prop].map(s => (
                                    <option key={`suggestion-${prop}-${s}`} value={s}>{s}</option>
                                  ))}
                                </select>
                              )}
                              {cssValueSuggestions[prop] && (
                                <div key={`arrow-${prop}`} style={{ 
                                  position: 'absolute', 
                                  right: '8px', 
                                  top: '50%', 
                                  transform: 'translateY(-50%)', 
                                  pointerEvents: 'none', 
                                  fontSize: '10px', 
                                  opacity: 0.3 
                                }}>
                                  ▼
                                </div>
                              )}
                            </div>
                            {isImageProp(prop) && (
                              <button 
                                onClick={() => openMediaManager(prop)}
                                style={{ 
                                  padding: '0 6px', 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <MdImage size={16} />
                              </button>
                            )}
                            {isColorProp(prop) && (
                              <input
                                type="color"
                                value={isValidHex(val as string) ? val as string : '#000000'}
                                onChange={(e) => updateValue(prop, e.target.value)}
                                title="Pick color"
                                style={{
                                  width: '32px',
                                  height: '28px',
                                  padding: '2px',
                                  cursor: 'pointer',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button 
                              onClick={() => removeProperty(prop)} 
                              style={{ 
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer', 
                                color: '#ef4444', 
                                opacity: 0.6,
                                padding: '4px'
                              }} 
                            >
                              <TrashIcon style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div style={{ marginTop: '20px', padding: '12px', background: '#eff6ff', borderRadius: '8px', fontSize: '11px', color: '#1d4ed8', border: '1px solid #dbeafe' }}>
                <strong>Pro Tip:</strong> Use <code>@apply</code> for Tailwind classes, <code>var(--name)</code> for theme variables, or use the <strong>Raw JSON View</strong> to copy-paste complex styles.
              </div>
            </ModalBody>
            <ModalActions>
              <Button onClick={() => setIsOpen(false)}>Done</Button>
            </ModalActions>
          </ModalPopup>
        </Modal>
      )}
    </>
  );
});


export const CssFieldPlugin = {
  name: 'css',
  Component: CssEditor,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && (!value || Object.keys(value).length === 0)) return 'Required';
  },
  parse(value: any) {
    return typeof value === 'object' ? JSON.stringify(value) : value;
  },
  format(value: any) {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return {};
      }
    }
    return value;
  },
};
