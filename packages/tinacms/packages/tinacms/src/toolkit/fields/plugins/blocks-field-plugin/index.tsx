import * as React from 'react';
import type { Field, Form } from '@toolkit/forms';
import { Droppable, Draggable, SortableProvider } from '../dnd-kit-wrapper';
import {
  GroupLabel,
  ItemDeleteButton,
  ItemHeader,
  DragHandle,
  ItemClickTarget,
} from '../group-list-field-plugin';
import { useCMS } from '@toolkit/react-core/use-cms';
import { useEvent } from '@toolkit/react-core';
import type {
  FieldHoverEvent,
  FieldFocusEvent,
} from '@toolkit/fields/field-events';
import { BlockSelector } from './block-selector';
import { BlockSelectorBig } from './block-selector-big';
import { BiPencil, BiChevronRight, BiChevronDown, BiShow, BiHide, BiSliderAlt } from 'react-icons/bi';
import { FieldsBuilder } from '@toolkit/form-builder';
import { EmptyList, ListFieldMeta, ListPanel } from '../list-field-meta';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface BlocksFieldDefinititon extends Field {
  component: 'blocks';
  templates: {
    [key: string]: BlockTemplate;
  };
}

export interface BlockTemplate {
  label: string;
  defaultItem?: object | (() => object);
  fields?: Field[];
  /**
   * An optional function which generates `props` for
   * this items's `li`.
   */
  itemProps?: (item: object) => {
    /**
     * The `key` property used to optimize the rendering of lists.
     *
     * If rendering is causing problems, use `defaultItem` to
     * generate a unique key for the item.
     *
     * Reference:
     * * https://reactjs.org/docs/lists-and-keys.html
     */
    key?: string;
    /**
     * The label to be display on the list item.
     */
    label?: string;
  };
}

interface BlockFieldProps {
  input: any;
  meta: any;
  field: BlocksFieldDefinititon;
  form: any;
  tinaForm: Form;
  index?: number;
}

const Blocks = ({
  tinaForm,
  form,
  field,
  input,
  meta,
  index,
}: BlockFieldProps) => {
  // Tracks object references of blocks added during this session.
  // Uses reference equality so it's stable under reorder, delete, and prepend.
  // Cleared when the form is saved (becomes pristine).
  const [newObjects, setNewObjects] = useState<Set<object>>(new Set());

  const prevPristine = useRef(meta.pristine);
  useEffect(() => {
    if (!prevPristine.current && meta.pristine) {
      setNewObjects(new Set());
    }
    prevPristine.current = meta.pristine;
  }, [meta.pristine]);

  const addItem = useCallback(
    (name: string, template: BlockTemplate) => {
      let obj: any = {};
      if (typeof template.defaultItem === 'function') {
        obj = template.defaultItem();
      } else {
        obj = template.defaultItem || {};
      }
      obj._template = name;
      setNewObjects((prev) => new Set(prev).add(obj));
      form.mutators.push(field.name, obj);
    },
    [field.name, form.mutators]
  );

  const items = input.value || [];

  // @ts-ignore
  const isMax = items.length >= (field.max || Infinity);
  // @ts-ignore
  const isMin = items.length <= (field.min || 0);
  // @ts-ignore
  const fixedLength = field.min === field.max;

  return (
    <ListFieldMeta
      name={input.name}
      label={field.label}
      description={field.description}
      error={meta.error}
      triggerHoverEvents={false}
      index={index}
      tinaForm={tinaForm}
      actions={
        (!fixedLength || (fixedLength && !isMax)) &&
        // @ts-ignore
        (!field.visualSelector ? (
          <BlockSelector templates={field.templates} addItem={addItem} />
        ) : (
          <BlockSelectorBig
            label={field.label || field.name}
            templates={field.templates}
            addItem={addItem}
          />
        ))
      }
    >
      <ListPanel>
        <Droppable droppableId={field.name} type={field.name}>
          {(provider) => (
            <div ref={provider.innerRef} className='edit-page--list-parent'>
              {items.length === 0 && <EmptyList />}
              <SortableProvider
                items={items.map((_, index) => `${field.name}.${index}`)}
              >
                {items.map((block: any, index: any) => {
                  const template = field.templates[block._template];

                  if (!template) {
                    return (
                      <InvalidBlockListItem
                        // NOTE: Supressing warnings, but not helping with render perf
                        key={index}
                        index={index}
                        field={field}
                        tinaForm={tinaForm}
                      />
                    );
                  }

                  const itemProps = (item: object) => {
                    if (!template.itemProps) return {};
                    return template.itemProps(item);
                  };
                  return (
                    <BlockListItem
                      // NOTE: Supressing warnings, but not helping with render perf
                      key={index}
                      block={block}
                      template={template}
                      index={index}
                      field={field}
                      tinaForm={tinaForm}
                      isMin={isMin}
                      fixedLength={fixedLength}
                      isNew={newObjects.has(block)}
                      {...itemProps(block)}
                    />
                  );
                })}
              </SortableProvider>
              {provider.placeholder}
            </div>
          )}
        </Droppable>
      </ListPanel>
    </ListFieldMeta>
  );
};

