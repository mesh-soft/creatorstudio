# Doctor Sites — AI Context Document

> This document is the complete reference for generating valid `site.json` and `page.json` files
> for the Doctor Sites platform. Provide this doc to your AI assistant to create or update sites
> through conversation, then import the generated JSON into the platform.

---

## Platform overview

Doctor Sites builds static websites for doctors and hospitals. Each tenant has:

- A **site config** (`site.json`) — identity, branding, contact info, and global settings
- One or more **page files** (`home.json`, `services.json`, etc.) — the blocks that make up each page

You can create a full website by generating these JSON files and importing them.

---

## File structures

### `site.json` — tenant identity and global settings

```
site.json
  tenantId          string  Unique kebab-case ID, e.g. "dr-priya-sharma"
  tenantType        "doctor" | "hospital"
  status            "active" | "inactive"
  settings[]        Array of 7 template objects (see below, order matters)
```

#### Settings templates (in order)

| # | `_template` | Purpose |
|---|-------------|---------|
| 1 | `subscription` | Plan and billing details |
| 2 | `domains` | Primary domain and aliases |
| 3 | `profile` | Doctor/hospital identity |
| 4 | `business` | Contact and location info |
| 5 | `presentation` | Theme, variant, style, color overrides |
| 6 | `header` | Global navigation |
| 7 | `seo` | Page title, description, keywords |

> **Note:** `footer` is an 8th optional settings template when a site-level footer is needed.

---

### `page.json` — blocks that make up a page

```
page.json
  blocks[]          Array of block objects (see Blocks Reference)
  settings[]        Array of exactly 3 template objects:
    [0]  urlSettings   slug, path, title, isHome
    [1]  presentation  themeId, variantPresetId, styleId  (page-level override)
    [2]  seo           title, description, keywords, ogImage
  _template         "page"  (always)
```

---

## Settings Template Reference

### `subscription`

```json
{
  "_template": "subscription",
  "plan": "doctor_starter",
  "billingCycle": "yearly",
  "validFrom": "2026-01-01",
  "validUntil": "2027-01-01",
  "graceUntil": "2027-01-15",
  "paymentStatus": "paid"
}
```

- `plan`: `"doctor_starter"` | `"doctor_pro"` | `"hospital_standard"` | `"hospital_pro"`
- `billingCycle`: `"monthly"` | `"yearly"`
- `paymentStatus`: `"paid"` | `"pending"` | `"overdue"`

---

### `domains`

```json
{
  "_template": "domains",
  "primary": "dr-priya-sharma.surge.sh",
  "aliases": ["priya.yourbrand.in"]
}
```

- `primary`: Main domain (subdomain on surge.sh by default)
- `aliases`: Optional additional domains

---

### `profile`

```json
{
  "_template": "profile",
  "displayName": "Dr. Priya Sharma",
  "specialty": "Dermatologist",
  "degrees": ["MBBS", "MD Dermatology"],
  "registrationNumber": "MCI-98765",
  "experienceYears": 12,
  "bio": "Short professional bio shown across the site.",
  "photo": "https://example.com/photo.jpg"
}
```

---

### `business`

```json
{
  "_template": "business",
  "clinicName": "Skin & Glow Clinic",
  "phone": "+91 98765 43210",
  "whatsapp": "+919876543210",
  "email": "info@skinandglow.com",
  "address": "42 MG Road, Koramangala, Bangalore",
  "mapUrl": "https://maps.google.com/?q=..."
}
```

---

### `presentation`

Controls the visual theme at site level. Page-level `presentation` overrides this.

```json
{
  "_template": "presentation",
  "themeId": "doctor-standard",
  "variantPresetId": "doctor-classic",
  "styleId": "doctor-teal-clean",
  "style": {
    "colors": {
      "primary": "#0f766e",
      "secondary": "#2563eb",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#111827"
    },
    "shape": {
      "radius": "8px"
    },
    "typography": {
      "heading": "Inter, Arial, sans-serif",
      "body": "Inter, Arial, sans-serif"
    }
  }
}
```

See **Themes & Styles Reference** below for valid values.

---

### `header`

```json
{
  "_template": "header",
  "show": true,
  "navLinks": ["Services", "About", "Contact"]
}
```

- `navLinks`: Simple string labels for now (the block-level header supports richer nav link objects — see `header` block)

---

### `footer` (optional 8th settings item)

```json
{
  "_template": "footer",
  "show": true,
  "copyright": "© 2026 Skin & Glow Clinic",
  "showBusinessInfo": true,
  "allRightsReserved": true,
  "socialLinks": [],
  "linksHeading": "Quick Links",
  "socialHeading": "Follow Us"
}
```

---

### `seo`

