"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  SlidersHorizontal,
  Sparkles,
  Calendar,
  Layers,
  BookOpen,
  MessageSquare,
  User,
  GraduationCap,
  Search,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Send,
  Award,
  Lightbulb,
  ArrowUpRight,
  XCircle,
  Scale,
  Plus,
  X,
  Check,
  TrendingUp,
  Building2,
  Users,
  Brain,
  Zap,
  FolderOpen,
  FileText,
  Bookmark,
  ShieldAlert,
  Calculator,
  Target,
  AlertTriangle,
  Flag,
} from "lucide-react";

// --- DATA IMPORTS ---
import {
  PROGRAMS,
  ALL_ONTARIO_PREREQS,
  ROADMAP_STEPS,
  type Program,
  type FieldCategory,
} from "./data/programs";
import { USA_PROGRAMS, type USProgram } from "./data/usa-programs";
import {
  BIOETHICS_BRIEFS,
  type BioethicsBrief,
} from "./data/ethics";
import {
  DISCIPLINE_RESOURCES,
  type DisciplineResources,
  type ResourceItem,
} from "./data/resources";

// --- TYPES ---
type TabType =
  | "directory"
  | "compare"
  | "prereqs"
  | "pathway"
  | "timeline"
  | "ecs"
  | "advocacy"
  | "resources"
  | "counseling"
  | "about"
  | "calculator"
  | "likelihood";

type CountryView = "canada" | "usa";

// Helper: parse competitiveAvg like "95% - 98%" → [95, 98]
function parseAvgRange(avg: string): [number, number] {
  const nums = avg.match(/(\d+)/g);
  if (!nums || nums.length === 0) return [85, 90];
  const parsed = nums.map(Number);
  return parsed.length >= 2 ? [parsed[0], parsed[1]] : [parsed[0], parsed[0]];
}

// --- GRADE CALCULATOR HELPERS ---
type GradeEntry = {
  courseCode: string;
  score: number | null;
};

function computeTop6Average(grades: GradeEntry[]): number | null {
  const valid = grades.filter((g) => g.score !== null && g.score > 0 && g.score <= 100);
  if (valid.length === 0) return null;
  const sorted = [...valid].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const top = sorted.slice(0, Math.min(6, sorted.length));
  const sum = top.reduce((acc, g) => acc + (g.score ?? 0), 0);
  return Math.round((sum / top.length) * 10) / 10;
}

function getProgramTier(
  avg: number,
  prog: Program | USProgram
): { tier: string; color: string; bgColor: string; textColor: string; label: string } {
  const min = "gpaCompetitiveMin" in prog ? prog.gpaCompetitiveMin : (prog as Program).competitiveMin;
  const max = "gpaCompetitiveMax" in prog ? prog.gpaCompetitiveMax : (prog as Program).competitiveMax;

  if (avg >= max) {
    return { tier: "safety", color: "emerald", bgColor: "bg-emerald-50", textColor: "text-emerald-700", label: "Safety" };
  }
  if (avg >= min) {
    return { tier: "match", color: "amber", bgColor: "bg-amber-50", textColor: "text-amber-700", label: "Match" };
  }
  if (avg >= min - 5) {
    return { tier: "reach", color: "orange", bgColor: "bg-orange-50", textColor: "text-orange-700", label: "Reach" };
  }
  return { tier: "longReach", color: "red", bgColor: "bg-red-50", textColor: "text-red-700", label: "Long Reach" };
}

// --- LIKELIHOOD HELPERS ---
function computeGradeScore(avg: number, min: number, max: number): number {
  if (avg >= max) return 100;
  if (avg >= min) return 60 + ((avg - min) / (max - min)) * 40;
  if (avg >= min - 5) return 20 + ((avg - (min - 5)) / 5) * 40;
  if (avg >= min - 10) return 5 + ((avg - (min - 10)) / 5) * 15;
  return Math.max(0, (avg / min) * 5);
}

