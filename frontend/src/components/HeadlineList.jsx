const SENTIMENT_DOT = {
  Positive: "bg-emerald-400",
  Negative: "bg-red-400",
  Neutral:  "bg-yellow-400",
};

const IMPACT_BADGE = {
  High:   "text-red-400 bg-red-950",
  Medium: "text-yellow-400 bg-yellow-950",
  Low:    "text-gray-400 bg-gray-800",
};

function ScoreBar({ score }) {
  const pct = Math.abs(score) / 2; // score is -100 to 100, bar is 0-50% each side
  const isPositive = score >= 0;
  const color = score > 20 ? "bg-emerald-500" : score < -20 ? "bg-red-500" : "bg-yellow-500";

  return (
    <div className="relative h-1 bg-gray-800 rounded overflow-hidden mt-2">
      {/* center line */}
      <div className="absolute left-1/2 top-0 w-px h-full bg-gray-600" />
      <div
        className={`absolute top-0 h-full ${color} rounded`}
        style={{
          left: isPositive ? "50%" : `${50 - pct}%`,
          width: `${pct}%`,
        }}
      />
    </div>
  );
}

export default function HeadlineList({ headlines }) {
  if (!headlines?.length) return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">Headlines</h2>
      <div className="space-y-4">
        {headlines.map((h, i) => (
          <div key={i} className="flex gap-3">
            <div className="mt-1.5 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${SENTIMENT_DOT[h.sentiment] || "bg-gray-600"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-300 leading-snug">{h.text}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${IMPACT_BADGE[h.impact] || ""}`}>
                    {h.impact}
                  </span>
                  <span className={`text-sm font-mono font-medium tabular-nums ${
                    h.score > 20 ? "text-emerald-400" : h.score < -20 ? "text-red-400" : "text-yellow-400"
                  }`}>
                    {h.score > 0 ? "+" : ""}{h.score}
                  </span>
                </div>
              </div>
              <ScoreBar score={h.score} />
              <p className="text-xs text-gray-600 mt-1">{h.reasoning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
