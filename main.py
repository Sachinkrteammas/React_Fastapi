import os
import re
import secrets
import shutil
from urllib.request import Request

import jwt
import datetime
import bcrypt
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Header
from fastapi.exceptions import RequestValidationError
from sqlalchemy import create_engine, Column, Integer, String, func, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr, constr, validator
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from pathlib import Path
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
# SQL_DB_URL = "mysql+pymysql://root:Hello%40123@localhost/my_db?charset=utf8mb4"
SQL_DB_URL = "mysql+pymysql://root:dial%40mas123@172.12.10.22/ai_audit?charset=utf8mb4"
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
    api_key = Column(String(255), unique=True, nullable=True)



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
    email_id: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email_id: EmailStr


class ResetPasswordRequest(BaseModel):
    email_id: EmailStr
    new_password: str
    confirm_password: str


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()

    error_message = errors[0]["msg"] if errors else "Validation error."

    error_message = error_message.replace("Value error, ", "")

    return JSONResponse(status_code=400, content={"detail": error_message})


class UserRequest(BaseModel):
    username: str
    email_id: EmailStr
    contact_number: str
    password: str
    confirm_password: str

    @validator("contact_number")
    def validate_phone(cls, value):
        if not re.fullmatch(r"^\d{10}$", value):
            raise ValueError("Phone number must have exactly 10 digits.")
        return value


@app.post("/register")
def register_user(user: UserRequest, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username is already taken. Choose another one.")

    if db.query(User).filter(User.email_id == user.email_id).first():
        raise HTTPException(status_code=400, detail="Email is already registered. Use a different one.")

    if db.query(User).filter(User.contact_number == user.contact_number).first():
        raise HTTPException(status_code=400, detail="Phone number is already registered. Use a different one.")

    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    new_user = User(
        username=user.username,
        email_id=user.email_id,
        contact_number=user.contact_number,
        password=hashed_password
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"detail": "User registered successfully."}


# Route to Login a User
@app.post("/login")
def login_user(user: LoginRequest, db: Session = Depends(get_db)):
    # Check if the user exists based on email
    db_user = db.query(User).filter(User.email_id == user.email_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the password matches
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Generate JWT Token for session management
    token = jwt.encode(
        {"email_id": user.email_id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)},
        SECRET_KEY,
        algorithm="HS256"
    )

    return {"message": "Login successful","token": token,"username": db_user.username,"id":db_user.id}


class VerifyOtpRequest(BaseModel):
    email_id: str  # The user's email address
    otp: int

import random
import smtplib
from email.mime.text import MIMEText

# Store OTPs temporarily (in a real app, use Redis or a DB)
otp_store = {}

def send_otp_email(email_id, otp):
    sender_email = "sachinkr78276438@gmail.com"  # Replace with your Gmail address
    sender_password = "efsn ryss yjin kwgr"  # Replace with your Gmail App Password
    subject = "Your Password Reset OTP"
    body = f"Your OTP for password reset is: {otp}. It is valid for 10 minutes."

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email_id

    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email_id, msg.as_string())
        server.quit()
        print(f"OTP sent to {email_id}")
    except Exception as e:
        print(f"Error sending email: {e}")

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email_id == request.email_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = random.randint(100000, 999999)  # Generate 6-digit OTP
    otp_store[request.email_id] = {"otp": otp, "expires": datetime.datetime.utcnow() + datetime.timedelta(minutes=10)}

    send_otp_email(request.email_id, otp)

    return {"message": "OTP has been sent to your email. It is valid for 10 minutes."}


