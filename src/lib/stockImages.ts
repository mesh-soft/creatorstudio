/**
 * Curated Unsplash stock images for medical / healthcare use.
 * All photos are under the Unsplash License — free to use.
 */

export type StockImage = { id: string; alt: string; category: StockCategory };

export type StockCategory =
  | "all" | "hospital" | "clinic" | "doctors" | "patients"
  | "equipment" | "pediatrics" | "pharmacy" | "surgery"
  | "dental" | "physio" | "lab" | "nursing" | "cardiology"
  | "mental" | "elderly";

export const STOCK_CATEGORIES: { value: StockCategory; label: string }[] = [
  { value: "all",        label: "All" },
  { value: "hospital",   label: "Hospital" },
  { value: "clinic",     label: "Clinic" },
  { value: "doctors",    label: "Doctors" },
  { value: "patients",   label: "Patients" },
  { value: "surgery",    label: "Surgery" },
  { value: "nursing",    label: "Nursing" },
  { value: "equipment",  label: "Equipment" },
  { value: "lab",        label: "Laboratory" },
  { value: "cardiology", label: "Cardiology" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "dental",     label: "Dental" },
  { value: "physio",     label: "Physiotherapy" },
  { value: "pharmacy",   label: "Pharmacy" },
  { value: "elderly",    label: "Elderly Care" },
  { value: "mental",     label: "Mental Health" },
];

