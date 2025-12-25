export enum ScaleType {
  PHQ9 = 'PHQ-9',
  GAD7 = 'GAD-7',
  SAPS = 'SAPS',
  SANS = 'SANS',
  BPRS = 'BPRS',
  CAINS = 'CAINS',
  CUSTOM = 'CUSTOM'
}

export interface Question {
  id: string;
  text: string;
}

export interface AssessmentScale {
  type: ScaleType;
  title: string;
  description: string;
  questions: Question[];
  options: { value: number; label: string }[];
}

export interface AssessmentResult {
  id: string;
  patientId: string;
  date: string;
  scaleType: ScaleType | string;
  responses: Record<string, number>;
  totalScore: number;
  severity: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  history: AssessmentResult[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AIAnalysisResult {
  summary: string;
  clinicalImplications: string;
  recommendations: string[];
  severityLevel: string;
  sources?: GroundingSource[];
}