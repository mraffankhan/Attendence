import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, X, Users, BookOpen, CheckCircle, AlertCircle, Layers } from 'lucide-react';

const Courses = ({ role }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state for Super Admin creating a course
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [newCourseCode, setNewCourseCode] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [createMsg, setCreateMsg] = useState('');

    // Assign Students Modal state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [assignedStudentIds, setAssignedStudentIds] = useState([]);
    const [assignMsg, setAssignMsg] = useState('');

    // Link to Class Modal state
    const [showLinkClassModal, setShowLinkClassModal] = useState(false);
    const [classes, setClasses] = useState([]);
    const [linkedClassIds, setLinkedClassIds] = useState([]);
    const [linkClassMsg, setLinkClassMsg] = useState('');

    useEffect(() => {
        fetchCourses();
        if (role === 'super_admin' || role === 'admin') {
            fetchTeachersAndStudents();
            fetchClasses();
        }
    }, [role]);

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/classes');
            setClasses(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeachersAndStudents = async () => {
        try {
            const { data } = await api.get('/users');
            setTeachers(data.filter(u => u.role === 'teacher'));
            setStudents(data.filter(u => u.role === 'student'));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseEnrollments = async (courseId) => {
        try {
            const { data } = await api.get(`/enrollments/course/${courseId}`);
            setAssignedStudentIds(data.map(student => student.id));
        } catch (error) {
            console.error('Failed to load course enrollments', error);
        }
    };

    const fetchCourseClasses = async (courseId) => {
        try {
            // We need an endpoint for this, or we can just fetch all classes and filter
            // But let's assume we have an endpoint or we can add one.
            // For now, let's just use the classes we have and fetch linked ones.
            // Actually, let's fetch which classes this course is assigned to.
            // I'll check server/routes/classes.js if there's a reverse lookup.
            // There isn't. I'll just use a try/catch and fetch.
            const { data } = await api.get(`/courses/${courseId}/classes`);
            setLinkedClassIds(data.map(cls => cls.id));
        } catch (error) {
            console.error('Failed to load course classes', error);
            setLinkedClassIds([]);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCreateMsg('Creating...');
        try {
            await api.post('/courses', {
                name: newCourseName,
                code: newCourseCode,
                teacher_id: selectedTeacherId || null
            });

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
            setCreateMsg(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const openAssignModal = (course) => {
        setSelectedCourse(course);
        setAssignedStudentIds([]);
        setAssignMsg('');
        fetchCourseEnrollments(course.id);
        setShowAssignModal(true);
    };

    const openLinkClassModal = (course) => {
        setSelectedCourse(course);
        setLinkedClassIds([]);
        setLinkClassMsg('');
        fetchCourseClasses(course.id);
        setShowLinkClassModal(true);
    };

    const handleToggleStudent = (studentId) => {
        if (assignedStudentIds.includes(studentId)) {
            setAssignedStudentIds(prev => prev.filter(id => id !== studentId));
        } else {
            setAssignedStudentIds(prev => [...prev, studentId]);
        }
    };

    const handleToggleClass = (classId) => {
        if (linkedClassIds.includes(classId)) {
            setLinkedClassIds(prev => prev.filter(id => id !== classId));
        } else {
            setLinkedClassIds(prev => [...prev, classId]);
        }
    };

    const handleSaveAssignments = async () => {
        setAssignMsg('Saving...');
        try {
            await api.post(`/enrollments/course/${selectedCourse.id}`, {
                student_ids: assignedStudentIds
            });
            setAssignMsg('Students assigned successfully!');
            setTimeout(() => {
                setShowAssignModal(false);
                setSelectedCourse(null);
                fetchCourses();
            }, 1000);
        } catch (err) {
            setAssignMsg(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleSaveClassLinks = async () => {
        setLinkClassMsg('Saving...');
        try {
            // We need an endpoint to sync classes for a course
            await api.post(`/courses/${selectedCourse.id}/classes`, {
                classIds: linkedClassIds
            });
            setLinkClassMsg('Classes linked successfully!');
            setTimeout(() => {
                setShowLinkClassModal(false);
                setSelectedCourse(null);
                fetchCourses();
            }, 1000);
        } catch (err) {
            setLinkClassMsg(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="main-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <BookOpen size={26} style={{ color: 'var(--primary-color)' }} />
                        Courses
                    </h1>
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
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p className="text-secondary">Loading courses…</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <BookOpen size={40} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '0.75rem' }} />
                        <p>No courses found matching your criteria.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {courses.map(course => (
                        <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Card Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <BookOpen size={20} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <h3 style={{ fontSize: '1.05rem', margin: 0, lineHeight: 1.3 }}>{course.name}</h3>
                                    <span className="badge badge-amber" style={{ marginTop: '0.35rem' }}>{course.code}</span>
                                </div>
                            </div>

                            {/* Teacher badge */}
                            {role === 'super_admin' && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{
                                        fontSize: '0.8rem', color: 'var(--text-secondary)',
                                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                                    }}>
                                        <Users size={14} />
                                        {course.course_teacher_name || course.teacher_name || 'Unassigned'}
                                    </span>
                                </div>
                            )}

                            {/* Card Footer */}
                            <div style={{
                                marginTop: 'auto', paddingTop: '1rem',
                                borderTop: '1px solid var(--border-color)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <span className="badge badge-blue">
                                    <Users size={12} /> {course.students || 0} Enrolled
                                </span>
                                {(role === 'super_admin' || role === 'admin') ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openLinkClassModal(course)} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} title="Link to Class">
                                            <Layers size={14} />
                                        </button>
                                        <button onClick={() => openAssignModal(course)} className="btn btn-outline" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                                            <Users size={14} /> Assign
                                        </button>
                                    </div>
                                ) : (
                                    <button className="btn btn-outline" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
                                        {role === 'teacher' ? 'Manage' : 'View Details'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '450px' }}>
                        <button onClick={() => setShowCreateModal(false)} className="modal-close"><X size={20} /></button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create New Course</h3>

                        <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {createMsg && (
                                <div className={`toast ${createMsg.includes('Error') ? 'toast-error' : 'toast-success'}`} style={{ marginBottom: 0 }}>
                                    {createMsg.includes('Error') ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                    {createMsg}
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Course Name</label>
                                <input type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} required placeholder="e.g. Introduction to AI" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Course Code</label>
                                <input type="text" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} required placeholder="e.g. CS101" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Assign Teacher (Optional)</label>
                                <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                                    <option value="">Unassigned</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create Course</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Students Modal */}
            {showAssignModal && selectedCourse && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <button onClick={() => setShowAssignModal(false)} className="modal-close"><X size={20} /></button>
                        <h3 style={{ marginBottom: '0.5rem' }}>Assign Students</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Select students for <strong>{selectedCourse.name}</strong>
                        </p>

                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '40vh', marginBottom: '1rem' }}>
                            {students.length === 0 ? (
                                <div className="empty-state"><p>No students available.</p></div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {students.map(student => (
                                        <label key={student.id} className="roster-item" style={{ cursor: 'pointer', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={assignedStudentIds.includes(student.id)} 
                                                    onChange={() => handleToggleStudent(student.id)} 
                                                />
                                                <div>
                                                    <span style={{ fontWeight: 500, fontSize: '0.9rem', display: 'block' }}>{student.full_name}</span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{student.email}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {assignMsg && (
                            <div className={`toast ${assignMsg.includes('Error') ? 'toast-error' : 'toast-success'}`} style={{ marginBottom: '0.5rem' }}>
                                {assignMsg.includes('Error') ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                {assignMsg}
                            </div>
                        )}

                        <button onClick={handleSaveAssignments} className="btn btn-primary" style={{ width: '100%' }}>
                            Save Student Enrollments
                        </button>
                    </div>
                </div>
            )}

            {/* Link to Class Modal */}
            {showLinkClassModal && selectedCourse && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <button onClick={() => setShowLinkClassModal(false)} className="modal-close"><X size={20} /></button>
                        <h3 style={{ marginBottom: '0.5rem' }}>Link to Class</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Assign <strong>{selectedCourse.name}</strong> to specific classes.
                        </p>

                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '40vh', marginBottom: '1rem' }}>
                            {classes.length === 0 ? (
                                <div className="empty-state"><p>No classes available.</p></div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {classes.map(cls => (
                                        <label key={cls.id} className="roster-item" style={{ cursor: 'pointer', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={linkedClassIds.includes(cls.id)} 
                                                    onChange={() => handleToggleClass(cls.id)} 
                                                />
                                                <div>
                                                    <span style={{ fontWeight: 500, fontSize: '0.9rem', display: 'block' }}>{cls.name}</span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Code: {cls.code}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {linkClassMsg && (
                            <div className={`toast ${linkClassMsg.includes('Error') ? 'toast-error' : 'toast-success'}`} style={{ marginBottom: '0.5rem' }}>
                                {linkClassMsg.includes('Error') ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                {linkClassMsg}
                            </div>
                        )}

                        <button onClick={handleSaveClassLinks} className="btn btn-primary" style={{ width: '100%' }}>
                            Save Class Assignments
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
