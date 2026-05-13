import React from 'react';
import type { Field, Form } from '@toolkit/forms';
import { IconButton } from '@toolkit/styles';
import { Droppable, Draggable, SortableProvider } from './dnd-kit-wrapper';
import { AddIcon, DragIcon, ReorderIcon, TrashIcon } from '@toolkit/icons';
import { useEvent } from '@toolkit/react-core/use-cms-event';
import type { FieldHoverEvent, FieldFocusEvent } from '../field-events';
import { useCMS } from '@toolkit/react-core/use-cms';
import { BiPencil, BiChevronRight, BiChevronDown, BiShow, BiHide } from 'react-icons/bi';
import { FieldsBuilder } from '@toolkit/form-builder';
import { EmptyList, ListFieldMeta, ListPanel } from './list-field-meta';

interface GroupFieldDefinititon extends Field {
  component: 'group';
  fields: Field[];
  defaultItem?: object | (() => object);
  openFormOnCreate?: boolean;
  addItemBehavior?: 'append' | 'prepend';
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

interface GroupProps {
  input: any;
  meta: any;
  field: GroupFieldDefinititon;
  form: any;
  tinaForm: Form;
  index?: number;
}

const Group = ({ tinaForm, form, field, input, meta, index }: GroupProps) => {
  const cms = useCMS();
  const { dispatch: setFocusedField } =
    useEvent<FieldFocusEvent>('field:focus');
  const addItem = React.useCallback(() => {
    let obj = {};
    if (typeof field.defaultItem === 'function') {
      obj = field.defaultItem();
    } else {
      obj = field.defaultItem || {};
    }
    if (field.addItemBehavior === 'prepend') {
      form.mutators.insert(field.name, 0, obj);
    } else {
      form.mutators.push(field.name, obj);
    }
    if (field.openFormOnCreate) {
      const state = tinaForm.finalForm.getState();
      const newIndex = field.addItemBehavior === 'prepend' ? 0 : items.length;
      if (state.invalid === true) {
        // @ts-ignore
        cms.alerts.error('Cannot navigate away from an invalid form.');
        return;
      }
      cms.dispatch({
        type: 'forms:set-active-field-name',
        value: {
          formId: tinaForm.id,
          fieldName: `${field.name}.${newIndex}`,
        },
      });
      setFocusedField({
        id: tinaForm.id,
        fieldName: `${field.name}.${newIndex}`,
      });
    }
  }, [form, field]);

  const items = input.value || [];
  const itemProps = React.useCallback(
    (item: object) => {
      if (!field.itemProps) return {};
      return field.itemProps(item);
    },
    [field.itemProps]
  );

  // @ts-ignore
  const isMax = items.length >= (field.max || Number.POSITIVE_INFINITY);
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
      index={index}
      triggerHoverEvents={false}
      tinaForm={tinaForm}
      actions={
        (!fixedLength || (fixedLength && !isMax)) && (
          <IconButton
            onClick={addItem}
            disabled={isMax}
            variant='primary'
            size='small'
          >
            <AddIcon className='w-5/6 h-auto' />
          </IconButton>
        )
      }
    >
      <ListPanel>
        <div>
          <Droppable droppableId={field.name} type={field.name}>
            {(provider) => (
              <div ref={provider.innerRef}>
                {items.length === 0 && <EmptyList />}
                <SortableProvider
                  items={items.map((_, index) => `${field.name}.${index}`)}
                >
                  {items.map((item: any, index: any) => (
                    <Item
                      // NOTE: Supressing warnings, but not helping with render perf
                      key={index}
                      tinaForm={tinaForm}
                      field={field}
                      item={item}
                      index={index}
                      isMin={isMin}
                      fixedLength={fixedLength}
                      {...itemProps(item)}
                    />
                  ))}
                </SortableProvider>
                {provider.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </ListPanel>
    </ListFieldMeta>
  );
};

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

const Item = ({
  tinaForm,
  field,
  index,
  item,
  label,
  isMin,
  fixedLength,
  ...p
}: ItemProps) => {
  const cms = useCMS();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const removeItem = React.useCallback(() => {
    tinaForm.mutators.remove(field.name, index);
  }, [tinaForm, field, index]);

  const toggleEnabled = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = item?.enabled === false ? true : false;
    tinaForm.finalForm.change(`${field.name}.${index}.enabled`, newValue);
    
    // Trigger a native event so the Creator Studio scraper picks up the change
    setTimeout(() => {
      const el = document.querySelector(`input[name="${field.name}.${index}.enabled"]`);
      if (el) el.dispatchEvent(new Event('input', { bubbles: true }));
    }, 10);
  }, [tinaForm, field, index, item]);

  const hasEnabledField = field.fields?.some(f => f.name === 'enabled');
  const isEnabled = item?.enabled !== false;
  // @ts-ignore
  const dragDisabled = field.disableDrag === true;
  const title = label || `${field.label || field.name} Item`;

  const { dispatch: setHoveredField } =
    useEvent<FieldHoverEvent>('field:hover');
  const { dispatch: setFocusedField } =
    useEvent<FieldFocusEvent>('field:focus');
    
  return (
    <Draggable draggableId={`${field.name}.${index}`} index={index} disabled={dragDisabled}>
      {(provider, snapshot) => (
        <div className={`mb-0.5 bg-white border border-gray-100 rounded shadow-sm ${isEnabled ? '' : 'opacity-60'}`}>
          <ItemHeader
            provider={provider}
            isDragging={snapshot.isDragging}
            className="border-0 m-0 shadow-none"
            {...p}
          >
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
                <GroupLabel>{title}</GroupLabel>
              </div>
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
          
          {isExpanded && field.fields && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b">
              <FieldsBuilder
                form={tinaForm}
                fields={field.fields
                  .filter(f => f.name !== 'enabled')
                  .map(f => ({
                    ...f,
                    name: `${field.name}.${index}.${f.name}`
                  }))}
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export const ItemClickTarget = ({ children, ...props }) => {
  return (
    <div
      className='group text-gray-400 hover:text-blue-600 flex-1 min-w-0 relative flex justify-between items-center p-2'
      {...props}
    >
      {children}
    </div>
  );
};

export const GroupLabel = ({
  error,
  children,
}: {
  children?: any;
  error?: boolean;
}) => {
  return (
    <span
      className={`m-0 text-xs font-semibold flex-1 text-ellipsis overflow-hidden transition-all ease-out duration-100 text-left ${
        error ? 'text-red-500' : 'text-gray-600 group-hover:text-inherit'
      }`}
    >
      {children}
    </span>
  );
};

export const ItemHeader = ({
  isDragging,
  children,
  provider,
  ...props
}: {
  isDragging: boolean;
  children: any | any[];
  provider: any;
} & any) => {
  return (
    <div
      ref={provider.draggableProps?.ref}
      {...provider.draggableProps}
      {...props}
      className={`relative group cursor-pointer flex justify-between items-stretch bg-white border border-gray-100 -mb-px overflow-visible p-0 text-sm font-normal ${
        isDragging
          ? 'rounded shadow text-blue-600'
          : 'text-gray-600 first:rounded-t last:rounded-b'
      } ${props.className ?? ''}`}
      style={{
        ...(provider.draggableProps?.style ?? {}),
        ...(props.style ?? {}),
      }}
    >
      {children}
    </div>
  );
};

export const ItemDeleteButton = ({ onClick, disabled = false }) => {
  return (
    <button
      type='button'
      className={`w-8 px-1 py-2.5 flex items-center justify-center text-gray-200 hover:opacity-100 opacity-30 hover:bg-gray-50 ${
        disabled && 'pointer-events-none opacity-30 cursor-not-allowed'
      }`}
      onClick={onClick}
    >
      <TrashIcon className='h-5 w-auto fill-current text-red-500 transition-colors duration-150 ease-out' />
    </button>
  );
};

export const DragHandle = ({
  isDragging,
  dragHandleProps,
}: {
  isDragging: boolean;
  dragHandleProps?: any;
}) => {
  return (
    <div
      {...dragHandleProps}
      className={`relative w-8 px-1 py-2.5 flex items-center justify-center hover:bg-gray-50 group cursor-[grab] ${
        isDragging ? `text-blue-500` : `text-gray-200 hover:text-gray-600`
      }`}
    >
      {isDragging ? (
        <ReorderIcon className='fill-current w-7 h-auto' />
      ) : (
        <>
          <DragIcon className='fill-current w-7 h-auto group-hover:opacity-0 transition-opacity duration-150 ease-out' />
          <ReorderIcon className='fill-current w-7 h-auto absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out' />
        </>
      )}
    </div>
  );
};

export const GroupListField = Group;

export const GroupListFieldPlugin = {
  name: 'group-list',
  Component: GroupListField,
};