@app.post("/verify-otp")
def verify_otp(request: VerifyOtpRequest):
    stored_data = otp_store.get(request.email_id)

    if not stored_data:
        raise HTTPException(status_code=400, detail="OTP expired or not requested.")

    if stored_data["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # Mark OTP as verified (for security)
    otp_store[request.email_id]["verified"] = True

    return {"message": "OTP verified successfully. You can now reset your password."}


@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    stored_data = otp_store.get(request.email_id)

    if not stored_data or not stored_data.get("verified"):
        raise HTTPException(status_code=400, detail="OTP not verified.")

    if request.new_password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    user = db.query(User).filter(User.email_id == request.email_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = bcrypt.hashpw(request.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user.password = hashed_password

    db.commit()

    # Remove OTP after password reset
    del otp_store[request.email_id]

    return {"message": "Password has been successfully reset"}




# Define the "prompts" table
class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    ClientId = Column(Integer, nullable=False)
    PromptName = Column(String(255), nullable=False)
    prompt = Column(String(500), nullable=False)

# Define a request model to accept JSON input
class PromptRequest(BaseModel):
    ClientId: int
    PromptName: str
    prompt: str

# Create a new prompt
from fastapi import HTTPException

@app.post("/prompts/")
def create_prompt(request: PromptRequest, db: Session = Depends(get_db)):
    print("Received request:", request.dict())

    # Extract data from the request model
    ClientId = request.ClientId
    PromptName = request.PromptName
    prompt = request.prompt

    if not ClientId or not PromptName or not prompt:
        raise HTTPException(status_code=400, detail="All fields are required")

    new_prompt = Prompt(ClientId=ClientId, PromptName=PromptName, prompt=prompt)
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)

    return new_prompt




class AudioFile(Base):
    __tablename__ = "audio_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(255), nullable=False)
    upload_time = Column(DateTime, server_default=func.now())
    transcribe_stat = Column(Integer, default=0)
    language = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "audio_file"
# UPLOAD_DIR = r"C:\Users\admin\Desktop"  # Explicit path to Windows Downloads

os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed MIME types
ALLOWED_MIME_TYPES = ["audio/mpeg", "audio/wav"]
import shutil

@app.post("/upload-audio/")
async def upload_audio(
    files: list[UploadFile] = File(...),  # Accept multiple files
    language: str = Form(None),  # Optional field
    category: str = Form(None),  # Optional field
    db: Session = Depends(get_db)
):
    uploaded_files = []

    try:
        for file in files:
            # Validate file type
            if file.content_type not in ALLOWED_MIME_TYPES:
                return {"status": 400, "message": f"Invalid file type: {file.filename}"}

            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            new_audio = AudioFile(
                filename=file.filename,
                filepath=file_path,
                language=language,
                category=category
            )
            db.add(new_audio)
            db.commit()
            db.refresh(new_audio)

            uploaded_files.append({
                "id": new_audio.id,
                "filename": new_audio.filename,
                "language": new_audio.language,
                "category": new_audio.category,
                "message": "File uploaded successfully"
            })

        return {"uploaded_files": uploaded_files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


########## Curl fun ##############
API_SECRET_TOKEN = "YOUR_SECRET_TOKEN"

class GenerateKeyRequest(BaseModel):
    user_id: int

class KeyResponse(BaseModel):
    user_id: int
    key: str
    api_secret_token: str

@app.post("/generate-key/", response_model=KeyResponse)
def generate_key(request: GenerateKeyRequest, db: Session = Depends(get_db)):
    global API_SECRET_TOKEN  # Allow modification of the global variable

    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a new API key
    new_key = secrets.token_hex(16)
    API_SECRET_TOKEN = new_key  # Update global API_SECRET_TOKEN
    print(new_key, "Generated Key")
    print(API_SECRET_TOKEN, "Updated API_SECRET_TOKEN")

    # Save the new key in the database
    user.api_key = new_key
    db.commit()
    db.refresh(user)

    return {"user_id": user.id, "key": new_key, "api_secret_token": API_SECRET_TOKEN}

@app.post("/upload-audio-curl/")
async def upload_audio_curl(
    files: list[UploadFile] = File(...),
    language: str = Form(None),
    category: str = Form(None),
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    global API_SECRET_TOKEN  # Ensure we use the updated token

    # Check for valid authorization token
    if not authorization or authorization.split(" ")[-1] != API_SECRET_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    uploaded_files = []

    try:
        for file in files:
            print(f"Received file: {file.filename}, Content-Type: {file.content_type}")

            # Validate file type
            ALLOWED_MIME_TYPES = {"audio/mpeg", "audio/wav"}
            if not file.content_type or file.content_type not in ALLOWED_MIME_TYPES:
                raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename} (Content-Type: {file.content_type})")

            # Save file
            UPLOAD_DIR = "uploads"  # Define upload directory
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            file_path = os.path.join(UPLOAD_DIR, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Save file details to the database
            new_audio = AudioFile(
                filename=file.filename,
                filepath=file_path,
                language=language,
                category=category
            )
            db.add(new_audio)
            db.commit()
            db.refresh(new_audio)

            uploaded_files.append({
                "id": new_audio.id,
                "filename": new_audio.filename,
                "language": new_audio.language,
                "category": new_audio.category,
                "message": "File uploaded successfully"
            })

        return {"uploaded_files": uploaded_files}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")







# API to fetch records based on date range
class AudioStatsRequest(BaseModel):
    from_date: datetime.date
    to_date: datetime.date

@app.post("/get-audio-stats/")
def get_audio_stats(request: AudioStatsRequest, db: Session = Depends(get_db)):
    try:
        results = (
            db.query(
                func.date(AudioFile.upload_time).label("date"),
                func.count().label("upload"),
                func.sum(func.if_(AudioFile.transcribe_stat == 1, 1, 0)).label("transcribe")
            )
            .filter(func.date(AudioFile.upload_time).between(request.from_date, request.to_date))
            .group_by(func.date(AudioFile.upload_time))
            .all()
        )

        data_dict = {row.date: {"upload": row.upload, "transcribe": row.transcribe} for row in results}

        date_range = [
            (request.from_date + datetime.timedelta(days=i)) for i in range((request.to_date - request.from_date).days + 1)
        ]

        data = [
            {
                "date": str(date),
                "upload": data_dict.get(date, {"upload": 0, "transcribe": 0})["upload"],
                "transcribe": data_dict.get(date, {"upload": 0, "transcribe": 0})["transcribe"]
            }
            for date in date_range
        ]

        return {"status": "success", "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")