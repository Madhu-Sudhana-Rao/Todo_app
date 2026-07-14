import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TodoModal from '../components/TodoModal';
import KeyboardShortcutModal from '../components/KeyboardShortcutModal';
import ToastContainer from '../components/ToastContainer';
import { fetchTodos, fetchDashboard, openTodoModal, setFilters } from '../redux/slices/todoSlice';
import { toggleSidebar, setSidebarOpen, toggleShortcutModal } from '../redux/slices/uiSlice';
import { logout } from '../redux/slices/authSlice';

const DashboardLayout = () => {
  const { isAuthenticated, initLoading, user } = useSelector((state) => state.auth);
  const { sidebarOpen, shortcutModalOpen } = useSelector((state) => state.ui);
  const { isModalOpen } = useSelector((state) => state.todos);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const keysPressed = useRef({});

  // 1. Guard route: redirect to login if not authenticated
  useEffect(() => {
    if (!initLoading && !isAuthenticated) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, initLoading, navigate, location]);

  // 2. Fetch basic user details on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboard());
      dispatch(fetchTodos());
    }
  }, [isAuthenticated, dispatch]);

  // 3. Responsive layout handling (auto collapse sidebar on small viewports)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        dispatch(setSidebarOpen(false));
      } else {
        dispatch(setSidebarOpen(true));
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Trigger initially
    
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // 4. Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in forms/inputs
      const activeTag = document.activeElement?.tagName;
      const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      if (isTyping && e.key !== 'Escape') return;

      keysPressed.current[e.key.toLowerCase()] = true;

      // Handle escape to close modal
      if (e.key === 'Escape') {
        // Blur inputs
        if (isTyping) {
          document.activeElement.blur();
        }
      }

      // 'c' -> Create new Todo
      if (keysPressed.current['c'] && !isTyping) {
        e.preventDefault();
        dispatch(openTodoModal(null));
      }

      // '/' -> Focus Search input
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        const searchInput = document.getElementById('navbar-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // '?' -> Toggle Shortcut Help Modal
      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        dispatch(toggleShortcutModal());
      }

      // Sequential shortcuts: 'g' then 'd' (Go to Dashboard), 'g' then 't' (Go to Tasks)
      if (keysPressed.current['g']) {
        if (keysPressed.current['d']) {
          e.preventDefault();
          navigate('/');
        } else if (keysPressed.current['t']) {
          e.preventDefault();
          dispatch(setFilters({ archived: false, deleted: false }));
          navigate('/tasks');
        } else if (keysPressed.current['p']) {
          e.preventDefault();
          navigate('/profile');
        }
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch, navigate]);

  if (initLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your space...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Shared Components */}
      {isModalOpen && <TodoModal />}
      {shortcutModalOpen && <KeyboardShortcutModal />}
      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
