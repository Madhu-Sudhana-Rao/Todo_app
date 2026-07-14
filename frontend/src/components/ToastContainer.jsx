import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { removeToast } from '../redux/slices/uiSlice';

const ToastContainer = () => {
  const { toasts } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  if (toasts.length === 0) return null;

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
          bg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
          bg: 'bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-900 dark:text-rose-300',
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-indigo-500" />,
          bg: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-300',
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-xs pointer-events-none">
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-float ${style.bg}`}
          >
            <div className="flex items-center gap-3">
              {style.icon}
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="ml-4 flex h-6 w-6 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-400"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
