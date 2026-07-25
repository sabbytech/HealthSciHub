"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  ExternalLink,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  MessageSquare,
  User,
  Send,
  Award,
  BookMarked,
  ShieldAlert,
  Lightbulb,
  ArrowUpRight,
  XCircle,
  HelpCircle,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

type TabType =
  | "directory"
  | "prereqs"
  | "pathway"
  | "timeline"
  | "ecs"
  | "advocacy"
  | "counseling"
  | "about";

interface Program {
  id: string;
  name: string;
  university: string;
  province: string;
  cutoff: string;
  suppAppWeight: string;
  methodology: string;
  prereqs: string[];
  keyFeatures: string[];
  link: string;
  styleTag: "inquiry" | "traditional" | "coop" | "tech";
}

interface BioethicsBrief {
  id: string;
  title: string;
  category: "Bioethics" | "Health Policy" | "Public Health" | "Medical Tech";
  readTime: string;
  date: string;
  summary: string;
  ethicalDilemma: string;
  keyStakeholders: string[];
  whyItMatters: string;
  sourceUrl: string;
}

const PROGRAMS: Program[] = [
  {
    id: "bhsc-mcmaster",
    name: "Bachelor of Health Sciences (BHSc)",
    university: "McMaster University",
    province: "Ontario",
    cutoff: "90%+",
    suppAppWeight: "Heavy (Crucial)",
    methodology: "Inquiry-based small group learning",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Inquiry model", "Self-directed evaluations", "Flexible electives"],
    link: "https://bhsc.mcmaster.ca",
    styleTag: "inquiry",
  },
  {
    id: "ibiomed-mcmaster",
    name: "Integrated Biomedical Engineering & Health Sci (iBiomed)",
    university: "McMaster University",
    province: "Ontario",
    cutoff: "92%+",
    suppAppWeight: "Moderate (Video/Written)",
    methodology: "Engineering design-studio & inquiry",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U", "SPH4U"],
    keyFeatures: ["Dual degree paths", "Hands-on tech prototyping", "Healthtech focus"],
    link: "https://www.eng.mcmaster.ca/ibiomed/",
    styleTag: "tech",
  },
  {
    id: "medsci-western",
    name: "Medical Sciences (BMSc)",
    university: "Western University",
    province: "Ontario",
    cutoff: "91%+",
    suppAppWeight: "None (Grade-based)",
    methodology: "Traditional lecture & laboratory modules",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Schulich School of Medicine modules", "Year 3/4 majors", "Lab focus"],
    link: "https://www.schulich.uwo.ca/bmsc/",
    styleTag: "traditional",
  },
  {
    id: "healthsci-queens",
    name: "Bachelor of Health Sciences (BHSc)",
    university: "Queen's University",
    province: "Ontario",
    cutoff: "88%+",
    suppAppWeight: "Heavy (Supplementary Essay)",
    methodology: "Flipped classroom & blended learning",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Anatomy learning lab", "Competency framework", "High med school placement"],
    link: "https://bhsc.queensu.ca",
    styleTag: "inquiry",
  },
  {
    id: "lifesci-uoft",
    name: "Life Sciences (BSc)",
    university: "University of Toronto (St. George)",
    province: "Ontario",
    cutoff: "88%+",
    suppAppWeight: "None",
    methodology: "Large-scale lecture & core lab series",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Hospital research network", "Massive course selection", "World-class faculty"],
    link: "https://www.artsci.utoronto.ca",
    styleTag: "traditional",
  },
  {
    id: "healthsci-waterloo",
    name: "Health Sciences (BHE)",
    university: "University of Waterloo",
    province: "Ontario",
    cutoff: "85%+",
    suppAppWeight: "Optional (AIF)",
    methodology: "Co-op integrated learning & epidemiology",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Paid Co-op placements", "Population health focus", "Data science option"],
    link: "https://uwaterloo.ca/public-health-sciences/",
    styleTag: "coop",
  },
  {
    id: "healthsci-ottawa",
    name: "Health Sciences (BHSc)",
    university: "University of Ottawa",
    province: "Ontario",
    cutoff: "85%+",
    suppAppWeight: "None",
    methodology: "Biosocial model of health & research",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Bilingual options", "Public health access", "Research hospital proximity"],
    link: "https://www.uottawa.ca/faculty-health-sciences/",
    styleTag: "traditional",
  },
  {
    id: "biomed-guelph",
    name: "Biomedical Science (BSc)",
    university: "University of Guelph",
    province: "Ontario",
    cutoff: "88%+",
    suppAppWeight: "Optional (SPF)",
    methodology: "Human & animal physiology systems",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Full cadaver dissection lab", "Veterinary/Med alignment", "Human anatomy focus"],
    link: "https://www.uoguelph.ca/bsc/",
    styleTag: "traditional",
  },
  {
    id: "healthsci-mcmaster-kinesiology",
    name: "Kinesiology (BScKin)",
    university: "McMaster University",
    province: "Ontario",
    cutoff: "88%+",
    suppAppWeight: "None",
    methodology: "Biomechanics, exercise physiology & lab work",
    prereqs: ["ENG4U", "SBI4U", "Math4U"],
    keyFeatures: ["Human movement labs", "Clinical placements", "Strong pre-med base"],
    link: "https://www.science.mcmaster.ca/kinesiology/",
    styleTag: "traditional",
  },
  {
    id: "biomed-uottawa",
    name: "Biomedical Science (BSc)",
    university: "University of Ottawa",
    province: "Ontario",
    cutoff: "86%+",
    suppAppWeight: "None",
    methodology: "Molecular genetics & cellular biology",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Co-op available", "Translational medicine focus", "Faculties of Medicine collaboration"],
    link: "https://www.uottawa.ca",
    styleTag: "coop",
  },
  {
    id: "lifesci-mcgill",
    name: "Biological, Biomedical & Life Sciences (BSc)",
    university: "McGill University",
    province: "Quebec",
    cutoff: "93%+",
    suppAppWeight: "None",
    methodology: "Research-heavy foundational science",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Top-tier global reputation", "Neuroscience stream", "Hospital research labs"],
    link: "https://www.mcgill.ca/science/",
    styleTag: "traditional",
  },
  {
    id: "healthsci-ubc",
    name: "Bachelor of Health Sciences / Kinesiology",
    university: "University of British Columbia",
    province: "British Columbia",
    cutoff: "90%+",
    suppAppWeight: "Heavy (Personal Profile)",
    methodology: "Interdisciplinary holistic health",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Personal profile evaluation", "Global health research", "Vancouver clinical network"],
    link: "https://you.ubc.ca",
    styleTag: "inquiry",
  },
  {
    id: "healthsci-sfu",
    name: "Health Sciences (BHSc/BSc)",
    university: "Simon Fraser University",
    province: "British Columbia",
    cutoff: "84%+",
    suppAppWeight: "None",
    methodology: "Molecular biology to global health policy",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Co-op program", "Global health track", "Cellular pathology track"],
    link: "https://www.sfu.ca/fhs.html",
    styleTag: "coop",
  },
  {
    id: "healthsci-calgary",
    name: "Bachelor of Health Sciences (BHSc)",
    university: "University of Calgary",
    province: "Alberta",
    cutoff: "90%+",
    suppAppWeight: "Heavy (Supplementary Application)",
    methodology: "Research-intensive inquiry curriculum",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Cumming School of Medicine tie-in", "Mandatory research thesis", "Small cohort size"],
    link: "https://cumming.ucalgary.ca/bhsc",
    styleTag: "inquiry",
  },
  {
    id: "biomed-alberta",
    name: "Biomedical Sciences / Physiology",
    university: "University of Alberta",
    province: "Alberta",
    cutoff: "88%+",
    suppAppWeight: "None",
    methodology: "Systemic physiology and clinical disease",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Medical lab research", "Organ systems focus", "Pre-med alignment"],
    link: "https://www.ualberta.ca",
    styleTag: "traditional",
  },
  {
    id: "healthsci-carleton",
    name: "Bachelor of Health Sciences (BHSc)",
    university: "Carleton University",
    province: "Ontario",
    cutoff: "82%+",
    suppAppWeight: "None",
    methodology: "Hands-on lab training & health policy",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Five specialized concentrations", "Dissection labs", "Co-op available"],
    link: "https://carleton.ca/healthsciences/",
    styleTag: "coop",
  },
  {
    id: "healthsci-york",
    name: "Health Sciences / Global Health (BHSc)",
    university: "York University",
    province: "Ontario",
    cutoff: "80%+",
    suppAppWeight: "None",
    methodology: "Health management & digital health care",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Global Health practicum", "Health informatics option", "Healthcare policy"],
    link: "https://health.yorku.ca",
    styleTag: "traditional",
  },
  {
    id: "lifesci-queens",
    name: "Life Sciences (BSCH)",
    university: "Queen's University",
    province: "Ontario",
    cutoff: "90%+",
    suppAppWeight: "None",
    methodology: "Sub-cellular to systems biology",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Cardiovascular & cancer research", "Neuroscience sub-plan", "High med school acceptance"],
    link: "https://www.queensu.ca",
    styleTag: "traditional",
  },
  {
    id: "biomed-toronto-mississauga",
    name: "Forensic Science / Life Sciences",
    university: "University of Toronto (UTM)",
    province: "Ontario",
    cutoff: "84%+",
    suppAppWeight: "None",
    methodology: "Laboratory analytics & pathology",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Crime lab equipment", "Biomedical communications track", "Small campus community"],
    link: "https://www.utm.utoronto.ca",
    styleTag: "traditional",
  },
  {
    id: "biomed-toronto-scarborough",
    name: "Biological Sciences (Neuroscience/Health)",
    university: "University of Toronto (UTSC)",
    province: "Ontario",
    cutoff: "84%+",
    suppAppWeight: "None",
    methodology: "Co-op integrated human biology",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Co-op hospital work terms", "Behavioral neuroscience", "Clinical psychology stream"],
    link: "https://www.utsc.utoronto.ca",
    styleTag: "coop",
  },
  {
    id: "healthsci-western-shs",
    name: "Health Sciences (BHSc - School of Health Studies)",
    university: "Western University",
    province: "Ontario",
    cutoff: "85%+",
    suppAppWeight: "None",
    methodology: "Social determinants & rural health policy",
    prereqs: ["ENG4U", "SBI4U", "Math4U"],
    keyFeatures: ["Health promotion track", "Ethics & policy focus", "Interdisciplinary electives"],
    link: "https://www.uwo.ca/fhs/shs/",
    styleTag: "traditional",
  },
  {
    id: "kinesiology-waterloo",
    name: "Kinesiology (BScKin)",
    university: "University of Waterloo",
    province: "Ontario",
    cutoff: "85%+",
    suppAppWeight: "Optional (AIF)",
    methodology: "Anatomy labs, biomechanics & ergonomics",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Human cadaver lab", "Co-op pre-med track", "Clinical biomechanics"],
    link: "https://uwaterloo.ca/kinesiology-health-sciences/",
    styleTag: "coop",
  },
  {
    id: "biomed-ryerson",
    name: "Biomedical Sciences (BSc)",
    university: "Toronto Metropolitan University (TMU)",
    province: "Ontario",
    cutoff: "83%+",
    suppAppWeight: "None",
    methodology: "Cellular biology, biochemistry & disease",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "MCV4U"],
    keyFeatures: ["Downtown hospital network", "Co-op available", "Biotechnology incubator access"],
    link: "https://www.torontomu.ca",
    styleTag: "coop",
  },
  {
    id: "healthsci-laurier",
    name: "Health Sciences (BHSc)",
    university: "Wilfrid Laurier University",
    province: "Ontario",
    cutoff: "86%+",
    suppAppWeight: "None",
    methodology: "Small class sizes & cell biology labs",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["100% science-based curriculum", "Research thesis option", "Close-knit community"],
    link: "https://www.wlu.ca",
    styleTag: "traditional",
  },
  {
    id: "biomed-brock",
    name: "Medical Sciences (BMedSci)",
    university: "Brock University",
    province: "Ontario",
    cutoff: "82%+",
    suppAppWeight: "None",
    methodology: "Human anatomy, epidemiology & ethics",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Med Plus co-curricular program", "Shadowing opportunities", "MCAT prep guidance"],
    link: "https://brocku.ca",
    styleTag: "traditional",
  },
  {
    id: "healthsci-ontariotech",
    name: "Health Sciences (BHSc)",
    university: "Ontario Tech University",
    province: "Ontario",
    cutoff: "80%+",
    suppAppWeight: "None",
    methodology: "Technology-infused health research & labs",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Human Performance lab", "Kinesiology/Public Health tracks", "Modern tech facilities"],
    link: "https://healthsciences.ontariotechca.ca",
    styleTag: "tech",
  },
  {
    id: "healthsci-dalhousie",
    name: "Bachelor of Health Sciences (BHSc)",
    university: "Dalhousie University",
    province: "Nova Scotia",
    cutoff: "85%+",
    suppAppWeight: "None",
    methodology: "Diagnostic cytology & clinical technology",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Atlantic healthcare network", "Clinical internships", "Diagnostic specialization"],
    link: "https://www.dal.ca",
    styleTag: "traditional",
  },
  {
    id: "healthsci-manitoba",
    name: "Bachelor of Health Sciences (BHSc)",
    university: "University of Manitoba",
    province: "Manitoba",
    cutoff: "85%+",
    suppAppWeight: "None",
    methodology: "Interdisciplinary health & indigenous health focus",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Rady Faculty of Health Sciences link", "Community health focus", "Pre-med track"],
    link: "https://umanitoba.ca",
    styleTag: "traditional",
  },
  {
    id: "biomed-saskatchewan",
    name: "Biomedical Foundations / Neuroscience",
    university: "University of Saskatchewan",
    province: "Saskatchewan",
    cutoff: "82%+",
    suppAppWeight: "None",
    methodology: "Biochemistry, microbiology & drug development",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Canadian Light Source Synchrotron access", "Undergraduate research grants", "Hospital campus"],
    link: "https://medicine.usask.ca",
    styleTag: "traditional",
  },
  {
    id: "healthsci-victoria",
    name: "Kinesiology & Health Science (BSc)",
    university: "University of Victoria",
    province: "British Columbia",
    cutoff: "83%+",
    suppAppWeight: "None",
    methodology: "Exercise science, neurophysiology & health",
    prereqs: ["ENG4U", "SBI4U", "SCH4U", "Math4U"],
    keyFeatures: ["Co-op program", "Island Health clinical research", "Indigenous health initiatives"],
    link: "https://www.uvic.ca",
    styleTag: "coop",
  },
];

