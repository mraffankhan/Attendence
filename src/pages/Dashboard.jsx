import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [coursesStats, setCoursesStats] = useState([]);
    const [overallStat, setOverallStat] = useState(0);
    const [recentClasses, setRecentClasses] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch user's enrollments with course details
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id, courses(name, code)')
                .eq('student_id', user.id);

            if (!enrollments || enrollments.length === 0) {
                setLoading(false);
                return;
            }

            // 2. Fetch all attendance records for this student
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('status, enter_time, sessions(id, date, course_id, courses(name))')
                .eq('student_id', user.id)
                .order('enter_time', { ascending: false });

            // Calculate stats
            let totalClasses = 0;
            let totalPresent = 0;
            const courseMap = {};

            enrollments.forEach(en => {
                courseMap[en.course_id] = {
                    id: en.course_id,
                    name: en.courses.name,
                    code: en.courses.code,
                    total: 0,
                    present: 0
                };
            });

            const recent = [];

            if (attendanceData) {
                attendanceData.forEach(record => {
                    const cId = record.sessions?.course_id;
                    if (cId && courseMap[cId]) {
                        courseMap[cId].total += 1;
                        totalClasses += 1;
                        if (record.status === 'present' || record.status === 'late') {
                            courseMap[cId].present += 1;
                            totalPresent += 1;
                        }

                        if (recent.length < 5) {
                            recent.push({
                                id: record.sessions.id,
                                courseName: record.sessions.courses?.name || 'Unknown',
                                date: record.sessions.date,
                                status: record.status,
                                time: record.enter_time
                            });
                        }
                    }
                });
            }

            // Format course stats for rendering
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

    const getProgressColorClass = (pct) => {
        if (pct >= 85) return '';
        if (pct >= 75) return 'warning';
        return 'danger';
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
        return <div className="main-content flex justify-center items-center">Loading dashboard...</div>;
    }

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Student Dashboard</h1>
                <p className="page-description">Welcome back! Here's an overview of your attendance.</p>
            </div>

            <div className="dashboard-grid">
                {/* LEFT SIDE: Course Wise Attendance */}
                <div className="flex flex-col gap-4">
                    <div className="card h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen size={20} className="text-primary" style={{ color: 'var(--primary-color)' }} />
                            <h3 style={{ margin: 0 }}>Course-wise Attendance</h3>
                        </div>

                        {coursesStats.length === 0 ? (
                            <p className="text-secondary text-sm">You are not enrolled in any courses yet.</p>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {coursesStats.map(course => (
                                    <div key={course.id}>
                                        <div className="flex justify-between items-end mb-1">
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{course.code}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {course.name}
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', color: course.percentage < 75 ? 'var(--error-color)' : '' }}>
                                                {course.percentage}%
                                            </div>
                                        </div>
                                        <div className="attendance-progress">
                                            <div
                                                className={`attendance-progress-bar ${getProgressColorClass(course.percentage)}`}
                                                style={{ width: `${course.percentage}%` }}
                                            />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', textAlign: 'right' }}>
                                            {course.present} / {course.total} classes attended
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Overall & Recent */}
                <div className="flex flex-col gap-6">
                    <div className="card">
                        <h3>Overall Attendance</h3>
                        <div className="mt-4 flex flex-responsive items-center gap-6">
                            <div className="flex items-center justify-center rounded-full" style={{
                                width: 100, height: 100,
                                border: `6px solid ${overallStat >= 85 ? 'var(--success-color)' : overallStat >= 75 ? 'var(--warning-color)' : 'var(--error-color)'}`,
                                flexShrink: 0
                            }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{overallStat}%</span>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                    {overallStat >= 85 ? 'Great job!' : overallStat >= 75 ? 'Needs Improvement' : 'Critical Warning'}
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {overallStat === 100 ? 'You have perfect attendance. Keep it up!'
                                        : `Your overall attendance across all courses is ${overallStat}%.`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={20} className="text-primary" style={{ color: 'var(--primary-color)' }} />
                            <h3 style={{ margin: 0 }}>Recent Classes</h3>
                        </div>

                        {recentClasses.length === 0 ? (
                            <p className="page-description mt-2 text-sm">No recent classes recorded in your history.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentClasses.map((rc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex items-start gap-3">
                                            <div style={{ marginTop: '2px' }}>
                                                {rc.status === 'present' ? <CheckCircle size={16} color="var(--success-color)" /> :
                                                    rc.status === 'late' ? <Clock size={16} color="var(--warning-color)" /> :
                                                        <AlertCircle size={16} color="var(--error-color)" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{rc.courseName}</div>
                                                <div className="flex items-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                    <Calendar size={12} /> {new Date(rc.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            backgroundColor: `${getStatusColor(rc.status)}20`,
                                            color: getStatusColor(rc.status)
                                        }}>
                                            {rc.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
