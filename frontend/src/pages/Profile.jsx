import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { User, Key, Mail, Shield, AlertTriangle, ShieldCheck, Download } from 'lucide-react';
import { updateProfile, updatePassword } from '../redux/slices/authSlice';
import { showToast } from '../redux/slices/uiSlice';
import api from '../services/api';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      avatar_url: user?.avatar_url || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onUpdateProfile = async (data) => {
    try {
      await dispatch(updateProfile(data)).unwrap();
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: err || 'Profile update failed.', type: 'error' }));
    }
  };

  const onUpdatePassword = async (data) => {
    try {
      const payload = {
        old_password: data.old_password,
        new_password: data.new_password,
      };
      await dispatch(updatePassword(payload)).unwrap();
      dispatch(showToast({ message: 'Password updated successfully!', type: 'success' }));
      resetPasswordForm();
    } catch (err) {
      dispatch(showToast({ message: err || 'Password update failed.', type: 'error' }));
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/todos/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'task_backup.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      dispatch(showToast({ message: 'Data backup downloaded.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Backup download failed.', type: 'error' }));
    }
  };

  const newPasswordVal = watchPassword('new_password');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
          Account Settings
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage your personal details, profile avatar link, password credentials, and data backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side: forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="glass-panel rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-indigo-500" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    {...registerProfile('username', { required: 'Username is required' })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 transition-all"
                  />
                  {profileErrors.username && (
                    <span className="mt-1 block text-xs text-rose-500">{profileErrors.username.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...registerProfile('email', { required: 'Email address is required' })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 transition-all"
                  />
                  {profileErrors.email && (
                    <span className="mt-1 block text-xs text-rose-500">{profileErrors.email.message}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  {...registerProfile('avatar_url')}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password Update Form */}
          <div className="glass-panel rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-indigo-500" />
              <span>Security & Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('old_password', { required: 'Current password is required' })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 transition-all"
                />
                {passwordErrors.old_password && (
                  <span className="mt-1 block text-xs text-rose-500">{passwordErrors.old_password.message}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('new_password', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 transition-all"
                  />
                  {passwordErrors.new_password && (
                    <span className="mt-1 block text-xs text-rose-500">{passwordErrors.new_password.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('confirm_password', {
                      required: 'Please confirm password',
                      validate: (val) => val === newPasswordVal || 'Passwords do not match',
                    })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 transition-all"
                  />
                  {passwordErrors.confirm_password && (
                    <span className="mt-1 block text-xs text-rose-500">{passwordErrors.confirm_password.message}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4.5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/20"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Data Backup controls and profile summary */}
        <div className="space-y-6">
          {/* Card profile summary */}
          <div className="glass-panel rounded-2xl p-6 text-center shadow-xs">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold border-4 border-indigo-200 text-3xl shadow-xs dark:bg-indigo-950/70 dark:text-indigo-400 dark:border-indigo-900">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase()
              )}
            </div>
            <h4 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">
              {user?.username || 'Premium User'}
            </h4>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Account</span>
            </div>
          </div>

          {/* Backup tasks Card */}
          <div className="glass-panel rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Data Management</h4>
            <p className="text-xs text-slate-400">
              Export all active and completed tasks to a CSV database backup file.
            </p>
            <button
              onClick={handleExportData}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Backup (.csv)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
