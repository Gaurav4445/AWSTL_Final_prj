import React, { useEffect, useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { RegisterPage } from './pages/RegisterPage';
import { TasksPage } from './pages/TasksPage';
import { VendorsPage } from './pages/VendorsPage';

const SocketBridge = () => {
  const { user, isAuthenticated } = useAuth();

  const socket = useMemo(() => {
    const baseUrl = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5000';
    return io(baseUrl, { autoConnect: false });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socket.disconnect();
      return undefined;
    }

    socket.connect();
    socket.emit('joinUserRoom', user._id || user.id);

    const handleNotification = (notification) => {
      toast.info(notification.title || 'New notification', {
        description: notification.message,
      });
    };

    socket.on('newNotification', handleNotification);

    return () => {
      socket.off('newNotification', handleNotification);
      socket.disconnect();
    };
  }, [isAuthenticated, socket, user]);

  return null;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <SocketBridge />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute>
              <PropertiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/:id"
          element={
            <ProtectedRoute>
              <PropertyDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <VendorsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
