import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    shortcutModalOpen: false,
    currentView: 'list', // 'list' | 'board' | 'calendar'
    toasts: [],
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleShortcutModal: (state) => {
      state.shortcutModalOpen = !state.shortcutModalOpen;
    },
    setView: (state, action) => {
      state.currentView = action.payload;
    },
    addToast: (state, action) => {
      const id = Date.now().toString();
      state.toasts.push({
        id,
        type: 'info',
        duration: 3000,
        ...action.payload,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleShortcutModal,
  setView,
  addToast,
  removeToast,
} = uiSlice.actions;

// Async Action Helper to automatically clear toast notifications after delay
export const showToast = (payload) => (dispatch) => {
  const id = Date.now().toString();
  const duration = payload.duration || 3000;
  dispatch(addToast({ ...payload, id }));
  
  setTimeout(() => {
    dispatch(removeToast(id));
  }, duration);
};

export default uiSlice.reducer;
