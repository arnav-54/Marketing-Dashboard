import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const [email, setEmail] = useState('admin@marketingos.com')
    const [password, setPassword] = useState('admin123')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await login(email, password)
            if (!res.success) {
                setError(res.message || 'Login failed')
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
                    <p>Enter your credentials to access the dashboard</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div className="login-error">{error}</div>}

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
                        {loading ? <Loader2 className="spinner" size={20} /> : 'Sign In'}
                    </button>

                    <div className="login-footer">
                        <p>Demo Credentials: <b>admin@marketingos.com</b> / <b>admin123</b></p>
                    </div>
                </form>
            </div>
        </div>
    )
}
