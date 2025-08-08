import React, { useEffect, useState } from 'react';


import './HoldingsTable.css';

const API = 'http://localhost:5000/api/portfolio/holdings';

export default function HoldingsTable() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(row =>
    Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Symbol', dataIndex: 'symbol', sorter: (a, b) => a.symbol.localeCompare(b.symbol) },
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Quantity', dataIndex: 'quantity', sorter: (a, b) => a.quantity - b.quantity },
    { title: 'Avg Price ₹', dataIndex: 'avgPrice', sorter: (a, b) => a.avgPrice - b.avgPrice },
    { title: 'Current Price ₹', dataIndex: 'currentPrice', sorter: (a, b) => a.currentPrice - b.currentPrice },
    { title: 'Sector', dataIndex: 'sector' },
    { title: 'Market Cap', dataIndex: 'marketCap' },
    { title: 'Value ₹', dataIndex: 'value', sorter: (a, b) => a.value - b.value },
    { title: 'Gain/Loss (₹)', dataIndex: 'gainLoss', sorter: (a, b) => a.gainLoss - b.gainLoss,
      render: val => <span className={val >= 0 ? 'gain' : 'loss'}>{val >= 0 ? '+' : ''}{val}</span> },
    { title: 'Gain/Loss %', dataIndex: 'gainLossPercent', sorter: (a, b) => a.gainLossPercent - b.gainLossPercent,
      render: val => <span className={val >= 0 ? 'gain' : 'loss'}>{(val*100).toFixed(2)}%</span> },
  ];

  return (
    <div className="holdings-table-section">
      <div className="holdings-table-header">
        <h3>Portfolio Holdings</h3>
        <input
          type="text"
          placeholder="Search stocks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240, padding: '6px', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
      </div>
      <div className="holdings-table-wrapper">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Avg Price ₹</th>
                <th>Current Price ₹</th>
                <th>Sector</th>
                <th>Market Cap</th>
                <th>Value ₹</th>
                <th>Gain/Loss (₹)</th>
                <th>Gain/Loss %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="10" style={{textAlign:'center'}}>No holdings found.</td></tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.symbol}>
                    <td>{row.symbol}</td>
                    <td>{row.name}</td>
                    <td>{row.quantity}</td>
                    <td>{row.avgPrice}</td>
                    <td>{row.currentPrice}</td>
                    <td>{row.sector}</td>
                    <td>{row.marketCap}</td>
                    <td>{row.value}</td>
                    <td className={row.gainLoss >= 0 ? 'gain' : 'loss'}>{row.gainLoss >= 0 ? '+' : ''}{row.gainLoss}</td>
                    <td className={row.gainLossPercent >= 0 ? 'gain' : 'loss'}>{(row.gainLossPercent*100).toFixed(2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