const ALL_ONTARIO_PREREQS = [
  { code: "ENG4U", name: "Grade 12 English" },
  { code: "SBI4U", name: "Grade 12 Biology" },
  { code: "SCH4U", name: "Grade 12 Chemistry" },
  { code: "MCV4U", name: "Grade 12 Calculus & Vectors" },
  { code: "MHF4U", name: "Grade 12 Advanced Functions" },
  { code: "SPH4U", name: "Grade 12 Physics" },
  { code: "MDM4U", name: "Grade 12 Data Management" },
];

const BIOETHICS_BRIEFS: BioethicsBrief[] = [
  {
    id: "b1",
    title: "Algorithmic Bias in ER Triage: ML & Healthcare Equity",
    category: "Bioethics",
    readTime: "5 min read",
    date: "July 2026",
    summary:
      "Emergency departments across North America are increasingly piloting machine learning models to predict patient deterioration and assign triage scores. However, models trained on historical data often replicate structural disparities, misclassifying pain levels and urgency for marginalized groups.",
    ethicalDilemma:
      "Balancing clinical efficiency and rapid throughput against non-maleficence, procedural fairness, and potential automated discrimination.",
    keyStakeholders: [
      "Triage Nurses & Emergency Physicians",
      "Medical AI Developers",
      "Patients from Historically Marginalized Groups",
      "Hospital Bioethics Committees",
    ],
    whyItMatters:
      "Ideal case study for McMaster BHSc or Queen's Health Sci supplementary applications when asked to evaluate the intersection of health technology, justice, and human-centered care.",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/pmc/",
  },
  {
    id: "b2",
    title: "National Pharmacare & Provincial Formularies: Structural Health Equity",
    category: "Health Policy",
    readTime: "6 min read",
    date: "June 2026",
    summary:
      "Canada's transition toward universal single-payer pharmacare presents complex intergovernmental funding friction. Variations in provincial drug formularies mean equal health conditions produce vastly different financial burdens based on geographic location.",
    ethicalDilemma:
      "Distributive justice in public health expenditure: Should essential medications be universally subsidized by federal mandate or tailored by provincial fiscal priorities?",
    keyStakeholders: [
      "Health Canada & Federal Ministry",
      "Provincial Health Authorities",
      "Chronic Disease Patient Coalitions",
      "Pharmaceutical Manufacturers",
    ],
    whyItMatters:
      "Provides strong policy fluency for Casper scenarios, MMI interviews, and health systems essays, showing an understanding of systemic macro-level determinants of health.",
    sourceUrl: "https://www.canada.ca/en/health-canada.html",
  },
  {
    id: "b3",
    title: "The 80/20 Determinants Principle vs. Clinical Intervention",
    category: "Public Health",
    readTime: "4 min read",
    date: "May 2026",
    summary:
      "Epidemiological data shows over 80% of health outcomes are governed by social determinants (housing stability, food security, environmental toxins) rather than clinical healthcare services. Yet budget allocations remain heavily weighted toward downstream hospital care.",
    ethicalDilemma:
      "Resource allocation ethics: Redirecting funds from downstream clinical care to upstream social interventions risks immediate patient care while underfunding root-cause prevention.",
    keyStakeholders: [
      "Public Health Officers",
      "Municipal Housing Boards",
      "Hospital Network Administrators",
      "Community Care Organizations",
    ],
    whyItMatters:
      "Serves as an analytical foundation for inquiry-based problem-solving responses required in top health sciences supplementary questionnaires.",
    sourceUrl: "https://www.who.int",
  },
  {
    id: "b4",
    title: "Somatic CRISPR Therapy vs. Germline Editing Governance",
    category: "Medical Tech",
    readTime: "5 min read",
    date: "April 2026",
    summary:
      "With gene therapies for sickle cell and genetic disorders gaining regulatory approval, the bioethical consensus firmly distinguishes between somatic gene therapy (affecting the individual) and germline modifications (inherited by future generations).",
    ethicalDilemma:
      "Autonomy and consent of future generations vs. the beneficence of eliminating hereditary diseases prior to conception.",
    keyStakeholders: [
      "Geneticists & Research Scientists",
      "Bioethics Regulatory Councils",
      "Patients with Rare Genetic Conditions",
      "Future Generations (Unrepresented)",
    ],
    whyItMatters:
      "Essential material for McMaster iBiomed, Life Sciences, and Health Sci applicants demonstrating nuanced ethics in bioengineering and genetic technologies.",
    sourceUrl: "https://www.nature.com",
  },
];

