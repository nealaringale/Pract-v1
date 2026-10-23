"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell,
  BookOpen, Bookmark, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3,
  CloudUpload, Copy, ExternalLink, FileCheck, FileText, Filter, FolderOpen,
  GraduationCap, HardDrive, Lightbulb, Loader2, LockKeyhole, Menu, MoreHorizontal,
  Plus, Search, Settings, ShieldCheck, Sparkles, Target, Trash2, Upload, X, Zap
} from "lucide-react";
import { demoDocuments, demoQuestions, demoTopics, subjects } from "@/lib/demo-data";
import type { AnalysisRecord, QuestionRecord, TopicRecord } from "@/lib/types";

type View = "Overview" | "My library" | "Question bank" | "Paper studio" | "Insights" | "Settings";
type DocKind = "past-paper" | "syllabus" | "teacher-bank" | "notes" | "unknown";
type DocStatus = "Analysed" | "Needs review" | "Failed";
type DocumentItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  kind: DocKind;
  status: DocStatus;
  updated: string;
  sample: boolean;
  questions: number;
  topics: number;
  summary: string;
  aiPowered: boolean;
  analysis?: AnalysisRecord;
};
type GeneratedQuestion = {
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
type GeneratedSection = { name: string; instructions: string; questions: GeneratedQuestion[] };
type GeneratedPaper = {
  title: string;
  subject: string;
  totalMarks: number;
  marksAssigned: number;
  durationMinutes: number;
  difficulty: string;
  format: string;
  units: string[];
  sections: GeneratedSection[];
  questions: GeneratedQuestion[];
  generatedAt: string;
  mode: string;
  confidenceNote: string;
};

const navItems: Array<{ label: View; icon: typeof Activity; description: string }> = [
  { label: "Overview", icon: Activity, description: "Your workspace at a glance" },
  { label: "My library", icon: FolderOpen, description: "Syllabus, notes and past papers" },
  { label: "Question bank", icon: BookOpen, description: "Collected and analysed questions" },
  { label: "Paper studio", icon: Sparkles, description: "Build a tailored mock exam" },
  { label: "Insights", icon: BarChart3, description: "Topics, recurrence and coverage" },
  { label: "Settings", icon: Settings, description: "AI connection and preferences" }
];

const unitOptions = ["Unit I", "Unit II", "Unit III", "Unit IV", "Unit V", "Unit VI"];
const kindLabels: Record<DocKind, string> = {
  "past-paper": "Previous paper",
  "syllabus": "Syllabus",
  "teacher-bank": "Teacher question bank",
  "notes": "Study notes",
  "unknown": "Study material"
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getType(name: string): string {
  const extension = name.split(".").pop()?.toUpperCase();
  return extension && extension.length < 8 ? extension : "FILE";
}

function parseDocument(item: typeof demoDocuments[number]): DocumentItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    size: item.size,
    kind: item.kind as DocKind,
    status: item.status as DocStatus,
    updated: item.updated,
    sample: true,
    questions: item.questions,
    topics: item.topics,
    summary: item.summary,
    aiPowered: false
  };
}