interface BlockListItemProps {
  tinaForm: Form;
  field: BlocksFieldDefinititon;
  index: number;
  block: any;
  template: BlockTemplate;
  label?: string;
  isMin?: boolean;
  fixedLength?: boolean;
  isNew?: boolean;
}

const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: (e: any) => void }) => {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-blue-500' : 'bg-gray-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-3' : 'translate-x-0'
        }`}
      />
    </div>
  );
};

/** Field names that belong to the Presentation tab. */
const PRESENTATION_FIELDS = new Set(['variant', 'backgroundImage', 'css']);

const BlockListItem = ({
  label,
  tinaForm,
  field,
  index,
  template,
  isMin,
  fixedLength,
  isNew,
  block,
}: BlockListItemProps) => {
  const cms = useCMS();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'presentation'>('content');

  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index);
  }, [tinaForm, field, index]);

  const toggleEnabled = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = block?.enabled === false ? true : false;
    tinaForm.finalForm.change(`${field.name}.${index}.enabled`, newValue);
    
    // Trigger a native event so the Creator Studio scraper picks up the change
    setTimeout(() => {
      const el = document.querySelector(`input[name="${field.name}.${index}.enabled"]`);
      if (el) el.dispatchEvent(new Event('input', { bubbles: true }));
    }, 10);
  }, [tinaForm, field, index, block]);

  const hasEnabledField = template.fields?.some(f => f.name === 'enabled');
  const isEnabled = block?.enabled !== false;
  // @ts-ignore
  const dragDisabled = field.disableDrag === true;

  const { dispatch: setHoveredField } =
    useEvent<FieldHoverEvent>('field:hover');
  const { dispatch: setFocusedField } =
    useEvent<FieldFocusEvent>('field:focus');

  return (
    <Draggable key={index} draggableId={`${field.name}.${index}`} index={index} disabled={dragDisabled}>
      {(provider, snapshot) => (
        <div className={`mb-0.5 bg-white border border-gray-100 rounded shadow-sm ${isEnabled ? '' : 'opacity-60'}`}>
          <ItemHeader provider={provider} isDragging={snapshot.isDragging} className="border-0 m-0 shadow-none">
            {!dragDisabled && (
              <DragHandle
                isDragging={snapshot.isDragging}
                dragHandleProps={provider.dragHandleProps}
              />
            )}
            <ItemClickTarget
              onClick={() => setIsExpanded(!isExpanded)}
              onMouseOver={() =>
                setHoveredField({
                  id: tinaForm.id,
                  fieldName: `${field.name}.${index}`,
                })
              }
              onMouseOut={() => setHoveredField({ id: null, fieldName: null })}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <BiChevronDown className="h-5 w-5 text-gray-400" /> : <BiChevronRight className="h-5 w-5 text-gray-400" />}
                <GroupLabel>{label || template.label}</GroupLabel>
              </div>
              {isNew && (
                <span className='mr-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border-[0.5px] border-tina-orange/50 font-semibold bg-tina-orange/10 text-tina-orange leading-none'>
                  NEW
                </span>
              )}
            </ItemClickTarget>
            <div className="flex items-center pr-2 gap-2">
              {hasEnabledField && (
                <Toggle enabled={isEnabled} onClick={toggleEnabled} />
              )}
              {(!fixedLength || (fixedLength && !isMin)) && (
                <ItemDeleteButton disabled={isMin} onClick={removeItem} />
              )}
              {hasEnabledField && (
                <input 
                  type="checkbox" 
                  name={`${field.name}.${index}.enabled`} 
                  checked={isEnabled} 
                  readOnly 
                  style={{ display: 'none' }} 
                />
              )}
            </div>
          </ItemHeader>
          
          {isExpanded && template.fields && (() => {
            const allFields = template.fields
              .filter(f => f.name !== 'enabled')
              .map(f => ({ ...f, name: `${field.name}.${index}.${f.name}` }));

            const contentFields = allFields.filter(f => {
              // Strip the block prefix back to the bare field name for the check
              const bareName = f.name.split('.').pop() ?? '';
              return !PRESENTATION_FIELDS.has(bareName);
            });
            const presentationFields = allFields.filter(f => {
              const bareName = f.name.split('.').pop() ?? '';
              return PRESENTATION_FIELDS.has(bareName);
            });

            const hasBothTabs = presentationFields.length > 0;

            return (
              <div style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 6px 6px' }}>
                {/* Segmented control — only shown when presentation fields exist */}
                {hasBothTabs && (
                  <div style={{ padding: '10px 14px 0' }}>
                    <div style={{
                      display: 'inline-flex',
                      background: '#e2e8f0',
                      borderRadius: '8px',
                      padding: '2px',
                      gap: '1px',
                    }}>
                      {([
                        { id: 'content',      label: 'Content',      Icon: BiPencil     },
                        { id: 'presentation', label: 'Presentation',  Icon: BiSliderAlt  },
                      ] as const).map(({ id, label, Icon }) => {
                        const isActive = activeTab === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 13px',
                              fontSize: '11px',
                              fontWeight: isActive ? 600 : 400,
                              color: isActive ? '#1e293b' : '#64748b',
                              background: isActive ? '#ffffff' : 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              boxShadow: isActive
                                ? '0 1px 3px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.06)'
                                : 'none',
                              transition: 'background 0.12s ease, box-shadow 0.12s ease, color 0.12s ease',
                              whiteSpace: 'nowrap',
                              userSelect: 'none',
                            }}
                          >
                            <Icon size={11} style={{ opacity: isActive ? 0.9 : 0.5, flexShrink: 0 }} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fields for active tab */}
                <div style={{ padding: '12px 4px 4px' }}>
                  <FieldsBuilder
                    form={tinaForm}
                    fields={activeTab === 'content' || !hasBothTabs ? contentFields : presentationFields}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </Draggable>
  );
};

const InvalidBlockListItem = ({
  tinaForm,
  field,
  index,
}: {
  tinaForm: Form;
  field: Field;
  index: number;
}) => {
  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index);
  }, [tinaForm, field, index]);

  return (
    <Draggable key={index} draggableId={`${field.name}.${index}`} index={index}>
      {(provider, snapshot) => (
        <ItemHeader provider={provider} isDragging={snapshot.isDragging}>
          <DragHandle
            isDragging={snapshot.isDragging}
            dragHandleProps={provider.dragHandleProps}
          />
          <ItemClickTarget>
            <GroupLabel error>Invalid Block</GroupLabel>
          </ItemClickTarget>
          <ItemDeleteButton onClick={removeItem} />
        </ItemHeader>
      )}
    </Draggable>
  );
};

export const BlocksField = Blocks;

export const BlocksFieldPlugin = {
  name: 'blocks',
  Component: BlocksField,
};
