import React, { useEffect, useState } from 'react';
import './TopPerformers.css';

const API = 'http://localhost:5000/api/portfolio/analytics/top-performers';

export default function TopPerformers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(setData)
      .catch(() => setError('Failed to load top performers'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="top-performers-loading">Loading...</div>;
  if (error) return <div className="top-performers-error">{error}</div>;
  if (!data) return null;

  return (
    <div className="top-performers-section">
      <h3>Top Performers & Insights</h3>
      <div className="top-performers-cards">
        <div className="tp-card best">
          <div className="tp-title">Best Performer</div>
          {data.best ? (
            <>
              <div className="tp-symbol">{data.best.Symbol}</div>
              <div className="tp-name">{data.best.Name}</div>
              <div className="tp-gain">{Number(data.best['Gain/Loss %']*100).toFixed(2)}%</div>
            </>
          ) : <div className="tp-none">-</div>}
        </div>
        <div className="tp-card worst">
          <div className="tp-title">Worst Performer</div>
          {data.worst ? (
            <>
              <div className="tp-symbol">{data.worst.Symbol}</div>
              <div className="tp-name">{data.worst.Name}</div>
              <div className="tp-loss">{Number(data.worst['Gain/Loss %']*100).toFixed(2)}%</div>
            </>
          ) : <div className="tp-none">-</div>}
        </div>
        <div className="tp-card insights">
          <div className="tp-title">Key Insights</div>
          <div>Diversification Score: <b>{data.diversification}</b></div>
          <div>Risk Level: <b>{data.risk}</b></div>
        </div>
      </div>
    </div>
  );
}
