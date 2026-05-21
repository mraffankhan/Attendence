import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Award, Activity, UserCheck } from 'lucide-react';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [coursesStats, setCoursesStats] = useState([]);
    const [overallStat, setOverallStat] = useState(0);
    const [recentClasses, setRecentClasses] = useState([]);
    const [userName, setUserName] = useState('Student');

    const [activeSession, setActiveSession] = useState(null);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/users/dashboard');
            const { enrollments, attendanceData } = data;

            // Check for active session
            try {
                // Using a silent check to see if an active session exists for current student class
                await api.post('/attendance/self-mark', {});
            } catch (e) {
                // Silent catch: common when no session is active
            }

            if (!enrollments || enrollments.length === 0) {
                setLoading(false);
                return;
            }

            let totalClasses = 0;
            let totalPresent = 0;
            const courseMap = {};

            enrollments.forEach(en => {
                courseMap[en.course_id] = {
                    id: en.course_id,
                    name: en.name,
                    code: en.code,
                    total: 0,
                    present: 0
                };
            });

            const recent = [];

            if (attendanceData) {
                attendanceData.forEach(record => {
                    const cId = record.course_id;
                    if (cId && courseMap[cId]) {
                        courseMap[cId].total += 1;
                        totalClasses += 1;
                        if (record.status === 'present' || record.status === 'late') {
                            courseMap[cId].present += 1;
                            totalPresent += 1;
                        }

                        if (recent.length < 5) {
                            recent.push({
                                id: record.session_id,
                                courseName: record.courseName || 'Unknown',
                                date: record.date,
                                status: record.status,
                                time: record.enter_time
                            });
                        }
                    }
                });
            }

            const formattedStats = Object.values(courseMap).map(c => ({
                ...c,
                percentage: c.total === 0 ? 100 : Math.round((c.present / c.total) * 100)
            })).sort((a, b) => a.name.localeCompare(b.name));

            setCoursesStats(formattedStats);
            setOverallStat(totalClasses === 0 ? 100 : Math.round((totalPresent / totalClasses) * 100));
            setRecentClasses(recent);
            setLoading(false);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    const handleSelfMark = async () => {
        try {
            const { data } = await api.post('/attendance/self-mark');
            setMsg({ text: data.message, type: 'success' });
            fetchDashboardData();
        } catch (err) {
            setMsg({ text: err.response?.data?.message || 'No active session found.', type: 'error' });
        }
        setTimeout(() => setMsg(null), 3000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'var(--success-color)';
            case 'late': return 'var(--warning-color)';
            case 'absent': return 'var(--error-color)';
            default: return 'var(--text-secondary)';
        }
    };

    if (loading) {
        return (
            <div className="main-content flex justify-center items-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Student Dashboard</h1>
                    <p className="page-description">Welcome back! Here's your attendance performance overview.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleSelfMark} className="btn btn-primary" style={{ background: 'var(--success-color)' }}>
                        <UserCheck size={16} /> Mark My Presence
                    </button>
                </div>
            </div>

            {msg && (
                <div className={`toast toast-${msg.type}`} style={{ marginBottom: '1.5rem' }}>
                    {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>
                        <BookOpen size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>{coursesStats.length}</h4>
                        <p>Enrolled Courses</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>{overallStat}%</h4>
                        <p>Total Attendance</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>
                        <Award size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>{overallStat >= 85 ? 'Excellent' : overallStat >= 75 ? 'Good' : 'At Risk'}</h4>
                        <p>Performance Rank</p>
                    </div>
                </div>
            </div>

            <div className="grid lg-grid-cols-2">
                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title"><Activity size={18} /> Course-wise Breakdown</h3>
                    </div>
                    
                    {coursesStats.length === 0 ? (
                        <div className="empty-state">
                            <p>You are not enrolled in any courses yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {coursesStats.map(course => (
                                <div key={course.id} className="glass-panel">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem' }}>{course.name}</h4>
                                            <span className="badge badge-blue" style={{ marginTop: '0.4rem', fontSize: '0.7rem' }}>{course.code}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: course.percentage < 75 ? 'var(--error-color)' : 'white' }}>{course.percentage}%</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{course.present} / {course.total} Sessions</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--surface-color-light)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${course.percentage}%`, 
                                            background: course.percentage < 75 ? 'var(--error-color)' : course.percentage < 85 ? 'var(--warning-color)' : 'var(--primary-color)',
                                            transition: 'width 1s ease-out'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="section-header">
                        <h3 className="section-title"><Clock size={18} /> Recent History</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentClasses.length === 0 ? (
                            <p className="text-secondary text-sm">No recent attendance history.</p>
                        ) : (
                            recentClasses.map((rc, idx) => (
                                <div key={idx} className="roster-item" style={{ padding: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ color: getStatusColor(rc.status) }}>
                                            {rc.status === 'present' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{rc.courseName}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(rc.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="badge" style={{ 
                                        background: `${getStatusColor(rc.status)}15`, 
                                        color: getStatusColor(rc.status),
                                        fontSize: '0.7rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {rc.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
