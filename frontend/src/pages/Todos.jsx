import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  List,
  Layers,
  Calendar as CalendarIcon,
  Plus,
  Star,
  Archive,
  Trash2,
  Undo2,
  Trash,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Download,
  Upload,
  AlertCircle,
  Clock,
  Edit3
} from 'lucide-react';
import {
  fetchTodos,
  updateTodo,
  deleteTodo,
  restoreTodo,
  toggleComplete,
  toggleFavorite,
  toggleArchive,
  setPage,
  setFilters,
  setSortBy,
  openTodoModal,
  resetFilters
} from '../redux/slices/todoSlice';
import { setView, showToast } from '../redux/slices/uiSlice';
import api from '../services/api';

const Todos = () => {
  const { todos, total, page, pages, sortBy, filters, status } = useSelector((state) => state.todos);
  const { currentView } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const location = useLocation();

  // Local state for calendar navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [importLoading, setImportLoading] = useState(false);

  // Sync views if URL matches board or calendar path
  useEffect(() => {
    if (location.pathname.includes('board')) {
      dispatch(setView('board'));
    } else if (location.pathname.includes('calendar')) {
      dispatch(setView('calendar'));
    } else {
      dispatch(setView('list'));
    }
  }, [location.pathname, dispatch]);

  // Reload todos on filters/page/sorting change
  useEffect(() => {
    dispatch(fetchTodos());
  }, [page, sortBy, filters, dispatch]);

  // Task state action toggles
  const handleToggleComplete = (id) => {
    dispatch(toggleComplete(id));
  };

  const handleToggleFavorite = (id) => {
    dispatch(toggleFavorite(id));
  };

  const handleToggleArchive = (id) => {
    dispatch(toggleArchive(id));
  };

  const handleRestore = (id) => {
    dispatch(restoreTodo(id));
  };

  const handleDelete = (id, permanent = false) => {
    const msg = permanent
      ? 'Are you sure you want to permanently delete this task?'
      : 'Move this task to the Trash?';
    if (window.confirm(msg)) {
      dispatch(deleteTodo({ id, permanent }));
    }
  };

  // CSV Operations
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/todos/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'todos.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      dispatch(showToast({ message: 'CSV downloaded successfully.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Export failed.', type: 'error' }));
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setImportLoading(true);

    try {
      await api.post('/todos/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(showToast({ message: 'CSV imported successfully.', type: 'success' }));
      dispatch(fetchTodos());
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.error?.message || 'Import failed.', type: 'error' }));
    } finally {
      setImportLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  // --------------------------------------------------------
  // DRAG & DROP FOR KANBAN BOARD
  // --------------------------------------------------------
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const todoId = parseInt(draggableId);
    let updatePayload = {};

    if (destination.droppableId === 'completed') {
      updatePayload = { completed: true };
    } else {
      updatePayload = { priority: destination.droppableId, completed: false };
    }

    try {
      await dispatch(updateTodo({ id: todoId, data: updatePayload })).unwrap();
      dispatch(showToast({ message: 'Task priority updated!', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to update priority.', type: 'error' }));
    }
  };

  // --------------------------------------------------------
  // CALENDAR HELPER FUNCTIONS
  // --------------------------------------------------------
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    
    // Fill empty days for starting week offset
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= numDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Filter out todos containing dates for Calendar grid cells
  const getCalendarTodos = () => {
    // Make sure we fetch all matching without short-page limits for calendar
    return todos.filter((t) => t.due_date);
  };

  // --------------------------------------------------------
  // RENDERING SUB-VIEWS
  // --------------------------------------------------------

  // List View Rendering
  const renderListView = () => {
    if (status === 'loading') {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel h-16 rounded-xl animate-shimmer" />
          ))}
        </div>
      );
    }

    if (todos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-slate-300 dark:text-slate-700 animate-bounce" />
          <h4 className="mt-4 text-base font-bold text-slate-700 dark:text-slate-300">No tasks found</h4>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or create a new task.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {todos.map((todo) => {
          const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;
          return (
            <div
              key={todo.id}
              className={`glass-panel flex items-center justify-between rounded-2xl p-4 shadow-xs transition-all duration-250 border-l-4 hover:shadow-md ${
                todo.completed
                  ? 'border-l-emerald-500 opacity-60'
                  : todo.priority === 'high'
                  ? 'border-l-rose-500'
                  : todo.priority === 'medium'
                  ? 'border-l-amber-500'
                  : 'border-l-indigo-500'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id)}
                  disabled={todo.deleted}
                  className="mt-0.5 h-4.5 w-4.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer dark:border-slate-800 dark:bg-slate-900"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold truncate ${
                        todo.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {todo.title}
                    </span>
                    {/* Tags */}
                    {todo.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                    {/* Category */}
                    <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {todo.category}
                    </span>
                  </div>
                  {todo.description && (
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 truncate">
                      {todo.description}
                    </p>
                  )}
                  {/* Due Date Indicator */}
                  {todo.due_date && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold">
                      <Clock className={`h-3 w-3 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                      <span className={isOverdue ? 'text-rose-500' : 'text-slate-400'}>
                        {isOverdue ? 'Overdue' : 'Due'}: {new Date(todo.due_date).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                {todo.deleted ? (
                  <>
                    <button
                      onClick={() => handleRestore(todo.id)}
                      title="Restore Task"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id, true)}
                      title="Permanently Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 dark:border-slate-800 dark:hover:bg-rose-950/20"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => dispatch(openTodoModal(todo))}
                      title="Edit Task"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(todo.id)}
                      title="Toggle Favorite"
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                        todo.favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                      }`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(todo.id)}
                      title={todo.archived ? 'Send to Inbox' : 'Send to Archive'}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                        todo.archived ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id, false)}
                      title="Send to Trash"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 dark:border-slate-800 dark:hover:bg-rose-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Kanban Board View Rendering
  const renderBoardView = () => {
    const columns = {
      low: todos.filter((t) => t.priority === 'low' && !t.completed && !t.deleted && !t.archived),
      medium: todos.filter((t) => t.priority === 'medium' && !t.completed && !t.deleted && !t.archived),
      high: todos.filter((t) => t.priority === 'high' && !t.completed && !t.deleted && !t.archived),
      completed: todos.filter((t) => t.completed && !t.deleted && !t.archived),
    };

    const colTitles = {
      low: { name: 'Low Priority', color: 'bg-indigo-500' },
      medium: { name: 'Medium Priority', color: 'bg-amber-500' },
      high: { name: 'High Priority', color: 'bg-rose-500' },
      completed: { name: 'Completed', color: 'bg-emerald-500' },
    };

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {Object.keys(columns).map((colKey) => (
            <div key={colKey} className="glass-panel rounded-2xl p-4 flex flex-col max-h-[70vh]">
              {/* Column Title */}
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <span className={`h-2.5 w-2.5 rounded-full ${colTitles[colKey].color}`} />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {colTitles[colKey].name}
                </span>
                <span className="ml-auto rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500">
                  {columns[colKey].length}
                </span>
              </div>

              {/* Droppable cards area */}
              <Droppable droppableId={colKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto min-h-[300px] rounded-xl p-1.5 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-100/50 dark:bg-slate-800/30' : ''
                    }`}
                  >
                    {columns[colKey].map((todo, idx) => (
                      <Draggable key={todo.id.toString()} draggableId={todo.id.toString()} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => dispatch(openTodoModal(todo))}
                            className={`glass-panel mb-3 cursor-grab rounded-xl p-3.5 shadow-xs border-l-2 hover:shadow-md transition-all ${
                              snapshot.isDragging ? 'rotate-1 shadow-lg border-indigo-500 scale-[1.02]' : ''
                            } ${
                              todo.completed
                                ? 'border-emerald-500'
                                : todo.priority === 'high'
                                ? 'border-rose-500'
                                : todo.priority === 'medium'
                                ? 'border-amber-500'
                                : 'border-indigo-500'
                            }`}
                          >
                            <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {todo.title}
                            </h5>
                            {todo.description && (
                              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2">
                                {todo.description}
                              </p>
                            )}
                            {todo.due_date && (
                              <span className="mt-2 block text-[9px] font-semibold text-slate-400">
                                Due: {new Date(todo.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    );
  };

  // Calendar View Rendering
  const renderCalendarView = () => {
    const days = getDaysInMonth(currentDate);
    const calendarTodos = getCalendarTodos();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handlePrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <div className="glass-panel rounded-2xl p-5 shadow-xs">
        {/* Calendar Nav */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{monthName}</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Weekday headers */}
          {weekDays.map((wd) => (
            <div key={wd} className="py-1.5 text-xs font-bold text-slate-400 dark:text-slate-600">
              {wd}
            </div>
          ))}

          {/* Grid Cells */}
          {days.map((day, idx) => {
            const dayTodos = day ? calendarTodos.filter((t) => isSameDay(new Date(t.due_date), day)) : [];
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={`min-h-[85px] border border-slate-100 dark:border-slate-800/40 rounded-xl p-1.5 text-left flex flex-col justify-between transition-colors ${
                  day
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    : 'bg-slate-50/30 dark:bg-slate-950/20'
                }`}
              >
                {day ? (
                  <>
                    {/* Day number */}
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {/* Day tasks lists */}
                    <div className="mt-1 flex-1 overflow-y-auto space-y-1 max-h-[60px]">
                      {dayTodos.map((todo) => (
                        <div
                          key={todo.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(openTodoModal(todo));
                          }}
                          className={`rounded px-1 py-0.5 text-[9px] font-semibold truncate cursor-pointer text-white ${
                            todo.completed
                              ? 'bg-emerald-500/80 line-through'
                              : todo.priority === 'high'
                              ? 'bg-rose-500/95'
                              : todo.priority === 'medium'
                              ? 'bg-amber-500/95'
                              : 'bg-indigo-500/95'
                          }`}
                        >
                          {todo.title}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
            {filters.deleted
              ? 'Trash Bin'
              : filters.archived
              ? 'Archived Tasks'
              : filters.favorite
              ? 'Favorite Tasks'
              : filters.category
              ? `Tasks: ${filters.category}`
              : 'Tasks Manager'}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            {filters.deleted
              ? 'Items stay in Trash for 30 days before permanent deletion'
              : 'Manage, organize, and check off your productivity priorities.'}
          </p>
        </div>

        {/* View Switchers & Imports/Exports */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1">
            <button
              onClick={() => dispatch(setView('list'))}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                currentView === 'list'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => dispatch(setView('board'))}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                currentView === 'board'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Layers className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => dispatch(setView('calendar'))}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                currentView === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <CalendarIcon className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Import/Export buttons */}
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <label className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{importLoading ? 'Importing...' : 'Import CSV'}</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" disabled={importLoading} />
          </label>
        </div>
      </div>

      {/* Sorting, Filters and creation header for LIST view */}
      {currentView === 'list' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Quick status filter select */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => dispatch(setFilters({ completed: null }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filters.completed === null
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => dispatch(setFilters({ completed: false }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filters.completed === false
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => dispatch(setFilters({ completed: true }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filters.completed === true
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              Completed
            </button>
            {(filters.search || filters.completed !== null || filters.priority || filters.category || filters.tag || filters.favorite || filters.due_today || filters.overdue) && (
              <button
                onClick={() => dispatch(resetFilters())}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:border-rose-950/30 dark:hover:bg-rose-950/20 transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sorting selection dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 outline-hidden"
            >
              <option value="newest">Newest Created</option>
              <option value="oldest">Oldest Created</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority level</option>
            </select>
          </div>
        </div>
      )}

      {/* Main views rendering switcher */}
      <div>
        {currentView === 'list' && renderListView()}
        {currentView === 'board' && renderBoardView()}
        {currentView === 'calendar' && renderCalendarView()}
      </div>

      {/* Pagination component for List view */}
      {currentView === 'list' && todos.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-5">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Showing Page {page} of {pages} ({total} total tasks)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(setPage(page - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
            </button>
            <button
              onClick={() => dispatch(setPage(page + 1))}
              disabled={page === pages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4.5 w-4.5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Todos;
