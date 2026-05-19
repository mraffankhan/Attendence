import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, X, Users, BookOpen, CheckCircle, AlertCircle, Trash2, Layers, Upload, GraduationCap, UserCheck, Pencil } from 'lucide-react';
import * as faceapi from 'face-api.js';

const ManageUsers = () => {
    // Data states
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active tab
    const [activeTab, setActiveTab] = useState('classes');

    // Modal Visibility
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [manageClassId, setManageClassId] = useState(null);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [className, setClassName] = useState('');
    const [classCode, setClassCode] = useState('');
    
    // Photo & Face states
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);

    // Class Management states
    const [classStudents, setClassStudents] = useState([]);
    const [classCourses, setClassCourses] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ full_name: '', email: '', role: '' });
    const [editPhoto, setEditPhoto] = useState(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);
    const [editFaceDescriptor, setEditFaceDescriptor] = useState(null);
    
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchData();
        loadFaceModels();
    }, []);

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({ full_name: user.full_name, email: user.email, role: user.role });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('full_name', editForm.full_name);
        formData.append('email', editForm.email);
        formData.append('role', editForm.role);
        
        if (editPhoto) formData.append('photo', editPhoto);
        if (editFaceDescriptor) formData.append('face_descriptor', JSON.stringify(editFaceDescriptor));

        try {
            await api.put(`/users/${editingUser.id}`, formData);
            showMessage('User updated successfully');
            setEditingUser(null);
            setEditPhoto(null);
            setEditPhotoPreview(null);
            setEditFaceDescriptor(null);
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, true);
        }
    };

    const loadFaceModels = async () => {
        try {
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            console.log('Face models loaded for registration');
        } catch (e) {
            console.error('Error loading face models:', e);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [{ data: usersData }, { data: coursesData }, { data: classesData }] = await Promise.all([
                api.get('/users'),
                api.get('/courses'),
                api.get('/classes')
            ]);
            
            setStudents(usersData.filter(user => user.role === 'student'));
            setTeachers(usersData.filter(user => user.role === 'teacher'));
            setCourses(coursesData);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, isError = false) => {
        setMsg({ text, type: isError ? 'error' : 'success' });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    };

    const detectFace = async (file, callbackDescriptor, callbackPreview, callbackLoading) => {
        callbackPreview(URL.createObjectURL(file));
        callbackLoading(true);
        try {
            const img = await faceapi.bufferToImage(file);
            const detection = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (detection) {
                callbackDescriptor(Array.from(detection.descriptor));
                showMessage('Face detected successfully!');
            } else {
                showMessage('No face detected. Try another photo.', true);
                callbackDescriptor(null);
            }
        } catch (err) {
            console.error('Extraction error:', err);
            showMessage('Error processing image.', true);
        } finally {
            callbackLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedPhoto(file);
        if (role === 'student') {
            await detectFace(file, setFaceDescriptor, setPhotoPreview, setIsExtracting);
        } else {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleEditPhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditPhoto(file);
        if (editForm.role === 'student') {
            await detectFace(file, setEditFaceDescriptor, setEditPhotoPreview, setIsExtracting);
        } else {
            setEditPhotoPreview(URL.createObjectURL(file));
        }
    };

    // --- Create Handlers ---
    const handleCreateUser = async (e) => {
        e.preventDefault();
        
        if (role === 'student' && !faceDescriptor) {
            showMessage('Student must have a valid face scan/photo', true);
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('full_name', fullName || email.split('@')[0]);
        formData.append('role', role);
        if (selectedPhoto) formData.append('photo', selectedPhoto);
        if (faceDescriptor) formData.append('face_descriptor', JSON.stringify(faceDescriptor));

        try {
            await api.post('/auth/register', formData);
            showMessage(`Success! Created ${role}`);
            setEmail(''); setPassword(''); setFullName('');
            setSelectedPhoto(null); setPhotoPreview(null); setFaceDescriptor(null);
            setShowUserModal(false);
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, true);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses', { name: courseName, code: courseCode });
            showMessage('Course created!');
            setCourseName(''); setCourseCode('');
            setShowCourseModal(false);
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, true);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', { name: className, code: classCode });
            showMessage('Class created!');
            setClassName(''); setClassCode('');
            setShowClassModal(false);
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, true);
        }
    };

    // --- Delete Handlers ---
    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${courseId}`);
            showMessage('Course deleted');
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, true);
        }
    };

    const handleDeleteClass = async (classId) => {
        if (!window.confirm('Are you sure you want to delete this class?')) return;
        try {
            await api.delete(`/classes/${classId}`);
            showMessage('Class deleted');
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, true);
        }
    };

    // --- Manage Class Modal Logic ---
    const openManageClass = async (cls) => {
        setManageClassId(cls.id);
        try {
            const [{ data: stds }, { data: crs }] = await Promise.all([
                api.get(`/classes/${cls.id}/students`),
                api.get(`/classes/${cls.id}/courses`)
            ]);
            setClassStudents(stds.map(s => s.id));
            setClassCourses(crs.map(c => c.id));
        } catch (error) {
            console.error(error);
        }
    };

    const saveClassManagement = async () => {
        try {
            await Promise.all([
                api.post(`/classes/${manageClassId}/students`, { studentIds: classStudents }),
                api.post(`/classes/${manageClassId}/courses`, { courseIds: classCourses })
            ]);
            showMessage('Class updated successfully!');
            setManageClassId(null);
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, true);
        }
    };

    if (loading) return (
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p className="text-secondary">Loading system data…</p>
            </div>
        </div>
    );

    // --- Tab-specific action button ---
    const renderActionButton = () => {
        return (
            <div className="flex gap-2">
                <button onClick={() => { setRole('student'); setShowUserModal(true); }} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                    <Plus size={16} /> Add Student
                </button>
                <button onClick={() => { setRole('teacher'); setShowUserModal(true); }} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                    <Plus size={16} /> Add Teacher
                </button>
                <button onClick={() => setShowClassModal(true)} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                    <Layers size={16} /> Add Class
                </button>
                <button onClick={() => setShowCourseModal(true)} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                    <BookOpen size={16} /> Add Course
                </button>
            </div>
        );
    };

    return (
        <div className="main-content">
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Institution Management</h1>
                    <p className="page-description">Oversee Users, Classes, and Courses.</p>
                </div>
                <div>{renderActionButton()}</div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>
                        <GraduationCap size={22} />
                    </div>
                    <div className="stat-info">
                        <h4>{students.length}</h4>
                        <p>Students</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
                        <UserCheck size={22} />
                    </div>
                    <div className="stat-info">
                        <h4>{teachers.length}</h4>
                        <p>Faculty</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>
                        <BookOpen size={22} />
                    </div>
                    <div className="stat-info">
                        <h4>{courses.length}</h4>
                        <p>Courses</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                        <Layers size={22} />
                    </div>
                    <div className="stat-info">
                        <h4>{classes.length}</h4>
                        <p>Classes</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-bar">
                <button className={`tab-item ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>
                    <Layers size={16} /> Classes
                </button>
                <button className={`tab-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
                    <BookOpen size={16} /> Courses
                </button>
            </div>

            {/* Toast Message */}
            {msg.text && (
                <div className={`toast ${msg.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {msg.text}
                </div>
            )}

            {/* ========== TAB CONTENT ========== */}

            {/* Users Grid (Students and Teachers side-by-side) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Students Section */}
                <div className="card" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div className="section-header">
                        <div className="section-title">
                            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)', display: 'flex' }}>
                                <GraduationCap size={18} />
                            </div>
                            Students Roster ({students.length})
                        </div>
                    </div>
                    {students.length === 0 ? (
                        <div className="empty-state"><p>No students registered yet.</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {students.map(u => (
                                <div key={u.id} className="roster-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {u.photo_url ? (
                                            <img src={`http://localhost:5000${u.photo_url}`} alt={u.full_name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-color-hover))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 600, color: 'white', fontSize: '0.85rem', flexShrink: 0
                                            }}>
                                                {u.full_name?.charAt(0).toUpperCase() || 'S'}
                                            </div>
                                        )}
                                        <div>
                                            <p style={{ fontWeight: 500, fontSize: '0.95rem', margin: 0 }}>{u.full_name}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{u.email}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span className={`badge ${u.face_descriptor ? 'badge-blue' : 'badge-amber'}`}>
                                            {u.face_descriptor ? 'Biometric ID Set' : 'Missing ID'}
                                        </span>
                                        <button onClick={() => handleEditClick(u)} className="btn-icon-outline" title="Edit user">
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Teachers Section */}
                <div className="card" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <div className="section-header">
                        <div className="section-title">
                            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', display: 'flex' }}>
                                <UserCheck size={18} />
                            </div>
                            Faculty Roster ({teachers.length})
                        </div>
                    </div>
                    {teachers.length === 0 ? (
                        <div className="empty-state"><p>No teachers registered yet.</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {teachers.map(u => (
                                <div key={u.id} className="roster-item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 600, color: 'white', fontSize: '0.85rem', flexShrink: 0
                                        }}>
                                            {u.full_name?.charAt(0).toUpperCase() || 'T'}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 500, fontSize: '0.95rem', margin: 0 }}>{u.full_name}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{u.email}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <span className="badge badge-green">Teacher</span>
                                        <button onClick={() => handleEditClick(u)} className="btn-icon-outline" title="Edit user">
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <div className="card">
                    <div className="section-header">
                        <div className="section-title">
                            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)', display: 'flex' }}>
                                <BookOpen size={18} />
                            </div>
                            Offered Courses ({courses.length})
                        </div>
                    </div>
                    {courses.length === 0 ? (
                        <div className="empty-state"><p>No courses created yet.</p></div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Course Name</th>
                                    <th>Code</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                                        <td><span className="badge badge-amber">{c.code}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleDeleteCourse(c.id)} className="btn-icon-danger" title="Delete course">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Classes Tab */}
            {activeTab === 'classes' && (
                <div className="card">
                    <div className="section-header">
                        <div className="section-title">
                            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', display: 'flex' }}>
                                <Layers size={18} />
                            </div>
                            Active Classes ({classes.length})
                        </div>
                    </div>
                    {classes.length === 0 ? (
                        <div className="empty-state"><p>No classes created yet.</p></div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Class Name</th>
                                    <th>Code</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                                        <td><span className="badge badge-purple">{c.code}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => openManageClass(c)} className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', marginRight: '0.5rem' }}>
                                                Manage
                                            </button>
                                            <button onClick={() => handleDeleteClass(c.id)} className="btn-icon-danger" title="Delete class">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ========== MODALS ========== */}

            {/* Modal: Create User */}
            {showUserModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '420px' }}>
                        <button onClick={() => setShowUserModal(false)} className="modal-close"><X size={20} /></button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create New {role === 'student' ? 'Student' : 'Teacher'}</h3>
                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                                <input type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
                                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                <input type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
                            </div>

                            {role === 'student' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Student Photo (for Face ID)</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <label className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem' }}>
                                            <Upload size={16} />
                                            {selectedPhoto ? 'Change Photo' : 'Upload Photo'}
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                        </label>
                                        {photoPreview && (
                                            <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '2px solid var(--primary-color)' }}>
                                                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {isExtracting && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ width: '16px', height: '16px' }}></div></div>}
                                            </div>
                                        )}
                                    </div>
                                    {isExtracting && <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: '0.4rem' }}>Detecting face landmarks...</p>}
                                    {faceDescriptor && !isExtracting && <p style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginTop: '0.4rem' }}>✓ Face ID extracted successfully</p>}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={isExtracting}>
                                Create {role === 'student' ? 'Student' : 'Teacher'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Create Course */}
            {showCourseModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '420px' }}>
                        <button onClick={() => setShowCourseModal(false)} className="modal-close"><X size={20} /></button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create New Course</h3>
                        <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Course Name</label>
                                <input type="text" placeholder="Introduction to AI" value={courseName} onChange={e => setCourseName(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Course Code</label>
                                <input type="text" placeholder="CS101" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create Course</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Create Class */}
            {showClassModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '420px' }}>
                        <button onClick={() => setShowClassModal(false)} className="modal-close"><X size={20} /></button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create New Class</h3>
                        <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class Name</label>
                                <input type="text" placeholder="CS Year 1" value={className} onChange={e => setClassName(e.target.value)} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class Code</label>
                                <input type="text" placeholder="CS-Y1" value={classCode} onChange={e => setClassCode(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create Class</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Manage Class (Assign Students/Courses) */}
            {manageClassId && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <button onClick={() => setManageClassId(null)} className="modal-close"><X size={20} /></button>
                        
                        <h3 style={{ marginBottom: '0.5rem' }}>Manage Class Participants</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Select the students and courses for this class.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Select Students</h4>
                                <div style={{ background: 'var(--surface-color-light)', maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                                    {students.map(s => (
                                        <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                                            <input type="checkbox" checked={classStudents.includes(s.id)} 
                                                onChange={(e) => {
                                                    if(e.target.checked) setClassStudents([...classStudents, s.id]);
                                                    else setClassStudents(classStudents.filter(id => id !== s.id));
                                                }} />
                                            {s.full_name}
                                        </label>
                                    ))}
                                    {students.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No students available.</span>}
                                </div>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>Select Courses</h4>
                                <div style={{ background: 'var(--surface-color-light)', maxHeight: '220px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
                                    {courses.map(c => (
                                        <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
                                            <input type="checkbox" checked={classCourses.includes(c.id)} 
                                                onChange={(e) => {
                                                    if(e.target.checked) setClassCourses([...classCourses, c.id]);
                                                    else setClassCourses(classCourses.filter(id => id !== c.id));
                                                }} />
                                            {c.name}
                                        </label>
                                    ))}
                                    {courses.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No courses available.</span>}
                                </div>
                            </div>
                        </div>

                        <button onClick={saveClassManagement} className="btn btn-primary" style={{ width: '100%' }}>Save Changes</button>
                    </div>
                </div>
            )}
            
            {/* Modal: Edit User */}
            {editingUser && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '420px' }}>
                        <button onClick={() => setEditingUser(null)} className="modal-close"><X size={20} /></button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Edit User Details</h3>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                <input type="text" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role</label>
                                <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>

                            {editForm.role === 'student' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Update Photo (Optional)</label>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <label className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem' }}>
                                            <Upload size={16} />
                                            {editPhoto ? 'Change Photo' : 'Upload Photo'}
                                            <input type="file" accept="image/*" onChange={handleEditPhotoChange} style={{ display: 'none' }} />
                                        </label>
                                        {(editPhotoPreview || editingUser.photo_url) && (
                                            <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '2px solid var(--primary-color)' }}>
                                                <img src={editPhotoPreview || `http://localhost:5000${editingUser.photo_url}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                    {isExtracting && <p style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginTop: '0.4rem' }}>Processing face...</p>}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={isExtracting}>
                                Update User
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
