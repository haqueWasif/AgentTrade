import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <Card title="Welcome to Trading Hub">
        <p className="text-gray-300 mb-4">
          Analyse markets, manage trades, and journal your ideas all in one place.
        </p>
        <div className="flex space-x-4">
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">Log In</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}