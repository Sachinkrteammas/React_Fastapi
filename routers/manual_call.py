# app/routers/manual_call.py
import json
from typing import Optional, Dict, Any
from datetime import datetime

import aiohttp
from fastapi import APIRouter, Request, BackgroundTasks, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from common import (  # ✅ absolute import to your common.py
    SessionLocal, get_db, app_logger,
    Prompt, CallDetails,
    safe_parse_json, to_i,
    parse_iso_to_dt, dt_to_epoch_s, dt_hms, now_str,
    DEEPGRAM_API_KEY, OPENAI_API_KEY, OPENAI_MODEL
)

router = APIRouter(prefix="/v1/manual", tags=["manual-call"])


# ---------- payload we accept from VICIdial (manual = outbound by default)
class ManualCallPayload(BaseModel):
    unique_id: Optional[str] = None
    client_id: int
    campaign_id: Optional[str] = None
    agent_id: Optional[str] = None
    phone_number: Optional[str] = None
    lead_id: Optional[int] = None
    dispo: Optional[str] = None

    start_epoch: Optional[str] = None
    end_epoch: Optional[str] = None
    call_start_utc: Optional[str] = None
    call_end_utc: Optional[str] = None
    call_duration_sec: Optional[int] = None

    recording_filename: Optional[str] = None
    recording_id: Optional[str] = None
    recording_location: Optional[str] = None  # <-- was HttpUrl
    recording_url: Optional[str] = None       # <-- was HttpUrl

# ---------- util to merge GET/POST/JSON bodies
async def _collect(request: Request) -> Dict[str, Any]:
    data: Dict[str, Any] = {}
    data.update(request.query_params)
    try:
        form = await request.form(); data.update(form)
    except Exception: pass
    try:
        body = await request.json()
        if isinstance(body, dict): data.update(body)
    except Exception: pass
    return dict(data)

# ---------- external calls
async def deepgram_transcribe(audio_url: str):
    if not audio_url:
        raise RuntimeError("No audio URL provided")
    endpoint = "https://api.deepgram.com/v1/listen"
    params = {
        "model": "nova-2-general",
        "smart_format": "true",
        "punctuate": "true",
        "diarize": "true",
        "utterances": "true",
        "detect_language": "true"
    }
    headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}"}
    async with aiohttp.ClientSession() as session:
        async with session.post(endpoint, params=params, headers=headers, json={"url": audio_url}) as r:
            text = await r.text()
            if r.status >= 300:
                raise RuntimeError(f"Deepgram error {r.status}: {text}")
            data = json.loads(text)
    transcript = data.get("results", {}).get("channels", [{}])[0]\
                     .get("alternatives", [{}])[0].get("transcript", "")
    language = data.get("results", {}).get("channels", [{}])[0]\
                    .get("alternatives", [{}])[0].get("language", "auto")
    confidence = data.get("results", {}).get("channels", [{}])[0]\
                     .get("alternatives", [{}])[0].get("confidence", 0)
    duration = int(data.get("metadata", {}).get("duration", 0))
    return transcript, language, confidence, duration

async def run_gpt(prompt_template: str, transcript_text: str) -> str:
    user_prompt = prompt_template.replace("{transcript}", transcript_text)
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    body = {
        "model": OPENAI_MODEL,
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": "You are a strict JSON generator. Return valid JSON only."},
            {"role": "user", "content": user_prompt}
        ]
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=body) as r:
            txt = await r.text()
            if r.status >= 300:
                raise RuntimeError(f"OpenAI error {r.status}: {txt}")
            data = json.loads(txt)
    return data["choices"][0]["message"]["content"]

def _normalize_url(val: Optional[str]) -> Optional[str]:
    if not val:
        return None
    s = str(val).strip()
    # Ignore VICIdial macros like --A--recording_location--B--
    if s.startswith("--A--") and s.endswith("--B--"):
        return None
    # Only accept real http(s) URLs
    if s.lower().startswith(("http://", "https://")):
        return s
    return None

