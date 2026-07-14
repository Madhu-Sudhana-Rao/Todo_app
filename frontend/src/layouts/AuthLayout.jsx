import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const AuthLayout = () => {
  const { isAuthenticated, initLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is already authenticated, redirect them to home page
    if (!initLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, initLoading, navigate, location]);

  if (initLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-radial from-slate-50 to-slate-100 p-4 transition-colors duration-300 dark:from-slate-900 dark:to-slate-950">
      {/* Background graphic elements */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />
      
      <div className="w-full max-w-md z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
