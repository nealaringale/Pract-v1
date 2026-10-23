export type QuestionRecord = {
  id: string;
  question: string;
  marks: number;
  unit: string;
  topic: string;
  type: string;
  year?: string;
  source: string;
  confidence?: number;
};

export type TopicRecord = {
  name: string;
  unit: string;
  frequency: number;
  priority: "High" | "Medium" | "Explore";
  reason: string;
  evidence: string[];
};

export type AnalysisRecord = {
  kind: "past-paper" | "syllabus" | "teacher-bank" | "notes" | "unknown";
  subject: string;
  summary: string;
  units: string[];
  topics: TopicRecord[];
  questions: QuestionRecord[];
  extractionMethod: string;
  aiPowered: boolean;
};
