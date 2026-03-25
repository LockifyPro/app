import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordGenerator from '@/components/PasswordGenerator';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Zap, Globe, Eye, Server, Check, ArrowRight, Crown } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const Home = () => {
    const { isAuthenticated, isPro } = useAuth();
    const navigate = useNavigate();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('register');

    const handleUpgradeClick = () => {
        if (!isAuthenticated) {
            setAuthMode('register');
            setAuthModalOpen(true);
        } else {
            navigate('/pricing');
        }
    };

    const features = [
        {
            icon: <Lock className="w-5 h-5" />,
            title: 'Client-Side Generation',
            description: 'Passwords are generated locally using Web Crypto API. Nothing leaves your browser.'
        },
        {
            icon: <Eye className="w-5 h-5" />,
            title: 'Zero Knowledge',
            description: 'We never see, store, or transmit your passwords. Complete privacy guaranteed.'
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: 'Cryptographic Randomness',
            description: 'Uses window.crypto.getRandomValues() for true cryptographic security.'
        },
        {
            icon: <Server className="w-5 h-5" />,
            title: 'No Server Contact',
            description: 'Generation happens entirely offline. Works without internet connection.'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-4 overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: 'url(https://static.prod-images.emergentagent.com/jobs/8da592cd-ad14-4ec5-a28a-b4c7f1516a8e/images/f3f431417299e777cca3394b4071fa337e8b32ddf8ff8277e6ff1576e6860c49.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background" />
                
                <div className="relative max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text */}
                        <div className="text-left">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">
                                Privacy-First Security
                            </p>
                            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-6">
                                Generate
                                <span className="text-emerald-400"> Unbreakable </span>
                                Passwords
                            </h1>
                            <p className="text-lg text-zinc-400 mb-8 max-w-xl leading-relaxed">
                                Cryptographically secure password generation powered by browser-native encryption.
                                Your passwords never leave your device.
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mb-8">
                                {!isAuthenticated && (
                                    <Button
                                        onClick={() => {
                                            setAuthMode('register');
                                            setAuthModalOpen(true);
                                        }}
                                        className="bg-emerald-500 text-black font-bold px-8 h-12 hover:bg-emerald-600"
                                        data-testid="hero-get-started"
                                    >
                                        Get Started Free
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                                {!isPro && (
                                    <Button
                                        onClick={() => navigate('/pricing')}
                                        variant="outline"
                                        className="border-zinc-700 text-white h-12 px-8 hover:bg-zinc-800"
                                        data-testid="hero-view-pro"
                                    >
                                        <Crown className="w-4 h-4 mr-2 text-amber-500" />
                                        View Pro Features
                                    </Button>
                                )}
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>100% Free Basic Use</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>No Account Required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>Works Offline</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Generator */}
                        <div className="lg:pl-8">
                            <PasswordGenerator onUpgradeClick={handleUpgradeClick} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 border-t border-zinc-800">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">
                            Why PasswordAndLock
                        </p>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                            Security Without Compromise
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Built on modern web cryptography standards with a privacy-first architecture
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-card border border-zinc-800 rounded-lg p-6 card-hover"
                            >
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-heading font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pro CTA Section */}
            {!isPro && (
                <section className="py-20 px-4 bg-zinc-900/50">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-amber-400">Security Pro</span>
                        </div>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                            Unlock Advanced Security Features
                        </h2>
                        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
                            Encrypted password vault, passphrase generation, bulk passwords, 
                            security monitoring, and cross-device sync.
                        </p>
                        <Button
                            onClick={() => navigate('/pricing')}
                            className="bg-emerald-500 text-black font-bold px-8 h-12 hover:bg-emerald-600"
                            data-testid="cta-upgrade"
                        >
                            Upgrade to Security Pro
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </section>
            )}

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                mode={authMode}
                onModeChange={setAuthMode}
            />
        </div>
    );
};

export default Home;
