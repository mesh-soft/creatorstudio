import * as React from 'react';
import { BaseTextField, type InputProps } from '../components';
import { wrapFieldsWithMeta } from './wrap-field-with-meta';
import { parse } from './text-format';
import { get } from '../../../utils';
interface ExtraProps {
  placeholder: string;
  disabled?: boolean;
  suggestions?: string[];
}
export const TextField = wrapFieldsWithMeta<{}, InputProps & ExtraProps>(
  (props) => {
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (ref.current && props.field.experimental_focusIntent) {
        ref.current.focus();
      }
    }, [props.field.experimental_focusIntent, ref]);

    const suggestions = props.field.suggestions || [];

    return (
      <div style={{ position: 'relative' }}>
        <BaseTextField
          {...props.input}
          ref={ref}
          disabled={props.field?.disabled ?? false}
          placeholder={props.field.placeholder}
        />
        {suggestions.length > 0 && (
          <div style={{ 
            marginTop: '6px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px' 
          }}>
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => props.input.onChange(s)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export const TextFieldPlugin = {
  name: 'text',
  Component: TextField,
  validate(value: any, allValues: any, meta: any, field: any) {
    if (field.required && !value) return 'Required';
    if (field.uid) {
      const path = field.name.split('.');
      const fieldName = path[path.length - 1];
      const parent = path.slice(0, path.length - 2);
      const items = get(allValues, parent);
      if (items?.filter((item: any) => item[fieldName] === value)?.length > 1) {
        return 'Item with this unique id already exists';
      }
    }
  },
  parse,
};
