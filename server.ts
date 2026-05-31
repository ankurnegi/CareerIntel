import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No GEMINI_API_KEY provided or default placeholder detected. Server will use intelligent fallback data generator.");
}

// ---------------- Fallback Data Generator ----------------
function getFallbackDiagnostic(targetRole: string = "Senior Product Manager") {
  const role = targetRole || "Senior Product Manager";
  
  // Custom fallback data matching the professional profile
  let score = 84;
  let skills = [
    { name: "Product Strategy", user: 85, market: 85 },
    { name: "A/B Testing & Analytics", user: 60, market: 80 },
    { name: "SQL & Data Crawling", user: 45, market: 75 },
    { name: "System Architecture", user: 70, market: 65 },
    { name: "Agile Project Delivery", user: 90, market: 80 },
    { name: "AI/ML Integration", user: 40, market: 85 }
  ];
  let salary = {
    current: 125000,
    marketMin: 110000,
    marketAvg: 148000,
    marketMax: 195000,
    percentile: 32,
    curvePosition: "below_average"
  };
  let pivotOpportunities = [
    { role: "Technical Product Manager (TPM)", likelihood: "High", why: "Strong system architecture rating coupled with solid agile delivery foundations." },
    { role: "VP of Product Engineering", likelihood: "Medium", why: "Strategic vision is ready; requires 1 year of direct software management scaling." }
  ];
  let atsInsights = [
    "Critically missing keywords: 'AI Integration', 'Data-driven analytics' in resume professional summary.",
    "Your description lists features rather than business metrics. Shift focus from 'Built page X' to 'Drove +22% signup conversion via page layout optimization.'",
    "Format is scan-friendly, but lack of Cloud certifications (AWS/GCP) cuts your eligibility for Enterprise product roles."
  ];

  if (role.toLowerCase().includes("software") || role.toLowerCase().includes("developer") || role.toLowerCase().includes("backend") || role.toLowerCase().includes("frontend") || role.toLowerCase().includes("devops") || role.toLowerCase().includes("engineer") || role.toLowerCase().includes("architect")) {
    score = 79;
    skills = [
      { name: "Algorithms & DS", user: 85, market: 80 },
      { name: "System Design", user: 55, market: 85 },
      { name: "Cloud Deployment (AWS/GCP)", user: 40, market: 80 },
      { name: "React & Next.js", user: 90, market: 75 },
      { name: "Database Design (SQL/NoSQL)", user: 70, market: 75 },
      { name: "CI/CD & Kubernetes", user: 50, market: 70 }
    ];
    salary = {
      current: 115000,
      marketMin: 95000,
      marketAvg: 142000,
      marketMax: 185000,
      percentile: 34,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "Cloud Solutions Architect", likelihood: "High", why: "Solid backend and algorithmic understanding is a direct route to infrastructure architecture." },
      { role: "Engineering Manager", likelihood: "Medium", why: "Has strong communication potential, needs 2-3 quarters leading team scrums." }
    ];
    atsInsights = [
      "Critically missing containerization keywords: 'Kubernetes', 'Docker' or certification tags in your core profile.",
      "Vague project outcomes detected. Convert your resume lines from 'worked with node.js' to 'Refactored backend Node API resulting in 340ms reduction in latency.'",
      "No AWS or Google Cloud architecture mentions found. Cloud keywords are weighted highly on modern tech ATS filters."
    ];
  } else if (role.toLowerCase().includes("data") || role.toLowerCase().includes("scientist") || role.toLowerCase().includes("analytics") || role.toLowerCase().includes("machine") || role.toLowerCase().includes("ai")) {
    score = 86;
    skills = [
      { name: "Python & R Coding", user: 92, market: 85 },
      { name: "ML Models & PyTorch", user: 50, market: 85 },
      { name: "Data Pipeline (Airflow)", user: 65, market: 75 },
      { name: "Statistics & Hypotheses", user: 80, market: 80 },
      { name: "Data Visualizations", user: 88, market: 70 },
      { name: "Large Language Models (LLMs)", user: 40, market: 90 }
    ];
    salary = {
      current: 130000,
      marketMin: 105000,
      marketAvg: 155000,
      marketMax: 210000,
      percentile: 38,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "AI Core Engineer", likelihood: "High", why: "Python skills are premium. Adding deep attention heads and tuning techniques unlocks immediate pivots." },
      { role: "Analytics Director", likelihood: "Medium", why: "Excellent visual delivery skills; needs more direct stakeholder budget ownership." }
    ];
    atsInsights = [
      "Missing core ML ops keywords: 'MLflow', 'Docker', or 'SageMaker' in operational workflows.",
      "Too many theoretical items listed in bullets. Shift your descriptors to 'Deployed gradient-boosting algorithm saving $45K in annual compute costs.'",
      "LLM tuning and Prompt engineering sections are not matching modern AI keywords."
    ];
  } else if (role.toLowerCase().includes("design") || role.toLowerCase().includes("ux") || role.toLowerCase().includes("ui") || role.toLowerCase().includes("creative") || role.toLowerCase().includes("art") || role.toLowerCase().includes("graphic") || role.toLowerCase().includes("product designer")) {
    score = 81;
    skills = [
      { name: "Visual UI Design", user: 88, market: 80 },
      { name: "UX Research & Testing", user: 65, market: 85 },
      { name: "Figma Component Libs", user: 90, market: 75 },
      { name: "Framer Prototyping", user: 45, market: 80 },
      { name: "Design Systems Governance", user: 70, market: 85 },
      { name: "User Journey Validation", user: 82, market: 75 }
    ];
    salary = {
      current: 108000,
      marketMin: 90000,
      marketAvg: 128000,
      marketMax: 165000,
      percentile: 30,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "Creative Director", likelihood: "Medium", why: "Strong design system architecture is highly relevant for leadership, plus 1 year agency portfolio." },
      { role: "Design Technologist", likelihood: "High", why: "Solid Figma and Framer prototyping speeds up HTML/CSS handoffs." }
    ];
    atsInsights = [
      "Critically missing usability metrics and statistics: add 'conversion improvement by X%' in case studies.",
      "No mentions of 'Design Systems' token management. Modern ATS filters scan for systemic component workflows.",
      "Briefly list standard technical wrappers (HTML5, Tailwind, CSS Grid) to bypass automated accessibility matching."
    ];
  } else if (role.toLowerCase().includes("market") || role.toLowerCase().includes("growth") || role.toLowerCase().includes("seo") || role.toLowerCase().includes("acquisition") || role.toLowerCase().includes("brand")) {
    score = 83;
    skills = [
      { name: "Growth Marketing", user: 85, market: 80 },
      { name: "Performance Ads (CPA)", user: 70, market: 85 },
      { name: "SEO & Content Delivery", user: 90, market: 75 },
      { name: "Google Analytics (GA4)", user: 80, market: 80 },
      { name: "Marketing Automation", user: 60, market: 85 },
      { name: "A/B Conversion Testing", user: 75, market: 80 }
    ];
    salary = {
      current: 98000,
      marketMin: 80000,
      marketAvg: 118000,
      marketMax: 155000,
      percentile: 29,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "VP of Growth & Optimization", likelihood: "High", why: "Proven track record with high-scale budget control and performance funnel scaling." },
      { role: "Product Manager (Growth)", likelihood: "Medium", why: "Conversion rate testing expertise is direct bridge to product team activation lines." }
    ];
    atsInsights = [
      "No budget indicators or scale qualifiers found. Standard growth ATS weights queries like '$100K+ ad spend' highly.",
      "Missing programmatic SEO keywords: 'Headless SEO', 'JSON-LD data structures' or tracking automation tags.",
      "Incorporate GA4 migration certification details explicitly in the technical certification section."
    ];
  } else if (role.toLowerCase().includes("sales") || role.toLowerCase().includes("bizdev") || role.toLowerCase().includes("account") || role.toLowerCase().includes("revenue") || role.toLowerCase().includes("partnership")) {
    score = 80;
    skills = [
      { name: "Enterprise Sales Strategy", user: 82, market: 80 },
      { name: "Lead Pipeline Generation", user: 88, market: 85 },
      { name: "CRM Tools (Salesforce)", user: 90, market: 75 },
      { name: "Negotiation & Contracts", user: 70, market: 80 },
      { name: "Customer Success Mapping", user: 65, market: 80 },
      { name: "Partnership Orchestration", user: 60, market: 85 }
    ];
    salary = {
      current: 95000,
      marketMin: 75000,
      marketAvg: 120000,
      marketMax: 170000,
      percentile: 27,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "Director of Business Development", likelihood: "High", why: "Solid lead prospecting combined with strong enterprise client conversion records." },
      { role: "Revenue Operations (RevOps)", likelihood: "Medium", why: "If you enjoy automating CRM parameters and indexing deal structures." }
    ];
    atsInsights = [
      "Critically missing quota details. Add '$1.2M annual contract value (ACV) targets met' explicitly.",
      "No mentions of 'Salesforce CPQ' or enterprise tracking configurations. Modern RevOps filters demand CRM experience.",
      "Simplify bullet lengths. Sales recruiters review resumes in under 5 seconds; ensure pipeline metrics are bolded first."
    ];
  } else if (role.toLowerCase().includes("finance") || role.toLowerCase().includes("quant") || role.toLowerCase().includes("analyst") || role.toLowerCase().includes("valua") || role.toLowerCase().includes("investment") || role.toLowerCase().includes("banking") || role.toLowerCase().includes("audit")) {
    score = 82;
    skills = [
      { name: "Financial Modeling", user: 90, market: 85 },
      { name: "Risk Management", user: 65, market: 80 },
      { name: "Valuation Metrology", user: 80, market: 75 },
      { name: "SQL & Python Integration", user: 70, market: 80 },
      { name: "Excel Mastery (VBA/Macros)", user: 95, market: 70 },
      { name: "Portfolio Optimization", user: 55, market: 85 }
    ];
    salary = {
      current: 112000,
      marketMin: 95000,
      marketAvg: 140000,
      marketMax: 195000,
      percentile: 22,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "Quantitative Fintech Analyst", likelihood: "High", why: "Combining python algorithmic modeling and rigorous spreadsheet evaluation." },
      { role: "Director of FP&A", likelihood: "Medium", why: "Outstanding model design requires direct exposure to quarterly board meetings." }
    ];
    atsInsights = [
      "No CFA or SEC reporting keywords found. Financial ATS software seeks regulatory compliance standard terms.",
      "Vague descriptors of portfolio tools. Explicitly state usage of Bloomberg Terminal, Morningstar, or standard quant packages.",
      "Include metrics detailing the dollar value of the operations or fund size managed (e.g., '$80M+ Asset Under Management')."
    ];
  } else if (role.toLowerCase().includes("health") || role.toLowerCase().includes("medical") || role.toLowerCase().includes("clinical") || role.toLowerCase().includes("biotech") || role.toLowerCase().includes("pharma") || role.toLowerCase().includes("hospital") || role.toLowerCase().includes("care")) {
    score = 85;
    skills = [
      { name: "Clinical Data Ops", user: 85, market: 80 },
      { name: "Regulatory Compliance", user: 90, market: 85 },
      { name: "HIPAA Data Security", user: 92, market: 75 },
      { name: "Healthcare Workflow Optimization", user: 78, market: 80 },
      { name: "Electronic Health Records", user: 88, market: 70 },
      { name: "Biostatistics", user: 55, market: 85 }
    ];
    salary = {
      current: 120000,
      marketMin: 100000,
      marketAvg: 145000,
      marketMax: 185000,
      percentile: 29,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "Digital Health Product Lead", likelihood: "High", why: "Perfect domain knowledge in medical compliance paired with HIPAA security workflow understanding." },
      { role: "Clinical Operations Director", likelihood: "Medium", why: "Proven workflow tracking, needs direct ownership of staff scaling budgets." }
    ];
    atsInsights = [
      "Missing critical regulatory references: explicit mentions of HIPAA compliance, FDA approvals, or clinical phase standards.",
      "Resume lacks keywords for electronic record databases (e.g. Cerner, Epic Systems Integration).",
      "Describe patient metrics and trial sizes in exact numbers. ATS software weights numeric quantities of operations highly."
    ];
  } else {
    // Elegant general business fallback for literally any other role!
    score = 78;
    skills = [
      { name: "Strategic Operations", user: 80, market: 85 },
      { name: "Cross-Functional Leadership", user: 85, market: 80 },
      { name: "Data-Driven Decisioning", user: 65, market: 75 },
      { name: "Project Management Standards", user: 90, market: 80 },
      { name: "Budget/Resource Optimization", user: 70, market: 85 },
      { name: "Stakeholder Relations", user: 75, market: 80 }
    ];
    salary = {
      current: 105000,
      marketMin: 90000,
      marketAvg: 135000,
      marketMax: 180000,
      percentile: 28,
      curvePosition: "below_average"
    };
    pivotOpportunities = [
      { role: "Director of Agile Operations", likelihood: "High", why: "Solid project delivery and structured leadership enables rapid department-level scaling." },
      { role: "Global Solutions Lead", likelihood: "Medium", why: "Excellent coordination abilities; prefers direct stakeholder interface ownership." }
    ];
    atsInsights = [
      "Provide more high-impact metric quantification. ATS parsers score 'improved conversion by 15%' much higher than descriptive bullets.",
      "Vague tooling mentions. Explicitly detail your familiarity with professional sector systems (e.g., Salesforce, Jira, Tableau, MS Project).",
      "Format is compatible, but consolidate multiple pages. Keep resume length strictly at 1-2 pages maximum."
    ];
  }

  return {
    role,
    matchScore: score,
    metrics: {
      atsScore: Math.floor(score * 0.98),
      marketDemand: Math.floor(score * 1.05) > 100 ? 98 : Math.floor(score * 1.05),
      confidenceInterval: 92
    },
    skills,
    salary,
    pivotOpportunities,
    atsInsights,
    isMock: !ai
  };
}

