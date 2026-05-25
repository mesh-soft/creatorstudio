import * as React from 'react';
import { useCMS } from '@toolkit/react-core/use-cms';
import type { Media } from '@toolkit/core';

// ── Stock image data (inlined — TinaCMS package has no dep on studio) ─────────

type StockCategory =
  | 'all' | 'hospital' | 'clinic' | 'doctors' | 'patients'
  | 'surgery' | 'nursing' | 'equipment' | 'lab' | 'cardiology'
  | 'pediatrics' | 'dental' | 'physio' | 'pharmacy' | 'elderly' | 'mental';

const STOCK_CATEGORIES: { value: StockCategory; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'hospital',   label: 'Hospital' },
  { value: 'clinic',     label: 'Clinic' },
  { value: 'doctors',    label: 'Doctors' },
  { value: 'patients',   label: 'Patients' },
  { value: 'surgery',    label: 'Surgery' },
  { value: 'nursing',    label: 'Nursing' },
  { value: 'equipment',  label: 'Equipment' },
  { value: 'lab',        label: 'Laboratory' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'dental',     label: 'Dental' },
  { value: 'physio',     label: 'Physiotherapy' },
  { value: 'pharmacy',   label: 'Pharmacy' },
  { value: 'elderly',    label: 'Elderly Care' },
  { value: 'mental',     label: 'Mental Health' },
];

