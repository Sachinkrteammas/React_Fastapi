import re
import jwt
import datetime
import bcrypt
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr, constr, validator
from fastapi.middleware.cors import CORSMiddleware

# FastAPI app initialization
app = FastAPI()

# Secret key for JWT (keep it secure in production)
SECRET_KEY = "your_secret_key"

# CORS Middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL Database Connection (replace with your actual credentials)
SQL_DB_URL = "mysql+pymysql://root:Hello%40123@localhost/my_db?charset=utf8mb4"
engine = create_engine(SQL_DB_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# User Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False)
    email_id = Column(String(255), unique=True, nullable=False)
    contact_number = Column(String(15), unique=True, nullable=False)
    password = Column(String(255), nullable=False)


# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


# Pydantic Models for Request Body
class UserRequest(BaseModel):
    username: str
    email_id: EmailStr
    contact_num: constr(min_length=10, max_length=15)  # Removed regex from constr()
    password: str
    confirm_password: str

    @validator("contact_num")
    def validate_contact_num(cls, value):
        """Ensure contact number contains only digits."""
        if not re.match(r"^\d+$", value):
            raise ValueError("Contact number must contain only digits")
        return value

    @validator("confirm_password")
    def passwords_match(cls, confirm_password, values):
        """Ensure password and confirm_password match."""
        if "password" in values and confirm_password != values["password"]:
            raise ValueError("Passwords do not match")
        return confirm_password


class LoginRequest(BaseModel):
    username: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email_id: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Route to Register a New User
@app.post("/register")
def register_user(user: UserRequest, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    new_user = User(
        username=user.username,
        email_id=user.email_id,
        contact_number=user.contact_num,
        password=hashed_password
    )

    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

    return {"message": "User registered successfully"}



# Route to Login a User
@app.post("/login")
def login_user(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate JWT Token for session management
    token = jwt.encode(
        {"username": user.username, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return {"message": "Login successful", "token": token}


# Route to Handle Forgot Password (generate reset token)
@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email_id == request.email_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate JWT token with the email and expiry time
    reset_token = jwt.encode(
        {"email_id": request.email_id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        SECRET_KEY,
        algorithm="HS256"
    )

    # In real application, you would send this token via email
    return {"message": "Password reset instructions have been sent.", "token": reset_token}


# Route to Reset Password
@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        # Decode JWT token
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=["HS256"])
        email_id = payload["email_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token")

    # Find user by email and update password
    user = db.query(User).filter(User.email_id == email_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Hash the new password
    hashed_password = bcrypt.hashpw(request.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.password = hashed_password

    db.commit()
    return {"message": "Password has been successfully reset"}
