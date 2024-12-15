import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DeanPage from './pages/DeanPage';
import ProtectRoute from './routes/ProtectRoute';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectRoute requiredUserType={1}>
                            <AdminPage />
                        </ProtectRoute>
                    }
                />
                <Route
                    path="/dean"
                    element={
                        <ProtectRoute requiredUserType={2}>
                            <DeanPage />
                        </ProtectRoute>
                    }
                />

                {/* Redirect unknown paths */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
