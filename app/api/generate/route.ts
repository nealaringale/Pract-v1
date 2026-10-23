import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SourceQuestion = {
  question?: string;
  marks?: number;
  unit?: string;
  topic?: string;
  source?: string;
  type?: string;
};

type PaperQuestion = {
  number: number;
  question: string;
  marks: number;
  unit: string;
  topic: string;
  type: string;
  source: string;
  reason: string;
  answerHint?: string;
};

type QuestionSeed = { question: string; topic: string; unit: string; type: string; hint: string };

const catalog: Record<string, QuestionSeed[]> = {
  "Elements of Electrical Engineering": [
    { question: "State Kirchhoff's Current Law and demonstrate how it is applied at a circuit junction.", topic: "Kirchhoff's laws", unit: "Unit I", type: "Conceptual", hint: "Relate algebraic current sum to charge conservation." },
    { question: "Apply Kirchhoff's Voltage Law to formulate loop equations for a two-loop DC network.", topic: "Kirchhoff's laws", unit: "Unit I", type: "Numerical", hint: "Choose a loop direction and keep voltage signs consistent." },
    { question: "Explain the superposition theorem and describe the procedure for a network with two independent sources.", topic: "Superposition theorem", unit: "Unit I", type: "Theory", hint: "Deactivate independent sources one at a time, then sum the responses." },
    { question: "Describe star-delta transformation and derive one of the conversion relations.", topic: "Star-delta transformation", unit: "Unit I", type: "Derivation", hint: "Use equivalent resistance between the same three terminals." },
    { question: "State Faraday's laws of electromagnetic induction and explain Lenz's law.", topic: "Electromagnetic induction", unit: "Unit II", type: "Conceptual", hint: "Explain induced EMF and the direction that opposes the change causing it." },
    { question: "Define magnetic flux, flux density, magnetomotive force and reluctance with SI units.", topic: "Magnetic circuits", unit: "Unit II", type: "Short answer", hint: "Give each definition, symbol and unit." },
    { question: "Explain the relationship between magnetic field intensity, permeability and flux density.", topic: "Electromagnetism", unit: "Unit II", type: "Theory", hint: "Introduce B = μH and explain each quantity." },
    { question: "Solve a DC network using the superposition theorem and verify the branch current.", topic: "Superposition theorem", unit: "Unit I", type: "Numerical", hint: "Find the contribution of each source independently." },
    { question: "Differentiate between active and passive networks with examples.", topic: "Network classification", unit: "Unit I", type: "Short answer", hint: "Define each type and give one circuit example." },
    { question: "Explain electromagnetic induction in a coil moving through a magnetic field.", topic: "Electromagnetic induction", unit: "Unit II", type: "Application", hint: "Mention flux linkage and the rate of change of flux." }
  ],
  "Engineering Mathematics I": [
    { question: "Find the eigenvalues and eigenvectors of a given square matrix.", topic: "Matrices", unit: "Unit I", type: "Numerical", hint: "Solve the characteristic equation, then the associated system." },
    { question: "Evaluate a limit using an appropriate algebraic or standard-limit method.", topic: "Limits", unit: "Unit I", type: "Numerical", hint: "Identify the indeterminate form and apply a suitable transformation." },
    { question: "Differentiate a composite function and explain the chain rule used.", topic: "Differentiation", unit: "Unit II", type: "Numerical", hint: "Differentiate the outer function and multiply by the inner derivative." },
    { question: "Find the maxima and minima of a function on the specified interval.", topic: "Applications of derivatives", unit: "Unit II", type: "Numerical", hint: "Find critical points and verify their nature." },
    { question: "Evaluate a definite integral using substitution or integration by parts.", topic: "Integration", unit: "Unit III", type: "Numerical", hint: "Choose the method based on the integrand structure." },
    { question: "Explain the rank of a matrix and determine it using row reduction.", topic: "Matrices", unit: "Unit I", type: "Conceptual", hint: "Reduce to echelon form and count non-zero rows." }
  ],
  "Engineering Physics": [
    { question: "Explain interference of light and state conditions for sustained interference.", topic: "Wave optics", unit: "Unit I", type: "Theory", hint: "Discuss coherent sources, path difference and phase relationship." },
    { question: "State the laws of photoelectric emission and explain Einstein's equation.", topic: "Modern physics", unit: "Unit II", type: "Derivation", hint: "Relate photon energy to work function and maximum kinetic energy." },
    { question: "Describe the construction and working of a laser with an energy-level diagram.", topic: "Lasers", unit: "Unit II", type: "Theory", hint: "Mention stimulated emission and population inversion." },
    { question: "Solve a numerical problem using the de Broglie wavelength relation.", topic: "Quantum physics", unit: "Unit III", type: "Numerical", hint: "Use wavelength = Planck constant divided by momentum." },
    { question: "Explain numerical aperture and acceptance angle in an optical fibre.", topic: "Optical fibre", unit: "Unit I", type: "Conceptual", hint: "Define light acceptance and relate it to refractive indices." }
  ],
  "Engineering Graphics": [
    { question: "Draw the projections of a line inclined to both HP and VP using the given dimensions.", topic: "Projection of lines", unit: "Unit II", type: "Drawing", hint: "Start with the true-length view or use the rotation method." },
    { question: "Construct the projections of a point located above HP and in front of VP.", topic: "Projection of points", unit: "Unit I", type: "Drawing", hint: "Use XY as reference and follow first-angle convention." },
    { question: "Draw orthographic views of the given simple machine component.", topic: "Orthographic projection", unit: "Unit III", type: "Drawing", hint: "Align views and use the front view to show maximum detail." },
    { question: "Construct an isometric view from the supplied orthographic views.", topic: "Isometric projection", unit: "Unit IV", type: "Drawing", hint: "Lay out the isometric axes and transfer dimensions accurately." },
    { question: "Explain the difference between first-angle and third-angle projection.", topic: "Projection principles", unit: "Unit I", type: "Conceptual", hint: "Compare the positions of the object, observer and projection plane." }
  ],
  "Fundamentals of Programming": [
    { question: "Write an algorithm and flowchart to determine whether an integer is prime.", topic: "Problem solving", unit: "Unit I", type: "Programming", hint: "Check divisors up to the square root of the number." },
    { question: "Explain the difference between a while loop and a do-while loop with examples.", topic: "Iteration", unit: "Unit II", type: "Theory", hint: "Compare when the condition is evaluated." },
    { question: "Write a program to find the largest element in an array.", topic: "Arrays", unit: "Unit III", type: "Programming", hint: "Track the current maximum while traversing the array." },
    { question: "Explain functions, parameters, return values and modular programming.", topic: "Functions", unit: "Unit III", type: "Conceptual", hint: "Discuss reuse, decomposition and local scope." },
    { question: "Trace a nested loop and determine the exact output of the program.", topic: "Control flow", unit: "Unit II", type: "Problem solving", hint: "Make a dry-run table for each iteration." },
    { question: "Explain pointers and demonstrate how a pointer refers to a variable address.", topic: "Pointers", unit: "Unit IV", type: "Theory", hint: "Distinguish a variable's value from its memory address." }
  ]
};

