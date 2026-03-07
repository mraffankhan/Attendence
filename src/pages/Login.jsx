import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camera } from 'lucide-react';

export default function Login() {
    const [loginType, setLoginType] = useState('student'); // 'student' | 'faculty'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isRegister) {
                // Simple sign-up Flow
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // Wait, normally we'd insert into `users` table via trigger or here.
                // For simplicity, we just notify
                alert('Account created! You can now sign in.');
                setIsRegister(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                localStorage.setItem('loginType', loginType);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div className="logo-container">
                        <div className="icon-wrapper">
                            <Camera size={36} strokeWidth={1.5} />
                        </div>
                    </div>
                    <h2>AIAttend</h2>
                    <p className="page-description">Welcome to the future of smart tracking.</p>
                </div>

                <div className="role-toggle">
                    <div className={`role-indicator ${loginType === 'faculty' ? 'faculty' : ''}`} />
                    <button
                        type="button"
                        className={`role-btn ${loginType === 'student' ? 'active' : ''}`}
                        onClick={() => setLoginType('student')}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        className={`role-btn ${loginType === 'faculty' ? 'active' : ''}`}
                        onClick={() => setLoginType('faculty')}
                    >
                        Faculty
                    </button>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-3 mt-2">
                    {error && <div className="error-msg">{error}</div>}

                    {isRegister && (
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-login" disabled={loading}>
                        {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="mailto:rnxkhan@gmail.com?subject=Password%20Reset%20Request" className="auth-switch">
                        Forgot password? <span>Contact Admin</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
