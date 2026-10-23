import type { QuestionRecord, TopicRecord } from "@/lib/types";

export const demoTopics: TopicRecord[] = [
  { name: "Kirchhoff's laws", unit: "Unit I", frequency: 4, priority: "High", reason: "Appears in multiple sample papers and is foundational to circuit analysis.", evidence: ["Demo paper · 2022", "Demo paper · 2023", "Demo paper · 2025"] },
  { name: "Superposition theorem", unit: "Unit I", frequency: 3, priority: "High", reason: "Repeated circuit-solving method in the sample question set.", evidence: ["Demo paper · 2021", "Demo paper · 2024"] },
  { name: "Electromagnetic induction", unit: "Unit II", frequency: 3, priority: "Medium", reason: "Useful concept with both theory and numerical question variants.", evidence: ["Demo paper · 2022", "Demo paper · 2024"] },
  { name: "Star-delta transformation", unit: "Unit I", frequency: 2, priority: "Medium", reason: "Compact problem-solving topic suitable for timed practice.", evidence: ["Demo paper · 2023"] },
  { name: "Magnetic circuits", unit: "Unit II", frequency: 1, priority: "Explore", reason: "Consider revising alongside electromagnetism for balanced unit coverage.", evidence: ["Demo notes"] }
];

export const demoQuestions: QuestionRecord[] = [
  { id: "q-1", question: "State Kirchhoff's Current Law and explain its application to a junction.", marks: 4, unit: "Unit I", topic: "Kirchhoff's laws", type: "Conceptual", year: "2025", source: "Sample EEE paper · 2025", confidence: 0.92 },
  { id: "q-2", question: "Solve a two-loop DC network using Kirchhoff's Voltage Law.", marks: 8, unit: "Unit I", topic: "Kirchhoff's laws", type: "Numerical", year: "2024", source: "Sample EEE paper · 2024", confidence: 0.87 },
  { id: "q-3", question: "Explain the superposition theorem and list the steps used to solve a linear network.", marks: 6, unit: "Unit I", topic: "Superposition theorem", type: "Theory", year: "2024", source: "Sample EEE paper · 2024", confidence: 0.84 },
  { id: "q-4", question: "Describe star-delta transformation and state when it is useful.", marks: 5, unit: "Unit I", topic: "Star-delta transformation", type: "Theory", year: "2023", source: "Sample EEE paper · 2023", confidence: 0.8 },
  { id: "q-5", question: "State Faraday's laws of electromagnetic induction and explain Lenz's law.", marks: 6, unit: "Unit II", topic: "Electromagnetic induction", type: "Conceptual", year: "2024", source: "Sample EEE paper · 2024", confidence: 0.88 },
  { id: "q-6", question: "Define magnetic flux, flux density and reluctance with their SI units.", marks: 4, unit: "Unit II", topic: "Magnetic circuits", type: "Short answer", year: "2022", source: "Sample EEE paper · 2022", confidence: 0.72 },
  { id: "q-7", question: "Use the superposition theorem to find current through a specified branch in a two-source network.", marks: 10, unit: "Unit I", topic: "Superposition theorem", type: "Numerical", year: "2021", source: "Sample EEE paper · 2021", confidence: 0.76 },
  { id: "q-8", question: "Explain the relation between magnetic field, flux and magnetomotive force.", marks: 5, unit: "Unit II", topic: "Magnetic circuits", type: "Conceptual", year: "2023", source: "Sample revision notes", confidence: 0.68 }
];

export const demoDocuments = [
  { id: "sample-pyq-1", name: "EEE_University_Paper_2025.pdf", type: "PDF", size: "1.2 MB", kind: "past-paper", status: "Analysed", updated: "Demo workspace", sample: true, questions: 12, topics: 6, summary: "Sample paper metadata for exploring the workflow.", aiPowered: false },
  { id: "sample-bank-1", name: "Teacher_Question_Bank.docx", type: "DOCX", size: "246 KB", kind: "teacher-bank", status: "Analysed", updated: "Demo workspace", sample: true, questions: 18, topics: 9, summary: "Sample teacher question bank with conceptual and numerical questions.", aiPowered: false },
  { id: "sample-syllabus-1", name: "EEE_Unit_I_II_Syllabus.pdf", type: "PDF", size: "840 KB", kind: "syllabus", status: "Analysed", updated: "Demo workspace", sample: true, questions: 0, topics: 14, summary: "Sample syllabus map; replace with your current syllabus.", aiPowered: false }
];

export const subjects = [
  "Elements of Electrical Engineering",
  "Engineering Mathematics I",
  "Engineering Physics",
  "Engineering Graphics",
  "Fundamentals of Programming",
  "Computer Engineering",
  "Other / custom subject"
];
