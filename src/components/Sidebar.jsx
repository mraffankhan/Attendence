import { NavLink, useNavigate } from 'react-router-dom';
import { Camera, LayoutDashboard, Menu as MenuIcon, User, LogOut, BookOpen } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ user, handleLogout, isOpen, toggleSidebar }) => {
    return (
        <aside className={`${styles.sidebar} ${isOpen ? '' : styles.closed}`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <Camera className={styles.logoIcon} size={28} />
                    AIAttend
                </div>
                <button onClick={toggleSidebar} className={styles.toggleBtn} title="Toggle Sidebar">
                    <MenuIcon size={24} />
                </button>
            </div>

            <nav className={styles.nav}>
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink
                    to="/courses"
                    className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                >
                    <BookOpen size={20} />
                    <span>Courses</span>
                </NavLink>
            </nav>

            <div className={styles.userProfile}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>{user?.email?.split('@')[0] || 'User'}</span>
                        <span className={styles.userRole}>Student</span>
                    </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
