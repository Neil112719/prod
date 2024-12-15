import React, { useState } from 'react';
import { FaUsers, FaUserPlus } from 'react-icons/fa';
import ListCard from './ListCard';
import AdminProfileCard from './AdminProfileCard';
import EditUserCard from './EditUserCard';
import CreateUserCard from './CreateUserCard';
import '../styles/AdminCard.css';

const AdminCard = () => {
    const [activeComponent, setActiveComponent] = useState('showAdmins'); // Default to "showAdmins"
    const [selectedUser, setSelectedUser] = useState(null); // Track selected user for editing

    const handleShowAdmins = () => {
        setActiveComponent('showAdmins');
    };

    const handleCreateAdmin = () => {
        setActiveComponent('createAdmin');
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setActiveComponent('editAdmin');
    };

    const handleCancelEdit = () => {
        setActiveComponent('showAdmins'); // Reset to showing admins
        setSelectedUser(null); // Clear selected user
    };

    const handleCancelCreate = () => {
        setActiveComponent('showAdmins'); // Reset to showing admins
    };

    return (
        <div className="admin-card-container">
            <div className="admin-card">
                <h2>Admin Management</h2>
                <div className="admin-buttons">
                    <button className="admin-button" onClick={handleShowAdmins}>
                        <FaUsers size={20} />
                        Show Admins
                    </button>
                    <button className="admin-button" onClick={handleCreateAdmin}>
                        <FaUserPlus size={20} />
                        Create Admin
                    </button>
                </div>
            </div>

            {activeComponent === 'showAdmins' && (
                <div className="admin-content">
                    <ListCard 
                        usertype={[1, -1]} // Pass usertype array
                        filtertype={1} // Pass filtertype for dynamic filters
                        ProfileComponent={(props) => (
                            <AdminProfileCard {...props} onEdit={handleEdit} />
                        )}
                    />
                </div>
            )}
            {activeComponent === 'createAdmin' && (
                <div className="admin-content">
                    <h3>Create a New Admin</h3>
                    <CreateUserCard
                        usertype={1} // Pass usertype 1 for creating an admin
                        onCreate={(newAdmin) => {
                            console.log('New admin created:', newAdmin);
                            setActiveComponent('showAdmins'); // Go back to the admin list
                        }}
                        onCancel={handleCancelCreate} // Pass cancel handler
                    />
                </div>
            )}
            {activeComponent === 'editAdmin' && selectedUser && (
                <div className="admin-content">
                    <h3>Edit Admin</h3>
                    <EditUserCard
                        user={selectedUser}
                        onSave={(updatedUser) => {
                            console.log('User updated:', updatedUser);
                            setActiveComponent('showAdmins'); // Go back to the admin list
                        }}
                        onCancel={handleCancelEdit} // Pass cancel handler
                    />
                </div>
            )}
        </div>
    );
};

export default AdminCard;
