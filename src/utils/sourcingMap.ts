/**
 * CareerIntel AI - Data Sourcing & Market Demand Sourcing Map
 * Detailed data dictionary mapping vacancy crawlers, API frequencies, and caching layers.
 */

export interface SourcingMetadata {
  sourceId: string;
  sourceName: string;
  primaryURL: string;
  dataType: "vacancies" | "salaries" | "skill_trends" | "ats_standards";
  collectionMethod: "API_REST" | "WEB_SCRAPE" | "CRON_BATCH" | "USER_FEEDBACK";
  updateFrequency: "REALTIME_POLL" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  cacheTTLMs: number;
  dataFields: string[];
}

export const SOURCING_MAP: SourcingMetadata[] = [
  {
    sourceId: "src-linkedin-jobs",
    sourceName: "LinkedIn Active Vacancies Scraper",
    primaryURL: "api.careerintel.internal/scrapers/linkedin",
    dataType: "vacancies",
    collectionMethod: "WEB_SCRAPE",
    updateFrequency: "DAILY",
    cacheTTLMs: 86400000, // 24 hours
    dataFields: ["jobId", "roleTitle", "companyName", "rawDescription", "salaryRange", "sectorTag"]
  },
  {
    sourceId: "src-indeed-jobs",
    sourceName: "Indeed Vacancies API Integration",
    primaryURL: "api.indeed.com/v2/jobs",
    dataType: "vacancies",
    collectionMethod: "API_REST",
    updateFrequency: "HOURLY",
    cacheTTLMs: 3600000, // 1 hour
    dataFields: ["jobKey", "title", "company", "snippet", "salary", "formattedLocation"]
  },
  {
    sourceId: "src-glassdoor-salaries",
    sourceName: "Glassdoor Compensation Benchmarks Registry",
    primaryURL: "api.glassdoor.com/v1/salaries",
    dataType: "salaries",
    collectionMethod: "CRON_BATCH",
    updateFrequency: "MONTHLY",
    cacheTTLMs: 2592000000, // 30 days
    dataFields: ["roleName", "percentiles", "bonusMedian", "equityAvg", "currencyCode"]
  },
  {
    sourceId: "src-bls-stats",
    sourceName: "US Bureau of Labor Statistics Occupational Index",
    primaryURL: "data.bls.gov/api/v1/occupations",
    dataType: "skill_trends",
    collectionMethod: "API_REST",
    updateFrequency: "MONTHLY",
    cacheTTLMs: 2592000000,
    dataFields: ["socCode", "employmentVolume", "medianAnnualWage", "projectedGrowthRate"]
  },
  {
    sourceId: "src-sem-knowledge",
    sourceName: "Semantic Requisition Grammar Model",
    primaryURL: "api.careerintel.internal/schemas/grammar",
    dataType: "ats_standards",
    collectionMethod: "CRON_BATCH",
    updateFrequency: "WEEKLY",
    cacheTTLMs: 604800000, // 7 days
    dataFields: ["roleNormalized", "synonymGroups", "requiredCertifications", "criticalStack"]
  }
];
