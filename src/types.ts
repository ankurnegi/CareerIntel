export interface SkillPoint {
  name: string;
  user: number;
  market: number;
}

export interface PivotOpportunity {
  role: string;
  likelihood: string;
  why: string;
}

export interface SalaryData {
  current: number;
  marketMin: number;
  marketAvg: number;
  marketMax: number;
  percentile: number;
}

export interface DiagnosticResult {
  role: string;
  matchScore: number;
  metrics: {
    atsScore: number;
    marketDemand: number;
    confidenceInterval: number;
  };
  skills: SkillPoint[];
  salary: SalaryData;
  pivotOpportunities: PivotOpportunity[];
  atsInsights: string[];
  isMock?: boolean;
  isValid?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface RoadmapPhase {
  title: string;
  description: string;
  milestones: string[];
  certification: string;
  estimatedHours: number;
}

export interface LearningRoadmap {
  skillGap: string;
  targetRole: string;
  milestones: {
    day30: RoadmapPhase;
    day90: RoadmapPhase;
    day180: RoadmapPhase;
  };
  generalSummary: string;
}