const STOCK: { id: string; alt: string; cat: StockCategory }[] = [
  // ── Hospital ─────────────────────────────────────────────────────────────────
  { id: '1586773860418-d37222d8fce3', alt: 'Hospital exterior facade',        cat: 'hospital' },
  { id: '1519494026892-80bbd2d6fd0d', alt: 'Hospital reception lobby',        cat: 'hospital' },
  { id: '1632833239869-a37e3a5806d2', alt: 'Emergency department entrance',   cat: 'hospital' },
  { id: '1516981879613-9f5da904015f', alt: 'Hospital waiting room',           cat: 'hospital' },
  { id: '1538108149393-fbbd81895907', alt: 'Modern hospital interior',        cat: 'hospital' },
  { id: '1516549655169-df83a0774514', alt: 'Hospital corridor',               cat: 'hospital' },
  { id: '1576765608535-6ea37a7e8b0b', alt: 'Hospital hallway',                cat: 'hospital' },
  { id: '1551884831-ef1ab0b09d43',    alt: 'Healthcare building',             cat: 'hospital' },
  { id: '1576091160007-03d7d4caabda', alt: 'Hospital reception desk',         cat: 'hospital' },
  { id: '1586348943529-beaae9a08536', alt: 'Medical center lobby',            cat: 'hospital' },
  { id: '1584982751601-97dcc096dbab', alt: 'Modern hospital foyer',           cat: 'hospital' },
  { id: '1579154341122-cb06ccb67bc7', alt: 'Healthcare facility interior',    cat: 'hospital' },
  { id: '1504439904031-93eecea763f8', alt: 'Doctor with patient in hospital', cat: 'hospital' },
  { id: '1527613426-a2c90f7c5d87',    alt: 'Hospital staff corridor',         cat: 'hospital' },
  { id: '1612531386-a1a5e0b27d58',    alt: 'Hospital doctor at work',         cat: 'hospital' },

  // ── Clinic ───────────────────────────────────────────────────────────────────
  { id: '1631217868264-e5b90bb7e133', alt: 'Modern clinic interior',          cat: 'clinic' },
  { id: '1594824476967-48c8b964273f', alt: 'Clean clinic space',              cat: 'clinic' },
  { id: '1484807352052-23338990f6a3', alt: 'Doctor with tablet in clinic',    cat: 'clinic' },
  { id: '1605826518807-0e3e9d85aa66', alt: 'Medical office interior',         cat: 'clinic' },
  { id: '1591604466107-ec97de294816', alt: 'Bright examination room',         cat: 'clinic' },
  { id: '1579684453399-f6b481a6f89a', alt: 'Clinic waiting area',             cat: 'clinic' },
  { id: '1556742049-0cfed4f6a45d',    alt: 'Private consultation room',       cat: 'clinic' },
  { id: '1618498577-a68b2d47c7e0',    alt: 'Specialist clinic space',         cat: 'clinic' },
  { id: '1512678080-8bfbc6db0ec4',    alt: 'Doctor office desk',              cat: 'clinic' },
  { id: '1629909615397-a19c9dcde31e', alt: 'Clean modern clinic',             cat: 'clinic' },

  // ── Doctors ──────────────────────────────────────────────────────────────────
  { id: '1559839734-2b71ea197ec2',    alt: 'Female doctor portrait',          cat: 'doctors' },
  { id: '1612349317150-e413f6a5b16d', alt: 'Male doctor portrait',            cat: 'doctors' },
  { id: '1582750433449-648ed127bb54', alt: 'Doctor consultation',             cat: 'doctors' },
  { id: '1551601651-2a8555f1a136',    alt: 'Medical team together',           cat: 'doctors' },
  { id: '1622253692010-333f2da6031d', alt: 'Doctor with patient',             cat: 'doctors' },
  { id: '1600880292203-757bb62b4baf', alt: 'Doctor reviewing records',        cat: 'doctors' },
  { id: '1527613426-a2c90f7c5d87',    alt: 'Healthcare professional',         cat: 'doctors' },
  { id: '1504439904031-93eecea763f8', alt: 'Doctor patient interaction',      cat: 'doctors' },
  { id: '1560066984-138daef5ada1',    alt: 'Medical professional standing',   cat: 'doctors' },
  { id: '1612531386-a1a5e0b27d58',    alt: 'Doctor working on laptop',        cat: 'doctors' },
  { id: '1532938911079-1346d177d49a', alt: 'Doctor reviewing notes',          cat: 'doctors' },
  { id: '1519085360753-af0119f7cbe7', alt: 'Doctor with stethoscope',         cat: 'doctors' },
  { id: '1523580846011-d3a5bc25702b', alt: 'Medical team discussing case',    cat: 'doctors' },
  { id: '1588776814546-daab30f310d5', alt: 'Doctor explaining diagnosis',     cat: 'doctors' },
  { id: '1582719508461-f39e36a468d4', alt: 'Cardiologist specialist',         cat: 'doctors' },
  { id: '1638202993928-7d113b8e4519', alt: 'Senior doctor portrait',          cat: 'doctors' },
  { id: '1571772996211-2130032e8891', alt: 'Female specialist doctor',        cat: 'doctors' },

  // ── Patients ─────────────────────────────────────────────────────────────────
  { id: '1576091160399-112ba8d25d1d', alt: 'Patient consultation',            cat: 'patients' },
  { id: '1580281658223-9b93f18ae9ae', alt: 'Elderly patient care',            cat: 'patients' },
  { id: '1666214280557-f1b5022eb634', alt: 'Patient recovery room',           cat: 'patients' },
  { id: '1583454110551-21f2fa2afa95', alt: 'Patient talking to nurse',        cat: 'patients' },
  { id: '1578496781985-f66c2e27b9b2', alt: 'Patient in hospital bed',         cat: 'patients' },
  { id: '1540228232-26c93e4e7842',    alt: 'Patient sitting with doctor',     cat: 'patients' },
  { id: '1607746882042-944635dfe10e', alt: 'Patient leaving hospital',        cat: 'patients' },
  { id: '1613324268516-9f65a2e95a49', alt: 'Patient health check',            cat: 'patients' },
  { id: '1559757148-5d2e7b5c6d0d',    alt: 'Patient consultation close-up',   cat: 'patients' },

  // ── Surgery ──────────────────────────────────────────────────────────────────
  { id: '1589279153509-dde5b2ddf3b7', alt: 'Surgery team in OR',              cat: 'surgery' },
  { id: '1551190822-a9333d879b1f',    alt: 'Surgical operation',              cat: 'surgery' },
  { id: '1628771065518-0d82f1938462', alt: 'Surgeons in operating room',      cat: 'surgery' },
  { id: '1628595351029-c2bf17511435', alt: 'Cardiac surgery team',            cat: 'surgery' },
  { id: '1606811841689-23dfddce3e52', alt: 'Laparoscopic surgery',            cat: 'surgery' },
  { id: '1524578271613-d73bc2b14d0f', alt: 'Surgical instruments on tray',   cat: 'surgery' },
  { id: '1530497610245-94d3c16cda28', alt: 'Operating room preparation',      cat: 'surgery' },
  { id: '1609840110980-02d97b8d726b', alt: 'Surgeon at work',                 cat: 'surgery' },
  { id: '1603398938378-e54eab446dde', alt: 'Surgery team masked',             cat: 'surgery' },
  { id: '1576765608535-6ea37a7e8b0b', alt: 'Operating theatre corridor',      cat: 'surgery' },

  // ── Nursing ──────────────────────────────────────────────────────────────────
  { id: '1565182778-3b6a2b51cb3b',    alt: 'Nurse caring for patient',        cat: 'nursing' },
  { id: '1583454110551-21f2fa2afa95', alt: 'Nurse with patient',              cat: 'nursing' },
  { id: '1580281658223-9b93f18ae9ae', alt: 'Nurse checking vitals',           cat: 'nursing' },
  { id: '1527613426-a2c90f7c5d87',    alt: 'Nurse in scrubs portrait',        cat: 'nursing' },
  { id: '1588776814546-daab30f310d5', alt: 'Night shift nursing',             cat: 'nursing' },
  { id: '1638202993928-7d113b8e4519', alt: 'Nurse administering medication',  cat: 'nursing' },
  { id: '1613324268516-9f65a2e95a49', alt: 'Community nurse home visit',      cat: 'nursing' },

  // ── Equipment ────────────────────────────────────────────────────────────────
  { id: '1505751172876-fa1923c5c528', alt: 'Stethoscope on table',            cat: 'equipment' },
  { id: '1576091160550-2173dba999ef', alt: 'Medical equipment room',          cat: 'equipment' },
  { id: '1579684385127-1ef15d508118', alt: 'MRI scanner machine',             cat: 'equipment' },
  { id: '1585435557343-3b90031c0a92', alt: 'Medical lab equipment',           cat: 'equipment' },
  { id: '1614935151651-0bea6f0b49b5', alt: 'Digital health monitor',          cat: 'equipment' },
  { id: '1488229297595-580b0abb6a53', alt: 'Medical tablet device',           cat: 'equipment' },
  { id: '1470116945706-e6bf5d5a53ca', alt: 'Medical laboratory bench',        cat: 'equipment' },
  { id: '1574170090326-074d8e43c8e1', alt: 'Healthcare monitoring tools',     cat: 'equipment' },
  { id: '1524578271613-d73bc2b14d0f', alt: 'Surgical tools laid out',         cat: 'equipment' },
  { id: '1583941895-ac3b97bde370',    alt: 'ECG heart monitor',               cat: 'equipment' },
  { id: '1532938911079-1346d177d49a', alt: 'Ultrasound machine',              cat: 'equipment' },

  // ── Laboratory ───────────────────────────────────────────────────────────────
  { id: '1470116945706-e6bf5d5a53ca', alt: 'Scientific research lab',         cat: 'lab' },
  { id: '1581594649329-c79a54a9ea29', alt: 'Blood sample analysis',           cat: 'lab' },
  { id: '1585435557343-3b90031c0a92', alt: 'Lab technician working',          cat: 'lab' },
  { id: '1574170090326-074d8e43c8e1', alt: 'Laboratory test tubes',           cat: 'lab' },
  { id: '1576671081837-49000212a370', alt: 'PCR and genetic testing',         cat: 'lab' },
  { id: '1521790945508-caa0d5f72e48', alt: 'Pathology lab',                   cat: 'lab' },
  { id: '1550534791-a12d02af38fe',    alt: 'Medical research bottles',        cat: 'lab' },
  { id: '1577368787890-eca741b6a2d9', alt: 'Scientist examining sample',      cat: 'lab' },
  { id: '1606811841689-23dfddce3e52', alt: 'Microscope analysis',             cat: 'lab' },

  // ── Cardiology ───────────────────────────────────────────────────────────────
  { id: '1583941895-ac3b97bde370',    alt: 'Heart rate ECG monitor',          cat: 'cardiology' },
  { id: '1614935151651-0bea6f0b49b5', alt: 'Cardiac monitor display',         cat: 'cardiology' },
  { id: '1582719508461-f39e36a468d4', alt: 'Cardiogram print',                cat: 'cardiology' },
  { id: '1488229297595-580b0abb6a53', alt: 'Heart health check',              cat: 'cardiology' },
  { id: '1524578271613-d73bc2b14d0f', alt: 'Cardiac surgery preparation',     cat: 'cardiology' },
  { id: '1559839734-2b71ea197ec2',    alt: 'Cardiologist consultation',        cat: 'cardiology' },
  { id: '1574170090326-074d8e43c8e1', alt: 'Blood pressure measurement',      cat: 'cardiology' },
  { id: '1579684385127-1ef15d508118', alt: 'Cardiac MRI scan',                cat: 'cardiology' },
  { id: '1628771065518-0d82f1938462', alt: 'Open-heart surgery team',         cat: 'cardiology' },
  { id: '1581594649329-c79a54a9ea29', alt: 'Cholesterol blood test',          cat: 'cardiology' },

  // ── Pediatrics ───────────────────────────────────────────────────────────────
  { id: '1584820927498-cfe5211fd8bf', alt: 'Child eye examination',           cat: 'pediatrics' },
  { id: '1540228232-26c93e4e7842',    alt: 'Pediatrician with young patient', cat: 'pediatrics' },
  { id: '1606921231106-f1083329f33d', alt: 'Child physiotherapy',             cat: 'pediatrics' },
  { id: '1571772996211-2130032e8891', alt: 'Baby health check',               cat: 'pediatrics' },
  { id: '1588776814546-daab30f310d5', alt: 'Paediatrician with child',        cat: 'pediatrics' },
  { id: '1519085360753-af0119f7cbe7', alt: 'Child wearing stethoscope',       cat: 'pediatrics' },
  { id: '1559757148-5d2e7b5c6d0d',    alt: 'Newborn care',                    cat: 'pediatrics' },
  { id: '1638202993928-7d113b8e4519', alt: 'Child recovery',                  cat: 'pediatrics' },

  // ── Dental ───────────────────────────────────────────────────────────────────
  { id: '1609840110980-02d97b8d726b', alt: 'Dentist at work',                 cat: 'dental' },
  { id: '1521790945508-caa0d5f72e48', alt: 'Dental treatment in progress',    cat: 'dental' },
  { id: '1577368787890-eca741b6a2d9', alt: 'Dental X-ray review',             cat: 'dental' },
  { id: '1488229297595-580b0abb6a53', alt: 'Dental equipment closeup',        cat: 'dental' },
  { id: '1583941895-ac3b97bde370',    alt: 'Dental instruments tray',         cat: 'dental' },
  { id: '1524578271613-d73bc2b14d0f', alt: 'Orthodontic treatment',           cat: 'dental' },
  { id: '1607746882042-944635dfe10e', alt: 'Dental clinic smile',             cat: 'dental' },
  { id: '1571772996211-2130032e8891', alt: 'Teeth examination',               cat: 'dental' },

  // ── Physiotherapy ────────────────────────────────────────────────────────────
  { id: '1558618666-fcd25c85cd64',    alt: 'Physiotherapy session',           cat: 'physio' },
  { id: '1606921231106-f1083329f33d', alt: 'Rehabilitation exercise',         cat: 'physio' },
  { id: '1540228232-26c93e4e7842',    alt: 'Physical therapist with patient', cat: 'physio' },
  { id: '1583454110551-21f2fa2afa95', alt: 'Patient knee rehabilitation',     cat: 'physio' },
  { id: '1588776814546-daab30f310d5', alt: 'Back pain physiotherapy',         cat: 'physio' },
  { id: '1613324268516-9f65a2e95a49', alt: 'Mobility training exercise',      cat: 'physio' },
  { id: '1607746882042-944635dfe10e', alt: 'Post-op physiotherapy',           cat: 'physio' },

  // ── Pharmacy ─────────────────────────────────────────────────────────────────
  { id: '1576671081837-49000212a370', alt: 'Pharmacy counter',                cat: 'pharmacy' },
  { id: '1550534791-a12d02af38fe',    alt: 'Medicine bottles on shelf',       cat: 'pharmacy' },
  { id: '1563213126-a4273aed2016',    alt: 'Pharmacist at work',              cat: 'pharmacy' },
  { id: '1584308666744-24d5c474f2ae', alt: 'Pharmacy drug shelves',           cat: 'pharmacy' },
  { id: '1521790945508-caa0d5f72e48', alt: 'Prescription medication',         cat: 'pharmacy' },
  { id: '1583941895-ac3b97bde370',    alt: 'Pill organiser tray',             cat: 'pharmacy' },
  { id: '1581594649329-c79a54a9ea29', alt: 'Medical capsules',                cat: 'pharmacy' },
  { id: '1574170090326-074d8e43c8e1', alt: 'Pharmacist checking labels',      cat: 'pharmacy' },
  { id: '1577368787890-eca741b6a2d9', alt: 'Drug review consultation',        cat: 'pharmacy' },

  // ── Elderly Care ─────────────────────────────────────────────────────────────
  { id: '1580281658223-9b93f18ae9ae', alt: 'Elderly patient with carer',      cat: 'elderly' },
  { id: '1540228232-26c93e4e7842',    alt: 'Senior patient consultation',     cat: 'elderly' },
  { id: '1565182778-3b6a2b51cb3b',    alt: 'Caregiver with elderly person',   cat: 'elderly' },
  { id: '1583454110551-21f2fa2afa95', alt: 'Elderly mobility support',        cat: 'elderly' },
  { id: '1613324268516-9f65a2e95a49', alt: 'Memory care nurse',               cat: 'elderly' },
  { id: '1607746882042-944635dfe10e', alt: 'Aged care facility',              cat: 'elderly' },
  { id: '1638202993928-7d113b8e4519', alt: 'Geriatrician consultation',       cat: 'elderly' },
  { id: '1588776814546-daab30f310d5', alt: 'Retirement village doctor',       cat: 'elderly' },

  // ── Mental Health ─────────────────────────────────────────────────────────────
  { id: '1474631245212-d976ad9c7a26', alt: 'Therapy session',                 cat: 'mental' },
  { id: '1545205597-3d9d02c29597',    alt: 'Mental health counselling',        cat: 'mental' },
  { id: '1512678080-8bfbc6db0ec4',    alt: 'Therapist listening',              cat: 'mental' },
  { id: '1576091160399-112ba8d25d1d', alt: 'Group therapy session',            cat: 'mental' },
  { id: '1571772996211-2130032e8891', alt: 'Psychologist consultation',        cat: 'mental' },
  { id: '1483985988-d72dc13a31d8',    alt: 'Stress relief and wellness',       cat: 'mental' },
  { id: '1527613426-a2c90f7c5d87',    alt: 'Counsellor in session',            cat: 'mental' },
  { id: '1613324268516-9f65a2e95a49', alt: 'Online mental health support',     cat: 'mental' },
];