// ----------------- Persistent Simulated Database Tables -----------------
interface UserDBRow {
  id: string;
  email: string;
  is_verified: boolean;
  biometric_confidence: number;
  verified_at: string;
  name?: string;
  password?: string;
}

interface CareerQueryRow {
  id: string;
  user_id: string;
  target_role: string;
  industry_sector: string;
  match_score: number;
  ats_score: number;
  queried_at: string;
}

const db_users: UserDBRow[] = [
  {
    id: "usr_001",
    email: "ankurnegi68@gmail.com",
    name: "Ankur Negi",
    password: "password123",
    is_verified: false,
    biometric_confidence: 0,
    verified_at: ""
  },
  {
    id: "usr_998",
    email: "sarah.connor@cyberdyne.com",
    name: "Sarah Connor",
    password: "password123",
    is_verified: true,
    biometric_confidence: 0.985,
    verified_at: "2026-05-31T10:15:30Z"
  },
  {
    id: "usr_999",
    email: "neo.anderson@metacortex.com",
    name: "Thomas Anderson",
    password: "password123",
    is_verified: true,
    biometric_confidence: 0.994,
    verified_at: "2026-05-31T11:45:00Z"
  }
];

const db_career_queries: CareerQueryRow[] = [
  {
    id: "q_001",
    user_id: "usr_998",
    target_role: "Lead Cybersecurity Architect",
    industry_sector: "Software Engineering & DevOps",
    match_score: 92,
    ats_score: 89,
    queried_at: "2026-05-31T10:18:12Z"
  },
  {
    id: "q_002",
    user_id: "usr_999",
    target_role: "Principal Systems Engineer",
    industry_sector: "Software Engineering & DevOps",
    match_score: 95,
    ats_score: 93,
    queried_at: "2026-05-31T11:47:24Z"
  }
];

