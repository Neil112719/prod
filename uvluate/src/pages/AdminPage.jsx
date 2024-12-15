import React, { useState } from 'react';
import NavBarSideBar from '../components/NavbarSidebar';
import UserManagementCard from '../components/UserManagementCard';
import AdminCard from '../components/Admincard';
import DepartmentManagementCard from '../components/DepartmentManagementCard';

const AdminPage = () => {
    const [activeComponent, setActiveComponent] = useState(null);

    const dynamicButtons = [
        { label: 'Dashboard', onClick: () => setActiveComponent(<AdminCard />) },
        { label: 'User Management', onClick: () => setActiveComponent(<UserManagementCard />) },
        { label : 'Department Management', onClick : () => setActiveComponent(<DepartmentManagementCard/>)},
    ];

    const footerLinks = [
        { label: 'About Us', href: '/about' },
        { label: 'Privacy Policy', href: '/privacy' },
    ];

    return (
        <div style={{ height: '100vh', overflow: 'hidden' }}>
            <NavBarSideBar
                appTitle="UVluate/Admin Dashboard"
                dynamicButtons={dynamicButtons}
                footerLinks={footerLinks}
                activeComponent={activeComponent}
            />
        </div>
    );
};

export default AdminPage;
