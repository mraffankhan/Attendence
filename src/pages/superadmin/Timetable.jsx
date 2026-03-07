import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';

const Timetable = () => {
    const [courses, setCourses] = useState([]);
    const [timetables, setTimetables] = useState([]);

    // Form State
    const [selectedCourse, setSelectedCourse] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState('1');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [room, setRoom] = useState('');

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        // We would fetch actual data here, but mock it for fast UI build
        setCourses([
            { id: 'c1', name: 'Intro to AI' },
            { id: 'c2', name: 'Database Systems' }
        ]);
    }, []);

    const handleAddSlot = (e) => {
        e.preventDefault();
        if (!selectedCourse) return alert("Select a course");

        const courseObj = courses.find(c => c.id === selectedCourse);

        const newSlot = {
            id: Math.random().toString(),
            courseName: courseObj.name,
            day: parseInt(dayOfWeek),
            start: startTime,
            end: endTime,
            room: room
        };

        setTimetables([...timetables, newSlot]);
    };

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Timetable Configuration</h1>
                <p className="page-description">Assign weekly schedules for courses.</p>
            </div>

            <div className="flex gap-6">
                <div className="card" style={{ flex: 1, height: 'fit-content' }}>
                    <h3>Add Schedule Slot</h3>
                    <form onSubmit={handleAddSlot} className="flex flex-col gap-4 mt-4">
                        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required>
                            <option value="">-- Select Course --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <select value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)} required>
                            {days.map((day, idx) => <option key={idx} value={idx}>{day}</option>)}
                        </select>

                        <div className="flex gap-2">
                            <div className="w-full">
                                <label className="text-sm text-secondary mb-1 block">Start Time</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                            </div>
                            <div className="w-full">
                                <label className="text-sm text-secondary mb-1 block">End Time</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                            </div>
                        </div>

                        <input type="text" placeholder="Room/Location" value={room} onChange={e => setRoom(e.target.value)} required />

                        <button type="submit" className="btn btn-primary w-full mt-2">
                            <Plus size={18} /> Assign Slot
                        </button>
                    </form>
                </div>

                <div className="card" style={{ flex: 2 }}>
                    <h3>Weekly Overview</h3>
                    <div className="mt-4 flex flex-col gap-4">
                        {timetables.length === 0 ? <p className="text-secondary">No timetable slots created yet.</p> : (
                            timetables.sort((a, b) => a.day - b.day).map(slot => (
                                <div key={slot.id} className="glass-panel p-4 flex justify-between items-center" style={{ backgroundColor: 'var(--surface-color-light)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--primary-color)' }}>{slot.courseName}</h4>
                                        <span className="text-sm text-secondary">{days[slot.day]} • {slot.start} - {slot.end}</span>
                                    </div>
                                    <div className="px-3 py-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
                                        {slot.room}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
