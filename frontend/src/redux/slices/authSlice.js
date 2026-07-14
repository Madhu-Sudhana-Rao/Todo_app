import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Invalid username or password');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      const response = await api.get('/auth/me');
      return response.data;
    } catch (err) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return rejectWithValue(err.response?.data?.error?.message || 'Session expired');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/me', profileData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Profile update failed');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (pwdData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/password', pwdData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Password update failed');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  initLoading: true, // Specific loading check on initial page load
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.initLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.initLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.initLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update password
      .addCase(updatePassword.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