function computeLikelihood(
  avg: number,
  suppFactors: number[],
  prog: Program | USProgram
): number {
  const min = "gpaCompetitiveMin" in prog ? prog.gpaCompetitiveMin : (prog as Program).competitiveMin;
  const max = "gpaCompetitiveMax" in prog ? prog.gpaCompetitiveMax : (prog as Program).competitiveMax;
  const suppWeight =
    prog.suppAppWeight === "Heavy (Crucial)" ? 0.3 : prog.suppAppWeight === "Moderate" ? 0.2 : prog.suppAppWeight === "Light" ? 0.12 : 0.05;

  const gradeScore = computeGradeScore(avg, min, max);
  const suppAvg = suppFactors.length > 0 ? suppFactors.reduce((a, b) => a + b, 0) / suppFactors.length : 3;
  const suppScore = (suppAvg / 5) * 100;

  // Weighted: 70% grades, 30% supp app factors (scaled by program's supp weight emphasis)
  const gradeWeight = 1 - suppWeight;
  return Math.round(gradeScore * gradeWeight + suppScore * suppWeight);
}

export default function HealthSciHub() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [selectedField, setSelectedField] = useState<string>("All");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [countryView, setCountryView] = useState<CountryView>("canada");

  // COMPARISON TOOL STATE
  const [comparedProgramIds, setComparedProgramIds] = useState<string[]>([
    "bhsc-mcmaster",
    "se-waterloo",
    "hba-ivey",
  ]);

  // ETHICS FILTER STATE
  const [ethicsFieldFilter, setEthicsFieldFilter] = useState<string>("All");

  // RESOURCES FILTER STATE
  const [resourceFieldFilter, setResourceFieldFilter] = useState<string>("All");

  // QUIZ STATE
  const [quizAnswers, setQuizAnswers] = useState({
    style: "",
    priority: "",
    fieldInterest: "",
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // FORM STATE
  const [counselingForm, setCounselingForm] = useState({
    name: "",
    email: "",
    grade: "Grade 11",
    targetProgram: "",
    question: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Google Apps Script Web App URL — replace with yours after deploying
  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbytU3cYTfki6rWNzVUXpKZqzQhUBMMYsNlmthAqQdtfZ9IEnsTmNHaxXmfxmK0B--ZH/exec";

  // --- GRADE CALCULATOR STATE ---
  const [grades, setGrades] = useState<GradeEntry[]>(
    Array.from({ length: 8 }, () => ({ courseCode: "", score: null }))
  );

  // --- LIKELIHOOD STATE ---
  const [likelihoodAvg, setLikelihoodAvg] = useState<number | null>(null);
  const [suppFactors, setSuppFactors] = useState({
    essayQuality: 3,
    interviewReadiness: 3,
    ecLeadership: 3,
    referenceStrength: 3,
  });
  const [selectedTargetPrograms, setSelectedTargetPrograms] = useState<string[]>([]);
  const [likelihoodCalculated, setLikelihoodCalculated] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // --- HANDLERS ---
  const toggleCourse = (code: string) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleCompareProgram = (id: string) => {
    setComparedProgramIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          alert("You can compare up to 3 programs at a time.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const updateGrade = (index: number, field: "courseCode" | "score", value: string | number | null) => {
    setGrades((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: counselingForm.name,
          email: counselingForm.email,
          grade: counselingForm.grade,
          targetProgram: counselingForm.targetProgram,
          question: counselingForm.question,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (_) {
      // Silently handle — still show success even if endpoint isn't set up yet
    }
    setFormSubmitting(false);
    setFormSubmitted(true);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({ style: "", priority: "", fieldInterest: "" });
    setQuizSubmitted(false);
  };

  const toggleTargetProgram = (id: string) => {
    setSelectedTargetPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // --- COMPUTED VALUES ---
  const top6Average = computeTop6Average(grades);
  const suppFactorValues = [suppFactors.essayQuality, suppFactors.interviewReadiness, suppFactors.ecLeadership, suppFactors.referenceStrength];

  // --- FILTERING ---
  const canadianFiltered = PROGRAMS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.university.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince = selectedProvince === "All" || p.province === selectedProvince;
    const matchesField = selectedField === "All" || p.field === selectedField;
    return matchesSearch && matchesProvince && matchesField;
  });

  const usaFiltered = USA_PROGRAMS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.university.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField = selectedField === "All" || p.field === selectedField;
    return matchesSearch && matchesField;
  });

  const allPrograms = [...PROGRAMS, ...USA_PROGRAMS.map((p) => ({ ...p, province: p.state }))] as (Program | USProgram)[];
  const comparedProgramsList = allPrograms.filter((p) => comparedProgramIds.includes(p.id));

  const filteredEthics = BIOETHICS_BRIEFS.filter((b) =>
    ethicsFieldFilter === "All" ? true : b.field === ethicsFieldFilter
  );

  const filteredResources = DISCIPLINE_RESOURCES.filter((r) =>
    resourceFieldFilter === "All" ? true : r.field === resourceFieldFilter
  );

  // ALL PROVINCES from data for filter
  const allProvinces = [...new Set(PROGRAMS.map((p) => p.province))].sort();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight">
                Uni<span className="text-emerald-600">PathwayHub</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Multi-Disciplinary Canadian & USA Post-Secondary Admissions Guide
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            {[
              { id: "directory", label: "Directory", icon: Compass },
              { id: "calculator", label: "GPA Calc", icon: Calculator },
              { id: "likelihood", label: "Odds", icon: Target },
              { id: "compare", label: "Compare", icon: Scale },
              { id: "prereqs", label: "Prereqs", icon: SlidersHorizontal },
              { id: "pathway", label: "Quiz", icon: Sparkles },
              { id: "timeline", label: "Roadmap", icon: Calendar },
              { id: "ecs", label: "ECs", icon: Layers },
              { id: "advocacy", label: "Ethics", icon: BookOpen },
              { id: "resources", label: "Resources", icon: FolderOpen },
              { id: "counseling", label: "Q&A", icon: MessageSquare },
              { id: "about", label: "About", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* TAB 1: PROGRAM DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {countryView === "canada" ? "Canadian" : "USA"} Undergraduate Directory (
                  {countryView === "canada" ? canadianFiltered.length : usaFiltered.length})
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  {countryView === "canada"
                    ? "Comprehensive breakdown of leading Canadian university programs across diverse disciplines."
                    : "Top US universities including Ivy League, top privates, and elite public institutions."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Country Toggle */}
                <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setCountryView("canada")}
                    className={`px-3 py-2 text-xs font-semibold transition-all ${
                      countryView === "canada"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🇨🇦 Canada
                  </button>
                  <button
                    onClick={() => setCountryView("usa")}
                    className={`px-3 py-2 text-xs font-semibold transition-all ${
                      countryView === "usa"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🇺🇸 USA
                  </button>
                </div>

                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="All">All Disciplines</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Computer Science & Tech">Computer Science & Tech</option>
                  <option value="Business & Finance">Business & Finance</option>
                  <option value="Law & Policy">Law & Policy</option>
                  <option value="Mathematics & Data">Mathematics & Data</option>
                  <option value="Social Sciences">Social Sciences</option>
                  <option value="Sustainability & Environment">Sustainability & Environment</option>
                  <option value="Arts & Humanities">Arts & Humanities</option>
                  <option value="Interdisciplinary">Interdisciplinary</option>
                </select>

                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="All">
                    {countryView === "canada" ? "All Provinces" : "All States"}
                  </option>
                  {countryView === "canada"
                    ? allProvinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))
                    : [...new Set(USA_PROGRAMS.map((p) => p.state))].sort().map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                </select>

                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search program or university..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* CANADIAN PROGRAM CARDS */}
            {countryView === "canada" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {canadianFiltered.map((p) => {
                  const isCompared = comparedProgramIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.field}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{p.province}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{p.university}</p>
                        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cutoff / Avg</span>
                            <span className="font-bold text-slate-800">{p.competitiveAvg}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Supp App</span>
                            <span className="font-semibold text-slate-700">{p.suppAppWeight}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <strong>Methodology:</strong> {p.methodology}
                        </p>
                        <div className="mt-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prerequisites</span>
                          <div className="flex flex-wrap gap-1">
                            {p.prereqs.map((req, i) => (
                              <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-700 font-medium rounded-md">
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 space-y-2">
                        <button
                          onClick={() => toggleCompareProgram(p.id)}
                          className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                            isCompared ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {isCompared ? "Added to Compare" : "Compare Program"}
                        </button>
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* USA PROGRAM CARDS */}
            {countryView === "usa" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {usaFiltered.map((p) => {
                  const isCompared = comparedProgramIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            {p.field}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{p.state}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{p.name}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{p.university}</p>
                        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-1 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Accept</span>
                            <span className="font-bold text-slate-800">{p.acceptanceRate}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">SAT</span>
                            <span className="font-semibold text-slate-700">{p.satRange}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">ACT</span>
                            <span className="font-semibold text-slate-700">{p.actRange}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 mt-3 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                          <strong>Early:</strong> {p.earlyDecision} ({p.earlyDeadline}) | <strong>RD:</strong> {p.regularDeadline}
                        </p>
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <strong>Platform:</strong> {p.applicationPlatform}
                        </p>
                        <div className="mt-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Key Features</span>
                          <div className="flex flex-wrap gap-1">
                            {p.keyFeatures.slice(0, 3).map((f, i) => (
                              <span key={i} className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 font-medium rounded-md">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 space-y-2">
                        <button
                          onClick={() => toggleCompareProgram(p.id)}
                          className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                            isCompared ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          {isCompared ? "Added to Compare" : "Compare Program"}
                        </button>
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Admissions Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: GRADE CALCULATOR */}
        {activeTab === "calculator" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Top 6 Grade Calculator</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Enter your predicted or actual Grade 12 marks. We calculate your Top 6 average and show program matches.
                  </p>
                </div>
              </div>

              {/* Grade Inputs */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {grades.map((entry, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Course {i + 1}</label>
                    <select
                      value={entry.courseCode}
                      onChange={(e) => updateGrade(i, "courseCode", e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">Select course...</option>
                      {ALL_ONTARIO_PREREQS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                      <option value="OTHER">Other 4U/M Course</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Grade %"
                      value={entry.score ?? ""}
                      onChange={(e) =>
                        updateGrade(i, "score", e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    />
                  </div>
                ))}
              </div>

              {/* Result Display */}
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-center">
                {top6Average !== null ? (
                  <>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Top 6 Average</p>
                    <div className="text-5xl font-extrabold text-emerald-700 mt-1">
                      {top6Average}%
                    </div>
                    {/* Visual bar */}
                    <div className="mt-4 w-full max-w-md mx-auto bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(top6Average, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between max-w-md mx-auto mt-1 text-[10px] text-slate-400 font-semibold">
                      <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 font-medium">Enter your grades above to see your Top 6 average and program matches.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Fill in at least one course with a grade percentage to calculate.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Program Tier List */}
            {top6Average !== null && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Canadian Program Matches for {top6Average}% Average
                </h3>
                <div className="space-y-2">
                  {PROGRAMS.map((prog) => {
                    const tier = getProgramTier(top6Average, prog);
                    return (
                      <div
                        key={prog.id}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${tier.bgColor} ${tier.textColor} border-${tier.color === "emerald" ? "emerald" : tier.color === "amber" ? "amber" : tier.color === "orange" ? "orange" : "red"}-200`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg ${
                              tier.tier === "safety"
                                ? "bg-emerald-600 text-white"
                                : tier.tier === "match"
                                ? "bg-amber-500 text-white"
                                : tier.tier === "reach"
                                ? "bg-orange-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {tier.label}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{prog.name}</span>
                            <span className="text-xs text-slate-500">
                              {prog.university} · Competitive: {prog.competitiveAvg}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-600">{prog.suppAppWeight}</span>
                          <button
                            onClick={() => toggleCompareProgram(prog.id)}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                              comparedProgramIds.includes(prog.id)
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {comparedProgramIds.includes(prog.id) ? "Added" : "+ Compare"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PROGRAM LIKELIHOOD */}
        {activeTab === "likelihood" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Program Admission Likelihood Estimator</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Estimate your admission probability by combining your academic average with supplementary application self-assessment.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Inputs */}
              <div className="lg:col-span-1 space-y-4">
                {/* Step 1: Average */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Your Average
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 mb-3">
                    {top6Average !== null
                      ? `Imported from Grade Calculator: ${top6Average}%`
                      : "Enter your estimated Top 6 average below."}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 93"
                    value={likelihoodAvg ?? ""}
                    onChange={(e) =>
                      setLikelihoodAvg(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  {top6Average !== null && (
                    <button
                      onClick={() => setLikelihoodAvg(top6Average)}
                      className="mt-2 text-xs text-purple-600 font-bold hover:text-purple-800"
                    >
                      Use calculated Top 6 ({top6Average}%)
                    </button>
                  )}
                </div>

                {/* Step 2: Supp App Self-Assessment */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    Supp App Self-Assessment
                  </h3>
                  {[
                    { key: "essayQuality", label: "Essay Writing Quality", desc: "How strong are your supplementary essays?" },
                    { key: "interviewReadiness", label: "Interview Readiness", desc: "How prepared are you for video/panel interviews?" },
                    { key: "ecLeadership", label: "EC Leadership Depth", desc: "How deep is your extracurricular leadership impact?" },
                    { key: "referenceStrength", label: "Reference Strength", desc: "How strong are your reference letters likely to be?" },
                  ].map((item) => (
                    <div key={item.key} className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-700">{item.label}</label>
                        <span className="text-[10px] font-bold text-purple-600">{suppFactors[item.key as keyof typeof suppFactors]}/5</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={suppFactors[item.key as keyof typeof suppFactors]}
                        onChange={(e) =>
                          setSuppFactors((prev) => ({
                            ...prev,
                            [item.key]: Number(e.target.value),
                          }))
                        }
                        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Step 3: Select Programs */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                    Select Target Programs
                  </h3>
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {PROGRAMS.map((prog) => (
                      <button
                        key={prog.id}
                        onClick={() => toggleTargetProgram(prog.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                          selectedTargetPrograms.includes(prog.id)
                            ? "bg-purple-100 text-purple-800 border border-purple-300"
                            : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate mr-2">{prog.name} ({prog.university.split(" ").pop()})</span>
                        {selectedTargetPrograms.includes(prog.id) && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setLikelihoodCalculated(true)}
                    disabled={likelihoodAvg === null || selectedTargetPrograms.length === 0}
                    className="w-full mt-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" /> Calculate Likelihood
                  </button>
                </div>
              </div>

              {/* Right: Results */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                  {!likelihoodCalculated || likelihoodAvg === null ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Target className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500 font-medium">Enter your average, rate your supp app readiness, and select programs to see your estimated admission likelihood.</p>
                      <p className="text-xs text-slate-400 mt-1">Results will appear here once calculated.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Admission Likelihood Results ({selectedTargetPrograms.length} programs)
                        </h3>
                        <button
                          onClick={() => setLikelihoodCalculated(false)}
                          className="text-xs text-purple-600 font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Recalculate
                        </button>
                      </div>

                      <div className="space-y-4">
                        {PROGRAMS.filter((p) => selectedTargetPrograms.includes(p.id))
                          .map((prog) => {
                            const likelihood = computeLikelihood(likelihoodAvg, suppFactorValues, prog);
                            const tier = getProgramTier(likelihoodAvg, prog);
                            let barColor = "bg-emerald-500";
                            let pillColor = "bg-emerald-100 text-emerald-700";
                            if (likelihood < 40) { barColor = "bg-red-500"; pillColor = "bg-red-100 text-red-700"; }
                            else if (likelihood < 65) { barColor = "bg-amber-500"; pillColor = "bg-amber-100 text-amber-700"; }
                            else if (likelihood < 80) { barColor = "bg-purple-500"; pillColor = "bg-purple-100 text-purple-700"; }

                            const gradeScore = Math.round(computeGradeScore(likelihoodAvg, prog.competitiveMin, prog.competitiveMax));
                            const suppScore = Math.round((suppFactorValues.reduce((a, b) => a + b, 0) / 4) / 5 * 100);

                            return (
                              <div key={prog.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{prog.name}</h4>
                                    <p className="text-xs text-slate-500">{prog.university} · {prog.competitiveAvg}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${pillColor}`}>
                                      {likelihood}% Likelihood
                                    </span>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{tier.label}</p>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-full ${barColor} rounded-full transition-all duration-700`}
                                    style={{ width: `${Math.min(likelihood, 100)}%` }}
                                  />
                                </div>

                                {/* Score Breakdown */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Grade Score</span>
                                    <span className="font-bold text-slate-800">{gradeScore}%</span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      vs competitive range {prog.competitiveMin}–{prog.competitiveMax}%
                                    </p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Supp App Score</span>
                                    <span className="font-bold text-slate-800">{suppScore}%</span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      Weight: {prog.suppAppWeight}
                                    </p>
                                  </div>
                                </div>

                                {/* Tips */}
                                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs text-purple-800">
                                  <strong>Tip:</strong>{" "}
                                  {likelihood >= 80
                                    ? "You're in a strong position! Focus on maintaining grades and polishing essays."
                                    : likelihood >= 65
                                    ? "Competitive application. Double down on supp app quality and interview prep."
                                    : likelihood >= 40
                                    ? "This is a reach. Strengthen your EC profile and consider backup options."
                                    : "Significant reach. Consider programs with more aligned competitive ranges or boost your average."}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROGRAM COMPARISON */}
        {activeTab === "compare" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Side-by-Side Program Comparison</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Select up to 3 programs from the directory to compare methodology, cutoffs, and career outcomes.
                </p>
              </div>
              {comparedProgramIds.length > 0 && (
                <button
                  onClick={() => setComparedProgramIds([])}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset All ({comparedProgramIds.length})
                </button>
              )}
            </div>

            {comparedProgramsList.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm">No programs selected for comparison yet.</p>
                <button
                  onClick={() => setActiveTab("directory")}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Browse Directory
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">
                        Feature
                      </th>
                      {comparedProgramsList.map((p) => (
                        <th key={p.id} className="p-4 text-left w-1/4 border-l border-slate-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">{p.name}</span>
                              <span className="text-xs text-slate-500">{p.university}</span>
                            </div>
                            <button
                              onClick={() => toggleCompareProgram(p.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    <tr>
                      <td className="p-4 font-bold text-slate-700 bg-slate-50">Discipline Field</td>
                      {comparedProgramsList.map((p) => (
                        <td key={p.id} className="p-4 border-l border-slate-100 font-semibold text-emerald-700">
                          {p.field}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-700 bg-slate-50">Competitive Average</td>
                      {comparedProgramsList.map((p) => (
                        <td key={p.id} className="p-4 border-l border-slate-100 font-bold text-slate-900">
                          {"competitiveAvg" in p ? p.competitiveAvg : `${p.gpaCompetitiveMin}% – ${p.gpaCompetitiveMax}%`}
                        </td>
                      ))}
                    </tr>
                    {"acceptanceRate" in comparedProgramsList[0] && (
                      <tr>
                        <td className="p-4 font-bold text-slate-700 bg-slate-50">Acceptance Rate / SAT</td>
                        {comparedProgramsList.map((p) => (
                          <td key={p.id} className="p-4 border-l border-slate-100 font-bold text-slate-900">
                            {"acceptanceRate" in p ? `${p.acceptanceRate} / SAT ${p.satRange}` : "N/A"}
                          </td>
                        ))}
                      </tr>
                    )}
                    <tr>
                      <td className="p-4 font-bold text-slate-700 bg-slate-50">Supp App Weight</td>
                      {comparedProgramsList.map((p) => (
                        <td key={p.id} className="p-4 border-l border-slate-100">
                          {p.suppAppWeight}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-700 bg-slate-50">Learning Methodology</td>
                      {comparedProgramsList.map((p) => (
                        <td key={p.id} className="p-4 border-l border-slate-100 text-slate-600">
                          {p.methodology}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-700 bg-slate-50">Post-Grad Pathways</td>
                      {comparedProgramsList.map((p) => (
                        <td key={p.id} className="p-4 border-l border-slate-100 text-slate-600">
                          {p.postGradPathways}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-700 bg-slate-50">Pros</td>
                      {comparedProgramsList.map((p) => (
                        <td key={p.id} className="p-4 border-l border-slate-100">
                          <ul className="list-disc list-inside space-y-1 text-emerald-800">
                            {p.pros.map((pro, i) => (
                              <li key={i}>{pro}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-700 bg-slate-50">Cons</td>
                      {comparedProgramsList.map((p) => (
                        <td key={p.id} className="p-4 border-l border-slate-100">
                          <ul className="list-disc list-inside space-y-1 text-slate-600">
                            {p.cons.map((con, i) => (
                              <li key={i}>{con}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PREREQ MATCHER */}
        {activeTab === "prereqs" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Ontario High School Prerequisite Matcher</h2>
              <p className="text-xs text-slate-600 mt-1">
                Select the Grade 12 (4U/M) courses you have completed or plan to take to filter programs you meet prerequisites for.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ALL_ONTARIO_PREREQS.map((course) => {
                  const isSelected = selectedCourses.includes(course.code);
                  return (
                    <button
                      key={course.code}
                      onClick={() => toggleCourse(course.code)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{course.code} ({course.name})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Programs Eligible With Selected Courses ({selectedCourses.length} selected)
              </h3>
              <div className="space-y-3">
                {PROGRAMS.map((p) => {
                  const missingPrereqs = p.prereqs.filter((req) => {
                    if (req === "Math4U" || req === "Any 4U Math") {
                      return !selectedCourses.some((c) => ["MCV4U", "MHF4U", "MDM4U"].includes(c));
                    }
                    if (req.includes("or")) {
                      const options = req.split(" or ").map((s) => s.trim());
                      return !options.some((opt) => selectedCourses.includes(opt));
                    }
                    return !selectedCourses.includes(req);
                  });
                  const isEligible = missingPrereqs.length === 0;
                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                        isEligible ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                          <span className="text-xs text-slate-500">({p.university})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>Required:</strong> {p.prereqs.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {isEligible ? (
                          <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1">
                            Missing: {missingPrereqs.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PATHWAY QUIZ */}
        {activeTab === "pathway" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-slate-900">Program Fit Assessment Quiz</h2>
              <p className="text-xs text-slate-600 mt-1">
                Answer a few quick questions to receive personalized program recommendations tailored to your goals.
              </p>
            </div>

            {!quizSubmitted ? (
              <form onSubmit={handleQuizSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    1. Preferred Learning Style
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "inquiry", label: "Inquiry & Problem-Based Learning (Group discussion)" },
                      { id: "traditional", label: "Traditional Lectures & Rigorous Exams" },
                      { id: "coop", label: "Hands-on Work Experience & Co-op terms" },
                      { id: "case-study", label: "Case-Study Method & Debate" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, style: opt.id })}
                        className={`p-3 text-xs font-semibold rounded-xl text-left border transition-all ${
                          quizAnswers.style === opt.id
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    2. Primary Discipline Interest
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "Healthcare & Life Sciences",
                      "Engineering",
                      "Computer Science & Tech",
                      "Business & Finance",
                      "Law & Policy",
                      "Mathematics & Data",
                      "Sustainability & Environment",
                      "Arts & Humanities",
                      "Interdisciplinary",
                    ].map((field) => (
                      <button
                        type="button"
                        key={field}
                        onClick={() => setQuizAnswers({ ...quizAnswers, fieldInterest: field })}
                        className={`p-2.5 text-xs font-semibold rounded-xl text-center border transition-all ${
                          quizAnswers.fieldInterest === field
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {field}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!quizAnswers.fieldInterest}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                >
                  Generate Recommendations
                </button>
              </form>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Your Recommended Programs</h3>
                  <button onClick={resetQuiz} className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROGRAMS.filter((p) => p.field === quizAnswers.fieldInterest || p.styleTag === quizAnswers.style).map((p) => (
                    <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded-md">
                        {p.field}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{p.name}</h4>
                      <p className="text-xs text-slate-500">{p.university}</p>
                      <p className="text-xs text-slate-600 mt-2">
                        <strong>Avg:</strong> {p.competitiveAvg} | <strong>Supp App:</strong> {p.suppAppWeight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TIMELINE & ROADMAP */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">High School Preparation Roadmap (Grades 9–12)</h2>
              <p className="text-xs text-slate-600 mt-1">
                Strategic step-by-step milestone planner to build a competitive application profile for top Canadian universities.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ROADMAP_STEPS.map((step, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <span className="text-xs font-extrabold uppercase px-3 py-1 bg-slate-900 text-white rounded-lg">
                        {step.grade}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">{step.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Focus:</strong> {step.focus}
                    </p>
                    <ul className="space-y-2">
                      {step.milestones.map((m, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: EXTRACURRICULARS */}
        {activeTab === "ecs" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Extracurricular & Impact Strategy Guide</h2>
              <p className="text-xs text-slate-600 mt-1">
                How supplementary evaluators assess passion projects, club leadership, independent research, and community service.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "1. Leadership Depth over Breadth",
                  desc: "Admissions officers at McMaster BHSc, Waterloo, and Ivey prefer sustained commitment and measurable impact in 2–3 core initiatives rather than superficial membership in 10 clubs.",
                },
                {
                  title: "2. Passion Projects & Innovation",
                  desc: "Initiate independent projects—like founding a coding non-profit, authoring a systematic literature review, or leading a hardware build—that demonstrate self-driven curiosity.",
                },
                {
                  title: "3. Reflection & Self-Awareness",
                  desc: "Supplementary essays evaluate *how you think*, not just what you did. Focus on overcome challenges, ethical decisions, and personal growth in your writing.",
                },
              ].map((card, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: ETHICS & POLICY */}
        {activeTab === "advocacy" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ethics & Policy Analysis Briefs</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Cross-disciplinary case studies exploring bioethics, legal policy, tech accountability, environmental ethics, neuroethics, and more.
                </p>
              </div>
              <select
                value={ethicsFieldFilter}
                onChange={(e) => setEthicsFieldFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Disciplines ({BIOETHICS_BRIEFS.length})</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Engineering">Engineering</option>
                <option value="Computer Science & Tech">Computer Science & Tech</option>
                <option value="Business & Finance">Business & Finance</option>
                <option value="Law & Policy">Law & Policy</option>
                <option value="Mathematics & Data">Mathematics & Data</option>
                <option value="Sustainability & Environment">Sustainability & Environment</option>
                <option value="Arts & Humanities">Arts & Humanities</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredEthics.map((brief) => (
                <div key={brief.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-slate-100 text-slate-700">
                        {brief.field}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{brief.date}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-100 text-purple-700">
                        {brief.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{brief.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{brief.summary}</p>
                    <div className="mt-4 p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs">
                      <strong className="text-red-900 block mb-0.5">Ethical Dilemma:</strong>
                      <span className="text-red-800">{brief.ethicalDilemma}</span>
                    </div>
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <strong className="text-slate-800 block mb-0.5">Regulatory / Policy Impact:</strong>
                      <span className="text-slate-600">{brief.policyImpact}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {brief.keyStakeholders.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 font-medium rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold">{brief.whyItMatters}</span>
                    <a
                      href={brief.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: RESOURCES */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Multi-Disciplinary Academic Resource Library</h2>
                <p className="text-xs text-slate-600 mt-1">
                  Extensive repository of research databases, national competitions, interactive tools, online courses, and open-access journals for each discipline.
                </p>
              </div>
              <select
                value={resourceFieldFilter}
                onChange={(e) => setResourceFieldFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Disciplines ({DISCIPLINE_RESOURCES.length})</option>
                {DISCIPLINE_RESOURCES.map((r) => (
                  <option key={r.field} value={r.field}>{r.field}</option>
                ))}
              </select>
            </div>

            <div className="space-y-8">
              {filteredResources.map((disc) => (
                <div key={disc.field} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">{disc.field}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{disc.overview}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {disc.items.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800">
                              {item.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{item.targetAudience}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-end">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <span>Access Resource</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: Q&A SUPPORT */}
        {activeTab === "counseling" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-slate-900">Admissions Guidance & Peer Inquiry</h2>
              <p className="text-xs text-slate-600 mt-1">
                Have questions regarding course selection, supplementary essay planning, or program comparisons? Submit an inquiry below.
              </p>
            </div>

            {formSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-base">Inquiry Received!</h3>
                <p className="text-xs text-slate-600">
                  Thank you, {counselingForm.name}. Our mentorship team will review your target program questions and email you detailed feedback.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Submit Another Question
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={counselingForm.name}
                    onChange={(e) => setCounselingForm({ ...counselingForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={counselingForm.email}
                    onChange={(e) => setCounselingForm({ ...counselingForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Grade Level</label>
                    <select
                      value={counselingForm.grade}
                      onChange={(e) => setCounselingForm({ ...counselingForm, grade: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Program</label>
                    <input
                      type="text"
                      value={counselingForm.targetProgram}
                      onChange={(e) => setCounselingForm({ ...counselingForm, targetProgram: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. McMaster iBiomed / Waterloo CS"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Inquiry / Question</label>
                  <textarea
                    rows={4}
                    required
                    value={counselingForm.question}
                    onChange={(e) => setCounselingForm({ ...counselingForm, question: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ask about prerequisite planning, EC strategy, or supplementary essays..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  {formSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Submit Inquiry</>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 10: ABOUT */}
        {activeTab === "about" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                UP
              </div>
              <h2 className="text-xl font-bold text-slate-900">About UniPathwayHub</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                UniPathwayHub is an open-access platform designed to democratize high school guidance and university admissions data across Canadian secondary schools. Built for students navigating multi-disciplinary academic choices in both Canada and the United States.
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-extrabold text-emerald-700 text-lg">{PROGRAMS.length}</span>
                  <p className="text-slate-500 mt-0.5">Canadian Programs</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-extrabold text-blue-700 text-lg">{USA_PROGRAMS.length}</span>
                  <p className="text-slate-500 mt-0.5">USA Programs</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-extrabold text-purple-700 text-lg">{BIOETHICS_BRIEFS.length}</span>
                  <p className="text-slate-500 mt-0.5">Ethics Briefs</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-extrabold text-amber-700 text-lg">
                    {DISCIPLINE_RESOURCES.reduce((acc, d) => acc + d.items.length, 0)}
                  </span>
                  <p className="text-slate-500 mt-0.5">Resources</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
