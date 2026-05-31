import { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Users, 
  Layers, 
  TrendingUp,
  FileSearch,
  ExternalLink,
  Info,
  Star,
  Trash2,
  Calendar,
  ShieldAlert,
  Download,
  Award,
  DollarSign
} from "lucide-react";
import { CommandCenterCharts } from "./components/CommandCenterCharts";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { AIAdvisorChat } from "./components/AIAdvisorChat";
import { BiometricVerification } from "./components/BiometricVerification";
import { DBConsole } from "./components/DBConsole";
import { AuthPage } from "./components/AuthPage";
import { DiagnosticResult } from "./types";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Standard preset options to simulate or run diagnostic with single click
const PRESET_RESUMES = {
  pm: {
    role: "Senior Product Manager",
    text: `Summary: Experienced Senior Product Manager leading enterprise B2B SaaS solutions. Managed a portfolio of core features driving 14M users. Strong leadership, roadmap orchestration, and strategic monetization planning.
Skills: Agile project delivery, wireframing, SQL, A/B Testing, product lifecycle, cross-functional specs, marketing.
Experience: Product Lead at SaaSify Inc (2022-Pres). Built conversion dashboards increasing core activation velocity by 18%.`
  },
  dev: {
    role: "Backend Software Engineer",
    text: `Summary: Full stack technologist focused on highly distributed microservices, TypeScript, React, and Node.js REST APIs. Built low-latency routing tables, integrated PostgreSQL pools, and optimized Webpack setups.
Skills: Node.js, Python, React, Redux, PostgreSQL, REST/GraphQL interfaces, automated CI/CD unit testing.
Experience: Software Craftsman at CloudLabs (2021-Pres). Scaled message queue infrastructure to ingest 850,000 tasks daily.`
  },
  data: {
    role: "Lead Data Scientist",
    text: `Summary: Quantum statistical analyst with solid core foundations in python predictive modeling, regression tests, and matplotlib dashboard generation. Passionate about machine intelligence and generative tuning.
Skills: Python, Scikit-learn, Statistics, Pandas, SQL data analysis, PyTorch, predictive validation structures.
Experience: Senior Analyst at DeepInsight. Prepared predictive cohort frameworks saving up to $130K in customer attrition.`
  },
  design: {
    role: "Lead UI/UX Designer",
    text: `Summary: Senior Design Systems architect and interaction specialist. Crafted clean responsive user journeys, customized typography scales, and managed high density UI Figma patterns for 8M user platforms.
Skills: Visual Interface Design, Figma component guidelines, Framer interactive states, motion animation layout, design systems.
Experience: Lead Designer at PixelDynamics (2021-Pres). Standardized company-wide button, grid, and navigation layouts, lowering engineering handoff feedback cycles by 24%.`
  },
  marketing: {
    role: "Director of Growth Marketing",
    text: `Summary: Performance-driven growth marketing veteran scaling B2B enterprise acquire channels. Highly skilled in programmatic SEO, GA4 telemetry pipelines, and lead validation.
Skills: Google Analytics, CPA performance optimization, A/B funnel testing, social keyword indexing, email sequences.
Experience: Growth Lead at LeadSpring (2023-Pres). Accelerated organic search signups by +44% while reducing customer acquisition costs (CAC) by 18%.`
  },
  healthcare: {
    role: "Clinical Operations Director",
    text: `Summary: Healthcare delivery director securing high fidelity patient compliance loops and HIPAA compliant workflows in major clinical environments. Experiencing managing Epic EHR portals.
Skills: Clinical Operations, HIPAA Compliance, EHR Epic Integration, Staff scaling indices, Hospital workflow safety.
Experience: Care Operations Lead at MetroHealth Systems (2020-Pres). Orchestrated multi-department scheduling protocols, reducing patient checkout congestion by 3.4 minutes.`
  }
};

