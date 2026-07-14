import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import AppRoutes from './routes';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { initializeTheme } from './redux/slices/themeSlice';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Resolve current user session from existing local storage token
    dispatch(fetchCurrentUser());
    // Apply initial saved dark/light theme properties
    dispatch(initializeTheme());
  }, [dispatch]);

  return <AppRoutes />;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
