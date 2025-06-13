
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading user session..." />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to a default page if role not allowed
    // For example, redirect students trying to access admin pages to their dashboard
    const defaultPageRoute = currentUser.role === Role.Admin ? '/admin/dashboard' : '/';
    return <Navigate to={defaultPageRoute} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
