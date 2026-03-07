import React from 'react';

const Dashboard = () => {
    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Student Dashboard</h1>
                <p className="page-description">Welcome back! Here's an overview of your attendance.</p>
            </div>

            <div className="flex gap-6">
                <div className="card w-full">
                    <h3>Overall Attendance</h3>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center justify-center rounded-full" style={{ width: 80, height: 80, border: '4px solid var(--success-color)' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>100%</span>
                        </div>
                        <div>
                            <p>Great job! You have perfect attendance.</p>
                        </div>
                    </div>
                </div>

                <div className="card w-full">
                    <h3>Recent Classes</h3>
                    <p className="page-description mt-2">No recent classes recorded.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
