import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DeanPage from './pages/DeanPage';
import CoordinatorPage from './pages/CoordinatorPage';
import StudentPage from './pages/StudentPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    const checkAuth = async () => {
        const response = await fetch('http://localhost:8000/check_auth.php', {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.isAuthenticated) {
            localStorage.setItem('isAuthenticated', true);
            localStorage.setItem('userType', data.userType);
        } else {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userType');
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                {/* Admin Route (userType: 1) */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute userType={1}>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />

                {/* Dean Route (userType: 2) */}
                <Route
                    path="/dean"
                    element={
                        <ProtectedRoute userType={2}>
                            <DeanPage />
                        </ProtectedRoute>
                    }
                />

                {/* Coordinator Route (userType: 3) */}
                <Route
                    path="/coordinator"
                    element={
                        <ProtectedRoute userType={3}>
                            <CoordinatorPage />
                        </ProtectedRoute>
                    }
                />

                {/* Student Route (userType: 4) */}
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute userType={4}>
                            <StudentPage />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect unknown paths to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
