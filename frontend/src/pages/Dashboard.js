import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Crown,
    Lock,
    Zap,
    Shield,
    Calendar,
    ArrowRight,
    Settings,
    BarChart3
} from 'lucide-react';

const Dashboard = () => {
    const { user, isPro } = useAuth();
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysRemaining = () => {
        if (!user?.subscription_expires) return null;
        const expires = new Date(user.subscription_expires);
        const now = new Date();
        const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="font-heading text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.name}
                    </h1>
                    <p className="text-zinc-400">Manage your account and security settings</p>
                </div>

                {/* Subscription Status */}
                <div className="bg-card border border-zinc-800 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                isPro ? 'bg-amber-500/10' : 'bg-zinc-800'
                            }`}>
                                {isPro ? (
                                    <Crown className="w-6 h-6 text-amber-500" />
                                ) : (
                                    <Shield className="w-6 h-6 text-zinc-500" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="font-heading font-semibold text-white">
                                        {isPro ? 'Security Pro' : 'Free Plan'}
                                    </h2>
                                    {isPro && (
                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                                            ACTIVE
                                        </span>
                                    )}
                                </div>
                                {isPro ? (
                                    <p className="text-sm text-zinc-400">
                                        {getDaysRemaining()} days remaining • Expires {formatDate(user?.subscription_expires)}
                                    </p>
                                ) : (
                                    <p className="text-sm text-zinc-400">
                                        Unlimited basic password generation
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isPro && (
                            <Button
                                onClick={() => navigate('/pricing')}
                                className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                                data-testid="dashboard-upgrade-button"
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade
                            </Button>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-card border border-zinc-800 rounded-lg p-6 text-left card-hover group"
                        data-testid="action-generator"
                    >
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-heading font-semibold text-white mb-1">Password Generator</h3>
                        <p className="text-sm text-zinc-400">Generate secure passwords</p>
                    </button>

                    <button
                        onClick={() => navigate('/vault')}
                        className="bg-card border border-zinc-800 rounded-lg p-6 text-left card-hover group"
                        data-testid="action-vault"
                    >
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-heading font-semibold text-white">Password Vault</h3>
                            {!isPro && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                        <p className="text-sm text-zinc-400">Manage stored passwords</p>
                    </button>

                    <button
                        onClick={() => navigate('/pricing')}
                        className="bg-card border border-zinc-800 rounded-lg p-6 text-left card-hover group"
                        data-testid="action-subscription"
                    >
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-4 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="font-heading font-semibold text-white mb-1">Subscription</h3>
                        <p className="text-sm text-zinc-400">Manage your plan</p>
                    </button>
                </div>

                {/* Account Info */}
                <div className="bg-card border border-zinc-800 rounded-lg p-6">
                    <h2 className="font-heading font-semibold text-white mb-4">Account Information</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                            <span className="text-zinc-400">Email</span>
                            <span className="text-white font-mono">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                            <span className="text-zinc-400">Name</span>
                            <span className="text-white">{user?.name}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                            <span className="text-zinc-400">Member Since</span>
                            <span className="text-white">{formatDate(user?.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-zinc-400">Account Status</span>
                            <span className="flex items-center gap-2 text-emerald-400">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pro Benefits (if not pro) */}
                {!isPro && (
                    <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/20 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <Crown className="w-8 h-8 text-amber-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-heading font-bold text-white mb-2">
                                    Unlock Security Pro Features
                                </h3>
                                <p className="text-sm text-zinc-400 mb-4">
                                    Get encrypted password vault, passphrase generation, bulk passwords, 
                                    and security monitoring with Security Pro.
                                </p>
                                <Button
                                    onClick={() => navigate('/pricing')}
                                    className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                                >
                                    View Plans
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
