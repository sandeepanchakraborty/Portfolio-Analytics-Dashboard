import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './PerformanceChart.css';

const API = 'http://localhost:5000/api/portfolio/performance';

export default function PerformanceChart() {
  const [data, setData] = useState([]);
  const [returns, setReturns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(res => {
        setData(res.timeline);
        setReturns(res.returns);
      })
      .catch(() => setError('Failed to load performance chart'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="performance-chart-loading">Loading performance...</div>;
  if (error) return <div className="performance-chart-error">{error}</div>;

  return (
    <div className="performance-chart-section">
      <h3>Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="portfolio" stroke="#1db954" strokeWidth={3} name="Portfolio" />
          <Line type="monotone" dataKey="nifty50" stroke="#0088FE" strokeWidth={2} name="Nifty 50" />
          <Line type="monotone" dataKey="gold" stroke="#FFD700" strokeWidth={2} name="Gold" />
        </LineChart>
      </ResponsiveContainer>
      {returns && (
        <div className="performance-metrics">
          <h4>Returns</h4>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>1 Month</th>
                <th>3 Months</th>
                <th>1 Year</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Portfolio</td>
                <td>{returns.portfolio['1month']}%</td>
                <td>{returns.portfolio['3months']}%</td>
                <td>{returns.portfolio['1year']}%</td>
              </tr>
              <tr>
                <td>Nifty 50</td>
                <td>{returns.nifty50['1month']}%</td>
                <td>{returns.nifty50['3months']}%</td>
                <td>{returns.nifty50['1year']}%</td>
              </tr>
              <tr>
                <td>Gold</td>
                <td>{returns.gold['1month']}%</td>
                <td>{returns.gold['3months']}%</td>
                <td>{returns.gold['1year']}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
