import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import API from '../services/api';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const res = await API.get('journal/entries/');
    setEntries(res.data);
  }

  async function addEntry() {
    await API.post('journal/entries/', { content });
    setContent('');
    fetchEntries();
  }

  return (
    <div className="space-y-4">
      <Card title="New Journal Entry">
        <Input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Describe your trading day..."
        />
        <Button className="mt-2" onClick={addEntry}>
          Add Entry
        </Button>
      </Card>
      <Card title="Your Entries">
        {entries.length === 0 && <p className="text-gray-400">No entries yet.</p>}
        <ul className="space-y-4">
          {entries.map(entry => (
            <li key={entry.id} className="border-b border-gray-700 pb-2">
              <p>{entry.content}</p>
              <span className="text-xs text-gray-400">
                {new Date(entry.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}