import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, Menu, X, User, LogOut, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AuthModal from './AuthModal';

const Header = () => {
    const { user, isAuthenticated, isPro, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const navigate = useNavigate();
    const location = useLocation();

    const handleAuthClick = (mode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { href: '/', label: 'Generator' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/features', label: 'Features' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <header className="glass-header sticky top-0 z-50 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
                            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <span className="font-heading font-bold text-lg text-white">PasswordAndLock</span>
                                {isPro && (
                                    <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded">
                                        PRO
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive(link.href)
                                            ? 'text-emerald-400 bg-zinc-800/50'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                                    data-testid={`nav-${link.label.toLowerCase()}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isAuthenticated && (
                                <Link
                                    to="/vault"
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                                        isActive('/vault')
                                            ? 'text-emerald-400 bg-zinc-800/50'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                                    data-testid="nav-vault"
                                >
                                    <Lock className="w-4 h-4" />
                                    Vault
                                    {!isPro && <Crown className="w-3 h-3 text-amber-500" />}
                                </Link>
                            )}
                        </nav>

                        {/* Auth Buttons / User Menu */}
                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-2 text-zinc-400 hover:text-white"
                                            data-testid="user-menu-trigger"
                                        >
                                            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium">{user?.name}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                                        <div className="px-3 py-2">
                                            <p className="text-sm font-medium text-white">{user?.name}</p>
                                            <p className="text-xs text-zinc-500">{user?.email}</p>
                                        </div>
                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                        <DropdownMenuItem asChild>
                                            <Link to="/dashboard" className="cursor-pointer" data-testid="menu-dashboard">
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        {!isPro && (
                                            <DropdownMenuItem asChild>
                                                <Link to="/pricing" className="cursor-pointer text-emerald-400" data-testid="menu-upgrade">
                                                    <Crown className="w-4 h-4 mr-2" />
                                                    Upgrade to Pro
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="cursor-pointer text-red-400"
                                            data-testid="menu-logout"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleAuthClick('login')}
                                        className="text-zinc-400 hover:text-white"
                                        data-testid="login-button"
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        onClick={() => handleAuthClick('register')}
                                        className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                                        data-testid="signup-button"
                                    >
                                        Get Started
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-zinc-400 hover:text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            data-testid="mobile-menu-toggle"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-zinc-800 bg-zinc-950">
                        <div className="px-4 py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-md text-sm font-medium ${
                                        isActive(link.href)
                                            ? 'text-emerald-400 bg-zinc-800'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/vault"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    >
                                        Password Vault
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-red-400 hover:bg-zinc-800"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            handleAuthClick('login');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex-1 border-zinc-700"
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            handleAuthClick('register');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex-1 bg-emerald-500 text-black hover:bg-emerald-600"
                                    >
                                        Get Started
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                mode={authMode}
                onModeChange={setAuthMode}
            />
        </>
    );
};

export default Header;
