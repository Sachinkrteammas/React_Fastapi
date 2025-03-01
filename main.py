import os
import re
import secrets
import shutil
from urllib.request import Request

import jwt
import datetime
import bcrypt
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, Header, Query
from fastapi.exceptions import RequestValidationError
from sqlalchemy import create_engine, Column, Integer, String, func, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr, constr, validator
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from pathlib import Path
from datetime import date, timedelta
from pydantic import BaseModel
from typing import List
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


#########  Second DB

DATABASE_URL2 = "mysql+pymysql://root:vicidialnow@192.168.10.6/db_audit"

# Create SQLAlchemy engine
engine2 = create_engine(DATABASE_URL2)
SessionLocal2 = sessionmaker(autocommit=False, autoflush=False, bind=engine2)

# Dependency to get database session
def get_db2():
    db = SessionLocal2()
    try:
        yield db
    finally:
        db.close()

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


@app.get("/audit_count")
def get_audit_count(db: Session = Depends(get_db2)):
    query = text("""
    SELECT
        COUNT(lead_id) AS audit_cnt,
        ROUND(
            SUM(CASE WHEN scenario2 <> 'Blank Call' THEN quality_percentage ELSE 0 END) / 
            NULLIF(COUNT(CASE WHEN scenario2 <> 'Blank Call' THEN lead_id END), 0), 
            2
        ) AS cq_score,
        SUM(CASE WHEN quality_percentage BETWEEN 98 AND 100 THEN 1 ELSE 0 END) AS excellent_call,
        SUM(CASE WHEN quality_percentage BETWEEN 90 AND 97 THEN 1 ELSE 0 END) AS good_call,
        SUM(CASE WHEN quality_percentage BETWEEN 85 AND 89 THEN 1 ELSE 0 END) AS avg_call,
        SUM(CASE WHEN quality_percentage <= 84 THEN 1 ELSE 0 END) AS below_avg_call
    FROM call_quality_assessment 
    WHERE ClientId = :ClientId
    AND DATE(CallDate) = CURDATE()
    """)

    result = db.execute(query, {"ClientId": 375}).fetchone()

    # Handle None case to avoid errors
    if not result:
        return {"audit_cnt": 0, "cq_score": 0, "excellent": 0, "good": 0, "avg_call": 0, "b_avg": 0}

    return {
        "audit_cnt": result[0] or 0,
        "cq_score": result[1] or 0.0,
        "excellent": result[2] or 0,
        "good": result[3] or 0,
        "avg_call": result[4] or 0,
        "b_avg": result[5] or 0
    }


@app.get("/call_length_categorization")
def get_call_length_categorization(db: Session = Depends(get_db2)):
    query = text("""
    SELECT 
    CASE
        WHEN length_in_sec < 60 THEN 'Short(<60sec)'
        WHEN length_in_sec BETWEEN 60 AND 300 THEN 'Average(1min-5min)'
        WHEN length_in_sec BETWEEN 301 AND 600 THEN 'Long(5min-10min)'
        ELSE 'Extremely Long(>10min)'
    END AS category,
    COUNT(*) AS audit_count,
    ROUND(
        100.0 * SUM(CASE WHEN professionalism_maintained = 0 AND scenario2 <> 'Blank Call' THEN 1 ELSE 0 END) 
        / NULLIF(COUNT(*), 0), 2
    ) AS fatal_percentage,
    ROUND(AVG(quality_percentage), 2) AS score_percentage
FROM call_quality_assessment
WHERE ClientId = :ClientId
AND DATE(CallDate) = CURDATE()
GROUP BY category
WITH ROLLUP; """)

    result = db.execute(query, {"ClientId": 375}).fetchall()

    response_data = []
    for row in result:
        category = row[0] if row[0] else "Grand Total"
        response_data.append({
            "ACH Category": category,
            "Audit Count": row[1] or 0,
            "Fatal%": f"{row[2] or 0}%",
            "Score%": f"{row[3] or 0}%"
        })

    return response_data

