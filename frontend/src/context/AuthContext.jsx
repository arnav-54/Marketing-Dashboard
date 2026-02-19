import { createContext, useContext, useState, useEffect } from 'react'
import API_BASE_URL from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
                const data = await res.json()
                if (data.authenticated) {
                    setUser(data.user)
                }
            } catch (err) {
                console.error('Auth check failed', err)
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
            setUser(data.user)
            return { success: true }
        }
        return { success: false, message: data.message }
    }

    const register = async (name, email, password) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
        })
        const data = await res.json()
        if (data.success) {
            return login(email, password)
        }
        return { success: false, message: data.message }
    }

    const logout = async () => {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        })
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
