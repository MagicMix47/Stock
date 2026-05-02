const usd = (n) =>
  n != null ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '—';
const pct = (n) => (n != null ? `${n >= 0 ? '+' : ''}${n.toFixed(2)}%` : '—');

export default function SummaryCards({ summary, count }) {
  const { totalValue, totalCost, totalGain, totalGainPct } = summary;
  const gainPositive = totalGain >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Portfolio Value" value={usd(totalValue)} />
      <Card label="Total Cost Basis" value={usd(totalCost)} />
      <Card
        label="Total Gain / Loss"
        value={usd(totalGain)}
        sub={pct(totalGainPct)}
        color={gainPositive ? 'text-emerald-600' : 'text-red-500'}
      />
      <Card label="Holdings" value={count} />
    </div>
  );
}

function Card({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`text-sm mt-0.5 ${color}`}>{sub}</p>}
    </div>
  );
}
