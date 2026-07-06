import { motion } from 'framer-motion';

interface AIQualityScoreProps {
  evaluation: {
    overallScore: number;
    scores: {
      marketFit: number;
      egyptMarketFit: number;
      feasibility: number;
      financialReality: number;
      executionClarity: number;
      founderAlignment: number;
    };
    recommendations: string[];
  };
}

export const AIQualityScore = ({ evaluation }: AIQualityScoreProps) => {
  if (!evaluation) return null;

  const { overallScore, scores, recommendations } = evaluation;

  const scoreColor = overallScore >= 90 ? 'text-green-400' : overallScore >= 75 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = overallScore >= 90 ? 'bg-green-400/10' : overallScore >= 75 ? 'bg-yellow-400/10' : 'bg-red-400/10';

  const metrics = [
    { label: 'Market Fit', value: scores.marketFit },
    { label: 'Egypt Market', value: scores.egyptMarketFit },
    { label: 'Feasibility', value: scores.feasibility },
    { label: 'Financial', value: scores.financialReality },
    { label: 'Execution', value: scores.executionClarity },
    { label: 'Founder Fit', value: scores.founderAlignment }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-8 shadow-2xl"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">AI Quality Score</h2>
          <p className="text-gray-400 text-sm">Evaluated against startup & market reality constraints.</p>
        </div>
        <div className={`px-6 py-4 rounded-2xl flex flex-col items-center ${scoreBg}`}>
          <span className={`text-4xl font-bold ${scoreColor}`}>{overallScore}</span>
          <span className="text-white/50 text-xs font-medium uppercase tracking-widest mt-1">/ 100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {metrics.map(metric => (
          <div key={metric.label} className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium">{metric.label}</span>
              <span className="text-white font-mono">{metric.value}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-[#008465] to-[#00b37e] rounded-full"
              />
            </div>
          </div>
        ))}
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="pt-6 border-t border-white/5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="text-emerald-400">✧</span> AI Recommendations
          </h3>
          <ul className="flex flex-col gap-3">
            {recommendations.map((rec, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="text-gray-300 text-sm flex items-start gap-3 bg-white/5 p-4 rounded-xl"
              >
                <div className="min-w-1.5 min-h-1.5 bg-emerald-400 rounded-full mt-2 shadow-[0_0_8px_rgba(0,179,126,0.8)]" />
                <span className="leading-relaxed">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};
