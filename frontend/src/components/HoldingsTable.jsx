const usd = (n) =>
  n != null ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '—';
const pct = (n) => (n != null ? `${n >= 0 ? '+' : ''}${n.toFixed(2)}%` : '—');
const signed = (n, decimals = 2) =>
  n != null ? `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}` : '—';

export default function HoldingsTable({ holdings, onEdit, onDelete }) {
  if (holdings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
        No holdings yet — click <strong className="text-gray-600">+ Add Holding</strong> to get started.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Holdings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Symbol</th>
              <th className="px-5 py-3 text-right">Shares</th>
              <th className="px-5 py-3 text-right">Avg Cost</th>
              <th className="px-5 py-3 text-right">Price</th>
              <th className="px-5 py-3 text-right">Value</th>
              <th className="px-5 py-3 text-right">Gain / Loss</th>
              <th className="px-5 py-3 text-right">Day</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holdings.map((h) => (
              <Row key={h.id} h={h} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ h, onEdit, onDelete }) {
  const gainColor = h.gain == null ? 'text-gray-400' : h.gain >= 0 ? 'text-emerald-600' : 'text-red-500';
  const dayColor = h.change == null ? 'text-gray-400' : h.change >= 0 ? 'text-emerald-600' : 'text-red-500';

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-5 py-3">
        <p className="font-semibold text-gray-900">{h.ticker}</p>
        <p className="text-xs text-gray-400 truncate max-w-[140px]">{h.name}</p>
      </td>
      <td className="px-5 py-3 text-right text-gray-700">{h.shares}</td>
      <td className="px-5 py-3 text-right text-gray-700">{usd(h.avg_cost)}</td>
      <td className="px-5 py-3 text-right text-gray-700">{usd(h.price)}</td>
      <td className="px-5 py-3 text-right font-medium text-gray-900">{usd(h.currentValue)}</td>
      <td className={`px-5 py-3 text-right ${gainColor}`}>
        <p>{usd(h.gain)}</p>
        <p className="text-xs">{pct(h.gainPct)}</p>
      </td>
      <td className={`px-5 py-3 text-right text-xs ${dayColor}`}>
        <p>{signed(h.change)}</p>
        <p>{pct(h.changePct)}</p>
      </td>
      <td className="px-5 py-3 text-right">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(h)}
            className="text-gray-400 hover:text-blue-600 transition-colors text-xs font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(h.id)}
            className="text-gray-400 hover:text-red-500 transition-colors text-xs font-medium"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}
