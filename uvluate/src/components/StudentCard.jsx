import React, { useState } from 'react';
import { FaUsers, FaUserPlus } from 'react-icons/fa';
import ListCard from './ListCard';
import StudentProfileCard from './StudentProfileCard';
import EditUserCard from './EditUserCard';
import CreateUserCard from './CreateUserCard';
import '../styles/StudentCard.css';

const StudentCard = () => {
    const [activeComponent, setActiveComponent] = useState('showStudents'); // Default to "showStudents"
    const [selectedUser, setSelectedUser] = useState(null); // Track selected user for editing

    const handleShowStudents = () => {
        setActiveComponent('showStudents');
    };

    const handleCreateStudent = () => {
        setActiveComponent('createStudent');
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setActiveComponent('editStudent');
    };

    const handleCancelEdit = () => {
        setActiveComponent('showStudents'); // Reset to showing students
        setSelectedUser(null); // Clear selected user
    };

    const handleCancelCreate = () => {
        setActiveComponent('showStudents'); // Reset to showing students
    };

    return (
        <div className="student-card-container">
            <div className="student-card">
                <h2>Student Management</h2>
                <div className="student-buttons">
                    <button className="student-button" onClick={handleShowStudents}>
                        <FaUsers size={20} />
                        Show Students
                    </button>
                    <button className="student-button" onClick={handleCreateStudent}>
                        <FaUserPlus size={20} />
                        Create Student
                    </button>
                </div>
            </div>

            {activeComponent === 'showStudents' && (
                <div className="student-content">
                    <ListCard 
                        usertype={[5, -5]} // Pass usertype array
                        filtertype={5} // Pass filtertype for dynamic filters
                        ProfileComponent={(props) => (
                            <StudentProfileCard {...props} onEdit={handleEdit} />
                        )}
                    />
                </div>
            )}
            {activeComponent === 'createStudent' && (
                <div className="student-content">
                    <h3>Create a New Student</h3>
                    <CreateUserCard
                        usertype={5} // Pass usertype 5 for creating a student
                        onCreate={(newStudent) => {
                            console.log('New student created:', newStudent);
                            setActiveComponent('showStudents'); // Go back to the student list
                        }}
                        onCancel={handleCancelCreate} // Pass cancel handler
                    />
                </div>
            )}
            {activeComponent === 'editStudent' && selectedUser && (
                <div className="student-content">
                    <h3>Edit Student</h3>
                    <EditUserCard
                        user={selectedUser}
                        onSave={(updatedUser) => {
                            console.log('User updated:', updatedUser);
                            setActiveComponent('showStudents'); // Go back to the student list
                        }}
                        onCancel={handleCancelEdit} // Pass cancel handler
                    />
                </div>
            )}
        </div>
    );
};

export default StudentCard;
