import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, LayoutDashboard, Menu, Users, LogOut, Settings } from 'lucide-react';
import styles from './Sidebar.module.css';

const AdminSidebar = ({ user, handleLogout }) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Camera className={styles.logoIcon} size={28} />
                AIAttend Admin
            </div>

            <nav className={styles.nav}>
                <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </NavLink>
                <NavLink
                    to="/admin/monitor"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Camera size={20} />
                    Monitor Camera
                </NavLink>
                <NavLink
                    to="/admin/courses"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Menu size={20} />
                    Manage Courses
                </NavLink>
                <NavLink
                    to="/admin/students"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <Users size={20} />
                    Students
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
