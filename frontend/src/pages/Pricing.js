import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, Crown, Shield, Lock, Zap, Bell, Smartphone, BarChart3, Code, Loader2 } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Pricing = () => {
    const { isAuthenticated, isPro, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('register');
    const [loading, setLoading] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');

    const freeFeatures = [
        'Unlimited basic password generation',
        'Cryptographic randomness (Web Crypto API)',
        'PIN generation',
        'Password strength analysis',
        'No account required',
        'Works offline',
        'Mobile & desktop compatible'
    ];

    const proFeatures = [
        { icon: <Lock className="w-4 h-4" />, text: 'Encrypted Password Vault' },
        { icon: <Zap className="w-4 h-4" />, text: 'Passphrase Generation' },
        { icon: <Shield className="w-4 h-4" />, text: 'Bulk Password Generation' },
        { icon: <Bell className="w-4 h-4" />, text: 'Breach Awareness Alerts' },
        { icon: <Smartphone className="w-4 h-4" />, text: 'Cross-Device Secure Sync' },
        { icon: <BarChart3 className="w-4 h-4" />, text: 'Security Insights Dashboard' },
        { icon: <Code className="w-4 h-4" />, text: 'Priority Feature Access' },
        { icon: <Crown className="w-4 h-4" />, text: 'Future API Access' }
    ];

    const handleSubscribe = async (plan) => {
        if (!isAuthenticated) {
            setAuthMode('register');
            setAuthModalOpen(true);
            return;
        }

        setLoading(plan);
        try {
            const response = await axios.post(`${API_URL}/api/subscription/checkout`, {
                origin_url: window.location.origin,
                plan: plan
            });

            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast({
                title: 'Error',
                description: error.response?.data?.detail || 'Failed to start checkout',
                variant: 'destructive'
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">
                        Simple Pricing
                    </p>
                    <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
                        Choose Your Security Level
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
                        Start free with unlimited basic generation. Upgrade to Pro for advanced security features.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-2 bg-zinc-900 rounded-full p-1">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                billingCycle === 'monthly'
                                    ? 'bg-emerald-500 text-black'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                            data-testid="billing-monthly"
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                                billingCycle === 'annual'
                                    ? 'bg-emerald-500 text-black'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                            data-testid="billing-annual"
                        >
                            Annual
                            <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="bg-card border border-zinc-800 rounded-lg p-8">
                        <div className="mb-6">
                            <h3 className="font-heading font-bold text-xl text-white mb-2">Free</h3>
                            <p className="text-sm text-zinc-400">Essential password generation</p>
                        </div>
                        
                        <div className="mb-6">
                            <span className="font-heading text-4xl font-black text-white">$0</span>
                            <span className="text-zinc-500 ml-2">/forever</span>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mb-8 border-zinc-700 text-white hover:bg-zinc-800 h-12"
                            onClick={() => navigate('/')}
                            data-testid="free-plan-button"
                        >
                            Get Started Free
                        </Button>

                        <ul className="space-y-3">
                            {freeFeatures.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-card border-2 border-emerald-500 rounded-lg p-8 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className="bg-emerald-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                                RECOMMENDED
                            </span>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-heading font-bold text-xl text-white">Security Pro</h3>
                                <Crown className="w-5 h-5 text-amber-500" />
                            </div>
                            <p className="text-sm text-zinc-400">Complete password protection</p>
                        </div>
                        
                        <div className="mb-6">
                            {billingCycle === 'monthly' ? (
                                <>
                                    <span className="font-heading text-4xl font-black text-white">$9.99</span>
                                    <span className="text-zinc-500 ml-2">/month</span>
                                </>
                            ) : (
                                <>
                                    <span className="font-heading text-4xl font-black text-white">$99</span>
                                    <span className="text-zinc-500 ml-2">/year</span>
                                    <p className="text-sm text-emerald-400 mt-1">$8.25/month • 2 months free</p>
                                </>
                            )}
                        </div>

                        {isPro ? (
                            <Button
                                className="w-full mb-8 bg-zinc-800 text-zinc-400 h-12 cursor-default"
                                disabled
                                data-testid="pro-current-plan"
                            >
                                Current Plan
                            </Button>
                        ) : (
                            <Button
                                onClick={() => handleSubscribe(billingCycle)}
                                className="w-full mb-8 bg-emerald-500 text-black font-bold hover:bg-emerald-600 h-12"
                                disabled={loading !== null}
                                data-testid="pro-subscribe-button"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Subscribe Now'
                                )}
                            </Button>
                        )}

                        <p className="text-xs text-zinc-500 mb-6">Everything in Free, plus:</p>

                        <ul className="space-y-3">
                            {proFeatures.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0 mt-0.5">
                                        {feature.icon}
                                    </div>
                                    <span className="text-sm text-zinc-300">{feature.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* FAQ Teaser */}
                <div className="text-center mt-16">
                    <p className="text-zinc-500">
                        Questions? Check our{' '}
                        <a href="/features" className="text-emerald-400 hover:underline">features page</a>
                        {' '}or contact support.
                    </p>
                </div>
            </div>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                mode={authMode}
                onModeChange={setAuthMode}
            />
        </div>
    );
};

export default Pricing;
