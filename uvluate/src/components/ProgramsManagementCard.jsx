import React, { useState, useEffect, useCallback } from 'react';
import { FaCog } from 'react-icons/fa';
import axiosInstance from '../routes/AxiosInstance';
import '../styles/ProgramsManagementCard.css';

const ProgramsManagementCard = ({ department }) => {
    const [programs, setPrograms] = useState([]);
    const [menuVisible, setMenuVisible] = useState(null); // Tracks which menu is open
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch programs for the selected department
    const fetchPrograms = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/search.php', {
                action: 'getProgramsByDepartment',
                department: department.name,
            });
            setPrograms(response.data || []);
        } catch (err) {
            console.error('Error fetching programs:', err);
            setError('Error fetching programs. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [department]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    // Handle gear icon click
    const handleGearClick = (id) => {
        setMenuVisible(menuVisible === id ? null : id);
    };

    return (
        <div className="programs-management-container">
            <h3>Programs for {department.name}</h3>
            {loading && <p>Loading programs...</p>}
            {error && <p className="error-message">{error}</p>}

            <div className="programs-grid">
                {programs.map((prog) => (
                    <div key={prog.id} className="program-card">
                        <span>{prog.name}</span>
                        <FaCog
                            className="gear-icon"
                            onClick={() => handleGearClick(prog.id)}
                        />
                        {menuVisible === prog.id && (
                            <div className="action-menu">
                                <button>Edit</button>
                                <button>Delete</button>
                            </div>
                        )}
                    </div>
                ))}
                <button className="add-program-card">+</button>
            </div>
        </div>
    );
};

export default ProgramsManagementCard;
