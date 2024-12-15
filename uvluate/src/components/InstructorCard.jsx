import React, { useState } from 'react';
import { FaChalkboardTeacher, FaUserPlus } from 'react-icons/fa';
import ListCard from './ListCard';
import InstructorProfileCard from './InstructorProfileCard';
import EditUserCard from './EditUserCard';
import CreateUserCard from './CreateUserCard';
import '../styles/InstructorCard.css';

const InstructorCard = () => {
    const [activeComponent, setActiveComponent] = useState('showInstructors'); // Default to "showInstructors"
    const [selectedUser, setSelectedUser] = useState(null); // Track selected user for editing

    const handleShowInstructors = () => {
        setActiveComponent('showInstructors');
    };

    const handleCreateInstructor = () => {
        setActiveComponent('createInstructor');
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setActiveComponent('editInstructor');
    };

    const handleCancelEdit = () => {
        setActiveComponent('showInstructors'); // Reset to showing instructors
        setSelectedUser(null); // Clear selected user
    };

    const handleCancelCreate = () => {
        setActiveComponent('showInstructors'); // Reset to showing instructors
    };

    return (
        <div className="instructor-card-container">
            <div className="instructor-card">
                <h2>Instructor Management</h2>
                <div className="instructor-buttons">
                    <button className="instructor-button" onClick={handleShowInstructors}>
                        <FaChalkboardTeacher size={20} />
                        Show Instructors
                    </button>
                    <button className="instructor-button" onClick={handleCreateInstructor}>
                        <FaUserPlus size={20} />
                        Create Instructor
                    </button>
                </div>
            </div>

            {activeComponent === 'showInstructors' && (
                <div className="instructor-content">
                    <ListCard 
                        usertype={[4, -4]} // Pass usertype array
                        filtertype={4} // Pass filtertype for dynamic filters
                        ProfileComponent={(props) => (
                            <InstructorProfileCard {...props} onEdit={handleEdit} />
                        )}
                    />
                </div>
            )}
            {activeComponent === 'createInstructor' && (
                <div className="instructor-content">
                    <h3>Create a New Instructor</h3>
                    <CreateUserCard
                        usertype={4} // Pass usertype 4 for creating an instructor
                        onCreate={(newInstructor) => {
                            console.log('New instructor created:', newInstructor);
                            setActiveComponent('showInstructors'); // Go back to the instructor list
                        }}
                        onCancel={handleCancelCreate} // Pass cancel handler
                    />
                </div>
            )}
            {activeComponent === 'editInstructor' && selectedUser && (
                <div className="instructor-content">
                    <h3>Edit Instructor</h3>
                    <EditUserCard
                        user={selectedUser}
                        onSave={(updatedUser) => {
                            console.log('User updated:', updatedUser);
                            setActiveComponent('showInstructors'); // Go back to the instructor list
                        }}
                        onCancel={handleCancelEdit} // Pass cancel handler
                    />
                </div>
            )}
        </div>
    );
};

export default InstructorCard;
