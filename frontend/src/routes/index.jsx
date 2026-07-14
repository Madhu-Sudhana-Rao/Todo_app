import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Todos from '../pages/Todos';
import Profile from '../pages/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Todos />} />
        <Route path="/tasks/board" element={<Todos />} />
        <Route path="/tasks/calendar" element={<Todos />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