const BASE = 'https://images.unsplash.com/photo-';
const thumb = (id: string) => `${BASE}${id}?auto=format&fit=crop&w=300&q=70`;
const full  = (id: string) => `${BASE}${id}?auto=format&fit=crop&w=1200&q=80`;

const PAGE_SIZE = 24;

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  input: { value: string; onChange: (v: string) => void; name: string };
  meta: any;
  field: { label?: string; description?: string; name: string };
}

export function SharedImageField({ input, field }: Props) {
  const cms = useCMS();
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<StockCategory>('all');
  // Use composite "id-cat" key so duplicates across categories don't trigger each other's hover
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [erroredIds, setErroredIds] = React.useState<Set<string>>(new Set());

  const handleImageError = React.useCallback((id: string) => {
    setErroredIds(prev => new Set([...prev, id]));
  }, []);

  const handleCategoryChange = (cat: StockCategory) => {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  const filtered = activeCategory === 'all'
    ? STOCK
    : STOCK.filter(img => img.cat === activeCategory);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleCount;
  const hasMore = remaining > 0;

  const handleSelect = (id: string) => {
    input.onChange(full(id));
    setLibraryOpen(false);
  };

  const handleOpen = () => {
    setVisibleCount(PAGE_SIZE);
    setLibraryOpen(true);
  };

  const getTenantDirectory = (): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    const path = window.location.hash || window.location.pathname;
    const match =
      path.match(/\/collections\/edit\/(doctorSite|hospitalSite)\/([^/?#/]+)/) ||
      path.match(/\/collections\/(doctorSite|hospitalSite)\/~\/([^/?#/]+)/);
    if (match) {
      const type = match[1] === 'doctorSite' ? 'doctors' : 'hospitals';
      return `${type}/${match[2]}`;
    }
    return undefined;
  };

  const handleUpload = () => {
    const directory = getTenantDirectory();
    if (directory) sessionStorage.setItem('tina-media-target-directory', directory);
    cms.media.open({
      directory,
      onSelect: (media: Media) => {
        input.onChange(media.src || media.filename);
      },
    });
  };

  const value = input.value;

  return (
    <div style={{ margin: '12px 0' }}>
      {/* Label */}
      <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '6px', color: '#374151' }}>
        {field.label || field.name}
      </label>
      {field.description && (
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 8px' }}>{field.description}</p>
      )}

      {/* Preview + actions */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {value ? (
            <>
              <img
                src={value}
                alt="Selected"
                style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: '8px', display: 'block', border: '1px solid #e5e7eb' }}
              />
              <button
                type="button"
                onClick={() => input.onChange('')}
                title="Remove image"
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#ef4444', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: '11px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1, padding: 0,
                }}
              >
                ×
              </button>
            </>
          ) : (
            <div style={{
              width: 88, height: 88, borderRadius: '8px',
              border: '2px dashed #d1d5db', background: '#f9fafb',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', fontSize: '11px', gap: '4px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              <span>No image</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            type="button"
            onClick={handleOpen}
            style={btnStyle('#2563eb')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
            Stock Library
          </button>
          <button
            type="button"
            onClick={handleUpload}
            style={btnStyle('#374151', { background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db' })}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => input.onChange('')}
              style={{ ...btnStyle('#9ca3af', { background: 'transparent', color: '#9ca3af', border: 'none', padding: '3px 0' }), fontSize: '11px' }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Library modal */}
      {libraryOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setLibraryOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 19999999,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            background: '#fff', borderRadius: '12px',
            width: 'min(720px, 95vw)', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Stock Image Library</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>Unsplash — free to use, no attribution required</p>
              </div>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#6b7280', lineHeight: 1, padding: '4px 8px' }}
              >
                ×
              </button>
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '10px 16px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap', flexShrink: 0 }}>
              {STOCK_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategoryChange(cat.value)}
                  style={{
                    padding: '4px 11px', fontSize: '12px', fontWeight: 500,
                    borderRadius: '20px', cursor: 'pointer', border: 'none',
                    background: activeCategory === cat.value ? '#2563eb' : '#f3f4f6',
                    color: activeCategory === cat.value ? '#fff' : '#374151',
                    transition: 'background 0.12s',
                    lineHeight: '1.5',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Image grid */}
            <div style={{ overflow: 'auto', padding: '16px', flex: 1 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '8px',
              }}>
                {visible.map((img) => {
                  const itemKey = `${img.id}-${img.cat}`;
                  const isHovered = hoveredKey === itemKey;
                  return (
                    <button
                      key={itemKey}
                      type="button"
                      onClick={() => handleSelect(img.id)}
                      onMouseEnter={() => setHoveredKey(itemKey)}
                      onMouseLeave={() => setHoveredKey(null)}
                      style={{
                        position: 'relative', padding: 0, border: 'none', cursor: 'pointer',
                        borderRadius: '6px', overflow: 'hidden',
                        // Use box-shadow instead of transform to avoid layout bleed onto neighbours
                        boxShadow: isHovered
                          ? '0 0 0 2.5px #2563eb, 0 4px 12px rgba(37,99,235,0.25)'
                          : '0 0 0 2.5px transparent',
                        aspectRatio: '4/3',
                        display: erroredIds.has(img.id) ? 'none' : 'block',
                        transition: 'box-shadow 0.12s',
                        background: '#f3f4f6',
                      }}
                    >
                      <img
                        src={thumb(img.id)}
                        alt=""
                        loading="lazy"
                        onError={() => handleImageError(img.id)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {/* Hover overlay — only for THIS specific item */}
                      {isHovered && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 35%, transparent 100%)',
                          display: 'flex', alignItems: 'flex-end',
                          padding: '6px',
                          pointerEvents: 'none',
                        }}>
                          <span style={{
                            fontSize: '10px', color: '#fff', fontWeight: 600,
                            lineHeight: 1.3, maxWidth: '100%',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            display: 'block',
                          }}>
                            {img.alt}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Load more */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '20px', paddingBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                    style={{
                      padding: '9px 24px', fontSize: '13px', fontWeight: 500,
                      borderRadius: '8px', cursor: 'pointer',
                      background: '#fff', color: '#374151',
                      border: '1px solid #d1d5db',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14M5 12l7 7 7-7"/>
                    </svg>
                    Load more photos
                    <span style={{ color: '#9ca3af', fontWeight: 400 }}>({Math.min(PAGE_SIZE, remaining)} of {remaining} remaining)</span>
                  </button>
                </div>
              )}

              <p style={{ marginTop: '14px', fontSize: '11px', color: '#d1d5db', textAlign: 'center' }}>
                Photos from Unsplash · showing {Math.min(visibleCount, filtered.length)} of {filtered.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function btnStyle(
  _accent: string,
  overrides: React.CSSProperties = {}
): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', fontSize: '12px', fontWeight: 500,
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    background: '#2563eb', color: '#fff',
    whiteSpace: 'nowrap',
    ...overrides,
  };
}

export const SharedImageFieldPlugin = {
  name: 'shared-image',
  Component: SharedImageField,
};
