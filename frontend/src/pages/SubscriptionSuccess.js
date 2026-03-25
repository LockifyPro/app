import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Crown, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SubscriptionSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refreshUser, user } = useAuth();
    const [status, setStatus] = useState('checking'); // checking, success, error
    const [attempts, setAttempts] = useState(0);
    const maxAttempts = 5;
    const pollInterval = 2000;

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        const pollPaymentStatus = async () => {
            if (attempts >= maxAttempts) {
                setStatus('error');
                return;
            }

            try {
                const response = await axios.get(
                    `${API_URL}/api/subscription/checkout/status/${sessionId}`
                );

                if (response.data.payment_status === 'paid') {
                    setStatus('success');
                    // Refresh user data to get updated subscription status
                    await refreshUser();
                    return;
                }

                if (response.data.status === 'expired') {
                    setStatus('error');
                    return;
                }

                // Continue polling
                setAttempts(prev => prev + 1);
                setTimeout(pollPaymentStatus, pollInterval);
            } catch (error) {
                console.error('Error checking payment status:', error);
                setAttempts(prev => prev + 1);
                setTimeout(pollPaymentStatus, pollInterval);
            }
        };

        pollPaymentStatus();
    }, [sessionId, attempts, refreshUser]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {status === 'checking' && (
                    <div className="animate-fade-in">
                        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
                        <h1 className="font-heading text-2xl font-bold text-white mb-2">
                            Processing Payment
                        </h1>
                        <p className="text-zinc-400">
                            Please wait while we confirm your subscription...
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                            <Check className="w-10 h-10 text-black" />
                        </div>
                        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-4">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-400">Security Pro Active</span>
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-white mb-2">
                            Welcome to Security Pro!
                        </h1>
                        <p className="text-zinc-400 mb-8">
                            Your subscription is now active. Enjoy encrypted password vault,
                            passphrase generation, and all Pro features.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => navigate('/vault')}
                                className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-600 h-12"
                                data-testid="go-to-vault-button"
                            >
                                Open Password Vault
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant="outline"
                                className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12"
                                data-testid="go-to-dashboard-button"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h1 className="font-heading text-2xl font-bold text-white mb-2">
                            Payment Verification Issue
                        </h1>
                        <p className="text-zinc-400 mb-8">
                            We couldn't verify your payment. If you completed the payment,
                            it may take a few moments to process. Please check your email for confirmation.
                        </p>
                        <div className="space-y-3">
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-600 h-12"
                            >
                                Retry Verification
                            </Button>
                            <Button
                                onClick={() => navigate('/pricing')}
                                variant="outline"
                                className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12"
                            >
                                Back to Pricing
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionSuccess;
