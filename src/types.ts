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
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
