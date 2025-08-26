# app/common.py
import os, json, re, logging
from logging.handlers import RotatingFileHandler
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple

from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, BigInteger, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.dialects.mysql import LONGTEXT

load_dotenv()
MYSQL_DSN = os.getenv("MYSQL_DSN")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "")
OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL     = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
LOG_DIR          = os.getenv("LOG_DIR", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# ---------- logging
def setup_loggers():
    fmt = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s", "%Y-%m-%d %H:%M:%S")
    app_logger = logging.getLogger("app"); app_logger.setLevel(logging.INFO)
    fh = RotatingFileHandler(os.path.join(LOG_DIR, "app.log"), maxBytes=5_000_000, backupCount=5)
    fh.setFormatter(fmt); app_logger.addHandler(fh)
    ch = logging.StreamHandler(); ch.setFormatter(fmt); app_logger.addHandler(ch)

    access_logger = logging.getLogger("access"); access_logger.setLevel(logging.INFO)
    afh = RotatingFileHandler(os.path.join(LOG_DIR, "access.log"), maxBytes=5_000_000, backupCount=5)
    afh.setFormatter(fmt); access_logger.addHandler(afh); access_logger.addHandler(ch)
    return app_logger, access_logger

app_logger, access_logger = setup_loggers()

# ---------- DB
engine = create_engine(MYSQL_DSN, pool_pre_ping=True, pool_recycle=3600, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- models (map EXACTLY to your tables)

# 1) your prompts table (you said you already store prompts by client)
class Prompt(Base):
    __tablename__ = "prompts"  # change if your table name differs
    id = Column(BigInteger, primary_key=True)
    client_id = Column(Integer)
    direction = Column(String(16))     # 'outbound' / 'inbound'
    name = Column(String(128))
    prompt_text = Column(Text)
    is_active = Column(Integer)
    # created_at optional – omit if column not present

# 2) your CallDetails table (in database 'dialdesk_callmaster')
class CallDetails(Base):
    __tablename__ = "CallDetails"
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer)
    campaign_id = Column(String(50))
    length_in_sec = Column(String(50))
    start_epoch = Column(String(50))
    end_epoch = Column(String(50))
    CallDate = Column(DateTime)
    LeadID = Column(Integer)
    AgentName = Column(String(255))
    MobileNo = Column(String(15))
    CompetitorName = Column(String(255))
    Opening = Column(Text)
    Offered = Column(Text)
    ObjectionHandling = Column(Text)
    PrepaidPitch = Column(Text)
    UpsellingEfforts = Column(Text)
    OfferUrgency = Column(Text)
    SensitiveWordUsed = Column(Text)
    SensitiveWordContext = Column(Text)
    AreaForImprovement = Column(Text)
    TranscribeText = Column(Text)
    TopNegativeWordsByAgent = Column(Text)
    TopNegativeWordsByCustomer = Column(Text)
    LengthSec = Column(String(10))
    StartTime = Column(String(10))
    EndTime = Column(String(10))
    CallDisposition = Column(Text)
    OpeningRejected = Column(Integer)
    OfferingRejected = Column(Integer)
    AfterListeningOfferRejected = Column(Integer)
    SaleDone = Column(Integer)
    NotInterestedReasonCallContext = Column(Text)
    NotInterestedBucketReason = Column(Text)
    OpeningPitchContext = Column(Text)
    OfferedPitchContext = Column(Text)
    ObjectionHandlingContext = Column(Text)
    PrepaidPitchContext = Column(Text)
    FileName = Column(Text)
    Status = Column(Integer)  # 0/1
    Category = Column(Text)
    SubCategory = Column(Text)
    CustomerObjectionCategory = Column(Text)
    CustomerObjectionSubCategory = Column(Text)
    AgentRebuttalCategory = Column(Text)
    AgentRebuttalSubCategory = Column(Text)
    ProductOffering = Column(Text)
    DiscountType = Column(Text)
    OpeningPitchCategory = Column(Text)
    ContactSettingContext = Column(Text)
    ContactSettingCategory = Column(Text)
    ContactSetting2 = Column(Text)
    Feedback_Category = Column(Text)
    FeedbackContext = Column(Text)
    Feedback = Column(Text)
    Age = Column(Text)
    ConsumptionType = Column(Text)
    AgeofConsumption = Column(Text)
    ReasonforQuitting = Column(Text)
    entrydate = Column(String(100))

# ---------- helpers
def safe_parse_json(s: str) -> Dict[str, Any]:
    if not s: return {"_raw": ""}
    s = re.sub(r"^```(json)?|```$", "", s.strip(), flags=re.M)
    s = s.replace("“","\"").replace("”","\"").replace("’","'")
    m = re.search(r"\{.*\}", s, flags=re.S)
    if m:
        try: return json.loads(m.group(0))
        except Exception: pass
    try: return json.loads(s)
    except Exception: return {"_raw": s}

def to_i(val) -> Optional[int]:
    if val is None: return None
    if isinstance(val, bool): return int(val)
    s = str(val).strip().lower()
    if s in {"1","true","yes","y"}: return 1
    if s in {"0","false","no","n"}: return 0
    try: return int(val)
    except Exception: return None

def parse_iso_to_dt(iso_s: Optional[str]) -> Optional[datetime]:
    if not iso_s: return None
    try:
        # allow trailing Z
        if iso_s.endswith("Z"):
            return datetime.fromisoformat(iso_s.replace("Z", "+00:00"))
        return datetime.fromisoformat(iso_s)
    except Exception:
        return None

def dt_to_epoch_s(dt: Optional[datetime]) -> Optional[str]:
    if not dt: return None
    if dt.tzinfo is None:
        # assume UTC if naive
        dt = dt.replace(tzinfo=timezone.utc)
    return str(int(dt.timestamp()))

def dt_hms(dt: Optional[datetime]) -> Optional[str]:
    return dt.strftime("%H:%M:%S") if dt else None

def now_str() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
