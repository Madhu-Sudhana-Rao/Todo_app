import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { todos: todoState } = getState();
      const params = {
        page: todoState.page,
        limit: todoState.limit,
        sort_by: todoState.sortBy,
        archived: todoState.filters.archived,
        deleted: todoState.filters.deleted,
      };

      if (todoState.filters.search) params.search = todoState.filters.search;
      if (todoState.filters.completed !== null) params.completed = todoState.filters.completed;
      if (todoState.filters.priority) params.priority = todoState.filters.priority;
      if (todoState.filters.category) params.category = todoState.filters.category;
      if (todoState.filters.tag) params.tag = todoState.filters.tag;
      if (todoState.filters.favorite !== null) params.favorite = todoState.filters.favorite;
      if (todoState.filters.due_today) params.due_today = true;
      if (todoState.filters.overdue) params.overdue = true;

      const response = await api.get('/todos', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (todoData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/todos', todoData);
      dispatch(fetchTodos());
      dispatch(fetchDashboard());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to create task');
    }
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, data }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.put(`/todos/${id}`, data);
      dispatch(fetchTodos());
      dispatch(fetchDashboard());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update task');
    }
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async ({ id, permanent }, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/todos/${id}`, { params: { permanent } });
      dispatch(fetchTodos());
      dispatch(fetchDashboard());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete task');
    }
  }
);

export const restoreTodo = createAsyncThunk(
  'todos/restoreTodo',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/todos/${id}/restore`);
      dispatch(fetchTodos());
      dispatch(fetchDashboard());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to restore task');
    }
  }
);

export const toggleComplete = createAsyncThunk(
  'todos/toggleComplete',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/todos/${id}/complete`);
      dispatch(fetchTodos());
      dispatch(fetchDashboard());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update complete status');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'todos/toggleFavorite',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/todos/${id}/favorite`);
      dispatch(fetchTodos());
      dispatch(fetchDashboard());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update favorite status');
    }
  }
);

export const toggleArchive = createAsyncThunk(
  'todos/toggleArchive',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.patch(`/todos/${id}/archive`);
      dispatch(fetchTodos());
      dispatch(fetchDashboard());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update archive status');
    }
  }
);

export const fetchDashboard = createAsyncThunk(
  'todos/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

const initialFilters = {
  search: '',
  completed: null, // null | true | false
  priority: null, // null | 'low' | 'medium' | 'high'
  category: null,
  tag: null,
  favorite: null, // null | true
  archived: false,
  deleted: false,
  due_today: null,
  overdue: null,
};

const initialState = {
  todos: [],
  total: 0,
  page: 1,
  limit: 10,
  pages: 1,
  sortBy: 'newest',
  filters: { ...initialFilters },
  status: 'idle',
  dashboardStatus: 'idle',
  error: null,
  dashboard: {
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    due_today: 0,
    completion_percentage: 0.0,
    recent_activities: [],
    productivity_stats: [],
  },
  selectedTodo: null,
  isModalOpen: false,
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset page on filter changes
    },
    resetFilters: (state) => {
      state.filters = { ...initialFilters };
      state.page = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.page = 1;
    },
    openTodoModal: (state, action) => {
      state.selectedTodo = action.payload || null;
      state.isModalOpen = true;
    },
    closeTodoModal: (state) => {
      state.selectedTodo = null;
      state.isModalOpen = false;
    },
    clearTodoError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Todos
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todos = action.payload.todos;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Dashboard
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboardStatus = 'loading';
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardStatus = 'succeeded';
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboardStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setPage,
  setFilters,
  resetFilters,
  setSortBy,
  openTodoModal,
  closeTodoModal,
  clearTodoError,
} = todoSlice.actions;

export default todoSlice.reducer;