export const STOCK_IMAGES: StockImage[] = [
  // ── Hospital ───────────────────────────────────────────────────────────────
  { id: "1586773860418-d37222d8fce3", alt: "Hospital exterior facade",       category: "hospital" },
  { id: "1587351021759-3772687fe598", alt: "Large hospital building",         category: "hospital" },
  { id: "1519494026892-80bbd2d6fd0d", alt: "Hospital reception lobby",        category: "hospital" },
  { id: "1632833239869-a37e3a5806d2", alt: "Private patient room",            category: "hospital" },
  { id: "1516981879613-9f5da904015f", alt: "Hospital waiting room",           category: "hospital" },
  { id: "1538108149393-fbbd81895907", alt: "Modern hospital interior",        category: "hospital" },
  { id: "1516549655169-df83a0774514", alt: "Hospital corridor",               category: "hospital" },
  { id: "1576765608535-6ea37a7e8b0b", alt: "Hospital hallway",                category: "hospital" },
  { id: "1588775791215-63c3b3f12bf4", alt: "Medical facility entrance",       category: "hospital" },
  { id: "1551884831-ef1ab0b09d43",    alt: "Healthcare building",             category: "hospital" },
  { id: "1526256141740-0e86ffccfe3e", alt: "Hospital exterior night",         category: "hospital" },
  { id: "1622901558-f77d4c6e73e3",    alt: "Modern hospital complex",         category: "hospital" },
  { id: "1629909615184-74f495363b74", alt: "Hospital wing exterior",          category: "hospital" },
  { id: "1631563218350-0437e8eb7ab5", alt: "Hospital entrance doors",         category: "hospital" },
  { id: "1576091160007-03d7d4caabda", alt: "Hospital reception desk",         category: "hospital" },
  { id: "1586348943529-beaae9a08536", alt: "Medical center lobby",            category: "hospital" },
  { id: "1579154341122-cb06ccb67bc7", alt: "Healthcare facility interior",    category: "hospital" },
  { id: "1573883430697-1f33c5ece6a9", alt: "Emergency department entrance",   category: "hospital" },
  { id: "1530026405845-ced9c73f1561", alt: "Hospital consultation area",      category: "hospital" },
  { id: "1584982751601-97dcc096dbab", alt: "Modern hospital foyer",           category: "hospital" },

  // ── Clinic ─────────────────────────────────────────────────────────────────
  { id: "1631217868264-e5b90bb7e133", alt: "Modern clinic interior",          category: "clinic" },
  { id: "1631815590058-860b0282a53e", alt: "Bright clinic room",              category: "clinic" },
  { id: "1617450365226-4e8e1f85b926", alt: "Clinic consultation room",        category: "clinic" },
  { id: "1594824476967-48c8b964273f", alt: "Clean clinic space",              category: "clinic" },
  { id: "1579684453399-f6b481a6f89a", alt: "Clinic waiting area",             category: "clinic" },
  { id: "1556742049-0cfed4f6a45d",    alt: "Private consultation room",       category: "clinic" },
  { id: "1611689342806-0a74d2e52c47", alt: "Healthcare consultation space",   category: "clinic" },
  { id: "1629909615397-a19c9dcde31e", alt: "Clean modern clinic",             category: "clinic" },
  { id: "1484807352052-23338990f6a3", alt: "Doctor with tablet in clinic",    category: "clinic" },
  { id: "1605826518807-0e3e9d85aa66", alt: "Medical office interior",         category: "clinic" },
  { id: "1591604466107-ec97de294816", alt: "Bright examination room",         category: "clinic" },
  { id: "1534342022-1a4e0d4ee43a",    alt: "GP surgery room",                 category: "clinic" },
  { id: "1618498577-a68b2d47c7e0",    alt: "Specialist clinic space",         category: "clinic" },
  { id: "1512678080-8bfbc6db0ec4",    alt: "Doctor office desk",              category: "clinic" },
  { id: "1559757148-5d2e7b5c6d0d",    alt: "Medical consulting room",         category: "clinic" },

  // ── Doctors ────────────────────────────────────────────────────────────────
  { id: "1559839734-2b71ea197ec2",    alt: "Female doctor portrait",          category: "doctors" },
  { id: "1612349317150-e413f6a5b16d", alt: "Male doctor portrait",            category: "doctors" },
  { id: "1582750433449-648ed127bb54", alt: "Doctor consultation",             category: "doctors" },
  { id: "1551601651-2a8555f1a136",    alt: "Medical team together",           category: "doctors" },
  { id: "1622253692010-333f2da6031d", alt: "Doctor with patient",             category: "doctors" },
  { id: "1643297654416-05795d62e39d", alt: "Surgeon in scrubs",               category: "doctors" },
  { id: "1600880292203-757bb62b4baf", alt: "Doctor reviewing records",        category: "doctors" },
  { id: "1527613426-a2c90f7c5d87",    alt: "Healthcare professional",         category: "doctors" },
  { id: "1504439904031-93eecea763f8", alt: "Doctor patient interaction",      category: "doctors" },
  { id: "1560066984-138daef5ada1",    alt: "Medical professional standing",   category: "doctors" },
  { id: "1612531386-a1a5e0b27d58",    alt: "Doctor working on laptop",        category: "doctors" },
  { id: "1532938911079-1346d177d49a", alt: "Doctor reviewing notes",          category: "doctors" },
  { id: "1571772996211-2130032e8891", alt: "Female specialist doctor",        category: "doctors" },
  { id: "1519085360753-af0119f7cbe7", alt: "Doctor with stethoscope",         category: "doctors" },
  { id: "1523580846011-d3a5bc25702b", alt: "Medical team discussing case",    category: "doctors" },
  { id: "1588776814546-daab30f310d5", alt: "Doctor explaining diagnosis",     category: "doctors" },
  { id: "1576765607924-3a42f1e5a50c", alt: "Doctor in white coat",            category: "doctors" },
  { id: "1582719508461-f39e36a468d4", alt: "Cardiologist specialist",         category: "doctors" },
  { id: "1611689342806-0a74d2e52c47", alt: "Physician reviewing data",        category: "doctors" },
  { id: "1638202993928-7d113b8e4519", alt: "Senior doctor portrait",          category: "doctors" },

  // ── Patients ───────────────────────────────────────────────────────────────
  { id: "1576091160399-112ba8d25d1d", alt: "Patient consultation",            category: "patients" },
  { id: "1580281658223-9b93f18ae9ae", alt: "Elderly patient care",            category: "patients" },
  { id: "1666214280557-f1b5022eb634", alt: "Patient recovery room",           category: "patients" },
  { id: "1530026405845-ced9c73f1561", alt: "Friendly patient visit",          category: "patients" },
  { id: "1583454110551-21f2fa2afa95", alt: "Patient talking to nurse",        category: "patients" },
  { id: "1578496781985-f66c2e27b9b2", alt: "Patient in bed",                  category: "patients" },
  { id: "1540228232-26c93e4e7842",    alt: "Patient sitting with doctor",     category: "patients" },
  { id: "1607746882042-944635dfe10e", alt: "Patient leaving hospital",        category: "patients" },
  { id: "1530026405845-ced9c73f1561", alt: "Doctor speaking with patient",    category: "patients" },
  { id: "1559757175-0eb58430bdd7",    alt: "Patient at reception",            category: "patients" },
  { id: "1526256141740-0e86ffccfe3e", alt: "Outpatient clinic visit",         category: "patients" },
  { id: "1613324268516-9f65a2e95a49", alt: "Patient health check",            category: "patients" },
  { id: "1571772996211-2130032e8891", alt: "Patient with family",             category: "patients" },
  { id: "1588776814546-daab30f310d5", alt: "Patient signing forms",           category: "patients" },
  { id: "1621012144692-2a0c4e9b2b8a", alt: "Patient recovery journey",       category: "patients" },

  // ── Surgery ────────────────────────────────────────────────────────────────
  { id: "1589279153509-dde5b2ddf3b7", alt: "Surgery team in OR",              category: "surgery" },
  { id: "1551190822-a9333d879b1f",    alt: "Surgical operation close-up",     category: "surgery" },
  { id: "1628771065518-0d82f1938462", alt: "Surgeons in operating room",      category: "surgery" },
  { id: "1628595351029-c2bf17511435", alt: "Open heart surgery team",         category: "surgery" },
  { id: "1606811841689-23dfddce3e52", alt: "Laparoscopic surgery",            category: "surgery" },
  { id: "1524578271613-d73bc2b14d0f", alt: "Surgical instruments on tray",   category: "surgery" },
  { id: "1530497610245-94d3c16cda28", alt: "OR preparation",                  category: "surgery" },
  { id: "1609840110980-02d97b8d726b", alt: "Surgeon at work",                 category: "surgery" },
  { id: "1603398938378-e54eab446dde", alt: "Surgery team masked",             category: "surgery" },
  { id: "1629909615184-74f495363b74", alt: "Post-op recovery room",           category: "surgery" },
  { id: "1519494026892-80bbd2d6fd0d", alt: "Pre-operative care",              category: "surgery" },
  { id: "1576765608535-6ea37a7e8b0b", alt: "Operating theatre corridor",      category: "surgery" },

  // ── Equipment ──────────────────────────────────────────────────────────────
  { id: "1505751172876-fa1923c5c528", alt: "Stethoscope on table",            category: "equipment" },
  { id: "1576091160550-2173dba999ef", alt: "Medical equipment room",          category: "equipment" },
  { id: "1579684385127-1ef15d508118", alt: "MRI scanner machine",             category: "equipment" },
  { id: "1585435557343-3b90031c0a92", alt: "Medical lab equipment",           category: "equipment" },
  { id: "1614935151651-0bea6f0b49b5", alt: "Digital health monitor",          category: "equipment" },
  { id: "1581594649329-c79a54a9ea29", alt: "Blood pressure monitor",          category: "equipment" },
  { id: "1606921231106-f1083329f33d", alt: "Rehabilitation equipment",        category: "equipment" },
  { id: "1488229297595-580b0abb6a53", alt: "Medical tablet device",           category: "equipment" },
  { id: "1470116945706-e6bf5d5a53ca", alt: "Medical laboratory bench",        category: "equipment" },
  { id: "1574170090326-074d8e43c8e1", alt: "Healthcare monitoring tools",     category: "equipment" },
  { id: "1524578271613-d73bc2b14d0f", alt: "Surgical tools laid out",         category: "equipment" },
  { id: "1583941895-ac3b97bde370",    alt: "ECG / EKG monitor",               category: "equipment" },
  { id: "1622253692010-333f2da6031d", alt: "Medical imaging machine",         category: "equipment" },
  { id: "1532938911079-1346d177d49a", alt: "Ultrasound machine",              category: "equipment" },
  { id: "1526256141740-0e86ffccfe3e", alt: "X-ray viewing light board",       category: "equipment" },

  // ── Laboratory / Research ──────────────────────────────────────────────────
  { id: "1470116945706-e6bf5d5a53ca", alt: "Scientific research lab",         category: "lab" },
  { id: "1581594649329-c79a54a9ea29", alt: "Blood sample analysis",           category: "lab" },
  { id: "1606811841689-23dfddce3e52", alt: "Microscope slide analysis",       category: "lab" },
  { id: "1585435557343-3b90031c0a92", alt: "Lab technician working",          category: "lab" },
  { id: "1532938911079-1346d177d49a", alt: "Researcher with samples",         category: "lab" },
  { id: "1574170090326-074d8e43c8e1", alt: "Laboratory test tubes",           category: "lab" },
  { id: "1576671081837-49000212a370", alt: "PCR / genetic testing",           category: "lab" },
  { id: "1521790945508-caa0d5f72e48", alt: "Pathology lab",                   category: "lab" },
  { id: "1614935151651-0bea6f0b49b5", alt: "Digital lab results",             category: "lab" },
  { id: "1524578271613-d73bc2b14d0f", alt: "Lab preparation table",           category: "lab" },
  { id: "1550534791-a12d02af38fe",    alt: "Medical research bottles",        category: "lab" },
  { id: "1577368787890-eca741b6a2d9", alt: "Scientist examining sample",      category: "lab" },

  // ── Cardiology ─────────────────────────────────────────────────────────────
  { id: "1583941895-ac3b97bde370",    alt: "Heart rate ECG monitor",          category: "cardiology" },
  { id: "1614935151651-0bea6f0b49b5", alt: "Cardiac monitor display",        category: "cardiology" },
  { id: "1582719508461-f39e36a468d4", alt: "Cardiogram print",               category: "cardiology" },
  { id: "1488229297595-580b0abb6a53", alt: "Heart health check",             category: "cardiology" },
  { id: "1524578271613-d73bc2b14d0f", alt: "Cardiac surgery tools",          category: "cardiology" },
  { id: "1559839734-2b71ea197ec2",    alt: "Cardiologist consultation",       category: "cardiology" },
  { id: "1574170090326-074d8e43c8e1", alt: "Blood pressure measurement",     category: "cardiology" },
  { id: "1579684385127-1ef15d508118", alt: "Cardiac MRI scan",               category: "cardiology" },
  { id: "1628771065518-0d82f1938462", alt: "Open-heart surgery",             category: "cardiology" },
  { id: "1581594649329-c79a54a9ea29", alt: "Cholesterol blood test",         category: "cardiology" },

  // ── Pediatrics ─────────────────────────────────────────────────────────────
  { id: "1559757175-5700dde675bc",    alt: "Children's ward",                 category: "pediatrics" },
  { id: "1584820927498-cfe5211fd8bf", alt: "Child eye examination",           category: "pediatrics" },
  { id: "1576765607924-3a42f1e5a50c", alt: "Pediatric consultation",         category: "pediatrics" },
  { id: "1540228232-26c93e4e7842",    alt: "Pediatrician with young patient", category: "pediatrics" },
  { id: "1606921231106-f1083329f33d", alt: "Child physiotherapy",            category: "pediatrics" },
  { id: "1571772996211-2130032e8891", alt: "Baby health check",              category: "pediatrics" },
  { id: "1588776814546-daab30f310d5", alt: "Paediatrician and child",        category: "pediatrics" },
  { id: "1519085360753-af0119f7cbe7", alt: "Child wearing stethoscope",      category: "pediatrics" },
  { id: "1621012144692-2a0c4e9b2b8a", alt: "Kids hospital playroom",        category: "pediatrics" },
  { id: "1559757148-5d2e7b5c6d0d",    alt: "Newborn care",                   category: "pediatrics" },
  { id: "1622253692010-333f2da6031d", alt: "Infant checkup",                 category: "pediatrics" },
  { id: "1638202993928-7d113b8e4519", alt: "Child recovery",                 category: "pediatrics" },

  // ── Dental ─────────────────────────────────────────────────────────────────
  { id: "1490735891872-f43d23a18f1a", alt: "Dental clinic chair",            category: "dental" },
  { id: "1609840110980-02d97b8d726b", alt: "Dentist at work",                category: "dental" },
  { id: "1521790945508-caa0d5f72e48", alt: "Dental treatment in progress",   category: "dental" },
  { id: "1577368787890-eca741b6a2d9", alt: "Dental X-ray review",            category: "dental" },
  { id: "1571772996211-2130032e8891", alt: "Teeth examination",              category: "dental" },
  { id: "1559757148-5d2e7b5c6d0d",    alt: "Dental hygiene consultation",    category: "dental" },
  { id: "1488229297595-580b0abb6a53", alt: "Dental equipment closeup",       category: "dental" },
  { id: "1583941895-ac3b97bde370",    alt: "Dental instruments tray",        category: "dental" },
  { id: "1524578271613-d73bc2b14d0f", alt: "Orthodontic treatment",          category: "dental" },
  { id: "1526256141740-0e86ffccfe3e", alt: "Modern dental surgery",          category: "dental" },
  { id: "1607746882042-944635dfe10e", alt: "Smile and dental health",        category: "dental" },

  // ── Physiotherapy / Rehabilitation ─────────────────────────────────────────
  { id: "1558618666-fcd25c85cd64",    alt: "Physiotherapy session",          category: "physio" },
  { id: "1606921231106-f1083329f33d", alt: "Rehabilitation exercise",        category: "physio" },
  { id: "1540228232-26c93e4e7842",    alt: "Physical therapist with patient",category: "physio" },
  { id: "1571772996211-2130032e8891", alt: "Exercise therapy program",       category: "physio" },
  { id: "1583454110551-21f2fa2afa95", alt: "Patient knee rehabilitation",    category: "physio" },
  { id: "1588776814546-daab30f310d5", alt: "Back pain physiotherapy",        category: "physio" },
  { id: "1526256141740-0e86ffccfe3e", alt: "Sports injury recovery",         category: "physio" },
  { id: "1621012144692-2a0c4e9b2b8a", alt: "Hydrotherapy pool",             category: "physio" },
  { id: "1613324268516-9f65a2e95a49", alt: "Mobility training exercise",     category: "physio" },
  { id: "1607746882042-944635dfe10e", alt: "Post-op physiotherapy",          category: "physio" },

  // ── Pharmacy ───────────────────────────────────────────────────────────────
  { id: "1576671081837-49000212a370", alt: "Pharmacy counter",               category: "pharmacy" },
  { id: "1550534791-a12d02af38fe",    alt: "Medicine bottles on shelf",      category: "pharmacy" },
  { id: "1563213126-a4273aed2016",    alt: "Pharmacist at work",             category: "pharmacy" },
  { id: "1584308666744-24d5c474f2ae", alt: "Pharmacy drug shelves",          category: "pharmacy" },
  { id: "1521790945508-caa0d5f72e48", alt: "Prescription medication",        category: "pharmacy" },
  { id: "1583941895-ac3b97bde370",    alt: "Pill organiser tray",            category: "pharmacy" },
  { id: "1581594649329-c79a54a9ea29", alt: "Medical capsules",               category: "pharmacy" },
  { id: "1574170090326-074d8e43c8e1", alt: "Pharmacist checking labels",     category: "pharmacy" },
  { id: "1606811841689-23dfddce3e52", alt: "Automated pharmacy dispenser",   category: "pharmacy" },
  { id: "1526256141740-0e86ffccfe3e", alt: "Compounding pharmacy lab",       category: "pharmacy" },
  { id: "1577368787890-eca741b6a2d9", alt: "Drug interactions review",       category: "pharmacy" },

  // ── Nursing ────────────────────────────────────────────────────────────────
  { id: "1565182778-3b6a2b51cb3b",    alt: "Nurse caring for patient",       category: "nursing" },
  { id: "1583454110551-21f2fa2afa95", alt: "Nurse with patient",             category: "nursing" },
  { id: "1571772996211-2130032e8891", alt: "Nursing team on ward",           category: "nursing" },
  { id: "1559757148-5d2e7b5c6d0d",    alt: "ICU nurse monitoring",           category: "nursing" },
  { id: "1580281658223-9b93f18ae9ae", alt: "Nurse checking vitals",          category: "nursing" },
  { id: "1527613426-a2c90f7c5d87",    alt: "Nurse in scrubs portrait",       category: "nursing" },
  { id: "1588776814546-daab30f310d5", alt: "Night shift nursing",            category: "nursing" },
  { id: "1638202993928-7d113b8e4519", alt: "Nurse administering medication", category: "nursing" },
  { id: "1640952631-7f5ee41a9a51",    alt: "Paediatric nurse",               category: "nursing" },
  { id: "1613324268516-9f65a2e95a49", alt: "Community nurse home visit",     category: "nursing" },
  { id: "1621012144692-2a0c4e9b2b8a", alt: "Emergency room nurse",          category: "nursing" },

  // ── Elderly Care ───────────────────────────────────────────────────────────
  { id: "1580281658223-9b93f18ae9ae", alt: "Elderly patient with carer",     category: "elderly" },
  { id: "1540228232-26c93e4e7842",    alt: "Senior patient consultation",    category: "elderly" },
  { id: "1565182778-3b6a2b51cb3b",    alt: "Caregiver with elderly person",  category: "elderly" },
  { id: "1583454110551-21f2fa2afa95", alt: "Elderly mobility support",       category: "elderly" },
  { id: "1613324268516-9f65a2e95a49", alt: "Memory care nurse",              category: "elderly" },
  { id: "1607746882042-944635dfe10e", alt: "Aged care facility",             category: "elderly" },
  { id: "1638202993928-7d113b8e4519", alt: "Geriatrician consultation",      category: "elderly" },
  { id: "1526256141740-0e86ffccfe3e", alt: "Elderly exercise class",         category: "elderly" },
  { id: "1621012144692-2a0c4e9b2b8a", alt: "Senior health screening",       category: "elderly" },
  { id: "1588776814546-daab30f310d5", alt: "Retirement village doctor",      category: "elderly" },

  // ── Mental Health & Wellness ───────────────────────────────────────────────
  { id: "1474631245212-d976ad9c7a26", alt: "Therapy session",                category: "mental" },
  { id: "1545205597-3d9d02c29597",    alt: "Mental health counselling",       category: "mental" },
  { id: "1512678080-8bfbc6db0ec4",    alt: "Therapist listening",             category: "mental" },
  { id: "1559757148-5d2e7b5c6d0d",    alt: "Mindfulness meditation",          category: "mental" },
  { id: "1576091160399-112ba8d25d1d", alt: "Group therapy session",           category: "mental" },
  { id: "1571772996211-2130032e8891", alt: "Psychologist consultation",       category: "mental" },
  { id: "1483985988-d72dc13a31d8",    alt: "Stress relief and wellness",      category: "mental" },
  { id: "1524578271613-d73bc2b14d0f", alt: "Psychology office calm space",    category: "mental" },
  { id: "1527613426-a2c90f7c5d87",    alt: "Counsellor in session",           category: "mental" },
  { id: "1613324268516-9f65a2e95a49", alt: "Online mental health support",    category: "mental" },
];

const BASE = "https://images.unsplash.com/photo-";

export function stockThumbUrl(id: string, w = 300): string {
  return `${BASE}${id}?auto=format&fit=crop&w=${w}&q=70`;
}

export function stockFullUrl(id: string, w = 1200): string {
  return `${BASE}${id}?auto=format&fit=crop&w=${w}&q=80`;
}
