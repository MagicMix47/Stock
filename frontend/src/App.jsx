import { useState, useEffect, useCallback } from 'react';
import { fetchPortfolio, addHolding, updateHolding, deleteHolding, isAuthenticated, clearToken } from './api';
import SummaryCards from './components/SummaryCards';
import HoldingsTable from './components/HoldingsTable';
import AddHoldingModal from './components/AddHoldingModal';
import AllocationChart from './components/AllocationChart';
import LoginPage from './components/LoginPage';

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPortfolio = useCallback(async (silent = false) => {
    try {
      if (!silent) setError(null);
      else setRefreshing(true);
      const data = await fetchPortfolio();
      setPortfolio(data);
    } catch {
      setError('Failed to load portfolio. Is the backend server running on port 3001?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadPortfolio();
    const interval = setInterval(() => loadPortfolio(true), 60000);
    return () => clearInterval(interval);
  }, [authed, loadPortfolio]);

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
    setPortfolio(null);
    setLoading(true);
  };

  const handleAdd = async (data) => {
    await addHolding(data);
    setShowAddModal(false);
    loadPortfolio(true);
  };

  const handleEdit = async (id, data) => {
    await updateHolding(id, data);
    setEditingHolding(null);
    loadPortfolio(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this holding?')) return;
    await deleteHolding(id);
    loadPortfolio(true);
  };

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Tracker</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Live prices · auto-refreshes every minute
              {refreshing && <span className="ml-2 text-blue-500">Refreshing…</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Holding
            </button>
            <button
              onClick={handleLogout}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Loading portfolio…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {portfolio && (
          <>
            <SummaryCards summary={portfolio.summary} count={portfolio.holdings.length} />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <HoldingsTable
                  holdings={portfolio.holdings}
                  onEdit={setEditingHolding}
                  onDelete={handleDelete}
                />
              </div>
              <div>
                <AllocationChart holdings={portfolio.holdings} />
              </div>
            </div>
          </>
        )}
      </main>

      {showAddModal && (
        <AddHoldingModal
          title="Add Holding"
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingHolding && (
        <AddHoldingModal
          title="Edit Holding"
          initial={editingHolding}
          onSubmit={(data) => handleEdit(editingHolding.id, data)}
          onClose={() => setEditingHolding(null)}
        />
      )}
    </div>
  );
}