// ---------------- API Routes ----------------

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

// User Registration endpoint
app.post("/api/auth/register", (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: "All registration fields (email, name, password) are required" });
  }

  const existing = db_users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "A user with this email already exists" });
  }

  const newUser: UserDBRow = {
    id: `usr_${Math.random().toString(36).substring(2, 7)}`,
    email: email.toLowerCase(),
    name,
    password,
    is_verified: false,
    biometric_confidence: 0,
    verified_at: ""
  };

  db_users.push(newUser);
  res.json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
});

// Credentials check before biometric verification
app.post("/api/auth/signin-check", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db_users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "No profile found with this email" });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: "Incorrect password credentials" });
  }

  res.json({
    success: true,
    needs_camera_verification: true,
    user: { id: user.id, email: user.email, name: user.name || "User" }
  });
});

// Database schema and record logs endpoint
app.get("/api/db/logs", (req, res) => {
  res.json({
    users: db_users,
    queries: db_career_queries,
    schemas: {
      usersTable: `CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  biometric_confidence FLOAT DEFAULT 0.0,
  verified_at TIMESTAMP
);`,
      queriesTable: `CREATE TABLE career_queries (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  target_role VARCHAR(100) NOT NULL,
  industry_sector VARCHAR(100) NOT NULL,
  match_score INT,
  ats_score INT,
  queried_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    }
  });
});

// Post biometric face check validation results
app.post("/api/db/verify", (req, res) => {
  const { email = "ankurnegi68@gmail.com", is_verified, biometric_confidence } = req.body;
  const userIndex = db_users.findIndex(u => u.email === email);
  const timestamp = new Date().toISOString();

  if (userIndex >= 0) {
    db_users[userIndex].is_verified = is_verified;
    db_users[userIndex].biometric_confidence = biometric_confidence;
    db_users[userIndex].verified_at = timestamp;
  } else {
    db_users.push({
      id: `usr_${Math.random().toString(36).substring(2, 7)}`,
      email,
      is_verified,
      biometric_confidence,
      verified_at: timestamp
    });
  }
  res.json({ success: true, users: db_users });
});

// Prepend user diagnostics searches log
app.post("/api/db/query", (req, res) => {
  const { target_role, industry_sector, match_score, ats_score } = req.body;
  const newQuery: CareerQueryRow = {
    id: `q_${Math.random().toString(36).substring(2, 7)}`,
    user_id: "usr_001",
    target_role: target_role || "Unknown Role",
    industry_sector: industry_sector || "General Sector",
    match_score: match_score || 70,
    ats_score: ats_score || 68,
    queried_at: new Date().toISOString()
  };
  db_career_queries.unshift(newQuery);
  res.json({ success: true, queries: db_career_queries });
});

// Resume Diagnostic / Career Intelligence Engine
app.post("/api/diagnose", async (req, res) => {
  const { resumeText, targetRole = "Software Engineer", skillsFocus = [] } = req.body;
  const processedTargetRole = targetRole || "Software Engineer";

  // If Gemini API is not working or not configured, return fallback data instantly
  if (!ai) {
    console.log(`[AI-API Disabled] Serving robust intelligent fallback for: ${processedTargetRole}`);
    return res.json(getFallbackDiagnostic(processedTargetRole));
  }

  try {
    console.log(`[AI-API] Calling Gemini to diagnose candidate for target role: ${processedTargetRole}`);
    
    // Build a distinct system instruction prompting structure
    const prompt = `Analyze the candidate resume or target career profile below for the target role of "${processedTargetRole}".
    
Candidate Profile Query:
"${resumeText || "No resume text uploaded. Perform a baseline benchmark evaluation of a high-potential candidate aiming to transition into: " + processedTargetRole}"

Provide a structured, deep, analytical assessment based on the requested JSON schema. Rate 6 key skills relevant to the role (provide name, candidate's user score from 0-100, and market demand from 0-100). Bench salary expectations against real-world metrics. Find 2 pivot opportunities and list 3 key ATS insights or optimization rules. Keep evaluations realistic, strategic, and direct.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, senior executive recruiter and ATS search specialist. Perform rigorous, realistic candidate benchmarking with helpful data visualizations metrics.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["role", "matchScore", "metrics", "skills", "salary", "pivotOpportunities", "atsInsights"],
          properties: {
            role: { type: Type.STRING, description: "The normalized core target role analyzed" },
            matchScore: { type: Type.INTEGER, description: "Current hiring probability match score from 0 to 100" },
            metrics: {
              type: Type.OBJECT,
              required: ["atsScore", "marketDemand", "confidenceInterval"],
              properties: {
                atsScore: { type: Type.INTEGER },
                marketDemand: { type: Type.INTEGER },
                confidenceInterval: { type: Type.INTEGER }
              }
            },
            skills: {
              type: Type.ARRAY,
              description: "Array of exactly 6 key skills relevant to the position comparing candidate user score vs market standard",
              items: {
                type: Type.OBJECT,
                required: ["name", "user", "market"],
                properties: {
                  name: { type: Type.STRING },
                  user: { type: Type.INTEGER, description: "0-100 candidate rating" },
                  market: { type: Type.INTEGER, description: "0-100 market demand rating" }
                }
              }
            },
            salary: {
              type: Type.OBJECT,
              required: ["current", "marketMin", "marketAvg", "marketMax", "percentile"],
              properties: {
                current: { type: Type.INTEGER, description: "Estimated salary match or user expectation in USD" },
                marketMin: { type: Type.INTEGER },
                marketAvg: { type: Type.INTEGER },
                marketMax: { type: Type.INTEGER },
                percentile: { type: Type.INTEGER, description: "Salary benchmark percentile location (0-100)" }
              }
            },
            pivotOpportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["role", "likelihood", "why"],
                properties: {
                  role: { type: Type.STRING },
                  likelihood: { type: Type.STRING, description: "High, Medium, or Low" },
                  why: { type: Type.STRING }
                }
              }
            },
            atsInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly actionable bullets highlighting parser feedback, structural gaps, or copy corrections"
            }
          }
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
       throw new Error("No response text from Gemini");
    }
    const result = JSON.parse(outputText);
    result.isMock = false;
    res.json(result);

  } catch (error) {
    console.error("Gemini Diagnostic Call failed. Falling back to structured response.", error);
    res.json(getFallbackDiagnostic(processedTargetRole));
  }
});

