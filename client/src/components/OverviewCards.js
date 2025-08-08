import React, { useEffect, useState } from 'react';
import './OverviewCards.css';

const API = 'http://localhost:5000/api/portfolio/analytics/overview';

export default function OverviewCards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(setData)
      .catch(() => setError('Failed to load overview'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="overview-cards-loading">Loading...</div>;
  if (error) return <div className="overview-cards-error">{error}</div>;
  if (!data) return null;

  return (
    <div className="overview-cards">
      <div className="overview-card value-card">
        <div className="oc-title">Total Portfolio Value</div>
        <div className="oc-value">₹ {data.totalValue.toLocaleString()}</div>
      </div>
      <div className={`overview-card gainloss-card ${data.totalPL >= 0 ? 'gain' : 'loss'}`}> 
        <div className="oc-title">Total Gain/Loss</div>
        <div className="oc-value">{data.totalPL >= 0 ? '+' : ''}₹ {data.totalPL.toLocaleString()}</div>
      </div>
      <div className="overview-card perf-card">
        <div className="oc-title">Portfolio Performance %</div>
        <div className={`oc-value ${data.performancePct > 0 ? 'gain' : data.performancePct < 0 ? 'loss' : ''}`}>{data.performancePct.toFixed(2)}%</div>
      </div>
      <div className="overview-card holdings-card">
        <div className="oc-title">Number of Holdings</div>
        <div className="oc-value">{data.holdings}</div>
      </div>
    </div>
  );
}
