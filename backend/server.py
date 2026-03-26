from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI

(title="PasswordAndLock API", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.get("/")

def root():
    return {"status": "API is running"}
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from bson import ObjectId

# Stripe integration
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-key-change-in-production')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', '1440'))

# Stripe Config
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Subscription pricing
SUBSCRIPTION_PLANS = {
    "monthly": {"price": 9.99, "days": 30, "label": "Monthly"},
    "annual": {"price": 99.00, "days": 365, "label": "Annual (2 months free)"}
}

# Create the main app
app = FastAPI(title="PasswordAndLock API", version="1.0.0")

# Create routers
api_router = APIRouter(prefix="/api")
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
user_router = APIRouter(prefix="/user", tags=["User"])
vault_router = APIRouter(prefix="/vault", tags=["Password Vault"])
subscription_router = APIRouter(prefix="/subscription", tags=["Subscription"])

security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=2, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_pro: bool
    subscription_expires: Optional[datetime] = None
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class VaultItemCreate(BaseModel):
    encrypted_data: str  # Client-side encrypted password data
    iv: str  # Initialization vector for decryption
    site_name: str  # Unencrypted for search/display
    username: str  # Unencrypted for display
    created_at: Optional[datetime] = None

class VaultItemUpdate(BaseModel):
    encrypted_data: Optional[str] = None
    iv: Optional[str] = None
    site_name: Optional[str] = None
    username: Optional[str] = None

class VaultItemResponse(BaseModel):
    id: str
    encrypted_data: str
    iv: str
    site_name: str
    username: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class CheckoutRequest(BaseModel):
    origin_url: str
    plan: str = "monthly"  # monthly or annual

class SubscriptionStatus(BaseModel):
    is_pro: bool
    plan: Optional[str] = None
    expires_at: Optional[datetime] = None
    days_remaining: Optional[int] = None

# ============== HELPERS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[dict]:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["id"] = str(user["_id"])
            return user
        return None
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        return None

async def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = await get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

async def require_pro(user: dict = Depends(require_auth)) -> dict:
    if not user.get("is_pro", False):
        # Check if subscription is still valid
        expires = user.get("subscription_expires")
        if expires and expires > datetime.now(timezone.utc):
            return user
        raise HTTPException(status_code=403, detail="Security Pro subscription required")
    
    # Check expiration
    expires = user.get("subscription_expires")
    if expires and expires < datetime.now(timezone.utc):
        # Subscription expired, update user
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"is_pro": False}}
        )
        raise HTTPException(status_code=403, detail="Subscription has expired")
    
    return user

def serialize_user(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        is_pro=user.get("is_pro", False),
        subscription_expires=user.get("subscription_expires"),
        created_at=user["created_at"]
    )

# ============== AUTH ROUTES ==============

@auth_router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Create user
    user_doc = {
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "name": data.name,
        "is_pro": False,
        "subscription_expires": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    token = create_token(str(result.inserted_id), data.email.lower())
    
    return TokenResponse(
        access_token=token,
        user=serialize_user(user_doc)
    )

@auth_router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(str(user["_id"]), user["email"])
    
    return TokenResponse(
        access_token=token,
        user=serialize_user(user)
    )

@auth_router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_auth)):
    return serialize_user(user)

# ============== USER ROUTES ==============

@user_router.put("/profile", response_model=UserResponse)
async def update_profile(name: str = None, user: dict = Depends(require_auth)):
    update_data = {"updated_at": datetime.now(timezone.utc)}
    if name:
        update_data["name"] = name
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    return serialize_user(updated_user)

# ============== VAULT ROUTES (PRO ONLY) ==============

@vault_router.get("/items", response_model=List[VaultItemResponse])
async def get_vault_items(user: dict = Depends(require_pro)):
    items = await db.vault_items.find(
        {"user_id": user["_id"]},
        {"_id": 1, "encrypted_data": 1, "iv": 1, "site_name": 1, "username": 1, "created_at": 1, "updated_at": 1}
    ).sort("created_at", -1).to_list(1000)
    
    return [
        VaultItemResponse(
            id=str(item["_id"]),
            encrypted_data=item["encrypted_data"],
            iv=item["iv"],
            site_name=item["site_name"],
            username=item["username"],
            created_at=item["created_at"],
            updated_at=item.get("updated_at")
        )
        for item in items
    ]

@vault_router.post("/items", response_model=VaultItemResponse)
async def create_vault_item(data: VaultItemCreate, user: dict = Depends(require_pro)):
    item_doc = {
        "user_id": user["_id"],
        "encrypted_data": data.encrypted_data,
        "iv": data.iv,
        "site_name": data.site_name,
        "username": data.username,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None
    }
    
    result = await db.vault_items.insert_one(item_doc)
    item_doc["_id"] = result.inserted_id
    
    return VaultItemResponse(
        id=str(item_doc["_id"]),
        encrypted_data=item_doc["encrypted_data"],
        iv=item_doc["iv"],
        site_name=item_doc["site_name"],
        username=item_doc["username"],
        created_at=item_doc["created_at"],
        updated_at=item_doc.get("updated_at")
    )

@vault_router.put("/items/{item_id}", response_model=VaultItemResponse)
async def update_vault_item(item_id: str, data: VaultItemUpdate, user: dict = Depends(require_pro)):
    try:
        item = await db.vault_items.find_one({
            "_id": ObjectId(item_id),
            "user_id": user["_id"]
        })
    except Exception:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc)}
    if data.encrypted_data:
        update_data["encrypted_data"] = data.encrypted_data
    if data.iv:
        update_data["iv"] = data.iv
    if data.site_name:
        update_data["site_name"] = data.site_name
    if data.username:
        update_data["username"] = data.username
    
    await db.vault_items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": update_data}
    )
    
    updated_item = await db.vault_items.find_one({"_id": ObjectId(item_id)})
    
    return VaultItemResponse(
        id=str(updated_item["_id"]),
        encrypted_data=updated_item["encrypted_data"],
        iv=updated_item["iv"],
        site_name=updated_item["site_name"],
        username=updated_item["username"],
        created_at=updated_item["created_at"],
        updated_at=updated_item.get("updated_at")
    )

