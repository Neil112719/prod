import React, { useState } from 'react';
import OTPOverlay from '../components/OTPOverlay';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [isOTPVisible, setIsOTPVisible] = useState(false);
    const [userType, setUserType] = useState(null);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/Login.php`, {
                userID,
                password,
            }, {
                withCredentials: true,
            });

            if (response.data.status === 'success') {
                // Save user details in local storage
                const { userID, userType, email, fname, mname, lname, suffix } = response.data;
                localStorage.setItem('userInfo', JSON.stringify({ userID, userType, email, fname, mname, lname, suffix }));

                // Save user type and email in state
                setUserType(userType);
                setEmail(email);
                setIsOTPVisible(true);
            } else {
                alert(response.data.message || 'Invalid login credentials');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again.');
        }
    };

    const handleOTPVerified = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_ADDRESS}/VerifySession.php`, {
                withCredentials: true,
            });

            if (response.data.status === 'success') {
                if (response.data.userType === 1) {
                    navigate('/admin');
                } else if (response.data.userType === 2) {
                    navigate('/dean');
                } else {
                    navigate('/');
                }
            } else {
                alert(response.data.message || 'Session verification failed.');
            }
        } catch (error) {
            console.error('Error during session verification:', error);
            alert('An error occurred during session verification. Please try again.');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Login</h1>
            <input
                type="text"
                placeholder="User ID"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                style={{ display: 'block', margin: '10px 0' }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ display: 'block', margin: '10px 0' }}
            />
            <button onClick={handleLogin} style={{ marginTop: '10px' }}>
                Login
            </button>

            {isOTPVisible && (
                <OTPOverlay
                    userID={userID}
                    email={email}
                    onOTPVerified={handleOTPVerified}
                />
            )}
        </div>
    );
};

export default LoginPage;
