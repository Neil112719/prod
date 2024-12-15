import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../routes/AxiosInstance'; // For user creation
import '../styles/CreateUserCard.css';

const CreateUserCard = ({ usertype, onCreate, onCancel }) => {
    const [formData, setFormData] = useState({
        id: '',
        fname: '',
        mname: '',
        lastname: '',
        suffix: '',
        email: '',
        password: '',
        department: '',
        program: '',
        year: '',
        section: '',
    });

    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [years, setYears] = useState([]);
    const [sections, setSections] = useState([]);

    const backendAddress = process.env.REACT_APP_BACKEND_ADDRESS;

    // Fetch dynamic data using search.php API
    const fetchFromSearchAPI = useCallback(async (payload) => {
        try {
            const response = await fetch(`${backendAddress}/search.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to fetch data from search.php');
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error calling search.php:', error);
            return [];
        }
    }, [backendAddress]);

    // Fetch departments on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            const departmentsData = await fetchFromSearchAPI({ action: 'getDepartments' });
            setDepartments(departmentsData);
        };

        fetchDepartments();
    }, [fetchFromSearchAPI]);

    // Fetch programs when department changes
    useEffect(() => {
        if (!formData.department) return;

        const fetchPrograms = async () => {
            const programsData = await fetchFromSearchAPI({
                action: 'getProgramsByDepartment',
                department: formData.department,
            });
            setPrograms(programsData);
        };

        fetchPrograms();
    }, [formData.department, fetchFromSearchAPI]);

    // Fetch years when program changes
    useEffect(() => {
        if (!formData.program) return;

        const fetchYears = async () => {
            const yearsData = await fetchFromSearchAPI({
                action: 'getYearLevelsByProgram',
                programCode: formData.program,
            });
            setYears(yearsData);
        };

        fetchYears();
    }, [formData.program, fetchFromSearchAPI]);

    // Fetch sections when program and year change
    useEffect(() => {
        if (!formData.program || !formData.year) return;

        const fetchSections = async () => {
            const sectionsData = await fetchFromSearchAPI({
                action: 'getSectionsByYear',
                programCode: formData.program,
                year: formData.year,
            });
            setSections(sectionsData);
        };

        fetchSections();
    }, [formData.program, formData.year, fetchFromSearchAPI]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value || '',
        });

        if (name === 'id') {
            setFormData((prev) => ({
                ...prev,
                password: value, // Set password to be the same as ID by default
            }));
        }
    };

    const handleCreate = async () => {
        try {
            // Map program, year, and section codes to their names
            const programName = programs.find((prog) => prog.code === formData.program)?.name || '';
            const yearLevelName = years.find((year) => year.year === formData.year)?.year || '';
            const sectionName = sections.find((sec) => sec.code === formData.section)?.name || '';

            const updatedFormData = {
                ...formData,
                program: programName,
                year: yearLevelName,
                section: sectionName,
            };

            await axiosInstance.post('/create_user.php', {
                ...updatedFormData,
                usertype,
            });
            alert('User created successfully.');
            onCreate(updatedFormData); // Callback to refresh parent component
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user. Please try again.');
        }
    };

    return (
        <div className="create-user-overlay">
            <div className="create-user-card">
                <h3>Create User</h3>
                <form>
                    <div className="form-row">
                        <div className="form-group">
                            <label>ID:</label>
                            <input
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                name="password"
                                value={formData.password}
                                readOnly
                            />
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
                    {usertype >= 2 && (
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
                            {usertype >= 3 && (
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
                    {usertype === 5 && (
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
                <div className="create-user-buttons">
                    <button onClick={handleCreate}>Create</button>
                    <button className="cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

CreateUserCard.propTypes = {
    usertype: PropTypes.number.isRequired,
    onCreate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default CreateUserCard;
