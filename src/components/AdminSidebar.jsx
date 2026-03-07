import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, LayoutDashboard, Menu as MenuIcon, Users, LogOut, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

const AdminSidebar = ({ user, handleLogout, isOpen, toggleSidebar }) => {
    return (
        <aside className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <Camera className={styles.logoIcon} size={28} />
                    AIAttend Admin
                </div>
                <button onClick={toggleSidebar} className={styles.toggleBtn} title="Toggle Sidebar">
                    <MenuIcon size={24} />
                </button>
            </div>

            <nav className={styles.nav}>
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink
                    to="/admin/monitor"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Camera size={20} />
                    <span>Monitor Camera</span>
                </NavLink>
                <NavLink
                    to="/admin/courses"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <MenuIcon size={20} />
                    <span>Manage Courses</span>
                </NavLink>
                <NavLink
                    to="/admin/students"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Users size={20} />
                    <span>Students</span>
                </NavLink>
            </nav>

            <div className={styles.userProfile}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>{user?.email?.split('@')[0] || 'Admin'}</span>
                        <span className={styles.userRole}>Teacher</span>
                    </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
