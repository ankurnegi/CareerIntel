/**
 * CareerIntel AI - Real-time Market Integration Blueprint
 * Direct interface simulating live queries to job indexing crawlers and BLS compensation registry API.
 */

export interface MarketVacancy {
  id: string;
  roleTitle: string;
  companyName: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  activeOpenings: number;
  matchingCriticalSkills: string[];
}

export class RealtimeMarketsService {
  private static cache: Map<string, { data: MarketVacancy[]; timestamp: number }> = new Map();
  private static CACHE_TTL = 3600000; // 1 Hour

  /**
   * Crawl and index target vacancies for a given sector tag vector
   */
  public static async fetchActiveVacancies(sectorTags: string[]): Promise<MarketVacancy[]> {
    const cacheKey = sectorTags.sort().join("|");
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
      console.log(`[RealtimeMarkets] Cache hit for sector vector: [${sectorTags.join(", ")}]`);
      return cached.data;
    }

    console.log(`[RealtimeMarkets] Fetching live vacancies for sector: [${sectorTags.join(", ")}]`);
    
    // Simulate API web response with mock vacancy structures matching primary roles
    const mockFeed: MarketVacancy[] = [
      {
        id: "job-001",
        roleTitle: "Senior Consultant - SaaS Product Strategy",
        companyName: "Indeed Enterprise Solutions",
        location: "New York, NY (Hybrid)",
        salaryMin: 135000,
        salaryMax: 175000,
        activeOpenings: 4,
        matchingCriticalSkills: ["Product Strategy", "A/B Testing & Analytics", "Agile Project Delivery"]
      },
      {
        id: "job-002",
        roleTitle: "Senior DevOps Cloud Architect",
        companyName: "CloudLabs Inc",
        location: "Austin, TX (Remote)",
        salaryMin: 145000,
        salaryMax: 190000,
        activeOpenings: 12,
        matchingCriticalSkills: ["System Architecture", "Cloud Deployment", "CI/CD & DevOps"]
      },
      {
        id: "job-003",
        roleTitle: "Lead Technical Systems Architect",
        companyName: "SaaSify Systems",
        location: "San Jose, CA (Onsite)",
        salaryMin: 160000,
        salaryMax: 210000,
        activeOpenings: 3,
        matchingCriticalSkills: ["System Architecture", "SQL & Data Analytics", "AI/ML Integration"]
      }
    ];

    // Cache the resolved result
    this.cache.set(cacheKey, { data: mockFeed, timestamp: now });
    return mockFeed;
  }

  /**
   * Query salary percentiles for specific corporate roles
   */
  public static fetchSalaryBand(roleName: string): { marketMin: number; marketAvg: number; marketMax: number } {
    const cleanRole = roleName.toLowerCase();
    
    if (cleanRole.includes("product") || cleanRole.includes("pm")) {
      return { marketMin: 110000, marketAvg: 148000, marketMax: 195000 };
    }
    if (cleanRole.includes("software") || cleanRole.includes("engineer") || cleanRole.includes("developer")) {
      return { marketMin: 95000, marketAvg: 138000, marketMax: 185000 };
    }
    if (cleanRole.includes("data") || cleanRole.includes("scientist") || cleanRole.includes("analyst")) {
      return { marketMin: 105000, marketAvg: 145000, marketMax: 190000 };
    }
    
    return { marketMin: 85000, marketAvg: 120000, marketMax: 160000 };
  }
}
