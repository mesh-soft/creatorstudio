import catchphrasesData from "../../data/catchphrases.json";

export type Specialty = keyof typeof catchphrasesData.specialties;
export type ExperienceLevel = "junior" | "mid" | "senior";

export interface CatchphraseSet {
  headlines: string[];
  subheadlines: string[];
  kickers?: string[];
  bios?: string[];
  services: Array<{ title: string; description: string; icon: string }>;
  ctas: string[];
  faqs: Array<{ question: string; answer: string }>;
  testimonials?: Array<{ quote: string; author: string }>;
  stats?: Array<{ value: string; label: string }>;
  awards?: Array<{ title: string; organization: string }>;
}

export type SuggestionFieldType =
  | "headline"
  | "subheadline"
  | "kicker"
  | "sectionTitle"
  | "bio"
  | "serviceTitle"
  | "serviceDescription"
  | "cta"
  | "buttonLabel"
  | "faqQuestion"
  | "faqAnswer"
  | "testimonialQuote"
  | "testimonialAuthor"
  | "timingDay"
  | "timingSlot"
  | "statValue"
  | "statLabel"
  | "awardTitle"
  | "awardOrg"
  | "general";

export interface SuggestionContext {
  specialty?: string;
  experienceYears?: number;
  fieldType: SuggestionFieldType;
}

function normalizeSpecialty(specialty?: string): Specialty | undefined {
  if (!specialty) return undefined;
  const normalized = specialty.toLowerCase().trim();
  if (normalized.includes("cardio")) return "cardiology";
  if (normalized.includes("derma") || normalized.includes("skin")) return "dermatology";
  if (normalized.includes("pediatric") || normalized.includes("paediatric") || normalized.includes("child")) return "pediatrics";
  if (normalized.includes("ortho") || normalized.includes("bone") || normalized.includes("joint")) return "orthopedics";
  if (normalized.includes("gynec") || normalized.includes("gynaec") || normalized.includes("obstet") || normalized.includes("women")) return "gynecology";
  if (normalized.includes("general") || normalized.includes("physician") || normalized.includes("family")) return "general-physician";
  if (normalized.includes("neuro") || normalized.includes("brain")) return "neurology";
  if (normalized.includes("ophthalm") || normalized.includes("eye") || normalized.includes("retina")) return "ophthalmology";
  if (normalized.includes("dent") || normalized.includes("tooth") || normalized.includes("smile") || normalized.includes("oral")) return "dentistry";
  if (normalized.includes("psychiat") || normalized.includes("mental") || normalized.includes("behav")) return "psychiatry";
  if (normalized in catchphrasesData.specialties) return normalized as Specialty;
  return undefined;
}

function getExperienceLevel(years?: number): ExperienceLevel {
  if (!years || years < 5) return "junior";
  if (years < 10) return "mid";
  return "senior";
}

