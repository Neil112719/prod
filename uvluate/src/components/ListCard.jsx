import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../routes/AxiosInstance';
import '../styles/ListCard.css';

const ListCard = ({ usertype, filtertype, ProfileComponent }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [filters, setFilters] = useState({
        department: '',
        program: '',
        year: '',
        section: '',
    });

    const [dynamicFilters, setDynamicFilters] = useState({
        departments: [],
        programs: [],
        years: [],
        sections: [],
    });

    const backendAddress = process.env.REACT_APP_BACKEND_ADDRESS;

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/getUsers.php', { usertype });
            setAllUsers(response.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error fetching users. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [usertype]);

    const fetchFromSearchAPI = useCallback(async (payload) => {
        try {
            const response = await fetch(`${backendAddress}/search.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to fetch data');

            return await response.json();
        } catch (error) {
            console.error('Error calling search.php:', error);
            setError('Error fetching filters. Please try again later.');
            return [];
        }
    }, [backendAddress]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                if (filtertype >= 2) {
                    const departments = await fetchFromSearchAPI({ action: 'getDepartments' });
                    setDynamicFilters((prev) => ({ ...prev, departments }));
                }

                if (filtertype >= 3 && filters.department) {
                    const programs = await fetchFromSearchAPI({
                        action: 'getProgramsByDepartment',
                        department: filters.department,
                    });
                    setDynamicFilters((prev) => ({ ...prev, programs }));
                }

                if (filtertype >= 4 && filters.program) {
                    const years = await fetchFromSearchAPI({
                        action: 'getYearLevelsByProgram',
                        programCode: filters.program,
                    });
                    setDynamicFilters((prev) => ({ ...prev, years }));
                }

                if (filtertype === 5 && filters.program && filters.year) {
                    const sections = await fetchFromSearchAPI({
                        action: 'getSectionsByYear',
                        programCode: filters.program,
                        year: filters.year,
                    });
                    setDynamicFilters((prev) => ({ ...prev, sections }));
                }
            } catch (err) {
                console.error('Error fetching filters:', err);
            }
        };

        fetchFilters();
    }, [filtertype, filters, fetchFromSearchAPI]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        let users = [...allUsers];

        if (search) {
            users = users.filter(
                (user) =>
                    user.fname.toLowerCase().includes(search.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(search.toLowerCase()) ||
                    user.id.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (activeFilter !== 'all') {
            const isActive = activeFilter === 'active';
            users = users.filter((user) => (isActive ? user.usertype > 0 : user.usertype < 0));
        }

        if (filters.department) {
            users = users.filter((user) => user.department === filters.department);
        }

        if (filters.program) {
            users = users.filter((user) => user.program === filters.program);
        }

        if (filters.year) {
            users = users.filter((user) => String(user.year_level) === filters.year);
        }

        if (filters.section) {
            users = users.filter((user) => user.section === filters.section);
        }

        setFilteredUsers(users);
    }, [search, activeFilter, filters, allUsers]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="list-card-container">
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Search by name or ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                </select>
                {filtertype >= 2 && (
                    <select
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                    >
                        <option value="">Select Department</option>
                        {dynamicFilters.departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                )}
                {filtertype >= 3 && (
                    <select
                        value={filters.program}
                        onChange={(e) => handleFilterChange('program', e.target.value)}
                    >
                        <option value="">Select Program</option>
                        {dynamicFilters.programs.map((prog) => (
                            <option key={prog.code} value={prog.name}>
                                {prog.name}
                            </option>
                        ))}
                    </select>
                )}
                {filtertype >= 4 && (
                    <select
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                    >
                        <option value="">Select Year</option>
                        {dynamicFilters.years.map((year) => (
                            <option key={year.year} value={year.year}>
                                {year.year}
                            </option>
                        ))}
                    </select>
                )}
                {filtertype === 5 && (
                    <select
                        value={filters.section}
                        onChange={(e) => handleFilterChange('section', e.target.value)}
                    >
                        <option value="">Select Section</option>
                        {dynamicFilters.sections.map((sec) => (
                            <option key={sec.code} value={sec.name}>
                                {sec.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && filteredUsers.length === 0 && <p>No users found.</p>}
            <ul>
                {filteredUsers.map((user) => (
                    <li key={user.id} className="user-item">
                        <ProfileComponent user={user} onStatusChange={fetchUsers} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListCard;
