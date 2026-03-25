import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('pal_token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('pal_token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('pal_token');
        }
    }, [token]);

    // Fetch user on mount if token exists
    const fetchUser = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/auth/me`);
            setUser(response.data);
        } catch (err) {
            console.error('Failed to fetch user:', err);
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Handle 401 errors globally
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    setToken(null);
                    setUser(null);
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const register = async (email, password, name) => {
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                email,
                password,
                name
            });
            setToken(response.data.access_token);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || 'Registration failed';
            setError(message);
            throw new Error(message);
        }
    };

    const login = async (email, password) => {
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });
            setToken(response.data.access_token);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            const message = err.response?.data?.detail || 'Login failed';
            setError(message);
            throw new Error(message);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setError(null);
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token && !!user,
        isPro: user?.is_pro || false,
        register,
        login,
        logout,
        refreshUser,
        clearError: () => setError(null)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
