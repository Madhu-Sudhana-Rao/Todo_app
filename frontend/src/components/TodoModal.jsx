import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { X, Calendar, Folder, Tag, Star, AlertTriangle } from 'lucide-react';
import { createTodo, updateTodo, closeTodoModal } from '../redux/slices/todoSlice';
import { showToast } from '../redux/slices/uiSlice';

const TodoModal = () => {
  const { selectedTodo } = useSelector((state) => state.todos);
  const dispatch = useDispatch();

  const categories = ['Inbox', 'Work', 'Personal', 'Shopping', 'Finance'];

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: 'Inbox',
      due_date: '',
      tagsInput: '',
      favorite: false,
    },
  });

  // Prefill fields if editing an existing task
  useEffect(() => {
    if (selectedTodo) {
      reset({
        title: selectedTodo.title || '',
        description: selectedTodo.description || '',
        priority: selectedTodo.priority || 'medium',
        category: selectedTodo.category || 'Inbox',
        due_date: formatDateForInput(selectedTodo.due_date),
        tagsInput: selectedTodo.tags?.join(', ') || '',
        favorite: selectedTodo.favorite || false,
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        category: 'Inbox',
        due_date: '',
        tagsInput: '',
        favorite: false,
      });
    }
  }, [selectedTodo, reset]);

  const onSubmit = async (data) => {
    // Parse tags comma-separated string to list
    const tags = data.tagsInput
      ? data.tagsInput.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    const payload = {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      category: data.category,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      tags,
      favorite: data.favorite,
    };

    try {
      if (selectedTodo) {
        await dispatch(updateTodo({ id: selectedTodo.id, data: payload })).unwrap();
        dispatch(showToast({ message: 'Task updated successfully!', type: 'success' }));
      } else {
        await dispatch(createTodo(payload)).unwrap();
        dispatch(showToast({ message: 'Task created successfully!', type: 'success' }));
      }
      dispatch(closeTodoModal());
    } catch (err) {
      dispatch(showToast({ message: err || 'Something went wrong', type: 'error' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {selectedTodo ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={() => dispatch(closeTodoModal())}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="What needs to be done?"
              {...register('title', { required: 'Task title is required' })}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden transition-all ${
                errors.title
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20'
              }`}
            />
            {errors.title && (
              <span className="mt-1 flex items-center gap-1.5 text-xs text-rose-500">
                <AlertTriangle className="h-3.5 w-3.5" />
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              placeholder="Add details, links, or notes..."
              {...register('description')}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>

          {/* Grid fields: Priority, Category, Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Due Date
              </label>
              <input
                type="datetime-local"
                {...register('due_date')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="work, personal, project"
                {...register('tagsInput')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-transparent outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Favorite Switch */}
          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="favorite"
              {...register('favorite')}
              className="h-4.5 w-4.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900"
            />
            <label
              htmlFor="favorite"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 select-none"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Add to Favorites
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
            <button
              type="button"
              onClick={() => dispatch(closeTodoModal())}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all duration-200 shadow-md shadow-indigo-600/10 hover:shadow-indigo-500/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : selectedTodo ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;
