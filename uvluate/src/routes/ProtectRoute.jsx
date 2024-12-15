import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const ProtectRoute = ({ children, requiredUserType }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/verifySession.php`, {
                    withCredentials: true,
                });
                if (
                    response.data.status === 'success' &&
                    response.data.userType === requiredUserType
                ) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Session validation failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, [requiredUserType]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectRoute;
