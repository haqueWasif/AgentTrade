import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import API from '../services/api';

export default function DashboardPage() {
  const [prices, setPrices] = useState('');
  const [fundamentals, setFundamentals] = useState('{}');
  const [news, setNews] = useState('');
  const [journalEntry, setJournalEntry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runAgents() {
    setLoading(true);
    try {
      const payload = {
        prices: prices.split(',').map(p => parseFloat(p.trim())),
        fundamentals: JSON.parse(fundamentals || '{}'),
        news,
        journal_entry: journalEntry,
        capital: 10000,
        risk_percent: 0.02,
        stop_distance: 50,
        atr: 1.0,
        adx: 25,
        mode: 'manual',
      };
      const res = await API.post('agents/run/', payload);
      setResult(res.data);
    } catch {
      alert('Error running agents');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Balance">$10,000</Card>
        <Card title="Open Trades">0</Card>
        <Card title="Risk per Trade">2%</Card>
      </div>
      <Card title="Run Analysis">
        <div className="space-y-2">
          <Input
            placeholder="Prices (comma-separated)"
            value={prices}
            onChange={e => setPrices(e.target.value)}
          />
          <Input
            placeholder="Fundamentals (JSON)"
            value={fundamentals}
            onChange={e => setFundamentals(e.target.value)}
          />
          <Input
            placeholder="News/Sentiment"
            value={news}
            onChange={e => setNews(e.target.value)}
          />
          <Input
            placeholder="Journal entry"
            value={journalEntry}
            onChange={e => setJournalEntry(e.target.value)}
          />
          <Button onClick={runAgents} disabled={loading}>
            {loading ? 'Running…' : 'Run Agents'}
          </Button>
        </div>
      </Card>
      {result && (
        <Card title="Results">
          <pre className="bg-gray-700 p-3 rounded overflow-auto h-60">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}