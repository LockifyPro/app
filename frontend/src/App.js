import React from "react";
import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

// Components
import Header from "@/components/Header";

// Pages
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Features from "@/pages/Features";
import Dashboard from "@/pages/Dashboard";
import Vault from "@/pages/Vault";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

// Footer Component
const Footer = () => {
    return (
        <footer className="border-t border-zinc-800 bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <span className="font-heading font-bold text-white">PasswordAndLock</span>
                        </div>
                        <p className="text-sm text-zinc-500 max-w-sm">
                            Privacy-first password security powered by browser-native cryptography. 
                            Your passwords never leave your device.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><a href="/" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">Generator</a></li>
                            <li><a href="/features" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">Features</a></li>
                            <li><a href="/pricing" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Security</h4>
                        <ul className="space-y-2">
                            <li><span className="text-sm text-zinc-400">🔒 Client-side encryption</span></li>
                            <li><span className="text-sm text-zinc-400">🛡️ Zero knowledge</span></li>
                            <li><span className="text-sm text-zinc-400">⚡ Web Crypto API</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-500">
                        © {new Date().getFullYear()} PasswordAndLock. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        All generation is local • No server contact • No data collected
                    </div>
                </div>
            </div>
        </footer>
    );
};

// App Layout
const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

// Main App
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppLayout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/features" element={<Features />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/vault" 
                            element={
                                <ProtectedRoute>
                                    <Vault />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/subscription/success" 
                            element={
                                <ProtectedRoute>
                                    <SubscriptionSuccess />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AppLayout>
                <Toaster />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
