from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import os
import jwt
import bcrypt

# Load env
load_dotenv()

# App
app = FastAPI(title="PasswordAndLock API", version="1.0.0")

# Root routes
@app.get("/")
async def root():
    return {"status": "API running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Mongo
mongo_url = os.environ.get("MONGO_URL")
db_name = os.environ.get("DB_NAME")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# JWT
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALG = "HS256"

security = HTTPBearer()

# Routers
api = APIRouter(prefix="/api")
auth = APIRouter(prefix="/auth")
vault = APIRouter(prefix="/vault")

# Models
class RegisterModel(BaseModel):
    email: EmailStr
    password: str

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class VaultItem(BaseModel):
    encrypted_data: str
    site: str
    username: str

# Helpers
def hash_pw(pw: str):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, hashed: str):
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_token(uid: str):
    payload = {
        "sub": uid,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        uid = payload["sub"]
        user = await db.users.find_one({"_id": ObjectId(uid)})
        if not user:
            raise HTTPException(401, "Invalid token")
        return user
    except:
        raise HTTPException(401, "Invalid token")

# Auth routes
@auth.post("/register")
async def register(data: RegisterModel):
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "Email exists")

    doc = {
        "email": data.email,
        "password": hash_pw(data.password),
        "created": datetime.now(timezone.utc),
        "is_pro": False
    }

    res = await db.users.insert_one(doc)
    token = create_token(str(res.inserted_id))

    return {"token": token}

@auth.post("/login")
async def login(data: LoginModel):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_pw(data.password, user["password"]):
        raise HTTPException(401, "Invalid login")

    token = create_token(str(user["_id"]))
    return {"token": token}

# Vault routes
@vault.post("/item")
async def add_item(item: VaultItem, user=Depends(get_user)):
    doc = {
        "user_id": user["_id"],
        "encrypted_data": item.encrypted_data,
        "site": item.site,
        "username": item.username,
        "created": datetime.now(timezone.utc)
    }
    await db.vault.insert_one(doc)
    return {"status": "saved"}

@vault.get("/items")
async def get_items(user=Depends(get_user)):
    items = await db.vault.find({"user_id": user["_id"]}).to_list(100)
    for i in items:
        i["id"] = str(i["_id"])
    return items

# Attach routers
api.include_router(auth)
api.include_router(vault)
app.include_router(api)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