function safeText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 1800) : fallback;
}

function buildChunks(total: number): number[] {
  const result: number[] = [];
  let remaining = total;
  while (remaining > 0) {
    let next = 10;
    if (remaining < 10) {
      if (remaining === 9 || remaining === 7) next = 5;
      else if (remaining === 3) next = 2;
      else next = remaining;
    }
    result.push(next);
    remaining -= next;
  }
  return result;
}

function buildDemoPaper(input: Record<string, unknown>) {
  const subject = safeText(input.subject, "General Engineering");
  const totalMarks = Math.min(200, Math.max(10, Math.round(Number(input.totalMarks) || 50)));
  const durationMinutes = Math.min(360, Math.max(15, Math.round(Number(input.durationMinutes) || 120)));
  const difficulty = safeText(input.difficulty, "Balanced");
  const format = safeText(input.format, "University pattern");
  const selectedUnits = Array.isArray(input.units) && input.units.length
    ? input.units.filter((unit): unit is string => typeof unit === "string").slice(0, 20)
    : ["Unit I", "Unit II", "Unit III"];
  const materials = Array.isArray(input.materials) ? input.materials as SourceQuestion[] : [];
  const imported: QuestionSeed[] = materials.filter(item => safeText(item.question).length > 12).slice(0, 60).map((item, index) => ({
    question: safeText(item.question),
    topic: safeText(item.topic, "Imported question"),
    unit: safeText(item.unit, selectedUnits[index % selectedUnits.length] || "Unmapped"),
    type: safeText(item.type, "From upload"),
    hint: "Review the related source material and show the key steps."
  }));
  const fallback: QuestionSeed[] = [
    { question: "Define the key concepts in this unit and explain their practical importance.", topic: "Core concepts", unit: "Unit I", type: "Conceptual", hint: "Write a precise definition followed by an application." },
    { question: "Explain a major principle from the syllabus with a suitable example.", topic: "Fundamental principles", unit: "Unit I", type: "Theory", hint: "State the principle, explain its parts and add an example." },
    { question: "Solve a representative problem using the method taught in this unit.", topic: "Problem solving", unit: "Unit II", type: "Numerical", hint: "Show the method, intermediate steps and units." },
    { question: "Compare two important ideas from the selected syllabus units.", topic: "Comparative concepts", unit: "Unit II", type: "Theory", hint: "Use a comparison table with meaningful criteria." },
    { question: "Describe an application of the subject and justify the method used.", topic: "Applications", unit: "Unit III", type: "Application", hint: "Connect the concept to a practical example." }
  ];
  const sourcePool = catalog[subject] || fallback;
  const allowed = (items: QuestionSeed[]) => items.filter(item => selectedUnits.some(unit => item.unit === unit) || selectedUnits.length === 0);
  let pool = allowed(imported.concat(sourcePool));
  if (!pool.length) pool = imported.concat(sourcePool);
  const questions: PaperQuestion[] = buildChunks(totalMarks).map((marks, index) => {
    const seed = pool[index % pool.length];
    const usedUploadedQuestion = imported.some(item => item.question === seed.question);
    return {
      number: index + 1,
      question: seed.question,
      marks,
      unit: seed.unit || "Unmapped",
      topic: seed.topic,
      type: seed.type,
      source: usedUploadedQuestion ? "Uploaded question bank" : "Demo question catalogue",
      reason: usedUploadedQuestion ? "Selected from material uploaded in this workspace." : "Illustrative question included to demonstrate paper assembly.",
      answerHint: input.includeHints === false ? undefined : seed.hint
    };
  });
  const groupSize = Math.max(1, Math.ceil(questions.length / 3));
  const sections: Array<{ name: string; instructions: string; questions: PaperQuestion[] }> = format.toLowerCase().includes("quick")
    ? [{ name: "Rapid revision", instructions: "Answer every question. Focus on key definitions and steps.", questions }]
    : [
        { name: "Section A · Core concepts", instructions: "Keep definitions precise and answers well structured.", questions: questions.slice(0, groupSize) },
        { name: "Section B · Applied practice", instructions: "Show your method and intermediate steps where applicable.", questions: questions.slice(groupSize, groupSize * 2) },
        { name: "Section C · Extended responses", instructions: "Structure longer explanations and justify your reasoning.", questions: questions.slice(groupSize * 2) }
      ].filter(section => section.questions.length > 0);
  return {
    title: subject + " · Practice paper",
    subject,
    totalMarks,
    marksAssigned: questions.reduce((sum, question) => sum + question.marks, 0),
    durationMinutes,
    difficulty,
    format,
    units: selectedUnits,
    sections,
    questions,
    generatedAt: new Date().toISOString(),
    mode: "demo",
    confidenceNote: "Demo paper assembled from illustrative questions and any extracted uploads. It is not a forecast of the actual examination."
  };
}

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return NextResponse.json({ error: "Send a JSON object with your paper settings." }, { status: 400 });
    input = raw as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const subject = safeText(input.subject);
  if (!subject) return NextResponse.json({ error: "Choose a subject first." }, { status: 400 });
  input.totalMarks = Math.min(200, Math.max(10, Math.round(Number(input.totalMarks) || 50)));
  input.durationMinutes = Math.min(360, Math.max(15, Math.round(Number(input.durationMinutes) || 120)));

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ paper: buildDemoPaper(input), mode: "demo" });

  const model = (process.env.GEMINI_MODEL || "gemini-3.8-flash").replace(/[^a-zA-Z0-9._-]/g, "");
  const materialList = Array.isArray(input.materials) ? input.materials.slice(0, 60) : [];
  const topicList = Array.isArray(input.topics) ? input.topics.slice(0, 40) : [];
  const prompt = [
    "Create an exam-practice mock paper as a JSON object only. Never claim this predicts the actual examination.",
    "Use supplied material as evidence. Do not invent past-paper years or references. Source each question with a source label or mark it as an AI-generated variation.",
    "The sum of question marks MUST exactly equal totalMarks. Keep each question in a section and also include a flat questions array.",
    "Return fields: title, subject, totalMarks, marksAssigned, durationMinutes, difficulty, format, units, sections (each with name, instructions, questions), questions (objects with number, question, marks, unit, topic, type, source, reason, answerHint), confidenceNote.",
    "If source material is sparse, state that in confidenceNote. Make the paper practical, varied and internally consistent.",
    "Student settings: " + JSON.stringify({ subject, totalMarks: input.totalMarks, durationMinutes: input.durationMinutes, difficulty: input.difficulty, format: input.format, units: input.units, includeHints: input.includeHints }),
    "Extracted questions/evidence: " + JSON.stringify(materialList),
    "Topics and coverage evidence: " + JSON.stringify(topicList)
  ].join("\n\n");

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.25 } }),
      signal: AbortSignal.timeout(45000)
    });
    if (!response.ok) return NextResponse.json({ error: "Gemini request failed (" + response.status + "). Check the server-side API key, model access and quota." }, { status: 502 });
    const result = await response.json();
    const responseText = result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("");
    if (!responseText) throw new Error("Gemini returned an empty response.");
    const parsed = JSON.parse(responseText) as Record<string, unknown>;
    const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : Array.isArray(parsed.sections) ? (parsed.sections as Array<{ questions?: unknown[] }>).flatMap(section => section.questions || []) : [];
    const questions: PaperQuestion[] = rawQuestions.slice(0, 80).map((rawQuestion: any, index: number) => ({
      number: index + 1,
      question: safeText(rawQuestion.question, "Review the selected syllabus topic."),
      marks: Math.max(1, Math.min(30, Math.round(Number(rawQuestion.marks) || 2))),
      unit: safeText(rawQuestion.unit, "Unmapped"),
      topic: safeText(rawQuestion.topic, "Syllabus topic"),
      type: safeText(rawQuestion.type, "Conceptual"),
      source: safeText(rawQuestion.source, "AI-generated variation"),
      reason: safeText(rawQuestion.reason, "Selected to improve coverage of the chosen syllabus."),
      answerHint: input.includeHints === false ? undefined : safeText(rawQuestion.answerHint)
    }));
    const marksAssigned = questions.reduce((sum, question) => sum + question.marks, 0);
    if (!questions.length || marksAssigned !== input.totalMarks) {
      return NextResponse.json({ error: "The AI draft did not meet the exact marks total. Generate again or try the demo paper while settings are adjusted.", marksAssigned }, { status: 422 });
    }
    const paper = {
      title: safeText(parsed.title, subject + " · Practice paper"),
      subject,
      totalMarks: input.totalMarks,
      marksAssigned,
      durationMinutes: input.durationMinutes,
      difficulty: safeText(input.difficulty, "Balanced"),
      format: safeText(input.format, "University pattern"),
      units: Array.isArray(input.units) ? input.units : [],
      sections: [{ name: "Mock examination", instructions: "Answer as directed. Show working for numerical questions.", questions }],
      questions,
      generatedAt: new Date().toISOString(),
      mode: "gemini",
      confidenceNote: safeText(parsed.confidenceNote, "Generated from the uploaded evidence; this is a practice paper, not a guaranteed prediction.")
    };
    return NextResponse.json({ paper, mode: "gemini" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Paper generation failed: " + message.slice(0, 220) }, { status: 502 });
  }
}
