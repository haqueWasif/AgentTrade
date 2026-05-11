import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import API from '../services/api';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  }

  async function login() {
    try {
      const res = await API.post('token/', credentials);
      localStorage.setItem('token', res.data.access);
      navigate('/dashboard');
    } catch {
      alert('Invalid credentials');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <Card title="Log In">
        <Input name="username" placeholder="Username" onChange={handleChange} />
        <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <Button className="mt-4 w-full" onClick={login}>
          Log In
        </Button>
        <p className="text-sm text-gray-400 mt-2">
          Don't have an account?{' '}
          <Link to="/register" className="underline text-blue-400">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}