import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaCog } from 'react-icons/fa';
import axiosInstance from '../routes/AxiosInstance';
import ProgramsManagementCard from './ProgramsManagementCard';
import '../styles/DepartmentManagementCard.css';

const DepartmentManagementCard = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null); // Tracks selected department
    const [menuVisible, setMenuVisible] = useState(null); // Tracks which menu is open
    const menuRefs = useRef({}); // References for each menu
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({ name: '' });
    const [showEditOverlay, setShowEditOverlay] = useState(false); // Show/hide edit overlay

    // Fetch all departments
    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/search.php', { action: 'getDepartments' });
            setDepartments(response.data || []);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Error fetching departments. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // Handle gear icon click
    const handleGearClick = (id) => {
        setMenuVisible(menuVisible === id ? null : id);
    };

    // Handle click outside menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuVisible !== null &&
                menuRefs.current[menuVisible] &&
                !menuRefs.current[menuVisible].contains(event.target)
            ) {
                setMenuVisible(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuVisible]);

    // Handle department selection
    const handleDepartmentClick = (department) => {
        setSelectedDepartment(department);
    };

    // Handle edit click
    const handleEditClick = (department) => {
        setFormData({ name: department.name });
        setShowEditOverlay(true);
        setMenuVisible(null); // Close menu
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setShowEditOverlay(false);
        setFormData({ name: '' });
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        try {
            if (!formData.name) {
                alert('Department name is required.');
                return;
            }

            const action = selectedDepartment ? 'updateDepartment' : 'createDepartment';
            const payload = {
                action,
                department: { ...formData, id: selectedDepartment?.id },
            };

            await axiosInstance.post('/department_management.php', payload);
            alert(`Department ${selectedDepartment ? 'updated' : 'created'} successfully.`);
            setShowEditOverlay(false);
            setFormData({ name: '' });
            fetchDepartments();
        } catch (err) {
            console.error(`Error ${selectedDepartment ? 'updating' : 'creating'} department:`, err);
            alert('Failed to save the department. Please try again.');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;

        try {
            await axiosInstance.post('/department_management.php', {
                action: 'deleteDepartment',
                id,
            });
            alert('Department deleted successfully.');
            fetchDepartments();
        } catch (err) {
            console.error('Error deleting department:', err);
            alert('Failed to delete the department. Please try again.');
        }
    };

    return (
        <div className="department-management-container">
            <h2>Department Management</h2>
            {loading && <p>Loading departments...</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="department-grid">
                {departments.map((dept) => (
                    <div
                        key={dept.id}
                        className={`department-container ${
                            selectedDepartment?.id === dept.id ? 'active' : ''
                        }`}
                        ref={(el) => (menuRefs.current[dept.id] = el)}
                    >
                        <div
                            className="department-button"
                            onClick={() => handleDepartmentClick(dept)}
                        >
                            <span className="department-name">{dept.name}</span>
                        </div>
                        <div className="gear-icon-container">
                            <FaCog
                                className="gear-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleGearClick(dept.id);
                                }}
                            />
                            {menuVisible === dept.id && (
                                <div className="action-menu">
                                    <button onClick={() => handleEditClick(dept)}>Edit</button>
                                    <button onClick={() => handleDelete(dept.id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <button className="add-department-card">+</button>
            </div>

            {selectedDepartment && (
                <div className="programs-management-section">
                    <ProgramsManagementCard department={selectedDepartment} />
                </div>
            )}

            {showEditOverlay && (
                <div className="overlay">
                    <div className="overlay-content">
                        <h3>Edit Department</h3>
                        <div className="form-group">
                            <label>Department Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="overlay-buttons">
                            <button onClick={handleFormSubmit}>Save</button>
                            <button className="cancel-button" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentManagementCard;