function Toggle({ value, onChange, label, description }: { value: boolean; onChange: (value: boolean) => void; label: string; description: string }) {
  return (
    <button className="toggle-row" type="button" onClick={() => onChange(!value)} aria-pressed={value}>
      <span className="toggle-copy"><strong>{label}</strong><small>{description}</small></span>
      <span className={"switch " + (value ? "switch-on" : "")}><span /></span>
    </button>
  );
}

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "green" | "purple" | "amber" | "blue" }) {
  return <span className={"pill pill-" + tone}>{children}</span>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>(demoDocuments.map(parseDocument));
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [questionFilter, setQuestionFilter] = useState("All questions");
  const [subject, setSubject] = useState(subjects[0]);
  const [uploadKind, setUploadKind] = useState("auto");
  const [customSubject, setCustomSubject] = useState("");
  const [totalMarks, setTotalMarks] = useState("50");
  const [duration, setDuration] = useState("120");
  const [difficulty, setDifficulty] = useState("Balanced");
  const [format, setFormat] = useState("University pattern");
  const [selectedUnits, setSelectedUnits] = useState<string[]>(["Unit I", "Unit II", "Unit III"]);
  const [includeHints, setIncludeHints] = useState(true);
  const [includeUploadedQuestions, setIncludeUploadedQuestions] = useState(true);
  const [generationBusy, setGenerationBusy] = useState(false);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [aiStatus, setAiStatus] = useState<{ loaded: boolean; configured: boolean; mode: string; model?: string | null }>({ loaded: false, configured: false, mode: "demo" });
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [copiedSetting, setCopiedSetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("paperlens-documents-v1");
      if (stored) {
        const parsed = JSON.parse(stored) as DocumentItem[];
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(item => item && typeof item.id === "string" && typeof item.name === "string");
          const samples = demoDocuments.map(parseDocument);
          const combined = [...valid, ...samples.filter(sample => !valid.some(item => item.id === sample.id))];
          setDocuments(combined);
        }
      }
    } catch {
      // Ignore stale or malformed browser storage.
    }
    setHydrated(true);
    fetch("/api/health").then(response => response.json()).then(data => {
      setAiStatus({ loaded: true, configured: Boolean(data.aiConfigured), mode: data.mode || "demo", model: data.model });
    }).catch(() => setAiStatus({ loaded: true, configured: false, mode: "demo" }));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("paperlens-documents-v1", JSON.stringify(documents));
    } catch {
      setMessage({ kind: "info", text: "Browser storage is full. Your current session still works, but newer items may not persist." });
    }
  }, [documents, hydrated]);

  const allQuestions = useMemo(() => {
    const uploaded = documents.filter(document => !document.sample).flatMap(document => (document.analysis?.questions || []).map((question, index) => ({ ...question, id: document.id + "-q-" + index })));
    const map = new Map<string, QuestionRecord>();
    [...demoQuestions, ...uploaded].forEach(question => {
      const key = question.question.trim().toLowerCase();
      if (key && !map.has(key)) map.set(key, question);
    });
    return Array.from(map.values());
  }, [documents]);

  const allTopics = useMemo(() => {
    const uploaded = documents.filter(document => !document.sample).flatMap(document => document.analysis?.topics || []);
    const map = new Map<string, TopicRecord>();
    [...demoTopics, ...uploaded].forEach(topic => {
      const key = topic.name.trim().toLowerCase();
      if (key && !map.has(key)) map.set(key, topic);
    });
    return Array.from(map.values());
  }, [documents]);

  const visibleDocuments = documents.filter(document => {
    const query = search.trim().toLowerCase();
    return !query || [document.name, kindLabels[document.kind], document.summary].some(value => value.toLowerCase().includes(query));
  });

  const visibleQuestions = allQuestions.filter(question => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [question.question, question.topic, question.unit, question.source].some(value => value.toLowerCase().includes(query));
    const matchesFilter = questionFilter === "All questions" || question.type.toLowerCase().includes(questionFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const uploadedCount = documents.filter(document => !document.sample).length;
  const questionCount = allQuestions.length;
  const topicCount = allTopics.length;
  const currentSubject = subject === "Other / custom subject" ? (customSubject.trim() || "Custom subject") : subject;

  function setView(view: View) {
    setActiveView(view);
    setMobileNavOpen(false);
    setMessage(null);
  }

  function toggleUnit(unit: string) {
    setSelectedUnits(previous => previous.includes(unit) ? previous.filter(value => value !== unit) : [...previous, unit]);
  }

  async function processFiles(fileList: FileList | File[]) {
    const incoming = Array.from(fileList).slice(0, 8);
    if (!incoming.length) return;
    setUploadBusy(true);
    setMessage(null);
    let successful = 0;
    const results: DocumentItem[] = [];
    for (let index = 0; index < incoming.length; index += 1) {
      const file = incoming[index];
      setUploadProgress("Analysing " + (index + 1) + " of " + incoming.length + ": " + file.name);
      const form = new FormData();
      form.append("file", file);
      form.append("subject", currentSubject);
      form.append("kindHint", uploadKind);
      try {
        const response = await fetch("/api/analyze", { method: "POST", body: form });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Could not analyse file.");
        const analysis = payload.analysis as AnalysisRecord;
        results.push({
          id: "doc-" + Date.now() + "-" + index + "-" + Math.random().toString(36).slice(2, 7),
          name: file.name,
          type: getType(file.name),
          size: formatSize(file.size),
          kind: analysis.kind,
          status: analysis.questions.length || analysis.topics.length ? "Analysed" : "Needs review",
          updated: "Just now",
          sample: false,
          questions: analysis.questions.length,
          topics: analysis.topics.length,
          summary: analysis.summary,
          aiPowered: Boolean(analysis.aiPowered),
          analysis
        });
        successful += 1;
      } catch (error) {
        results.push({
          id: "failed-" + Date.now() + "-" + index,
          name: file.name,
          type: getType(file.name),
          size: formatSize(file.size),
          kind: "unknown",
          status: "Failed",
          updated: "Just now",
          sample: false,
          questions: 0,
          topics: 0,
          summary: error instanceof Error ? error.message : "Analysis failed. Check the server and retry.",
          aiPowered: false
        });
      }
    }
    if (results.length) setDocuments(previous => [...results.reverse(), ...previous]);
    setUploadBusy(false);
    setUploadProgress("");
    if (successful) {
      setActiveView("My library");
      setMessage({ kind: "success", text: successful + " file" + (successful === 1 ? "" : "s") + " added to your library. Review the extraction before relying on it." });
    } else {
      setMessage({ kind: "error", text: "No files were analysed successfully. Check the error shown beside each file." });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void processFiles(event.target.files);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.dataTransfer.files) void processFiles(event.dataTransfer.files);
  }

  async function generatePaper() {
    if (!currentSubject.trim()) {
      setMessage({ kind: "error", text: "Enter a subject before generating a paper." });
      return;
    }
    if (!selectedUnits.length) {
      setMessage({ kind: "error", text: "Choose at least one syllabus unit." });
      return;
    }
    setGenerationBusy(true);
    setMessage(null);
    const materialQuestions = includeUploadedQuestions
      ? documents.filter(document => !document.sample).flatMap(document => document.analysis?.questions || []).slice(0, 60)
      : [];
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubject,
          totalMarks: Number(totalMarks),
          durationMinutes: Number(duration),
          difficulty,
          format,
          units: selectedUnits,
          includeHints,
          materials: materialQuestions,
          topics: documents.filter(document => !document.sample).flatMap(document => document.analysis?.topics || []).map(topic => ({ name: topic.name, unit: topic.unit, reason: topic.reason, evidence: topic.evidence })).slice(0, 40)
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Paper generation failed.");
      const generated = payload.paper as GeneratedPaper;
      setPaper(generated);
      setMessage({
        kind: "success",
        text: payload.mode === "gemini"
          ? "Your Gemini-powered practice paper is ready. Check the source notes and marks before using it."
          : "Your demo practice paper is ready. Add a Gemini key on the server to generate from your own material with AI."
      });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Paper generation failed. Check your setup and retry." });
    } finally {
      setGenerationBusy(false);
    }
  }

  function exportPaper() {
    if (!paper) return;
    const data = new Blob([JSON.stringify(paper, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "paperlens-" + paper.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function removeDocument(id: string) {
    setDocuments(previous => previous.filter(document => document.id !== id));
    setMessage({ kind: "success", text: "Document removed from this browser workspace." });
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function copyEnv() {
    try {
      await navigator.clipboard.writeText("GEMINI_API_KEY=your_key_here\nGEMINI_MODEL=gemini-3.8-flash");
      setCopiedSetting(true);
      window.setTimeout(() => setCopiedSetting(false), 1800);
    } catch {
      setMessage({ kind: "info", text: "Copy failed. Add GEMINI_API_KEY and GEMINI_MODEL to your server environment manually." });
    }
  }

  const activeMeta = navItems.find(item => item.label === activeView) || navItems[0];

  return (
    <div className="app-shell">
      <aside className={"sidebar " + (mobileNavOpen ? "sidebar-open" : "")}>
        <div className="brand-lockup">
          <div className="brand-symbol"><Sparkles size={19} strokeWidth={2.4} /></div>
          <div><div className="brand-name">paperlens<span>AI</span></div><div className="brand-subtitle">EXAM INTELLIGENCE</div></div>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-avatar"><GraduationCap size={18} /></div>
          <div className="workspace-copy"><strong>Student workspace</strong><small>SPPU · Engineering</small></div>
          <ChevronDown size={15} className="muted-icon" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} className={"nav-item " + (activeView === item.label ? "nav-active" : "")} onClick={() => setView(item.label)} title={item.description}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.label === "My library" && uploadedCount > 0 ? <span className="nav-count">{uploadedCount}</span> : null}
                {item.label === "Paper studio" ? <span className="nav-new">NEW</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-help">
          <div className="help-icon"><Lightbulb size={17} /></div>
          <strong>Study with evidence</strong>
          <p>Use past papers as signals, not guarantees. Verify the latest syllabus.</p>
          <button onClick={() => setView("Insights")}>Explore insights <ArrowRight size={14} /></button>
        </div>
        <div className="sidebar-profile">
          <div className="profile-avatar">N</div>
          <div className="profile-copy"><strong>Student account</strong><small>Personal workspace</small></div>
          <MoreHorizontal size={19} className="muted-icon" />
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
            <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{activeView}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your material..." aria-label="Search library and questions" />
              {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={14} /></button> : <kbd>⌘ K</kbd>}
            </label>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setMessage({ kind: "info", text: "You're all caught up. New analysis results will appear here." })}><Bell size={18} /><span /></button>
            <div className="topbar-avatar">N</div>
          </div>
        </header>

        <main className="page-content">
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp" multiple onChange={onFileInput} hidden />
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR EXAM WORKSPACE</div>
              <h1>{activeView === "Overview" ? "Prepare smarter. Walk in ready." : activeView}</h1>
              <p>{activeView === "Overview" ? "Turn the material you already have into a study plan you can trust." : activeMeta.description}</p>
            </div>
            <div className="heading-actions">
              <Pill tone={aiStatus.configured ? "green" : "amber"}>{aiStatus.configured ? <><CheckCircle2 size={12} /> Gemini connected</> : <><Zap size={12} /> Demo mode</>}</Pill>
              <button className="button button-primary button-small" onClick={() => setView("Paper studio")}><Sparkles size={15} /> Generate paper</button>
            </div>
          </div>

          {message ? (
            <div className={"toast toast-" + message.kind} role="status">
              {message.kind === "error" ? <AlertCircle size={17} /> : message.kind === "success" ? <CheckCircle2 size={17} /> : <Lightbulb size={17} />}
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} aria-label="Dismiss message"><X size={16} /></button>
            </div>
          ) : null}

          {activeView === "Overview" && (
            <section className="view-stack">
              <div className="hero-banner">
                <div className="hero-copy">
                  <Pill tone="purple"><Sparkles size={12} /> YOUR PERSONAL EXAM COPILOT</Pill>
                  <h2>Your next paper,<br /><em>better prepared.</em></h2>
                  <p>Bring together your syllabus, university papers and teacher's question bank. PaperLens helps you turn them into focused, explainable practice.</p>
                  <div className="hero-actions">
                    <button className="button button-light" onClick={() => setView("Paper studio")}>Build a mock paper <ArrowRight size={16} /></button>
                    <button className="button button-ghost-light" onClick={openFilePicker}><Upload size={16} /> Upload material</button>
                  </div>
                  <div className="hero-footnote"><ShieldCheck size={14} /> Your API key stays server-side. Results are labelled by source.</div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                  <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
                  <div className="visual-doc visual-doc-back"><span /><span /><span /><span /></div>
                  <div className="visual-doc visual-doc-front">
                    <div className="doc-topline"><span className="mini-brand"><Sparkles size={10} /></span><span>PRACTICE PAPER</span><span className="doc-score">A+</span></div>
                    <div className="doc-title-line" /><div className="doc-line wide" /><div className="doc-line" /><div className="doc-question"><b>01</b><span /><small>4 marks</small></div><div className="doc-question"><b>02</b><span /><small>8 marks</small></div><div className="doc-question"><b>03</b><span /><small>6 marks</small></div><div className="doc-line wide" />
                  </div>
                  <div className="float-chip chip-top"><span className="chip-spark"><Sparkles size={12} /></span><span><b>Topic signals</b><small>Evidence-backed</small></span></div>
                  <div className="float-chip chip-bottom"><span className="chip-check"><Check size={14} /></span><span><b>Pattern matched</b><small>Marks validated</small></span></div>
                </div>
              </div>

              <div className="metric-grid">
                <div className="metric-card"><div className="metric-top"><span className="metric-icon lilac"><FolderOpen size={17} /></span><span className="metric-change"><ArrowUpRight size={13} /> Workspace</span></div><div className="metric-value">{documents.length}<span> files</span></div><div className="metric-label">Documents in your library</div><div className="metric-foot">{uploadedCount} uploaded by you · includes samples</div></div>
                <div className="metric-card"><div className="metric-top"><span className="metric-icon mint"><BookOpen size={17} /></span><span className="metric-tag">Indexed</span></div><div className="metric-value">{questionCount}<span> questions</span></div><div className="metric-label">Question bank</div><div className="metric-foot">Extracted questions and demo examples</div></div>
                <div className="metric-card"><div className="metric-top"><span className="metric-icon peach"><Target size={17} /></span><span className="metric-tag">Mapped</span></div><div className="metric-value">{topicCount}<span> topics</span></div><div className="metric-label">Topic signals</div><div className="metric-foot">Check each source and unit mapping</div></div>
                <div className="metric-card"><div className="metric-top"><span className="metric-icon sky"><ShieldCheck size={17} /></span><span className="metric-tag">Status</span></div><div className="metric-value metric-mode">{aiStatus.configured ? "AI ready" : "Demo mode"}</div><div className="metric-label">Generation engine</div><div className="metric-foot">{aiStatus.configured ? "Gemini API configured" : "Connect a server-side Gemini key"}</div></div>
              </div>

              <div className="overview-grid">
                <div className="panel topic-panel">
                  <div className="panel-heading"><div><span className="section-kicker">WHAT TO REVISE</span><h3>Topics worth another look</h3><p>Signals from the current workspace</p></div><button className="text-button" onClick={() => setView("Insights")}>View all <ArrowRight size={14} /></button></div>
                  <div className="topic-mini-list">
                    {allTopics.slice(0, 4).map((topic, index) => (
                      <div className="topic-mini" key={topic.name}>
                        <div className={"topic-index index-" + (index + 1)}>{String(index + 1).padStart(2, "0")}</div>
                        <div className="topic-mini-copy"><strong>{topic.name}</strong><small>{topic.unit} <span>·</span> {topic.frequency} evidence signal{topic.frequency === 1 ? "" : "s"}</small></div>
                        <Pill tone={topic.priority === "High" ? "purple" : topic.priority === "Medium" ? "blue" : "default"}>{topic.priority}</Pill>
                      </div>
                    ))}
                  </div>
                  <div className="panel-footer-note"><AlertCircle size={14} /> Demo sample data is mixed in until you add your own documents.</div>
                </div>
                <div className="panel action-panel">
                  <div className="panel-heading"><div><span className="section-kicker">QUICK START</span><h3>Build your study set</h3><p>Three simple steps to get started</p></div><div className="tiny-spark"><Sparkles size={18} /></div></div>
                  <div className="checklist">
                    <button className="checklist-row" onClick={() => setView("My library")}><span className={"check-round " + (uploadedCount > 0 ? "check-done" : "")}>{uploadedCount > 0 ? <Check size={13} /> : "1"}</span><span><b>Upload past papers</b><small>Bring 3–5 years of papers</small></span><ChevronRight size={16} /></button>
                    <button className="checklist-row" onClick={() => setView("My library")}><span className="check-round">2</span><span><b>Add your syllabus</b><small>Map every question to a unit</small></span><ChevronRight size={16} /></button>
                    <button className="checklist-row" onClick={() => setView("Paper studio")}><span className="check-round">3</span><span><b>Generate your mock paper</b><small>Choose pattern, units and marks</small></span><ChevronRight size={16} /></button>
                  </div>
                  <button className="button button-outline button-full" onClick={() => setView("My library")}><Plus size={15} /> Add study material</button>
                </div>
              </div>

              <div className="panel recent-panel">
                <div className="panel-heading"><div><span className="section-kicker">RECENT FILES</span><h3>Your study library</h3></div><button className="text-button" onClick={() => setView("My library")}>Open library <ArrowRight size={14} /></button></div>
                <DocumentTable documents={documents.slice(0, 4)} onDelete={removeDocument} compact onReview={document => setMessage({ kind: "info", text: document.summary })} />
              </div>
            </section>
          )}

          {activeView === "My library" && (
            <section className="view-stack">
              <div className="library-intro">
                <div><h2>Every source, in one place.</h2><p>Upload current syllabi, teacher material, notes and previous papers. PaperLens extracts questions where possible and shows what needs review.</p></div>
                <button className="button button-primary" onClick={openFilePicker}><Plus size={16} /> Add files</button>
              </div>
              <div className={"upload-zone " + (uploadBusy ? "upload-busy" : "")} ref={dropZoneRef} onDragOver={event => event.preventDefault()} onDrop={onDrop}>
                <div className="upload-icon"><CloudUpload size={23} /></div>
                <h3>{uploadBusy ? "Working on your files..." : "Drop your study material here"}</h3>
                <p>{uploadBusy ? uploadProgress : "PDF, DOCX, TXT, Markdown, CSV or images · Up to 12 MB per file · Up to 8 at once"}</p>
                {!uploadBusy ? <div className="upload-controls">
                  <label><span>Subject context</span><select value={subject} onChange={event => setSubject(event.target.value)}>{subjects.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
                  <label><span>Document type</span><select value={uploadKind} onChange={event => setUploadKind(event.target.value)}><option value="auto">Auto-detect</option><option value="past-paper">Previous question paper</option><option value="syllabus">Syllabus</option><option value="teacher-bank">Teacher question bank</option><option value="notes">Study notes</option></select></label>
                </div> : null}
                {subject === "Other / custom subject" && !uploadBusy ? <input className="text-input upload-custom-subject" value={customSubject} onChange={event => setCustomSubject(event.target.value)} placeholder="Enter your subject name" maxLength={120} /> : null}
                {uploadBusy ? <div className="progress-track"><span /></div> : <button className="button button-outline" onClick={openFilePicker}><Upload size={15} /> Browse files</button>}
                <div className="upload-security"><LockKeyhole size={13} /> Files are processed by your server and results are saved in this browser workspace.</div>
              </div>
              <div className="source-shortcuts">
                <div className="source-shortcut"><div className="source-icon official"><GraduationCap size={18} /></div><div><strong>SPPU previous question papers</strong><small>Open the official archive, download what you need, then upload it here.</small><a href="https://exam.unipune.ac.in/Pages/PreviousQuestionPapers.html" target="_blank" rel="noreferrer">Open university archive <ExternalLink size={12} /></a></div></div>
                <div className="source-shortcut"><div className="source-icon syllabus"><BookOpen size={18} /></div><div><strong>SPPU syllabus archive</strong><small>Verify the subject and syllabus scheme for your batch.</small><a href="https://www.unipune.ac.in/university_files/Syllabi.htm" target="_blank" rel="noreferrer">Open syllabus archive <ExternalLink size={12} /></a></div></div>
              </div>
              <div className="panel table-panel">
                <div className="panel-heading"><div><h3>Files and analysis</h3><p>{visibleDocuments.length} of {documents.length} items · demo items are labelled</p></div><div className="table-actions"><button className="button button-quiet button-small" onClick={() => setSearch("")}><Filter size={14} /> Clear search</button><button className="icon-button" onClick={openFilePicker} aria-label="Add files"><Plus size={18} /></button></div></div>
                <DocumentTable documents={visibleDocuments} onDelete={removeDocument} onReview={document => setMessage({ kind: "info", text: document.summary })} />
              </div>
            </section>
          )}

          {activeView === "Question bank" && (
            <section className="view-stack">
              <div className="library-intro">
                <div><h2>A searchable question collection.</h2><p>Explore imported questions alongside illustrative sample questions. Source and unit fields stay visible so you can verify every item.</p></div>
                <button className="button button-primary" onClick={() => setView("Paper studio")}><Sparkles size={15} /> Use in paper studio</button>
              </div>
              <div className="question-toolbar">
                <div className="filter-chips">
                  {["All questions", "Numerical", "Theory", "Conceptual", "Drawing", "Programming"].map(filter => <button key={filter} className={"filter-chip " + (questionFilter === filter ? "filter-active" : "")} onClick={() => setQuestionFilter(filter)}>{filter}</button>)}
                </div>
                <div className="result-count"><BookOpen size={14} /> {visibleQuestions.length} questions</div>
              </div>
              <div className="question-list">
                {visibleQuestions.map((question, index) => (
                  <article className="question-card" key={question.id || question.question}>
                    <div className="question-card-top"><div className="question-number">{String(index + 1).padStart(2, "0")}</div><div className="question-type">{question.type}</div><Pill tone={question.source.toLowerCase().includes("sample") || question.source.toLowerCase().includes("demo") ? "amber" : "green"}>{question.source.toLowerCase().includes("sample") || question.source.toLowerCase().includes("demo") ? "Sample data" : "Uploaded source"}</Pill><button className="icon-button question-more" aria-label="Toggle question evidence" onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}><MoreHorizontal size={18} /></button></div>
                    <h3>{question.question}</h3>
                    <div className="question-meta"><span><BookOpen size={13} /> {question.unit}</span><span><Target size={13} /> {question.topic}</span><span><Bookmark size={13} /> {question.marks} marks</span>{question.year ? <span><Clock3 size={13} /> {question.year}</span> : null}</div>
                    {expandedQuestion === question.id ? <div className="evidence-detail"><b>Source:</b> {question.source || "Not mapped"}<p>Verify the original paper, syllabus revision and marks before treating this as historical evidence.</p></div> : null}
                  </article>
                ))}
                {!visibleQuestions.length ? <EmptyState title="No matching questions" body="Try another search or upload study material to add questions." action="Open library" onAction={() => setView("My library")} /> : null}
              </div>
              <div className="honesty-note"><ShieldCheck size={17} /><span><b>Evidence matters.</b> Sample questions help preview the experience; they are not official SPPU question papers. Historical year tags are examples until you upload verified sources.</span></div>
            </section>
          )}

          {activeView === "Paper studio" && (
            <section className="studio-layout">
              <div className="studio-form panel">
                <div className="studio-heading"><div className="studio-heading-icon"><Sparkles size={20} /></div><div><h2>Build your mock paper</h2><p>Choose your exam settings. The paper engine will validate the total marks.</p></div></div>
                <div className="form-section">
                  <label className="field-label" htmlFor="subject">Subject</label>
                  <div className="select-wrap"><select id="subject" value={subject} onChange={event => setSubject(event.target.value)}>{subjects.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={16} /></div>
                  {subject === "Other / custom subject" ? <input className="text-input custom-subject" value={customSubject} onChange={event => setCustomSubject(event.target.value)} placeholder="Enter your subject name" maxLength={120} /> : null}
                </div>
                <div className="form-row">
                  <div className="form-section"><label className="field-label" htmlFor="marks">Total marks</label><div className="select-wrap"><select id="marks" value={totalMarks} onChange={event => setTotalMarks(event.target.value)}>{["25", "30", "40", "50", "60", "70", "75", "80", "100"].map(value => <option key={value} value={value}>{value} marks</option>)}</select><ChevronDown size={16} /></div></div>
                  <div className="form-section"><label className="field-label" htmlFor="duration">Duration</label><div className="select-wrap"><select id="duration" value={duration} onChange={event => setDuration(event.target.value)}>{[30, 45, 60, 90, 120, 150, 180].map(value => <option key={value} value={value}>{value} minutes</option>)}</select><ChevronDown size={16} /></div></div>
                </div>
                <div className="form-section"><label className="field-label">Difficulty level</label><div className="choice-row">{["Easy", "Balanced", "Challenging"].map(value => <button key={value} className={"choice-button " + (difficulty === value ? "choice-selected" : "")} onClick={() => setDifficulty(value)} type="button">{value}{difficulty === value ? <Check size={14} /> : null}</button>)}</div></div>
                <div className="form-section"><label className="field-label">Paper style</label><div className="select-wrap"><select value={format} onChange={event => setFormat(event.target.value)} aria-label="Paper style"><option>University pattern</option><option>Quick revision</option><option>Concept-first practice</option><option>Numerical-heavy practice</option><option>Teacher question-bank focus</option></select><ChevronDown size={16} /></div><span className="field-help">Options guide the generation prompt; match the current official pattern where available.</span></div>
                <div className="form-section"><div className="field-heading"><label className="field-label">Syllabus units</label><span className="field-subtext">{selectedUnits.length} selected</span></div><div className="unit-grid">{unitOptions.map(unit => <button key={unit} className={"unit-chip " + (selectedUnits.includes(unit) ? "unit-selected" : "")} onClick={() => toggleUnit(unit)} type="button"><span className="unit-check">{selectedUnits.includes(unit) ? <Check size={12} /> : null}</span>{unit}</button>)}</div></div>
                <div className="form-section options-block"><div className="field-heading"><span className="field-label">Generation options</span><Pill tone="blue">Customizable</Pill></div><Toggle label="Include answer hints" description="Add a brief solving direction under each question." value={includeHints} onChange={setIncludeHints} /><Toggle label="Use uploaded questions" description="Prefer questions extracted from your files when available." value={includeUploadedQuestions} onChange={setIncludeUploadedQuestions} /></div>
                <div className="studio-data-note"><LockKeyhole size={15} /><span>{includeUploadedQuestions ? "The paper engine will use questions extracted from this browser workspace." : "Uploaded questions are excluded from generation."} {!aiStatus.configured ? "Demo mode uses sample templates, not AI." : "Gemini calls run from the server."}</span></div>
                <button className="button button-primary button-full generate-button" disabled={generationBusy} onClick={() => void generatePaper()}>{generationBusy ? <><Loader2 className="spin" size={16} /> Building your paper...</> : <><Sparkles size={16} /> Generate practice paper <ArrowRight size={16} /></>}</button>
              </div>

              <div className="studio-preview">
                <div className="preview-topline"><div><span className="section-kicker">PAPER PREVIEW</span><h2>{paper ? "Your paper is ready" : "Your paper will appear here"}</h2></div><span className="preview-icon"><FileCheck size={18} /></span></div>
                {paper ? (
                  <>
                    <div className="paper-sheet">
                      <div className="paper-sheet-brand"><div className="mini-brand"><Sparkles size={12} /></div><span>PAPERLENS AI</span><small>{paper.mode === "gemini" ? "AI-ASSISTED DRAFT" : "DEMO DRAFT"}</small></div>
                      <div className="paper-institution">MOCK UNIVERSITY EXAMINATION</div>
                      <h3>{paper.subject}</h3><div className="paper-subtitle">Practice paper · {paper.difficulty}</div>
                      <div className="paper-meta"><span>Time: {paper.durationMinutes} min</span><span>Maximum marks: {paper.totalMarks}</span></div>
                      <div className="paper-rule" />
                      <div className="paper-instruction">{paper.format}. Attempt according to the instructions for each section.</div>
                      {paper.sections.map(section => <div className="paper-section" key={section.name}><h4>{section.name}</h4><p>{section.instructions}</p>{section.questions.map(question => <div className="paper-question" key={question.number}><div><span>{question.number}.</span> {question.question}{question.answerHint && includeHints ? <small className="answer-hint"><Lightbulb size={11} /> Hint: {question.answerHint}</small> : null}</div><b>[{question.marks}]</b></div>)}</div>)}
                      <div className="paper-end">— End of paper —</div>
                    </div>
                    <div className="paper-summary"><div><span className="summary-label">MARKS VALIDATION</span><strong className={paper.marksAssigned === paper.totalMarks ? "valid-marks" : "invalid-marks"}>{paper.marksAssigned} / {paper.totalMarks} marks <CheckCircle2 size={15} /></strong></div><div><span className="summary-label">QUESTION COUNT</span><strong>{paper.questions.length} questions</strong></div></div>
                    <div className="paper-disclaimer"><AlertCircle size={14} /> {paper.confidenceNote}</div>
                    <div className="preview-actions"><button className="button button-primary" onClick={() => window.print()}><FileText size={15} /> Print / Save PDF</button><button className="button button-outline" onClick={exportPaper}><Download size={15} /> Export JSON</button></div>
                    <button className="text-button regenerate-button" onClick={() => void generatePaper()}><Sparkles size={14} /> Generate another version</button>
                  </>
                ) : (
                  <div className="preview-empty">
                    <div className="empty-paper-illustration"><div className="empty-paper"><span /><span /><span /><span /><span /></div><div className="empty-spark"><Sparkles size={18} /></div></div>
                    <h3>A paper built around your syllabus.</h3><p>Choose subject, exam duration and units, then generate your first draft. You can print it, export it and revise the settings.</p>
                    <div className="preview-benefits"><span><CheckCircle2 size={14} /> Marks-total validation</span><span><CheckCircle2 size={14} /> Unit-aware questions</span><span><CheckCircle2 size={14} /> Source transparency</span></div>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeView === "Insights" && (
            <section className="view-stack">
              <div className="insight-hero"><div><Pill tone="purple"><Activity size={12} /> EVIDENCE BOARD</Pill><h2>Study priorities, with receipts.</h2><p>Use recurrence as a revision signal, not as a promise about the next exam.</p></div><div className="insight-hero-icon"><BarChart3 size={30} /></div></div>
              <div className="metric-grid insight-metrics">
                <div className="metric-card"><div className="metric-top"><span className="metric-icon lilac"><Target size={17} /></span></div><div className="metric-value">{allTopics.length}</div><div className="metric-label">Distinct topic hints</div><div className="metric-foot">Across current sample and uploaded sources</div></div>
                <div className="metric-card"><div className="metric-top"><span className="metric-icon mint"><FileText size={17} /></span></div><div className="metric-value">{allQuestions.length}</div><div className="metric-label">Questions available</div><div className="metric-foot">Duplicates removed by text similarity key</div></div>
                <div className="metric-card"><div className="metric-top"><span className="metric-icon peach"><FolderOpen size={17} /></span></div><div className="metric-value">{documents.filter(document => !document.sample).length}</div><div className="metric-label">Your source files</div><div className="metric-foot">Sample records are excluded from this count</div></div>
              </div>
              <div className="panel insights-panel"><div className="panel-heading"><div><h3>Topic signals</h3><p>Priority is based on the current dataset and needs verification.</p></div><button className="button button-quiet button-small" onClick={() => setView("My library")}><Upload size={14} /> Add evidence</button></div>
                <div className="insight-topic-list">
                  {allTopics.map((topic, index) => <div className="insight-topic" key={topic.name}><div className="insight-topic-main"><div className={"topic-icon topic-icon-" + (index % 4)}>{index + 1}</div><div className="insight-topic-copy"><div><strong>{topic.name}</strong><Pill tone={topic.priority === "High" ? "purple" : topic.priority === "Medium" ? "blue" : "default"}>{topic.priority} priority</Pill></div><p>{topic.reason}</p><small>{topic.unit} · {topic.frequency} recorded signal{topic.frequency === 1 ? "" : "s"}</small></div></div><div className="evidence-links"><b>Evidence to check</b>{topic.evidence.map(evidence => <span key={evidence}><FileText size={12} /> {evidence}</span>)}</div></div>)}
                </div>
              </div>
              <div className="honesty-note"><ShieldCheck size={17} /><span><b>How to read this.</b> Frequency means appearances within the available dataset, not probability of a question appearing next time. Coverage and recurrence can be calculated only from material actually uploaded or indexed.</span></div>
            </section>
          )}

          {activeView === "Settings" && (
            <section className="view-stack settings-layout">
              <div className="settings-intro"><div className="settings-icon"><Settings size={22} /></div><div><h2>Make PaperLens yours.</h2><p>Connect AI, confirm source preferences and understand where your data lives.</p></div></div>
              <div className="panel settings-panel">
                <div className="settings-panel-heading"><div className="settings-panel-icon"><Zap size={18} /></div><div><h3>AI engine</h3><p>Gemini is called only from server API routes. The browser never receives the secret key.</p></div><Pill tone={aiStatus.configured ? "green" : "amber"}>{aiStatus.configured ? "Connected" : "Not connected"}</Pill></div>
                <div className="settings-detail-grid"><div><span>Status</span><strong>{aiStatus.loaded ? (aiStatus.configured ? "Ready for AI analysis" : "Demo mode active") : "Checking server..."}</strong></div><div><span>Model</span><strong>{aiStatus.model || "Set GEMINI_MODEL server variable"}</strong></div><div><span>Credential</span><strong>Server-side only</strong></div></div>
                <div className="settings-howto"><div className="howto-number">1</div><div><strong>Add your environment variables</strong><p>Copy the names below into .env.local for local testing or into your hosting provider's server environment.</p><div className="env-code"><code>GEMINI_API_KEY=your_key_here<br />GEMINI_MODEL=gemini-2.5-flash</code><button className="icon-button" onClick={() => void copyEnv()} aria-label="Copy environment template">{copiedSetting ? <Check size={15} /> : <Copy size={15} />}</button></div><small>Never commit .env.local or paste your secret into the frontend.</small></div></div>
                <div className="settings-howto"><div className="howto-number">2</div><div><strong>Restart your development server</strong><p>Stop and restart npm run dev after changing environment variables. Visit this page again to see the updated connection status.</p></div></div>
              </div>
              <div className="panel settings-panel">
                <div className="settings-panel-heading"><div className="settings-panel-icon mint"><GraduationCap size={18} /></div><div><h3>University source preferences</h3><p>Use official material wherever possible and check scheme changes by academic year.</p></div></div>
                <div className="source-setting-row"><div><strong>Previous question papers</strong><small>SPPU's official examination archive</small></div><a href="https://exam.unipune.ac.in/Pages/PreviousQuestionPapers.html" target="_blank" rel="noreferrer">Open source <ExternalLink size={13} /></a></div>
                <div className="source-setting-row"><div><strong>Syllabus archive</strong><small>University syllabus pages</small></div><a href="https://www.unipune.ac.in/university_files/Syllabi.htm" target="_blank" rel="noreferrer">Open source <ExternalLink size={13} /></a></div>
                <div className="source-setting-row"><div><strong>Archive synchronization</strong><small>Automatic year/subject scraping is not implemented in this MVP.</small></div><Pill tone="amber">Manual upload</Pill></div>
              </div>
              <div className="panel settings-panel">
                <div className="settings-panel-heading"><div className="settings-panel-icon peach"><HardDrive size={18} /></div><div><h3>Workspace storage</h3><p>Understand what is saved in this first build.</p></div></div>
                <div className="storage-info"><CheckCircle2 size={17} /><div><strong>Document metadata saved to this browser</strong><p>Analysis summaries, extracted questions and file names persist through local storage on this device. The source files themselves are not stored permanently by the app.</p></div></div>
                <div className="storage-info storage-warning"><AlertCircle size={17} /><div><strong>Before production</strong><p>Add authentication, private object storage, access controls, server-side request limits, retention/deletion settings and a database before storing student documents across accounts.</p></div></div>
              </div>
            </section>
          )}
          <footer className="app-footer"><div><span className="footer-brand">paperlens<span>AI</span></span><span>Evidence-led study. No guaranteed predictions.</span></div><div><a href="https://exam.unipune.ac.in/Pages/PreviousQuestionPapers.html" target="_blank" rel="noreferrer">SPPU archive <ExternalLink size={11} /></a><span className="footer-dot" /><span>Prototype v0.1</span></div></footer>
        </main>
      </div>
      {mobileNavOpen ? <button className="mobile-scrim" aria-label="Close navigation overlay" onClick={() => setMobileNavOpen(false)} /> : null}
    </div>
  );
}

function EmptyState({ title, body, action, onAction }: { title: string; body: string; action: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-state-icon"><Search size={21} /></div><h3>{title}</h3><p>{body}</p><button className="button button-outline" onClick={onAction}>{action} <ArrowRight size={14} /></button></div>;
}

function DocumentTable({ documents, onDelete, onReview, compact = false }: { documents: DocumentItem[]; onDelete: (id: string) => void; onReview: (document: DocumentItem) => void; compact?: boolean }) {
  if (!documents.length) return <EmptyState title="Your library is empty" body="Upload a syllabus, teacher question bank or past paper to start analysing your material." action="Add study material" onAction={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()} />;
  return (
    <div className="document-table-wrap">
      <table className={"document-table " + (compact ? "document-table-compact" : "")}>
        <thead><tr><th>FILE NAME</th><th>TYPE</th><th>ANALYSIS</th><th>CONTENT</th><th /></tr></thead>
        <tbody>
          {documents.map(item => (
            <tr key={item.id}>
              <td><div className="file-name-cell"><div className={"file-type-icon " + (item.type === "PDF" ? "file-pdf" : item.type === "DOCX" ? "file-docx" : item.type === "PNG" || item.type === "JPG" ? "file-image" : "")}><FileText size={17} /></div><div><strong>{item.name}</strong><small>{item.size} <span>·</span> {item.updated}</small></div></div></td>
              <td><span className="file-kind">{kindLabels[item.kind] || "Study material"}</span>{item.sample ? <small className="sample-label">Sample data</small> : null}</td>
              <td><Pill tone={item.status === "Analysed" ? "green" : item.status === "Failed" ? "amber" : "blue"}>{item.status}</Pill>{item.aiPowered ? <small className="ai-label">Gemini</small> : null}</td>
              <td><div className="content-counts"><span><BookOpen size={13} /> {item.questions} Q</span><span><Target size={13} /> {item.topics} topics</span></div></td>
              <td><div className="row-actions"><button className="icon-button" title="View analysis" onClick={() => onReview(item)}><ChevronRight size={16} /></button>{!item.sample ? <button className="icon-button danger-hover" title="Remove from workspace" onClick={() => onDelete(item.id)}><Trash2 size={15} /></button> : null}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
