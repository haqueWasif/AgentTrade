import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import API from '../services/api';

export default function WatchlistPage() {
  const [watchlists, setWatchlists] = useState([]);
  const [name, setName] = useState('');
  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('');

  useEffect(() => {
    fetchLists();
    fetchInstruments();
  }, []);

  async function fetchLists() {
    const res = await API.get('core/watchlists/');
    setWatchlists(res.data);
  }

  async function fetchInstruments() {
    const res = await API.get('core/instruments/');
    setInstruments(res.data);
  }

  async function createList() {
    await API.post('core/watchlists/', { name });
    setName('');
    fetchLists();
  }

  async function addInstrumentToList(id) {
    const list = watchlists.find(w => w.id === id);
    const instrumentIds = list.instruments.concat(selectedInstrument);
    await API.put(`core/watchlists/${id}/`, { name: list.name, instruments: instrumentIds });
    fetchLists();
  }

  return (
    <div className="space-y-4">
      <Card title="Create Watchlist">
        <div className="flex space-x-2">
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Watchlist name"
          />
          <Button onClick={createList}>Create</Button>
        </div>
      </Card>

      <Card title="Add Instrument">
        <select
          value={selectedInstrument}
          onChange={e => setSelectedInstrument(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
        >
          <option value="">Select instrument</option>
          {instruments.map(inst => (
            <option key={inst.id} value={inst.id}>
              {inst.symbol}
            </option>
          ))}
        </select>
      </Card>

      <Card title="Your Watchlists">
        {watchlists.length === 0 && <p className="text-gray-400">No watchlists yet.</p>}
        <ul className="space-y-4">
          {watchlists.map(list => (
            <li key={list.id} className="border-b border-gray-700 pb-2">
              <div className="flex justify-between items-center">
                <strong>{list.name}</strong>
                <Button variant="outline" onClick={() => addInstrumentToList(list.id)}>
                  Add Instrument
                </Button>
              </div>
              <span className="text-sm text-gray-400">
                Instruments: {list.instruments.join(', ') || 'None'}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}