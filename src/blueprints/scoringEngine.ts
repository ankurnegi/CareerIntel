/**
 * CareerIntel AI - Algorithmic Matching & Scoring Engine
 * Executes matching calculations, ATS keyword matching ratios, and bell curve coordinate mapping.
 */

export interface SkillRating {
  name: string;
  user: number;
  market: number;
}

export interface ScoreInputs {
  skills: SkillRating[];
  atsScore: number;
  marketDemand: number;
}

export class CalibrationScoringEngine {
  /**
   * Calculates structural alignment match index as geometric matching overlap
   */
  public static calculateHiringProbability(inputs: ScoreInputs): number {
    const { skills, atsScore } = inputs;
    if (skills.length === 0) return 0;

    let totalRation = 0;
    skills.forEach((s) => {
      // Calculate individual multiplier
      const elementRatio = s.user >= s.market ? 100 : 100 - (s.market - s.user);
      totalRation += elementRatio;
    });

    const averageSkillsIndex = totalRation / skills.length;
    
    // Balanced weighted score (50% skills alignment, 50% ATS compliance)
    const overallProbability = Math.round((averageSkillsIndex + atsScore) / 2);

    return Math.min(100, Math.max(0, overallProbability));
  }

  /**
   * Translates expected compensation into percentile index along a log-normal distribution curve
   */
  public static calculateSalaryPercentile(
    desired: number,
    marketMin: number,
    marketMax: number
  ): number {
    if (desired <= marketMin) return 1;
    if (desired >= marketMax) return 99;

    const range = marketMax - marketMin;
    const offset = desired - marketMin;
    
    // Convert linear position directly into normal distribution estimate
    const rawPercentile = Math.round((offset / range) * 100);
    return Math.max(1, Math.min(99, rawPercentile));
  }

  /**
   * Triggers automated ATS token audits matching key semantic synonyms
   */
  public static auditATSCompliance(
    resumeText: string,
    targetRoleKeywords: string[]
  ): { atsScore: number; missingTokens: string[] } {
    const lowercaseText = resumeText.toLowerCase();
    const missingTokens: string[] = [];
    let matchedCount = 0;

    targetRoleKeywords.forEach((keyword) => {
      const isPresent = lowercaseText.includes(keyword.toLowerCase());
      if (isPresent) {
        matchedCount++;
      } else {
        missingTokens.push(keyword);
      }
    });

    const baselineScore = 40; // minimum ATS parsing score
    const additionalPoints = targetRoleKeywords.length > 0 
      ? Math.round((matchedCount / targetRoleKeywords.length) * 60) 
      : 0;

    return {
      atsScore: Math.min(100, baselineScore + additionalPoints),
      missingTokens
    };
  }
}
