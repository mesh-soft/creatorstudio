import catchphrasesData from "../../data/catchphrases.json";

export type Specialty = keyof typeof catchphrasesData.specialties;
export type ExperienceLevel = "junior" | "mid" | "senior";

export interface CatchphraseSet {
  headlines: string[];
  subheadlines: string[];
  services: Array<{ title: string; description: string; icon: string }>;
  ctas: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export interface SuggestionContext {
  specialty?: string;
  experienceYears?: number;
  fieldType: "headline" | "subheadline" | "serviceTitle" | "serviceDescription" | "cta" | "faqQuestion" | "faqAnswer" | "timingDay" | "timingSlot" | "general";
}

function normalizeSpecialty(specialty?: string): Specialty | undefined {
  if (!specialty) return undefined;
  const normalized = specialty.toLowerCase().trim();
  if (normalized.includes("cardio")) return "cardiology";
  if (normalized.includes("derma")) return "dermatology";
  if (normalized.includes("skin")) return "dermatology";
  if (normalized.includes("pediatric")) return "pediatrics";
  if (normalized.includes("child")) return "pediatrics";
  if (normalized.includes("ortho")) return "orthopedics";
  if (normalized.includes("bone")) return "orthopedics";
  if (normalized.includes("joint")) return "orthopedics";
  if (normalized.includes("gynec")) return "gynecology";
  if (normalized.includes("women")) return "gynecology";
  if (normalized.includes("general")) return "general-physician";
  if (normalized.includes("physician")) return "general-physician";
  if (normalized.includes("physician")) return "general-physician";
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
      case "serviceTitle":
        result.push(...data.services.map((s) => s.title));
        break;
      case "serviceDescription":
        result.push(...data.services.map((s) => s.description));
        break;
      case "cta":
        result.push(...data.ctas);
        break;
      case "faqQuestion":
        result.push(...data.faqs.map((f) => f.question));
        break;
      case "faqAnswer":
        result.push(...data.faqs.map((f) => f.answer));
        break;
      case "general":
        result.push(...data.headlines.slice(0, 2));
        result.push(...data.subheadlines.slice(0, 2));
        break;
    }
  }

  // Add generic fallbacks if specialty-specific results are few
  if (result.length < 3) {
    switch (context.fieldType) {
      case "headline":
        result.push(...catchphrasesData.generic.headlines);
        break;
      case "subheadline":
        result.push(...catchphrasesData.generic.subheadlines);
        break;
      case "cta":
        result.push("Book your consultation today.");
        break;
      case "timingDay":
        result.push("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
        break;
      case "timingSlot":
        result.push("9 AM - 1 PM", "10 AM - 2 PM", "2 PM - 6 PM", "5 PM - 8 PM", "By appointment", "Closed");
        break;
      case "general":
        result.push("Expert healthcare services", "Compassionate patient care", "State-of-the-art facilities");
        break;
    }
  }

  // Add experience-based prefixes for headlines
  if (context.fieldType === "headline" && context.experienceYears) {
    const prefixes = catchphrasesData.experienceLevels[level].prefixes;
    const withPrefixes = prefixes.flatMap((prefix) =>
      result.slice(0, 3).map((r) => `${prefix} ${r.charAt(0).toLowerCase() + r.slice(1)}`)
    );
    result.unshift(...withPrefixes);
  }

  return [...new Set(result)].slice(0, 8);
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

export function getTestimonialSuggestions(): Array<{ quote: string; author: string }> {
  return catchphrasesData.generic.testimonials;
}

export function getStatSuggestions(): Array<{ value: string; label: string }> {
  return catchphrasesData.generic.stats;
}
