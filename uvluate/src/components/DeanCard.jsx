import React, { useState } from 'react';
import { FaUsers, FaUserPlus } from 'react-icons/fa';
import ListCard from './ListCard';
import DeanProfileCard from './DeanProfileCard';
import EditUserCard from './EditUserCard';
import CreateUserCard from './CreateUserCard';
import '../styles/DeanCard.css';

const DeanCard = () => {
    const [activeComponent, setActiveComponent] = useState('showDeans'); // Default to "showDeans"
    const [selectedUser, setSelectedUser] = useState(null); // Track selected user for editing
    const [refreshKey, setRefreshKey] = useState(0); // Key to trigger list refresh

    const handleShowDeans = () => {
        setActiveComponent('showDeans');
    };

    const handleCreateDean = () => {
        setActiveComponent('createDean');
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setActiveComponent('editDean');
    };

    const handleCancelEdit = () => {
        setActiveComponent('showDeans'); // Reset to showing deans
        setSelectedUser(null); // Clear selected user
    };

    const handleCancelCreate = () => {
        setActiveComponent('showDeans'); // Reset to showing deans
    };

    const refreshList = () => {
        setRefreshKey((prevKey) => prevKey + 1); // Increment key to refresh ListCard
    };

    return (
        <div className="dean-card-container">
            <div className="dean-card">
                <h2>Dean Management</h2>
                <div className="dean-buttons">
                    <button className="dean-button" onClick={handleShowDeans}>
                        <FaUsers size={20} />
                        Show Deans
                    </button>
                    <button className="dean-button" onClick={handleCreateDean}>
                        <FaUserPlus size={20} />
                        Create Dean
                    </button>
                </div>
            </div>

            {activeComponent === 'showDeans' && (
                <div className="dean-content">
                    <ListCard 
                        key={refreshKey} // Use refreshKey to trigger re-render
                        usertype={[2, -2]} 
                        filtertype={2} // Pass filtertype for dynamic filtering
                        ProfileComponent={(props) => (
                            <DeanProfileCard {...props} onEdit={handleEdit} onStatusChange={refreshList} />
                        )}
                    />
                </div>
            )}
            {activeComponent === 'createDean' && (
                <div className="dean-content">
                    <h3>Create a New Dean</h3>
                    <CreateUserCard
                        usertype={2} // Pass usertype 2 for creating a dean
                        onCreate={(newDean) => {
                            console.log('New dean created:', newDean);
                            refreshList(); // Refresh the list after creation
                            setActiveComponent('showDeans'); // Go back to the dean list
                        }}
                        onCancel={handleCancelCreate} // Pass cancel handler
                    />
                </div>
            )}
            {activeComponent === 'editDean' && selectedUser && (
                <div className="dean-content">
                    <h3>Edit Dean</h3>
                    <EditUserCard
                        user={selectedUser}
                        usertype={2} // Pass usertype 2 for editing dean
                        onSave={(updatedUser) => {
                            console.log('Dean updated:', updatedUser);
                            refreshList(); // Refresh the list after editing
                            setActiveComponent('showDeans'); // Go back to the dean list
                        }}
                        onCancel={handleCancelEdit} // Pass cancel handler
                    />
                </div>
            )}
        </div>
    );
};

export default DeanCard;
