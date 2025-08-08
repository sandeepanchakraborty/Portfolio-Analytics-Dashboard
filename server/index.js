const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const EXCEL_PATH = path.join(__dirname, '../Sample Portfolio Dataset for Assignment.xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// Update an entry by Symbol
app.put('/api/portfolio/symbol/:symbol', (req, res) => {
  try {
    const symbol = (req.params.symbol || '').trim().toLowerCase();
    const data = readPortfolio();
    const idx = data.findIndex(entry => String(entry.Symbol || '').trim().toLowerCase() === symbol);
    if (idx === -1) {
      return res.status(404).json({ error: 'Entry not found.' });
    }
    // Update entry fields from request body
    const updated = { ...data[idx], ...req.body };
    data[idx] = updated;
    writePortfolio(data);
    res.json({ message: 'Entry updated.', entry: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry.', details: err.message });
  }
});
app.get('/api/portfolio/holdings', (req, res) => {
  try {
    const data = readPortfolio();
    // Map Excel data to required format
    const holdings = data.map(entry => ({
      symbol: entry['Symbol'],
      name: entry['Name'],
      quantity: Number(entry['Quantity']) || 0,
      avgPrice: Number(entry['Avg. Price ₹']) || 0,
      currentPrice: Number(entry['Current Price ₹']) || 0,
      sector: entry['Sector'],
      marketCap: entry['Market Cap'],
      value: Number(entry['Value ₹']) || 0,
      gainLoss: Number(entry['Gain/Loss (₹)']) || 0,
      gainLossPercent: Number(entry['Gain/Loss %']) || 0
    }));
    console.log('Holdings:', holdings);
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch holdings.', details: err.message });
  }
});

// 2. Portfolio Allocation Endpoint
app.get('/api/portfolio/allocation', (req, res) => {
  try {
    const data = readPortfolio();
    let total = 0;
    const bySector = {};
    const byMarketCap = {};
    data.forEach(entry => {
      const sector = entry['Sector'] || 'Unknown';
      const cap = entry['Market Cap'] || 'Unknown';
      const value = Number(entry['Value ₹']) || 0;
      total += value;
      bySector[sector] = (bySector[sector] || 0) + value;
      byMarketCap[cap] = (byMarketCap[cap] || 0) + value;
    });
    // Convert to required format
    const sectorObj = {};
    Object.entries(bySector).forEach(([k, v]) => {
      sectorObj[k] = { value: v, percentage: total ? +(v/total*100).toFixed(1) : 0 };
    });
    const capObj = {};
    Object.entries(byMarketCap).forEach(([k, v]) => {
      capObj[k] = { value: v, percentage: total ? +(v/total*100).toFixed(1) : 0 };
    });
    const result = { bySector: sectorObj, byMarketCap: capObj };
    console.log('Allocation:', result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch allocation.', details: err.message });
  }
});

// 3. Performance Comparison Endpoint (mocked timeline)
app.get('/api/portfolio/performance', (req, res) => {
  try {
    // In real app, calculate from historical data. Here, mock for demo.
    const timeline = [
      { date: '2024-01-01', portfolio: 650000, nifty50: 21000, gold: 62000 },
      { date: '2024-03-01', portfolio: 680000, nifty50: 22100, gold: 64500 },
      { date: '2024-06-01', portfolio: 700000, nifty50: 23500, gold: 68000 }
    ];
    const returns = {
      portfolio: { '1month': 2.3, '3months': 8.1, '1year': 15.7 },
      nifty50: { '1month': 1.8, '3months': 6.2, '1year': 12.4 },
      gold: { '1month': -0.5, '3months': 4.1, '1year': 8.9 }
    };
    const result = { timeline, returns };
    console.log('Performance:', result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performance.', details: err.message });
  }
});

// 4. Portfolio Summary Endpoint
app.get('/api/portfolio/summary', (req, res) => {
  try {
    const data = readPortfolio();
    let totalValue = 0, totalInvested = 0, totalGainLoss = 0, top = null, worst = null;
    data.forEach(entry => {
      const value = Number(entry['Value ₹']) || 0;
      const invested = Number(entry['Investment ₹']) || 0;
      const gain = Number(entry['Gain/Loss (₹)']) || 0;
      totalValue += value;
      totalInvested += invested;
      totalGainLoss += gain;
      if (!top || (Number(entry['Gain/Loss %']) > Number(top['Gain/Loss %']))) top = entry;
      if (!worst || (Number(entry['Gain/Loss %']) < Number(worst['Gain/Loss %']))) worst = entry;
    });
    const totalGainLossPercent = totalInvested ? +(totalGainLoss/totalInvested*100).toFixed(2) : 0;
    // Diversification: number of unique sectors
    const sectors = new Set(data.map(e => e['Sector']));
    const diversificationScore = +(sectors.size * (data.length ? 10/data.length : 1)).toFixed(1);
    let riskLevel = 'High';
    if (diversificationScore > 7) riskLevel = 'Moderate';
    if (diversificationScore > 9) riskLevel = 'Low';
    const result = {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercent,
      topPerformer: top ? { symbol: top['Symbol'], name: top['Name'], gainPercent: Number(top['Gain/Loss %']) } : null,
      worstPerformer: worst ? { symbol: worst['Symbol'], name: worst['Name'], gainPercent: Number(worst['Gain/Loss %']) } : null,
      diversificationScore,
      riskLevel
    };
    console.log('Summary:', result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary.', details: err.message });
  }
});

// (already declared at the top)

function readPortfolio() {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return data;
}

function writePortfolio(data) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio');
  XLSX.writeFile(workbook, EXCEL_PATH);
}

// --- ANALYTICS ENDPOINTS FOR DASHBOARD ---

// Sector Distribution (pie/donut chart)
app.get('/api/portfolio/analytics/sector-distribution', (req, res) => {
  try {
    const data = readPortfolio();
    const sectorMap = {};
    data.forEach(entry => {
      const sector = (entry['Sector'] || 'Unknown').trim();
      const value = Number(entry['Value ₹']) || 0;
      if (!sectorMap[sector]) sectorMap[sector] = 0;
      sectorMap[sector] += value;
    });
    res.json({ sectors: sectorMap });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate sector distribution.', details: err.message });
  }
});

// Market Cap Distribution (Large/Mid/Small)
app.get('/api/portfolio/analytics/marketcap-distribution', (req, res) => {
  try {
    const data = readPortfolio();
    const capMap = { Large: 0, Mid: 0, Small: 0, Unknown: 0 };
    data.forEach(entry => {
      let cap = (entry['Market Cap'] || '').toLowerCase();
      const value = Number(entry['Value ₹']) || 0;
      if (cap.includes('large')) cap = 'Large';
      else if (cap.includes('mid')) cap = 'Mid';
      else if (cap.includes('small')) cap = 'Small';
      else cap = 'Unknown';
      capMap[cap] += value;
    });
    res.json({ marketCap: capMap });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate market cap distribution.', details: err.message });
  }
});

// Portfolio Overview (value, gain/loss, performance %, holdings)
app.get('/api/portfolio/analytics/overview', (req, res) => {
  try {
    const data = readPortfolio();
    let totalValue = 0, totalPL = 0, totalInvested = 0;
    data.forEach(entry => {
      totalValue += Number(entry['Value ₹']) || 0;
      totalPL += Number(entry['Gain/Loss (₹)']) || 0;
      totalInvested += Number(entry['Investment ₹']) || 0;
    });
  // Correct performance %: (totalValue - totalInvested) / totalInvested * 100
  const performancePct = totalInvested ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
  console.log('DEBUG Portfolio Overview:', { totalValue, totalInvested, performancePct });
  res.json({
      totalValue,
      totalPL,
      performancePct,
      holdings: data.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate overview.', details: err.message });
  }
});

// Top/Bottom Performers
app.get('/api/portfolio/analytics/top-performers', (req, res) => {
  try {
    const data = readPortfolio();
    if (!data.length) return res.json({ best: null, worst: null });
    let best = data[0], worst = data[0];
    data.forEach(entry => {
      if ((Number(entry['Gain/Loss (₹)']) || 0) > (Number(best['Gain/Loss (₹)']) || 0)) best = entry;
      if ((Number(entry['Gain/Loss (₹)']) || 0) < (Number(worst['Gain/Loss (₹)']) || 0)) worst = entry;
    });
    // Diversification score: number of sectors / holdings
    const sectors = new Set(data.map(e => (e['Sector'] || '').trim()).filter(Boolean));
    const diversification = sectors.size / data.length;
    // Risk: simple proxy (more holdings + more sectors = lower risk)
    let risk = 'High';
    if (data.length >= 10 && sectors.size >= 5) risk = 'Low';
    else if (data.length >= 5 && sectors.size >= 3) risk = 'Medium';
    res.json({
      best,
      worst,
      diversification: diversification.toFixed(2),
      risk
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate top performers.', details: err.message });
  }
});

// Delete an entry by Symbol
app.delete('/api/portfolio/symbol/:symbol', (req, res) => {
  try {
    const data = readPortfolio();
    const symbol = (req.params.symbol || '').trim().toLowerCase();
    console.log('DELETE: Searching for symbol:', symbol);
    console.log('DELETE: All symbols in data:', data.map(e => String(e.Symbol || '').trim().toLowerCase()));
    const idx = data.findIndex(entry => String(entry.Symbol || '').trim().toLowerCase() === symbol);
    if (idx === -1) {
      console.warn('DELETE: Entry not found for symbol:', symbol);
      return res.status(404).json({ error: 'Entry not found.' });
    }
    data.splice(idx, 1);
    writePortfolio(data);
    res.json({ message: 'Entry deleted.' });
  } catch (err) {
    console.error('DELETE ERROR:', err);
    res.status(500).json({ error: 'Failed to delete entry.', details: err.message });
  }
});

// Analytics endpoint: total value = sum of 'Value ₹' + sum of 'Gain/Loss (₹)'
app.get('/api/portfolio/analytics/total-value', (req, res) => {
  try {
    const data = readPortfolio();
    if (!data.length) return res.json({ totalValue: 0 });
    const totalValue = data.reduce((sum, entry) => sum + (Number(entry['Value ₹']) || 0), 0);
    const totalPL = data.reduce((sum, entry) => sum + (Number(entry['Gain/Loss (₹)']) || 0), 0);
    res.json({ totalValue: totalValue + totalPL });
  } catch (err) {
    console.error('ANALYTICS ERROR:', err);
    res.status(500).json({ error: 'Failed to calculate analytics.', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Main portfolio fetch endpoint
app.get('/api/portfolio', (req, res) => {
  try {
    const data = readPortfolio();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio.', details: err.message });
  }
});