```json
{
  "_template": "seo",
  "title": "Dr. Priya Sharma | Dermatologist in Bangalore",
  "description": "Book a consultation with Dr. Priya Sharma, expert dermatologist in Bangalore.",
  "keywords": ["dermatologist bangalore", "skin specialist", "acne treatment"],
  "ogImage": "https://example.com/og-image.jpg"
}
```

---

## Blocks Reference

All blocks share these base fields:

| Field | Type | Description |
|-------|------|-------------|
| `_template` | string | Block type identifier (required) |
| `enabled` | boolean | `false` hides the block without deleting it |
| `variant` | string | Layout variant — see per-block options |
| `backgroundImage` | string | URL for a section background image |
| `css` | string (JSON) | Inline CSS overrides, e.g. `"{\"background-color\":\"#f5f5f5\"}"` |

---

### `header`

Renders the site navigation bar (overrides global header for this page).

```json
{
  "_template": "header",
  "enabled": true,
  "navLinks": [
    { "_template": "sectionLink", "label": "Services", "sectionId": "services" },
    { "_template": "sectionLink", "label": "Gallery",  "sectionId": "gallery"  },
    { "_template": "pageLink",    "label": "About",    "slug": "about"          },
    { "_template": "externalLink","label": "Blog",     "url": "https://..."     }
  ]
}
```

