import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, LayoutDashboard, Menu, Users, LogOut, Settings, CalendarDays } from 'lucide-react';
import styles from './Sidebar.module.css';

const SuperAdminSidebar = ({ user, handleLogout }) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Camera className={styles.logoIcon} size={28} />
                Admin Portal
            </div>

            <nav className={styles.nav}>
                <NavLink
                    to="/superadmin/dashboard"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <LayoutDashboard size={20} />
                    Overview
                </NavLink>
                <NavLink
                    to="/superadmin/users"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Users size={20} />
                    Manage Users
                </NavLink>
                <NavLink
                    to="/superadmin/courses"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Menu size={20} />
                    Manage Courses
                </NavLink>
                <NavLink
                    to="/superadmin/timetable"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <CalendarDays size={20} />
                    Timetables
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
