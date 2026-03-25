import React from 'react';
import { Shield, Lock, Zap, Eye, Server, Smartphone, Globe, Code, Crown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Features = () => {
    const navigate = useNavigate();

    const coreFeatures = [
        {
            icon: <Lock className="w-6 h-6" />,
            title: 'Cryptographic Randomness',
            description: 'Uses window.crypto.getRandomValues() - the same API browsers use for TLS encryption. No predictable patterns, ever.'
        },
        {
            icon: <Eye className="w-6 h-6" />,
            title: 'Zero Knowledge Architecture',
            description: 'Your passwords are generated and stay on your device. We never see, store, or transmit your credentials.'
        },
        {
            icon: <Server className="w-6 h-6" />,
            title: 'No Server Contact',
            description: 'Password generation happens entirely offline in your browser. Works without internet connection.'
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Instant Generation',
            description: 'Generate passwords in milliseconds with no network latency. Fast, efficient, and always available.'
        },
        {
            icon: <Smartphone className="w-6 h-6" />,
            title: 'Cross-Platform',
            description: 'Works seamlessly on desktop, tablet, and mobile browsers. No app installation required.'
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: 'Privacy First',
            description: 'No tracking, no analytics on your passwords, no data collection. Your privacy is our priority.'
        }
    ];

    const proFeatures = [
        {
            icon: <Lock className="w-5 h-5" />,
            title: 'Encrypted Password Vault',
            description: 'Store passwords with AES-256 client-side encryption. Your master password never leaves your device.'
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: 'Passphrase Generator',
            description: 'Generate memorable, high-entropy passphrases using word combinations for easier recall.'
        },
        {
            icon: <Code className="w-5 h-5" />,
            title: 'Bulk Generation',
            description: 'Generate multiple passwords at once for development, testing, or organization needs.'
        },
        {
            icon: <Shield className="w-5 h-5" />,
            title: 'Security Monitoring',
            description: 'Monitor password strength, identify weak credentials, and get security recommendations.'
        },
        {
            icon: <Smartphone className="w-5 h-5" />,
            title: 'Cross-Device Sync',
            description: 'Access your encrypted vault across multiple devices with secure synchronization.'
        },
        {
            icon: <Globe className="w-5 h-5" />,
            title: 'Priority Support',
            description: 'Get early access to new features and priority support for any issues.'
        }
    ];

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-4">
                        Features
                    </p>
                    <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
                        Security Without Compromise
                    </h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Built on modern web cryptography standards with a privacy-first architecture.
                        Every feature designed with your security in mind.
                    </p>
                </div>

                {/* Core Features */}
                <section className="mb-20">
                    <div className="text-center mb-10">
                        <h2 className="font-heading text-2xl font-bold text-white mb-2">Core Features</h2>
                        <p className="text-zinc-400">Free for everyone, forever</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coreFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-card border border-zinc-800 rounded-lg p-6 card-hover"
                            >
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
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
                </section>

                {/* Pro Features */}
                <section className="mb-20">
                    <div className="bg-gradient-to-r from-emerald-500/5 to-amber-500/5 border border-emerald-500/20 rounded-2xl p-8 md:p-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Crown className="w-8 h-8 text-amber-500" />
                            <h2 className="font-heading text-2xl font-bold text-white">Security Pro Features</h2>
                        </div>
                        <p className="text-center text-zinc-400 max-w-2xl mx-auto mb-10">
                            Take your password security to the next level with advanced tools and encrypted storage.
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            {proFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                                        <p className="text-sm text-zinc-400">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center">
                            <Button
                                onClick={() => navigate('/pricing')}
                                className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 h-12 px-8"
                                data-testid="features-upgrade-button"
                            >
                                Upgrade to Security Pro
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Technical Specs */}
                <section>
                    <div className="text-center mb-10">
                        <h2 className="font-heading text-2xl font-bold text-white mb-2">Technical Specifications</h2>
                        <p className="text-zinc-400">Built on industry-standard security technologies</p>
                    </div>

                    <div className="bg-card border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="grid md:grid-cols-2">
                            <div className="p-6 border-b md:border-b-0 md:border-r border-zinc-800">
                                <h3 className="font-heading font-semibold text-white mb-4">Password Generation</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Web Crypto API (CSPRNG)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Up to 64 character passwords
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Customizable character sets
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Entropy calculation
                                    </li>
                                </ul>
                            </div>
                            <div className="p-6">
                                <h3 className="font-heading font-semibold text-white mb-4">Vault Encryption</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        AES-256-GCM encryption
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        PBKDF2 key derivation (100k iterations)
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Client-side encryption only
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                        Zero-knowledge architecture
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Features;
