import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CalendarDays, Clock, MapPin, User } from 'lucide-react';
import api from '../../lib/api';

const Timetable = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('1');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [room, setRoom] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayColors = ['#94a3b8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#ec4899'];

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
        fetchTimetables();
        fetchCourses(); // Fetch all courses
    }, []);

    const fetchClasses = async () => {
        try {
            const { data } = await api.get('/classes');
            setClasses(data);
        } catch (err) {
            console.error('Error fetching classes:', err);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setAllCourses(data);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const { data } = await api.get('/users');
            setTeachers(data.filter(u => u.role === 'teacher'));
        } catch (err) {
            console.error('Error fetching teachers:', err);
        }
    };

    const fetchTimetables = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/timetable');
            setTimetables(data);
        } catch (err) {
            setError('Failed to load timetable');
            console.error('Error fetching timetable:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (!selectedClass) return setError("Select a class");
        if (!selectedCourse) return setError("Select a course");
        setError(null);

        try {
            await api.post('/timetable', {
                class_id: selectedClass,
                course_id: selectedCourse,
                day_of_week: parseInt(dayOfWeek),
                start_time: startTime,
                end_time: endTime,
                room: room || null,
                teacher_id: selectedTeacherId || null
            });
            
            setSelectedClass(''); setSelectedCourse(''); setDayOfWeek('1');
            setStartTime(''); setEndTime(''); setRoom(''); setSelectedTeacherId('');
            setSuccess('Slot added successfully!');
            setTimeout(() => setSuccess(null), 3000);
            await fetchTimetables();
        } catch (err) {
            setError('Failed to add timetable slot');
            console.error('Error adding timetable slot:', err);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Delete this timetable slot?')) return;
        try {
            await api.delete(`/timetable/${id}`);
            await fetchTimetables();
        } catch (err) {
            setError('Failed to delete timetable slot');
        }
    };

    // Group timetables by day
    const groupedByDay = {};
    timetables
        .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
        .forEach(slot => {
            const d = slot.day_of_week;
            if (!groupedByDay[d]) groupedByDay[d] = [];
            groupedByDay[d].push(slot);
        });

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CalendarDays size={28} style={{ color: 'var(--primary-color)' }} />
                    Timetable Configuration
                </h1>
                <p className="page-description">Assign weekly schedules for courses.</p>
            </div>

            {/* Toast messages */}
            {error && <div className="toast toast-error" style={{ cursor: 'pointer' }} onClick={() => setError(null)}>{error}</div>}
            {success && <div className="toast toast-success">{success}</div>}

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                {/* Form Card */}
                <div className="card" style={{ width: '340px', flexShrink: 0 }}>
                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.05rem' }}>Add Schedule Slot</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Fill in the details below</p>

                    <form onSubmit={handleAddSlot} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Class</label>
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required>
                                <option value="">— Select Class —</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Course</label>
                            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required>
                                <option value="">— Select Course —</option>
                                {allCourses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Day</label>
                            <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} required>
                                {days.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Start</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>End</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Room / Location</label>
                            <input type="text" placeholder="e.g. Room 204" value={room} onChange={e => setRoom(e.target.value)} required />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Teacher (optional)</label>
                            <select value={selectedTeacherId} onChange={e => setSelectedTeacherId(e.target.value)}>
                                <option value="">— Select Teacher —</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} disabled={loading}>
                            {loading ? 'Adding…' : <><Plus size={16} /> Assign Slot</>}
                        </button>
                    </form>
                </div>

                {/* Weekly Overview */}
                <div className="card" style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>Weekly Overview</h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                            <p className="text-secondary">Loading timetable…</p>
                        </div>
                    ) : timetables.length === 0 ? (
                        <div className="empty-state">
                            <CalendarDays size={40} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '0.75rem' }} />
                            <p>No timetable slots created yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {Object.entries(groupedByDay).map(([dayIdx, slots]) => (
                                <div key={dayIdx}>
                                    {/* Day Header */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        marginBottom: '0.75rem', paddingBottom: '0.5rem',
                                        borderBottom: `2px solid ${dayColors[dayIdx]}20`
                                    }}>
                                        <span style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: dayColors[dayIdx],
                                            boxShadow: `0 0 6px ${dayColors[dayIdx]}80`
                                        }}></span>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: dayColors[dayIdx] }}>
                                            {days[dayIdx]}
                                        </h4>
                                        <span className="badge" style={{ background: `${dayColors[dayIdx]}15`, color: dayColors[dayIdx], marginLeft: '0.25rem' }}>
                                            {slots.length} slot{slots.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Slots */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {slots.map(slot => (
                                            <div key={slot.id} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                                                background: 'var(--surface-color-light)',
                                                border: '1px solid var(--border-color)',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '0.95rem' }}>
                                                            {slot.course_name || 'Unknown Course'}
                                                        </span>
                                                        {slot.class_name && (
                                                            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>
                                                                {slot.class_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <Clock size={12} /> {slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}
                                                        </span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <MapPin size={12} /> {slot.room || 'TBD'}
                                                        </span>
                                                        {(slot.slot_teacher_name || slot.course_teacher_name) && (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                <User size={12} /> {slot.slot_teacher_name || slot.course_teacher_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteSlot(slot.id)} className="btn-icon-danger" title="Delete slot">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timetable;
