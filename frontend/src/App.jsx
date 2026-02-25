import { useState } from "react";
import TickerSelector from "./components/TickerSelector";
import SentimentCard from "./components/SentimentCard";
import HeadlineList from "./components/HeadlineList";
import RiskCatalyst from "./components/RiskCatalyst";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function App() {
  const [ticker, setTicker] = useState("NVDA");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`${API_URL}/api/analyze/${ticker}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            MarketLens
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            LLM-powered stock sentiment analysis
          </p>
        </div>

        {/* controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-start sm:items-center">
          <TickerSelector selected={ticker} onChange={setTicker} />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-md transition-colors"
          >
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950 border border-red-800 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <SentimentCard data={data} ticker={ticker} />
            <HeadlineList headlines={data.headlines} />
            <RiskCatalyst risks={data.key_risks} catalysts={data.key_catalysts} />
          </div>
        )}

        {!data && !loading && (
          <div className="text-center py-20 text-gray-600 text-sm">
            Select a ticker and run analysis to get started
          </div>
        )}

      </div>
    </div>
  );
}
