import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn, Key, Mail, AlertCircle, CheckSquare } from 'lucide-react';
import { loginUser, clearAuthError } from '../redux/slices/authSlice';
import { showToast } from '../redux/slices/uiSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { status, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Clear errors on page mount/unmount
  useEffect(() => {
    dispatch(clearAuthError());
    
    // Check if redirect due to expired session
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      dispatch(showToast({ message: 'Session expired. Please log in again.', type: 'info' }));
    }
  }, [dispatch, location]);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      dispatch(showToast({ message: 'Welcome back!', type: 'success' }));
      navigate('/');
    } catch (err) {
      // Handled by reducer error state
    }
  };

  return (
    <div className="glass-panel w-full rounded-3xl p-8 shadow-2xl transition-all duration-300">
      {/* Brand logo header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3 animate-float">
          <CheckSquare className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h2>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Sign in to manage your tasks</p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 text-sm text-rose-800 dark:text-rose-400 animate-pulse">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Username/Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Username or Email
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="username or email"
              {...register('username', { required: 'Username or Email is required' })}
              className={`w-full rounded-2xl border bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-hidden transition-all ${
                errors.username
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.username && (
            <span className="mt-1 flex items-center gap-1.5 text-xs text-rose-500">
              {errors.username.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Password
            </label>
          </div>
          <div className="relative">
            <Key className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              className={`w-full rounded-2xl border bg-transparent pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-hidden transition-all ${
                errors.password
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.password && (
            <span className="mt-1 flex items-center gap-1.5 text-xs text-rose-500">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50"
        >
          <LogIn className="h-4.5 w-4.5" />
          <span>{status === 'loading' ? 'Signing In...' : 'Sign In'}</span>
        </button>
      </form>

      {/* Footer Register Link */}
      <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 text-center text-sm">
        <span className="text-slate-400 dark:text-slate-500">Don't have an account? </span>
        <Link
          to="/register"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