const ROADMAP_STEPS = [
  {
    grade: "Grade 9",
    title: "Foundations & Exploration",
    focus: "Academic habits, broad curiosity, and zero-pressure EC discovery.",
    milestones: [
      "Maintain strong academic baseline across Math, Science, and English.",
      "Join 2–3 diverse high school clubs (e.g. HOSA, Debate, Robotics, Eco-Club).",
      "Begin tracking community volunteer hours in health or community services.",
      "Explore introductory coding (Python/p5.js) or basic bio-science concepts.",
    ],
  },
  {
    grade: "Grade 10",
    title: "Skill Building & Focus",
    focus: "Identifying core interests, taking on project leadership, and prerequisite foresight.",
    milestones: [
      "Target top academic standing (aim for 90%+ across science and math).",
      "Seek out team lead roles in school clubs or local community groups.",
      "Apply to summer enrichment programs (e.g., Shad Canada, university stem camps).",
      "Complete Grade 10 Career/Civics and map out Grade 11/12 prerequisite pathways.",
      "Begin drafting a personal extracurricular resume/journal.",
    ],
  },
  {
    grade: "Grade 11",
    title: "Leadership & Strategic Acceleration",
    focus: "Grade 11 mark submission, high-impact leadership, and early supp app prep.",
    milestones: [
      "Complete Grade 11 3U Sciences (SBI3U, SCH3U, SPH3U) & Functions (MHF4U if fast-tracked).",
      "Secure executive positions (President, VP, Founder) in key organizations.",
      "Initiate an independent passion project or research paper in bioethics or healthtech.",
      "Apply for hospital/clinical volunteering or summer university lab positions.",
      "Attend university open houses (McMaster, Queen's, Western, U of T).",
    ],
  },
  {
    grade: "Grade 12",
    title: "Execution & Application Season",
    focus: "Top 6 4U/M GPA, supp app essays, Casper/MMI, and offer decisions.",
    milestones: [
      "Fall (Sept–Nov): Confirm Top 6 4U/M schedule (ENG4U, SBI4U, SCH4U, 4U Math, 4U Elective).",
      "November–December: Complete OUAC application portal profile and submit selections.",
      "January–February: Submit McMaster BHSc/iBiomed & Queen's Health Sci supplementary apps.",
      "February–March: Take Casper test (if required for specific programs).",
      "May: Receive admission decisions and accept offer by early June.",
    ],
  },
];

