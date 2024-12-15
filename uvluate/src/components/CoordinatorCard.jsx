import React, { useState } from 'react';
import { FaUsers, FaUserPlus } from 'react-icons/fa';
import ListCard from './ListCard';
import CoordinatorProfileCard from './CoordinatorProfileCard';
import EditUserCard from './EditUserCard';
import CreateUserCard from './CreateUserCard';
import '../styles/CoordinatorCard.css';

const CoordinatorCard = () => {
    const [activeComponent, setActiveComponent] = useState('showCoordinators'); // Default to "showCoordinators"
    const [selectedUser, setSelectedUser] = useState(null); // Track selected user for editing

    const handleShowCoordinators = () => {
        setActiveComponent('showCoordinators');
    };

    const handleCreateCoordinator = () => {
        setActiveComponent('createCoordinator');
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setActiveComponent('editCoordinator');
    };

    const handleCancelEdit = () => {
        setActiveComponent('showCoordinators'); // Reset to showing coordinators
        setSelectedUser(null); // Clear selected user
    };

    const handleCancelCreate = () => {
        setActiveComponent('showCoordinators'); // Reset to showing coordinators
    };

    return (
        <div className="coordinator-card-container">
            <div className="coordinator-card">
                <h2>Coordinator Management</h2>
                <div className="coordinator-buttons">
                    <button className="coordinator-button" onClick={handleShowCoordinators}>
                        <FaUsers size={20} />
                        Show Coordinators
                    </button>
                    <button className="coordinator-button" onClick={handleCreateCoordinator}>
                        <FaUserPlus size={20} />
                        Create Coordinator
                    </button>
                </div>
            </div>

            {activeComponent === 'showCoordinators' && (
                <div className="coordinator-content">
                    <ListCard
                        usertype={[3, -3]} // Pass usertype array
                        filtertype={3} // Pass filtertype for dynamic filters
                        ProfileComponent={(props) => (
                            <CoordinatorProfileCard {...props} onEdit={handleEdit} onStatusChange={handleShowCoordinators} />
                        )}
                    />
                </div>
            )}
            {activeComponent === 'createCoordinator' && (
                <div className="coordinator-content">
                    <h3>Create a New Coordinator</h3>
                    <CreateUserCard
                        usertype={3} // Pass usertype 3 for creating a coordinator
                        onCreate={(newCoordinator) => {
                            console.log('New coordinator created:', newCoordinator);
                            setActiveComponent('showCoordinators'); // Go back to the coordinator list
                        }}
                        onCancel={handleCancelCreate} // Pass cancel handler
                    />
                </div>
            )}
            {activeComponent === 'editCoordinator' && selectedUser && (
                <div className="coordinator-content">
                    <h3>Edit Coordinator</h3>
                    <EditUserCard
                        user={selectedUser}
                        usertype={3} // Pass usertype 3 for editing coordinator
                        onSave={(updatedUser) => {
                            console.log('Coordinator updated:', updatedUser);
                            setActiveComponent('showCoordinators'); // Go back to the coordinator list
                        }}
                        onCancel={handleCancelEdit} // Pass cancel handler
                    />
                </div>
            )}
        </div>
    );
};

export default CoordinatorCard;