// Advisor Interactive Demo Chat & Interactive Path Builder
app.post("/api/chat", async (req, res) => {
  const { messages = [], isLearningPathRequest = false, contextData = {} } = req.body;

  // Simple prompt modifier if building the 2-week plan
  if (isLearningPathRequest) {
    if (!ai) {
      // Mock 2-week syllabus instant response
      const mockSyllabus = `### Day 1–5: AWS Foundation & Deployment Core
* **Topics**: IAM roles, VPC subnets, and deploying Python APIs via ECS.
* **Exercises**: Build and deploy a simple secure FastAPI microservice in Docker; containerize and push to Amazon ECR.
* **Project**: Live deploy an AWS Lambda function with API Gateway integration.

### Day 6–10: Database Integration & Secrets Engine
* **Topics**: PostgreSQL RDS connections and secret automation via AWS Secrets Manager.
* **Exercises**: Configure relational RDS pool parameters. Extract application keys and DB credentials utilizing AWS SDK (boto3) directly from execution environments.
* **Project**: Seamless cloud database migration with Zero-Inbound parameters.

### Day 11–14: Optimization, Metrics, & CI/CD Pipeline
* **Topics**: GitHub Actions AWS trigger integrations, Elastic Load Balancing, and metric dashboards via CloudWatch.
* **Exercises**: Setup automatic deployment workflows on merge events. Connect alert telemetry webhooks.
* **Outcomes**: Increases hiring match score for Senior profiles by **22%**! Ready for engineering evaluation.`;

      return res.json({
        content: mockSyllabus,
        isMock: true
      });
    }

    try {
      console.log("[AI-API] Generating customized 2-week learning path");
      const targetRole = contextData.role || "Backend Engineer";
      const targetSkill = contextData.skill || "AWS Cloud Deployment & Devops integration";
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a ultra-concise, professional, and actionable 2-week custom daily learning curriculum for a software engineer. Focus on rapidly acquiring the following missing skill gap: "${targetSkill}" to transition into a premium "${targetRole}". Keep it highly professional, divided into Day 1-5, Day 6-10, and Day 11-14. Avoid fluffy intros, list specific AWS exercises, and end with the outcome metric. Use clean Markdown formatting.`,
        config: {
          systemInstruction: "You are a master technical curriculum engineer and tech recruiter. You write punchy, structured syllabi focused on immediate resume impact."
        }
      });

      return res.json({
        content: response.text || "Failed to generate plan. Please try again.",
        isMock: false
      });
    } catch (err) {
      console.error("Error generating learning path with Gemini", err);
      return res.status(500).json({ error: "Could not create path at this time." });
    }
  }

  // Regular chat behavior
  if (!ai) {
    // Generate intelligent simulation conversation responses
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    let mockResponseText = "I see what you mean. Our Career Command Center is designed to scan real-world market intelligence to solve this. Tell me, what target role are you engineering your profile for next?";
    
    if (lastUserMessage.toLowerCase().includes("yes") || lastUserMessage.toLowerCase().includes("build the plan") || lastUserMessage.toLowerCase().includes("learning path")) {
       mockResponseText = "Excellent. I will compile your custom 2-week AWS cloud deployment learning syllabus immediately. Please click the glowing 'Build 2-Week Learning Plan' toggle or button above.";
    } else if (lastUserMessage.toLowerCase().includes("python") || lastUserMessage.toLowerCase().includes("resume")) {
       mockResponseText = "Your Python analytics foundation is spectacular. However, your target backend role also requests real-time cache systems (Redis). Let's work on adding a simple Redis project to your GitHub.";
    }

    return res.json({
      content: mockResponseText,
      isMock: true
    });
  }

  try {
    console.log("[AI-API] Chat query executing with Gemini");
    // Format messages for standard generateContent
    const formattedHistory = messages.map((m: any) => {
      const roleName = m.role === "assistant" ? "model" : "user";
      return {
        role: roleName,
        parts: [{ text: m.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: "You are an elite AI Career Advisor. You help tech candidates engineer their careers, maximize salaries, optimize resumes, and resolve skill gaps. Keep your answers ultra-concise (max 3 bullets), tactical, and empowering. Speak like an objective industry advisor, avoiding pleasantries."
      }
    });

    res.json({
      content: response.text || "I was unable to analyze that. Let's redirect our session back to engineering your career path.",
      isMock: false
    });
  } catch (error) {
    console.error("Error in Gemini Chat route:", error);
    res.json({
      content: "I ran into a connection glitch with the cloud core. However, I highly recommend adding containerized Docker workflows to your index as a starting step!",
      isMock: true
    });
  }
});

// Serve static React files in production, use Vite middleware in development
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Vite] Middleware registered successfully in development mode.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Production] Serving statics from dist folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Career Intelligence full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
