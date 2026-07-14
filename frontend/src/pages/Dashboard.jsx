import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  Inbox,
  AlertTriangle
} from 'lucide-react';
import { fetchDashboard, setFilters, openTodoModal } from '../redux/slices/todoSlice';

const Dashboard = () => {
  const { dashboard, dashboardStatus } = useSelector((state) => state.todos);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const handleQuickFilter = (filterOptions) => {
    dispatch(setFilters(filterOptions));
    navigate('/tasks');
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // SVG Chart settings
  const chartHeight = 120;
  const chartWidth = 420;
  const padding = 25;
  const data = dashboard.productivity_stats || [];
  const maxVal = Math.max(...data.map((d) => d.completed_count), 3);

  return (
    <div className="space-y-8 animate-float">
      {/* Top Banner Greeting */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
            {getGreeting()}, {user?.username || 'Premium User'}!
          </h1>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Here's a snapshot of your workspace performance today.
          </p>
        </div>
        <button
          onClick={() => dispatch(openTodoModal(null))}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-500/30 transition-all duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Grid count cards */}
      {dashboardStatus === 'loading' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel h-28 rounded-2xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Tasks Card */}
          <div
            onClick={() => handleQuickFilter({ archived: false, deleted: false, completed: null, due_today: null, overdue: null })}
            className="glass-panel group cursor-pointer rounded-2xl p-5 shadow-xs transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Total Tasks</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700 transition-colors">
                <ListTodo className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dashboard.total}</span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div
            onClick={() => handleQuickFilter({ archived: false, deleted: false, completed: true, due_today: null, overdue: null })}
            className="glass-panel group cursor-pointer rounded-2xl p-5 shadow-xs transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Completed</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dashboard.completed}</span>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {dashboard.completion_percentage}% Done
              </span>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div
            onClick={() => handleQuickFilter({ archived: false, deleted: false, completed: false, due_today: null, overdue: null })}
            className="glass-panel group cursor-pointer rounded-2xl p-5 shadow-xs transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Pending</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dashboard.pending}</span>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                Focus inbox <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Overdue Tasks Card */}
          <div
            onClick={() => handleQuickFilter({ archived: false, deleted: false, overdue: true, completed: false })}
            className="glass-panel group cursor-pointer rounded-2xl p-5 shadow-xs transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Overdue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{dashboard.overdue}</span>
              {dashboard.overdue > 0 ? (
                <span className="rounded-md bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                  Requires action
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">All caught up</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Row columns: Productivity SVG Chart + Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity chart */}
        <div className="glass-panel rounded-2xl p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Productivity Trend</h3>
            </div>
            <span className="text-xs text-slate-400">Tasks completed (past 7 days)</span>
          </div>

          {/* SVG-based Line/Area Chart */}
          <div className="flex justify-center py-2">
            {data.length === 0 ? (
              <div className="flex h-36 items-center justify-center text-sm text-slate-400">
                No completion logs available
              </div>
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-[480px]">
                {/* SVG definitions for area gradients */}
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y Axis helper gridlines */}
                {[0, 0.5, 1].map((ratio, index) => {
                  const y = padding + ratio * (chartHeight - 2 * padding);
                  return (
                    <line
                      key={index}
                      x1={padding}
                      y1={y}
                      x2={chartWidth - padding}
                      y2={y}
                      stroke="rgba(148, 163, 184, 0.15)"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Build chart path points */}
                {(() => {
                  const points = data.map((d, i) => {
                    const x = padding + (i * (chartWidth - 2 * padding)) / (data.length - 1 || 1);
                    const y = chartHeight - padding - (d.completed_count / maxVal) * (chartHeight - 2 * padding);
                    return { x, y };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = points.length
                    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
                    : '';

                  return (
                    <>
                      {/* Area Fill */}
                      {areaPath && <path d={areaPath} fill="url(#gradient)" />}
                      {/* Path Line */}
                      {linePath && <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" />}
                      
                      {/* Data point circle markers */}
                      {points.map((p, idx) => (
                        <g key={idx} className="group">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            className="fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2 hover:r-6 cursor-pointer transition-all"
                          />
                          {/* Tooltip on circle marker */}
                          <title>{`${data[idx].completed_count} tasks completed on ${data[idx].date}`}</title>
                        </g>
                      ))}
                    </>
                  );
                })()}

                {/* X Axis Labels */}
                {data.map((d, i) => {
                  const x = padding + (i * (chartWidth - 2 * padding)) / (data.length - 1 || 1);
                  // format date label to short form: MM/DD
                  const label = d.date.split('-').slice(1).join('/');
                  return (
                    <text
                      key={i}
                      x={x}
                      y={chartHeight - 8}
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                      fill="rgba(148, 163, 184, 0.75)"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Activity log */}
        <div className="glass-panel rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800/80 pb-4 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Activity Stream</h3>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-4 pr-1">
            {dashboard.recent_activities.length === 0 ? (
              <div className="flex h-36 items-center justify-center text-sm text-slate-400">
                No recent actions recorded
              </div>
            ) : (
              dashboard.recent_activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-5">
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-semibold border border-slate-200/50 dark:border-slate-800">
                    {act.action.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {act.action}
                      {act.todo_title && (
                        <span className="font-normal text-slate-500">
                          {' '}
                          - <span className="italic">"{act.todo_title}"</span>
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row: Quick Links */}
      <div className="glass-panel rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Focus Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleQuickFilter({ due_today: true, archived: false, deleted: false, completed: false })}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-left transition-all duration-200 group"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Due Today</span>
              <span className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                {dashboard.due_today}
              </span>
            </div>
            <Calendar className="h-5 w-5 text-indigo-500" />
          </button>

          <button
            onClick={() => handleQuickFilter({ category: 'Inbox', archived: false, deleted: false, completed: false })}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-left transition-all duration-200 group"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Inbox Items</span>
              <span className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                {dashboard.pending}
              </span>
            </div>
            <Inbox className="h-5 w-5 text-indigo-500" />
          </button>

          <button
            onClick={() => handleQuickFilter({ priority: 'high', archived: false, deleted: false, completed: false })}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-left transition-all duration-200 group"
          >
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">High Priority</span>
              <span className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                High
              </span>
            </div>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </button>

          <button
            onClick={() => {
              dispatch(setFilters({ archived: false, deleted: false }));
              navigate('/tasks/board');
            }}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-left transition-all duration-200 group"
          >
            <div className="flex flex-col flex-1">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Kanban Board</span>
              <span className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                Manage Priority
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
