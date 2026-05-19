import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { LayoutDashboard, Users, BookOpen, CalendarDays, Layers, TrendingUp, Activity } from 'lucide-react';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, classes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [{ data: usersData }, { data: coursesData }, { data: classesData }] = await Promise.all([
                api.get('/users'),
                api.get('/courses'),
                api.get('/classes')
            ]);
            setStats({
                students: usersData.filter(u => u.role === 'student').length,
                teachers: usersData.filter(u => u.role === 'teacher').length,
                courses: coursesData.length,
                classes: classesData.length
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Total Students', value: stats.students, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Faculty Members', value: stats.teachers, icon: Activity, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { label: 'Active Courses', value: stats.courses, icon: BookOpen, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Classes', value: stats.classes, icon: Layers, color: '#a78bfa', bg: 'rgba(139,92,246,0.1)' },
    ];

    const quickLinks = [
        { label: 'Manage Users', desc: 'Add students & faculty', icon: Users, href: '/superadmin/users', color: '#3b82f6' },
        { label: 'Manage Courses', desc: 'Create & assign courses', icon: BookOpen, href: '/superadmin/courses', color: '#f59e0b' },
        { label: 'Timetable Config', desc: 'Set weekly schedules', icon: CalendarDays, href: '/superadmin/timetable', color: '#10b981' },
    ];

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <LayoutDashboard size={28} style={{ color: 'var(--primary-color)' }} />
                    System Overview
                </h1>
                <p className="page-description">Welcome to the admin control center.</p>
            </div>

            {/* Stat Cards */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[1,2,3,4].map(i => (
                        <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
                            <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
                            <div className="stat-info"><h4>—</h4><p>Loading…</p></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {statCards.map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                                <s.icon size={22} />
                            </div>
                            <div className="stat-info">
                                <h4>{s.value}</h4>
                                <p>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} style={{ color: 'var(--primary-color)' }} /> Quick Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {quickLinks.map((link, i) => (
                        <a key={i} href={link.href} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                                background: `${link.color}15`, color: link.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <link.icon size={22} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', margin: 0 }}>{link.label}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{link.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* System Info */}
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.05) 100%)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} style={{ color: 'var(--success-color)' }} /> System Status
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Platform</p>
                        <p style={{ fontWeight: 600 }}>AIAttend v1.0</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</p>
                        <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-color)', boxShadow: '0 0 8px var(--success-color)', display: 'inline-block' }}></span>
                            All Systems Online
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Users</p>
                        <p style={{ fontWeight: 600 }}>{stats.students + stats.teachers}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
