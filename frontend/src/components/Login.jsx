import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Lock, Mail, ShieldCheck, Loader2, User } from 'lucide-react'

export default function Login() {
    const { login, register } = useAuth()
    const [isRegistering, setIsRegistering] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = isRegistering
                ? await register(name, email, password)
                : await login(email, password)

            if (!res.success) {
                setError(res.message || (isRegistering ? 'Registration failed' : 'Login failed'))
            }
        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <ShieldCheck size={32} color="var(--primary-purple)" />
                    </div>
                    <h1>MarketingOS</h1>
                    <p>{isRegistering ? 'Create your account to get started' : 'Enter your credentials to access the dashboard'}</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="login-error">{error}</div>}

                    {isRegistering && (
                        <div className="login-input-group">
                            <label>Full Name</label>
                            <div className="login-input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    required={isRegistering}
                                />
                            </div>
                        </div>
                    )}

                    <div className="login-input-group">
                        <label>Email Address</label>
                        <div className="login-input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label>Password</label>
                        <div className="login-input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? <Loader2 className="spinner" size={20} /> : (isRegistering ? 'Create Account' : 'Sign In')}
                    </button>

                    <div className="login-footer">
                        <p>
                            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                className="toggle-auth-btn"
                                onClick={() => {
                                    setIsRegistering(!isRegistering)
                                    setError('')
                                }}
                            >
                                {isRegistering ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
