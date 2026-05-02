import { useState } from 'react';

export default function AddHoldingModal({ title, onSubmit, onClose, initial }) {
  const [form, setForm] = useState({
    ticker: initial?.ticker ?? '',
    shares: initial?.shares ?? '',
    avg_cost: initial?.avg_cost ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ticker || form.shares === '' || form.avg_cost === '') {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ ...form, ticker: form.ticker.toUpperCase() });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Ticker Symbol" hint="e.g. AAPL, TSLA, VOO">
            <input
              type="text"
              value={form.ticker}
              onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase() }))}
              placeholder="AAPL"
              disabled={!!initial}
              className="input disabled:bg-gray-50 disabled:cursor-not-allowed"
              autoFocus={!initial}
            />
          </Field>

          <Field label="Number of Shares">
            <input
              type="number"
              value={form.shares}
              onChange={set('shares')}
              placeholder="10"
              min="0.000001"
              step="any"
              className="input"
            />
          </Field>

          <Field label="Average Cost per Share ($)">
            <input
              type="number"
              value={form.avg_cost}
              onChange={set('avg_cost')}
              placeholder="150.00"
              min="0.000001"
              step="any"
              className="input"
            />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1 font-normal text-gray-400 text-xs">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
