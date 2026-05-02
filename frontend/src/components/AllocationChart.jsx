import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6'];

const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function AllocationChart({ holdings }) {
  const data = holdings
    .filter((h) => h.currentValue != null && h.currentValue > 0)
    .map((h) => ({ name: h.ticker, value: parseFloat(h.currentValue.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 h-full">
      <h2 className="font-semibold text-gray-800 mb-4">Allocation</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No data to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => usd(v)}
              contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
