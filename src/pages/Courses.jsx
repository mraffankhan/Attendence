import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X } from 'lucide-react';

const Courses = ({ role }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Modal state for Super Admin creating a course
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseCode, setNewCourseCode] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [createMsg, setCreateMsg] = useState('');

    useEffect(() => {
        fetchCourses();
        if (role === 'super_admin') {
            fetchTeachers();
        }
    }, [role]);

    const fetchTeachers = async () => {
        const { data } = await supabase.from('users').select('id, full_name, email').eq('role', 'teacher');
        if (data) setTeachers(data);
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }
            setCurrentUser(user);

            let fetchedCourses = [];

            if (role === 'super_admin') {
                // Super Admin sees ALL courses
                const { data: coursesData } = await supabase
                    .from('courses')
                    .select(`
                        id, name, code, teacher_id,
                        users (full_name),
                        enrollments (count)
                    `);

                if (coursesData) {
                    fetchedCourses = coursesData.map(c => ({
                        id: c.id,
                        name: c.name,
                        code: c.code,
                        teacher_name: c.users?.full_name || 'Unassigned',
                        students: c.enrollments?.[0]?.count || 0
                    }));
                }
            } else if (role === 'teacher') {
                // Teacher only sees THEIR assigned courses
                const { data: coursesData } = await supabase
                    .from('courses')
                    .select(`
                        id, name, code,
                        enrollments (count)
                    `)
                    .eq('teacher_id', user.id);

                if (coursesData) {
                    fetchedCourses = coursesData.map(c => ({
                        id: c.id,
                        name: c.name,
                        code: c.code,
                        students: c.enrollments?.[0]?.count || 0
                    }));
                }
            } else {
                // Student sees their enrolled courses
                const { data: myEnrs } = await supabase
                    .from('enrollments')
                    .select('course_id, courses(id, name, code)')
                    .eq('student_id', user.id);

                if (myEnrs && myEnrs.length > 0) {
                    const courseIds = myEnrs.map(e => e.course_id);

                    const { data: countsData } = await supabase
                        .from('courses')
                        .select('id, enrollments(count)')
                        .in('id', courseIds);

                    const countMap = {};
                    if (countsData) {
                        countsData.forEach(c => {
                            countMap[c.id] = c.enrollments?.[0]?.count || 0;
                        });
                    }

                    fetchedCourses = myEnrs.map(e => ({
                        id: e.courses.id,
                        name: e.courses.name,
                        code: e.courses.code,
                        students: countMap[e.courses.id] || 0
                    }));
                }
            }

            setCourses(fetchedCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCreateMsg('Creating...');
        try {
            const { error } = await supabase.from('courses').insert({
                name: newCourseName,
                code: newCourseCode,
                teacher_id: selectedTeacherId || null
            });

            if (error) throw error;

            setCreateMsg('Course created successfully!');
            setNewCourseName('');
            setNewCourseCode('');
            setSelectedTeacherId('');
            setTimeout(() => {
                setShowCreateModal(false);
                setCreateMsg('');
                fetchCourses();
            }, 1000);
        } catch (err) {
            setCreateMsg(`Error: ${err.message}`);
        }
    };

    return (
        <div className="main-content">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Courses</h1>
                    <p className="page-description">
                        {role === 'super_admin' ? 'Manage all system courses.' : role === 'teacher' ? 'View your assigned courses.' : 'View your enrolled courses.'}
                    </p>
                </div>
                {role === 'super_admin' && (
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                        <Plus size={18} /> Add New Course
                    </button>
                )}
            </div>

            {loading ? (
                <div>Loading courses...</div>
            ) : courses.length === 0 ? (
                <div className="card text-center py-10">
                    <p className="text-secondary">No courses found matching your criteria.</p>
                </div>
            ) : (
                <div className="components-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.map(course => (
                        <div key={course.id} className="card">
                            <h3>{course.name}</h3>
                            <div className="flex justify-between items-center mt-2 mb-4">
                                <span className="page-description flex-1">{course.code}</span>
                                {role === 'super_admin' && (
                                    <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--surface-color-light)', padding: '0.2rem 0.6rem', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
                                        {course.teacher_name}
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center border-t py-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                <span className="text-secondary" style={{ color: 'var(--text-secondary)' }}>
                                    {course.students} Enrolled
                                </span>
                                <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
                                    {role === 'teacher' ? 'Manage' : 'View Details'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
                        <button onClick={() => setShowCreateModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                        <h3 className="mb-4" style={{ marginBottom: '1.5rem' }}>Create New Course</h3>

                        <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
                            {createMsg && <div style={{ color: createMsg.includes('Error') ? 'var(--error-color)' : 'var(--success-color)' }}>{createMsg}</div>}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Course Name</label>
                                <input type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} required placeholder="e.g. Introduction to AI" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Course Code</label>
                                <input type="text" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} required placeholder="e.g. CS101" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Assign Teacher (Optional)</label>
                                <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary mt-2">Create Course</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