const FREQUENT_FAQS = [
  {
    q: "What is the true cutoff for McMaster Health Sciences (BHSc)?",
    a: "The official requirement is a minimum 90.0% average across six required Grade 12 4U/M courses. Once you hit 90.0%, all applicants are placed on equal footing for essay evaluation. Offers are granted based on a combination of GPA and supplementary application score.",
  },
  {
    q: "Which course qualifies as the 'Non-Math, Non-Science, Non-Tech' 4U credit for McMaster?",
    a: "Eligible courses include Grade 12 English (ENG4U - which satisfies the English requirement), Social Sciences & Humanities (e.g., HSB4U, HHS4U), World Issues/Geography (CGW4U), History (CHY4U), Exercise Science/Kinesiology (PSE4U/PSK4U), or Business (BBB4U/BAT4M). Courses under Technological Education, Computer Science, or Math do not qualify.",
  },
  {
    q: "Do universities prefer Advanced Functions (MHF4U) or Calculus & Vectors (MCV4U)?",
    a: "For programs specifying 'One 4U Math' (like McMaster BHSc or Queen's Health Sci), any of MHF4U, MCV4U, or MDM4U is accepted. If you take multiple, admissions will automatically use your highest grade. However, programs like iBiomed or Western MedSci explicitly require Calculus (MCV4U).",
  },
  {
    q: "How important are extracurriculars for Canadian pre-med/health sci programs?",
    a: "Unlike US universities, Canadian undergraduate admissions are mostly grade-based. However, top-tier programs with supplementary applications (McMaster BHSc, Queen's Health Sci, UBC) evaluate problem-solving, self-reflection, and critical thinking. They care less about the 'title' of your EC and more about how you reflect on your growth.",
  },
];

