import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AgentsPage from "./pages/AgentsPage";
import JournalPage from "./pages/JournalPage";
import WatchlistPage from "./pages/WatchlistPage";
import SubscriptionPage from "./pages/SubscriptionPage";

function ProtectedRoute() {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected terminal pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/watchlists" element={<WatchlistPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}