import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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
  DollarSign,
  User,
  Settings,
  Mail,
  Smartphone,
  BookMarked,
  Plus,
  X,
  MessageSquare,
  Briefcase
} from "lucide-react";
import { CommandCenterCharts } from "./components/CommandCenterCharts";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { AIAdvisorChat } from "./components/AIAdvisorChat";
import { BiometricVerification } from "./components/BiometricVerification";
import { DBConsole } from "./components/DBConsole";
import { AuthPage } from "./components/AuthPage";
import { DiagnosticResult, LearningRoadmap, RoadmapPhase } from "./types";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface LoginLog {
  img: string;
  name: string;
  email: string;
  timestamp: string;
  device: string;
  status: string;
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
  const [hasUploadedResume, setHasUploadedResume] = useState<boolean>(false);
  
  // Navigation: "dashboard" | "advisor" | "features" | "records" | "profile"
  const [activeNavTab, setActiveNavTab] = useState<"dashboard" | "advisor" | "features" | "records" | "profile">("dashboard");
  const [activeTab, setActiveTab] = useState<"pm" | "dev" | "data" | "design" | "marketing" | "healthcare" | "custom">("pm");
  
  // App state
  const [isValidDocs, setIsValidDocs] = useState<boolean>(true);
  const [validationErrorMessage, setValidationErrorMessage] = useState<string>("");
  
  const [jobsMatched, setJobsMatched] = useState([
    {
      id: "job-linkedin-1",
      title: "Senior Product Manager - Enterprise Platform",
      company: "Indeed Technologies",
      location: "San Francisco, CA (Hybrid)",
      matchScore: 84,
      sectors: ["Product Management", "B2B SaaS"],
      criticalSkills: ["Product Strategy", "A/B Testing & Analytics", "Agile Project Delivery"],
      calibrated: false
    },
    {
      id: "job-linkedin-2",
      title: "Backend Software Engineer - Distributed Systems",
      company: "CloudLabs Labs",
      location: "Austin, TX (Remote)",
      matchScore: 78,
      sectors: ["Software Development", "Infrastructure"],
      criticalSkills: ["System Architecture", "API Development", "CI/CD & DevOps"],
      calibrated: false
    },
    {
      id: "job-linkedin-3",
      title: "Senior Lead Data Analyst",
      company: "SaaSify Metrics",
      location: "New York, NY (Remote)",
      matchScore: 81,
      sectors: ["Data Science", "Analytics"],
      criticalSkills: ["SQL Data Wrangling", "Statistical Theory", "Data Visualization"],
      calibrated: false
    }
  ]);

  const [calibratingJobId, setCalibratingJobId] = useState<string | null>(null);

  const handleApplyJobCalibration = (jobId: string, jobTitle: string) => {
    setCalibratingJobId(jobId);
    
    setTimeout(() => {
      // 1. Mark job as calibrated and update score
      setJobsMatched((prev) => 
        prev.map((job) => 
          job.id === jobId 
            ? { ...job, matchScore: 96, calibrated: true } 
            : job
        )
      );
      
      // 2. Adjust primary diagnostic data coordinates
      setDiagnosticData((prev) => {
        // Boost skills user ratings to match market
        const updatedSkills = prev.skills.map((s) => ({
          ...s,
          user: Math.max(s.user, Math.round((s.market + 100) / 2))
        }));
        return {
          ...prev,
          matchScore: 96,
          metrics: {
            ...prev.metrics,
            atsScore: 95
          },
          skills: updatedSkills,
          atsInsights: [
            "Successfully optimized critical semantic terminology for: " + jobTitle,
            ...prev.atsInsights.filter((ins) => !ins.includes("Critically missing"))
          ]
        };
      });

      setCalibratingJobId(null);
      setLoginToast(`🎯 Calibration Complete: Resume optimized specifically for ${jobTitle}. Overall Match Index boosted to 96%!`);
    }, 1200);
  };

  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult>(INITIAL_BENCHMARK);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanHistoryCount, setScanHistoryCount] = useState(1);
  const [apiStatus, setApiStatus] = useState<{ status: string; aiEnabled: boolean } | null>(null);

  // Sector tags layout (Dynamic Input Conversion)
  const [sectorTags, setSectorTags] = useState<string[]>(["Product Management"]);
  const [newSectorTagInput, setNewSectorTagInput] = useState("");
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

  // Security Email Alert Alert Banner Toast State
  const [loginToast, setLoginToast] = useState<string | null>(null);

  const sendLoginNotificationEmail = (userEmail: string) => {
    console.log(`📩 Simulated secure dispatch: sendLoginNotificationEmail(${userEmail})`);
    setLoginToast(`📩 Security Alert: Login notification email dispatched to ${userEmail}`);
    setTimeout(() => {
      setLoginToast(null);
    }, 5500);
  };

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

  // Successful Biometric Approved Authentication Log Lists
  const [historyLogs, setHistoryLogs] = useState<LoginLog[]>(() => {
    try {
      const saved = localStorage.getItem("app_login_logs");
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Seed beautiful default pre-filled indices
    return [
      {
        img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
        name: "Ankur Negi",
        email: "ankurnegi68@gmail.com",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        device: "macOS Sequoia / Chrome 125.0",
        status: "Verified 98.4%"
      },
      {
        img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
        name: "Sarah Connor",
        email: "sarah.connor@cyberdyne.com",
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        device: "Linux Ubuntu 24.04 / Firefox",
        status: "Verified 99.1%"
      },
      {
        img: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80",
        name: "Thomas Anderson",
        email: "neo.anderson@metacortex.com",
        timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
        device: "Windows 11 / Edge",
        status: "Verified 97.5%"
      }
    ];
  });

  const handleSignOut = () => {
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("biometric_verified");
      localStorage.removeItem("biometric_confidence");
    } catch (e) {}
    setCurrentUser(null);
    setIsVerified(false);
    setActiveNavTab("dashboard");
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

  // 30/90/180-day Learning Roadmap states
  const [roadmapData, setRoadmapData] = useState<LearningRoadmap | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);
  const [selectedRoadmapSkill, setSelectedRoadmapSkill] = useState<string>("");
  const [activeRoadmapDayTab, setActiveRoadmapDayTab] = useState<"day30" | "day90" | "day180">("day30");

  // Sync selectedRoadmapSkill with identified gaps in diagnosticData
  useEffect(() => {
    if (diagnosticData && diagnosticData.skills && diagnosticData.skills.length > 0) {
      const gap = diagnosticData.skills.find(s => s.user < s.market);
      if (gap) {
        setSelectedRoadmapSkill(gap.name);
      } else {
        setSelectedRoadmapSkill(diagnosticData.skills[0].name);
      }
    }
  }, [diagnosticData]);

  const handleGenerateLearningRoadmap = async (skillToCalibrate?: string) => {
    const targetSkill = skillToCalibrate || selectedRoadmapSkill;
    if (!targetSkill) {
      setLoginToast("⚠️ Please select a skill target to generate a roadmap.");
      return;
    }
    
    setIsGeneratingRoadmap(true);
    setLoginToast(`🎓 AI Advisor: Compiling custom study roadmap for "${targetSkill}"...`);
    
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillName: targetSkill,
          targetRole: uploaderRole,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to contact roadmap service");
      }
      
      const data: LearningRoadmap = await response.json();
      setRoadmapData(data);
      setLoginToast(`🎯 Roadmap Ready! Interactive 30/90/180-day plan loaded for: ${targetSkill}`);
    } catch (error) {
      console.error("Failed to generate learning roadmap:", error);
      setLoginToast("❌ Connection error: Unable to load roadmap. Please try again.");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Roadmap checkable item map states
  const [roadmapChecklist, setRoadmapChecklist] = useState<{[key: string]: boolean}>({});

  const handleToggleRoadmapCheckbox = (key: string) => {
    setRoadmapChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Sync selectedSector state with sectorTags list
  useEffect(() => {
    if (sectorTags.length > 0) {
      setSelectedSector(sectorTags.join(", "));
    }
  }, [sectorTags]);

  // Sync state with preset layout buttons
  useEffect(() => {
    if (activeTab === "pm") {
      setResumeText(PRESET_RESUMES.pm.text);
      setUploaderRole(PRESET_RESUMES.pm.role);
      setSectorTags(["Product Management", "B2B SaaS Core", "Metrics Calibration"]);
    } else if (activeTab === "dev") {
      setResumeText(PRESET_RESUMES.dev.text);
      setUploaderRole(PRESET_RESUMES.dev.role);
      setSectorTags(["Software Engineering & DevOps", "TypeScript Node.js", "Microservice Pools"]);
    } else if (activeTab === "data") {
      setResumeText(PRESET_RESUMES.data.text);
      setUploaderRole(PRESET_RESUMES.data.role);
      setSectorTags(["Data Science & AI", "Python PyTorch", "Statistical Testing"]);
    } else if (activeTab === "design") {
      setResumeText(PRESET_RESUMES.design.text);
      setUploaderRole(PRESET_RESUMES.design.role);
      setSectorTags(["Design Systems", "Figma Design Standards", "Motion Frames Layout"]);
    } else if (activeTab === "marketing") {
      setResumeText(PRESET_RESUMES.marketing.text);
      setUploaderRole(PRESET_RESUMES.marketing.role);
      setSectorTags(["Performance Growth Marketing", "Programmatic SEO", "Google Telemetry"]);
    } else if (activeTab === "healthcare") {
      setResumeText(PRESET_RESUMES.healthcare.text);
      setUploaderRole(PRESET_RESUMES.healthcare.role);
      setSectorTags(["Clinical Operations", "EHR Compliance", "Hospital Workflow Safety"]);
    } else {
      setResumeText("");
      setUploaderRole("Staff Systems Architect");
      setSectorTags(["Custom Calibration Index"]);
    }
  }, [activeTab]);

  // Check backend server health status on render
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => console.log("Standard API diagnostics loading..."));
  }, []);

  // Dispatch initial security email banner on successful mount & verify
  useEffect(() => {
    if (currentUser && isVerified) {
      // Trigger login simulated alert toast
      const timer = setTimeout(() => {
        sendLoginNotificationEmail(currentUser.email);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, isVerified]);

  // Core sector tag compiler hooks
  const handleAddSectorTag = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanTag = newSectorTagInput.trim();
    if (cleanTag && !sectorTags.includes(cleanTag)) {
      setSectorTags([...sectorTags, cleanTag]);
      setNewSectorTagInput("");
      if (activeTab !== "custom") setActiveTab("custom");
    }
  };

  const handleRemoveSectorTag = (tag: string) => {
    setSectorTags(sectorTags.filter((t) => t !== tag));
    if (activeTab !== "custom") setActiveTab("custom");
  };

  // Adjust salary expectation dynamically
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

  // Dynamic Skill Ajustment Slider Recalculator ("What-If" Trajectory feedback loop)
  const handleModifySkillLevel = (skillName: string, newValue: number) => {
    setDiagnosticData((prev) => {
      const updatedSkills = prev.skills.map((s) => 
        s.name === skillName ? { ...s, user: newValue } : s
      );

      // Compute geometric average match differential based on updated skills
      let cumulativeRatio = 0;
      updatedSkills.forEach((s) => {
        // Alignment multiplier
        const ratio = s.user >= s.market ? 100 : 100 - (s.market - s.user);
        cumulativeRatio += ratio;
      });
      const coreSkillsAvg = Math.floor(cumulativeRatio / updatedSkills.length);
      
      // Calculate scaled score matched between ATS score boundaries
      const dynamicMatchScore = Math.min(99, Math.max(40, Math.floor((coreSkillsAvg + prev.metrics.atsScore) / 2)));

      return {
        ...prev,
        skills: updatedSkills,
        matchScore: dynamicMatchScore
      };
    });
  };

  // Run live parsing sequence simulation
  const handleRunDiagnostic = async () => {
    setIsScanning(true);
    setScanStep(1);
    setIsValidDocs(true);
    setValidationErrorMessage("");

    const stepTimes = [1000, 2000, 3000];
    setTimeout(() => setScanStep(2), stepTimes[0]);
    setTimeout(() => setScanStep(3), stepTimes[1]);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || "Standard demo credentials benchmark analyzer profile evaluation.",
          targetRole: uploaderRole,
          sector_vector: sectorTags.join(", ")
        })
      });

      if (!response.ok) {
        throw new Error("Diagnostic failed");
      }

      const parsedResult: DiagnosticResult = await response.json();
      
      // Keep skills synced with our active slider controls
      setTimeout(async () => {
        if (parsedResult.isValid === false) {
          setIsValidDocs(false);
          setValidationErrorMessage("CRITICAL DOCUMENT VALIDATION FAILURE: " + (parsedResult.atsInsights?.[1] || "The uploaded document is determined not to be a genuine resume. Standard processing was stopped and scores set to absolute lower bounds. Please replace the text with realistic career coordinates."));
          
          setDiagnosticData({
            ...parsedResult,
            role: uploaderRole
          });
          setIsScanning(false);
          setScanStep(0);
          setHasUploadedResume(true);
          setActiveNavTab("dashboard");
          return;
        }

        setDiagnosticData({
          ...parsedResult,
          // Overwrite with custom tag values if applied
          role: uploaderRole
        });
        setIsScanning(false);
        setScanStep(0);
        setScanHistoryCount((prev) => prev + 1);
        setHasUploadedResume(true); // Unlocks dashboard charts!

        // Persistent database capture log
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

        // Notify and switch to active Home view
        setActiveNavTab("dashboard");
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
      setResumeText(`[Document File Upload: ${file.name}]\nAnalyzing credentials for premium profile development targeting ${uploaderRole}.\nRegistered sector: ${sectorTags.join(", ")}.\nIncludes custom technical history with workspace deliverable metrics.`);
      setHasUploadedResume(true); // Unlocks dashboard charts!
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

  // Intercept and handle authenticated users from the Auth page
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

            // Build new history log item and prepend
            const newLogRecord: LoginLog = {
              img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
              name: user.name,
              email: user.email,
              timestamp: new Date().toISOString(),
              device: navigator.userAgent.includes("Mobile") ? "Apple iPhone / Safari Mobile" : "macOS Sequoia / Chrome 125.0",
              status: `Verified ${(confidence * 100).toFixed(1)}%`
            };
            const updatedLogs = [newLogRecord, ...historyLogs.filter((l) => l.email !== user.email)];
            setHistoryLogs(updatedLogs);
            localStorage.setItem("app_login_logs", JSON.stringify(updatedLogs));
          } catch (e) {}

          // Toast secure dispatcher
          sendLoginNotificationEmail(user.email);
        }}
      />
    );
  }

  // Animation stagger definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#f4f2ee] text-zinc-900 selection:bg-blue-600/10 font-sans antialiased overflow-x-hidden relative pb-28">
      {/* Subtle light ambient background depth */}
      <div className="absolute top-0 left-0 right-0 h-[380px] bg-gradient-to-b from-blue-50/50 via-zinc-100/30 to-transparent pointer-events-none" />
      
      {/* Secure simulated login notification popup banner */}
      <AnimatePresence>
        {loginToast && (
          <motion.div 
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-white border border-zinc-200 text-zinc-900 p-4 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-md select-none pointer-events-auto"
          >
            <div className="p-1.5 h-8 w-8 rounded-lg bg-blue-50 text-[#0a66c2] border border-blue-200 flex-shrink-0 flex items-center justify-center animate-pulse">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="text-[11px] font-mono tracking-widest text-[#0a66c2] uppercase font-black">SMTP TELEMETRY DISPATCHED</div>
              <p className="text-xs font-semibold leading-normal">{loginToast}</p>
            </div>
            <button onClick={() => setLoginToast(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer p-0.5">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Navigation Bar */}
      <header className="border-b border-zinc-200 bg-white/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 select-none">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0a66c2] to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
              ai
            </div>
            <div className="border-l border-zinc-200 pl-3">
              <span className="text-xs sm:text-sm font-extrabold text-[#0a66c2] tracking-widest uppercase flex items-center gap-2 leading-none">
                CAREER INTEGRITY <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-mono font-bold tracking-normal">PWA</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight block mt-0.5">Semantic AI Compliance Dashboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Session indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full text-[10px] text-zinc-700 font-bold select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Security: Verified</span>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center space-x-2 border-r border-zinc-200 pr-4 select-none">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 border border-zinc-200 text-white flex items-center justify-center font-black text-xs">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-[11px] leading-none space-y-0.5">
                <span className="font-bold text-zinc-800 block">{currentUser?.name}</span>
                <span className="text-zinc-400 block text-[9px] font-mono">{currentUser?.email}</span>
              </div>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-red-650 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer active:scale-95"
            >
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* 2. Headline Core Indicator Banner */}
      <section className="relative py-8 border-b border-zinc-200 bg-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-extrabold uppercase bg-blue-55 text-[#0a66c2] border border-blue-200 px-2 py-0.5 rounded">
              Verification Node active
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900">
              Candidate: <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0a66c2] to-purple-600">{currentUser?.name}</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Target Blueprint: <span className="font-bold text-zinc-805">{uploaderRole}</span> &bull; Sector: <span className="font-mono text-purple-700">{sectorTags.join(", ")}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-3 rounded-2xl md:max-w-xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center flex-shrink-0 animate-pulse">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-[10px] leading-tight font-sans">
              <span className="font-mono font-bold text-emerald-800 block uppercase">BIOMETRICS APPROVED</span>
              <span className="text-zinc-500 block font-mono text-[9px] mt-0.5">Confidence rating: {(biometricConfidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CORE TAB DISPATCH CONTENT LAYER ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: HOME DASHBOARD VIEW */}
        {activeNavTab === "dashboard" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 select-text"
          >
            {/* 1. Resume File Upload / Blueprint Presets Calibration Hub */}
            {!hasUploadedResume ? (
              <motion.div 
                variants={itemVariants} 
                className="bg-white border-2 border-dashed border-zinc-250 rounded-2xl p-8 shadow-sm flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto"
                id="talent-upload-hub"
              >
                <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0a66c2] border border-blue-100 flex items-center justify-center shadow-inner animate-bounce" style={{ animationDuration: "3.5s" }}>
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                    Analyze & Calibrate Your Career Capability Index
                  </h2>
                  <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                    Upload your actual resume document or select one of our premium, pre-indexed market sector templates below to unlock immediate skills calibration, dual career path calibration, hiring probability, and salary benchmarking.
                  </p>
                </div>

                {/* File Upload Box */}
                <div className="w-full max-w-sm">
                  <label className="flex flex-col items-center justify-center h-28 border border-zinc-250 bg-zinc-50 hover:bg-zinc-100/60 rounded-xl cursor-pointer transition-all p-4 border-dashed group hover:border-[#0a66c2]/40">
                    <span className="text-xs font-bold text-[#0a66c2] flex items-center gap-1.5 uppercase tracking-wide group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4 text-[#0a66c2]" />
                      Choose Resume File
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1.5 font-mono">Supports PDF, DOCX, TXT (Max 5MB)</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Preset Blueprints Selection */}
                <div className="w-full space-y-3 pt-5 border-t border-zinc-150">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-mono font-bold">
                    Or select a preconfigured target blueprint template to scan instantly:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {Object.keys(PRESET_RESUMES).map((k) => {
                      const p = PRESET_RESUMES[k as keyof typeof PRESET_RESUMES];
                      return (
                        <button
                          key={k}
                          onClick={() => {
                            setResumeText(p.text);
                            setUploaderRole(p.role);
                            setIsScanning(true);
                            setScanStep(1);
                            
                            const stepTimes = [800, 1600, 2400];
                            setTimeout(() => setScanStep(2), stepTimes[0]);
                            setTimeout(() => setScanStep(3), stepTimes[1]);
                            
                            setTimeout(() => {
                              const baseScore = k === "pm" ? 84 : k === "dev" ? 89 : k === "data" ? 82 : k === "design" ? 91 : k === "marketing" ? 78 : 86;
                              setDiagnosticData({
                                role: p.role,
                                matchScore: baseScore,
                                metrics: {
                                  atsScore: baseScore - 2,
                                  marketDemand: baseScore + 4,
                                  confidenceInterval: 92
                                },
                                skills: k === "pm" ? [
                                  { name: "Product Strategy", user: 85, market: 85 },
                                  { name: "A/B Testing & Analytics", user: 60, market: 80 },
                                  { name: "SQL & Data Analytics", user: 45, market: 75 },
                                  { name: "System Architecture", user: 70, market: 65 },
                                  { name: "Agile Project Delivery", user: 90, market: 80 },
                                  { name: "AI/ML Integration", user: 40, market: 85 }
                                ] : k === "dev" ? [
                                  { name: "System Architecture", user: 90, market: 80 },
                                  { name: "API Development", user: 95, market: 85 },
                                  { name: "Database Scaling", user: 80, market: 75 },
                                  { name: "React Frontend", user: 60, market: 70 },
                                  { name: "CI/CD & DevOps", user: 70, market: 80 },
                                  { name: "Security Standards", user: 75, market: 85 }
                                ] : k === "data" ? [
                                  { name: "Statistical Theory", user: 85, market: 90 },
                                  { name: "Python Scripting", user: 90, market: 85 },
                                  { name: "Machine Learning Models", user: 80, market: 85 },
                                  { name: "SQL Data Wrangling", user: 75, market: 80 },
                                  { name: "Data Visualization", user: 90, market: 70 },
                                  { name: "Big Data Systems", user: 50, market: 75 }
                                ] : k === "design" ? [
                                  { name: "Visual Interface Design", user: 95, market: 85 },
                                  { name: "Figma Component Libs", user: 95, market: 90 },
                                  { name: "Interaction Modeling", user: 90, market: 80 },
                                  { name: "User Research Tests", user: 75, market: 85 },
                                  { name: "Front-End Feasibility", user: 60, market: 70 },
                                  { name: "Design System Specs", user: 90, market: 80 }
                                ] : k === "marketing" ? [
                                  { name: "Performance Acquisition", user: 85, market: 80 },
                                  { name: "Google Analytics 4", user: 80, market: 85 },
                                  { name: "Programmatic SEO", user: 90, market: 75 },
                                  { name: "Lead Gen Optimization", user: 80, market: 80 },
                                  { name: "Social Ad Campaigns", user: 70, market: 80 },
                                  { name: "Conversion Rate Opt", user: 85, market: 85 }
                                ] : [
                                  { name: "Clinical Delivery safety", user: 90, market: 85 },
                                  { name: "HIPAA Regulations", user: 95, market: 95 },
                                  { name: "EHR Epic Integrations", user: 85, market: 80 },
                                  { name: "Staff Operational Schedules", user: 80, market: 85 },
                                  { name: "Workflow Congestion", user: 85, market: 75 },
                                  { name: "Resource Budgeting", user: 70, market: 80 }
                                ],
                                salary: {
                                  current: p.role === "Senior Product Manager" ? 125000 : p.role === "Backend Software Engineer" ? 135000 : p.role === "Lead Data Scientist" ? 142000 : p.role === "Lead UI/UX Designer" ? 120000 : p.role === "Director of Growth Marketing" ? 115000 : 130000,
                                  marketMin: 110000,
                                  marketAvg: 148000,
                                  marketMax: 195000,
                                  percentile: 32
                                },
                                pivotOpportunities: k === "pm" ? [
                                  { role: "Technical Product Manager (TPM)", likelihood: "High", why: "Strong system architecture rating coupled with solid agile delivery foundations." },
                                  { role: "VP of Product Engineering", likelihood: "Medium", why: "Strategic vision is ready; requires 1 year of direct software management scaling." }
                                ] : k === "dev" ? [
                                  { role: "DevOps Solutions Architect", likelihood: "High", why: "Strong microservice delivery scoring matches enterprise deployment standards." },
                                  { role: "Technical Lead Manager", likelihood: "High", why: "Agile delivery ratings coupled with extensive REST API ownership." }
                                ] : k === "data" ? [
                                  { role: "Quantitative Portfolio Analyst", likelihood: "Medium", why: "Statistical mastery matches financial model inputs beautifully." },
                                  { role: "ML Infrastructure Engineer", likelihood: "High", why: "Broad Python experience paired with regression algorithm fine-tuning." }
                                ] : k === "design" ? [
                                  { role: "Design Systems Engineer", likelihood: "High", why: "Figma specs combined with front-end code feasibility ratings." },
                                  { role: "Product Manager (Figma Eco)", likelihood: "Medium", why: "Figma workflow optimization skills translate to platform management." }
                                ] : k === "marketing" ? [
                                  { role: "Product Marketing Manager", likelihood: "High", why: "Strong performance statistics paired with feature monetization metrics." },
                                  { role: "SEO Technical Spec", likelihood: "High", why: "Programmatic search indexing scores match enterprise specifications." }
                                ] : [
                                  { role: "EHR Platform Consultant", likelihood: "High", why: "Epic systems proficiency paired with healthcare compliance expertise." },
                                  { role: "Chief of Patient Experience", likelihood: "Medium", why: "Clinical operations tracking indicators align with healthcare outcomes." }
                                ],
                                atsInsights: [
                                  "Optimized search parameters updated & indexed based on template alignment.",
                                  "Format is scan-friendly, clean and fully responsive.",
                                  "Calibrated skills spectrum compared successfully against active market roles."
                                ]
                              });
                              setSectorTags(k === "pm" ? ["Product Management"] : k === "dev" ? ["Software Development"] : k === "data" ? ["Data Science"] : k === "design" ? ["Product Design"] : k === "marketing" ? ["Digital Marketing"] : ["Healthcare Administration"]);
                              setIsScanning(false);
                              setScanStep(0);
                              setHasUploadedResume(true);
                            }, stepTimes[2]);
                          }}
                          className="py-2 px-3 bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 font-bold text-xs select-none rounded-xl cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{p.role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                variants={itemVariants}
                className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2 bg-blue-50 text-[#0a66c2] border border-blue-100 rounded-xl">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 leading-tight">Active Calibration Verified</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Your profile model aligns with <span className="font-semibold text-zinc-700">{uploaderRole}</span> requisitions.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setHasUploadedResume(false);
                    setResumeText("");
                    setSelectedFile(null);
                  }}
                  className="py-1.5 px-3.5 text-xs text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors self-start sm:self-center font-bold"
                >
                  Reset Active Resume Scanner
                </button>
              </motion.div>
            )}

            {/* Stats Summary Bento Core Cards grid: single-column stack on mobile, Bento on desktop */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative transition-opacity duration-300 ${!hasUploadedResume ? "opacity-35 pointer-events-none select-none" : ""}`}>
              
              {!hasUploadedResume && (
                <div className="absolute inset-x-0 top-1/3 mx-auto z-10 flex items-center justify-center max-w-sm pointer-events-auto select-none">
                  <div className="bg-zinc-900 text-white font-mono text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-xl border border-zinc-700 shadow-2xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>Resume Upload Required</span>
                  </div>
                </div>
              )}

              {/* Card 1: Overall Readiness compatibility (Circular ring metrics) */}
              <motion.div variants={itemVariants} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-900">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/15 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 font-bold block mt-1">
                      Compatibility Ratio
                    </span>
                    <Layers className="w-4 h-4 text-[#0a66c2]" />
                  </div>
                  <h3 className="text-lg font-black text-zinc-950 mt-2">Hiring Probability</h3>
                  <p className="text-xs text-zinc-500 mt-1">Predictive alignment score mapped against live job site keywords datasets.</p>
                </div>

                <div className="py-6 flex items-center justify-center relative">
                  {/* Glowing Circular Ring Gauge */}
                  <div className="relative w-32 h-32 flex items-center justify-center select-none">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#f4f2ee" strokeWidth="8" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="#0a66c2" strokeWidth="8" fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * (hasUploadedResume ? diagnosticData.matchScore : 0)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-zinc-900 font-mono leading-none">{hasUploadedResume ? diagnosticData.matchScore : 0}%</span>
                      <span className="text-[9px] uppercase tracking-wider text-[#0a66c2] font-mono font-bold mt-1">Match Index</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-150 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase font-black">
                  <span>ATS compliance: {hasUploadedResume ? diagnosticData.metrics.atsScore : 0}%</span>
                  <span className="text-emerald-700">Optimum Grade</span>
                </div>
              </motion.div>

              {/* Card 2: Summary Radar Chart details - Skills Calibration */}
              <motion.div 
                variants={itemVariants} 
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden md:col-span-1 lg:col-span-2 flex flex-col justify-between text-zinc-900 group transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                      Skill Alignments Graph
                    </span>
                    <div className="flex items-center gap-1 bg-[#f4f2ee] border border-zinc-200 text-[9.5px] text-zinc-650 px-2 py-0.5 rounded-full font-mono font-bold">
                      <span>Interactive View</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-zinc-950 mt-2 flex items-center gap-2">
                    <span>Skills Calibration</span>
                    <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Compare your profile index against aggregated live target market skills benchmarks.
                  </p>
                </div>

                <div className="h-60 mt-4 select-none">
                  {hasUploadedResume ? (
                    <CommandCenterCharts 
                      data={diagnosticData}
                      onAdjustSalary={handleSalaryAdjustment}
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-50 border border-zinc-200 border-dashed rounded-xl flex items-center justify-center text-zinc-400 italic text-xs font-medium">
                      Calibrated metrics locked — Upload a resume to view radar telemetry
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Card 2.1: Salary Benchmarking (Salary negociación range slider) */}
              <motion.div 
                variants={itemVariants}
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#10B981] font-bold block mt-1">
                      Wage Index Aligner
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-full font-bold font-mono">
                      {diagnosticData.salary.percentile} Percentile Spectrum
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-zinc-950 mt-2 flex items-center gap-1.5">
                    <span>Salary Benchmarking</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Drag the slider to define your desired expectation and check standard salary indexing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 my-5 space-y-4">
                  <div className="text-center font-mono select-none">
                    <span className="block text-[10px] uppercase text-zinc-400 tracking-wider font-bold">Desired Compensation Pin</span>
                    <span className="text-2xl font-black text-zinc-950 tracking-tight font-sans block mt-1">
                      ${(diagnosticData.salary.current).toLocaleString()}/yr
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <input 
                      type="range"
                      min={diagnosticData.salary.marketMin}
                      max={diagnosticData.salary.marketMax}
                      step="2500"
                      value={diagnosticData.salary.current}
                      onChange={(e) => handleSalaryAdjustment(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-200 rounded-lg cursor-pointer outline-none accent-[#0a66c2]"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-400 font-mono font-bold select-none">
                      <span>Min: ${(diagnosticData.salary.marketMin / 1000).toFixed(0)}k</span>
                      <span>Avg: ${(diagnosticData.salary.marketAvg / 1000).toFixed(0)}k</span>
                      <span>Max: ${(diagnosticData.salary.marketMax / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-150 pt-3 text-[10px] font-mono text-zinc-400 uppercase font-black block text-center">
                  <span>Current index: ${(diagnosticData.salary.current / 1000).toFixed(0)}k/yr</span>
                </div>
              </motion.div>

              {/* Card 2.2: Dual Career Path Calibrator (What-If skill sliders) */}
              <motion.div 
                variants={itemVariants}
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden md:col-span-1 lg:col-span-2 flex flex-col justify-between text-zinc-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#a855f7] font-bold block mt-1">
                      Interactive Calibrator
                    </span>
                    <div className="flex items-center gap-1 bg-[#f5f3ff] border border-purple-200 text-[9.5px] text-[#a855f7] px-2 py-0.5 rounded-full font-mono font-bold">
                      <Sparkles className="w-3 h-3 text-purple-600 animate-pulse" />
                      <span>LIVE PREVIEW OUTCOMES</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-zinc-950 mt-2 flex items-center gap-2">
                    <span>Dual Career Path Calibrator</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Adjust individual skill ratings below to instantly test alternative trajectory matches and update metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {diagnosticData.skills.map((s, idx) => (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-zinc-800 tracking-tight">{s.name}</span>
                        <span className="font-mono text-[9px] text-[#0a66c2] font-black">
                          {s.user >= s.market ? `Alignment OK` : `Deficit -${s.market - s.user}%`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={s.user}
                          className="flex-1 h-1 rounded-full cursor-pointer bg-zinc-200 outline-none accent-[#0a66c2]"
                          onChange={(e) => handleModifySkillLevel(s.name, parseInt(e.target.value))}
                        />
                        <span className="font-mono text-xs font-bold text-zinc-700 w-8 text-right select-none">{s.user}%</span>
                      </div>

                      <div className="flex justify-between text-[8.5px] font-mono text-zinc-400 font-semibold select-none">
                        <span>Adjusted: {s.user}%</span>
                        <span>Market Target: {s.market}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-150 flex justify-between items-center bg-white">
                  <span className="text-[10px] font-mono text-zinc-400">Average alignment calibrated</span>
                  <span className="text-emerald-700 font-mono text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Sync Active</span>
                  </span>
                </div>
              </motion.div>

              {/* Card 3: Saved/Bookmarked Opportunities list */}
              <motion.div variants={itemVariants} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-900">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                      Career bookmarks
                    </span>
                    <Star className="w-4 h-4 text-yellow-500 animate-bounce" style={{ animationDuration: "3s" }} />
                  </div>
                  <h3 className="text-lg font-black text-zinc-950 mt-2">Saved Pivots</h3>
                  <p className="text-xs text-zinc-500 mt-1">Bookmark high-probability pivot choices to follow later.</p>
                </div>

                <div className="my-4 flex-1 overflow-y-auto max-h-56 space-y-2.5 pr-1 mt-4">
                  {savedOpportunities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-400">
                      <BookMarked className="w-8 h-8 opacity-20 mb-2 text-zinc-400" />
                      <p className="text-[11px] font-medium leading-normal">No bookmarked opportunities. Visit Features or click diagnostic outputs to save!</p>
                    </div>
                  ) : (
                    savedOpportunities.map((op, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1 relative group">
                        <button 
                          onClick={() => handleToggleBookmark(op)}
                          className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-xs font-bold text-zinc-850 pr-6 leading-tight flex items-center gap-1.5">
                          <span>{op.role}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">{op.likelihood}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-sans mt-1">{op.why}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-150 pt-3 text-[10px] font-mono text-zinc-400 uppercase font-black block text-center">
                  <span>Total saved paths: {savedOpportunities.length}</span>
                </div>
              </motion.div>

              {/* Card 4: Recent profile interactions */}
              <motion.div variants={itemVariants} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between text-zinc-900 md:col-span-1 lg:col-span-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#10B981] font-bold block">
                      Live interactions log
                    </span>
                    <RefreshCw className="w-4 h-4 text-[#10B981] animate-spin" style={{ animationDuration: "6s" }} />
                  </div>
                  <h3 className="text-lg font-black text-zinc-950 mt-1.5">Market Telemetry feed</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Automated web scraping trackers mapping employer activity scores on your sectors.</p>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl leading-normal text-xs font-semibold text-zinc-850">
                    <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <span className="text-zinc-800 font-bold">Google recruitment dashboard</span> crawled your sector tags <span className="text-[#0a66c2]">"{sectorTags.slice(0, 2).join(", ")}"</span>.
                      <span className="block text-[10px] text-zinc-400 font-mono mt-0.5 font-normal">Telemetry log ID: #REQR-43905 (2 hours ago)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl leading-normal text-xs font-semibold text-zinc-850">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="text-zinc-800 font-bold">Semantic density alignment calibration successful</span> &mdash; resume mismatch score reduced by <span className="text-emerald-700 font-extrabold">+12.5%</span>!
                      <span className="block text-[10px] text-zinc-400 font-mono mt-0.5 font-normal">Logger ID: #CALB-39294 (4 hours ago)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl leading-normal text-xs font-semibold text-zinc-850">
                    <span className="h-2 w-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0 animate-ping" style={{ animationDuration: "3s" }} />
                    <div>
                      <span className="text-zinc-800 font-bold">Pivot blueprint registered</span> &mdash; Added <span className="text-purple-700 font-extrabold">"{diagnosticData.pivotOpportunities[0]?.role || "Technical Lead Manager"}"</span> to compatibility queue list.
                      <span className="block text-[10px] text-zinc-400 font-mono mt-0.5 font-normal">Logger ID: #PVOT-90294 (Just now)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-150 flex justify-between items-center bg-white">
                  <button 
                    onClick={() => setShowPDFModal(true)}
                    className="py-1.5 px-4 rounded-full bg-[#0a66c2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export High-Fidelity PDF Report</span>
                  </button>
                  <span className="text-[10px] text-zinc-400 font-mono">Scan token: #AID-{scanHistoryCount}94A</span>
                </div>
              </motion.div>

            </div>

            {/* Non-obvious pivot projections widgets inside Home */}
            <div className={`bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative ${!hasUploadedResume ? "opacity-35 pointer-events-none select-none" : ""}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-950">Suggested Dual Career Pathways</h3>
                  <p className="text-xs text-zinc-500">Identified dynamically by our micro-semantic AI matching analyzer.</p>
                </div>
                <Sparkles className="w-5 h-5 text-purple-700 font-bold" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosticData.pivotOpportunities.map((op, idx) => {
                  const isSaved = savedOpportunities.some((s) => s.role === op.role);
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start leading-none gap-2">
                          <span className="text-sm font-bold text-zinc-850 leading-tight block">{op.role}</span>
                          <span className="text-[9px] font-mono uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">{op.likelihood} Probability</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed font-sans mt-2">{op.why}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleToggleBookmark(op)}
                          className={`py-1 px-3 text-[10px] font-bold rounded-full border cursor-pointer select-none transition-all flex items-center gap-1.5 ${
                            isSaved 
                              ? "bg-yellow-50 text-yellow-600 border-yellow-250" 
                              : "bg-white border-zinc-200 hover:border-zinc-350 text-zinc-600"
                          }`}
                        >
                          <Star className={`w-3 h-3 ${isSaved ? "fill-yellow-550 text-yellow-500" : ""}`} />
                          <span>{isSaved ? "Saved" : "Bookmark Pivot"}</span>
                        </button>

                        <button
                          onClick={() => handleShareBlueprint(op.role)}
                          className="py-1 px-3 text-[10px] font-semibold rounded-full border bg-white border-zinc-200 hover:border-zinc-350 text-zinc-500 flex items-center gap-1.5 transition-all cursor-pointer select-none"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{showShareTooltip === op.role ? "Copied!" : "Share Path"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zero-Hallucination Warning Alert Box (Shows if doc validation failed) */}
            {!isValidDocs && (
              <div className="bg-amber-50 border border-amber-205 rounded-2xl p-5 shadow-inner text-amber-900 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-700 mt-0.5 flex-shrink-0 animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-amber-950 uppercase tracking-tight">Zero-Hallucination Model Sandbox Restriction Active</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {validationErrorMessage || "Your uploaded text failed our algorithmic genuine resume checks. Experience headers, education indexes, or typical professional structural tags were absent in the parser sequence. Direct match calibrations have been secured between safe 0 to 10 limits only to prevent metric hallucinative drift."}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-amber-600 mt-2">
                    ✓ Code Enforcement System Integrity Protocol Activated. Please proceed to the "Features" tab and provide full professional credentials to resume normal calculations.
                  </p>
                </div>
              </div>
            )}

            {/* Real-Time Dynamic Job Matching Feed */}
            <div className={`space-y-4 ${!hasUploadedResume ? "opacity-35 pointer-events-none select-none" : ""}`}>
              <div className="flex justify-between items-center border-b border-zinc-150 pb-2 mb-4">
                <div>
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                    <span>Target Market Matching Feed</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#0a66c2] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-bold">Real-time Feed</span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">Auto-scraped vacancies matching your specific sector tagging and required skill coordinates.</p>
                </div>
                <Briefcase className="w-5 h-5 text-[#0a66c2]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {jobsMatched.map((job) => (
                  <div key={job.id} className="bg-white border border-zinc-200 hover:border-[#0a66c2]/40 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between group transition-all duration-300">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-zinc-100 group-hover:bg-[#0a66c2] transition-colors" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start leading-none gap-2">
                        <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">{job.company}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${job.calibrated ? "bg-emerald-50 text-emerald-700 border border-emerald-250" : "bg-blue-50 text-[#0a66c2] border border-blue-200"}`}>
                          {job.matchScore}% Match
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-sm text-zinc-950 leading-tight block group-hover:text-[#0a66c2] transition-colors">{job.title}</h4>
                      <p className="text-[11px] text-zinc-400 font-bold block">{job.location}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.sectors.map((sec) => (
                          <span key={sec} className="bg-zinc-50 border border-zinc-150 text-[9px] font-mono font-semibold text-zinc-550 px-1.5 py-0.5 rounded-md">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-100">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-mono font-bold block">Critical skills calibration bounds:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {job.criticalSkills.map((sk) => (
                            <span key={sk} className="bg-purple-50 text-purple-700 border border-purple-150 text-[9px] font-mono font-semibold px-2 py-0.5 rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyJobCalibration(job.id, job.title)}
                        disabled={calibratingJobId !== null || job.calibrated}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold font-mono tracking-wider transition-all select-none flex items-center justify-center gap-1.5 ${
                          job.calibrated 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default shadow-none" 
                            : "bg-zinc-50 hover:bg-zinc-100 text-[#0a66c2] border border-zinc-200 hover:border-zinc-350 cursor-pointer shadow-xs"
                        }`}
                      >
                        {calibratingJobId === job.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-[#0a66c2]" />
                            <span>CALIBRATING BLUEPRINT...</span>
                          </>
                        ) : job.calibrated ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-650" />
                            <span>CALIBRATED (96% MATCH)</span>
                          </>
                        ) : (
                          <>
                            <Cpu className="w-3.5 h-3.5 text-[#0a66c2]" />
                            <span>ONE-CLICK CALIBRATE</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* VIEW 2: CORE AI FEATURES TAB (ATS Optimizer + What-If traj + Salary negation) */}
        {activeNavTab === "features" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 select-text"
          >
            
            {/* Bento box double column grid spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (7 Columns): ATS Keyword & Semantic optimization input */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-[#111827]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-md space-y-5">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl" />
                  
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      ATS KEYWORD DENSITY ALIGNER
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1">Semantic Keyword Optimization</h3>
                    <p className="text-xs text-slate-400 mt-1">Paste your professional history text and adjust the target coordinates below.</p>
                  </div>

                  {/* Built-in quick preset loader chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 block font-mono">Apply Blueprint Demo Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(PRESET_RESUMES).map((k) => (
                        <button
                          key={k}
                          onClick={() => setActiveTab(k as any)}
                          className={`py-1.5 px-3 rounded-xl border font-bold text-xs select-none transition-all cursor-pointer ${
                            activeTab === k 
                              ? "bg-gradient-to-r from-blue-500 to-indigo-700 text-white border-transparent" 
                              : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {PRESET_RESUMES[k as keyof typeof PRESET_RESUMES].role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input form parameters */}
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Desired Target Role */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Desired Position Name</label>
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={uploaderRole}
                            onChange={(e) => {
                              setUploaderRole(e.target.value);
                              if (activeTab !== "custom") setActiveTab("custom");
                            }}
                            placeholder="e.g. Director of Infrastructure, Systems Engineer..."
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Sector Categorization Vector with dynamic input chips conversion */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Sector Categorization Vector</label>
                        <form onSubmit={handleAddSectorTag} className="relative flex items-center">
                          <input
                            type="text"
                            value={newSectorTagInput}
                            onChange={(e) => setNewSectorTagInput(e.target.value)}
                            placeholder="Add industry tag & hit Enter..."
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-xs font-semibold text-slate-200 outline-none focus:border-blue-500 transition-all shadow-inner"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleAddSectorTag()}
                            className="absolute right-2 p-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/20 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>

                    </div>

                    {/* Sector tag chips view */}
                    {sectorTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-950/20 border border-slate-850">
                        {sectorTags.map((tag) => (
                          <span key={tag} className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold select-none tracking-tight">
                            <span>{tag}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSectorTag(tag)}
                              className="text-blue-500 hover:text-blue-300 font-black ml-1 cursor-pointer outline-none"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Resume Details Copybox */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 font-mono">
                        <span>Paste Bio Summary or Past CV Details (STRICTLY EDITABLE)</span>
                        <span className="text-slate-500 text-[9px]">{resumeText.length} characters</span>
                      </div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => {
                          setResumeText(e.target.value);
                          if (activeTab !== "custom") setActiveTab("custom");
                        }}
                        rows={4}
                        placeholder="Paste past CV metrics, technical achievements, or summary statements here..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs font-semibold text-slate-200 focus:border-blue-500 outline-none resize-none shadow-inner leading-relaxed min-h-[100px] pointer-events-auto"
                      />
                    </div>

                    {/* Submit levers with manual upload selector fallback */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        onClick={handleRunDiagnostic}
                        disabled={isScanning}
                        className="flex-1 py-3 px-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-98 disabled:opacity-50 transition-all select-none"
                      >
                        {isScanning ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Cpu className="w-4 h-4 text-emerald-300 animate-pulse" />
                        )}
                        <span>{isScanning ? "ALIGNING PROFILE BLUEPRINT..." : "Run AI Profile Diagnostic Aligner"}</span>
                      </button>

                      <label className="py-3 px-5 rounded-full border border-slate-800 bg-slate-950 hover:bg-slate-900 cursor-pointer text-xs font-bold text-slate-350 flex items-center justify-center gap-2 transition-colors select-none">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>{selectedFile ? selectedFile.name : "Choose CV File"}</span>
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

                {/* Gaps results card (ATS insights results) */}
                <div className="bg-[#111827]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
                  <h4 className="text-[10px] font-mono tracking-widest text-[#10B981] font-black uppercase flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ATS KEYWORD GAPS &amp; STRUCTURAL DEFICITS</span>
                  </h4>

                  <div className="space-y-4">
                    {diagnosticData.atsInsights.map((insight, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-slate-950/20 border border-slate-850">
                        <div className="h-5 w-5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center flex-shrink-0 font-bold text-xs select-none">
                          !
                        </div>
                        <p className="text-xs text-slate-305 font-semibold leading-relaxed font-sans">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (5 Columns): "What-If" Trajectory Simulator & Salary leverage */}
              <div className="lg:col-span-5 space-y-6">

                {/* Trajectory Simulator Card */}
                <div className="bg-[#111827]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-purple-400 font-bold block">
                      WHAT-IF PATHWAY ENGINE
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">"What-If" Career Trajectory Simulator</h3>
                    <p className="text-xs text-slate-400 mt-1">Adjust individual skill ratings below to instantly test alternative trajectory matches.</p>
                  </div>

                  {/* Skills sliders list */}
                  <div className="space-y-4 mt-6">
                    {diagnosticData.skills.map((s, idx) => (
                      <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-950/30 border border-slate-850/80">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">{s.name}</span>
                          <span className="font-mono text-[10px] text-purple-400 font-black">
                            {s.user >= s.market ? `Alignment OK` : `Deficit -${s.market - s.user}%`}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={s.user}
                            onChange={(e) => handleModifySkillLevel(s.name, parseInt(e.target.value))}
                            className="flex-1 accent-purple-500 h-1 rounded-full cursor-pointer bg-slate-800 outline-none"
                          />
                          <span className="font-mono text-[11px] font-bold text-slate-400 w-8 text-right select-none">{s.user}%</span>
                        </div>

                        <div className="flex justify-between text-[9px] font-mono text-slate-500 font-bold select-none">
                          <span>Adjusted: {s.user}%</span>
                          <span>Market Benchmark Target: {s.market}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-550">Average Alignment Calibrated</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold animate-pulse">✓ Live Update Ready</span>
                  </div>
                </div>

                {/* Salary Negotiation Workspace */}
                <div className="bg-[#111827]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      WAGE INDEX MATRIX
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">Salary Negotiation Calibration</h3>
                    <p className="text-xs text-slate-400 mt-1">Drag the slider to define your desired expectation and check standard ratios.</p>
                  </div>

                  {/* Desired Expectation Slider */}
                  <div className="p-4 rounded-xl bg-[#090e18] border border-slate-850 my-5 space-y-4">
                    <div className="text-center font-mono select-none">
                      <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Desired Compensation Pin</span>
                      <span className="text-2xl font-black text-white tracking-tight font-sans block mt-1">${(diagnosticData.salary.current).toLocaleString()}/yr</span>
                      <span className="text-[10.5px] text-emerald-400 font-bold block font-mono mt-0.5">{diagnosticData.salary.percentile} Percentile Spectrum</span>
                    </div>

                    <div className="space-y-1.5">
                      <input 
                        type="range"
                        min={diagnosticData.salary.marketMin}
                        max={diagnosticData.salary.marketMax}
                        step="2500"
                        value={diagnosticData.salary.current}
                        onChange={(e) => handleSalaryAdjustment(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer outline-none"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold select-none">
                        <span>Min: ${(diagnosticData.salary.marketMin / 1000).toFixed(0)}k</span>
                        <span>Avg: ${(diagnosticData.salary.marketAvg / 1000).toFixed(0)}k</span>
                        <span>Max: ${(diagnosticData.salary.marketMax / 1000).toFixed(0)}k</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl leading-normal text-[11px] text-slate-400 font-medium">
                    <span className="font-bold text-slate-200 block mb-1">💡 Professional Leverage Advice:</span>
                    "Leverage your validated match indices as objective leverage proof points. Frame conversations around quantitative outcomes before citing numbers."
                  </div>
                </div>

              </div>

            </div>

            {/* Interactive 30/90/180-Day Learning Roadmap */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-850 pb-5">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-black uppercase flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    CAREER ACCELERATOR PROTOCOL
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">Actionable 30/90/180-Day Learning Roadmap</h3>
                  <p className="text-xs text-slate-400 mt-1">Generate dynamic milestone schedules and recommended certifications to bridge your verified profile gaps.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="flex flex-col w-full sm:w-auto">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase mb-1">Target Skill Area</label>
                    <select
                      value={selectedRoadmapSkill}
                      onChange={(e) => setSelectedRoadmapSkill(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl py-2 px-3 outline-none focus:border-purple-500 cursor-pointer min-w-[180px] pointer-events-auto"
                    >
                      {diagnosticData.skills.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name} ({s.user < s.market ? `Deficit -${s.market - s.user}%` : `Aligned`})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => handleGenerateLearningRoadmap()}
                    disabled={isGeneratingRoadmap}
                    className="w-full sm:w-auto mt-4 sm:mt-5 font-mono text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2 px-4 rounded-xl border border-purple-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 pointer-events-auto shadow-purple-600/15 shadow-lg"
                  >
                    {isGeneratingRoadmap ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>COMPILING ROADMAP...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-4 h-4 text-white animate-pulse" />
                        <span>GENERATE STUDY ROADMAP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!roadmapData ? (
                <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-850/80 border-dashed text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="font-extrabold text-sm text-slate-200">Interactive Curriculum Desk Locked</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">Our AI Advisor agent aggregates deep course materials and certification benchmarks on demand. Pick one of your verified career deficit skills and trigger the builder!</p>
                  </div>
                  
                  {/* Grid of gaps shortcuts */}
                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] font-mono text-slate-550 uppercase font-black tracking-wider">Quick Start Deficit Coordinates:</div>
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {diagnosticData.skills.filter(s => s.user < s.market).map(s => (
                        <button
                          key={s.name}
                          onClick={() => {
                            setSelectedRoadmapSkill(s.name);
                            handleGenerateLearningRoadmap(s.name);
                          }}
                          className="bg-slate-950 hover:bg-slate-850 text-purple-300 hover:text-white border border-slate-800 hover:border-purple-500/50 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer pointer-events-auto"
                        >
                          <span>{s.name}</span>
                          <span className="bg-purple-900/30 text-purple-400 text-[9px] border border-purple-800/40 px-1 py-0.2 rounded font-mono font-black">-{s.market - s.user}% Deficit</span>
                        </button>
                      ))}
                      {diagnosticData.skills.filter(s => s.user < s.market).length === 0 && (
                        <span className="text-xs text-slate-500 italic">No direct deficits detected! You can select any skill above to build a standard roadmap anyway.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Roadmap Metadata Summary */}
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-purple-900/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono text-purple-400 font-black tracking-widest uppercase">CALIBRATION BLUEPRINT GAP CLOSED FOR</div>
                      <h4 className="font-extrabold text-sm text-white flex items-center flex-wrap gap-2">
                        <span>{roadmapData.skillGap}</span>
                        <span className="text-[10px] text-slate-500 font-mono">➡ target role:</span>
                        <span className="text-indigo-400">{roadmapData.targetRole}</span>
                      </h4>
                    </div>
                    <div className="text-xs text-slate-300 font-sans leading-relaxed md:max-w-xl italic border-l-2 border-purple-500 pl-3 py-1 bg-purple-950/10 rounded-r-lg">
                      {roadmapData.generalSummary}
                    </div>
                  </div>

                  {/* Interactive Day tabs and content layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left side tabs select */}
                    <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 font-mono scrollbar-none">
                      <button
                        onClick={() => setActiveRoadmapDayTab("day30")}
                        className={`flex-shrink-0 lg:flex-shrink text-left py-3 px-4 rounded-xl border transition-all cursor-pointer pointer-events-auto font-sans ${
                          activeRoadmapDayTab === "day30"
                            ? "bg-slate-950 border-purple-500 text-white shadow-md shadow-purple-955"
                            : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <div className="text-[10px] font-mono font-black tracking-widest text-[#10B981] uppercase">STAGE 1 (Day 30)</div>
                        <div className="text-xs font-bold mt-1 block truncate">Foundational Phase</div>
                      </button>
                      
                      <button
                        onClick={() => setActiveRoadmapDayTab("day90")}
                        className={`flex-shrink-0 lg:flex-shrink text-left py-3 px-4 rounded-xl border transition-all cursor-pointer pointer-events-auto font-sans ${
                          activeRoadmapDayTab === "day90"
                            ? "bg-slate-950 border-purple-500 text-white shadow-md shadow-purple-955"
                            : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <div className="text-[10px] font-mono font-black tracking-widest text-indigo-400 uppercase">STAGE 2 (Day 90)</div>
                        <div className="text-xs font-bold mt-1 block truncate">relational deployment</div>
                      </button>

                      <button
                        onClick={() => setActiveRoadmapDayTab("day180")}
                        className={`flex-shrink-0 lg:flex-shrink text-left py-3 px-4 rounded-xl border transition-all cursor-pointer pointer-events-auto font-sans ${
                          activeRoadmapDayTab === "day180"
                            ? "bg-slate-950 border-purple-500 text-white shadow-md shadow-purple-955"
                            : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <div className="text-[10px] font-mono font-black tracking-widest text-purple-400 uppercase">STAGE 3 (Day 180)</div>
                        <div className="text-xs font-bold mt-1 block truncate">Executive Scale</div>
                      </button>
                    </div>

                    {/* Right side interactive checklist pane */}
                    <div className="lg:col-span-9 bg-slate-955 border border-slate-850 rounded-2xl p-5 space-y-5">
                      {(() => {
                        const phaseData: RoadmapPhase = roadmapData.milestones[activeRoadmapDayTab];
                        const totalMilestones = phaseData.milestones.length;
                        const completedCount = phaseData.milestones.filter(
                          (m) => roadmapChecklist[`${roadmapData.skillGap}-${activeRoadmapDayTab}-${m}`]
                        ).length;
                        const percentCalculated = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

                        return (
                          <>
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b border-slate-850">
                              <div className="space-y-1">
                                <h4 className="font-extrabold text-base text-white">{phaseData.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-sans">{phaseData.description}</p>
                              </div>
                              <div className="text-left sm:text-right font-mono flex-shrink-0">
                                <div className="text-[9px] uppercase text-slate-500 font-bold tracking-wider">STAGE COMPLETED PROGRESS:</div>
                                <div className="text-sm font-black text-purple-400 mt-0.5">{completedCount} / {totalMilestones} ({percentCalculated}%)</div>
                              </div>
                            </div>

                            {/* Phase Progress bar */}
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500" 
                                style={{ width: `${percentCalculated}%` }}
                              />
                            </div>

                            {/* Checklist Milestones items */}
                            <div className="space-y-2">
                              <span className="text-[10px] tracking-wider text-slate-550 font-mono font-bold uppercase block mb-1">STUDY EXERCISE CHECKLIST (CLICK TO DO):</span>
                              {phaseData.milestones.map((m, idx) => {
                                const checkKey = `${roadmapData.skillGap}-${activeRoadmapDayTab}-${m}`;
                                const isChecked = !!roadmapChecklist[checkKey];
                                return (
                                  <div 
                                    key={idx} 
                                    onClick={() => handleToggleRoadmapCheckbox(checkKey)}
                                    className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all pointer-events-auto ${
                                      isChecked 
                                        ? "bg-purple-950/10 border-purple-500/20 text-slate-200 shadow-inner" 
                                        : "bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-955 text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    <div className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                                      isChecked 
                                        ? "bg-purple-500 border-purple-400 text-white" 
                                        : "border-slate-700 bg-slate-900 text-transparent hover:border-slate-600"
                                    }`}>
                                      {isChecked && <CheckCircle className="w-3.5 h-3.5 stroke-[3px]" />}
                                    </div>
                                    <span className="text-xs leading-normal font-sans font-semibold">{m}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Recommended certification and stats panel */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-850 font-mono">
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#090e18] border border-slate-855">
                                <Award className="w-5 h-5 text-purple-400" />
                                <div className="space-y-0.5 leading-none">
                                  <span className="text-[9px] text-slate-500 uppercase block font-black">ADVISOR CERTIFICATION PREP:</span>
                                  <span className="text-xs font-bold text-slate-200 block mt-0.5 leading-tight">{phaseData.certification}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#090e18] border border-slate-855">
                                <Calendar className="w-5 h-5 text-indigo-400" />
                                <div className="space-y-0.5 leading-none">
                                  <span className="text-[9px] text-slate-500 uppercase block font-black">ESTIMATED STUDY LOAD INDEX:</span>
                                  <span className="text-xs font-black text-slate-200 block mt-0.5">~{phaseData.estimatedHours} hrs self-directed workload</span>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* VIEW 3: SECURE RECORDS PORTAL (Historical logins database simulation table) */}
        {activeNavTab === "records" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#111827]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#10B981] font-bold block">
                    Zero-knowledge proof ledgers
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">Biometric Verification Ledger logs</h3>
                  <p className="text-xs text-slate-400 mt-1">A real-time audit record documenting authorized profile biometrics on this app instance.</p>
                </div>

                <div className="flex gap-2">
                  <div className="py-1.5 px-3 bg-slate-950/60 border border-slate-850 rounded-lg font-mono text-[10px] text-slate-400 font-bold flex items-center gap-1.5 select-none hover:border-slate-800">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <span>Active Sessions: {historyLogs.length}</span>
                  </div>
                </div>
              </div>

              {/* Responsive Records historical database table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/80 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 select-none">
                    <tr>
                      <th className="py-3 px-4">Professional Candidate</th>
                      <th className="py-3 px-4">Authorized Email Address</th>
                      <th className="py-3 px-4">Authentication Timestamp</th>
                      <th className="py-3 px-4">Hardware Environment / IP Profile</th>
                      <th className="py-3 px-4 text-center">Biometrics Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
                    {historyLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30 transition-colors select-text">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full border border-slate-700 bg-gradient-to-tr from-blue-600 to-purple-500 text-white flex items-center justify-center font-bold">
                            {log.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-slate-200 font-bold block">{log.name}</span>
                            <span className="text-slate-540 font-mono text-[9px] block">#UID-00{9 - idx}F</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-400">
                          {log.email}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 font-sans">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-medium leading-normal max-w-xs truncate" title={log.device}>
                          {log.device}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full uppercase bg-emerald-500/10 border border-emerald-500/30 text-[#10B981] font-mono text-[9px] font-black tracking-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-[9.5px] font-mono text-slate-500 leading-normal uppercase block text-center select-none">
                🟢 SECURE SHIELD ACTIVE • NO EXTERNAL CRYPTO KEYS TRANSMITTED
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: COMPREHENSIVE PROFILE VIEW */}
        {activeNavTab === "profile" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 select-text"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Profile Details (7 Columns) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Profile Card details */}
                <div className="bg-[#111827]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-md">
                  <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-blue-900/60 to-purple-900/60 rounded-t-xl" />
                  
                  <div className="relative pt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    
                    {/* Placeholder picture */}
                    <div className="h-24 w-24 rounded-2xl border-2 border-slate-800 bg-[#0B0F19] flex items-center justify-center text-slate-500 shadow-xl overflow-hidden relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-80" />
                      <User className="w-12 h-12 text-slate-405 relative z-10" />
                    </div>

                    <div className="text-center sm:text-left space-y-1.5 flex-1 pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none uppercase font-mono">{currentUser?.name}</h2>
                        <span className="text-[10px] font-mono font-black uppercase bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0">
                          Verified Candidate
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">{currentUser?.email} &bull; Remote Systems Engineer Account Profile</p>
                      
                      <div className="flex flex-wrap gap-2 pt-2 justify-center sm:justify-start">
                        <div className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[9.5px] text-slate-400 font-bold">
                          UID: #{currentUser?.id}
                        </div>
                        <div className="py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[9.5px] text-slate-400 font-bold">
                          Confidence Index: {(biometricConfidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Tag matrix list */}
                  <div className="border-t border-slate-850/85 mt-6 pt-5 space-y-3">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block font-mono">Linked Technical Skills Chips:</span>
                    <div className="flex flex-wrap gap-2">
                      {sectorTags.map((tag) => (
                        <div key={tag} className="flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold select-none">
                          <span>{tag}</span>
                        </div>
                      ))}
                      <div className="py-1 px-2.5 rounded-lg bg-slate-950 border border-dashed border-slate-800 font-mono text-[10px] text-slate-500 font-bold cursor-pointer select-none hover:border-slate-700" onClick={() => setActiveNavTab("features")}>
                        + Edit tags inside Features
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resume Textbox preview */}
                <div className="bg-[#111827]/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative backdrop-blur-md space-y-4">
                  <div>
                    <h3 className="text-sm font-mono tracking-widest text-slate-450 uppercase font-black border-b border-slate-850 pb-2">Active Calibrated Resume Content</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">Direct plaintext index synchronized within parsing pipelines. Editable inside features calibration.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto text-slate-350 select-text whitespace-pre-wrap">
                    {resumeText || "No plaintext history uploaded. Select preset or enter details inside Aligner."}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveNavTab("features")}
                      className="py-1.5 px-4 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-bold text-xs select-none cursor-pointer"
                    >
                      Calibrate text inside Aligner
                    </button>
                  </div>
                </div>

              </div>

              {/* Console Settings Logs (4 Columns) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* API Status parameters */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-3 select-none">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-mono font-bold">Pipeline Telemetry Parameters:</span>
                  
                  <div className="space-y-2 text-[11px] leading-tight text-zinc-700 font-mono">
                    <div className="flex justify-between">
                      <span>Server Engine Status:</span>
                      <span className="text-emerald-700 font-bold uppercase">{apiStatus?.status || "ALIVE"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Model Layer:</span>
                      <span className="text-[#0a66c2] font-bold uppercase font-sans">Gemini SDK proxy</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Instance Verification:</span>
                      <span className="text-purple-700 font-bold">Biometrics localized</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* VIEW 5: CHATBOT FOR CAREER OPPORTUNITY & INTERVIEW TRAINING */}
        {activeNavTab === "advisor" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="border-b border-zinc-150 pb-4 mb-4">
                <span className="text-[9px] font-mono uppercase bg-blue-50 text-[#0a66c2] border border-blue-200 px-2 py-0.5 rounded font-black inline-block">
                  Active Conversation Session
                </span>
                <h3 className="text-xl font-black text-zinc-950 mt-1 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#0a66c2]" />
                  AI Career Expert Advisor Chat
                </h3>
                <p className="text-xs text-zinc-550 mt-1">
                  Ask recommendations, practice tailored role-play interview tests, or deep-dive target skills deficits.
                </p>
              </div>

              {/* Seamless AI Advisor Chatbot interface */}
              <div className="h-[60vh] min-h-[450px]">
                <AIAdvisorChat currentRole={uploaderRole} />
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* ==================== FIXED BOTTOM NAVIGATION TASKBAR ==================== */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-zinc-200 z-40 flex items-center justify-around px-4 select-none pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        
        {/* Navigation Tab index 1: Dashboard */}
        <button
          onClick={() => setActiveNavTab("dashboard")}
          className={`h-full flex flex-col justify-center items-center gap-1 px-3 select-none transition-all cursor-pointer ${
            activeNavTab === "dashboard" ? "text-[#0a66c2] pointer-events-none font-extrabold" : "text-zinc-550 hover:text-zinc-800"
          }`}
          style={{ width: "20%" }}
        >
          <div className="relative">
            <TrendingUp className="w-5 h-5" />
            {activeNavTab === "dashboard" && (
              <motion.span layoutId="activeNavBubble" className="absolute -inset-2 bg-blue-50 rounded-xl -z-10 border border-blue-100" />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Dashboard</span>
        </button>

        {/* Navigation Tab index 2: AI Advisor */}
        <button
          onClick={() => setActiveNavTab("advisor")}
          className={`h-full flex flex-col justify-center items-center gap-1 px-3 select-none transition-all cursor-pointer ${
            activeNavTab === "advisor" ? "text-[#0a66c2] pointer-events-none font-extrabold" : "text-zinc-550 hover:text-zinc-800"
          }`}
          style={{ width: "20%" }}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {activeNavTab === "advisor" && (
              <motion.span layoutId="activeNavBubble" className="absolute -inset-2 bg-blue-50 rounded-xl -z-10 border border-blue-100" />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono">AI Advisor</span>
        </button>

        {/* Navigation Tab index 3: Features */}
        <button
          onClick={() => setActiveNavTab("features")}
          className={`h-full flex flex-col justify-center items-center gap-1 px-3 select-none transition-all cursor-pointer ${
            activeNavTab === "features" ? "text-[#0a66c2] pointer-events-none font-extrabold" : "text-zinc-550 hover:text-zinc-800"
          }`}
          style={{ width: "20%" }}
        >
          <div className="relative">
            <Cpu className="w-5 h-5" />
            {activeNavTab === "features" && (
              <motion.span layoutId="activeNavBubble" className="absolute -inset-2 bg-blue-50 rounded-xl -z-10 border border-blue-100" />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Features</span>
        </button>

        {/* Navigation Tab index 4: Records */}
        <button
          onClick={() => setActiveNavTab("records")}
          className={`h-full flex flex-col justify-center items-center gap-1 px-3 select-none transition-all cursor-pointer ${
            activeNavTab === "records" ? "text-[#0a66c2] pointer-events-none font-extrabold" : "text-zinc-550 hover:text-zinc-800"
          }`}
          style={{ width: "20%" }}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {activeNavTab === "records" && (
              <motion.span layoutId="activeNavBubble" className="absolute -inset-2 bg-blue-50 rounded-xl -z-10 border border-blue-100" />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Records</span>
        </button>

        {/* Navigation Tab index 5: Profile */}
        <button
          onClick={() => setActiveNavTab("profile")}
          className={`h-full flex flex-col justify-center items-center gap-1 px-3 select-none transition-all cursor-pointer ${
            activeNavTab === "profile" ? "text-[#0a66c2] pointer-events-none font-extrabold" : "text-zinc-550 hover:text-zinc-800"
          }`}
          style={{ width: "20%" }}
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {activeNavTab === "profile" && (
              <motion.span layoutId="activeNavBubble" className="absolute -inset-2 bg-blue-50 rounded-xl -z-10 border border-blue-100" />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Profile</span>
        </button>

      </div>

      {/* ==================== PROFESSIONAL PDF EXPORT MODAL & PRINTOUT DOSSIER ==================== */}
      <AnimatePresence>
        {showPDFModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setShowPDFModal(false)}
          >
            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.45 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto font-sans"
            >
              
              {/* PDF Preview Actions Header */}
              <div className="border-b border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-blue-400 tracking-wider uppercase font-mono flex items-center gap-1.5 leading-none">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span>PDF Report Exporter Console</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">Review the stylized layout below. Click "Download / Export PDF" to save or print natively.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="py-1.5 px-4 rounded-full bg-blue-500 hover:bg-blue-601 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download / Export PDF</span>
                  </button>
                  <button
                    onClick={() => setShowPDFModal(false)}
                    className="py-1.5 px-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              {/* ===================== ACTUAL PRINTABLE DOCUMENT SHEET GRID ===================== */}
              <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40 shadow-inner max-h-[55vh] overflow-y-auto print:border-0 print:bg-white print:p-0 select-text">
                <div className="bg-white border border-zinc-200 p-8 rounded-lg shadow-sm print:shadow-none print:border-0 relative font-sans text-zinc-800" id="pdf-printable-dossier-node">
                  
                  {/* Decorative Header Banner */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
                  
                  {/* Report Main Header */}
                  <div className="flex justify-between items-start border-b border-zinc-300 pb-5 mb-6">
                    <div>
                      <div className="text-[10px] font-black text-blue-600 tracking-wider uppercase font-mono leading-none mb-1">AI CAREER INTELLIGENCE PLATFORM</div>
                      <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none">DIAGNOSTIC CALIBRATION DOSSIER</h2>
                      <p className="text-[10px] text-zinc-500 font-medium font-mono mt-1.5">REQUISITION_BENCHMARK_TOKEN: #AID-2026-948502</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-zinc-900">{currentUser?.name}</div>
                      <div className="text-[9px] text-zinc-500">{currentUser?.email}</div>
                      <div className="text-[9px] font-bold text-emerald-700 uppercase font-mono mt-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded leading-none inline-block">SECURED BIOMETRIC VERIFIED</div>
                    </div>
                  </div>

                  {/* Core Assessments Summary Columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center">
                      <span className="block text-[8px] font-black uppercase text-zinc-400 font-mono tracking-wider">Hiring Compatibility</span>
                      <span className="text-xl font-black text-zinc-900 mt-1 block">{diagnosticData.matchScore}%</span>
                      <span className="text-[8.5px] text-blue-600 font-black uppercase font-mono">Predictive Index</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center">
                      <span className="block text-[8px] font-black uppercase text-zinc-400 font-mono tracking-wider">ATS Optimization Index</span>
                      <span className="text-xl font-black text-purple-700 mt-1 block">{diagnosticData.metrics.atsScore}%</span>
                      <span className="text-[8.5px] text-purple-700 font-bold uppercase font-mono">Structural Compliance</span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-center">
                      <span className="block text-[8px] font-black uppercase text-zinc-400 font-mono tracking-wider">Target Compensation</span>
                      <span className="text-xl font-black text-emerald-700 mt-1 block">${(diagnosticData.salary.current / 1000).toFixed(0)}k/yr</span>
                      <span className="text-[8.5px] text-emerald-700 font-bold uppercase font-mono">{diagnosticData.salary.percentile} Percentile Spectrum</span>
                    </div>
                  </div>

                  {/* Skills calibration comparative table */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-600 border-b border-zinc-200 pb-1 mb-2.5">
                      I. Skills Calibration Spectrum &amp; Gaps
                    </h4>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
                      <table className="w-full text-[10px] text-left">
                        <thead className="bg-[#f4f2ee] uppercase tracking-wider text-[8px] text-zinc-500 font-bold border-b border-zinc-200 font-mono">
                          <tr>
                            <th className="py-1 px-2">Skill Component</th>
                            <th className="py-1 px-2 text-center">Your Rating</th>
                            <th className="py-1 px-2 text-center">Market Target</th>
                            <th className="py-1 px-2 text-right">Alignment Gap</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 font-semibold text-zinc-800">
                          {diagnosticData.skills.map((s, idx) => (
                            <tr key={idx} className="hover:bg-zinc-200/20">
                              <td className="py-1 px-2 font-bold">{s.name}</td>
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
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-600 border-b border-zinc-200 pb-1 mb-2.5">
                      II. Document Vocabulary Deficit Mappings
                    </h4>
                    <div className="space-y-1.5 pl-1 text-[10px] text-zinc-650">
                      {diagnosticData.atsInsights.map((ins, idx) => (
                        <div key={idx} className="font-sans font-semibold leading-relaxed flex items-start gap-1.5">
                          <span className="text-blue-600 font-extrabold mt-0.5 flex-shrink-0">&bull;</span>
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended career pivot projections */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-600 border-b border-zinc-200 pb-1 mb-2.5">
                      III. Non-Obvious Requisition Pivot Suggestions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {diagnosticData.pivotOpportunities.map((op, idx) => (
                        <div key={idx} className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-black text-zinc-850 leading-none">
                            <span>{op.role}</span>
                            <span className="text-[8px] font-mono uppercase bg-blue-50 text-blue-600 border border-blue-200 px-1 py-0.5 rounded">
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
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4 select-none">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-6 rounded-full bg-blue-500 hover:bg-blue-601 text-white font-bold text-xs cursor-pointer shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Now</span>
                </button>
                <button
                  onClick={() => setShowPDFModal(false)}
                  className="py-2.5 px-4 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
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
