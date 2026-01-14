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
WS_TIMEOUT = 600

# ---------------- AUDIO HELPERS ----------------
CHUNK_SIZE = 512 * 1024

def get_client_connection_uri(client_id: int) -> str | None:
    conn = mysql.connector.connect(**DB_CONFIG)
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT connection_uri
        FROM users
        WHERE clientid = %s
        LIMIT 1
    """, (client_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    return row["connection_uri"] if row and row["connection_uri"] else None


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

async def call_details_auto_ws(audio_url: str, connection_uri: str, schema: str | None):
    audio_bytes = requests.get(audio_url, timeout=30).content
    chunks = make_audio_chunks(audio_bytes)

    uri = f"ws://{connection_uri.strip()}"

    async with connect(uri, ping_timeout=WS_TIMEOUT) as ws:
        cmd = Box(task="custom_v2", whisper_beam_size = 5, whisper_patience = 1.5, extra_whisper_words = 'avdut', whisper_condition_on_previous_text = True, temperature = 0.4, num_chunks=len(chunks), schema=schema)
        await ws.send(cmd.to_json())

        for chunk in chunks:
            await ws.send(chunk)

        transcript = await ws.recv()
        ai_resp = await ws.recv()

        return transcript, Box.from_json(ai_resp).to_dict()

# ---------------- INSERT SQL ----------------
INSERT_BOT_TAGGING_SQL = """
INSERT INTO bot_tagging (
    ClientId,
    MobileNo,
    CallDate,
    User,
    lead_id,
    Campaign,
    length_in_sec,
    Transcribe_Text,
    areas_for_improvement,

    Standard_Call_Opening,
    Professionalism,
    Placed_Empathy,
    ROS_Clarity_Accent,
    Enthusiasm,
    Active_Listening,
    Grammar,
    Accurate_Probing,
    Hold_Procedure,
    Call_Transfer,
    Call_Closing,
    
    professionalism_maintained,
    assurance_or_appreciation_provided,
    pronunciation_and_clarity,
    enthusiasm_and_no_fumbling,
    politeness_and_no_sarcasm,
    proper_grammar,
    accurate_issue_probing,
    proper_hold_procedure,
    proper_transfer_and_language,
    proper_call_closure,
    address_recorded_completely,
    correct_and_complete_information,
    express_empathy,

    field1, field2, field3, field4, field5,
    field6, field7, field8, field9, field10,
    field11, field12, field13, field14, field15,
    total_score, quality_percentage,
    max_score
)
VALUES (
    %(ClientId)s,
    %(MobileNo)s,
    %(CallDate)s,
    %(User)s,
    %(lead_id)s,
    %(Campaign)s,
    %(length_in_sec)s,
    %(Transcribe_Text)s,
    %(areas_for_improvement)s,

    %(Standard_Call_Opening)s,
    %(Professionalism)s,
    %(Placed_Empathy)s,
    %(ROS_Clarity_Accent)s,
    %(Enthusiasm)s,
    %(Active_Listening)s,
    %(Grammar)s,
    %(Accurate_Probing)s,
    %(Hold_Procedure)s,
    %(Call_Transfer)s,
    %(Call_Closing)s,
    
    %(professionalism_maintained)s,
    %(assurance_or_appreciation_provided)s,
    %(pronunciation_and_clarity)s,
    %(enthusiasm_and_no_fumbling)s,
    %(politeness_and_no_sarcasm)s,
    %(proper_grammar)s,
    %(accurate_issue_probing)s,
    %(proper_hold_procedure)s,
    %(proper_transfer_and_language)s,
    %(proper_call_closure)s,
    %(address_recorded_completely)s,
    %(correct_and_complete_information)s,
    %(express_empathy)s,

    %(field1)s, %(field2)s, %(field3)s, %(field4)s, %(field5)s,
    %(field6)s, %(field7)s, %(field8)s, %(field9)s, %(field10)s,
    %(field11)s, %(field12)s, %(field13)s, %(field14)s, %(field15)s,
    %(total_score)s, %(quality_percentage)s,
    %(max_score)s
)
"""



def ai_yes_no(ai_json, key):
    """
    Returns 1 if short_answer == 'Yes', else 0
    """
    return 1 if ai_json.get(key, {}).get("short_answer") == "Yes" else 0


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
            connection_uri = get_client_connection_uri(call["Client_id"])

            if not connection_uri:
                raise Exception(f"No connection_uri found for ClientId={call['Client_id']}")

            transcript, ai_json = asyncio.run(
                call_details_auto_ws(call["file_url"], connection_uri, prompt_schema)
            )

            field_scores = [
                ai_yes_no(ai_json, "correct_opening"),
                ai_yes_no(ai_json, "professionalism"),
                ai_yes_no(ai_json, "assurance_and_appreciation"),
                ai_yes_no(ai_json, "empathy"),
                ai_yes_no(ai_json, "pronunciation_and_clarity"),
                ai_yes_no(ai_json, "enthusiasm_and_fumbling"),
                ai_yes_no(ai_json, "acively_listen_without_unnecessary_interruption"),
                ai_yes_no(ai_json, "politeness"),
                ai_yes_no(ai_json, "proper_grammar"),
                ai_yes_no(ai_json, "understanding_of_issue"),
                ai_yes_no(ai_json, "inform_before_placing_hold"),
                ai_yes_no(ai_json, "thank_customer_for_being_on_line"),
                ai_yes_no(ai_json, "informing_customer_of_exact_steps"),
                ai_yes_no(ai_json, "timelines_for_resolution"),
                ai_yes_no(ai_json, "proper_closure"),
            ]

            total_score = sum(field_scores)
            max_score = 15
            quality_percentage = round((total_score / max_score) * 100, 2)

            params = {
                "ClientId": call["Client_id"],
                "MobileNo": call["MobileNo"],
                "CallDate": call["call_date"],
                "User": call["user"],
                "lead_id": call["lead_id"],
                "Campaign": call["campaign_id"],
                "length_in_sec": call["length_in_sec"],
                "Transcribe_Text": transcript,

                "areas_for_improvement": json.dumps([
                    k for k, v in ai_json.items()
                    if v.get("short_answer") == "No"
                ]),

                # -------- Main scoring columns --------
                "Standard_Call_Opening": ai_yes_no(ai_json, "correct_opening"),
                "Professionalism": ai_yes_no(ai_json, "professionalism"),
                "Placed_Empathy": ai_yes_no(ai_json, "empathy"),
                "ROS_Clarity_Accent": ai_yes_no(ai_json, "pronunciation_and_clarity"),
                "Enthusiasm": ai_yes_no(ai_json, "enthusiasm_and_fumbling"),
                "Active_Listening": ai_yes_no(ai_json, "acively_listen_without_unnecessary_interruption"),
                "Grammar": ai_yes_no(ai_json, "proper_grammar"),
                "Accurate_Probing": ai_yes_no(ai_json, "understanding_of_issue"),
                "Hold_Procedure": ai_yes_no(ai_json, "inform_before_placing_hold"),
                "Call_Transfer": ai_yes_no(ai_json, "webinar_request_with_proper_language"),
                "Call_Closing": ai_yes_no(ai_json, "proper_closure"),

                "professionalism_maintained": ai_yes_no(ai_json, "professionalism"),
                "assurance_or_appreciation_provided": ai_yes_no(ai_json, "assurance_and_appreciation"),
                "pronunciation_and_clarity": ai_yes_no(ai_json, "pronunciation_and_clarity"),
                "enthusiasm_and_no_fumbling": ai_yes_no(ai_json, "enthusiasm_and_fumbling"),
                "politeness_and_no_sarcasm": ai_yes_no(ai_json, "politeness"),
                "proper_grammar": ai_yes_no(ai_json, "proper_grammar"),
                "accurate_issue_probing": ai_yes_no(ai_json, "understanding_of_issue"),
                "proper_hold_procedure": ai_yes_no(ai_json, "inform_before_placing_hold"),
                "proper_transfer_and_language": ai_yes_no(ai_json, "webinar_request_with_proper_language"),
                "proper_call_closure": ai_yes_no(ai_json, "proper_closure"),
                "address_recorded_completely": ai_yes_no(ai_json, "acively_listen_without_unnecessary_interruption"),
                "correct_and_complete_information": ai_yes_no(ai_json, "informing_customer_of_exact_steps"),
                "express_empathy": ai_yes_no(ai_json, "empathy"),

                # -------- field1 → field15 (0 / 1 AI flags) --------
                "field1": field_scores[0],
                "field2": field_scores[1],
                "field3": field_scores[2],
                "field4": field_scores[3],
                "field5": field_scores[4],
                "field6": field_scores[5],
                "field7": field_scores[6],
                "field8": field_scores[7],
                "field9": field_scores[8],
                "field10": field_scores[9],
                "field11": field_scores[10],
                "field12": field_scores[11],
                "field13": field_scores[12],
                "field14": field_scores[13],
                "field15": field_scores[14],

                "total_score": total_score,
                "quality_percentage": quality_percentage,
                "max_score": max_score,

            }

            cur.execute(INSERT_BOT_TAGGING_SQL, params)
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
