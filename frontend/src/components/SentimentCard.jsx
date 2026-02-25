const SIGNAL_STYLES = {
  "Strong Buy":  "bg-emerald-900 text-emerald-300 border-emerald-700",
  "Buy":         "bg-green-900 text-green-300 border-green-700",
  "Hold":        "bg-yellow-900 text-yellow-300 border-yellow-700",
  "Sell":        "bg-orange-900 text-orange-300 border-orange-700",
  "Strong Sell": "bg-red-900 text-red-300 border-red-700",
};

const SENTIMENT_COLOR = {
  Bullish: "text-emerald-400",
  Bearish: "text-red-400",
  Neutral: "text-yellow-400",
};

export default function SentimentCard({ data, ticker }) {
  const scoreColor =
    data.sentiment_score > 20
      ? "text-emerald-400"
      : data.sentiment_score < -20
      ? "text-red-400"
      : "text-yellow-400";

  const signalStyle = SIGNAL_STYLES[data.signal] || "bg-gray-800 text-gray-300 border-gray-600";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{ticker} — Sentiment Score</div>
          <div className={`text-5xl font-bold tabular-nums ${scoreColor}`}>
            {data.sentiment_score > 0 ? "+" : ""}{data.sentiment_score}
          </div>
          <div className={`text-sm mt-2 font-medium ${SENTIMENT_COLOR[data.overall_sentiment]}`}>
            {data.overall_sentiment}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <span className={`px-3 py-1 text-sm font-medium rounded border w-fit ${signalStyle}`}>
            {data.signal}
          </span>
          <div className="text-xs text-gray-500">
            Confidence: <span className="text-gray-300">{data.confidence}%</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-400 leading-relaxed border-t border-gray-800 pt-4">
        {data.summary}
      </p>
    </div>
  );
}
