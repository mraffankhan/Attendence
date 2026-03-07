import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Courses = ({ role }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Demo data for now
        setCourses([
            { id: 1, name: 'Introduction to AI', code: 'CS101', students: 45 },
            { id: 2, name: 'Machine Learning Basics', code: 'CS202', students: 30 }
        ]);
        setLoading(false);
    }, []);

    return (
        <div className="main-content">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Courses</h1>
                    <p className="page-description">
                        {role === 'teacher' ? 'Manage your assigned courses.' : 'View your enrolled courses.'}
                    </p>
                </div>
                {role === 'teacher' && (
                    <button className="btn btn-primary">Add New Course</button>
                )}
            </div>

            {loading ? (
                <div>Loading courses...</div>
            ) : (
                <div className="components-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {courses.map(course => (
                        <div key={course.id} className="card">
                            <h3>{course.name}</h3>
                            <p className="page-description" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>{course.code}</p>

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
        </div>
    );
};

export default Courses;