@app.get("/agent_scores")
def get_agent_scores(
    client_id: str = Query(..., description="Client ID"),
    start_date: date = Query(..., description="Start Date in YYYY-MM-DD format"),
    end_date: date = Query(..., description="End Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db2)
):
    query = text("""
        SELECT 
            ROUND(AVG(
                CASE 
                    WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                    WHEN customer_concern_acknowledged = TRUE THEN 1
                    ELSE 0
                END
            ), 2) AS opening,

            ROUND(AVG(
                CASE 
                    WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                    ELSE 
                        (IF(professionalism_maintained = TRUE, 0.111111, 0) +
                         IF(assurance_or_appreciation_provided = TRUE, 0.111111, 0) +
                         IF(express_empathy = TRUE, 0.111111, 0) +
                         IF(pronunciation_and_clarity = TRUE, 0.111111, 0) +
                         IF(enthusiasm_and_no_fumbling = TRUE, 0.111111, 0) +
                         IF(active_listening = TRUE, 0.111111, 0) +
                         IF(politeness_and_no_sarcasm = TRUE, 0.111111, 0) +
                         IF(proper_grammar = TRUE, 0.111111, 0) +
                         IF(accurate_issue_probing = TRUE, 0.111111, 0))
                END
            ), 2) AS soft_skills,

            ROUND(AVG(
                CASE 
                    WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                    ELSE 
                        (IF(proper_hold_procedure = TRUE, 0.5, 0) +
                         IF(proper_transfer_and_language = TRUE, 0.5, 0))
                END
            ), 2) AS hold_procedure,

            ROUND(AVG(
                CASE 
                    WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                    ELSE 
                        (IF(address_recorded_completely = TRUE, 0.5, 0) +
                         IF(correct_and_complete_information = TRUE, 0.5, 0))
                END
            ), 2) AS resolution,

            ROUND(AVG(
                CASE 
                    WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                    WHEN professionalism_maintained = TRUE THEN 1
                    ELSE 0
                END
            ), 2) AS closing,

            ROUND((
                AVG(
                    CASE 
                        WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                        WHEN customer_concern_acknowledged = TRUE THEN 1
                        ELSE 0
                    END
                ) +
                AVG(
                    CASE 
                        WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                        ELSE 
                            (IF(professionalism_maintained = TRUE, 0.111111, 0) +
                             IF(assurance_or_appreciation_provided = TRUE, 0.111111, 0) +
                             IF(express_empathy = TRUE, 0.111111, 0) +
                             IF(pronunciation_and_clarity = TRUE, 0.111111, 0) +
                             IF(enthusiasm_and_no_fumbling = TRUE, 0.111111, 0) +
                             IF(active_listening = TRUE, 0.111111, 0) +
                             IF(politeness_and_no_sarcasm = TRUE, 0.111111, 0) +
                             IF(proper_grammar = TRUE, 0.111111, 0) +
                             IF(accurate_issue_probing = TRUE, 0.111111, 0))
                    END
                ) +
                AVG(
                    CASE 
                        WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                        ELSE 
                            (IF(proper_hold_procedure = TRUE, 0.5, 0) +
                             IF(proper_transfer_and_language = TRUE, 0.5, 0))
                    END
                ) +
                AVG(
                    CASE 
                        WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                        ELSE 
                            (IF(address_recorded_completely = TRUE, 0.5, 0) +
                             IF(correct_and_complete_information = TRUE, 0.5, 0))
                    END
                ) +
                AVG(
                    CASE 
                        WHEN scenario1 IN ('Call Drop in between', 'Short Call/Blank Call') THEN 1
                        WHEN professionalism_maintained = TRUE THEN 1
                        ELSE 0
                    END
                )
            ) / 5, 2) AS avg_score

        FROM call_quality_assessment
        WHERE ClientId = :client_id
        AND DATE(CallDate) BETWEEN :start_date AND :end_date;
    """)

    result = db.execute(query, {"client_id": client_id, "start_date": start_date, "end_date": end_date}).fetchone()

    return {
        "client_id": client_id,
        "start_date": start_date,
        "end_date": end_date,
        "opening": result[0]*100,
        "soft_skills": result[1]*100,
        "hold_procedure": result[2]*100,
        "resolution": result[3]*100,
        "closing": result[4]*100,
        "avg_score": result[5]*100
    }

@app.get("/top_performers")
def get_top_performers(
    client_id: str = Query(..., description="Client ID"),
    start_date: date = Query(..., description="Start Date in YYYY-MM-DD format"),
    end_date: date = Query(..., description="End Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db2)
):
    query = text("""
        SELECT 
            User,
            COUNT(*) AS audit_count,
            ROUND(AVG(quality_percentage), 2) AS cq_percentage,
            SUM(CASE WHEN professionalism_maintained = 0 AND scenario2 <> 'Blank Call' THEN 1 ELSE 0 END) AS fatal_count,
            ROUND(SUM(CASE WHEN professionalism_maintained = 0 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 2) AS fatal_percentage
        FROM call_quality_assessment
        WHERE ClientId = :client_id
        AND DATE(CallDate) BETWEEN :start_date AND :end_date
        GROUP BY User
        ORDER BY cq_percentage DESC, audit_count DESC
        LIMIT 5;
    """)

    result = db.execute(query, {"client_id": client_id, "start_date": start_date, "end_date": end_date}).fetchall()

    top_performers = [
        {
            "User": row[0],
            "audit_count": row[1],
            "cq_percentage": row[2],
            "fatal_count": row[3],
            "fatal_percentage": row[4]
        }
        for row in result
    ]

    return {
        "client_id": client_id,
        "start_date": start_date,
        "end_date": end_date,
        "top_performers": top_performers
    }

# Pydantic Model for Response
class CQScoreTrend(BaseModel):
    date: str  # Convert date to string format
    cq_score: float
    target: int

class CQScoreResponse(BaseModel):
    client_id: str
    target_cq: int
    trend: List[CQScoreTrend]

@app.get("/target_vs_cq_trend", response_model=CQScoreResponse)
def get_target_vs_cq_trend(
    client_id: str = Query(..., description="Client ID"),
    db: Session = Depends(get_db2)
):
    target_cq = 95  # Target CQ Score

    # Define date range (last 7 days)
    end_date = date.today()
    start_date = end_date - timedelta(days=6)

    query = text("""
        SELECT DATE(CallDate) AS date, 
               ROUND(AVG(quality_percentage), 2) AS cq_score
        FROM call_quality_assessment
        WHERE ClientId = :client_id
        AND DATE(CallDate) BETWEEN :start_date AND :end_date
        GROUP BY DATE(CallDate)
        ORDER BY DATE(CallDate) ASC;
    """)

    result = db.execute(query, {"client_id": client_id, "start_date": start_date, "end_date": end_date}).fetchall()

    # Convert date to string before returning
    trend_data = [
        CQScoreTrend(date=row[0].strftime("%Y-%m-%d"), cq_score=row[1], target=target_cq)
        for row in result
    ]

    return CQScoreResponse(client_id=client_id, target_cq=target_cq, trend=trend_data)


class PotentialEscalation(BaseModel):
    social_media_threat: int
    consumer_court_threat: int
    potential_scam: int


class NegativeSignals(BaseModel):
    abuse: int
    threat: int
    frustration: int
    slang: int
    sarcasm: int


class EscalationResponse(BaseModel):
    client_id: str
    potential_escalation: PotentialEscalation
    negative_signals: NegativeSignals


@app.get("/potential_escalation", response_model=EscalationResponse)
def get_potential_escalation(
        client_id: str = Query(..., description="Client ID"),
        start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
        end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
        db: Session = Depends(get_db2)
):
    query = text("""
        SELECT
            SUM(CASE WHEN LOWER(sensetive_word) LIKE '%social%' THEN 1 ELSE 0 END) AS social_media_threat,
            SUM(CASE WHEN LOWER(sensetive_word) LIKE '%court%'
                        OR LOWER(sensetive_word) LIKE '%consumer%'
                        OR LOWER(sensetive_word) LIKE '%legal%'
                        OR LOWER(sensetive_word) LIKE '%fir%' THEN 1 ELSE 0 END) AS consumer_court_threat,
            SUM(CASE WHEN system_manipulation = 'Yes' THEN 1 ELSE 0 END) AS potential_scam,

            SUM(CASE WHEN LOWER(top_negative_words) LIKE '%Abuse%' THEN 1 ELSE 0 END) AS abuse,
            SUM(CASE WHEN LOWER(top_negative_words) LIKE '%Threat%' THEN 1 ELSE 0 END) AS threat,
            SUM(CASE WHEN LOWER(top_negative_words) LIKE '%Frustration%' THEN 1 ELSE 0 END) AS frustration,
            SUM(CASE WHEN LOWER(top_negative_words) LIKE '%Slang%' THEN 1 ELSE 0 END) AS slang,
            SUM(CASE WHEN LOWER(top_negative_words) LIKE '%Sarcasm%' THEN 1 ELSE 0 END) AS sarcasm

        FROM call_quality_assessment
        WHERE ClientId = :client_id
        AND DATE(CallDate) BETWEEN :start_date AND :end_date
    """)

    result = db.execute(query, {"client_id": client_id, "start_date": start_date, "end_date": end_date}).fetchone()

    return EscalationResponse(
        client_id=client_id,
        potential_escalation=PotentialEscalation(
            social_media_threat=result[0],
            consumer_court_threat=result[1],
            potential_scam=result[2]
        ),
        negative_signals=NegativeSignals(
            abuse=result[3],
            threat=result[4],
            frustration=result[5],
            slang=result[6],
            sarcasm=result[7]
        )
    )


@app.get("/potential_escalations_data/")
def get_potential_escalations_data(
        client_id: str = Query(..., description="Client ID"),
        start_date: date = Query(..., description="Start Date in YYYY-MM-DD format"),
        end_date: date = Query(..., description="End Date in YYYY-MM-DD format"),
        db: Session = Depends(get_db2)
):
    query = text("""
        SELECT 
            scenario, 
            scenario1, 
            sensetive_word
        FROM call_quality_assessment
        WHERE ClientId = :client_id  
        AND DATE(CallDate) BETWEEN :start_date AND :end_date
        AND (
            LOWER(sensetive_word) LIKE '%social%'
            OR LOWER(sensetive_word) LIKE '%court%'
            OR LOWER(sensetive_word) LIKE '%consumer%'
            OR LOWER(sensetive_word) LIKE '%legal%'
            OR LOWER(sensetive_word) LIKE '%fir%'
            OR system_manipulation = 'Yes'
        )
    """)

    result = db.execute(query, {
        "client_id": client_id,
        "start_date": start_date,
        "end_date": end_date
    }).fetchall()

    return [
        {
            "scenario": row[0],
            "scenario1": row[1],
            "sensetive_word": row[2]
        }
        for row in result
    ]


@app.get("/negative_data/")
def get_negative_data(
        client_id: str = Query(..., description="Client ID"),
        start_date: date = Query(..., description="Start Date in YYYY-MM-DD format"),
        end_date: date = Query(..., description="End Date in YYYY-MM-DD format"),
        db: Session = Depends(get_db2)
):
    query = text("""
        SELECT 
            scenario, 
            scenario1, 
            top_negative_words
        FROM call_quality_assessment
        WHERE ClientId = :client_id  
        AND DATE(CallDate) BETWEEN :start_date AND :end_date
        AND (
            LOWER(top_negative_words) LIKE '%Abuse%'
            OR LOWER(top_negative_words) LIKE '%Threat%'
            OR LOWER(top_negative_words) LIKE '%Frustration%'
            OR LOWER(top_negative_words) LIKE '%Slang%'
            OR LOWER(top_negative_words) LIKE '%Sarcasm%'
        )
    """)

    result = db.execute(query, {
        "client_id": client_id,
        "start_date": start_date,
        "end_date": end_date
    }).fetchall()

    return [
        {
            "scenario": row[0],
            "scenario1": row[1],
            "sensetive_word": row[2]
        }
        for row in result
    ]
class ComplaintSummary(BaseModel):
    call_date: str  # Convert date to string format
    social_media_threat: int
    consumer_court_threat: int
    total: int

class ComplaintRawData(BaseModel):
    call_date: str  # Convert date to string format
    scenario: str
    sub_scenario: str
    sensitive_word: str

# Response Model
class ComplaintResponse(BaseModel):
    client_id: str
    summary: List[ComplaintSummary]
    raw_data: List[ComplaintRawData]

@app.get("/complaints_by_date/", response_model=ComplaintResponse)
def get_complaints_by_date(
    client_id: str = Query(..., description="Client ID"),
    db: Session = Depends(get_db)
):
    # Define the last 7 days (including today)
    end_date = date.today()
    start_date = end_date - timedelta(days=6)

    # Aggregated complaints summary query
    summary_query = text("""
        SELECT 
            DATE(CallDate) AS call_date,
            SUM(CASE WHEN LOWER(sensetive_word) LIKE '%social%' THEN 1 ELSE 0 END) AS social_media_threat,
            SUM(CASE WHEN LOWER(sensetive_word) LIKE '%court%' 
                        OR LOWER(sensetive_word) LIKE '%consumer%' 
                        OR LOWER(sensetive_word) LIKE '%legal%' 
                        OR LOWER(sensetive_word) LIKE '%fir%' THEN 1 ELSE 0 END) AS consumer_court_threat,
            COUNT(*) AS total
        FROM call_quality_assessment
        WHERE ClientId = :client_id  
        AND DATE(CallDate) BETWEEN :start_date AND :end_date
        GROUP BY call_date
        ORDER BY call_date DESC
    """)

    # Raw data query (for detailed records)
    raw_data_query = text("""
        SELECT 
            DATE(CallDate) AS call_date,
            scenario,
            scenario1,
            sensetive_word
        FROM call_quality_assessment
        WHERE ClientId = :client_id  
        AND DATE(CallDate) BETWEEN :start_date AND :end_date
        ORDER BY call_date DESC
    """)

    # Execute queries
    summary_results = db.execute(summary_query, {
        "client_id": client_id,
        "start_date": start_date,
        "end_date": end_date
    }).fetchall()

    raw_data_results = db.execute(raw_data_query, {
        "client_id": client_id,
        "start_date": start_date,
        "end_date": end_date
    }).fetchall()

    # Format summary results
    summary = [
        ComplaintSummary(
            call_date=row[0].strftime("%Y-%m-%d"),  # ✅ Convert date to string
            social_media_threat=row[1],
            consumer_court_threat=row[2],
            total=row[3]
        )
        for row in summary_results
    ]

    # Format raw data results
    raw_data = [
        ComplaintRawData(
            call_date=row[0].strftime("%Y-%m-%d"),  # ✅ Convert date to string
            scenario=row[1],
            sub_scenario=row[2],
            sensitive_word=row[3]
        )
        for row in raw_data_results
    ]

    return ComplaintResponse(client_id=client_id, summary=summary, raw_data=raw_data)