export default function HealthSciHub() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{
    style: string;
    priority: string;
    cutoffComfort: string;
    techInterest: string;
  }>({
    style: "",
    priority: "",
    cutoffComfort: "",
    techInterest: "",
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Form State
  const [counselingForm, setCounselingForm] = useState({
    name: "",
    email: "",
    grade: "Grade 11",
    targetProgram: "",
    question: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleCourse = (code: string) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setQuizAnswers({
      style: "",
      priority: "",
      cutoffComfort: "",
      techInterest: "",
    });
    setQuizSubmitted(false);
  };

  const filteredPrograms = PROGRAMS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.university.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince =
      selectedProvince === "All" || p.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  const filteredBriefs = BIOETHICS_BRIEFS.filter((b) => {
    return selectedCategory === "All" || b.category === selectedCategory;
  });

  // Calculate quiz match recommendations
  const recommendedPrograms = PROGRAMS.filter((p) => {
    if (!quizSubmitted) return false;
    if (quizAnswers.techInterest === "yes" && p.styleTag === "tech") return true;
    if (quizAnswers.style === "inquiry" && p.styleTag === "inquiry") return true;
    if (quizAnswers.priority === "coop" && p.styleTag === "coop") return true;
    if (quizAnswers.style === "traditional" && p.styleTag === "traditional") return true;
    return false;
  }).slice(0, 4);

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
                HealthSci<span className="text-emerald-600">Hub</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Canadian Post-Secondary Pathways & High School Roadmap
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {[
              { id: "directory", label: "30 Programs", icon: Compass },
              { id: "prereqs", label: "4U Prereq Matcher", icon: SlidersHorizontal },
              { id: "pathway", label: "Pathway Quiz", icon: Sparkles },
              { id: "timeline", label: "Gr. 9–12 Roadmap", icon: Calendar },
              { id: "ecs", label: "Extracurriculars", icon: Layers },
              { id: "advocacy", label: "Bioethics Briefs", icon: BookOpen },
              { id: "counseling", label: "Q&A & Support", icon: MessageSquare },
              { id: "about", label: "About Founder", icon: User },
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

        {/* TAB 1: 30 PROGRAMS DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Canadian Health Science Directory ({filteredPrograms.length})
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Comprehensive admission cutoffs, supplementary app weights, and curriculum styles across Canada.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="All">All Provinces</option>
                  <option value="Ontario">Ontario</option>
                  <option value="Quebec">Quebec</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Alberta">Alberta</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="Saskatchewan">Saskatchewan</option>
                </select>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search program or university..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {prog.university}
                          </span>
                          <span className="text-[10px] text-slate-400">{prog.province}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                          {prog.name}
                        </h3>
                      </div>
                      <a
                        href={prog.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Official Admission Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 py-2.5 border-y border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Est. Cutoff</span>
                        <span className="font-bold text-slate-800">{prog.cutoff}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Supp App</span>
                        <span className="font-semibold text-slate-800">{prog.suppAppWeight}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">
                          Methodology:
                        </span>
                        <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px]">
                          {prog.methodology}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">
                          Prerequisites:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {prog.prereqs.map((req, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-100 font-mono text-slate-700 px-1.5 py-0.5 rounded text-[10px]"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{prog.keyFeatures.join(" • ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PREREQUISITE MATCHER */}
        {activeTab === "prereqs" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Ontario 4U Prerequisite Matcher Engine
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Select your completed or currently registered Grade 12 4U/4M courses to verify eligibility across all 30 programs.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {ALL_ONTARIO_PREREQS.map((course) => {
                  return (
                    <button
                      key={course.code}
                      onClick={() => toggleCourse(course.code)}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        selectedCourses.includes(course.code)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {selectedCourses.includes(course.code) ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                      <span>
                        {course.code} ({course.name})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Calculated Eligibility Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROGRAMS.map((prog) => {
                  const missingPrereqs = prog.prereqs.filter((req) => {
                    if (req === "Math4U") {
                      return !(
                        selectedCourses.includes("MCV4U") ||
                        selectedCourses.includes("MHF4U") ||
                        selectedCourses.includes("MDM4U")
                      );
                    }
                    return !selectedCourses.includes(req);
                  });

                  const isEligible = missingPrereqs.length === 0;

                  return (
                    <div
                      key={prog.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isEligible
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-white border-slate-200 opacity-80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">
                            {prog.university}
                          </p>
                          <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                            {prog.name}
                          </h4>
                        </div>
                        {isEligible ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> {missingPrereqs.length} Missing
                          </span>
                        )}
                      </div>

                      {!isEligible && (
                        <div className="mt-3 pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 text-[11px]">Still needed:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {missingPrereqs.map((m, idx) => (
                              <span
                                key={idx}
                                className="bg-rose-50 text-rose-700 font-mono text-[10px] px-1.5 py-0.5 rounded border border-rose-100"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PATHWAY FINDER QUIZ */}
        {activeTab === "pathway" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Health Sciences Pathway Test
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Answer 4 quick questions about your learning preferences, career goals, and academic strengths to discover your best program fits.
              </p>
            </div>

            {!quizSubmitted ? (
              <form
                onSubmit={handleQuizSubmit}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                {/* Q1 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    1. What type of learning environment do you thrive in?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "inquiry", label: "Inquiry & Small Group PBL", desc: "Self-directed, collaborative case studies" },
                      { id: "traditional", label: "Traditional Science & Labs", desc: "Structured lectures, heavy bio/chem core" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, style: opt.id })}
                        className={`p-3 text-left rounded-xl border transition-all text-xs ${
                          quizAnswers.style === opt.id
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    2. What is your priority for undergraduate experience?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: "gpa", label: "High GPA & Elective Flexibility", desc: "Optimized for Pre-Med / Professional applications" },
                      { id: "coop", label: "Paid Co-op & Industry Work", desc: "Gaining real-world hospital & policy placements" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, priority: opt.id })}
                        className={`p-3 text-left rounded-xl border transition-all text-xs ${
                          quizAnswers.priority === opt.id
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold">{opt.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    3. Are you interested in combining technology/engineering with health?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "yes", label: "Yes (Biomedical & Code)" },
                      { id: "no", label: "No (Pure Biological Focus)" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, techInterest: opt.id })}
                        className={`p-3 text-center rounded-xl border transition-all text-xs font-bold ${
                          quizAnswers.techInterest === opt.id
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q4 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    4. What is your expected Grade 12 Top 6 admission average range?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "high", label: "93%+" },
                      { id: "mid", label: "88% – 92%" },
                      { id: "standard", label: "80% – 87%" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setQuizAnswers({ ...quizAnswers, cutoffComfort: opt.id })}
                        className={`p-2.5 text-center rounded-xl border transition-all text-xs font-bold ${
                          quizAnswers.cutoffComfort === opt.id
                            ? "bg-emerald-50 border-emerald-600 text-emerald-900"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!quizAnswers.style || !quizAnswers.priority}
                  className="w-full py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Generate Pathway Match Results
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-emerald-900">
                      Top Program Matches for Your Profile
                    </h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Based on your preferences for learning style, career pathway, and grade average.
                    </p>
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedPrograms.map((prog) => (
                    <div
                      key={prog.id}
                      className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {prog.university}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">
                            {prog.name}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {prog.cutoff}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {prog.methodology}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Supp App: {prog.suppAppWeight}</span>
                        <a
                          href={prog.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: HIGH SCHOOL JOURNEY TIMELINE */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Grade 9–12 High School Planning Roadmap
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                A step-by-step master strategy guide to balancing course selection, extracurricular growth, and application milestones across high school.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ROADMAP_STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                        {step.grade}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Phase {idx + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 mb-4 italic">
                      "{step.focus}"
                    </p>

                    <div className="space-y-2.5">
                      {step.milestones.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-normal">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EXTRACURRICULARS FRAMEWORK */}
        {activeTab === "ecs" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Extracurricular Strategy & Portfolio Building
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Canadian health science programs do not look for exhaustive lists of achievements. They value depth, self-reflection, and problem-solving.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl w-fit">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">1. Community & Clinical</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Consistent volunteering in hospital eldercare, hospice centers, youth mentoring, or local food banks. Focus on patient interaction and empathy.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Key Metric: Long-term commitment over short hours.
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">2. Passion Projects & Code</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Building accessible software tools, digital hardware prototypes (e.g., microcontrollers, sensors), bioethics blogs, or environmental initiatives.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Key Metric: Demonstrating proactive problem-solving.
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl w-fit">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">3. Enrichment Programs</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Participating in STEAM initiatives like Shad Canada, university summer research programs, HOSA competitive events, or science fair projects.
                </p>
                <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Key Metric: Collaborative teamwork and leadership.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BIOETHICS & BRIEFS */}
        {activeTab === "advocacy" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Bioethics & Health Policy Advocacy Briefs
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Curated analytical case studies designed to build ethical fluency for supplementary applications, Casper tests, and MMI interviews.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["All", "Bioethics", "Health Policy", "Public Health", "Medical Tech"].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                        selectedCategory === cat
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBriefs.map((brief) => (
                <div
                  key={brief.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                        {brief.category}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{brief.readTime}</span>
                        <span>•</span>
                        <span>{brief.date}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {brief.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {brief.summary}
                    </p>

                    <div className="bg-amber-50/60 border border-amber-200/60 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Ethical Dilemma Core</span>
                      </div>
                      <p className="text-xs text-amber-900/80 leading-normal">
                        {brief.ethicalDilemma}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">
                        Key Stakeholders Involved:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {brief.keyStakeholders.map((sh, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md"
                          >
                            {sh}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-start gap-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                      <Lightbulb className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">
                          Application Context:
                        </span>
                        <p className="text-xs text-emerald-800/80 mt-0.5">
                          {brief.whyItMatters}
                        </p>
                      </div>
                    </div>

                    <a
                      href={brief.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      <span>Read Original Source Document</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: COUNSELING Q&A SYSTEM */}
        {activeTab === "counseling" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Direct Q&A Knowledge Base & Counseling
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Explore answered questions from Canadian high school applicants or submit your own custom inquiry below.
              </p>
            </div>

            {/* PRE-LOADED FAQS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {FREQUENT_FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
                  >
                    <h4 className="font-bold text-sm text-slate-900 flex items-start gap-2">
                      <span className="text-emerald-600">Q:</span>
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5 border-l-2 border-emerald-500/30">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SUBMISSION FORM */}
            <div className="pt-4 border-t border-slate-200">
              {formSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-lg font-bold text-emerald-900">Question Received!</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Thank you for reaching out. Your inquiry has been submitted successfully, and feedback will be directed to your email address shortly.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-900"
                  >
                    Submit another question
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleFormSubmit}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-900 mb-2">
                    Ask a Counseling Question
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={counselingForm.name}
                        onChange={(e) =>
                          setCounselingForm({ ...counselingForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="student@school.ca"
                        value={counselingForm.email}
                        onChange={(e) =>
                          setCounselingForm({ ...counselingForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Current Grade Level
                      </label>
                      <select
                        value={counselingForm.grade}
                        onChange={(e) =>
                          setCounselingForm({ ...counselingForm, grade: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
                      >
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="Gap Year">Gap Year / Post-Secondary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Target Program
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. McMaster BHSc, Western MedSci"
                        value={counselingForm.targetProgram}
                        onChange={(e) =>
                          setCounselingForm({
                            ...counselingForm,
                            targetProgram: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Question or Topic
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Ask about prerequisites, supplementary applications, extracurricular positioning, or program comparisons..."
                      value={counselingForm.question}
                      onChange={(e) =>
                        setCounselingForm({ ...counselingForm, question: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: ABOUT FOUNDER */}
        {activeTab === "about" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md">
                  S
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">About HealthSciHub</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Founded & Maintained in Ontario, Canada
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  HealthSciHub was established to provide aspiring healthcare, engineering, and medical science students across Canada with transparent, structured, and accessible admission pathways.
                </p>
                <p>
                  Navigating prerequisites, varying provincial grade cutoffs, and complex supplementary applications often feels opaque. This platform synthesizes core program metrics, offers prerequisite verification tools, and publishes bioethical policy briefs to help students build critical thinking skills.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="block font-bold text-slate-900 text-sm">30 Programs</span>
                  <span className="text-[11px] text-slate-500">Across 7 Provinces</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <BookMarked className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="block font-bold text-slate-900 text-sm">Bioethics Briefs</span>
                  <span className="text-[11px] text-slate-500">Casper & MMI Focus</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <UserCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="block font-bold text-slate-900 text-sm">Student-Centric</span>
                  <span className="text-[11px] text-slate-500">Free Open Resources</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}