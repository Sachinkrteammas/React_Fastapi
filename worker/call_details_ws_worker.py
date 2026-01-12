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


def get_client_prompt_schema(client_id: int):
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT prompt_text
        FROM client_prompt_configs
        WHERE client_id = %s
        AND is_active = 1
        LIMIT 1
    """, (client_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    return row["prompt_text"] if row else None


def make_audio_chunks(data: bytes):
    encoded = b64encode(data).decode()
    return [encoded[i:i + CHUNK_SIZE] for i in range(0, len(encoded), CHUNK_SIZE)]

async def call_details_auto_ws(audio_url: str, cfg, schema: str | None):
    audio_bytes = requests.get(audio_url, timeout=30).content
    chunks = make_audio_chunks(audio_bytes)

    uri = f"ws://{cfg.connection_uri.strip()}"

    async with connect(uri, ping_timeout=cfg.timeout) as ws:
        cmd = Box(task="custom_v2", whisper_beam_size = 5, whisper_patience = 1.5, extra_whisper_words = 'avdut', whisper_condition_on_previous_text = True, temperature = 0.4, num_chunks=len(chunks), schema=schema)
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
    AreaForImprovement,
    TranscribeText,
    Status,
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
    %(AreaForImprovement)s,
    %(TranscribeText)s,
    %(Status)s,
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


def qe_yes(val):
    return 1 if val == "Yes" else 0


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

            prompt_schema = get_client_prompt_schema(call["Client_id"])

            transcript, ai_json = asyncio.run(
                call_details_auto_ws(call["file_url"], ws_cfg, prompt_schema)
            )

            params = {
                "client_id": call["Client_id"],
                "campaign_id": call["campaign_id"],
                "length_in_sec": call["length_in_sec"],
                "CallDate": call["call_date"],
                "LeadID": call["lead_id"],
                "AgentName": call["user"],
                "MobileNo": call["MobileNo"],

                "AreaForImprovement": json.dumps([
                    k for k, v in ai_json.items()
                    if v.get("short_answer") == "No"
                ]),

                "TranscribeText": transcript,

                "Status": 1,

                "entrydate": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),

                "QE_Correct_Opening": qe_yes(
                    ai_json.get("correct_opening", {}).get("short_answer")
                ),

                "QE_Professionalism_No_Rude_Behavior": qe_yes(
                    ai_json.get("professionalism", {}).get("short_answer")
                ),

                "QE_Assurance_Appreciation_Phrases": qe_yes(
                    ai_json.get("assurance_and_appreciation", {}).get("short_answer")
                ),

                "QE_Expressed_Empathy": qe_yes(
                    ai_json.get("empathy", {}).get("short_answer")
                ),

                "QE_Pronunciation_Clarity": qe_yes(
                    ai_json.get("pronunciation_and_clarity", {}).get("short_answer")
                ),

                "QE_Appropriate_Enthusiasm": qe_yes(
                    ai_json.get("enthusiasm_and_fumbling", {}).get("short_answer")
                ),

                "QE_Active_Listening": qe_yes(
                    ai_json.get("acively_listen_without_unnecessary_interruption", {}).get("short_answer")
                ),

                "QE_Polite_No_Sarcasm": qe_yes(
                    ai_json.get("politeness", {}).get("short_answer")
                ),

                "QE_Proper_Grammar": qe_yes(
                    ai_json.get("proper_grammar", {}).get("short_answer")
                ),

                "QE_Accurate_Probing": qe_yes(
                    ai_json.get("understanding_of_issue", {}).get("short_answer")
                ),

                "QE_Informed_Before_Hold": qe_yes(
                    ai_json.get("inform_before_placing_hold", {}).get("short_answer")
                ),

                "QE_Thanked_After_Hold": qe_yes(
                    ai_json.get("thank_customer_for_being_on_line", {}).get("short_answer")
                ),

                "QE_Explained_Steps_Clearly": qe_yes(
                    ai_json.get("informing_customer_of_exact_steps", {}).get("short_answer")
                ),

                "QE_Clear_Timelines": qe_yes(
                    ai_json.get("timelines_for_resolution", {}).get("short_answer")
                ),

                "QE_Proper_Transfer_Procedure": qe_yes(
                    ai_json.get("webinar_request_with_proper_language", {}).get("short_answer")
                ),

                "QE_Proper_Closure": qe_yes(
                    ai_json.get("proper_closure", {}).get("short_answer")
                ),

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
