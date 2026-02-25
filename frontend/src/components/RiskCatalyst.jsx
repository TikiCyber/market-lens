export default function RiskCatalyst({ risks, catalysts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-red-400 mb-3">Key Risks</h2>
        <ul className="space-y-2">
          {risks.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-400">
              <span className="text-red-600 mt-0.5">▸</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold text-emerald-400 mb-3">Key Catalysts</h2>
        <ul className="space-y-2">
          {catalysts.map((c, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-400">
              <span className="text-emerald-600 mt-0.5">▸</span>
              {c}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