export function getSuggestions(context: SuggestionContext): string[] {
  const specialty = normalizeSpecialty(context.specialty);
  const level = getExperienceLevel(context.experienceYears);
  const result: string[] = [];

  if (specialty && specialty in catchphrasesData.specialties) {
    const data = catchphrasesData.specialties[specialty] as CatchphraseSet;
    switch (context.fieldType) {
      case "headline":
        result.push(...data.headlines);
        break;
      case "subheadline":
        result.push(...data.subheadlines);
        break;
      case "kicker":
        result.push(...(data.kickers ?? []));
        break;
      case "sectionTitle":
        // Use shortened headlines + kickers as section titles
        result.push(...(data.kickers ?? []).slice(0, 4));
        result.push(...data.headlines.slice(0, 4).map(h => h.split(",")[0].split("—")[0].trim()));
        break;
      case "bio":
        result.push(...(data.bios ?? []));
        break;
      case "serviceTitle":
        result.push(...data.services.map((s) => s.title));
        break;
      case "serviceDescription":
        result.push(...data.services.map((s) => s.description));
        break;
      case "cta":
      case "buttonLabel":
        result.push(...data.ctas);
        break;
      case "faqQuestion":
        result.push(...data.faqs.map((f) => f.question));
        break;
      case "faqAnswer":
        result.push(...data.faqs.map((f) => f.answer));
        break;
      case "testimonialQuote":
        result.push(...(data.testimonials ?? []).map((t) => t.quote));
        break;
      case "testimonialAuthor":
        result.push(...(data.testimonials ?? []).map((t) => t.author));
        break;
      case "statValue":
        result.push(...(data.stats ?? []).map((s) => s.value));
        break;
      case "statLabel":
        result.push(...(data.stats ?? []).map((s) => s.label));
        break;
      case "awardTitle":
        result.push(...(data.awards ?? []).map((a) => a.title));
        break;
      case "awardOrg":
        result.push(...(data.awards ?? []).map((a) => a.organization));
        break;
      case "general":
        result.push(...data.headlines.slice(0, 3));
        result.push(...data.subheadlines.slice(0, 3));
        result.push(...data.ctas.slice(0, 2));
        break;
    }
  }

  // Add generic fallbacks when specialty-specific results are insufficient
  if (result.length < 6) {
    const gen = catchphrasesData.generic;
    switch (context.fieldType) {
      case "headline":
        result.push(...gen.headlines);
        break;
      case "subheadline":
        result.push(...gen.subheadlines);
        break;
      case "kicker":
        result.push(...gen.kickers);
        break;
      case "sectionTitle":
        result.push(...gen.sectionTitles);
        break;
      case "bio":
        result.push(...gen.bios);
        break;
      case "cta":
      case "buttonLabel":
        result.push(...gen.buttonLabels);
        break;
      case "testimonialQuote":
        result.push(...gen.testimonials.map((t) => t.quote));
        break;
      case "testimonialAuthor":
        result.push(...gen.testimonials.map((t) => t.author));
        break;
      case "statValue":
        result.push(...gen.stats.map((s) => s.value));
        break;
      case "statLabel":
        result.push(...gen.stats.map((s) => s.label));
        break;
      case "awardTitle":
        result.push(...gen.awards.map((a) => a.title));
        break;
      case "awardOrg":
        result.push(...gen.awards.map((a) => a.organization));
        break;
      case "timingDay":
        result.push("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
        break;
      case "timingSlot":
        result.push("9 AM – 1 PM", "10 AM – 2 PM", "2 PM – 6 PM", "4 PM – 8 PM", "5 PM – 9 PM", "By appointment only", "Closed");
        break;
      case "general":
        result.push(...gen.headlines.slice(0, 4));
        result.push(...gen.subheadlines.slice(0, 3));
        break;
    }
  }

  // Add experience-based prefixed variants for headlines
  if (context.fieldType === "headline" && context.experienceYears) {
    const prefixes = catchphrasesData.experienceLevels[level].prefixes;
    const withPrefixes = prefixes.flatMap((prefix) =>
      result.slice(0, 3).map((r) => `${prefix} ${r.charAt(0).toLowerCase() + r.slice(1)}`)
    );
    result.unshift(...withPrefixes);
  }

  return [...new Set(result)].slice(0, 12);
}

export function getServiceSuggestions(specialty?: string): Array<{ title: string; description: string; icon: string }> {
  const spec = normalizeSpecialty(specialty);
  if (spec && spec in catchphrasesData.specialties) {
    return (catchphrasesData.specialties[spec] as CatchphraseSet).services;
  }
  return [];
}

export function getTimingSuggestions(): Array<{ day: string; primary: string; secondary: string }> {
  return catchphrasesData.generic.timings;
}

export function getTestimonialSuggestions(specialty?: string): Array<{ quote: string; author: string }> {
  const spec = normalizeSpecialty(specialty);
  if (spec && spec in catchphrasesData.specialties) {
    const data = catchphrasesData.specialties[spec] as CatchphraseSet;
    if (data.testimonials?.length) return data.testimonials;
  }
  return catchphrasesData.generic.testimonials;
}

export function getStatSuggestions(specialty?: string): Array<{ value: string; label: string }> {
  const spec = normalizeSpecialty(specialty);
  if (spec && spec in catchphrasesData.specialties) {
    const data = catchphrasesData.specialties[spec] as CatchphraseSet;
    if (data.stats?.length) return data.stats;
  }
  return catchphrasesData.generic.stats;
}

export function getAwardSuggestions(specialty?: string): Array<{ title: string; organization: string }> {
  const spec = normalizeSpecialty(specialty);
  if (spec && spec in catchphrasesData.specialties) {
    const data = catchphrasesData.specialties[spec] as CatchphraseSet;
    if (data.awards?.length) return data.awards;
  }
  return catchphrasesData.generic.awards;
}