@router.api_route("/call-finished", methods=["GET", "POST"])
async def manual_call_finished(request: Request, background: BackgroundTasks, db: Session = Depends(get_db)):
    incoming = await _collect(request)

    # prefer direct URL, sanitize it
    rec = incoming.get("recording_location") or incoming.get("recording_url")
    incoming["recording_location"] = _normalize_url(rec)

    # ints
    for k in ("client_id", "lead_id", "call_duration_sec"):
        if k in incoming and incoming[k] not in (None, ""):
            try:
                incoming[k] = int(incoming[k])
            except:
                incoming[k] = None

    payload = ManualCallPayload(**incoming)

    app_logger.info(f"[manual] accepted unique_id={payload.unique_id} file={payload.recording_filename}")

    # Only start the pipeline if we have a usable recording URL
    if payload.recording_location:
        background.add_task(_pipeline, payload.dict())
        return {"status": "accepted", "unique_id": payload.unique_id or "", "recording_url": payload.recording_location}
    else:
        # Don’t crash; return 202 with a helpful hint
        app_logger.warning("[manual] no usable recording URL; macros likely not expanded yet")
        return {"status": "accepted_no_recording", "reason": "missing/placeholder recording_location", "hint": "Check VICIdial 'VAR' prefix / macro expansion"}


