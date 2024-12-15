import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaBars } from 'react-icons/fa';
import '../styles/NavBarSideBar.css';

const NavBarSideBar = ({ appTitle, dynamicButtons, footerLinks, activeComponent }) => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    // Retrieve user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};

    const handleLogout = () => {
        // Clear session and local storage, redirect to login
        document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handleSettingsClick = () => {
        alert('User settings clicked!');
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className={`layout-container ${collapsed ? 'collapsed' : ''}`}>
            {/* Navbar */}
            <div className="navbar">
                <div className="navbar-left">
                    <button className="collapse-button" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <img
                        src="/path-to-logo.png" // Replace with actual logo path
                        alt="School Logo"
                        className="logo"
                    />
                    <h1>{appTitle || 'UVluate'}</h1>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>

            {/* Main Layout */}
            <div className="main-layout">
                {/* Sidebar */}
                <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                    <ul className="sidebar-buttons">
                        {dynamicButtons.map((button, index) => (
                            <li key={index}>
                                <button 
                                    className="sidebar-button"
                                    onClick={button.onClick}
                                >
                                    {button.label}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* User Card */}
                    <div className="user-card-container">
                        <div className="user-card">
                            <h3>
                                {`${userInfo.fname} ${userInfo.mname || ''} ${userInfo.lname} ${userInfo.suffix || ''}`.trim()}
                            </h3>
                            <p>User ID: {userInfo.userID}</p>
                        </div>
                        <button className="gear-icon" onClick={handleSettingsClick}>
                            <FaCog size={20} />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="sidebar-footer">
                        {footerLinks.map((link, index) => (
                            <a key={index} href={link.href} target="_blank" rel="noopener noreferrer">
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="content-area">
                    {activeComponent}
                </div>
            </div>
        </div>
    );
};

export default NavBarSideBar;
