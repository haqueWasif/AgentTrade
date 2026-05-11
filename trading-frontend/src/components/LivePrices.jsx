import React, { useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';

export default function LivePrices() {
  const [prices, setPrices] = useState({});
  useWebSocket('ws://localhost:8000/ws/prices/', data => {
    setPrices(prev => ({ ...prev, [data.symbol]: data.price }));
  });
  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h2 className="text-xl mb-2">Live Prices</h2>
      {Object.entries(prices).map(([symbol, price]) => (
        <div key={symbol}>{symbol}: {price}</div>
      ))}
    </div>
  );
}