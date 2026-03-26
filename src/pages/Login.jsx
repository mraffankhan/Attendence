import { useState } from 'react';
import api from '../lib/api';
import { Camera } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Login Flow
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            
            // Login logic no longer needs the Toggle for Role, it's determined by backend response automatically
            localStorage.setItem('loginType', data.user.role === 'teacher' ? 'faculty' : 'student');
            
            if (onLoginSuccess) onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
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

                <form onSubmit={handleAuth} className="flex flex-col gap-3 mt-4">
                    {error && <div className="error-msg">{error}</div>}

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
                        {loading ? 'Processing...' : 'Sign In'}
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
