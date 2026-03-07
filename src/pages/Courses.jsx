import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Courses = ({ role }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, [role]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            let fetchedCourses = [];

            if (role === 'teacher') {
                // Fetch all courses and their enrollment counts
                const { data: coursesData, error } = await supabase
                    .from('courses')
                    .select(`
                        id, name, code,
                        enrollments (count)
                    `);

                if (coursesData) {
                    fetchedCourses = coursesData.map(c => ({
                        id: c.id,
                        name: c.name,
                        code: c.code,
                        students: c.enrollments?.[0]?.count || 0
                    }));
                }
            } else {
                // Fetch student's enrolled courses
                const { data: myEnrs } = await supabase
                    .from('enrollments')
                    .select('course_id, courses(id, name, code)')
                    .eq('student_id', user.id);

                if (myEnrs && myEnrs.length > 0) {
                    const courseIds = myEnrs.map(e => e.course_id);

                    // Fetch total student counts for those specific courses
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