const INITIAL_BENCHMARK: DiagnosticResult = {
  role: "Senior Product Manager",
  matchScore: 84,
  metrics: {
    atsScore: 82,
    marketDemand: 88,
    confidenceInterval: 92
  },
  skills: [
    { name: "Product Strategy", user: 85, market: 85 },
    { name: "A/B Testing & Analytics", user: 60, market: 80 },
    { name: "SQL & Data Analytics", user: 45, market: 75 },
    { name: "System Architecture", user: 70, market: 65 },
    { name: "Agile Project Delivery", user: 90, market: 80 },
    { name: "AI/ML Integration", user: 40, market: 85 }
  ],
  salary: {
    current: 125000,
    marketMin: 110000,
    marketAvg: 148000,
    marketMax: 195000,
    percentile: 32
  },
  pivotOpportunities: [
    { role: "Technical Product Manager (TPM)", likelihood: "High", why: "Strong system architecture rating coupled with solid agile delivery foundations." },
    { role: "VP of Product Engineering", likelihood: "Medium", why: "Strategic vision is ready; requires 1 year of direct software management scaling." }
  ],
  atsInsights: [
    "Critically missing keywords: 'AI Integration', 'Data-driven analytics' in resume professional summary.",
    "Your description lists features rather than business metrics. Shift focus from 'Built page X' to 'Drove +22% signup conversion via page layout optimization.'",
    "Format is scan-friendly, but lack of Cloud certifications (AWS/GCP) cuts your eligibility for Enterprise product roles."
  ],
  isMock: true
};

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [uploaderRole, setUploaderRole] = useState("Senior Product Manager");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"pm" | "dev" | "data" | "design" | "marketing" | "healthcare" | "custom">("pm");
  
  // App state
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult>(INITIAL_BENCHMARK);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanHistoryCount, setScanHistoryCount] = useState(1);
  const [apiStatus, setApiStatus] = useState<{ status: string; aiEnabled: boolean } | null>(null);

  // Selector value tracking
  const [selectedSector, setSelectedSector] = useState<string>("Product Management");

  // User Session Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Biometric validation state
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem("biometric_verified") === "true";
    } catch (e) {
      return false;
    }
  });
  const [biometricConfidence, setBiometricConfidence] = useState<number>(() => {
    try {
      const savedConfidence = localStorage.getItem("biometric_confidence");
      return savedConfidence ? parseFloat(savedConfidence) : 0.982;
    } catch (e) {
      return 0.982;
    }
  });

  const handleSignOut = () => {
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("biometric_verified");
      localStorage.removeItem("biometric_confidence");
    } catch (e) {}
    setCurrentUser(null);
    setIsVerified(false);
  };

  // STATEFUL BOOKMARK LIST (Pivot Opportunities)
  const [savedOpportunities, setSavedOpportunities] = useState<{role: string, likelihood: string, why: string}[]>(() => {
    try {
      const saved = localStorage.getItem("saved_ops");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Copied clipboard tooltip tracker
  const [showShareTooltip, setShowShareTooltip] = useState<string | null>(null);

  // PDF Export Modal State
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);

  // Check backend server status
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => console.log("Standard API diagnostics loading..."));
  }, []);

  // Sync state with layout tabs
  useEffect(() => {
    if (activeTab === "pm") {
      setResumeText(PRESET_RESUMES.pm.text);
      setUploaderRole(PRESET_RESUMES.pm.role);
      setSelectedSector("Product Management");
    } else if (activeTab === "dev") {
      setResumeText(PRESET_RESUMES.dev.text);
      setUploaderRole(PRESET_RESUMES.dev.role);
      setSelectedSector("Software Engineering & DevOps");
    } else if (activeTab === "data") {
      setResumeText(PRESET_RESUMES.data.text);
      setUploaderRole(PRESET_RESUMES.data.role);
      setSelectedSector("Data Science & AI");
    } else if (activeTab === "design") {
      setResumeText(PRESET_RESUMES.design.text);
      setUploaderRole(PRESET_RESUMES.design.role);
      setSelectedSector("Design & Creative Assets");
    } else if (activeTab === "marketing") {
      setResumeText(PRESET_RESUMES.marketing.text);
      setUploaderRole(PRESET_RESUMES.marketing.role);
      setSelectedSector("Growth Marketing & SEO");
    } else if (activeTab === "healthcare") {
      setResumeText(PRESET_RESUMES.healthcare.text);
      setUploaderRole(PRESET_RESUMES.healthcare.role);
      setSelectedSector("Healthcare & Clinical Ops");
    } else {
      setResumeText("");
      setUploaderRole("Staff Software Engineer");
    }
  }, [activeTab]);

  // Adjust salary expectation dynamically inside radar
  const handleSalaryAdjustment = (newVal: number) => {
    setDiagnosticData((prev) => {
      const { marketMin, marketMax } = prev.salary;
      const range = marketMax - marketMin;
      const percentile = Math.floor(((newVal - marketMin) / range) * 100);
      return {
        ...prev,
        salary: {
          ...prev.salary,
          current: newVal,
          percentile: Math.min(98, Math.max(2, percentile))
        }
      };
    });
  };

  // Launch live parsing simulation & load state
  const handleRunDiagnostic = async () => {
    setIsScanning(true);
    setScanStep(1);

    const stepTimes = [1000, 2200, 3100];
    setTimeout(() => setScanStep(2), stepTimes[0]);
    setTimeout(() => setScanStep(3), stepTimes[1]);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || "Standard demo credentials benchmark analyzer profile evaluation.",
          targetRole: uploaderRole
        })
      });

      if (!response.ok) {
        throw new Error("Diagnostic failed");
      }

      const parsedResult: DiagnosticResult = await response.json();
      
      // Delay dynamic presentation just a bit for smooth animated feedback
      setTimeout(async () => {
        setDiagnosticData(parsedResult);
        setIsScanning(false);
        setScanStep(0);
        setScanHistoryCount((prev) => prev + 1);

        // Persistent data capture: log query to backend SQL ledger
        try {
          await fetch("/api/db/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target_role: uploaderRole,
              industry_sector: selectedSector,
              match_score: parsedResult.matchScore,
              ats_score: parsedResult.metrics.atsScore
            })
          });
        } catch (e) {
          console.error("Failed to log persistent career query log:", e);
        }

        const centerView = document.getElementById("command-center-header");
        if (centerView) {
          centerView.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, stepTimes[2]);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsScanning(false);
        setScanStep(0);
      }, 1500);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setActiveTab("custom");
      setResumeText(`[Document File Upload: ${file.name}]\nAnalyzing credentials for premium profile development targeting ${uploaderRole}.\nIncludes custom technical history with 4+ years of workspace deliverable metrics.`);
    }
  };

  // BOOKMARK OPERATIONS
  const handleToggleBookmark = (op: {role: string, likelihood: string, why: string}) => {
    setSavedOpportunities((prev) => {
      const exists = prev.some((o) => o.role === op.role);
      let next;
      if (exists) {
        next = prev.filter((o) => o.role !== op.role);
      } else {
        next = [...prev, op];
      }
      try {
        localStorage.setItem("saved_ops", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleShareBlueprint = (roleName: string) => {
    try {
      navigator.clipboard.writeText(`https://career-intelligence.ai/blueprint/share?role=${encodeURIComponent(roleName)}`);
      setShowShareTooltip(roleName);
      setTimeout(() => setShowShareTooltip(null), 2000);
    } catch (e) {}
  };

  if (!currentUser) {
    return (
      <AuthPage 
        onSuccess={(user, confidence) => {
          setCurrentUser(user);
          setIsVerified(true);
          setBiometricConfidence(confidence);
          try {
            localStorage.setItem("auth_user", JSON.stringify(user));
            localStorage.setItem("biometric_verified", "true");
            localStorage.setItem("biometric_confidence", confidence.toString());
          } catch (e) {}
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-zinc-800 selection:bg-blue-200 selection:text-zinc-900 antialiased overflow-x-hidden relative font-sans">
      
      {/* 1. LinkedIn Styled Top Header Bar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-[#0a66c2] text-white flex items-center justify-center font-bold text-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer">
              in
            </div>
            <div className="border-l border-zinc-200 pl-3">
              <span className="text-xs sm:text-sm font-extrabold text-zinc-900 tracking-tight uppercase flex items-center gap-1.5 leading-none">
                AI Career Intelligence <span className="text-[9px] bg-blue-50 text-[#0a66c2] border border-blue-200 px-1.5 py-0.5 rounded font-black">PRO</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-bold block">LinkedIn &amp; Indeed Benchmark Platform</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2 border-r border-[#f4f2ee] pr-3 select-none">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0a66c2] via-purple-600 to-blue-500 text-white flex items-center justify-center font-black text-xs shadow-inner">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left text-[11px] leading-tight text-zinc-700">
                  <span className="font-bold block">{currentUser.name}</span>
                  <span className="text-zinc-550 block text-[9px] font-mono">{currentUser.email}</span>
                </div>
              </div>
            )}

            <div className="hidden md:flex items-center space-x-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full text-[10px] text-zinc-650 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Secure Session Verified</span>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-red-650 bg-red-50 border border-red-200 hover:bg-red-100 transition-all cursor-pointer active:scale-95"
            >
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* 2. Headline Core Description Section */}
      <section className="relative py-12 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text and Direct Diagnostic inputs */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0a66c2] text-xs font-bold uppercase tracking-wider mb-5 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Career Optimizer Engine</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-4">
                Don't just search job sites &mdash; <span className="text-[#0a66c2]">engineer your profile.</span>
              </h1>

              <p className="text-zinc-600 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed font-medium">
                Stop submitting blind resumes. We verify market benchmarks, target roles, and salary indexes to calibrate your semantic keyword density and uncover pivot pathways instantly.
              </p>

              {/* Responsive Setup Form */}
              <div className="bg-[#f4f2ee]/40 border border-zinc-250 rounded-2xl p-5 shadow-sm relative">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0a66c2]" />
                
                <div className="flex flex-col gap-1.5 mb-5 pb-4 border-b border-zinc-200">
                  <span className="text-[10px] uppercase tracking-wide font-black text-zinc-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] animate-pulse" />
                    Step 1: Choose Calibration Target Sector
                  </span>
                  
                  {/* Active target toggle presets */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-white p-1 border border-zinc-200 rounded-xl text-[10px] font-bold">
                    <button 
                      onClick={() => setActiveTab("pm")} 
                      className={`py-2 px-1 rounded-lg transition-all duration-200 text-center leading-tight border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'pm' 
                          ? 'bg-blue-50 text-[#0a66c2] border-blue-200 shadow-xs' 
                          : 'text-zinc-500 border-transparent hover:bg-zinc-50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Product PM</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("dev")} 
                      className={`py-2 px-1 rounded-lg transition-all duration-200 text-center leading-tight border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'dev' 
                          ? 'bg-blue-50 text-[#0a66c2] border-blue-200 shadow-xs' 
                          : 'text-zinc-500 border-transparent hover:bg-zinc-50'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>DevOps/Back</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("data")} 
                      className={`py-2 px-1 rounded-lg transition-all duration-200 text-center leading-tight border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'data' 
                          ? 'bg-blue-50 text-[#0a66c2] border-blue-200 shadow-xs' 
                          : 'text-zinc-500 border-transparent hover:bg-zinc-50'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Data Science</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("design")} 
                      className={`py-2 px-1 rounded-lg transition-all duration-200 text-center leading-tight border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'design' 
                          ? 'bg-blue-50 text-[#0a66c2] border-blue-200 shadow-xs' 
                          : 'text-zinc-500 border-transparent hover:bg-zinc-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>UI/UX Design</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("marketing")} 
                      className={`py-2 px-1 rounded-lg transition-all duration-200 text-center leading-tight border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'marketing' 
                          ? 'bg-blue-50 text-[#0a66c2] border-blue-200 shadow-xs' 
                          : 'text-zinc-500 border-transparent hover:bg-zinc-50'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Growth Mark</span>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab("healthcare")} 
                      className={`py-2 px-3 rounded-lg transition-all duration-200 text-center leading-tight border flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        activeTab === 'healthcare' 
                          ? 'bg-blue-50 text-[#0a66c2] border-blue-200 shadow-xs' 
                          : 'text-zinc-500 border-transparent hover:bg-zinc-50'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Healthcare</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Select target role */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        1. Spec Target Desired Position Name
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          value={uploaderRole}
                          onChange={(e) => {
                            setUploaderRole(e.target.value);
                            if (activeTab !== "custom") {
                              setActiveTab("custom");
                            }
                          }}
                          placeholder="e.g. Director of Operations, Systems Architect..."
                          className="w-full bg-white border border-zinc-300 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:border-[#0a66c2] outline-none shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Select industry sector */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                        2. Sector Categorization Vector
                      </label>
                      <select
                        value={selectedSector}
                        onChange={(e) => {
                          setSelectedSector(e.target.value);
                          if (activeTab !== "custom") {
                            setActiveTab("custom");
                          }
                        }}
                        className="w-full bg-white border border-zinc-300 rounded-xl py-2.5 px-3 text-xs font-semibold text-zinc-700 outline-none cursor-pointer focus:border-[#0a66c2] shadow-xs"
                      >
                        <option value="Product Management">Product Management</option>
                        <option value="Software Engineering & DevOps">Software Engineering & DevOps</option>
                        <option value="Data Science & AI">Data Science & AI</option>
                        <option value="Design & Creative Assets">Design & Creative Assets</option>
                        <option value="Growth Marketing & SEO">Growth Marketing & SEO</option>
                        <option value="Enterprise Sales & BizDev">Enterprise Sales & BizDev</option>
                        <option value="Finance & Valuations">Finance & Valuations</option>
                        <option value="Healthcare & Clinical Ops">Healthcare & Clinical Ops</option>
                      </select>
                    </div>
                  </div>

                  {/* Resume Content Input */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1 flex justify-between">
                      <span>3. Paste Bio Summary or Past CV Details</span>
                      <span className="text-[9.5px] text-zinc-400 normal-case">{resumeText.length} characters</span>
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        if (activeTab !== "custom") {
                          setActiveTab("custom");
                        }
                      }}
                      rows={3}
                      placeholder="Paste resume achievements, profile highlights, or system engineering summaries..."
                      className="w-full bg-white border border-zinc-300 rounded-xl p-3 text-xs font-medium text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#0a66c2] resize-none shadow-xs"
                    />
                  </div>

                  {/* Click trigger and file upload buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {/* Primary Glow Diagnostic CTAs */}
                    <button
                      onClick={handleRunDiagnostic}
                      disabled={isScanning}
                      className="flex-1 py-2.5 px-6 rounded-full bg-[#0a66c2] hover:bg-[#004b87] text-white font-bold text-xs sm:text-sm tracking-wide shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-center"
                    >
                      {isScanning ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Cpu className="w-4 h-4 text-emerald-350" />
                      )}
                      {isScanning ? "Analyzing Index..." : "Run Career Diagnostic Blueprint"}
                    </button>

                    {/* Drag Selector backup option */}
                    <label className="py-2.5 px-4 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50 cursor-pointer text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedFile ? selectedFile.name : "Choose File"}</span>
                      <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated file conversion visual element */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-full max-w-[420px] aspect-square rounded-2xl bg-white border border-zinc-200 p-6 flex flex-col justify-between overflow-hidden relative shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-xl" />
                
                {/* Header bar */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0a66c2] block animate-pulse" />
                    <span className="text-[10px] font-bold tracking-wide text-zinc-400 uppercase">
                      Profile Vector Analysis telemetry
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-[#0a66c2] border border-blue-200 px-2.5 py-0.5 rounded bg-blue-50 uppercase">
                    Core active
                  </span>
                </div>

                {/* Animated graphic representing the dissolving resume paper */}
                <div className="flex-1 flex items-center justify-center relative py-6">
                  <motion.div 
                    animate={isScanning ? {
                      y: [0, -8, 0],
                      scale: [1, 0.97, 1],
                      opacity: [1, 0.5, 0.2, 1],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    className="w-36 h-48 bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between shadow-xs relative z-10"
                  >
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-xs">
                        <FileText className="w-5 h-5 text-[#0a66c2]" />
                      </div>
                      <div className="w-3/4 h-2 bg-zinc-200 rounded" />
                      <div className="w-1/2 h-1.5 bg-zinc-200 rounded" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-1 bg-zinc-100 rounded" />
                      <div className="w-11/12 h-1 bg-zinc-100 rounded" />
                      <div className="w-5/6 h-1 bg-zinc-100 rounded" />
                      <div className="w-2/3 h-1 bg-zinc-100 rounded" />
                    </div>

                    <div className="flex justify-between items-center bg-white p-1.5 rounded-md border border-zinc-200 shadow-2xs">
                      <span className="text-[7.5px] font-bold font-mono text-zinc-400 uppercase">COMPATIBILITY</span>
                      <span className="text-[10px] font-black text-[#0a66c2] font-mono">84%</span>
                    </div>

                    <div className="absolute top-0 right-0 w-4 h-4 bg-white rounded-bl-lg border-b border-l border-zinc-200/80" />
                  </motion.div>

                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
                    <g className="opacity-40">
                      <line x1="80" y1="200" x2="200" y2="100" stroke="#0a66c2" strokeWidth="1" strokeDasharray={isScanning ? "3,3" : undefined} />
                      <line x1="100" y1="280" x2="200" y2="300" stroke="#0a66c2" strokeWidth="1" />
                      <line x1="280" y1="120" x2="200" y2="100" stroke="#a855f7" strokeWidth="1" />
                      <line x1="320" y1="260" x2="200" y2="300" stroke="#10b981" strokeWidth="1" strokeDasharray={isScanning ? "5,5" : undefined} />
                      <line x1="200" y1="100" x2="200" y2="300" stroke="#0a66c2" strokeWidth="1.5" />
                    </g>

                    <circle cx="200" cy="100" r="5" fill="#0a66c2" />
                    <circle cx="200" cy="300" r="5" fill="#10b981" />
                    <circle cx="80" cy="200" r="4" fill="#a1a1aa" />
                    <circle cx="100" cy="280" r="4" fill="#a1a1aa" />
                    <circle cx="280" cy="120" r="5" fill="#a855f7" />
                    <circle cx="320" cy="260" r="4" fill="#a1a1aa" />
                  </svg>

                  <div className="absolute bottom-4 left-4 bg-white border border-zinc-200 rounded-xl p-3 text-[10px] font-mono text-zinc-500 space-y-1.5 shadow-sm z-20 font-semibold">
                    <div className="text-zinc-800 font-extrabold font-sans">Verification Index</div>
                    <div>&bull; Filter Type: Requisition Match</div>
                    <div>&bull; Precision Mapped: 92% Core</div>
                    <div>&bull; Global Scans: 15,240+ completed</div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="border-t border-zinc-100 pt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 font-bold">
                  <span>ATS_ROUTING_COMPLIANCE: TRUE</span>
                  <span className="text-emerald-600 font-bold">SECURED ENGINE</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Futuristic Scan Diagnostic Progress Banner */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border-b border-blue-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold tracking-wide uppercase text-[#0a66c2]">
                <Cpu className="w-5 h-5 text-[#0a66c2] animate-spin" />
                <span>Generating Career Calibration Report Profile...</span>
              </div>
              
              <div className="text-[11px] font-mono font-bold text-zinc-500 h-5">
                {scanStep === 1 && "Aligning target role credentials with active database specifications..."}
                {scanStep === 2 && "Calibrating wage ranges and geographical percentage standards..."}
                {scanStep === 3 && "Evaluating unconventional pivot indices and secondary skill matrices..."}
              </div>

              <div className="w-full max-w-lg bg-zinc-200 rounded-full h-2 mx-auto overflow-hidden">
                <motion.div 
                  className="bg-[#0a66c2] h-full"
                  initial={{ width: "5%" }}
                  animate={{ width: scanStep === 1 ? "30%" : scanStep === 2 ? "70%" : "98%" }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The 'Career Command Center' (Dashboard Preview Area) */}
      <section className="py-14 bg-[#f4f2ee] relative" id="career-command-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* SECURE ONBOARDING BIOMETRIC GATING */}
          <AnimatePresence>
            {!isVerified && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-[#f4f2ee]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center rounded-3xl"
              >
                <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-large">
                  {/* Warning bar */}
                  <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200 max-w-lg mx-auto flex items-center justify-center gap-3 shadow-2xs">
                    <AlertCircle className="w-5 h-5 text-purple-750 animate-pulse" />
                    <span className="text-xs font-bold text-purple-800 uppercase tracking-wide font-sans">
                      Mandatory Core Identity Verification
                    </span>
                  </div>

                  {/* Biometric Scanner */}
                  <BiometricVerification 
                    onSuccess={(confidence) => {
                      setBiometricConfidence(confidence);
                      setIsVerified(true);
                      try {
                        localStorage.setItem("biometric_verified", "true");
                      } catch (e) {}
                    }} 
                    userEmail="ankurnegi68@gmail.com" 
                  />
                  
                  <p className="text-[11px] text-zinc-500 mt-4 max-w-md mx-auto font-sans leading-relaxed font-semibold">
                    Identity validation protects credential leakage. Fully processed locally via sandboxed camera standards.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Section title & EXPANSIONS Header block */}
          <div className="mb-8 flex flex-col md:flex-row md:items-baseline md:justify-between gap-4" id="command-center-header">
            <div className="max-w-2xl">
              <div className="flex items-center gap-1.5 text-xs text-[#0a66c2] font-semibold uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4 text-[#0a66c2]" />
                <span>Command Center Dashboard Workspace</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                Profile Calibration Blueprint
              </h2>
              <p className="text-zinc-650 text-[13.5px] mt-1 font-medium leading-relaxed">
                Interact with the dynamic gauge dials and salary sliders below to examine changing percentiles and optimize compensation standards.
              </p>
            </div>

            {/* Diagnostic tracker & PDF Export button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* PDF EXPORT ACTION TRIGGER */}
              <button
                onClick={() => setShowPDFModal(true)}
                className="py-1.5 px-3.5 rounded-full border border-[#0a66c2] text-[#0a66c2] hover:bg-blue-50 hover:text-[#004b87] font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                title="Generates high fidelity Printable Blueprint report document"
                id="export-pdf-report-btn"
              >
                <FileText className="w-3.5 h-3.5 text-[#0a66c2]" />
                <span>Export PDF Report</span>
              </button>

              <div className="bg-white border border-zinc-200 px-3.5 py-1.5 rounded-xl font-mono text-[10px] text-zinc-500 flex items-center space-x-1.5 font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse" />
                <span>Calibration Run #{scanHistoryCount}</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC TWO-COLUMN DESKTOP / MOBILE RESPONSIVE GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT MAIN AREA (8 cols): Charts area, ATS defects, unconventional pivot recommendations lists */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Overwritten Light Mode Charts Bento Grid (Staggered load-up) */}
              <CommandCenterCharts 
                data={diagnosticData} 
                onAdjustSalary={handleSalaryAdjustment}
              />

              {/* ATS Bulletins & Pivot Projections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. ATS Deficit Bulletins Card */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-purple-500" />
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-4 text-purple-700 font-bold text-xs uppercase tracking-wider font-sans">
                      <FileSearch className="w-4 h-4" />
                      <span>ATS Vocabulary Optimization Gaps</span>
                    </div>
                    
                    <div className="space-y-3.5">
                      {diagnosticData.atsInsights.map((insight, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl hover:border-zinc-300 transition-colors"
                        >
                          <div className="mt-0.5 p-1 rounded-full bg-purple-100 text-purple-700">
                            <AlertCircle className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-[11.5px] text-zinc-650 leading-relaxed font-semibold">
                            {insight}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-3 mt-5 flex items-center justify-between text-[9.5px] text-zinc-400 font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Compliant Standard
                    </span>
                    <span>No personal data stored</span>
                  </div>
                </div>

                {/* 2. Unconventional Pivot Projections Card with STATEFUL BOOKMARK STAR ACTIONS */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-4 text-emerald-800 font-bold text-xs uppercase tracking-wider font-sans">
                      <TrendingUp className="w-4 h-4" />
                      <span>Unconventional Pivot Opportunities</span>
                    </div>

                    <div className="space-y-3.5">
                      {diagnosticData.pivotOpportunities.map((op, idx) => {
                        const isSaved = savedOpportunities.some((s) => s.role === op.role);
                        return (
                          <div 
                            key={idx}
                            className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 hover:border-[#0a66c2]/30 transition-all shadow-2xs relative group/item"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-zinc-800 text-xs font-black truncate pr-4">{op.role}</span>
                              
                              <div className="flex items-center space-x-1.5 flex-shrink-0">
                                {/* Saved Bookmark Indicator tag */}
                                <span className={`text-[8.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  op.likelihood === "High" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-[#0a66c2]"
                                }`}>
                                  {op.likelihood}
                                </span>

                                {/* Bookmark toggle Button */}
                                <button
                                  onClick={() => handleToggleBookmark(op)}
                                  className="p-1 rounded-md bg-white border border-zinc-255 hover:bg-zinc-100 text-zinc-400 hover:text-amber-500 cursor-pointer transition-all"
                                  title={isSaved ? "Remove from bookmarks" : "Save Opportunity"}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-400 text-amber-500" : "text-zinc-400"}`} />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-zinc-550 text-[11.5px] font-sans font-medium leading-relaxed pr-10">
                              {op.why}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[9.5px] text-zinc-400 text-center mt-5 font-bold">
                    &bull; Anchored against regional Seattle, SF, and NYC wage indices.
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT SIDEBAR AREA (4 cols): Profile Card + SAVED OPPORTUNITIES SIDE PANEL */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* A. Professional Bio Overview Profile Card */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-16 bg-[#f4f2ee] border-b border-zinc-150" />
                
                {/* Profile Identity layout */}
                <div className="relative pt-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center font-extrabold text-[#0a66c2] text-xl mb-3 shadow-sm">
                    AN
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 flex items-center gap-1">
                    Ankur Negi 
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black" title="Verified Professional Account">✓</span>
                  </h3>
                  <p className="text-[10.5px] text-zinc-500 font-bold mt-0.5 font-mono">ankurnegi68@gmail.com</p>
                  
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    <span className="text-[10px] bg-blue-50 text-[#0a66c2] border border-blue-200 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      Classified preset: {uploaderRole}
                    </span>
                  </div>
                </div>

                {/* Quantitative statistics panel */}
                <div className="border-t border-zinc-150 mt-5 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-zinc-600 font-medium">
                    <span>Biometric Alignment Status</span>
                    <span className="text-emerald-700 font-mono font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active System verified
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 font-medium">
                    <span>Optical confidence rate</span>
                    <span className="text-zinc-800 font-bold font-mono">{(biometricConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 font-medium font-bold">
                    <span>Database Record log index</span>
                    <span className="text-[#0a66c2] font-mono">USR_REGISTRY_001</span>
                  </div>
                </div>
              </div>

              {/* B. NEW 'SAVED OPPORTUNITIES' SIDE-PANEL COMPONENT (BOOKMARKS REPOSITORY) */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm font-sans flex flex-col justify-between min-h-[340px] relative overflow-hidden" id="saved-opportunities-side-panel">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#0a66c2]" />
                
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-[#0a66c2] fill-blue-50/50" />
                      <h3 className="text-xs sm:text-sm font-black text-zinc-900 uppercase tracking-tight">
                        Saved Pivot Positions
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold font-mono bg-blue-50 text-[#0a66c2] px-2 py-0.5 rounded-full border border-blue-100">
                      Slots: {savedOpportunities.length}
                    </span>
                  </div>

                  {/* Bookmarks rendering checklist */}
                  {savedOpportunities.length === 0 ? (
                    <div className="py-12 px-4 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mx-auto text-zinc-400">
                        <Star className="w-5 h-5 text-zinc-300" />
                      </div>
                      <p className="text-[11px] font-semibold text-zinc-400 max-w-xs mx-auto leading-relaxed">
                        No positions bookmarked yet. Click the star icons (<Star className="w-3.5 h-3.5 inline text-zinc-400" />) next to recommendations to save items here!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      {savedOpportunities.map((op, sIdx) => (
                        <div 
                          key={sIdx}
                          className="p-3 bg-zinc-50 border border-zinc-150 hover:bg-zinc-100/50 rounded-xl space-y-2 transition-all relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[11.5px] font-extrabold text-zinc-800 leading-tight block truncate max-w-[170px]">{op.role}</span>
                              <span className="text-[8.5px] font-bold font-mono bg-[#f4f2ee] text-zinc-650 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">
                                Likelihood: {op.likelihood}
                              </span>
                            </div>
                            
                            {/* Delete Bookmark Button */}
                            <button
                              onClick={() => handleToggleBookmark(op)}
                              className="p-1 rounded bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-200 text-zinc-400 hover:text-red-600 cursor-pointer transition-colors"
                              title="Delete bookmark"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[10.5px] text-zinc-500 font-semibold leading-relaxed">
                            {op.why.length > 80 ? `${op.why.substring(0, 77)}...` : op.why}
                          </p>

                          {/* Clipboard share tools */}
                          <div className="pt-1 select-none relative">
                            <button
                              onClick={() => handleShareBlueprint(op.role)}
                              className="text-[9px] font-bold text-[#0a66c2] hover:text-[#004b87] underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Copy Share Link</span>
                            </button>

                            {/* Share tooltip popup inside card */}
                            {showShareTooltip === op.role && (
                              <span className="absolute bottom-5 left-0 text-[8.5px] font-bold font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded animate-bounce">
                                Link copied to clipboard!
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-100 pt-3 mt-4 text-[9px] text-zinc-400 text-center font-bold">
                  &bull; Saved tracks synchronize live dynamically inside localStorage.
                </div>
              </div>

            </div>

          </div>

          {/* Core DBMS Schema & Interactive Logs representation */}
          <div className="mt-12 pt-6 border-t border-zinc-200">
            <DBConsole />
          </div>

        </div>
      </section>

      {/* 5. Features Grid (SaaS core engines highlight) */}
      <section className="py-16 border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1 text-xs text-[#0a66c2] font-semibold uppercase tracking-wider mb-2">
              <Cpu className="w-4 h-4 text-[#0a66c2]" />
              <span>Full Career Calibration Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              A Structured Engine for Professional Calibration
            </h2>
            <p className="text-zinc-600 text-sm mt-2 leading-relaxed font-semibold">
              Leverage multi-modal algorithmic evaluation to optimize ATS scoring, identify alternative roles, and calibrate expected earnings.
            </p>
          </div>

          <FeaturesGrid />
        </div>
      </section>

      {/* 6. AI Advisor Dynamic Interactive Demo Section (Interactive Terminal + Playground) */}
      <section className="py-16 bg-[#f4f2ee] border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Context and instructional copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0a66c2] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#0a66c2]" />
                <span>Conversational Advisor Module</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-snug">
                Consult Your AI Career Companion
              </h2>

              <p className="text-zinc-650 text-sm leading-relaxed font-semibold">
                Engage in direct virtual queries with the career companion below. Ask questions regarding target role certs, learning tracks, or geographical wage parameters.
              </p>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-zinc-800 font-extrabold text-xs uppercase font-sans">
                  <Info className="w-4 h-4 text-[#0a66c2]" />
                  <span>Dialogue Instructions</span>
                </div>
                
                <ul className="space-y-2.5 text-xs text-zinc-600 font-sans list-disc pl-4 leading-relaxed font-medium">
                  <li>
                    Click the pulsing <strong className="text-zinc-800 font-bold">"RUN DIAGNOSTIC: Yes, build the plan"</strong> inside the chat bubble helper to authorize training syllabus formulations.
                  </li>
                  <li>
                    Incorporate queries like <strong className="text-zinc-800 font-bold">"Recommend certifications for a TPM role"</strong> to trigger real-time suggestions using the Gemini client models.
                  </li>
                </ul>
              </div>
            </div>

            {/* AIAdvisorChat component drawing */}
            <div className="lg:col-span-7">
              <AIAdvisorChat currentRole={diagnosticData.role} />
            </div>

          </div>
        </div>
      </section>

      {/* 7. Proof Points Bar */}
      <section className="py-12 bg-white border-b border-zinc-200 text-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl lg:text-3xl font-black text-[#0a66c2] tracking-tight">15k+</div>
              <div className="text-zinc-500 text-[10px] tracking-wider uppercase mt-1 font-bold">Profiles Parsed</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-purple-750 tracking-tight font-sans">98.4%</div>
              <div className="text-zinc-500 text-[10px] tracking-wider uppercase mt-1 font-bold">ATS Read Rate</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-emerald-700 tracking-tight">+$42k</div>
              <div className="text-zinc-500 text-[10px] tracking-wider uppercase mt-1 font-bold font-sans">Avg Wage Increase</div>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-zinc-800 tracking-tight">Systematic</div>
              <div className="text-zinc-500 text-[10px] tracking-wider uppercase mt-1 font-bold font-sans">Calibrated &amp; Mapped</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Elegant Footer */}
      <footer className="bg-zinc-900 py-12 text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-[#0a66c2] text-white flex items-center justify-center font-bold text-sm">
              in
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-sans">
              AI Career Intelligence Services Inc.
            </span>
            <span className="text-[10px] text-zinc-500">• © 2026</span>
          </div>

          <div className="flex gap-4 text-xs font-semibold">
            <a href="#career-command-center" className="hover:text-zinc-200 transition-colors">Command Center</a>
            <a href="#" className="hover:text-zinc-200 transition-colors">Privacy Agreement</a>
            <a href="#" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
              Developer Portals <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>
      </footer>

      {/* ==================== PROFESSIONAL PDF EXPORT MODAL & PRINTOUT DOSSIER ==================== */}
      <AnimatePresence>
        {showPDFModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs"
            onClick={() => setShowPDFModal(false)}
          >
            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.45 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto font-sans"
            >
              
              {/* PDF Preview Actions Header (Standard light layout action grid) */}
              <div className="border-b border-zinc-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-[#0a66c2] tracking-wider uppercase font-mono flex items-center gap-1.5 leading-none">
                    <FileText className="w-4 h-4 text-[#0a66c2]" />
                    <span>PDF Report Exporter Console</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1">Review the stylized layout below. Click "Download / Export PDF" to save or print natively.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="py-1.5 px-4 rounded-full bg-[#0a66c2] hover:bg-[#004b87] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download / Export PDF</span>
                  </button>
                  <button
                    onClick={() => setShowPDFModal(false)}
                    className="py-1.5 px-3 rounded-full border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              {/* ===================== ACTUAL PRINTABLE DOCUMENT SHEET GRID ===================== */}
              <div className="border border-zinc-300 rounded-xl p-6 bg-stone-50/50 shadow-inner max-h-[55vh] overflow-y-auto print:border-0 print:bg-white print:p-0">
                <div className="bg-white border border-zinc-200 p-8 rounded-lg shadow-sm print:shadow-none print:border-0 relative font-sans text-zinc-800" id="pdf-printable-dossier-node">
                  
                  {/* Decorative Header Banner */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0a66c2]" />
                  
                  {/* Report Main Header */}
                  <div className="flex justify-between items-start border-b border-zinc-300 pb-5 mb-6">
                    <div>
                      <div className="text-[10px] font-black text-[#0a66c2] tracking-wider uppercase font-mono leading-none mb-1">AI CAREER INTELLIGENCE PLATFORM</div>
                      <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-tight">DIAGNOSTIC CALIBRATION DOSSIER</h2>
                      <p className="text-[10px] text-zinc-500 font-medium font-mono mt-1">REQUISITION_BENCHMARK_TOKEN: #AID-2026-948502</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-zinc-900">Ankur Negi</div>
                      <div className="text-[9px] text-zinc-500">ankurnegi68@gmail.com</div>
                      <div className="text-[9px] font-bold text-emerald-705 uppercase font-mono mt-1 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded leading-none inline-block">SECURE SCAN VERIFIED</div>
                    </div>
                  </div>

                  {/* Core Assessments Summary Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center">
                      <span className="block text-[8px] font-black uppercase text-zinc-400 font-mono tracking-wider">Hiring Compatibility</span>
                      <span className="text-xl font-black text-zinc-900 mt-1 block">{diagnosticData.matchScore}%</span>
                      <span className="text-[8.5px] text-[#0a66c2] font-black uppercase font-mono">Predictive Index</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center">
                      <span className="block text-[8px] font-black uppercase text-zinc-400 font-mono tracking-wider">ATS Optimization Index</span>
                      <span className="text-xl font-black text-purple-700 mt-1 block">{diagnosticData.metrics.atsScore}%</span>
                      <span className="text-[8.5px] text-purple-700 font-bold uppercase font-mono">Structural Compliance</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center">
                      <span className="block text-[8px] font-black uppercase text-zinc-400 font-mono tracking-wider">Target Compensation</span>
                      <span className="text-xl font-black text-emerald-750 mt-1 block">${(diagnosticData.salary.current / 1000).toFixed(0)}k/yr</span>
                      <span className="text-[8.5px] text-emerald-750 font-bold uppercase font-mono">{diagnosticData.salary.percentile} Percentile Spectrum</span>
                    </div>
                  </div>

                  {/* Skills calibration comparative ASCII table / summary list */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0a66c2] border-b border-zinc-200 pb-1 mb-2.5">
                      I. Skills Calibration Spectrum &amp; Gaps
                    </h4>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                      <table className="w-full text-[10px] text-left">
                        <thead className="bg-[#f4f2ee] uppercase tracking-wider text-[8px] text-zinc-500 font-bold border-b border-zinc-200">
                          <tr>
                            <th className="py-1 px-2">Skill Component</th>
                            <th className="py-1 px-2 text-center">Your Rating</th>
                            <th className="py-1 px-2 text-center">Market Target</th>
                            <th className="py-1 px-2 text-right">Alignment Gap</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {diagnosticData.skills.map((s, idx) => (
                            <tr key={idx} className="hover:bg-zinc-200/20 font-medium">
                              <td className="py-1 px-2 font-bold text-zinc-800">{s.name}</td>
                              <td className="py-1 px-2 text-center font-mono">{s.user}%</td>
                              <td className="py-1 px-2 text-center font-mono">{s.market}%</td>
                              <td className="py-1 px-2 text-right font-mono font-bold">
                                {s.user >= s.market ? (
                                  <span className="text-emerald-700">+{s.user - s.market}%</span>
                                ) : (
                                  <span className="text-red-650">-{s.market - s.user}%</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ATS Insight deficit feedback lists */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0a66c2] border-b border-zinc-200 pb-1 mb-2.5">
                      II. Document VocabularyDeficit Mappings
                    </h4>
                    <div className="space-y-1.5 pl-1">
                      {diagnosticData.atsInsights.map((ins, idx) => (
                        <div key={idx} className="text-[10px] font-sans text-zinc-650 font-semibold leading-relaxed flex items-start gap-1.5">
                          <span className="text-blue-600 font-extrabold mt-0.5 flex-shrink-0">&bull;</span>
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended career pivot projections */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[#0a66c2] border-b border-zinc-200 pb-1 mb-2.5">
                      III. Non-Obvious Requisition Pivot Suggestions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {diagnosticData.pivotOpportunities.map((op, idx) => (
                        <div key={idx} className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black text-zinc-800 leading-none">
                            <span>{op.role}</span>
                            <span className="text-[8px] font-mono uppercase bg-blue-50 text-[#0a66c2] border border-blue-200 px-1 py-0.5 rounded">
                              {op.likelihood} Match
                            </span>
                          </div>
                          <p className="text-[8.5px] text-zinc-500 font-medium leading-relaxed font-sans mt-1">
                            {op.why}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disclaimer fine print */}
                  <div className="border-t border-zinc-200 pt-3 text-[8.5px] text-zinc-400 font-mono leading-relaxed mt-4">
                    <strong>DISCLAIMER</strong>: Mapped criteria coordinates represent predictive models backed by market transparency registers. Physical results depend on candidate interview accuracy and performance validation benchmarks.
                  </div>

                </div>
              </div>

              {/* Modal controls footer */}
              <div className="mt-6 flex justify-end gap-3 border-t border-zinc-150 pt-4">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-6 rounded-full bg-[#0a66c2] hover:bg-[#004b87] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Now</span>
                </button>
                <button
                  onClick={() => setShowPDFModal(false)}
                  className="py-2.5 px-4 rounded-full border border-zinc-300 hover:bg-zinc-150 text-zinc-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close Blueprint Report
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
