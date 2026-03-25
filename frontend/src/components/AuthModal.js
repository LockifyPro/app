import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, mode, onModeChange }) => {
    const { login, register, error, clearError } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    const [formError, setFormError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError('');
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (mode === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setFormError('Passwords do not match');
                return;
            }
            if (formData.password.length < 8) {
                setFormError('Password must be at least 8 characters');
                return;
            }
            if (!formData.name.trim()) {
                setFormError('Name is required');
                return;
            }
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.email, formData.password, formData.name);
            }
            onClose();
            setFormData({ email: '', password: '', name: '', confirmPassword: '' });
        } catch (err) {
            setFormError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        const newMode = mode === 'login' ? 'register' : 'login';
        onModeChange(newMode);
        setFormError('');
        clearError();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-black" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl font-heading font-bold text-white">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </DialogTitle>
                    <p className="text-center text-sm text-zinc-400">
                        {mode === 'login'
                            ? 'Sign in to access your password vault'
                            : 'Start protecting your passwords today'}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {mode === 'register' && (
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-300">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                                required
                                data-testid="auth-name-input"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-300">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                            required
                            data-testid="auth-email-input"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-300">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="bg-black border-zinc-800 focus:border-emerald-500 text-white pr-10"
                                required
                                data-testid="auth-password-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {mode === 'register' && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="bg-black border-zinc-800 focus:border-emerald-500 text-white"
                                required
                                data-testid="auth-confirm-password-input"
                            />
                        </div>
                    )}

                    {(formError || error) && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                            <p className="text-sm text-red-400" data-testid="auth-error">
                                {formError || error}
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                        data-testid="auth-submit-button"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                            </>
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={switchMode}
                            className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                            data-testid="auth-switch-mode"
                        >
                            {mode === 'login'
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
