import React from "react";
import { FileSearch, TrendingUp, Mic, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export const FeaturesGrid: React.FC = () => {
  const cards = [
    {
      id: "feature-ats",
      title: "ATS Optimization Engine",
      subTitle: "Align with recruiting algorithms before submission.",
      description: "Our semantic analyzer reviews document structure, scores vocabulary deficits, and maps exact terminology equivalents. This guarantees that your profile ranks at the top of corporate ATS indices.",
      icon: FileSearch,
      accentColor: "from-blue-500/10 to-transparent",
      iconColor: "text-[#0a66c2]",
      borderColor: "group-hover:border-[#0a66c2]/30",
      badges: ["Semantic Mapping", "Keyword Density", "Structural Validator"]
    },
    {
      id: "feature-pivot",
      title: "Market-Trend Role Mapping",
      subTitle: "Discover pivot opportunities you didn't know existed.",
      description: "Expand beyond linear career paths. We index real salary spectrums, job requisitions, and matching benchmarks across 12 sectors to reveal optimal pivot suggestions that maximize compensation.",
      icon: TrendingUp,
      accentColor: "from-emerald-500/10 to-transparent",
      iconColor: "text-emerald-700",
      borderColor: "group-hover:border-emerald-500/30",
      badges: ["Clustered Gaps", "Compensation Maximizer", "Velocity Projections"]
    },
    {
      id: "feature-interview",
      title: "AI Interview Coach",
      subTitle: "Dynamic preparatory rounds calibrated to key benchmarks.",
      description: "Generates high-fidelity feedback rounds based on your target role coordinates. Reviews communication structure, technical semantics, and checks response tone against corporate team cultures.",
      icon: Mic,
      accentColor: "from-purple-500/10 to-transparent",
      iconColor: "text-purple-700",
      borderColor: "group-hover:border-purple-500/30",
      badges: ["Interactive Speech", "Instant Feedback", "Role-Specific Prompts"]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="features-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300"
            id={card.id}
          >
            {/* Ambient Back Glow */}
            <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${card.accentColor} rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-300`} />

            <div>
              {/* Icon Container */}
              <div className={`w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-6 shadow-sm ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Title & Slogan */}
              <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-2 group-hover:text-[#0a66c2] transition-colors duration-200">
                {card.title}
              </h3>
              <p className="text-xs font-semibold text-zinc-600 border-l-2 border-zinc-300 pl-2 py-0.5 mb-4 leading-relaxed italic">
                "{card.subTitle}"
              </p>

              {/* Detailed Description */}
              <p className="text-zinc-650 text-xs sm:text-sm leading-relaxed mb-6 font-sans font-medium">
                {card.description}
              </p>
            </div>

            {/* Keyword tags */}
            <div className="border-t border-zinc-100 pt-4">
              <div className="flex flex-wrap gap-1.5">
                {card.badges.map((badge) => (
                  <span
                    key={badge}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded bg-zinc-50 border border-zinc-250 text-zinc-600 flex items-center gap-1 hover:bg-zinc-100 transition-colors"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-zinc-400" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
