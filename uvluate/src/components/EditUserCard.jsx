import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../routes/AxiosInstance';
import '../styles/EditUserCard.css';

const EditUserCard = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        fname: user.fname || '',
        mname: user.mname || '',
        lastname: user.lastname || '',
        suffix: user.suffix || '',
        email: user.email || '',
        department: user.department || '',
        program: user.program || '',
        year: user.year || '',
        section: user.section || '',
    });

    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [years, setYears] = useState([]);
    const [sections, setSections] = useState([]);

    const backendAddress = process.env.REACT_APP_BACKEND_ADDRESS;

    const fetchFromSearchAPI = useCallback(async (payload) => {
        try {
            const response = await fetch(`${backendAddress}/search.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching data from search.php:', error);
            return [];
        }
    }, [backendAddress]);

    useEffect(() => {
        const fetchFilters = async () => {
            if (user.usertype >= 2) {
                const departmentsData = await fetchFromSearchAPI({ action: 'getDepartments' });
                setDepartments(departmentsData);
            }

            if (user.usertype >= 3 && formData.department) {
                const programsData = await fetchFromSearchAPI({
                    action: 'getProgramsByDepartment',
                    department: formData.department,
                });
                setPrograms(programsData);
            }

            if (user.usertype >= 4 && formData.program) {
                const yearsData = await fetchFromSearchAPI({
                    action: 'getYearLevelsByProgram',
                    programCode: formData.program,
                });
                setYears(yearsData);
            }

            if (user.usertype === 5 && formData.program && formData.year) {
                const sectionsData = await fetchFromSearchAPI({
                    action: 'getSectionsByYear',
                    programCode: formData.program,
                    year: formData.year,
                });
                setSections(sectionsData);
            }
        };

        fetchFilters();
    }, [user.usertype, formData, fetchFromSearchAPI]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update formData and clear dependent fields when a parent filter changes
        setFormData((prev) => ({
            ...prev,
            [name]: value || '',
            ...(name === 'department' && { program: '', year: '', section: '' }),
            ...(name === 'program' && { year: '', section: '' }),
            ...(name === 'year' && { section: '' }),
        }));
    };

    const handleSave = async () => {
        try {
            // Save actual values instead of codes
            const programName = programs.find((prog) => prog.code === formData.program)?.name || '';
            const yearLevelName = years.find((year) => year.year === formData.year)?.year || '';
            const sectionName = sections.find((sec) => sec.code === formData.section)?.name || '';

            const updatedFormData = {
                ...formData,
                program: programName,
                year: yearLevelName,
                section: sectionName,
            };

            await axiosInstance.post('/update_user.php', {
                action: 'updateUser',
                id: user.id,
                updates: updatedFormData,
            });

            alert('User updated successfully.');
            onSave(updatedFormData); // Callback to refresh parent component
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    return (
        <div className="edit-user-overlay">
            <div className="edit-user-card">
                <h3>Edit User</h3>
                <form>
                    <div className="form-row">
                        <div className="form-group">
                            <label>ID:</label>
                            <span>{user.id}</span>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name:</label>
                            <input
                                name="fname"
                                value={formData.fname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Middle Name:</label>
                            <input
                                name="mname"
                                value={formData.mname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name:</label>
                            <input
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Suffix:</label>
                            <input
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-row full-width">
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    {user.usertype >= 2 && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Department:</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.name}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {user.usertype >= 3 && (
                                <div className="form-group">
                                    <label>Program:</label>
                                    <select
                                        name="program"
                                        value={formData.program}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Program</option>
                                        {programs.map((prog) => (
                                            <option key={prog.code} value={prog.code}>
                                                {prog.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                    {user.usertype === 5 && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Year:</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Year</option>
                                    {years.map((year) => (
                                        <option key={year.year} value={year.year}>
                                            {year.year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Section:</label>
                                <select
                                    name="section"
                                    value={formData.section}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map((sec) => (
                                        <option key={sec.code} value={sec.code}>
                                            {sec.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </form>
                <div className="edit-user-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

EditUserCard.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        fname: PropTypes.string,
        mname: PropTypes.string,
        lastname: PropTypes.string,
        suffix: PropTypes.string,
        email: PropTypes.string,
        department: PropTypes.string,
        program: PropTypes.string,
        year: PropTypes.string,
        section: PropTypes.string,
        usertype: PropTypes.number.isRequired,
    }).isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default EditUserCard;
