import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { toggleShortcutModal } from '../redux/slices/uiSlice';

const KeyboardShortcutModal = () => {
  const dispatch = useDispatch();

  const shortcuts = [
    { keys: ['C'], desc: 'Open Create Task Dialog' },
    { keys: ['/'], desc: 'Focus global search input' },
    { keys: ['?'], desc: 'Toggle keyboard shortcut help overlay' },
    { keys: ['Esc'], desc: 'Close dialog panels and blur inputs' },
    { keys: ['G', 'D'], desc: 'Go to Dashboard page' },
    { keys: ['G', 'T'], desc: 'Go to Tasks view' },
    { keys: ['G', 'P'], desc: 'Go to Profile settings' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Keyboard Shortcuts</h3>
          <button
            onClick={() => dispatch(toggleShortcutModal())}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts Map list */}
        <div className="space-y-3.5">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">{shortcut.desc}</span>
              <div className="flex gap-1.5">
                {shortcut.keys.map((key, keyIdx) => (
                  <React.Fragment key={keyIdx}>
                    {keyIdx > 0 && <span className="text-slate-300 dark:text-slate-600 self-center">+</span>}
                    <kbd className="inline-flex h-6 items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-2 text-xs font-semibold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {key}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutModal;
