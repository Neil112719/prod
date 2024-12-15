import React, { useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
    const [showUsers, setShowUsers] = useState(false);
    const [showCreateUserForm, setShowCreateUserForm] = useState(false);
    const [users, setUsers] = useState([]);
    const [userData, setUserData] = useState({
        id_number: '',
        password: '',
        fname: '',
        middlename: '',
        lname: '',
        suffix: '',
        email: '',
        usertype: '4', // Default to "Student"
        department: '',
        course: '',
        section: '',
        year: '',
        otp: '',
        timestamp: ''
    });
    const [editingUser, setEditingUser] = useState(null); // Track user being edited
    const [message, setMessage] = useState('');

    // Fetch users from the backend
    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/get_users.php', { withCredentials: true });
            if (response.data.status === 'success') {
                setUsers(response.data.users);
                setMessage('');
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            setMessage('An error occurred while fetching users.');
        }
    };

    // Toggle user list visibility
    const handleShowUsers = () => {
        if (!showUsers) fetchUsers();
        setShowUsers(!showUsers);
    };

    // Toggle create user form visibility
    const handleShowCreateUserForm = () => {
        setShowCreateUserForm(!showCreateUserForm);
    };

    // Handle input changes in the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    // Handle user creation
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:8000/create_user.php',
                userData,
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            setMessage(response.data.message);
            if (response.data.status === 'success') {
                setShowCreateUserForm(false);
                fetchUsers(); // Refresh user list after creation
                setUserData({
                    id_number: '',
                    password: '',
                    fname: '',
                    middlename: '',
                    lname: '',
                    suffix: '',
                    email: '',
                    usertype: '4',
                    department: '',
                    course: '',
                    section: '',
                    year: '',
                    otp: '',
                    timestamp: ''
                });
            }
        } catch (error) {
            setMessage('An error occurred while creating the user.');
        }
    };

    // Set user data for editing
    const handleEditUser = (user) => {
        setEditingUser(user);
        setUserData(user);
        setShowCreateUserForm(true); // Open form for editing
    };

    // Handle user update
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:8000/update_user.php',
                userData,
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            setMessage(response.data.message);
            if (response.data.status === 'success') {
                setEditingUser(null);
                fetchUsers();
                setShowCreateUserForm(false);
            }
        } catch (error) {
            setMessage('An error occurred while updating the user.');
        }
    };

    // Handle user deletion
    const handleDeleteUser = async (id_number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const response = await axios.post(
                'http://localhost:8000/delete_user.php',
                { id_number },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            setMessage(response.data.message);
            if (response.data.status === 'success') fetchUsers();
        } catch (error) {
            setMessage('An error occurred while deleting the user.');
        }
    };

    return (
        <div className="admin-page">
            <h1>Admin Page</h1>
            <button onClick={handleShowUsers}>{showUsers ? 'Hide Users' : 'Show Users'}</button>
            <button onClick={handleShowCreateUserForm}>{showCreateUserForm ? 'Cancel' : 'Create User'}</button>

            {message && <p>{message}</p>}

            {/* User List with Edit/Delete Options */}
            {showUsers && users.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>ID Number</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>User Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id_number}>
                                <td>{user.id_number}</td>
                                <td>{user.fname}</td>
                                <td>{user.lname}</td>
                                <td>{user.email}</td>
                                <td>{user.usertype}</td>
                                <td>
                                    <button onClick={() => handleEditUser(user)}>Edit</button>
                                    <button onClick={() => handleDeleteUser(user.id_number)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showUsers && users.length === 0 && <p>No users found.</p>}

            {/* Create or Edit User Form */}
            {(showCreateUserForm || editingUser) && (
                <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                    <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                    <input
                        type="text"
                        name="id_number"
                        placeholder="ID Number"
                        value={userData.id_number}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={userData.password}
                        onChange={handleInputChange}
                        required={!editingUser} // Only require password for new users
                    />
                    <input
                        type="text"
                        name="fname"
                        placeholder="First Name"
                        value={userData.fname}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="middlename"
                        placeholder="Middle Name"
                        value={userData.middlename}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="lname"
                        placeholder="Last Name"
                        value={userData.lname}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="suffix"
                        placeholder="Suffix"
                        value={userData.suffix}
                        onChange={handleInputChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={userData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <select
                        name="usertype"
                        value={userData.usertype}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="1">Admin</option>
                        <option value="2">Dean</option>
                        <option value="3">Coordinator</option>
                        <option value="4">Student</option>
                    </select>
                    <input
                        type="text"
                        name="department"
                        placeholder="Department"
                        value={userData.department}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="course"
                        placeholder="Course"
                        value={userData.course}
                        onChange={handleInputChange}
                    />
                    <input
                        type="text"
                        name="section"
                        placeholder="Section"
                        value={userData.section}
                        onChange={handleInputChange}
                    />
                    <input
                        type="number"
                        name="year"
                        placeholder="Year"
                        value={userData.year}
                        onChange={handleInputChange}
                    />
                    <button type="submit">{editingUser ? 'Update User' : 'Create User'}</button>
                </form>
            )}
        </div>
    );
};

export default AdminPage;
