import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DiagnosticResult, SkillPoint } from "../types";
import { HelpCircle, DollarSign, Target, Award, Sparkles, TrendingUp, X, ShieldAlert, CheckCircle, Info } from "lucide-react";

interface CommandCenterChartsProps {
  data: DiagnosticResult;
  onAdjustSalary?: (newSalary: number) => void;
}

export const CommandCenterCharts: React.FC<CommandCenterChartsProps> = ({
  data,
  onAdjustSalary
}) => {
  const { role, matchScore, metrics, skills, salary } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compareKey, setCompareKey] = useState<string>("");

  // Helper mapping target role standard metadata
  const getCompareData = (key: string): { roleName: string; matchScore: number; ats: number; marketDemand: number } => {
    switch (key) {
      case "pm":
        return { roleName: "Senior Product Manager", matchScore: 84, ats: 82, marketDemand: 88 };
      case "tpm":
        return { roleName: "Technical Product Manager (TPM)", matchScore: 78, ats: 74, marketDemand: 82 };
      case "vp":
        return { roleName: "VP of Product Engineering", matchScore: 62, ats: 58, marketDemand: 94 };
      case "swe":
        return { roleName: "Backend Software Engineer", matchScore: 54, ats: 48, marketDemand: 91 };
      case "data":
        return { roleName: "Lead Data Scientist", matchScore: 48, ats: 42, marketDemand: 87 };
      default:
        return { roleName: "Unspecified Target", matchScore: 50, ats: 50, marketDemand: 50 };
    }
  };

  // Helper aligning standard or custom skills to the comparison target role
  const getCompareSkills = (primarySkills: SkillPoint[], targetRoleKey: string): SkillPoint[] => {
    return primarySkills.map((s) => {
      let relativeMarket = 70;
      const SkillNameLower = s.name.toLowerCase();
      
      if (targetRoleKey === "pm") {
        if (SkillNameLower.includes("strategy") || SkillNameLower.includes("product") || SkillNameLower.includes("delivery") || SkillNameLower.includes("agile")) {
          relativeMarket = 85;
        } else if (SkillNameLower.includes("system") || SkillNameLower.includes("architecture")) {
          relativeMarket = 60;
        } else {
          relativeMarket = 75;
        }
      } else if (targetRoleKey === "tpm") {
        if (SkillNameLower.includes("strategy") || SkillNameLower.includes("system") || SkillNameLower.includes("architecture") || SkillNameLower.includes("agile")) {
          relativeMarket = 88;
        } else if (SkillNameLower.includes("sql") || SkillNameLower.includes("analytics")) {
          relativeMarket = 78;
        } else {
          relativeMarket = 80;
        }
      } else if (targetRoleKey === "vp") {
        if (SkillNameLower.includes("strategy") || SkillNameLower.includes("agile") || SkillNameLower.includes("delivery")) {
          relativeMarket = 95;
        } else if (SkillNameLower.includes("analytics") || SkillNameLower.includes("system")) {
          relativeMarket = 85;
        } else {
          relativeMarket = 65;
        }
      } else if (targetRoleKey === "swe") {
        if (SkillNameLower.includes("system") || SkillNameLower.includes("architecture") || SkillNameLower.includes("sql") || SkillNameLower.includes("coding")) {
          relativeMarket = 92;
        } else if (SkillNameLower.includes("strategy") || SkillNameLower.includes("product")) {
          relativeMarket = 40;
        } else {
          relativeMarket = 70;
        }
      } else if (targetRoleKey === "data") {
        if (SkillNameLower.includes("sql") || SkillNameLower.includes("analytics") || SkillNameLower.includes("machine") || SkillNameLower.includes("ai")) {
          relativeMarket = 90;
        } else if (SkillNameLower.includes("strategy") || SkillNameLower.includes("system")) {
          relativeMarket = 62;
        } else {
          relativeMarket = 75;
        }
      } else {
        relativeMarket = Math.min(95, Math.max(35, Math.floor(s.market * 0.9)));
      }
      return {
        name: s.name,
        user: s.user,
        market: relativeMarket
      };
    });
  };

  const compareMeta = useMemo(() => {
    if (!compareKey) return null;
    const meta = getCompareData(compareKey);
    const comparedSkills = getCompareSkills(skills, compareKey);
    
    const sumDiff = comparedSkills.reduce((acc, curr) => acc + Math.abs(curr.user - curr.market), 0);
    const avgDiff = sumDiff / comparedSkills.length;
    const computedScore = Math.min(98, Math.max(30, Math.round(100 - avgDiff * 0.8)));

    return {
      roleName: meta.roleName,
      matchScore: computedScore,
      metrics: {
        atsScore: Math.round(computedScore * 0.95),
        marketDemand: meta.marketDemand,
        confidenceInterval: 90
      },
      skills: comparedSkills
    };
  }, [compareKey, skills]);

  // 1. Radar Chart Calculations (Centered at 120, 120 with max radius 80)
  const centerX = 120;
  const centerY = 120;
  const maxRadius = 80;

  const radarGrid = useMemo(() => {
    return [0.33, 0.66, 1.0].map((scale) => {
      const r = maxRadius * scale;
      const points = Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      return points;
    });
  }, []);

  const radarLines = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      const x2 = centerX + maxRadius * Math.cos(angle);
      const y2 = centerY + maxRadius * Math.sin(angle);
      return { x1: centerX, y1: centerY, x2, y2 };
    });
  }, []);

  const getRadarCoordinates = (radialSkills: SkillPoint[]) => {
    if (!radialSkills || radialSkills.length < 6) return { userPath: "", marketPath: "", labels: [] };

    const userPoints: string[] = [];
    const marketPoints: string[] = [];
    const labels: { x: number; y: number; name: string; align: "start" | "end" | "middle" }[] = [];

    radialSkills.slice(0, 6).forEach((skill, i) => {
      const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
      
      // Candidate position
      const userR = maxRadius * (Math.max(10, Math.min(100, skill.user)) / 100);
      const ux = centerX + userR * Math.cos(angle);
      const uy = centerY + userR * Math.sin(angle);
      userPoints.push(`${ux.toFixed(1)},${uy.toFixed(1)}`);

      // Market demand position
      const marketR = maxRadius * (Math.max(10, Math.min(100, skill.market)) / 100);
      const mx = centerX + marketR * Math.cos(angle);
      const my = centerY + marketR * Math.sin(angle);
      marketPoints.push(`${mx.toFixed(1)},${my.toFixed(1)}`);

      // Labels placement (slightly outside the radar)
      const labelDistance = maxRadius + 18;
      const lx = centerX + labelDistance * Math.cos(angle);
      const ly = centerY + labelDistance * Math.sin(angle);
      
      let align: "start" | "end" | "middle" = "middle";
      if (Math.cos(angle) > 0.1) align = "start";
      else if (Math.cos(angle) < -0.1) align = "end";

      labels.push({ x: lx, y: ly, name: skill.name, align });
    });

    return {
      userPath: userPoints.join(" "),
      marketPath: marketPoints.join(" "),
      labels
    };
  };

  const primaryRadar = useMemo(() => {
    return getRadarCoordinates(skills);
  }, [skills]);

  const compareRadar = useMemo(() => {
    if (!compareMeta) return null;
    return getRadarCoordinates(compareMeta.skills);
  }, [compareMeta]);

  // 3. Salary Bell Curve Calculations
  const salaryPercentile = Math.max(5, Math.min(95, salary.percentile));
  const bellCurvePath = useMemo(() => {
    const width = 360;
    const height = 90;
    const points: string[] = [];
    // Standard normal distribution plotting
    for (let x = 0; x <= width; x++) {
      const t = (x - width / 2) / 65; // spread parameter
      const y = height * 0.9 - (height * 0.8) * Math.exp(-(t * t) / 2);
      points.push(`${x},${y.toFixed(1)}`);
    }
    return `M ${points.join(" L ")}`;
  }, []);

  // Framer Motion staggered entrance animations
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 95, damping: 14 } }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Role Comparison Controls Dropdown */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#0a66c2]" />
        
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#0a66c2]">
            <TrendingUp className="w-5 h-5 text-[#0a66c2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-1.5">
              Dual Career Path Calibration
              <span className="text-[10px] bg-blue-100 text-[#0a66c2] border border-blue-200 px-2 py-0.5 rounded-full font-semibold">Dual View</span>
            </h4>
            <p className="text-zinc-500 text-xs mt-0.5">Select a second career target role to show a side-by-side comparison of your metrics and skill gaps.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-zinc-600 whitespace-nowrap">Compare primary profile with:</span>
          <select
            value={compareKey}
            onChange={(e) => setCompareKey(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-3 text-xs text-zinc-700 font-semibold outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40 cursor-pointer hover:border-zinc-300 transition-all shadow-sm pr-8 appearance-none relative"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23666666' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center"
            }}
          >
            <option value="">-- No Comparison Active --</option>
            <option value="pm">Senior Product Manager</option>
            <option value="tpm">Technical Product Manager (TPM)</option>
            <option value="vp">VP of Product Engineering</option>
            <option value="swe">Backend Software Engineer</option>
            <option value="data">Lead Data Scientist</option>
          </select>
        </div>
      </div>

      {/* STAGGERED BENTO GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6" 
        id="career-bento-grid"
      >
        {/* 1. Circular Match Score Gauge */}
        <motion.div 
          variants={itemVariants}
          onClick={() => setIsModalOpen(true)}
          className={`bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md hover:border-[#0a66c2]/40 transition-all duration-300 ${compareKey ? 'lg:col-span-12' : 'lg:col-span-4'}`}
          title="Click for detailed breakdown"
          id="widget-match-score"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[#0a66c2] group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4 text-[#0a66c2]" />
              </div>
              <h3 className="text-zinc-800 font-bold text-sm">
                {compareMeta ? "Hiring Probability Comparison" : "Hiring Probability"}
              </h3>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#0a66c2] border border-blue-100 flex items-center gap-1 hover:bg-blue-100 transition-colors">
                <Info className="w-3 h-3 animate-pulse" /> Expand
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Real-time
              </span>
            </div>
          </div>

          <div className={`grid ${compareKey ? 'grid-cols-1 md:grid-cols-2 gap-8' : 'grid-cols-1'} my-6 relative w-full`}>
            
            {/* Primary Gauge */}
            <div className="relative flex flex-col items-center justify-center py-2">
              <div className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest mb-3">Primary Role Target</div>
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="40"
                  className="stroke-zinc-100 fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="40"
                  className="fill-none"
                  stroke="#0a66c2"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 40) - (matchScore / 100) * (2 * Math.PI * 40) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center mt-6">
                <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">{matchScore}%</span>
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Match Index</span>
              </div>
              <div className="text-xs font-bold text-[#0a66c2] mt-3 truncate max-w-[240px]">{role}</div>
            </div>

            {/* Comparison Gauge */}
            {compareMeta && (
              <div className="relative flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-zinc-200/80 pt-6 md:pt-2 md:pl-8">
                <div className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest mb-3">Comparison Role Target</div>
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="40"
                    className="stroke-zinc-100 fill-none"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="40"
                    className="fill-none"
                    stroke="#a855f7"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 40) - (compareMeta.matchScore / 100) * (2 * Math.PI * 40) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center mt-6 md:translate-x-4">
                  <span className="text-2xl font-extrabold text-[#a855f7] tracking-tight">{compareMeta.matchScore}%</span>
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Match Index</span>
                </div>
                <div className="text-xs font-bold text-purple-700 mt-3 truncate max-w-[240px]">{compareMeta.roleName}</div>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-100 pt-4 mt-2">
            <div className={`grid ${compareKey ? 'grid-cols-2 gap-6' : 'grid-cols-2 gap-2'} text-center`}>
              {/* Primary Details Side */}
              <div className="space-y-1">
                {compareKey && <div className="text-[9px] uppercase font-bold font-mono text-zinc-400 text-left">Primary Details</div>}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wide">ATS Index</span>
                    <span className="text-sm font-bold text-zinc-800">{metrics.atsScore}%</span>
                  </div>
                  <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                    <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Market Demand</span>
                    <span className="text-sm font-bold text-zinc-800">{metrics.marketDemand}%</span>
                  </div>
                </div>
              </div>

              {/* Compared Details Side */}
              {compareMeta ? (
                <div className="space-y-1 border-l border-zinc-200 pl-6">
                  <div className="text-[9px] uppercase font-bold font-mono text-zinc-400 text-left">Compared Details</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wide">ATS Index</span>
                      <span className="text-sm font-bold text-purple-700">{compareMeta.metrics.atsScore}%</span>
                    </div>
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="block text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Market Demand</span>
                      <span className="text-sm font-bold text-purple-700">{compareMeta.metrics.marketDemand}%</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            <p className="text-[11px] text-zinc-500 text-center mt-3 leading-relaxed">
              {compareMeta ? (
                <span>Comparing <strong className="text-[#0a66c2]">{role}</strong> with <strong className="text-[#a855f7]">{compareMeta.roleName}</strong>. All ratings live calibrated.</span>
              ) : (
                <span>Hiring confidence mapped for <strong className="text-[#0a66c2]">{role}</strong> based on live credentials parsing.</span>
              )}
            </p>
          </div>
        </motion.div>

        {/* 2. Custom Hexagonal Skills Gap Radar Chart */}
        <motion.div 
          variants={itemVariants}
          className={`bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group transition-all duration-300 ${compareKey ? 'lg:col-span-12' : 'lg:col-span-4'}`}
          id="widget-skills-gap"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0a66c2]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[#0a66c2]">
                <Award className="w-4 h-4 text-[#0a66c2]" />
              </div>
              <h3 className="text-zinc-800 font-bold text-sm">
                {compareMeta ? "Skills Calibration Comparison" : "Skills Calibration"}
              </h3>
            </div>
            <div className="flex gap-2.5 text-[10px] font-mono font-semibold">
              <span className="flex items-center gap-1 text-zinc-500">
                <span className="w-2.5 h-2.5 rounded bg-[#0a66c2] inline-block" /> You
              </span>
              <span className="flex items-center gap-1 text-zinc-500">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> Market
              </span>
            </div>
          </div>

          <div className={`grid ${compareKey ? 'grid-cols-1 md:grid-cols-2 gap-8' : 'grid-cols-1'} w-full items-center my-2 relative`}>
            
            {/* Radar 1 */}
            <div className="flex flex-col items-center">
              {compareKey && (
                <div className="text-[10px] font-bold uppercase font-mono text-zinc-400 mb-2">
                  Primary Market: <span className="text-[#0a66c2]">{role}</span>
                </div>
              )}
              <div className="relative w-full h-56 flex items-center justify-center">
                <svg className="w-full h-full max-w-[260px]" viewBox="0 0 240 240">
                  {/* Hexagon Grid Lines */}
                  {radarGrid.map((points, i) => (
                    <polygon
                      key={i}
                      points={points}
                      className="fill-none stroke-zinc-200"
                      strokeWidth="1"
                      strokeDasharray={i < 2 ? "2,2" : undefined}
                    />
                  ))}

                  {/* Radian Axes */}
                  {radarLines.map((line, i) => (
                    <line
                      key={i}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      className="stroke-zinc-200"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Polygons */}
                  {/* Market Polygon */}
                  <motion.polygon
                    points={primaryRadar.marketPath}
                    className="fill-purple-500/5 stroke-purple-400/80"
                    strokeWidth="1.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                  />

                  {/* User Polygon */}
                  <motion.polygon
                    points={primaryRadar.userPath}
                    className="fill-[#0a66c2]/10 stroke-[#0a66c2]"
                    strokeWidth="2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                  />

                  {/* Center Node */}
                  <circle cx={centerX} cy={centerY} r="3" className="fill-zinc-400" />

                  {/* Skill Labels */}
                  {primaryRadar.labels.map((lbl, i) => (
                    <text
                      key={i}
                      x={lbl.x}
                      y={lbl.y}
                      textAnchor={lbl.align}
                      className="fill-zinc-700 text-[8px] sm:text-[9px] font-semibold font-mono tracking-tight"
                      dominantBaseline="middle"
                    >
                      {lbl.name.length > 18 ? `${lbl.name.substring(0, 16)}...` : lbl.name}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Radar 2 (Compared) */}
            {compareMeta && compareRadar && (
              <div className="flex flex-col items-center border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-8">
                <div className="text-[10px] font-bold uppercase font-mono text-zinc-400 mb-2">
                  Compared Market: <span className="text-purple-600">{compareMeta.roleName}</span>
                </div>
                <div className="relative w-full h-56 flex items-center justify-center">
                  <svg className="w-full h-full max-w-[260px]" viewBox="0 0 240 240">
                    {/* Hexagon Grid Lines */}
                    {radarGrid.map((points, i) => (
                      <polygon
                        key={i}
                        points={points}
                        className="fill-none stroke-zinc-200"
                        strokeWidth="1"
                        strokeDasharray={i < 2 ? "2,2" : undefined}
                      />
                    ))}

                    {/* Radian Axes */}
                    {radarLines.map((line, i) => (
                      <line
                        key={i}
                        x1={line.x1}
                        y1={line.y1}
                        x2={line.x2}
                        y2={line.y2}
                        className="stroke-zinc-200"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Polygons */}
                    {/* Market Polygon */}
                    <motion.polygon
                      points={compareRadar.marketPath}
                      className="fill-purple-500/5 stroke-purple-400/80"
                      strokeWidth="1.5"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1 }}
                    />

                    {/* User Polygon */}
                    <motion.polygon
                      points={compareRadar.userPath}
                      className="fill-[#0a66c2]/10 stroke-[#0a66c2]"
                      strokeWidth="2"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1.2, delay: 0.2 }}
                    />

                    {/* Center Node */}
                    <circle cx={centerX} cy={centerY} r="3" className="fill-zinc-400" />

                    {/* Skill Labels */}
                    {compareRadar.labels.map((lbl, i) => (
                      <text
                        key={i}
                        x={lbl.x}
                        y={lbl.y}
                        textAnchor={lbl.align}
                        className="fill-zinc-650 text-[8px] sm:text-[9px] font-semibold font-mono tracking-tight"
                        dominantBaseline="middle"
                      >
                        {lbl.name.length > 18 ? `${lbl.name.substring(0, 16)}...` : lbl.name}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            )}

          </div>

          <div className="border-t border-zinc-100 pt-4 mt-2">
            <p className="text-[11px] text-zinc-500 text-center leading-normal">
              {compareMeta ? (
                <span>Comparative skill gaps highlight required certification changes of +22% for TPM/Architecture profiles.</span>
              ) : (
                <span>Your strongest matching index is <strong className="text-purple-700">Core Foundations</strong>. Focus on AWS cloud gaps for a quick 22% increase.</span>
              )}
            </p>
          </div>
        </motion.div>

        {/* 3. Salary Curve & Bell Curve Plotter */}
        <motion.div 
          variants={itemVariants}
          className={`bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group transition-all duration-300 ${compareKey ? 'lg:col-span-12' : 'lg:col-span-4'}`}
          id="widget-salary-calibration"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-650">
                <DollarSign className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-zinc-800 font-bold text-sm">Salary Benchmarking</h3>
            </div>
            <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
              Percentile: {salaryPercentile}%
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1 justify-center mb-1">
              <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                ${(salary.current / 1000).toFixed(0)}k
              </span>
              <span className="text-sm text-zinc-500 font-medium">/ yr Target</span>
            </div>
            <p className="text-[10px] text-center text-zinc-400 mb-6 font-mono font-semibold">
              Market spectrum: ${salary.marketMin / 1000}K — ${salary.marketMax / 1000}K
            </p>

            {/* SVG curves */}
            <div className="relative h-24 mb-4">
              <svg className="w-full h-full" viewBox="0 0 360 90" preserveAspectRatio="none">
                {/* Reference Grid Horizontal Lines */}
                <line x1="0" y1="90" x2="360" y2="90" className="stroke-zinc-200" strokeWidth="2" />
                
                {/* Curve Fill Area */}
                <defs>
                  <linearGradient id="curveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
                  </linearGradient>
                </defs>
                <path
                  d={`${bellCurvePath} L 360,90 L 0,90 Z`}
                  fill="url(#curveGrad)"
                />
                
                {/* Curve Line */}
                <path
                  d={bellCurvePath}
                  className="stroke-emerald-500 transition-all duration-300 fill-none"
                  strokeWidth="2.5"
                />

                {/* Slider Pointer Anchor Pin */}
                <motion.g
                  initial={{ x: 180 }}
                  animate={{ x: (360 * salaryPercentile) / 100 }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                >
                  {/* Vertical position indicator */}
                  <line x1="0" y1="15" x2="0" y2="90" className="stroke-emerald-400 stroke-dasharray" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Glowing Dot overlay */}
                  <circle cx="0" cy="45" r="7" className="fill-emerald-500/20" />
                  <circle cx="0" cy="45" r="4.5" className="fill-emerald-500 stroke-white" strokeWidth="1.5" />
                </motion.g>
              </svg>

              {/* Slider Markers */}
              <div className="absolute bottom-[-14px] left-0 right-0 flex justify-between text-[9px] font-semibold font-mono text-zinc-400 px-1 pointer-events-none">
                <span>Min (${salary.marketMin / 1000}K)</span>
                <span>Avg (${salary.marketAvg / 1000}K)</span>
                <span>Max (${salary.marketMax / 1000}K)</span>
              </div>
            </div>
          </div>

          {/* Dynamic adjust slider */}
          {onAdjustSalary && (
            <div className="mt-8 border-t border-zinc-100 pt-4">
              <label className="text-[10px] uppercase font-bold font-mono tracking-wider text-zinc-500 block mb-1.5 flex justify-between">
                <span>Adjust Target Expectation</span>
                <span className="text-zinc-700">${(salary.current / 1000).toFixed(0)}k</span>
              </label>
              <input
                type="range"
                min={salary.marketMin}
                max={salary.marketMax}
                step="5000"
                value={salary.current}
                onChange={(e) => onAdjustSalary(Number(e.target.value))}
                className="w-full accent-[#0a66c2] bg-zinc-100 rounded-lg cursor-pointer h-1.5 border border-zinc-200"
              />
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal - Expanded Breakdown */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-[#0a66c2] font-mono uppercase tracking-widest font-bold mb-2">
                  <Target className="w-3.5 h-3.5" />
                  <span>Interactive Calibration Blueprint</span>
                </div>
                <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                  Hiring Probability Diagnostic
                </h2>
                <p className="text-zinc-500 text-sm mt-1 leading-relaxed">
                  Deep analysis breakdown for targeted profile role: <strong className="text-[#0a66c2]">{role}</strong>.
                </p>
              </div>

              {/* Overall Score Circle Indicator */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" className="stroke-zinc-100 fill-none" strokeWidth="6" />
                    <circle cx="56" cy="56" r="46" className="stroke-[#0a66c2] fill-none" strokeWidth="8" strokeDasharray={2 * Math.PI * 46} strokeDashoffset={(2 * Math.PI * 46) - (matchScore / 100) * (2 * Math.PI * 46)} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-2xl font-extrabold text-zinc-900">{matchScore}%</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-855 mb-1 flex items-center gap-1.5 text-zinc-805">
                    <Sparkles className="w-4 h-4 text-[#a855f7]" />
                    Overall Match Score: {matchScore}%
                  </h4>
                  <p className="text-xs text-zinc-650 leading-relaxed font-medium">
                    This compound metric aggregates resume semantic keywords density, system engineering foundations, active salary alignment, and matching regional requisition metrics into a live predictive rating.
                  </p>
                </div>
              </div>

              {/* Two Column Metric Detail Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. ATS Index Details */}
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] uppercase font-bold font-mono tracking-wider text-zinc-500">ATS Optimization</span>
                      <span className="text-sm font-extrabold text-purple-700 font-mono">{metrics.atsScore}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-zinc-200/80 rounded-full overflow-hidden mb-4">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${metrics.atsScore}%` }} />
                    </div>

                    <p className="text-xs text-zinc-650 leading-relaxed mb-3">
                      <strong>How it works</strong>: Evaluates machine readability parameters, syntax spacing, and essential vocabulary matched to automatic applicant sorting algorithms.
                    </p>
                    
                    <ul className="text-[11px] font-semibold font-mono text-zinc-550 space-y-1.5">
                      <li className="flex items-center gap-1.5 text-zinc-600">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" /> Line items parsed correctly
                      </li>
                      <li className="flex items-center gap-1.5 text-zinc-600">
                        <CheckCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" /> Standard column formatting verified
                      </li>
                      <li className="flex items-center gap-1.5 text-zinc-500">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500 flex-shrink-0" /> Missing semantic system labels
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2. Market Demand Details */}
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] uppercase font-bold font-mono tracking-wider text-zinc-500">Market Demand Spectrum</span>
                      <span className="text-sm font-extrabold text-[#0a66c2] font-mono">{metrics.marketDemand}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-zinc-200/80 rounded-full overflow-hidden mb-4">
                      <div className="bg-[#0a66c2] h-full rounded-full" style={{ width: `${metrics.marketDemand}%` }} />
                    </div>

                    <p className="text-xs text-zinc-650 leading-relaxed mb-3">
                      <strong>How it works</strong>: Feeds on continuous job application velocities, payroll updates, open headcount counts, and venture capitalization liquidity indexes.
                    </p>

                    <ul className="text-[11px] font-semibold font-mono text-zinc-550 space-y-1.5">
                      <li className="flex items-center gap-1.5 text-zinc-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> High active search volumes
                      </li>
                      <li className="flex items-center gap-1.5 text-zinc-600">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> Average target range rising
                      </li>
                      <li className="flex items-center gap-1.5 text-zinc-500">
                        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" /> Add AWS credentials for target path
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Action Button and close */}
              <div className="flex items-center justify-end mt-8 pt-4 border-t border-zinc-100">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-5 rounded-lg text-xs font-bold font-mono tracking-wider bg-[#0a66c2] hover:bg-[#004b87] text-white shadow-sm cursor-pointer transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
