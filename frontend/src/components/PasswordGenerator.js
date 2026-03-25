import React, { useState, useCallback } from 'react';
import { generatePassword, generatePassphrase, generatePIN, calculateStrength } from '@/utils/passwordGenerator';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, Check, Lock, Zap, Crown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PasswordGenerator = ({ onUpgradeClick }) => {
    const { isPro } = useAuth();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [strength, setStrength] = useState(null);
    const [activeTab, setActiveTab] = useState('password');
    
    // Password options
    const [length, setLength] = useState(16);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
    
    // Passphrase options
    const [wordCount, setWordCount] = useState(4);
    const [separator, setSeparator] = useState('-');
    const [capitalize, setCapitalize] = useState(true);
    const [includeNumber, setIncludeNumber] = useState(true);
    
    // PIN options
    const [pinLength, setPinLength] = useState(6);

    const handleGenerate = useCallback(() => {
        let newPassword = '';
        
        try {
            if (activeTab === 'password') {
                newPassword = generatePassword({
                    length,
                    includeLowercase,
                    includeUppercase,
                    includeNumbers,
                    includeSymbols,
                    excludeAmbiguous
                });
            } else if (activeTab === 'passphrase') {
                // Passphrase is a PRO feature
                if (!isPro) {
                    onUpgradeClick?.();
                    return;
                }
                newPassword = generatePassphrase({
                    wordCount,
                    separator,
                    capitalize,
                    includeNumber
                });
            } else if (activeTab === 'pin') {
                newPassword = generatePIN(pinLength);
            }
            
            setPassword(newPassword);
            setStrength(calculateStrength(newPassword));
            setCopied(false);
        } catch (error) {
            toast({
                title: 'Generation Error',
                description: error.message,
                variant: 'destructive'
            });
        }
    }, [activeTab, length, includeLowercase, includeUppercase, includeNumbers, includeSymbols, 
        excludeAmbiguous, wordCount, separator, capitalize, includeNumber, pinLength, isPro, onUpgradeClick, toast]);

    const handleCopy = async () => {
        if (!password) return;
        
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            toast({
                title: 'Copied!',
                description: 'Password copied to clipboard',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast({
                title: 'Copy Failed',
                description: 'Could not copy to clipboard',
                variant: 'destructive'
            });
        }
    };

    const getStrengthLabel = () => {
        if (!strength) return null;
        const labels = {
            'weak': 'Weak',
            'moderate': 'Moderate',
            'strong': 'Strong',
            'very-strong': 'Very Strong'
        };
        return labels[strength.level];
    };

    return (
        <div className="bg-card border border-zinc-800 rounded-lg p-6 card-hover">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="font-heading font-bold text-lg text-white">Password Generator</h2>
                        <p className="text-xs text-zinc-500">Cryptographically secure</p>
                    </div>
                </div>
                <Zap className="w-5 h-5 text-emerald-500" />
            </div>

            {/* Password Display */}
            <div className="password-display rounded-lg p-4 mb-4 min-h-[60px] flex items-center justify-center relative group">
                <span 
                    className={`font-mono text-lg break-all ${password ? 'text-emerald-400' : 'text-zinc-600'}`}
                    data-testid="generated-password"
                >
                    {password || 'Click generate to create a password'}
                </span>
                {password && (
                    <button
                        onClick={handleCopy}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800"
                        data-testid="copy-password-button"
                    >
                        {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-zinc-400" />
                        )}
                    </button>
                )}
            </div>

            {/* Strength Indicator */}
            {strength && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500">Strength</span>
                        <span className="text-xs font-medium" style={{ color: strength.color }}>
                            {getStrengthLabel()} • {strength.entropy} bits
                        </span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all duration-300 rounded-full"
                            style={{ 
                                width: `${strength.percentage}%`,
                                backgroundColor: strength.color
                            }}
                            data-testid="strength-bar"
                        />
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
                    <TabsTrigger value="password" data-testid="tab-password">Password</TabsTrigger>
                    <TabsTrigger value="passphrase" className="relative" data-testid="tab-passphrase">
                        Passphrase
                        {!isPro && <Crown className="w-3 h-3 ml-1 text-amber-500" />}
                    </TabsTrigger>
                    <TabsTrigger value="pin" data-testid="tab-pin">PIN</TabsTrigger>
                </TabsList>

                <TabsContent value="password" className="space-y-4 mt-4">
                    {/* Length Slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400">Length</Label>
                            <span className="font-mono text-emerald-400" data-testid="length-value">{length}</span>
                        </div>
                        <Slider
                            value={[length]}
                            onValueChange={([v]) => setLength(v)}
                            min={4}
                            max={64}
                            step={1}
                            className="w-full"
                            data-testid="length-slider"
                        />
                    </div>

                    {/* Character Options */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400 text-sm">Lowercase (a-z)</Label>
                            <Switch
                                checked={includeLowercase}
                                onCheckedChange={setIncludeLowercase}
                                data-testid="toggle-lowercase"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400 text-sm">Uppercase (A-Z)</Label>
                            <Switch
                                checked={includeUppercase}
                                onCheckedChange={setIncludeUppercase}
                                data-testid="toggle-uppercase"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400 text-sm">Numbers (0-9)</Label>
                            <Switch
                                checked={includeNumbers}
                                onCheckedChange={setIncludeNumbers}
                                data-testid="toggle-numbers"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400 text-sm">Symbols (!@#)</Label>
                            <Switch
                                checked={includeSymbols}
                                onCheckedChange={setIncludeSymbols}
                                data-testid="toggle-symbols"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <Label className="text-zinc-400 text-sm">Exclude ambiguous (0, O, l, 1)</Label>
                        <Switch
                            checked={excludeAmbiguous}
                            onCheckedChange={setExcludeAmbiguous}
                            data-testid="toggle-ambiguous"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="passphrase" className="space-y-4 mt-4">
                    {!isPro ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
                            <Crown className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                            <h3 className="font-heading font-bold text-white mb-2">Pro Feature</h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Passphrase generation is available with Security Pro subscription.
                            </p>
                            <Button
                                onClick={onUpgradeClick}
                                className="bg-emerald-500 text-black font-semibold hover:bg-emerald-600"
                                data-testid="upgrade-passphrase-button"
                            >
                                Upgrade to Pro
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-zinc-400">Word Count</Label>
                                    <span className="font-mono text-emerald-400">{wordCount}</span>
                                </div>
                                <Slider
                                    value={[wordCount]}
                                    onValueChange={([v]) => setWordCount(v)}
                                    min={3}
                                    max={8}
                                    step={1}
                                    data-testid="wordcount-slider"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-zinc-400">Separator</Label>
                                <div className="flex gap-2">
                                    {['-', '_', '.', ' '].map((sep) => (
                                        <button
                                            key={sep}
                                            onClick={() => setSeparator(sep)}
                                            className={`px-4 py-2 rounded-md font-mono text-sm transition-colors ${
                                                separator === sep
                                                    ? 'bg-emerald-500 text-black'
                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                            }`}
                                        >
                                            {sep === ' ' ? '⎵' : sep}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-400 text-sm">Capitalize words</Label>
                                <Switch checked={capitalize} onCheckedChange={setCapitalize} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-zinc-400 text-sm">Include number</Label>
                                <Switch checked={includeNumber} onCheckedChange={setIncludeNumber} />
                            </div>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="pin" className="space-y-4 mt-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-400">PIN Length</Label>
                            <span className="font-mono text-emerald-400">{pinLength}</span>
                        </div>
                        <Slider
                            value={[pinLength]}
                            onValueChange={([v]) => setPinLength(v)}
                            min={4}
                            max={12}
                            step={1}
                            data-testid="pin-length-slider"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Generate Button */}
            <div className="flex gap-3">
                <Button
                    onClick={handleGenerate}
                    className="flex-1 bg-emerald-500 text-black font-bold hover:bg-emerald-600 h-12"
                    data-testid="generate-password-button"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate
                </Button>
                <Button
                    onClick={handleCopy}
                    variant="outline"
                    disabled={!password}
                    className="border-zinc-700 hover:bg-zinc-800 h-12 px-6"
                    data-testid="copy-button"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
};

export default PasswordGenerator;
