# PasswordAndLock - Render.com Deployment Guide

## Prerequisites
1. A Render.com account (free tier works)
2. A MongoDB database (MongoDB Atlas free tier recommended)
3. A Stripe account for payments (optional, can use test keys)

## Quick Deploy (Recommended)

### Option 1: Blueprint Deployment
1. Push this code to a GitHub repository
2. Go to Render Dashboard → New → Blueprint
3. Connect your GitHub repo and select the `render.yaml` file
4. Fill in the environment variables when prompted
5. Click "Apply"

### Option 2: Manual Deployment

#### Step 1: Deploy Backend API

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name**: `passwordandlock-api`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. Add Environment Variables:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/passwordandlock
   DB_NAME=passwordandlock
   JWT_SECRET=<generate-a-random-64-char-string>
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=1440
   STRIPE_API_KEY=sk_test_your_stripe_key
   CORS_ORIGINS=https://your-frontend-name.onrender.com
   ```

5. Click "Create Web Service"
6. Note the backend URL (e.g., `https://passwordandlock-api.onrender.com`)

#### Step 2: Deploy Frontend

1. Go to Render Dashboard → New → Static Site
2. Connect the same GitHub repo
3. Configure:
   - **Name**: `passwordandlock`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn install && yarn build`
   - **Publish Directory**: `build`

4. Add Environment Variable:
   ```
   REACT_APP_BACKEND_URL=https://passwordandlock-api.onrender.com
   ```

5. Add Rewrite Rule (for SPA routing):
   - Go to "Redirects/Rewrites" tab
   - Add rule: Source `/*` → Destination `/index.html` → Action `Rewrite`

6. Click "Create Static Site"

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `DB_NAME` | Database name | `passwordandlock` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-64-char-secret` |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token expiration | `1440` |
| `STRIPE_API_KEY` | Stripe secret key | `sk_test_...` |
| `CORS_ORIGINS` | Allowed frontend URLs | `https://passwordandlock.onrender.com` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `https://passwordandlock-api.onrender.com` |

## MongoDB Atlas Setup (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs: `0.0.0.0/0` (for Render's dynamic IPs)
5. Get connection string from "Connect" → "Connect your application"
6. Replace `<password>` with your database user's password

## Stripe Setup (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers → API Keys
3. Use test keys for development: `sk_test_...`
4. For webhooks, add endpoint: `https://your-backend.onrender.com/api/webhook/stripe`

## Troubleshooting

### "Not Found" on page refresh
- Ensure the rewrite rule `/* → /index.html` is set in Render
- The `_redirects` file in `frontend/public/` should handle this automatically

### CORS errors
- Make sure `CORS_ORIGINS` in backend includes your frontend URL
- Don't include trailing slash in the URL

### API not responding
- Check Render logs for errors
- Verify `MONGO_URL` is correct and IP is whitelisted
- Ensure backend health check passes: `/api/health`

### Payment not working
- Verify `STRIPE_API_KEY` is set correctly
- Check Stripe webhook endpoint is configured
- For testing, use Stripe test cards: `4242 4242 4242 4242`

## Post-Deployment Checklist

- [ ] Backend health check passes (`/api/health`)
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Password generation works
- [ ] Pricing page displays correctly
- [ ] Stripe checkout redirects work
- [ ] All routes work on page refresh
