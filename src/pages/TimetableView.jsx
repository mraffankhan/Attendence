import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Info, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';

const TimetableView = () => {
    const [timetables, setTimetables] = useState([]);
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const role = localStorage.getItem('loginType');

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayColors = ['#94a3b8', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#ec4899'];

    useEffect(() => {
        fetchTimetables();
    }, []);

    const fetchTimetables = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/timetable');
            setTimetables(data);
        } catch (err) {
            setError('Failed to load your timetable. Please try again later.');
            console.error('Error fetching timetable:', err);
        } finally {
            setLoading(false);
        }
    };

    const isSlotActive = (slot) => {
        const now = new Date();
        if (now.getDay() !== slot.day_of_week) return false;

        const [startHour, startMin] = slot.start_time.split(':').map(Number);
        const [endHour, endMin] = slot.end_time.split(':').map(Number);
        
        const currentTotal = now.getHours() * 60 + now.getMinutes();
        const startTotal = startHour * 60 + startMin;
        const endTotal = endHour * 60 + endMin;

        // Active from 15 minutes before class starts until class ends
        return currentTotal >= (startTotal - 15) && currentTotal <= endTotal;
    };

    const handleTakeAttendance = (slot) => {
        navigate('/admin/monitor', { state: { slot } });
    };

    if (loading) {
        return (
            <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p className="text-secondary">Loading your schedule…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Weekly Timetable</h1>
                <p className="page-description">View your scheduled classes and manage attendance.</p>
            </div>

            {successMessage && (
                <div className="toast toast-success" style={{ marginBottom: '1.5rem' }}>
                    <CheckCircle size={16} /> {successMessage}
                </div>
            )}

            {error && <div className="error-msg">{error}</div>}

            <div className="card" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                <div className="flex flex-col gap-8">
                    {timetables.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <Info size={48} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Classes Scheduled</h3>
                            <p className="text-secondary">Your timetable is currently empty. Check back later or contact administration.</p>
                        </div>
                    ) : (
                        days.map((dayName, dayIndex) => {
                            const daySlots = timetables.filter(slot => slot.day_of_week === dayIndex)
                                .sort((a, b) => a.start_time.localeCompare(b.start_time));
                                
                            if (daySlots.length === 0) return null;

                            return (
                                <div key={dayIndex} className="page-entrance" style={{ animationDelay: `${dayIndex * 0.1}s` }}>
                                    <div style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                        marginBottom: '1.25rem', paddingBottom: '0.75rem',
                                        borderBottom: `2px solid ${dayColors[dayIndex]}20`
                                    }}>
                                        <div style={{ 
                                            width: '10px', height: '10px', borderRadius: '50%', 
                                            background: dayColors[dayIndex],
                                            boxShadow: `0 0 8px ${dayColors[dayIndex]}80`
                                        }}></div>
                                        <h2 style={{ margin: 0, fontSize: '1.1rem', color: dayColors[dayIndex], fontWeight: 700, letterSpacing: '0.5px' }}>
                                            {dayName.toUpperCase()}
                                        </h2>
                                        <span className="badge" style={{ background: `${dayColors[dayIndex]}15`, color: dayColors[dayIndex], fontSize: '0.7rem' }}>
                                            {daySlots.length} SESSION{daySlots.length !== 1 ? 'S' : ''}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {daySlots.map(slot => (
                                            <div key={slot.id} className="glass-panel">
                                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                     <div style={{
                                                         width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                                         background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)',
                                                         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                     }}>
                                                         <Clock size={20} />
                                                     </div>
                                                     <div style={{ textAlign: 'right' }}>
                                                         <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>
                                                             {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                                         </p>
                                                         <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duration: 1h</p>
                                                     </div>
                                                 </div>

                                                 <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>
                                                     {slot.course_name || 'General Session'}
                                                 </h3>
                                                 
                                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                         <MapPin size={14} />
                                                         <span>{slot.room || 'Location TBD'}</span>
                                                     </div>
                                                     {(slot.slot_teacher_name || slot.course_teacher_name) && (
                                                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                             <User size={14} />
                                                             <span>{slot.slot_teacher_name || slot.course_teacher_name}</span>
                                                         </div>
                                                     )}
                                                 </div>

                                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                     <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                                                         {slot.course_code || 'LAB'}
                                                     </span>
                                                     {role === 'teacher' ? (
                                                         slot.session_status === 'completed' ? (
                                                             <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>Completed</span>
                                                         ) : isSlotActive(slot) ? (
                                                             <button 
                                                                onClick={() => handleTakeAttendance(slot)}
                                                                className="btn btn-primary" 
                                                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', animation: 'pulse 2s infinite' }}
                                                             >
                                                                 Mark Attendance
                                                             </button>
                                                         ) : (
                                                             <span className="badge badge-amber" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Available at class time</span>
                                                         )
                                                     ) : (
                                                         slot.class_name && (
                                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                              {slot.session_status === 'completed' && (
                                                                  <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Completed</span>
                                                              )}
                                                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                                  {slot.class_name}
                                                              </span>
                                                          </div>
                                                         )
                                                     )}
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimetableView;