@vault_router.delete("/items/{item_id}")
async def delete_vault_item(item_id: str, user: dict = Depends(require_pro)):
    try:
        result = await db.vault_items.delete_one({
            "_id": ObjectId(item_id),
            "user_id": user["_id"]
        })
    except Exception:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Item deleted successfully"}

# ============== SUBSCRIPTION ROUTES ==============

@subscription_router.get("/status", response_model=SubscriptionStatus)
async def get_subscription_status(user: dict = Depends(require_auth)):
    is_pro = user.get("is_pro", False)
    expires = user.get("subscription_expires")
    
    # Check if expired
    if expires and expires < datetime.now(timezone.utc):
        is_pro = False
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"is_pro": False}}
        )
    
    days_remaining = None
    if expires and is_pro:
        delta = expires - datetime.now(timezone.utc)
        days_remaining = max(0, delta.days)
    
    return SubscriptionStatus(
        is_pro=is_pro,
        plan="monthly" if is_pro else None,
        expires_at=expires if is_pro else None,
        days_remaining=days_remaining
    )

@subscription_router.post("/checkout")
async def create_checkout(data: CheckoutRequest, request: Request, user: dict = Depends(require_auth)):
    # Validate plan
    plan = data.plan if data.plan in SUBSCRIPTION_PLANS else "monthly"
    plan_details = SUBSCRIPTION_PLANS[plan]
    
    # Build webhook URL
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Build success/cancel URLs from origin
    success_url = f"{data.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{data.origin_url}/pricing"
    
    # Create checkout session with plan-specific price
    checkout_request = CheckoutSessionRequest(
        amount=float(plan_details["price"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": str(user["_id"]),
            "user_email": user["email"],
            "plan": plan,
            "days": str(plan_details["days"]),
            "product": "security_pro"
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction_doc = {
        "user_id": user["_id"],
        "session_id": session.session_id,
        "amount": plan_details["price"],
        "currency": "usd",
        "plan": plan,
        "days": plan_details["days"],
        "status": "pending",
        "payment_status": "initiated",
        "metadata": checkout_request.metadata,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {
        "checkout_url": session.url,
        "session_id": session.session_id,
        "plan": plan,
        "amount": plan_details["price"]
    }

@subscription_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, user: dict = Depends(require_auth)):
    # Check if already processed
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    
    if transaction and transaction.get("payment_status") == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "already_processed": True
        }
    
    # Get status from Stripe
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
    except Exception as e:
        logger.error(f"Error getting checkout status: {e}")
        raise HTTPException(status_code=400, detail="Could not verify payment status")
    
    # Update transaction
    update_data = {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    # If paid, activate subscription
    if checkout_status.payment_status == "paid":
        # Double-check we haven't already processed this
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction and not transaction.get("subscription_activated"):
            # Get plan days from transaction
            plan_days = transaction.get("days", 30)
            expires_at = datetime.now(timezone.utc) + timedelta(days=plan_days)
            
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "is_pro": True,
                    "subscription_plan": transaction.get("plan", "monthly"),
                    "subscription_expires": expires_at,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            # Mark as activated
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"subscription_activated": True}}
            )
            
            logger.info(f"Subscription activated for user {user['email']} - plan: {transaction.get('plan')}")
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "amount_total": checkout_status.amount_total,
        "currency": checkout_status.currency
    }

# ============== WEBHOOK ROUTE ==============

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        logger.info(f"Webhook event: {webhook_response.event_type}, session: {webhook_response.session_id}")
        
        if webhook_response.payment_status == "paid":
            # Find and update transaction
            transaction = await db.payment_transactions.find_one({
                "session_id": webhook_response.session_id
            })
            
            if transaction and not transaction.get("subscription_activated"):
                user_id = transaction.get("user_id")
                plan_days = transaction.get("days", 30)
                
                if user_id:
                    # Activate subscription
                    expires_at = datetime.now(timezone.utc) + timedelta(days=plan_days)
                    
                    await db.users.update_one(
                        {"_id": user_id},
                        {"$set": {
                            "is_pro": True,
                            "subscription_plan": transaction.get("plan", "monthly"),
                            "subscription_expires": expires_at,
                            "updated_at": datetime.now(timezone.utc)
                        }}
                    )
                    
                    await db.payment_transactions.update_one(
                        {"session_id": webhook_response.session_id},
                        {"$set": {
                            "payment_status": "paid",
                            "subscription_activated": True,
                            "updated_at": datetime.now(timezone.utc)
                        }}
                    )
                    
                    logger.info(f"Webhook: Subscription activated for user_id {user_id}")
        
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "PasswordAndLock API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include routers
api_router.include_router(auth_router)
api_router.include_router(user_router)
api_router.include_router(vault_router)
api_router.include_router(subscription_router)

app.include_router(api_router)

# CORS middleware - handle production origins
cors_origins_str = os.environ.get('CORS_ORIGINS', '*')
if cors_origins_str == '*':
    cors_origins = ['*']
else:
    cors_origins = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.vault_items.create_index("user_id")
    await db.payment_transactions.create_index("session_id", unique=True)
    await db.payment_transactions.create_index("user_id")
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
