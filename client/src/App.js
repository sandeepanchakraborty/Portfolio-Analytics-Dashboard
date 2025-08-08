

import React, { useEffect, useState } from 'react';
import './App.css';
import OverviewCards from './components/OverviewCards';
import AllocationCharts from './components/AllocationCharts';
import HoldingsTable from './components/HoldingsTable';
import PerformanceChart from './components/PerformanceChart';
import TopPerformers from './components/TopPerformers';

const API = 'http://localhost:5000/api/portfolio';

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [form, setForm] = useState({});
  const [editSymbol, setEditSymbol] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setPortfolio(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch portfolio.');
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchTotalValue = async () => {
    try {
      const res = await fetch(`${API}/analytics/total-value`);
      const data = await res.json();
      setTotalValue(data.totalValue || 0);
    } catch {
      setTotalValue(0);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchTotalValue();
  }, []);

  // Handle form input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update entry
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editSymbol !== null) {
        await fetch(`${API}/symbol/${encodeURIComponent(editSymbol)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setForm({});
      setEditSymbol(null);
      fetchPortfolio();
      fetchTotalValue();
    } catch {
      setError('Failed to save entry.');
    }
  };

  // Edit entry
  const handleEdit = idx => {
    setForm(portfolio[idx]);
    setEditSymbol(portfolio[idx]?.Symbol || null);
  };

  // Delete entry
  const handleDelete = async idx => {
    setError('');
    try {
      const symbol = portfolio[idx]?.Symbol;
      if (!symbol) throw new Error('No Symbol found for entry.');
      await fetch(`${API}/symbol/${encodeURIComponent(symbol)}`, { method: 'DELETE' });
      fetchPortfolio();
      fetchTotalValue();
    } catch {
      setError('Failed to delete entry.');
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setForm({});
    setEditSymbol(null);
  };

  // Get all unique keys for table columns
  const columns = React.useMemo(() => {
    const keys = new Set();
    portfolio.forEach(entry => Object.keys(entry).forEach(k => keys.add(k)));
    Object.keys(form).forEach(k => keys.add(k));
    return Array.from(keys);
  }, [portfolio, form]);

  return (
    <div className="App enhanced-ui">
      <aside className="sidebar">
        <h2>Portfolio</h2>
        <div className="card analytics-card">
          <div className="card-title">Total Value</div>
          <div className="card-value">₹ {totalValue.toLocaleString()}</div>
        </div>
        <div className="card info-card">
          <div className="card-title">Entries</div>
          <div className="card-value">{portfolio.length}</div>
        </div>
        <div className="sidebar-footer">
          <span>Excel-powered backend</span>
        </div>
      </aside>
      <main className="main-content">
  <OverviewCards />
  <AllocationCharts />
  <PerformanceChart />
  <TopPerformers />
  <HoldingsTable />
        <h1>Portfolio Management</h1>
        <section className="form-section">
          <h3>{editSymbol !== null ? 'Edit Entry' : 'Add New Entry'}</h3>
          <form className="portfolio-form" onSubmit={handleSubmit}>
            {columns.map(col => (
              <div key={col} className="form-group">
                <label>{col}</label>
                <input
                  name={col}
                  value={form[col] || ''}
                  onChange={handleChange}
                  required={col === 'Value'}
                  type={col === 'Value' ? 'number' : 'text'}
                />
              </div>
            ))}
            <div className="form-actions">
              <button type="submit" className="primary-btn">{editSymbol !== null ? 'Update' : 'Add'} Entry</button>
              {editSymbol !== null && <button type="button" className="secondary-btn" onClick={handleCancel}>Cancel</button>}
            </div>
          </form>
          {error && <div className="error">{error}</div>}
        </section>
        <section className="table-section">
          <h2>Portfolio Entries</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="table-wrapper">
              <table className="portfolio-table">
                <thead>
                  <tr>
                    {columns.map(col => <th key={col}>{col}</th>)}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((entry, idx) => (
                    <tr key={entry.Symbol || idx}>
                      {columns.map(col => (
                        <td key={col} data-label={col}>{entry[col]}</td>
                      ))}
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(idx)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(idx)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
