// Shared data contract for Horizon AI. Both API routes and the wizard UI import
// from here so the JSON shape stays in lockstep. Mirrors the PRD JSON schema.

export interface PersonalInfo {
  first_name: string;
  last_name: string;
}

export interface TargetMarket {
  country: string; // e.g. "US", "Germany", "UAE"
  target_role: string; // desired English-market role, e.g. "Senior Product Manager"
}

export interface ExperienceItem {
  company: string;
  period: string;
  raw_ru_title: string;
  raw_ru_description: string;
  key_administrative_metrics: string[]; // e.g. ["число подчиненных", "бюджет P&L"]
  core_hands_on_skills: string[];
}

export interface ResumeProfile {
  personal_info: PersonalInfo;
  target_market: TargetMarket;
  experience: ExperienceItem[];
}

// One STAR clarification turn.
export interface QAItem {
  question: string;
  answer: string;
}

// ---- API contracts ----

// POST /api/parse  (multipart: file=<File>  OR  json: { text })
export interface ParseResponse {
  profile: ResumeProfile;
}

// POST /api/interview  { profile, history: QAItem[] }
export interface InterviewRequest {
  profile: ResumeProfile;
  history: QAItem[];
}
export interface InterviewResponse {
  // done=true -> no more questions, proceed to generate.
  done: boolean;
  question: string | null;
}

// POST /api/generate  { profile, qa, country, target_role }
export interface GenerateRequest {
  profile: ResumeProfile;
  qa: QAItem[];
  country: string;
  target_role: string;
}
export interface GenerateResponse {
  markdown: string;
}

export interface ApiError {
  error: string;
}

export const MAX_INTERVIEW_QUESTIONS = 3;

export const TARGET_COUNTRIES = ["US", "Germany", "UK", "UAE", "Netherlands", "Poland"] as const;