Nav link types:
- `sectionLink` — scrolls to a section on the same page (`sectionId` must match a block's `_template`)
- `pageLink` — links to another page on the same site by `slug`
- `externalLink` — opens any external URL

---

### `footer`

Renders the site footer (overrides global footer for this page).

```json
{
  "_template": "footer",
  "enabled": true,
  "copyright": "© 2026 My Clinic",
  "showBusinessInfo": true,
  "allRightsReserved": true,
  "socialLinks": [
    { "_template": "externalLink", "label": "Facebook",  "url": "https://facebook.com/..." },
    { "_template": "externalLink", "label": "Instagram", "url": "https://instagram.com/..." }
  ]
}
```

---

### `hero`

The main banner / top section of the page.

```json
{
  "_template": "hero",
  "enabled": true,
  "headline": "Expert care you can trust",
  "subheadline": "Personalized medical care with compassion and expertise.",
  "photo": "https://example.com/doctor.jpg",
  "buttons": [
    { "label": "Book on WhatsApp", "url": "https://wa.me/919876543210", "icon": "whatsapp", "variant": "primary" },
    { "label": "Call Now",         "url": "tel:+919876543210",           "icon": "phone",    "variant": "secondary" }
  ],
  "variant": "split",
  "backgroundImage": "https://example.com/bg.jpg"
}
```

**Variants:** `split` | `centered` | `compact` | `profile-card` | `credential` | `editorial` | `hospital` | `emergency` | `specialty` | `community` | `network`

---

### `profile`

Doctor bio and credentials section.

```json
{
  "_template": "profile",
  "enabled": true,
  "kicker": "About the Doctor",
  "title": "Dr. Priya Sharma",
  "body": "Dr. Priya Sharma is a board-certified dermatologist with 12 years of experience...",
  "experienceYears": 12,
  "experienceLabel": "Years of Experience",
  "registrationNumber": "MCI-98765",
  "registrationLabel": "MCI Registration",
  "variant": "credentials"
}
```

**Variants:** `credentials` | `editorial` | `timeline` | `overview` | `leadership`

---

### `services`

Cards/list of services offered.

```json
{
  "_template": "services",
  "enabled": true,
  "kicker": "What we treat",
  "title": "Our Services",
  "items": [
    { "title": "Acne Treatment",     "description": "Advanced treatment for all types of acne.", "icon": "shield"      },
    { "title": "Laser Therapy",      "description": "Non-invasive laser procedures.",             "icon": "scan"        },
    { "title": "Anti-Aging",         "description": "Botox, fillers, and skin rejuvenation.",     "icon": "heartFill"   },
    { "title": "Hair Loss",          "description": "PRP and medical management.",                "icon": "dna"         }
  ],
  "variant": "cards"
}
```

**Variants:** `cards` | `list` | `compact` | `featured` | `treatment-grid` | `departments` | `programs`

---

### `timings`

Clinic hours / availability.

```json
{
  "_template": "timings",
  "enabled": true,
  "kicker": "Visit Us",
  "title": "Clinic Timings",
  "items": [
    { "day": "Monday",    "primary": "10 AM – 1 PM",  "secondary": "5 PM – 8 PM"       },
    { "day": "Tuesday",   "primary": "10 AM – 1 PM",  "secondary": "Closed"            },
    { "day": "Wednesday", "primary": "10 AM – 1 PM",  "secondary": "5 PM – 8 PM"       },
    { "day": "Thursday",  "primary": "10 AM – 1 PM",  "secondary": "Closed"            },
    { "day": "Friday",    "primary": "10 AM – 1 PM",  "secondary": "5 PM – 8 PM"       },
    { "day": "Saturday",  "primary": "10 AM – 2 PM",  "secondary": "By appointment"    },
    { "day": "Sunday",    "primary": "Closed",         "secondary": "Closed"            }
  ],
  "variant": "table"
}
```

**Variants:** `table` | `list` | `chips` | `cards` | `emergency`

---

### `gallery`

Photo gallery section.

```json
{
  "_template": "gallery",
  "enabled": true,
  "kicker": "Our Clinic",
  "title": "Gallery",
  "items": [
    { "src": "https://example.com/clinic1.jpg", "alt": "Reception area" },
    { "src": "https://example.com/clinic2.jpg", "alt": "Consultation room" }
  ],
  "variant": "grid"
}
```

**Variants:** `grid` | `showcase` | `strip` | `facility`

---

### `faq`

Frequently asked questions.

```json
{
  "_template": "faq",
  "enabled": true,
  "kicker": "Have questions?",
  "title": "Frequently Asked Questions",
  "items": [
    { "question": "Do I need an appointment?",    "answer": "Yes, appointments are preferred. Walk-ins are welcome when slots are available." },
    { "question": "Do you accept insurance?",     "answer": "We accept most major insurance plans. Please call ahead to confirm coverage."   },
    { "question": "How long is a consultation?",  "answer": "Initial consultations are typically 20–30 minutes."                            }
  ],
  "variant": "accordion"
}
```

**Variants:** `accordion` | `list` | `two-column` | `checklist` | `search`

---

### `testimonials`

Patient reviews / quotes.

```json
{
  "_template": "testimonials",
  "enabled": true,
  "kicker": "What patients say",
  "title": "Patient Reviews",
  "items": [
    { "quote": "Dr. Sharma is very thorough and patient. My skin has improved dramatically!", "author": "Anita K." },
    { "quote": "Best dermatologist in Bangalore. The clinic is modern and welcoming.",         "author": "Rohit M." }
  ]
}
```

---

### `stats`

Key numbers / achievements.

```json
{
  "_template": "stats",
  "enabled": true,
  "items": [
    { "value": "12+",     "label": "Years Experience"   },
    { "value": "8,000+",  "label": "Happy Patients"     },
    { "value": "15,000+", "label": "Consultations Done" },
    { "value": "4.9★",    "label": "Google Rating"      }
  ]
}
```

---

### `awards`

Recognitions, certifications, and memberships.

```json
{
  "_template": "awards",
  "enabled": true,
  "kicker": "Recognition",
  "title": "Awards & Credentials",
  "items": [
    { "title": "Best Dermatologist",       "year": "2024", "organization": "City Medical Awards",   "icon": "award"      },
    { "title": "Member – IAD",             "year": "2015", "organization": "Indian Assoc. of Derm.", "icon": "certificate" },
    { "title": "LASER Safety Certification","year": "2019", "organization": "IADVL",                "icon": "shield"     }
  ]
}
```

---

### `cta`

Call-to-action banner (usually at the bottom of the page).

```json
{
  "_template": "cta",
  "enabled": true,
  "title": "Ready to book your consultation?",
  "body": "Call, WhatsApp, or walk in to our clinic.",
  "buttons": [
    { "label": "WhatsApp Us", "url": "https://wa.me/919876543210", "icon": "whatsapp", "variant": "primary"   },
    { "label": "Call Now",    "url": "tel:+919876543210",           "icon": "phone",    "variant": "secondary" }
  ],
  "variant": "banner"
}
```

**Variants:** `banner` | `inline` | `sticky` | `floating` | `booking-panel` | `emergency`

---

### `text`

Free-form text/heading section.

```json
{
  "_template": "text",
  "enabled": true,
  "heading": "Our Approach to Care",
  "body": "We believe every patient deserves personalized attention..."
}
```

---

### `whatsapp`

Floating WhatsApp chat button.

```json
{
  "_template": "whatsapp",
  "enabled": true,
  "phone": "+919876543210",
  "message": "Hi, I'd like to book a consultation.",
  "label": "Chat with us"
}
```

---

### `location`

Embedded map section.

```json
{
  "_template": "location",
  "enabled": true,
  "kicker": "Find Us",
  "title": "Our Location",
  "mapUrl": "https://maps.google.com/maps?q=...",
  "height": 400
}
```

---

## Themes & Styles Reference

### `themeId` — Block layout presets

| Value | Description |
|-------|-------------|
| `doctor-standard` | Hero → Profile → Awards → Services → Gallery → CTA |
| `doctor-profile-heavy` | Hero → Profile → Awards → Timings → FAQ → CTA |
| `doctor-service-heavy` | Hero → Services → Timings → Profile → Awards → CTA |
| `hospital-standard` | Hero → Services → Timings → Gallery → CTA |
| `hospital-emergency-first` | Timings → Hero → Services → CTA |

---

### `variantPresetId` — Block layout variant bundles

**Doctor presets:**

| Value | Hero | Profile | Services | Timings | Gallery | FAQ | CTA |
|-------|------|---------|----------|---------|---------|-----|-----|
| `doctor-classic` | split | credentials | cards | table | grid | accordion | banner |
| `doctor-editorial` | centered | editorial | list | list | showcase | list | inline |
| `doctor-compact` | compact | credentials | compact | chips | strip | accordion | sticky |
| `doctor-premium` | profile-card | editorial | featured | cards | showcase | two-column | floating |
| `doctor-specialist` | credential | timeline | treatment-grid | cards | grid | checklist | booking-panel |

**Hospital presets:**

| Value | Hero | Profile | Services | Timings | Gallery | FAQ | CTA |
|-------|------|---------|----------|---------|---------|-----|-----|
| `hospital-standard` | hospital | overview | departments | emergency | facility | search | emergency |
| `hospital-emergency` | emergency | overview | departments | emergency | facility | accordion | emergency |
| `hospital-specialty` | specialty | leadership | programs | table | showcase | two-column | banner |
| `hospital-community` | community | overview | cards | list | grid | list | inline |
| `hospital-network` | network | overview | departments | cards | facility | search | emergency |

---

### `styleId` — Colour & typography themes

| Value | Name | Mood |
|-------|------|------|
| `doctor-teal-clean` | Clinical Emerald | Professional, clean — good for GPs and specialists |
| `doctor-premium-warm` | Warm Patient-Centric | Warm, rounded — good for family medicine |
| `doctor-bright-child` | Pediatric Playful | Blue/pink/yellow — pediatrics |
| `doctor-derma-minimal` | Minimalist Aesthetic | Pink/rose, sharp edges — dermatology / aesthetics |
| `doctor-slate-precision` | Modern Specialist | Dark slate/blue — surgeons, cardiologists |
| `hospital-blue-modern` | Trusted Institution | Navy blue — multispecialty hospitals |
| `hospital-green-trust` | Wellness & Recovery | Deep green — wellness centers |
| `hospital-red-emergency` | High-Response Emergency | Red — emergency / trauma |
| `hospital-indigo-specialty` | Corporate Specialty | Indigo purple — specialty centers |
| `hospital-community-soft` | Friendly Local Clinic | Lime green, serif — community clinics |

---

## Available Icons

Use these values in `icon` fields (services items, awards items, buttons, nav links):

**Medical:** `heart` | `heartFill` | `activity` | `stethoscope` | `syringe` | `pill` | `microscope` | `brain` | `eye` | `tooth` | `baby` | `bandage` | `dna` | `ambulance` | `cross` | `scan` | `shield`

**Office/Building:** `building` | `home` | `graduation` | `certificate`

**Communication:** `phone` | `email` | `map` | `calendar` | `clock`

**People:** `users` | `user`

**UI:** `star` | `award` | `check` | `checkCircle` | `info`

**Social:** `whatsapp` | `facebook` | `twitter` | `instagram` | `linkedin` | `youtube`

---

## Button reference

Buttons appear in `hero.buttons[]` and `cta.buttons[]`:

```json
{
  "label": "Book Appointment",
  "url": "https://wa.me/919876543210",
  "icon": "whatsapp",
  "variant": "primary"
}
```

- `variant`: `"primary"` (filled, brand color) | `"secondary"` (outlined)
- `icon`: any icon value from the list above (optional)
- `url`: any URL — `tel:`, `mailto:`, `https://wa.me/`, internal paths all work

---

## Typical page block order

A good home page flows like this:

```
header → hero → stats → profile → awards → services → timings →
gallery → testimonials → faq → cta → whatsapp → footer
```

Not all sections are required — include only what's relevant. Set `"enabled": false` to
hide a block without removing it.

---

## Sample: `site.json`

```json
{
  "tenantId": "dr-priya-sharma",
  "tenantType": "doctor",
  "status": "active",
  "_template": "site",
  "settings": [
    {
      "_template": "subscription",
      "plan": "doctor_starter",
      "billingCycle": "yearly",
      "validFrom": "2026-01-01",
      "validUntil": "2027-01-01",
      "graceUntil": "2027-01-15",
      "paymentStatus": "paid"
    },
    {
      "_template": "domains",
      "primary": "dr-priya-sharma.surge.sh"
    },
    {
      "_template": "profile",
      "displayName": "Dr. Priya Sharma",
      "specialty": "Dermatologist",
      "degrees": ["MBBS", "MD Dermatology"],
      "registrationNumber": "MCI-98765",
      "experienceYears": 12,
      "bio": "Dr. Priya Sharma is a board-certified dermatologist with 12 years of experience in medical and cosmetic dermatology.",
      "photo": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80"
    },
    {
      "_template": "business",
      "clinicName": "Skin & Glow Clinic",
      "phone": "+91 98765 43210",
      "whatsapp": "+919876543210",
      "email": "info@skinandglow.com",
      "address": "42 MG Road, Koramangala, Bangalore – 560034",
      "mapUrl": "https://maps.google.com/?q=Skin+%26+Glow+Clinic+Koramangala"
    },
    {
      "_template": "presentation",
      "themeId": "doctor-standard",
      "variantPresetId": "doctor-premium",
      "styleId": "doctor-derma-minimal",
      "style": {
        "colors": {
          "primary": "#BE185D",
          "secondary": "#F9A8D4",
          "accent": "#9D174D",
          "background": "#FFFFFF",
          "surface": "#FFF1F2",
          "text": "#831843"
        },
        "shape": { "radius": "2px" },
        "typography": {
          "heading": "Inter, sans-serif",
          "body": "Inter, sans-serif"
        }
      }
    },
    {
      "_template": "header",
      "show": true,
      "navLinks": ["Services", "About", "Timings", "Contact"]
    },
    {
      "_template": "seo",
      "title": "Dr. Priya Sharma | Dermatologist in Bangalore",
      "description": "Expert dermatologist in Koramangala, Bangalore. Treatments for acne, laser therapy, anti-aging, and hair loss.",
      "keywords": ["dermatologist bangalore", "skin specialist koramangala", "acne treatment", "laser therapy"]
    }
  ]
}
```

---

## Sample: `home.json`

```json
{
  "_template": "page",
  "settings": [
    {
      "_template": "urlSettings",
      "slug": "home",
      "title": "Home",
      "path": "/",
      "isHome": true
    },
    {
      "_template": "presentation",
      "themeId": "doctor-standard",
      "variantPresetId": "doctor-premium",
      "styleId": "doctor-derma-minimal"
    },
    {
      "_template": "seo",
      "title": "Dr. Priya Sharma | Dermatologist in Bangalore",
      "description": "Expert dermatologist offering acne, laser, anti-aging, and hair loss treatments in Koramangala, Bangalore.",
      "keywords": ["dermatologist", "skin clinic", "bangalore"]
    }
  ],
  "blocks": [
    {
      "_template": "header",
      "enabled": true,
      "navLinks": [
        { "_template": "sectionLink", "label": "Services", "sectionId": "services" },
        { "_template": "sectionLink", "label": "About",    "sectionId": "profile"   },
        { "_template": "sectionLink", "label": "Gallery",  "sectionId": "gallery"   },
        { "_template": "sectionLink", "label": "Timings",  "sectionId": "timings"   }
      ]
    },
    {
      "_template": "hero",
      "enabled": true,
      "headline": "Skin care you can trust",
      "subheadline": "Expert dermatology, tailored to you. Medical and cosmetic treatments in Bangalore.",
      "buttons": [
        { "label": "Book on WhatsApp", "url": "https://wa.me/919876543210", "icon": "whatsapp", "variant": "primary"   },
        { "label": "Call Now",         "url": "tel:+919876543210",           "icon": "phone",    "variant": "secondary" }
      ],
      "variant": "profile-card"
    },
    {
      "_template": "stats",
      "enabled": true,
      "items": [
        { "value": "12+",    "label": "Years Experience"   },
        { "value": "8,000+", "label": "Happy Patients"     },
        { "value": "4.9★",   "label": "Google Rating"      }
      ]
    },
    {
      "_template": "services",
      "enabled": true,
      "kicker": "What we treat",
      "title": "Our Services",
      "items": [
        { "title": "Acne & Pimples",   "description": "Medical and procedural acne treatment for all skin types.",   "icon": "shield"      },
        { "title": "Laser Therapy",    "description": "Non-invasive laser for pigmentation, hair removal, and scars.", "icon": "scan"        },
        { "title": "Anti-Aging",       "description": "Botox, fillers, and skin rejuvenation.",                       "icon": "heartFill"   },
        { "title": "Hair Loss (PRP)",  "description": "Platelet-rich plasma therapy for hair regrowth.",              "icon": "dna"         },
        { "title": "Skin Allergy",     "description": "Patch testing and management of allergic skin conditions.",     "icon": "bandage"     },
        { "title": "Mole / Wart",      "description": "Safe removal under local anesthesia.",                         "icon": "cross"       }
      ],
      "variant": "featured"
    },
    {
      "_template": "profile",
      "enabled": true,
      "kicker": "About Dr. Priya",
      "title": "Dr. Priya Sharma — Dermatologist",
      "body": "With over 12 years in clinical and cosmetic dermatology, Dr. Priya Sharma combines evidence-based medicine with the latest aesthetic treatments. She is a member of the Indian Association of Dermatologists and has trained at AIIMS Delhi.",
      "experienceYears": 12,
      "experienceLabel": "Years of Expertise",
      "registrationNumber": "MCI-98765",
      "registrationLabel": "MCI Registration",
      "variant": "editorial"
    },
    {
      "_template": "awards",
      "enabled": true,
      "kicker": "Credentials",
      "title": "Awards & Memberships",
      "items": [
        { "title": "Best Dermatologist – Bangalore",  "year": "2024", "organization": "City Health Awards",    "icon": "award"       },
        { "title": "Member – Indian Assoc. of Derm.", "year": "2015", "organization": "IADVL",                "icon": "certificate" },
        { "title": "LASER Safety Certified",          "year": "2019", "organization": "IADVL Training Cell", "icon": "shield"      }
      ]
    },
    {
      "_template": "gallery",
      "enabled": true,
      "kicker": "Our Space",
      "title": "Clinic Gallery",
      "items": [
        { "src": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80", "alt": "Reception" },
        { "src": "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80", "alt": "Treatment room" },
        { "src": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", "alt": "Consultation" }
      ],
      "variant": "showcase"
    },
    {
      "_template": "timings",
      "enabled": true,
      "kicker": "Visit Us",
      "title": "Clinic Timings",
      "items": [
        { "day": "Monday",    "primary": "10 AM – 1 PM", "secondary": "5 PM – 8 PM"    },
        { "day": "Tuesday",   "primary": "10 AM – 1 PM", "secondary": "Closed"         },
        { "day": "Wednesday", "primary": "10 AM – 1 PM", "secondary": "5 PM – 8 PM"    },
        { "day": "Thursday",  "primary": "10 AM – 1 PM", "secondary": "Closed"         },
        { "day": "Friday",    "primary": "10 AM – 1 PM", "secondary": "5 PM – 8 PM"    },
        { "day": "Saturday",  "primary": "10 AM – 2 PM", "secondary": "By appointment" },
        { "day": "Sunday",    "primary": "Closed",        "secondary": "Closed"         }
      ],
      "variant": "table"
    },
    {
      "_template": "testimonials",
      "enabled": true,
      "kicker": "What patients say",
      "title": "Patient Reviews",
      "items": [
        { "quote": "Dr. Priya completely cleared my acne after years of struggle. She's thorough and patient.",          "author": "Anita K." },
        { "quote": "Best dermatologist I've visited. The clinic is modern and the results speak for themselves.",         "author": "Rohit M." },
        { "quote": "PRP treatment worked wonders for my hair fall. Dr. Sharma is incredibly knowledgeable.",             "author": "Meena S." }
      ]
    },
    {
      "_template": "faq",
      "enabled": true,
      "kicker": "Have questions?",
      "title": "Frequently Asked Questions",
      "items": [
        { "question": "Do I need an appointment?",      "answer": "Yes, appointments are preferred. Walk-ins are welcome when slots are available."          },
        { "question": "Do you accept insurance?",       "answer": "We accept most major insurance plans. Please call ahead to confirm your coverage."         },
        { "question": "How long is a consultation?",   "answer": "Initial consultations are typically 20–30 minutes."                                        },
        { "question": "Is laser treatment painful?",   "answer": "Most patients experience minimal discomfort. We apply numbing cream before procedures."    }
      ],
      "variant": "two-column"
    },
    {
      "_template": "cta",
      "enabled": true,
      "title": "Ready for glowing skin?",
      "body": "Book your consultation today — call, WhatsApp, or walk in.",
      "buttons": [
        { "label": "WhatsApp Us", "url": "https://wa.me/919876543210", "icon": "whatsapp", "variant": "primary"   },
        { "label": "Call Now",    "url": "tel:+919876543210",           "icon": "phone",    "variant": "secondary" }
      ],
      "variant": "banner"
    },
    {
      "_template": "whatsapp",
      "enabled": true,
      "phone": "+919876543210",
      "message": "Hi Dr. Priya, I'd like to book a consultation.",
      "label": "Chat on WhatsApp"
    },
    {
      "_template": "footer",
      "enabled": true,
      "copyright": "© 2026 Skin & Glow Clinic",
      "showBusinessInfo": true,
      "allRightsReserved": true,
      "socialLinks": [
        { "_template": "externalLink", "label": "Instagram", "url": "https://instagram.com/skinandglow" },
        { "_template": "externalLink", "label": "Facebook",  "url": "https://facebook.com/skinandglow"  }
      ]
    }
  ]
}
```

---

## Images

### Two ways to include images

**Option A — External URL (easiest, no upload needed)**

Use any public image URL directly. The platform fetches it at display time.

```json
{ "_template": "hero", "photo": "https://images.unsplash.com/photo-xxx?auto=format&fit=crop&w=900&q=80" }
```

**Option B — Uploaded local image (faster loads, no third-party dependency)**

Use a relative path with this exact format:

```
/content/{tenantType}s/{tenantId}/{filename}
```

Examples:
```
/content/doctors/dr-priya-sharma/profile-photo.jpg
/content/doctors/dr-priya-sharma/clinic-reception.jpg
/content/hospitals/city-care/building-exterior.jpg
```

When you import via the platform UI, **upload the matching image files** alongside the JSON.
The import will be blocked until every `/content/...` path referenced in the JSON has a
corresponding uploaded file (or was already uploaded to that tenant).

---

### Which fields accept images

| Block | Field | Notes |
|-------|-------|-------|
| `hero` | `photo` | Doctor photo shown next to headline |
| `hero` | `backgroundImage` | Full-section background |
| `profile` | `backgroundImage` | Section background |
| `gallery` | `items[].src` | Each gallery image |
| `header` | `logo` | Clinic/hospital logo |
| `footer` | `backgroundImage` | Footer background |
| `awards` | `backgroundImage` | Awards section background |
| Any block | `backgroundImage` | Every block supports a background image |
| `site.settings[profile]` | `photo` | Profile photo used site-wide |
| `site.settings[seo]` | `ogImage` | Social share preview image |

---

### Naming convention for uploaded images

- Use lowercase filenames with hyphens: `clinic-reception.jpg`, `dr-priya-headshot.jpg`
- No spaces or special characters
- Supported formats: JPG, PNG, WebP, GIF, SVG, AVIF
- Max file size: 10 MB

When the user describes their images to you, use their **exact filename** (sanitised to
lowercase-hyphens) as the path component. Example: if the user says "I have clinic.jpg",
use `/content/doctors/dr-priya-sharma/clinic.jpg` in the JSON.

---

### Example with local images

```json
{
  "_template": "hero",
  "enabled": true,
  "headline": "Expert skin care in Bangalore",
  "photo": "/content/doctors/dr-priya-sharma/dr-priya-headshot.jpg",
  "backgroundImage": "/content/doctors/dr-priya-sharma/clinic-bg.jpg",
  "buttons": [...]
}
```

```json
{
  "_template": "gallery",
  "enabled": true,
  "kicker": "Our Clinic",
  "title": "Gallery",
  "items": [
    { "src": "/content/doctors/dr-priya-sharma/reception.jpg",      "alt": "Reception area" },
    { "src": "/content/doctors/dr-priya-sharma/treatment-room.jpg", "alt": "Treatment room" }
  ]
}
```

---

## Validation rules

The platform validates every field listed below **before** writing any file.
If any rule is violated the import is rejected with a clear error. Generate JSON that passes
all rules on the first try.

---

### ID and slug format (applies everywhere)

```
Pattern : ^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$
Max len : 50 characters
```

Rule in plain English:
- **Lowercase only** — no uppercase letters ever
- **Must start and end with a letter or digit** — not a hyphen or underscore
- **Middle** may contain hyphens `-` and underscores `_`
- **Max 50 characters**

| Value | Valid? | Reason |
|-------|--------|--------|
| `dr-priya-sharma` | ✓ | |
| `city-care-hospital` | ✓ | |
| `dr_priya` | ✓ | underscore allowed |
| `a` | ✓ | single char ok |
| `-leading` | ✗ | starts with hyphen |
| `trailing-` | ✗ | ends with hyphen |
| `trailing_` | ✗ | ends with underscore |
| `Dr-Priya` | ✗ | uppercase |
| `dr priya` | ✗ | space not allowed |
| `dr.priya` | ✗ | dot not allowed |

This rule applies to:
- `tenantId` in `site.json`
- `slug` in `page.json` → `settings[0].slug` (urlSettings)
- Page filenames passed to the Add Page flow

---

### `tenantType`

Must be exactly one of:

```
"doctor"   "hospital"
```

Any other value is rejected.

---

### `settings[]._ template` in `site.json`

Only these values are accepted:

```
subscription  domains  profile  business
presentation  header   footer   seo   analytics
```

---

### Block `_template` in `page.json`

Only these 15 values are accepted:

```
header    footer      hero      profile    services
timings   gallery     faq       testimonials  stats
awards    cta         text      whatsapp   location
```

Any other string causes the import to fail.

---

### `presentation` enum fields

All three must come from the fixed lists below (or be omitted entirely).

**`themeId`** — must be one of:
```
doctor-standard          doctor-profile-heavy     doctor-service-heavy
hospital-standard        hospital-emergency-first
```

**`styleId`** — must be one of:
```
doctor-teal-clean        doctor-premium-warm      doctor-bright-child
doctor-derma-minimal     doctor-slate-precision
hospital-blue-modern     hospital-green-trust     hospital-red-emergency
hospital-indigo-specialty hospital-community-soft
```

**`variantPresetId`** — must be one of:
```
doctor-classic    doctor-editorial   doctor-compact
doctor-premium    doctor-specialist
hospital-standard hospital-emergency hospital-specialty
hospital-community hospital-network
```

---

### Block-level field rules

| Block | Field | Rule |
|-------|-------|------|
| `hero`, `cta` | `buttons[].variant` | Must be `"primary"` or `"secondary"` |
| `hero`, `cta` | `buttons[].label` | Required on every button |
| `gallery` | `items[].src` | Required on every item |
| `timings` | `items[].day` | Required on every item |
| `header` | `navLinks[]._ template` | Must be `sectionLink`, `pageLink`, or `externalLink` |
| Any block | `enabled` | `true` or `false` only |
| Any block | `css` | JSON string or omit entirely |

---

### `page.json` settings array

`settings[]` must have **at least one** entry:

```json
{ "_template": "urlSettings", "slug": "home", "title": "Home", "path": "/", "isHome": true }
```

- `slug` is **required** and must pass the ID/slug format above.
- `_template` must be exactly `"urlSettings"`.
- The `slug` determines the page filename (`home.json`, `services.json`, etc.).

---

### Image files (when uploading alongside JSON)

| Rule | Value |
|------|-------|
| Allowed formats | JPG, JPEG, PNG, WebP, GIF, SVG, AVIF |
| Max file size | 10 MB per file |
| Filename characters | Letters, digits, `.`, `-`, `_`, spaces (spaces → `_` on save) |
| Local path format | `/content/{type}s/{tenantId}/{filename}` |

If the JSON contains a `/content/...` path that has no matching uploaded file, the import is blocked.

---

## Instructions for the AI assistant

When generating JSON for this platform:

1. **Always output two files**: `site.json` (tenant identity) and `home.json` (homepage blocks).
2. **`site.json` settings[]** must have exactly 7 items in this order: `subscription`, `domains`, `profile`, `business`, `presentation`, `header`, `seo`.
3. **`home.json` settings[]** must have exactly 3 items in this order: `urlSettings`, `presentation`, `seo`.
4. **`tenantId`**: kebab-case, starts and ends with a letter or digit, lowercase only, max 50 chars. Example: `"dr-priya-sharma"`. Never use uppercase, dots, or spaces.
5. **Page `slug`**: same rules as `tenantId`. Use short descriptive slugs: `home`, `services`, `about`, `contact`.
6. **`themeId`, `styleId`, `variantPresetId`**: use only values from the enum lists in the Validation Rules section above. Never invent new values.
7. **Block `_template`**: use only the 15 types listed. Never invent block types.
8. **Choose `styleId` to match the specialty**: dermatology → `doctor-derma-minimal`, pediatrics → `doctor-bright-child`, cardiology/surgery → `doctor-slate-precision`, general → `doctor-teal-clean`.
9. **Match `variantPresetId` to the feel**: classic/clean → `doctor-classic`, premium/aesthetic → `doctor-premium`, fast/compact → `doctor-compact`.
10. **Set `enabled: true`** on every block you want visible; omit or set `false` to hide.
11. **Buttons** always need `label`, `url`, and `variant` (`"primary"` or `"secondary"`). `icon` is optional.
12. **Nav links** in the header block must use `_template`: `sectionLink`, `pageLink`, or `externalLink`.
13. **Do not add unknown fields** — stick to the fields documented for each block.
14. **`css`** fields should be omitted unless specific overrides are needed.
15. **Images**: Use external Unsplash URLs by default. If the user has specific image files, ask for their filenames and use `/content/{type}s/{tenantId}/{filename}` paths. Remind the user to upload those files when importing.
16. **When the user provides image filenames**, list them at the end of your response so the user knows exactly which files to upload. Format: `Upload these files: clinic.jpg, dr-headshot.png`

### Quick self-check before outputting JSON

Before finalising your output, verify:
- [ ] `tenantId` matches `^[a-z0-9]([a-z0-9-_]{0,48}[a-z0-9])?$`
- [ ] `tenantType` is `"doctor"` or `"hospital"`
- [ ] Every `_template` in `blocks[]` is one of the 15 valid block types
- [ ] Every `_template` in `settings[]` is one of the valid settings types
- [ ] `themeId`, `styleId`, `variantPresetId` are all from the enum lists
- [ ] `settings[0]` in `page.json` is `urlSettings` with a `slug` field
- [ ] Page `slug` matches the ID/slug format
- [ ] Every button has `label`, `url`, and `variant`
- [ ] Every gallery item has `src`
- [ ] Every timings item has `day`
- [ ] No `/content/...` image paths unless the user has confirmed they will upload those files
