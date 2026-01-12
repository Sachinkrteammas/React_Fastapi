import time
import mysql.connector
import logging
import requests
import json
from datetime import datetime
import asyncio
from base64 import b64encode
from websockets import connect
from box import Box

# ---------------- DB CONFIG ----------------
DB_CONFIG = {
    "host": "192.168.11.243",
    "user": "root",
    "password": "vicidialnow",
    "database": "dialdesk_callmaster"
}

logging.basicConfig(level=logging.INFO)

# ---------------- WS CONFIG ----------------
class WSConfig:
    connection_uri = "194.68.245.50:22162"
    timeout = 600

ws_cfg = WSConfig()

# ---------------- AUDIO HELPERS ----------------
CHUNK_SIZE = 512 * 1024

def make_audio_chunks(data: bytes):
    encoded = b64encode(data).decode()
    return [encoded[i:i + CHUNK_SIZE] for i in range(0, len(encoded), CHUNK_SIZE)]

async def call_details_auto_ws(audio_url: str, cfg):
    audio_bytes = requests.get(audio_url, timeout=30).content
    chunks = make_audio_chunks(audio_bytes)

    uri = f"ws://{cfg.connection_uri.strip()}"

    async with connect(uri, ping_timeout=cfg.timeout) as ws:
        cmd = Box(task="avdut_auto", num_chunks=len(chunks))
        await ws.send(cmd.to_json())

        for chunk in chunks:
            await ws.send(chunk)

        transcript = await ws.recv()
        ai_resp = await ws.recv()

        return transcript, Box.from_json(ai_resp).to_dict()

# ---------------- INSERT SQL ----------------
INSERT_CALLDETAILS_SQL = """
INSERT INTO CallDetails (
    client_id,
    campaign_id,
    length_in_sec,
    CallDate,
    LeadID,
    AgentName,
    MobileNo,
    Opening,
    Offered,
    ObjectionHandling,
    PrepaidPitch,
    UpsellingEfforts,
    OfferUrgency,
    SensitiveWordUsed,
    SensitiveWordContext,
    AreaForImprovement,
    TranscribeText,
    CallDisposition,
    OpeningRejected,
    OfferingRejected,
    AfterListeningOfferRejected,
    SaleDone,
    OpeningPitchContext,
    OfferedPitchContext,
    ObjectionHandlingContext,
    Status,
    CustomerObjectionCategory,
    AgentRebuttalCategory,
    OpeningPitchCategory,
    ContactSettingContext,
    Feedback_Category,
    FeedbackContext,
    entrydate,
    QE_Correct_Opening,
    QE_Professionalism_No_Rude_Behavior,
    QE_Assurance_Appreciation_Phrases,
    QE_Expressed_Empathy,
    QE_Pronunciation_Clarity,
    QE_Appropriate_Enthusiasm,
    QE_Active_Listening,
    QE_Polite_No_Sarcasm,
    QE_Proper_Grammar,
    QE_Accurate_Probing,
    QE_Informed_Before_Hold,
    QE_Thanked_After_Hold,
    QE_Explained_Steps_Clearly,
    QE_Clear_Timelines,
    QE_Proper_Transfer_Procedure,
    QE_Proper_Closure
) VALUES (
    %(client_id)s,
    %(campaign_id)s,
    %(length_in_sec)s,
    %(CallDate)s,
    %(LeadID)s,
    %(AgentName)s,
    %(MobileNo)s,
    %(Opening)s,
    %(Offered)s,
    %(ObjectionHandling)s,
    %(PrepaidPitch)s,
    %(UpsellingEfforts)s,
    %(OfferUrgency)s,
    %(SensitiveWordUsed)s,
    %(SensitiveWordContext)s,
    %(AreaForImprovement)s,
    %(TranscribeText)s,
    %(CallDisposition)s,
    %(OpeningRejected)s,
    %(OfferingRejected)s,
    %(AfterListeningOfferRejected)s,
    %(SaleDone)s,
    %(OpeningPitchContext)s,
    %(OfferedPitchContext)s,
    %(ObjectionHandlingContext)s,
    %(Status)s,
    %(CustomerObjectionCategory)s,
    %(AgentRebuttalCategory)s,
    %(OpeningPitchCategory)s,
    %(ContactSettingContext)s,
    %(Feedback_Category)s,
    %(FeedbackContext)s,
    %(entrydate)s,
    %(QE_Correct_Opening)s,
    %(QE_Professionalism_No_Rude_Behavior)s,
    %(QE_Assurance_Appreciation_Phrases)s,
    %(QE_Expressed_Empathy)s,
    %(QE_Pronunciation_Clarity)s,
    %(QE_Appropriate_Enthusiasm)s,
    %(QE_Active_Listening)s,
    %(QE_Polite_No_Sarcasm)s,
    %(QE_Proper_Grammar)s,
    %(QE_Accurate_Probing)s,
    %(QE_Informed_Before_Hold)s,
    %(QE_Thanked_After_Hold)s,
    %(QE_Explained_Steps_Clearly)s,
    %(QE_Clear_Timelines)s,
    %(QE_Proper_Transfer_Procedure)s,
    %(QE_Proper_Closure)s
)
"""

