from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, create_engine, func, Text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime
import json

# -------------------------------------------------
# Database setup (adjust connection string as needed)
# -------------------------------------------------
DATABASE_URL = "mysql+pymysql://root:vicidialnow@192.168.11.243/dialdesk_callmaster"


engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# -------------------------------------------------
# Models
# -------------------------------------------------
class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    call_type = Column(String(50))   # INBOUND / OUTBOUND
    phone_number = Column(String(20))
    status = Column(String(50))
    duration = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class PipelineLog(Base):
    __tablename__ = "pipeline_logs"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("calls.id"))
    step = Column(String(100))
    payload = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------------------------
# Helpers
# -------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def to_i(value, default=0):
    try:
        return int(value)
    except Exception:
        return default


def _collect_payload(data: dict) -> str:
    """Convert dict to JSON string safely"""
    try:
        return json.dumps(data)
    except Exception:
        return "{}"


def db_log(db: Session, call_id: int, step: str, payload: dict):
    """Insert pipeline log"""
    log = PipelineLog(
        call_id=call_id,
        step=step,
        payload=_collect_payload(payload)
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def _pipeline(db: Session, call: Call, status: str, payload: dict):
    """Update call status and add log"""
    call.status = status
    db.add(call)
    db.commit()
    db.refresh(call)

    db_log(db, call.id, status, payload)


# -------------------------------------------------
# Router
# -------------------------------------------------
router = APIRouter(prefix="/v1/outbound", tags=["outbound-call"])


@router.post("/call-started")
def call_started(phone_number: str, db: Session = Depends(get_db)):
    """Mark outbound call as started"""
    call = Call(
        call_type="OUTBOUND",
        phone_number=phone_number,
        status="STARTED"
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    _pipeline(db, call, "STARTED", {"phone_number": phone_number})
    return {"message": "Outbound call started", "call_id": call.id}


@router.post("/call-finished")
def call_finished(call_id: int, duration: int, db: Session = Depends(get_db)):
    """Mark outbound call as finished"""
    call = db.query(Call).filter(Call.id == call_id, Call.call_type == "OUTBOUND").first()
    if not call:
        raise HTTPException(status_code=404, detail="Outbound call not found")

    call.duration = to_i(duration)
    _pipeline(db, call, "FINISHED", {"duration": duration})

    return {"message": "Outbound call finished", "call_id": call.id, "duration": duration}
