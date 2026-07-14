import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, User, Key, Mail, AlertCircle, CheckSquare } from 'lucide-react';
import { registerUser, clearAuthError } from '../redux/slices/authSlice';
import { showToast } from '../redux/slices/uiSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { status, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const { username, email, password } = data;
    try {
      await dispatch(registerUser({ username, email, password })).unwrap();
      dispatch(showToast({ message: 'Registration successful! Please log in.', type: 'success' }));
      navigate('/login');
    } catch (err) {
      // Handled by reducer error state
    }
  };

  const passwordVal = watch('password');

  return (
    <div className="glass-panel w-full rounded-3xl p-8 shadow-2xl transition-all duration-300">
      {/* Brand logo header */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3 animate-float">
          <CheckSquare className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Account</h2>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Join us to start sorting your day</p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 text-sm text-rose-800 dark:text-rose-400 animate-pulse">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Username
          </label>
          <div className="relative">
            <User className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="johndoe"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
              })}
              className={`w-full rounded-2xl border bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-hidden transition-all ${
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

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              placeholder="john@example.com"
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className={`w-full rounded-2xl border bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-hidden transition-all ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.email && (
            <span className="mt-1 flex items-center gap-1.5 text-xs text-rose-500">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Key className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className={`w-full rounded-2xl border bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-hidden transition-all ${
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Key className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === passwordVal || 'Passwords do not match',
              })}
              className={`w-full rounded-2xl border bg-transparent pl-11 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-hidden transition-all ${
                errors.confirmPassword
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <span className="mt-1 flex items-center gap-1.5 text-xs text-rose-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-50"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>{status === 'loading' ? 'Creating Account...' : 'Sign Up'}</span>
        </button>
      </form>

      {/* Footer Login Link */}
      <div className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6 text-center text-sm">
        <span className="text-slate-400 dark:text-slate-500">Already have an account? </span>
        <Link
          to="/login"
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
