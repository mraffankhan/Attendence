import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="main-content">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Teacher Dashboard</h1>
                    <p className="page-description">Overview of your courses and recent attendance.</p>
                </div>
                <button className="btn btn-primary">Start New Session</button>
            </div>

            <div className="flex gap-6">
                <div className="card w-full">
                    <h3>Active Session</h3>
                    <p className="page-description mt-2">No active sessions right now.</p>
                </div>

                <div className="card w-full">
                    <h3>Recent Classes</h3>
                    <p className="page-description mt-2">No recent classes recorded.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
