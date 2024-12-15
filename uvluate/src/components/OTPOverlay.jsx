import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OTPOverlay = ({ userID, email, onOTPVerified }) => {
    const [otp, setOtp] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isOtpRequested, setIsOtpRequested] = useState(false);

    // Cooldown timer logic
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [resendCooldown]);

    // Handles OTP request (SEND OTP / RESEND OTP)
    const handleSendOtp = async () => {
        try {
            console.log(`Requesting OTP for userID: ${userID}, email: ${email}`);
            await axios.post(`${process.env.REACT_APP_BACKEND_ADDRESS}/OTP.php`, { userID }, { withCredentials: true });
            setIsOtpRequested(true); // Show OTP input and buttons
            setResendCooldown(60); // Start cooldown timer
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('Failed to send OTP. Please try again.');
        }
    };

    // Handles OTP verification
    const verifyOtp = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_ADDRESS}/VerifyOTP.php`,
                { userID, otp },
                { withCredentials: true }
            );
            if (response.data.status === 'success') {
                alert('OTP verified successfully!');
                onOTPVerified(); // Notify parent component of successful OTP verification
            } else {
                alert(response.data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            alert('Failed to verify OTP. Please try again.');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', background: '#f0f0f0', borderRadius: '10px' }}>
            <h2>OTP Verification</h2>

            {!isOtpRequested ? (
                <>
                    {/* Initial state: Show email and SEND OTP button */}
                    <p>The OTP will be sent to this email: <strong>{email}</strong></p>
                    <button onClick={handleSendOtp} style={{ marginTop: '10px' }}>
                        Send OTP
                    </button>
                </>
            ) : (
                <>
                    {/* After clicking SEND OTP: Show OTP field and Resend/Submit buttons */}
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ display: 'block', margin: '10px 0' }}
                    />
                    <button onClick={verifyOtp} style={{ marginBottom: '10px' }}>
                        Submit
                    </button>
                    <button
                        onClick={handleSendOtp}
                        disabled={resendCooldown > 0} // Disable during cooldown
                        style={{ marginLeft: '10px' }}
                    >
                        {resendCooldown > 0
                            ? `Resend OTP (${resendCooldown}s)` // Cooldown button text
                            : 'Resend OTP'}
                    </button>
                </>
            )}
        </div>
    );
};

export default OTPOverlay;
