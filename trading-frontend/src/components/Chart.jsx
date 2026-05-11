import React, { useState } from 'react';
import API from '../services/api';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Chart from './Chart'; // create a wrapper around recharts

export default function DashboardPage() {
  const [prices, setPrices] = useState('');
  const [fundamentals, setFundamentals] = useState('{}');
  const [news, setNews] = useState('');
  const [journal, setJournal] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function runAgents() {
    setLoading(true);
    try {
      const payload = {
        prices: prices.split(',').map(s => parseFloat(s.trim())),
        fundamentals: JSON.parse(fundamentals || '{}'),
        news,
        journal_entry: journal,
        capital: 10000, risk_percent: 0.02,
        stop_distance: 50, atr: 1.0, adx: 25,
        mode: 'manual'
      };
      const res = await API.post('agents/run/', payload);
      setResult(res.data);
    } catch {
      alert('Error running agents');
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-lg font-semibold">Balance</CardHeader>
          <CardContent>$10,000</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-semibold">Open Trades</CardHeader>
          <CardContent>0</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-semibold">Risk Level</CardHeader>
          <CardContent>2% per trade</CardContent>
        </Card>
      </div>

      {/* Form to run agents */}
      <Card>
        <CardHeader className="text-xl">Run Analysis</CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Prices (comma-separated)" value={prices}
                 onChange={e => setPrices(e.target.value)} />
          <Input placeholder='Fundamentals (JSON)' value={fundamentals}
                 onChange={e => setFundamentals(e.target.value)} />
          <Input placeholder="News/Sentiment" value={news}
                 onChange={e => setNews(e.target.value)} />
          <Input placeholder="Journal entry" value={journal}
                 onChange={e => setJournal(e.target.value)} />
          <Button onClick={runAgents} disabled={loading}>
            {loading ? 'Analyzing…' : 'Run Agents'}
          </Button>
        </CardContent>
      </Card>

      {/* Results and chart */}
      {result && (
        <Card>
          <CardHeader className="text-lg">Results</CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <pre className="p-2 bg-gray-700 rounded overflow-auto h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
              <Chart data={result.technical?.series} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}