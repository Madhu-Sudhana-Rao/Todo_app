import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Layers,
  Archive,
  Trash2,
  Folder,
  Tag,
  Star,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { setFilters, openTodoModal } from '../redux/slices/todoSlice';
import { toggleSidebar } from '../redux/slices/uiSlice';
import { logout } from '../redux/slices/authSlice';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { dashboard } = useSelector((state) => state.todos);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [categoriesOpen, setCategoriesOpen] = useState(true);

  // Quick categories list (dynamic items can be added)
  const categories = ['Inbox', 'Work', 'Personal', 'Shopping', 'Finance'];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
    }`;

  const filterTodos = (filterOptions) => {
    dispatch(setFilters(filterOptions));
  };

  return (
    <>
      {/* Backdrop overlay for mobile screen view */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar drawer wrapper */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/60 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Brand Area */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              Prioritize
            </span>
          </div>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden dark:hover:bg-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation Link List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-7">
          {/* Main sections */}
          <div className="space-y-1">
            <NavLink to="/" className={navItemClass}>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>Dashboard</span>
              </div>
            </NavLink>
            <NavLink
              to="/tasks"
              end
              onClick={() => filterTodos({ archived: false, deleted: false, category: null, completed: null, favorite: null, due_today: null, overdue: null })}
              className={navItemClass}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4.5 w-4.5" />
                <span>My Tasks</span>
              </div>
              {dashboard.pending > 0 && (
                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                  {dashboard.pending}
                </span>
              )}
            </NavLink>
          </div>

          {/* Productivity Views */}
          <div className="space-y-1">
            <div className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Views
            </div>
            <NavLink to="/tasks/board" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Layers className="h-4.5 w-4.5" />
                <span>Kanban Board</span>
              </div>
            </NavLink>
            <NavLink to="/tasks/calendar" className={navItemClass}>
              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5" />
                <span>Calendar</span>
              </div>
            </NavLink>
          </div>

          {/* Collapsible Categories list */}
          <div className="space-y-1">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <span>Categories</span>
              {categoriesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
            {categoriesOpen && (
              <div className="mt-1 space-y-1">
                {categories.map((cat) => (
                  <NavLink
                    key={cat}
                    to="/tasks"
                    onClick={() => filterTodos({ category: cat, archived: false, deleted: false, completed: null, favorite: null, due_today: null, overdue: null })}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100`
                    }
                  >
                    <Folder className="h-4 w-4 text-indigo-500/80" />
                    <span>{cat}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="space-y-1">
            <div className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Focus
            </div>
            <NavLink
              to="/tasks"
              onClick={() => filterTodos({ favorite: true, archived: false, deleted: false })}
              className={navItemClass}
            >
              <div className="flex items-center gap-3">
                <Star className="h-4.5 w-4.5 text-amber-500" />
                <span>Favorites</span>
              </div>
            </NavLink>
            <NavLink
              to="/tasks"
              onClick={() => filterTodos({ archived: true, deleted: false })}
              className={navItemClass}
            >
              <div className="flex items-center gap-3">
                <Archive className="h-4.5 w-4.5" />
                <span>Archive</span>
              </div>
            </NavLink>
            <NavLink
              to="/tasks"
              onClick={() => filterTodos({ deleted: true, archived: false })}
              className={navItemClass}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-4.5 w-4.5" />
                <span>Trash Bin</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Sidebar Footer Area */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/60">
          <button
            onClick={() => dispatch(openTodoModal(null))}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all duration-200 hover:shadow-indigo-500/30"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>New Task</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
