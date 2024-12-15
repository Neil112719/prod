import React, { useState } from 'react';
import { FaUserShield, FaUserGraduate, FaUserTie, FaChalkboardTeacher, FaUserFriends } from 'react-icons/fa';
import AdminCard from './Admincard';
import DeanCard from './DeanCard';
import CoordinatorCard from './CoordinatorCard'; // Import CoordinatorCard
import InstructorCard from './InstructorCard'; // Import InstructorCard
import StudentCard from './StudentCard'; // Import StudentCard
import '../styles/UserManagementCard.css';

const UserManagementCard = () => {
    const [activeComponent, setActiveComponent] = useState(<AdminCard />);

    const handleButtonClick = (component) => {
        setActiveComponent(component);
    };

    return (
        <div className="user-management-card-container">
            <div className="user-management-card">
                <h2>User Management</h2>
                <div className="user-management-buttons">
                    <button
                        className="user-management-button"
                        onClick={() => handleButtonClick(<AdminCard />)}
                    >
                        <FaUserShield size={20} />
                        Admin
                    </button>
                    <button
                        className="user-management-button"
                        onClick={() => handleButtonClick(<DeanCard />)}
                    >
                        <FaUserGraduate size={20} />
                        Dean
                    </button>
                    <button
                        className="user-management-button"
                        onClick={() => handleButtonClick(<CoordinatorCard />)} // Add CoordinatorCard
                    >
                        <FaUserTie size={20} />
                        Coordinator
                    </button>
                    <button
                        className="user-management-button"
                        onClick={() => handleButtonClick(<InstructorCard />)} // Link InstructorCard
                    >
                        <FaChalkboardTeacher size={20} />
                        Instructor
                    </button>
                    <button
                        className="user-management-button"
                        onClick={() => handleButtonClick(<StudentCard />)} // Link StudentCard
                    >
                        <FaUserFriends size={20} />
                        Student
                    </button>
                </div>
            </div>

            <div className="user-management-content">{activeComponent}</div>
        </div>
    );
};

export default UserManagementCard;
