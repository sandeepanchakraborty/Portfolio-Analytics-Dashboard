import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AllocationCharts.css';

const SECTOR_API = 'http://localhost:5000/api/portfolio/analytics/sector-distribution';
const CAP_API = 'http://localhost:5000/api/portfolio/analytics/marketcap-distribution';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6F91', '#FFD6E0', '#B5EAD7', '#FFB347'];

export default function AllocationCharts() {
  const [sectorData, setSectorData] = useState([]);
  const [capData, setCapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(SECTOR_API).then(res => res.json()),
      fetch(CAP_API).then(res => res.json())
    ])
      .then(([sector, cap]) => {
        setSectorData(Object.entries(sector.sectors).map(([name, value]) => ({ name, value })));
        setCapData(Object.entries(cap.marketCap).map(([name, value]) => ({ name, value })));
      })
      .catch(() => setError('Failed to load allocation charts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="allocation-charts-loading">Loading charts...</div>;
  if (error) return <div className="allocation-charts-error">{error}</div>;

  return (
    <div className="allocation-charts">
      <div className="chart-card">
        <h3>Sector Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={sectorData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              label={({ percent }) => (
                <text style={{ fontWeight: 'bold', fontSize: 13, fill: '#222' }}>{`${(percent * 100).toFixed(1)}%`}</text>
              )}
              labelLine={false}
              isAnimationActive={false}
            >
              {sectorData.map((entry, idx) => (
                <Cell key={`cell-sector-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`₹ ${value.toLocaleString()}`, name]} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ right: 20, top: 30, fontSize: 14, lineHeight: 2.1, width: 140, overflow: 'auto', maxHeight: 200 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-card">
        <h3>Market Cap Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={capData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              label={({ percent }) => (
                <text style={{ fontWeight: 'bold', fontSize: 13, fill: '#222' }}>{`${(percent * 100).toFixed(1)}%`}</text>
              )}
              labelLine={false}
              isAnimationActive={false}
            >
              {capData.map((entry, idx) => (
                <Cell key={`cell-cap-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`₹ ${value.toLocaleString()}`, name]} />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ right: 20, top: 30, fontSize: 14, lineHeight: 2.1, width: 140, overflow: 'auto', maxHeight: 200 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
