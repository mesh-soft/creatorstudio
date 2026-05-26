"use client";

import { useState, useCallback } from "react";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

interface FieldDef {
  key: string;
  label?: string;
  type?: "string" | "text" | "number" | "boolean" | "richtext" | "select" | "color" | "image" | "object" | "array";
  options?: { label: string; value: string }[];
  itemFields?: FieldDef[];
  defaultItem?: JsonObject;
}

interface JsonFormProps {
  value: JsonObject;
  onChange: (value: JsonObject) => void;
  fields?: FieldDef[];
  readOnly?: boolean;
  depth?: number;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: "4px",
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: "12px",
  fontFamily: "Inter, system-ui, sans-serif",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: "60px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "4px",
};

const btnStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: "4px",
  border: "none",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
};

export function JsonForm({ value, onChange, fields, depth = 0 }: JsonFormProps) {
  if (fields) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: depth === 0 ? "16px" : "8px" }}>
        {fields.map((field) => (
          <FieldEditor
            key={field.key}
            field={field}
            value={value[field.key]}
            onChange={(v) => onChange({ ...value, [field.key]: v })}
            depth={depth}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Object.entries(value).map(([key, val]) => (
        <FieldEditor
          key={key}
          field={{ key, label: formatKey(key), type: inferType(val) }}
          value={val}
          onChange={(v) => onChange({ ...value, [key]: v })}
          depth={depth}
        />
      ))}
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
  depth,
}: {
  field: FieldDef;
  value: JsonValue;
  onChange: (v: JsonValue) => void;
  depth: number;
}) {
  const [collapsed, setCollapsed] = useState(depth > 1);
  const type = field.type ?? inferType(value);

  const renderField = () => {
    switch (type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: "16px", height: "16px", accentColor: "#2296F3" }}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value == null ? "" : String(value)}
            onChange={(e) => {
              const v = e.target.value;
              onChange(v === "" ? null : Number(v));
            }}
            style={inputStyle}
          />
        );

      case "text":
      case "richtext":
        return (
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            style={textareaStyle}
            rows={4}
          />
        );

      case "color":
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="color"
              value={typeof value === "string" ? value : "#000000"}
              onChange={(e) => onChange(e.target.value)}
              style={{ width: "28px", height: "28px", borderRadius: "4px", border: "1px solid #334155", padding: 0, cursor: "pointer" }}
            />
            <input
              type="text"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              style={inputStyle}
            />
          </div>
        );

      case "select":
        return (
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">-- Select --</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "array":
        return (
          <ArrayEditor
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
            itemFields={field.itemFields}
            defaultItem={field.defaultItem}
            depth={depth}
          />
        );

      case "object":
        if (collapsed) {
          return (
            <button
              onClick={() => setCollapsed(false)}
              style={{ ...btnStyle, background: "#1e293b", color: "#94a3b8" }}
            >
              + Expand {field.label ?? field.key}
            </button>
          );
        }
        return (
          <div style={{ border: "1px solid #1e293b", borderRadius: "6px", padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                {field.label ?? field.key}
              </span>
              <button
                onClick={() => setCollapsed(true)}
                style={{ ...btnStyle, background: "transparent", color: "#64748b" }}
              >
                ▲
              </button>
            </div>
            <JsonForm
              value={(typeof value === "object" && value !== null && !Array.isArray(value)) ? value as JsonObject : {}}
              onChange={(v) => onChange(v)}
              fields={field.itemFields}
              depth={depth + 1}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={typeof value === "string" ? value : value == null ? "" : JSON.stringify(value)}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle}
          />
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {type !== "boolean" && type !== "object" && (
        <span style={labelStyle}>{field.label ?? field.key}</span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {type === "boolean" && <span style={labelStyle}>{field.label ?? field.key}</span>}
        {renderField()}
      </div>
    </div>
  );
}

function ArrayEditor({
  value,
  onChange,
  itemFields,
  defaultItem,
  depth,
}: {
  value: JsonValue[];
  onChange: (v: JsonValue[]) => void;
  itemFields?: FieldDef[];
  defaultItem?: JsonObject;
  depth: number;
}) {
  const addItem = useCallback(() => {
    const item = defaultItem ?? {};
    onChange([...value, { ...item }]);
  }, [value, onChange, defaultItem]);

  const removeItem = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {value.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #1e293b",
            borderRadius: "6px",
            padding: "10px",
            position: "relative",
          }}
        >
          <button
            onClick={() => removeItem(index)}
            style={{
              ...btnStyle,
              position: "absolute",
              top: "6px",
              right: "6px",
              background: "#7f1d1d",
              color: "#fca5a5",
            }}
          >
            ✕
          </button>
          {typeof item === "object" && item !== null && !Array.isArray(item) ? (
            <JsonForm
              value={item as JsonObject}
              onChange={(v) => {
                const next = [...value];
                next[index] = v;
                onChange(next);
              }}
              fields={itemFields}
              depth={depth + 1}
            />
          ) : (
            <input
              type="text"
              value={typeof item === "string" ? item : JSON.stringify(item)}
              onChange={(e) => {
                const next = [...value];
                next[index] = e.target.value;
                onChange(next);
              }}
              style={inputStyle}
            />
          )}
        </div>
      ))}
      <button
        onClick={addItem}
        style={{ ...btnStyle, background: "#1e40af", color: "#e2e8f0" }}
      >
        + Add item
      </button>
    </div>
  );
}

function inferType(value: JsonValue): FieldDef["type"] {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object" && value !== null) return "object";
  return "string";
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
