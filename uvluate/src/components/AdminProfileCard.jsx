import React from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../routes/AxiosInstance';
import '../styles/AdminProfileCard.css';

const AdminProfileCard = ({ user, onEdit, onStatusChange }) => {
    const currentUserID = JSON.parse(localStorage.getItem('userInfo'))?.userID;

    const fullName = `${user.fname} ${user.mname || ''} ${user.lastname} ${user.suffix || ''}`.trim();
    const isDeactivated = user.usertype < 0;

    const handleDeactivate = async () => {
        const updatedType = user.usertype > 0 ? -1 : 1;
        try {
            await axiosInstance.post('/update_user.php', {
                id: user.id,
                updates: { usertype: updatedType },
            });
            alert(`User has been ${updatedType > 0 ? 'reactivated' : 'deactivated'} successfully.`);
            if (onStatusChange) onStatusChange();
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    return (
        <div className="admin-profile-container">
            <div className={`admin-profile-card ${isDeactivated ? 'deactivated' : ''}`}>
                <div className="profile-header">
                    <span>
                        <strong>{fullName}</strong> ({user.id})
                    </span>
                    <span className={`user-type-indicator ${isDeactivated ? 'red' : 'green'}`}>
                        {isDeactivated ? '🔴' : '🟢'}
                    </span>
                </div>
                <div className="profile-info">
                    <p>{user.email}</p>
                </div>
            </div>
            <div className="action-buttons">
                <button className="edit-button" onClick={() => onEdit(user)}>Edit</button>
                <button
                    className={`deactivate-button ${isDeactivated ? 'reactivate' : 'deactivate'} ${
                        user.id === currentUserID ? 'disabled' : ''
                    }`}
                    onClick={handleDeactivate}
                    disabled={user.id === currentUserID} // Disable for the current user
                >
                    {user.id === currentUserID ? 'Current User' : isDeactivated ? 'Reactivate' : 'Deactivate'}
                </button>
            </div>
        </div>
    );
};

AdminProfileCard.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        fname: PropTypes.string.isRequired,
        mname: PropTypes.string,
        lastname: PropTypes.string.isRequired,
        suffix: PropTypes.string,
        email: PropTypes.string.isRequired,
        usertype: PropTypes.number.isRequired,
    }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
};

export default AdminProfileCard;
