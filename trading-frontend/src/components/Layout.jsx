import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Button from './ui/Button';

function Layout() {
  const { pathname } = useLocation();
  const menu = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/journal', label: 'Journal' },
    { path: '/watchlists', label: 'Watchlists' },
    { path: '/subscription', label: 'Subscription' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold mb-6">Trading Hub</h1>
        {menu.map(item => (
          <Link key={item.path} to={item.path}>
            <Button
              variant={pathname === item.path ? 'primary' : 'outline'}
              className="w-full mb-2 justify-start"
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;