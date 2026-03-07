import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
        // In a real app we'd need an Edge Function or Service Role Key to list auth users.
        // For this demo, we can just list from the `users` table
        const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (data) setUsers(data);
        setLoading(false);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMsg('Creating...');
        try {
            // Because we are using the client-side signUp method, Supabase will log out the Super Admin
            // and log in as the new user. This is a known limitation of the client-side library.
            // To fix this without an Edge Function, we must capture the new user ID, then restore the Admin session.

            // 1. Cache current admin session
            const { data: { session: adminSession } } = await supabase.auth.getSession();

            // 2. Create the new user (This logs out the admin and logs in the new user)
            const { data, error } = await supabase.auth.signUp({
                email, password,
                options: { data: { role, full_name: fullName } }
            });

            if (error) throw error;

            // 3. Insert into the public users table using the NEW user's temporary session
            if (data.user) {
                const { error: insertErr } = await supabase.from('users').insert({
                    id: data.user.id,
                    full_name: fullName || email.split('@')[0],
                    role: role
                });

                if (insertErr) throw insertErr;
            }

            // 4. Log out the new user
            await supabase.auth.signOut();

            // 5. Restore the Super Admin session
            if (adminSession) {
                await supabase.auth.setSession({
                    access_token: adminSession.access_token,
                    refresh_token: adminSession.refresh_token
                });
            }

            setMsg(`Success! Created ${role}`);
            setEmail(''); setPassword(''); setFullName('');
            fetchUsers();
        } catch (err) {
            setMsg(`Error: ${err.message}`);
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
                            <option value="admin">System Admin</option>
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
