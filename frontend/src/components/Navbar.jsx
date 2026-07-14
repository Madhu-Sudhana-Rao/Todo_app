import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Sun, Moon, Search, User, Settings, LogOut, Keyboard, HelpCircle } from 'lucide-react';
import { toggleSidebar, toggleShortcutModal } from '../redux/slices/uiSlice';
import { toggleTheme } from '../redux/slices/themeSlice';
import { logout } from '../redux/slices/authSlice';
import { setFilters, fetchTodos } from '../redux/slices/todoSlice';

const Navbar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { filters } = useSelector((state) => state.todos);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setFilters({ search: searchValue }));
      dispatch(fetchTodos());
    }, 300);

    return () => clearTimeout(handler);
  }, [searchValue, dispatch]);

  // Sync search input if filters reset
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/60 dark:bg-slate-900/80">
      {/* Left Area: Toggle Menu and title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden text-sm font-semibold text-slate-500 md:block dark:text-slate-400">
          Personal Space
        </span>
      </div>

      {/* Middle Area: Search bar */}
      <div className="mx-4 flex max-w-md flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 transition-colors duration-200 dark:bg-slate-800/80">
        <Search className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
        <input
          id="navbar-search-input"
          type="text"
          placeholder="Search task or categories... (Press /)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 outline-hidden placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Right Area: Buttons and Profile Dropdown */}
      <div className="flex items-center gap-3">
        {/* Toggle Theme button */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400"
        >
          {mode === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-200 shadow-xs dark:bg-indigo-950/70 dark:text-indigo-400 dark:border-indigo-900"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(user?.username)
            )}
          </button>

          {/* Profile Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:border-slate-800/60 dark:bg-slate-900">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  dispatch(toggleShortcutModal());
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
              >
                <Keyboard className="h-4 w-4" />
                <span>Shortcuts (?)</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800/80 my-2" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