# ---------------- WORKER ----------------
def call_details_ws_worker():
    while True:
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor(dictionary=True)

        cur.execute("""
            SELECT *
            FROM call_log
            WHERE processed = 0
            AND file_url IS NOT NULL
            AND Client_id = 654
            ORDER BY id ASC
            LIMIT 1
        """)
        call = cur.fetchone()

        if not call:
            logging.info("No CallDetails jobs. Sleeping...")
            time.sleep(10)
            continue

        try:
            logging.info(f"Processing call_log id={call['id']}")

            transcript, ai_json = asyncio.run(
                call_details_auto_ws(call["file_url"], ws_cfg)
            )

            opening = ai_json.get("opening", {})
            offer = ai_json.get("offer", {})
            objections = ai_json.get("objections", {})
            feedback = ai_json.get("call_context_and_feedback", {})
            sensitive = ai_json.get("sensitive_words", {})
            quality = ai_json.get("quality_evaluation", {})

            params = {
                "client_id": call["Client_id"],
                "campaign_id": call["campaign_id"],
                "length_in_sec": call["length_in_sec"],
                "CallDate": call["call_date"],
                "LeadID": call["lead_id"],
                "AgentName": call["user"],
                "MobileNo": call["MobileNo"],

                "Opening": 1 if opening.get("opening_present") == "Yes" else 0,
                "Offered": 1 if offer.get("offer_present") == "Yes" else 0,
                "ObjectionHandling": 1 if objections.get("objections_handled") == "Yes" else 0,
                "PrepaidPitch": 1 if offer.get("prepaid_pitch_present") == "Yes" else 0,
                "UpsellingEfforts": 1 if offer.get("upselling_efforts") == "Yes" else 0,
                "OfferUrgency": 1 if offer.get("offer_urgency_created") == "Yes" else 0,

                "SensitiveWordUsed": json.dumps(sensitive.get("sensitive_words_found")),
                "SensitiveWordContext": None,

                "AreaForImprovement": json.dumps(
                    [k for k, v in quality.items() if v == "No"]
                ),

                "TranscribeText": transcript,
                "CallDisposition": offer.get("customer_reaction"),

                "OpeningRejected": 1 if opening.get("opening_present") == "No" else 0,
                "OfferingRejected": 1 if offer.get("offer_present") == "No" else 0,
                "AfterListeningOfferRejected": 0,
                "SaleDone": 1 if offer.get("sale_done") == "Yes" else 0,

                "OpeningPitchContext": feedback.get("call_context"),
                "OfferedPitchContext": feedback.get("call_context"),
                "ObjectionHandlingContext": json.dumps(
                    objections.get("objection_rebuttal_pairs")
                ),

                "Status": 1,

                "CustomerObjectionCategory": (
                    "Raised" if objections.get("objections_handled") == "No" else "None"
                ),
                "AgentRebuttalCategory": (
                    "Provided" if objections.get("objections_handled") == "Yes" else "None"
                ),

                "OpeningPitchCategory": opening.get("immediate_outcome"),
                "ContactSettingContext": feedback.get("call_context"),
                "Feedback_Category": feedback.get("feedback_sentiment"),
                "FeedbackContext": json.dumps(feedback.get("context_lines")),

                "entrydate": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),

                "QE_Correct_Opening": 1
                if quality.get("correct_opening") == "Yes" else 0,

                "QE_Professionalism_No_Rude_Behavior": 1
                if quality.get("maintained_professionalism_no_rude_behavior") == "Yes" else 0,

                "QE_Assurance_Appreciation_Phrases": 1
                if quality.get("used_assurance_appreciation_phrases") == "Yes" else 0,

                "QE_Expressed_Empathy": 1
                if quality.get("expressed_empathy_with_keywords") == "Yes" else 0,

                "QE_Pronunciation_Clarity": 1
                if quality.get("correct_pronunciation_and_clarity") == "Yes" else 0,

                "QE_Appropriate_Enthusiasm": 1
                if quality.get("appropriate_enthusiasm_no_fumbling") == "Yes" else 0,

                "QE_Active_Listening": 1
                if quality.get("active_listening_no_unnecessary_interruptions") == "Yes" else 0,

                "QE_Polite_No_Sarcasm": 1
                if quality.get("polite_and_free_of_sarcasm") == "Yes" else 0,

                "QE_Proper_Grammar": 1
                if quality.get("used_proper_grammar") == "Yes" else 0,

                "QE_Accurate_Probing": 1
                if quality.get("accurately_probed_to_understand_issue") == "Yes" else 0,

                "QE_Informed_Before_Hold": 1
                if quality.get("informed_before_hold_with_proper_phrase") == "Yes" else 0,

                "QE_Thanked_After_Hold": 1
                if quality.get("thanked_after_retrieving_from_hold") == "Yes" else 0,

                "QE_Explained_Steps_Clearly": 1
                if quality.get("informed_customer_about_exact_steps") == "Yes" else 0,

                "QE_Clear_Timelines": 1
                if quality.get("stated_clear_timelines_when_asked") == "Yes" else 0,

                "QE_Proper_Transfer_Procedure": 1
                if quality.get("proper_transfer_procedure_if_transferred") == "Yes" else 0,

                "QE_Proper_Closure": 1
                if quality.get("proper_closure_including_further_concerns") == "Yes" else 0,

            }

            cur.execute(INSERT_CALLDETAILS_SQL, params)
            conn.commit()

            cur.execute(
                "UPDATE call_log SET processed = 1 WHERE id = %s",
                (call["id"],)
            )
            conn.commit()

            logging.info(f"Inserted CallDetails for call_log id={call['id']}")

        except Exception as e:
            logging.error(f"CallDetails WS worker error: {e}")
            conn.rollback()

        finally:
            cur.close()
            conn.close()

        time.sleep(2)

# ---------------- MAIN ----------------
if __name__ == "__main__":
    logging.info("CallDetails WebSocket Worker Started")
    call_details_ws_worker()
