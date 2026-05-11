import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import API from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function register() {
    try {
      await API.post('register/', form);
      navigate('/login');
    } catch {
      alert('Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <Card title="Create Account">
        <Input name="username" placeholder="Username" onChange={handleChange} />
        <Input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <Button className="mt-4 w-full" onClick={register}>
          Register
        </Button>
        <p className="text-sm text-gray-400 mt-2">
          Already have an account?{' '}
          <Link to="/login" className="underline text-blue-400">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}