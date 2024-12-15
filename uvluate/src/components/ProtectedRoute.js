import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const currentUserType = parseInt(localStorage.getItem('userType'));

    // Check if user is authenticated and has the required user type
    if (!isAuthenticated || currentUserType !== userType) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
