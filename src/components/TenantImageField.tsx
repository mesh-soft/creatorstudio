'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useCMS } from 'tinacms';
import type { Media } from 'tinacms';

interface TenantImageFieldProps {
  name: string;
  label?: string;
  description?: string;
  value?: string;
  onChange: (value: string) => void;
}

export function TenantImageField({
  name,
  label,
  description,
  value,
  onChange,
}: TenantImageFieldProps) {
  const cms = useCMS();

  const [, setHashTick] = useState(0);
  useEffect(() => {
    const onHashChange = () => setHashTick((t) => t + 1);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const getTenantDirectory = useCallback(() => {
    if (typeof window === 'undefined') return undefined;
    const path = window.location.hash || window.location.pathname;
    
    // Tina admin URL format (inside iframe):
    //   #/collections/edit/doctorSite/nitesh-garwa/pages/home.json
    // OR the ~/  format used in some Tina versions:
    //   #/collections/doctorSite/~/nitesh-garwa/...
    const match =
      path.match(/\/collections\/edit\/(doctorSite|hospitalSite)\/([^/?#\/]+)/) ||
      path.match(/\/collections\/(doctorSite|hospitalSite)\/~\/([^/?#\/]+)/);
    
    if (match) {
      const type = match[1] === 'doctorSite' ? 'doctors' : 'hospitals';
      const tenantId = match[2];
      return `${type}/${tenantId}`;
    }
    return undefined;
  }, []);

  const handleOpenMedia = useCallback(() => {
    const directory = getTenantDirectory();
    if (directory) {
      sessionStorage.setItem('tina-media-target-directory', directory);
    }
    cms.media.open({
      directory,
      onSelect: (media: Media) => {
        onChange(media.src || media.filename);
      },
    });
  }, [cms, getTenantDirectory, onChange]);

  const directory = getTenantDirectory();

  return (
    <div style={{ margin: '16px 0' }}>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>
        {label || name}
      </label>
      {description && (
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>{description}</p>
      )}
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {value ? (
          <div style={{ position: 'relative' }}>
            <img
              src={value}
              alt="Selected"
              style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' }}
            />
            <button
              onClick={() => onChange('')}
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div
            style={{
              width: 100,
              height: 100,
              border: '2px dashed #d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '12px',
            }}
          >
            No image
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input type="hidden" name={name} value={value || ""} />
          <button
            onClick={handleOpenMedia}
            style={{
              padding: '8px 16px',
              background: '#2296F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            📁 Browse Media
          </button>
          {directory && (
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              Folder: {directory}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TenantImageField;
