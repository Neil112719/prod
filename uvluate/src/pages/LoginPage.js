import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [idNumber, setIdNumber] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpOverlay, setShowOtpOverlay] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:8000/login.php',
                { id_number: idNumber, password },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            console.log('Login response:', response.data); // Debug: log the response

            // Immediately handle OTP-required response
            if (response.data?.status === 'otp_required') {
                setShowOtpOverlay(true);
                setErrorMessage(''); // Clear any previous error messages
                console.log('OTP required, overlay set to true'); // Debug confirmation
            } else if (response.data?.status === 'error') {
                setErrorMessage(response.data.message);
                setShowOtpOverlay(false); // Keep the login form visible on error
                console.log('Error during login:', response.data.message); // Debug message
            }
        } catch (error) {
            setErrorMessage("An error occurred during login.");
            console.log('Error during login attempt:', error); // Debugging message
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:8000/verify_otp.php',
                { id_number: idNumber, otp },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            console.log('OTP verification response:', response.data); // Debug: log OTP response

            if (response.data?.status === 'success') {
                const verifiedUserType = response.data.usertype;

                localStorage.setItem('isAuthenticated', true);
                localStorage.setItem('userType', verifiedUserType);

                // Redirect based on user type
                switch (verifiedUserType) {
                    case 1:
                        navigate('/admin');
                        break;
                    case 2:
                        navigate('/dean');
                        break;
                    case 3:
                        navigate('/coordinator');
                        break;
                    case 4:
                        navigate('/student');
                        break;
                    default:
                        setErrorMessage('Unknown user type');
                }
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            setErrorMessage("An error occurred during OTP verification.");
            console.log('Error during OTP verification:', error); // Debugging message
        }
    };

    return (
        <div className="login-page">
            {/* Login Form */}
            {!showOtpOverlay && (
                <form onSubmit={handleLogin}>
                    <h2>Login</h2>
                    <input
                        type="text"
                        placeholder="ID Number"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                </form>
            )}

            {/* OTP Overlay */}
            {showOtpOverlay && (
                <div className="otp-overlay">
                    <form onSubmit={handleOtpSubmit}>
                        <h2>Enter OTP</h2>
                        <input
                            type="text"
                            placeholder="OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit">Verify OTP</button>
                        {errorMessage && <p className="error">{errorMessage}</p>}
                    </form>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
