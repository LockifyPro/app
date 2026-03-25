import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Lock,
    Plus,
    Search,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    Edit,
    Crown,
    Loader2,
    Shield,
    AlertTriangle,
    Check
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import {
    deriveKey,
    encryptData,
    decryptData,
    setSessionKey,
    getSessionKey,
    hasSessionKey,
    clearSessionKey
} from '@/utils/crypto';
import { generatePassword } from '@/utils/passwordGenerator';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Vault = () => {
    const { isAuthenticated, isPro, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [masterPasswordModal, setMasterPasswordModal] = useState(false);
    const [masterPassword, setMasterPassword] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [addItemModal, setAddItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [decryptedPasswords, setDecryptedPasswords] = useState({});
    const [saving, setSaving] = useState(false);

    const [newItem, setNewItem] = useState({
        site_name: '',
        username: '',
        password: ''
    });

    // Check auth and pro status
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        if (!isPro) {
            // Show upgrade prompt but don't redirect immediately
        }
    }, [isAuthenticated, isPro, navigate]);

    // Fetch vault items
    const fetchItems = useCallback(async () => {
        if (!isPro) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/api/vault/items`);
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch vault items:', error);
            if (error.response?.status !== 403) {
                toast({
                    title: 'Error',
                    description: 'Failed to load vault items',
                    variant: 'destructive'
                });
            }
        } finally {
            setLoading(false);
        }
    }, [isPro, toast]);

    useEffect(() => {
        if (isAuthenticated && isPro) {
            fetchItems();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, isPro, fetchItems]);

    // Unlock vault with master password
    const handleUnlock = async () => {
        if (!masterPassword) return;

        try {
            // For existing users, we need to use their stored salt
            // For new users, we generate a new salt
            const storedSalt = localStorage.getItem(`vault_salt_${user.id}`);
            const { key, salt } = await deriveKey(masterPassword, storedSalt);

            if (!storedSalt) {
                localStorage.setItem(`vault_salt_${user.id}`, salt);
            }

            setSessionKey(key, salt);
            setIsUnlocked(true);
            setMasterPasswordModal(false);
            setMasterPassword('');

            toast({
                title: 'Vault Unlocked',
                description: 'You can now view and manage your passwords'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to unlock vault',
                variant: 'destructive'
            });
        }
    };

    // Lock vault
    const handleLock = () => {
        clearSessionKey();
        setIsUnlocked(false);
        setDecryptedPasswords({});
        setVisiblePasswords({});
    };

    // Decrypt and show password
    const handleShowPassword = async (item) => {
        if (!isUnlocked) {
            setMasterPasswordModal(true);
            return;
        }

        const { key } = getSessionKey();
        if (!key) {
            setMasterPasswordModal(true);
            return;
        }

        try {
            if (!decryptedPasswords[item.id]) {
                const decrypted = await decryptData(item.encrypted_data, item.iv, key);
                setDecryptedPasswords(prev => ({ ...prev, [item.id]: decrypted.password }));
            }
            setVisiblePasswords(prev => ({ ...prev, [item.id]: !prev[item.id] }));
        } catch (error) {
            toast({
                title: 'Decryption Failed',
                description: 'Invalid master password or corrupted data',
                variant: 'destructive'
            });
            handleLock();
        }
    };

    // Copy password
    const handleCopyPassword = async (item) => {
        if (!isUnlocked) {
            setMasterPasswordModal(true);
            return;
        }

        const { key } = getSessionKey();
        try {
            let password = decryptedPasswords[item.id];
            if (!password) {
                const decrypted = await decryptData(item.encrypted_data, item.iv, key);
                password = decrypted.password;
                setDecryptedPasswords(prev => ({ ...prev, [item.id]: password }));
            }

            await navigator.clipboard.writeText(password);
            toast({
                title: 'Copied!',
                description: 'Password copied to clipboard'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to copy password',
                variant: 'destructive'
            });
        }
    };

    // Add new item
    const handleAddItem = async () => {
        if (!isUnlocked) {
            setMasterPasswordModal(true);
            return;
        }

        if (!newItem.site_name || !newItem.username || !newItem.password) {
            toast({
                title: 'Error',
                description: 'Please fill in all fields',
                variant: 'destructive'
            });
            return;
        }

        setSaving(true);
        try {
            const { key } = getSessionKey();
            const { encrypted, iv } = await encryptData({ password: newItem.password }, key);

            const response = await axios.post(`${API_URL}/api/vault/items`, {
                encrypted_data: encrypted,
                iv: iv,
                site_name: newItem.site_name,
                username: newItem.username
            });

            setItems(prev => [response.data, ...prev]);
            setAddItemModal(false);
            setNewItem({ site_name: '', username: '', password: '' });

            toast({
                title: 'Added!',
                description: 'Password saved to vault'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save password',
                variant: 'destructive'
            });
        } finally {
            setSaving(false);
        }
    };

    // Delete item
    const handleDeleteItem = async (itemId) => {
        try {
            await axios.delete(`${API_URL}/api/vault/items/${itemId}`);
            setItems(prev => prev.filter(item => item.id !== itemId));
            toast({
                title: 'Deleted',
                description: 'Password removed from vault'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete password',
                variant: 'destructive'
            });
        }
    };

    // Generate password for new item
    const handleGeneratePassword = () => {
        const password = generatePassword({ length: 20, includeSymbols: true });
        setNewItem(prev => ({ ...prev, password }));
    };

    // Filter items by search
    const filteredItems = items.filter(item =>
        item.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Not Pro - show upgrade prompt
    if (!isPro) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-amber-500" />
                    </div>
                    <h1 className="font-heading text-3xl font-bold text-white mb-4">
                        Password Vault
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        The encrypted password vault is a Security Pro feature.
                        Upgrade to securely store and manage your passwords with
                        client-side encryption.
                    </p>
                    <Button
                        onClick={() => navigate('/pricing')}
                        className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 h-12 px-8"
                        data-testid="vault-upgrade-button"
                    >
                        Upgrade to Security Pro
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                            <Lock className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="font-heading text-2xl font-bold text-white">Password Vault</h1>
                            <p className="text-sm text-zinc-400">
                                {isUnlocked ? (
                                    <span className="flex items-center gap-1 text-emerald-400">
                                        <Shield className="w-4 h-4" /> Unlocked
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-amber-400">
                                        <Lock className="w-4 h-4" /> Locked
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isUnlocked ? (
                            <>
                                <Button
                                    onClick={() => setAddItemModal(true)}
                                    className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                                    data-testid="add-password-button"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Password
                                </Button>
                                <Button
                                    onClick={handleLock}
                                    variant="outline"
                                    className="border-zinc-700 hover:bg-zinc-800"
                                    data-testid="lock-vault-button"
                                >
                                    <Lock className="w-4 h-4" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => setMasterPasswordModal(true)}
                                className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                                data-testid="unlock-vault-button"
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                Unlock Vault
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input
                        placeholder="Search passwords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-black border-zinc-800 focus:border-emerald-500 h-12"
                        data-testid="vault-search"
                    />
                </div>

                {/* Items List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-card border border-zinc-800 rounded-lg p-12 text-center">
                        <Lock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="font-heading font-semibold text-white mb-2">
                            {items.length === 0 ? 'No passwords saved yet' : 'No results found'}
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6">
                            {items.length === 0
                                ? 'Start adding passwords to your encrypted vault'
                                : 'Try a different search term'}
                        </p>
                        {items.length === 0 && isUnlocked && (
                            <Button
                                onClick={() => setAddItemModal(true)}
                                className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Password
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-card border border-zinc-800 rounded-lg p-4 card-hover"
                                data-testid={`vault-item-${item.id}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                                            <span className="text-lg font-bold text-zinc-400">
                                                {item.site_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{item.site_name}</h3>
                                            <p className="text-sm text-zinc-400">{item.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {visiblePasswords[item.id] && decryptedPasswords[item.id] && (
                                            <span className="font-mono text-sm text-emerald-400 bg-black px-3 py-1 rounded">
                                                {decryptedPasswords[item.id]}
                                            </span>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleShowPassword(item)}
                                            className="text-zinc-400 hover:text-white"
                                            data-testid={`show-password-${item.id}`}
                                        >
                                            {visiblePasswords[item.id] ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleCopyPassword(item)}
                                            className="text-zinc-400 hover:text-white"
                                            data-testid={`copy-password-${item.id}`}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="text-zinc-400 hover:text-red-400"
                                            data-testid={`delete-password-${item.id}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Encryption Notice */}
                <div className="mt-8 bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-white text-sm mb-1">Client-Side Encryption</h4>
                            <p className="text-xs text-zinc-400">
                                Your passwords are encrypted on your device before being stored.
                                We never see or store your master password. Only you can decrypt your data.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Master Password Modal */}
            <Dialog open={masterPasswordModal} onOpenChange={setMasterPasswordModal}>
                <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                <Lock className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-heading font-bold text-white">
                            Enter Master Password
                        </DialogTitle>
                        <p className="text-center text-sm text-zinc-400">
                            Your master password is used to encrypt and decrypt your vault locally.
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Master Password</Label>
                            <Input
                                type="password"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
                                placeholder="Enter your master password"
                                className="bg-black border-zinc-800 focus:border-emerald-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                data-testid="master-password-input"
                            />
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-400">
                                    If you forget your master password, you cannot recover your stored passwords.
                                    We do not store your master password.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleUnlock}
                            className="w-full bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                            disabled={!masterPassword}
                            data-testid="unlock-button"
                        >
                            Unlock Vault
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Item Modal */}
            <Dialog open={addItemModal} onOpenChange={setAddItemModal}>
                <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-bold text-white">
                            Add Password
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Site/App Name</Label>
                            <Input
                                value={newItem.site_name}
                                onChange={(e) => setNewItem(prev => ({ ...prev, site_name: e.target.value }))}
                                placeholder="e.g., Google, Netflix"
                                className="bg-black border-zinc-800 focus:border-emerald-500"
                                data-testid="new-item-site"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">Username/Email</Label>
                            <Input
                                value={newItem.username}
                                onChange={(e) => setNewItem(prev => ({ ...prev, username: e.target.value }))}
                                placeholder="your@email.com"
                                className="bg-black border-zinc-800 focus:border-emerald-500"
                                data-testid="new-item-username"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">Password</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={newItem.password}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Enter or generate password"
                                    className="bg-black border-zinc-800 focus:border-emerald-500 font-mono"
                                    data-testid="new-item-password"
                                />
                                <Button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    variant="outline"
                                    className="border-zinc-700 hover:bg-zinc-800 flex-shrink-0"
                                    data-testid="generate-for-vault"
                                >
                                    Generate
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAddItemModal(false)}
                            className="border-zinc-700 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddItem}
                            className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                            disabled={saving}
                            data-testid="save-password-button"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Password
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Vault;
