const TICKERS = ["AAPL", "NVDA", "TSLA", "MSFT"];

export default function TickerSelector({ selected, onChange }) {
  return (
    <div className="flex gap-2">
      {TICKERS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
            selected === t
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
