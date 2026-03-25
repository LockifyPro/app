// Password generation utilities using Web Crypto API

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Word list for passphrases
const WORDS = [
    'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'guitar', 'hammer',
    'island', 'jungle', 'kite', 'lemon', 'mango', 'noble', 'ocean', 'planet',
    'queen', 'river', 'sunset', 'tiger', 'umbrella', 'violet', 'winter', 'xenon',
    'yellow', 'zebra', 'anchor', 'bridge', 'castle', 'diamond', 'emerald', 'forest',
    'garden', 'harbor', 'iceberg', 'jasmine', 'kingdom', 'lantern', 'mountain', 'neptune',
    'oxygen', 'phoenix', 'quartz', 'rainbow', 'silver', 'thunder', 'universe', 'velvet',
    'whisper', 'crystal', 'azure', 'bronze', 'coral', 'delta', 'echo', 'frost',
    'glacier', 'horizon', 'ivory', 'jade', 'karma', 'lotus', 'meteor', 'nova',
    'oasis', 'prism', 'quantum', 'radiant', 'sapphire', 'titan', 'ultra', 'vortex',
    'wave', 'xray', 'yacht', 'zenith', 'alpha', 'beta', 'gamma', 'sigma'
];

// Secure random number generator
function secureRandom(max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

// Generate random password
export function generatePassword(options = {}) {
    const {
        length = 16,
        includeLowercase = true,
        includeUppercase = true,
        includeNumbers = true,
        includeSymbols = true,
        excludeAmbiguous = false,
        excludeChars = ''
    } = options;

    let charset = '';
    if (includeLowercase) charset += LOWERCASE;
    if (includeUppercase) charset += UPPERCASE;
    if (includeNumbers) charset += NUMBERS;
    if (includeSymbols) charset += SYMBOLS;

    // Remove ambiguous characters if requested
    if (excludeAmbiguous) {
        charset = charset.replace(/[0Ol1I]/g, '');
    }

    // Remove excluded characters
    if (excludeChars) {
        for (const char of excludeChars) {
            charset = charset.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
        }
    }

    if (charset.length === 0) {
        throw new Error('No characters available for password generation');
    }

    let password = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }

    // Ensure at least one character from each selected category
    const requiredChars = [];
    if (includeLowercase) requiredChars.push(LOWERCASE[secureRandom(LOWERCASE.length)]);
    if (includeUppercase) requiredChars.push(UPPERCASE[secureRandom(UPPERCASE.length)]);
    if (includeNumbers) requiredChars.push(NUMBERS[secureRandom(NUMBERS.length)]);
    if (includeSymbols) requiredChars.push(SYMBOLS[secureRandom(SYMBOLS.length)]);

    // Replace random positions with required characters
    const passwordArray = password.split('');
    for (let i = 0; i < requiredChars.length; i++) {
        const pos = secureRandom(passwordArray.length);
        passwordArray[pos] = requiredChars[i];
    }

    return passwordArray.join('');
}

// Generate passphrase
export function generatePassphrase(options = {}) {
    const {
        wordCount = 4,
        separator = '-',
        capitalize = true,
        includeNumber = true
    } = options;

    const words = [];
    for (let i = 0; i < wordCount; i++) {
        let word = WORDS[secureRandom(WORDS.length)];
        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        words.push(word);
    }

    let passphrase = words.join(separator);

    if (includeNumber) {
        passphrase += separator + secureRandom(1000);
    }

    return passphrase;
}

// Generate bulk passwords
export function generateBulkPasswords(count, options = {}) {
    const passwords = [];
    for (let i = 0; i < count; i++) {
        passwords.push(generatePassword(options));
    }
    return passwords;
}

// Calculate password strength
export function calculateStrength(password) {
    let score = 0;
    let feedback = [];

    // Length score
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Deductions for patterns
    if (/(.)\1{2,}/.test(password)) {
        score -= 1;
        feedback.push('Avoid repeated characters');
    }
    if (/^[a-zA-Z]+$/.test(password)) {
        score -= 1;
        feedback.push('Add numbers or symbols');
    }
    if (/^[0-9]+$/.test(password)) {
        score -= 2;
        feedback.push('Add letters and symbols');
    }
    if (password.length < 8) {
        feedback.push('Use at least 8 characters');
    }

    // Calculate entropy (bits)
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
    
    const entropy = Math.floor(password.length * Math.log2(charsetSize || 1));

    // Determine strength level
    let level = 'weak';
    let color = '#ef4444';
    
    if (score >= 7) {
        level = 'very-strong';
        color = '#10b981';
    } else if (score >= 5) {
        level = 'strong';
        color = '#22c55e';
    } else if (score >= 3) {
        level = 'moderate';
        color = '#f59e0b';
    }

    return {
        score: Math.max(0, Math.min(8, score)),
        level,
        color,
        entropy,
        feedback,
        percentage: Math.min(100, (score / 8) * 100)
    };
}

// Generate PIN
export function generatePIN(length = 6) {
    let pin = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
        pin += (array[i] % 10).toString();
    }
    
    return pin;
}
