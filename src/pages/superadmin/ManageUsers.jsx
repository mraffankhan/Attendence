import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Trash2 } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMsg('Creating...');
        try {
            await api.post('/auth/register', {
                email,
                password,
                full_name: fullName || email.split('@')[0],
                role
            });

            setMsg(`Success! Created ${role}`);
            setEmail(''); setPassword(''); setFullName('');
            fetchUsers();
        } catch (err) {
            setMsg(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Manage Users</h1>
                <p className="page-description">Create and manage Student and Faculty accounts.</p>
            </div>

            <div className="flex gap-6">
                <div className="card" style={{ flex: 1, height: 'fit-content' }}>
                    <h3>Create New User</h3>
                    <form onSubmit={handleCreateUser} className="flex flex-col gap-4 mt-4">
                        {msg && <div className="text-sm text-primary mb-2" style={{ color: 'var(--primary-color)' }}>{msg}</div>}

                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                        <input type="password" placeholder="Temporary Password" value={password} onChange={e => setPassword(e.target.value)} required />
                        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />

                        <select value={role} onChange={e => setRole(e.target.value)} required>
                            <option value="student">Student</option>
                            <option value="teacher">Faculty / Teacher</option>
                        </select>

                        <button type="submit" className="btn btn-primary w-full mt-2">
                            <Plus size={18} /> Add User
                        </button>
                    </form>
                </div>

                <div className="card" style={{ flex: 2 }}>
                    <h3>Registered Users (Database)</h3>
                    <div className="mt-4 flex flex-col gap-2">
                        {loading ? <p>Loading...</p> : users.length === 0 ? <p>No records in users table.</p> : (
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th className="py-2">Name</th>
                                        <th className="py-2">Role</th>
                                        <th className="py-2">Registered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td className="py-3">{u.full_name}</td>
                                            <td className="py-3" style={{ textTransform: 'capitalize' }}>{u.role}</td>
                                            <td className="py-3 text-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