# ---------- pipeline: transcribe -> tag -> upsert CallDetails row
async def _pipeline(payload: Dict[str, Any]):
    db = SessionLocal()
    try:
        # ---- derive times
        start_dt = parse_iso_to_dt(payload.get("call_start_utc")) if payload.get("call_start_utc") else None
        end_dt   = parse_iso_to_dt(payload.get("call_end_utc")) if payload.get("call_end_utc") else None

        # fallbacks from epoch if provided
        if not start_dt and payload.get("start_epoch"):
            try: start_dt = datetime.utcfromtimestamp(int(str(payload["start_epoch"]).split('.')[0]))
            except: start_dt = None
        if not end_dt and payload.get("end_epoch"):
            try: end_dt = datetime.utcfromtimestamp(int(str(payload["end_epoch"]).split('.')[0]))
            except: end_dt = None

        # lengths
        length_sec = payload.get("call_duration_sec")
        if not length_sec and start_dt and end_dt:
            length_sec = int((end_dt - start_dt).total_seconds())

        # string versions for your table
        start_epoch_s = payload.get("start_epoch") or dt_to_epoch_s(start_dt) or ""
        end_epoch_s   = payload.get("end_epoch") or dt_to_epoch_s(end_dt) or ""
        start_hms     = dt_hms(start_dt) or ""
        end_hms       = dt_hms(end_dt) or ""
        length_str    = str(length_sec) if length_sec is not None else ""

        call_date = start_dt or datetime.utcnow()

        # ---- transcribe
        rec_url = payload.get("recording_location")
        app_logger.info(f"[manual] transcribe start unique_id={payload.get('unique_id')} url={rec_url}")
        tr_text, lang, conf, dur = await deepgram_transcribe(rec_url)
        app_logger.info(f"[manual] transcribe ok lang={lang} conf={conf} dur={dur}")

        # ---- fetch outbound prompt (by client_id)
        prompt_row = (
            db.query(Prompt)
              .filter(Prompt.client_id == payload["client_id"], Prompt.direction == "outbound", Prompt.is_active == 1)
              .order_by(Prompt.id.desc())
              .first()
        )
        if not prompt_row:
            raise RuntimeError("No active outbound prompt for this client")

        # ---- GPT tagging
        app_logger.info(f"[manual] gpt start prompt_id={prompt_row.id}")
        raw = await run_gpt(prompt_row.prompt_text, tr_text)
        parsed = safe_parse_json(raw)
        app_logger.info("[manual] gpt done")

        # ---- map GPT -> CallDetails columns
        row_data = dict(
            client_id=payload["client_id"],
            campaign_id=payload.get("campaign_id"),
            length_in_sec=length_str,
            start_epoch=start_epoch_s,
            end_epoch=end_epoch_s,
            CallDate=call_date,
            LeadID=payload.get("lead_id"),
            AgentName=payload.get("agent_id"),
            MobileNo=payload.get("phone_number"),
            CompetitorName=None,  # set if you extract competitors
            Opening=str(parsed.get("Opening") or ""),
            Offered=str(parsed.get("Offered") or ""),
            ObjectionHandling=str(parsed.get("ObjectionHandling") or ""),
            PrepaidPitch=str(parsed.get("PrepaidPitch") or ""),
            UpsellingEfforts=str(parsed.get("UpsellingEfforts") or ""),
            OfferUrgency=str(parsed.get("OfferUrgency") or ""),
            SensitiveWordUsed=parsed.get("SensitiveWordUsed"),
            SensitiveWordContext=parsed.get("SensitiveWordContext"),
            AreaForImprovement=None,  # optional: derive from parsed
            TranscribeText=tr_text,
            TopNegativeWordsByAgent=None,
            TopNegativeWordsByCustomer=None,
            LengthSec=length_str,
            StartTime=start_hms,
            EndTime=end_hms,
            CallDisposition=payload.get("dispo"),
            OpeningRejected=to_i(parsed.get("OpeningRejected")),
            OfferingRejected=to_i(parsed.get("OfferingRejected")),
            AfterListeningOfferRejected=to_i(parsed.get("AfterListeningOfferRejected")),
            SaleDone=to_i(parsed.get("SaleDone")),
            NotInterestedReasonCallContext=None,
            NotInterestedBucketReason=None,
            OpeningPitchContext=parsed.get("OpeningPitchContext"),
            OfferedPitchContext=parsed.get("OfferedPitchContext"),
            ObjectionHandlingContext=parsed.get("ObjectionHandlingContext"),
            PrepaidPitchContext=parsed.get("PrepaidPitchContext"),
            FileName=payload.get("recording_filename") or (payload.get("recording_location") or "").split("/")[-1],
            Status=1,  # processed
            Category=parsed.get("Category"),
            SubCategory=parsed.get("SubCategory"),
            CustomerObjectionCategory=parsed.get("CustomerObjectionCategory"),
            CustomerObjectionSubCategory=parsed.get("CustomerObjectionSubCategory"),
            AgentRebuttalCategory=parsed.get("AgentRebuttalCategory"),
            AgentRebuttalSubCategory=parsed.get("AgentRebuttalSubCategory"),
            ProductOffering=parsed.get("ProductOffering"),
            DiscountType=parsed.get("DiscountType"),
            OpeningPitchCategory=", ".join(parsed.get("OpeningPitchCategory", [])) if isinstance(parsed.get("OpeningPitchCategory"), list) else parsed.get("OpeningPitchCategory"),
            ContactSettingContext=parsed.get("ContactSettingContext"),
            ContactSettingCategory=parsed.get("ContactSettingCategory"),
            ContactSetting2=parsed.get("ContactSetting2"),
            Feedback_Category=parsed.get("Feedback_Category"),
            FeedbackContext=parsed.get("FeedbackContext"),
            Feedback=parsed.get("Feedback"),
            Age=None,
            ConsumptionType=None,
            AgeofConsumption=None,
            ReasonforQuitting=None,
            entrydate=now_str()
        )

        # ---- UPSERT by FileName (best available key in this schema)
        file_key = row_data["FileName"]
        existing = None
        if file_key:
            existing = db.query(CallDetails).filter(CallDetails.FileName == file_key).one_or_none()

        if existing:
            for k, v in row_data.items():
                setattr(existing, k, v)
            db.commit()
            app_logger.info(f"[manual] CallDetails updated file={file_key}")
        else:
            new_row = CallDetails(**row_data)
            db.add(new_row); db.commit()
            app_logger.info(f"[manual] CallDetails inserted id={new_row.id}")

    except Exception as e:
        app_logger.exception(f"[manual] pipeline failed: {e}")
    finally:
        db.close()
