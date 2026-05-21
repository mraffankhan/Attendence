import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, Clock, BookOpen, ArrowRight, Play, Camera } from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        classesToday: [],
        attendanceRate: 0,
        recentAttendance: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().getDay();
            const [{ data: users }, { data: timetable }] = await Promise.all([
                api.get('/users'),
                api.get('/timetable')
            ]);

            const students = users.filter(u => u.role === 'student');
            const todayClasses = timetable.filter(t => t.day_of_week === today);

            setStats({
                totalStudents: students.length,
                classesToday: todayClasses,
                attendanceRate: 85, // Mock rate for now
                recentAttendance: [] // Would fetch from attendance table
            });
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="main-content flex items-center justify-center">
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="main-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Teacher Dashboard</h1>
                    <p className="page-description">Welcome back! Here's what's happening today.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => navigate('/admin/timetable')} className="btn btn-outline">
                        View Schedule
                    </button>
                    <button onClick={() => navigate('/admin/timetable')} className="btn btn-primary">
                        <Play size={16} /> Mark Attendance
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.totalStudents}</h4>
                        <p>Total Students</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.classesToday.length}</h4>
                        <p>Classes Today</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.attendanceRate}%</h4>
                        <p>Avg. Attendance</p>
                    </div>
                </div>
            </div>

            <div className="grid lg-grid-cols-2">
                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title"><Clock size={18} /> Today's Schedule</h3>
                    </div>
                    
                    {stats.classesToday.length === 0 ? (
                        <div className="empty-state">
                            <p>No classes scheduled for today.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {stats.classesToday.map(cls => (
                                <div key={cls.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                        <div style={{ padding: '0.75rem', background: 'var(--surface-color-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{cls.course_name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {cls.start_time.substring(0,5)} - {cls.end_time.substring(0,5)} | Room {cls.room}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/admin/monitor', { state: { slot: cls } })}
                                        className="btn btn-primary" 
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                    >
                                        <Camera size={14} /> Mark Attendance
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title"><Users size={18} /> Class Progress</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Placeholder for class-wise progress */}
                        <div className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                <span>AI Fundamentals</span>
                                <span>88%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--surface-color-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '88%', background: 'var(--primary-color)' }}></div>
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                <span>Database Systems</span>
                                <span>72%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--surface-color-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '72%', background: 'var(--success-color)' }}></div>
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                <span>Software Eng.</span>
                                <span>95%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--surface-color-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '95%', background: '#a78bfa' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
