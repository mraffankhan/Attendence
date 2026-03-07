import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, LayoutDashboard, Menu as MenuIcon, Users, LogOut, Settings, CalendarDays } from 'lucide-react';
import styles from './Sidebar.module.css';

const SuperAdminSidebar = ({ user, handleLogout, isOpen, toggleSidebar }) => {
    return (
        <aside className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <Camera className={styles.logoIcon} size={28} />
                    Admin Portal
                </div>
                <button onClick={toggleSidebar} className={styles.toggleBtn} title="Toggle Sidebar">
                    <MenuIcon size={24} />
                </button>
            </div>

            <nav className={styles.nav}>
                <NavLink
                    to="/superadmin/dashboard"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <LayoutDashboard size={20} />
                    <span>Overview</span>
                </NavLink>
                <NavLink
                    to="/superadmin/users"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Users size={20} />
                    <span>Manage Users</span>
                </NavLink>
                <NavLink
                    to="/superadmin/courses"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <MenuIcon size={20} />
                    <span>Manage Courses</span>
                </NavLink>
                <NavLink
                    to="/superadmin/timetable"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <CalendarDays size={20} />
                    <span>Timetables</span>
                </NavLink>
            </nav>

            <div className={styles.userProfile}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                        A
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>Super Admin</span>
                        <span className={styles.userRole}>System</span>
                    </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default SuperAdminSidebar;
