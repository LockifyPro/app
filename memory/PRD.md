# PasswordAndLock SaaS - Product Requirements Document

## Original Problem Statement
Convert the static PasswordAndLock HTML website (a browser-based secure password generator) to a full SaaS web application with:
- JWT authentication (email/password)
- Free tier with unlimited basic password generation
- Security Pro subscription ($9.99/month or $99/year)
- Encrypted password vault (client-side AES-256 encryption)
- Passphrase generation (Pro only)
- Stripe payment integration

## Architecture
- **Frontend**: React 18 + Tailwind CSS + shadcn/ui components
- **Backend**: FastAPI (Python) with async MongoDB
- **Database**: MongoDB
- **Auth**: JWT tokens (bcrypt password hashing)
- **Payments**: Stripe Checkout integration
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2)

## User Personas
1. **Free User**: Needs quick, secure password generation without account
2. **Security Pro User**: Wants password vault, advanced features, cross-device sync

## Core Requirements

### Free Features (Implemented)
- [x] Unlimited basic password generation (Web Crypto API)
- [x] PIN generation
- [x] Password strength analysis with entropy calculation
- [x] Works offline
- [x] No account required

### Security Pro Features ($9.99/mo or $99/yr) (Implemented)
- [x] Encrypted Password Vault (AES-256-GCM, client-side)
- [x] Passphrase Generation
- [x] User Dashboard
- [x] Subscription management via Stripe

## What's Been Implemented (March 25, 2026)

### Backend
- FastAPI server with async MongoDB
- JWT authentication (register, login, /me endpoints)
- Password vault CRUD (encrypted storage)
- Stripe subscription checkout and webhook handling
- Subscription status tracking with expiration

### Frontend
- React app with React Router
- Password Generator with multiple modes
- Auth modals (login/register)
- Pricing page with monthly/annual toggle
- Password Vault page with client-side encryption
- User Dashboard
- Features page

### Testing
- 100% backend API tests passed (12/12)
- 100% frontend UI tests passed (24/24)

## Prioritized Backlog

### P0 (Critical)
- [x] Basic password generation
- [x] User authentication
- [x] Subscription checkout

### P1 (High Priority)
- [ ] Breach awareness alerts integration
- [ ] Security monitoring dashboard
- [ ] Password health analysis

### P2 (Medium Priority)
- [ ] Cross-device sync improvements
- [ ] API access for developers
- [ ] Browser extension

### P3 (Future)
- [ ] Team/organization features
- [ ] SSO integration
- [ ] Mobile apps (iOS/Android)

## Next Tasks
1. Add bulk password generation feature for Pro users
2. Implement security insights dashboard
3. Add breach check simulation
4. Email notifications for subscription events
