import time
import mysql.connector
import logging
import requests
import json
import re
from openai import OpenAI
from datetime import datetime
import asyncio
from base64 import b64encode
from websockets import connect
from box import Box



DB_CONFIG = {
    "host": "192.168.11.243",
    "user": "root",
    "password": "vicidialnow",
    "database": "dialdesk_callmaster"
}

logging.basicConfig(level=logging.INFO)


class WSConfig:
    connection_uri = "194.68.245.28:22067"
    timeout = 600

ws_cfg = WSConfig()



EMPTY_TRANSCRIPT_INSERT_SQL = """
INSERT INTO fabonow_calls (
    campaign_id,
    external_ref,
    agent_name,
    customer_phone,
    occurred_at,
    language,
    raw_transcript,
    ai_output_json
) VALUES (
    %(campaign_id)s,
    %(external_ref)s,
    %(agent_name)s,
    %(customer_phone)s,
    %(occurred_at)s,
    %(language)s,
    %(raw_transcript)s,
    %(ai_output_json)s
)
"""


ChunkSize = 512*1024

def make_audio_chunks(data: bytes):
    data = b64encode(data).decode()
    return [data[i:i+ChunkSize] for i in range(0, len(data), ChunkSize)]



async def fabonow_auto_ws(audio_url: str, cfg):
    # Download audio
    audio_bytes = requests.get(audio_url, timeout=30).content
    chunks = make_audio_chunks(audio_bytes)

    uri = f"ws://{cfg.connection_uri.strip()}"

    async with connect(uri, ping_timeout=cfg.timeout) as ws:
        cmd = Box(
            task="fabonow_auto",
            num_chunks=len(chunks),
        )

        await ws.send(cmd.to_json())

        for chunk in chunks:
            await ws.send(chunk)

        transcript = await ws.recv()
        ai_resp = await ws.recv()

        return transcript, Box.from_json(ai_resp).to_dict()



# ---------- WORKER ----------
def fabonow_worker():
    while True:
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor(dictionary=True)

        cur.execute("""
            SELECT * FROM fabonow_call_log
            WHERE processed = 0
            AND file_url IS NOT NULL
            ORDER BY id ASC
            LIMIT 1
        """)

        call = cur.fetchone()

        if not call:
            logging.info("No Fabonow calls found. Sleeping...")
            time.sleep(10)
            continue

        call_id = call["id"]
        logging.info(f"Processing Fabonow call_id={call_id}")

        try:
            transcript, ai_json = asyncio.run(
                fabonow_auto_ws(call["file_url"], ws_cfg)
            )

            if not transcript:
                logging.error("Empty transcript. Inserting minimal Fabonow record.")

                empty_params = {
                    "campaign_id": call["campaign_id"],
                    "external_ref": call["Client_id"],
                    "agent_name": call["user"],
                    "customer_phone": call["MobileNo"],
                    "occurred_at": call["call_date"],
                    "language": "hi",
                    "raw_transcript": "",
                    "ai_output_json": json.dumps({
                        "error": "Empty transcript",
                        "reason": "Audio missing / silent / transcription failed"
                    })
                }

                cur.execute(EMPTY_TRANSCRIPT_INSERT_SQL, empty_params)
                conn.commit()

                cur.execute("UPDATE fabonow_call_log SET processed=1 WHERE id=%s", (call_id,))
                conn.commit()

                continue

            print("ai_json------->>>>", ai_json)

            # ---------- FIELD EXTRACTION ----------
            call_tags = ai_json.get("call_outcome_tags", {})

            crt_total_connected = 1 if call_tags.get("connected") else 0
            crt_total_interested = 1 if call_tags.get("interested") else 0
            crt_asked_details = 1 if call_tags.get("asked_for_details") else 0
            crt_meeting_scheduled = 1 if call_tags.get("meeting_scheduled") else 0
            crt_not_interested = 1 if call_tags.get("not_interested") else 0
            crt_crm_meeting = 1 if call_tags.get("crm_meeting_scheduled") else 0

            fab_conversion = 1 if call_tags.get("converted") else 0
            fab_brochure = 1 if call_tags.get("brochure_proposal_discussed") else 0

            franchise = ai_json.get("franchise_opportunity_analysis", {})
            lead_assessment = franchise.get("lead_assessment", {})

            workable_status = lead_assessment.get("lead_classification")
            reason_missed = lead_assessment.get("explanation")

            customer_details = franchise.get("customer_details", {})

            cust_obj = ai_json.get("customer_objections", {})
            cust_dis = ai_json.get("customer_disinterest", {})

            objection_count = sum(
                1 for v in cust_obj.values() if v.get("raised")
            ) + sum(
                1 for v in cust_dis.values() if v.get("raised")
            )

            resolved_count = sum(
                1 for v in cust_obj.values() if v.get("resolved")
            ) + sum(
                1 for v in cust_dis.values() if v.get("resolved")
            )

            resolved_pct = round((resolved_count / objection_count) * 100, 2) if objection_count else 0

            agent_reb = ai_json.get("agent_rebuttals", {})

            rebuttal_done = any(agent_reb.values())
            conversion_after_rebuttal = 1 if rebuttal_done and fab_conversion else 0

            opening = ai_json.get("opening_pitch_analysis", {})

            opening_style = "Complete" if all(opening.values()) else "Partial"

            context = ai_json.get("context_setting_analysis", {})

            context_type = (
                "Feedback + Pitch" if context.get("feedback_combined_with_pitch")
                else "Feedback First" if context.get("feedback_sought_before_pitch")
                else "Direct Pitch" if context.get("direct_pitch_without_feedback")
                else "Skipped"
            )

            skipped_context = context.get("context_setting_skipped")

            offer = ai_json.get("offer_presentation_analysis", {})

            offer_type = ", ".join(offer.get("pitch_components_mentioned", []))
            no_discount = "_None_" in offer.get("incentives_or_discounts_mentioned", [])


            insert_sql = """
                INSERT INTO fabonow_calls (
                    campaign_id, external_ref, agent_name, customer_phone,
                    occurred_at, language, raw_transcript, ai_output_json,

                    CRT_Isha_Total_Connected,
                    CRT_Isha_Total_Interested,
                    CRT_Isha_Asked_for_Details_WhatsApp,
                    CRT_Isha_Meeting_Scheduled,
                    CRT_Isha_Not_Interested,
                    CRT_Isha_Meeting_Schedule_CRM,

                    Fabonow_Total_Connected,
                    Fabonow_Total_Interested,
                    Fabonow_Not_Interested,
                    Fabonow_Brochure_Proposal_Discussed,
                    Fabonow_Conversion,

                    Franchise_Opportunity_Analysis,
                    Workable_vs_NonWorkable,
                    Reason_for_Missed_Franchise_Signup,
                    Detailed_Franchise_Objection_Split_JSON,
                    Franchise_Lead_Data_Completeness,

                    Franchise_Prospect_Loyalty,
                    Franchise_Pitch_Satisfaction,
                    Franchise_Prospect_Sentiment,
                    Daily_Franchise_Call_Feedback_Summary,
                    Franchise_Prospect_Sentiment_Trend,

                    Franchise_Opening_Pitch_Style,
                    Qualified_Leads_Generated_Isha,
                    Lead_Qualification_Pct,
                    Prospects_Engaged,
                    Engagement_Pct,

                    Franchise_Context_Setting_Type,
                    Prospect_Feedback_Before_Franchise_Offer,
                    Combined_Franchise_Pitch,
                    Skipped_Context_Setting,

                    Franchise_Offer_Type,
                    No_Offer_or_Discount_Provided,
                    Qualified_Leads_from_This_Pitch,

                    Customer_Objection_Category,
                    Customer_Objection_SubCategory,
                    Agent_Rebuttal_Category,
                    Agent_Rebuttal_SubCategory,
                    ObjectionCount,
                    ResolvedObjectionPerc,
                    ConversionAfterRebuttal
                ) VALUES (
                    %(campaign_id)s, %(external_ref)s, %(agent_name)s, %(customer_phone)s,
                    %(occurred_at)s, %(language)s, %(raw_transcript)s, %(ai_output_json)s,

                    %(CRT_Isha_Total_Connected)s,
                    %(CRT_Isha_Total_Interested)s,
                    %(CRT_Isha_Asked_for_Details_WhatsApp)s,
                    %(CRT_Isha_Meeting_Scheduled)s,
                    %(CRT_Isha_Not_Interested)s,
                    %(CRT_Isha_Meeting_Schedule_CRM)s,

                    %(Fabonow_Total_Connected)s,
                    %(Fabonow_Total_Interested)s,
                    %(Fabonow_Not_Interested)s,
                    %(Fabonow_Brochure_Proposal_Discussed)s,
                    %(Fabonow_Conversion)s,

                    %(Franchise_Opportunity_Analysis)s,
                    %(Workable_vs_NonWorkable)s,
                    %(Reason_for_Missed_Franchise_Signup)s,
                    %(Detailed_Franchise_Objection_Split_JSON)s,
                    %(Franchise_Lead_Data_Completeness)s,

                    %(Franchise_Prospect_Loyalty)s,
                    %(Franchise_Pitch_Satisfaction)s,
                    %(Franchise_Prospect_Sentiment)s,
                    %(Daily_Franchise_Call_Feedback_Summary)s,
                    %(Franchise_Prospect_Sentiment_Trend)s,

                    %(Franchise_Opening_Pitch_Style)s,
                    %(Qualified_Leads_Generated_Isha)s,
                    %(Lead_Qualification_Pct)s,
                    %(Prospects_Engaged)s,
                    %(Engagement_Pct)s,

                    %(Franchise_Context_Setting_Type)s,
                    %(Prospect_Feedback_Before_Franchise_Offer)s,
                    %(Combined_Franchise_Pitch)s,
                    %(Skipped_Context_Setting)s,

                    %(Franchise_Offer_Type)s,
                    %(No_Offer_or_Discount_Provided)s,
                    %(Qualified_Leads_from_This_Pitch)s,

                    %(Customer_Objection_Category)s,
                    %(Customer_Objection_SubCategory)s,
                    %(Agent_Rebuttal_Category)s,
                    %(Agent_Rebuttal_SubCategory)s,
                    %(ObjectionCount)s,
                    %(ResolvedObjectionPerc)s,
                    %(ConversionAfterRebuttal)s
                )
            """

            params = {
                "campaign_id": call["campaign_id"],
                "external_ref": call["Client_id"],
                "agent_name": call["user"],
                "customer_phone": call["MobileNo"],
                "occurred_at": call["call_date"],
                "language": "hi",
                "raw_transcript": transcript,
                "ai_output_json": json.dumps(ai_json),

                # CRT – Isha
                "CRT_Isha_Total_Connected": crt_total_connected,
                "CRT_Isha_Total_Interested": crt_total_interested,
                "CRT_Isha_Asked_for_Details_WhatsApp": crt_asked_details,
                "CRT_Isha_Meeting_Scheduled": crt_meeting_scheduled,
                "CRT_Isha_Not_Interested": crt_not_interested,
                "CRT_Isha_Meeting_Schedule_CRM": crt_crm_meeting,

                # Fabonow
                "Fabonow_Total_Connected": crt_total_connected,
                "Fabonow_Total_Interested": crt_total_interested,
                "Fabonow_Not_Interested": crt_not_interested,
                "Fabonow_Brochure_Proposal_Discussed": fab_brochure,
                "Fabonow_Conversion": fab_conversion,

                # Franchise
                "Franchise_Opportunity_Analysis": workable_status,
                "Workable_vs_NonWorkable": workable_status,
                "Reason_for_Missed_Franchise_Signup": reason_missed,
                "Detailed_Franchise_Objection_Split_JSON": json.dumps({
                    "customer_objections": cust_obj,
                    "customer_disinterest": cust_dis
                }),
                "Franchise_Lead_Data_Completeness": json.dumps(customer_details),

                # NPS / Sentiment (not present → None)
                "Franchise_Prospect_Loyalty": None,
                "Franchise_Pitch_Satisfaction": None,
                "Franchise_Prospect_Sentiment": None,
                "Daily_Franchise_Call_Feedback_Summary": None,
                "Franchise_Prospect_Sentiment_Trend": None,

                # Opening pitch
                "Franchise_Opening_Pitch_Style": opening_style,
                "Qualified_Leads_Generated_Isha": crt_total_interested,
                "Lead_Qualification_Pct": 100 if crt_total_interested else 0,
                "Prospects_Engaged": crt_total_connected,
                "Engagement_Pct": 100 if crt_total_connected else 0,

                # Context
                "Franchise_Context_Setting_Type": context_type,
                "Prospect_Feedback_Before_Franchise_Offer": context.get("feedback_sought_before_pitch"),
                "Combined_Franchise_Pitch": context.get("feedback_combined_with_pitch"),
                "Skipped_Context_Setting": skipped_context,

                # Offer
                "Franchise_Offer_Type": offer_type,
                "No_Offer_or_Discount_Provided": no_discount,
                "Qualified_Leads_from_This_Pitch": crt_total_interested,

                # Objections
                "Customer_Objection_Category": "Multiple" if objection_count else "None",
                "Customer_Objection_SubCategory": None,
                "Agent_Rebuttal_Category": "Provided" if rebuttal_done else "None",
                "Agent_Rebuttal_SubCategory": None,
                "ObjectionCount": objection_count,
                "ResolvedObjectionPerc": resolved_pct,
                "ConversionAfterRebuttal": conversion_after_rebuttal
            }

            cur.execute(insert_sql, params)
            conn.commit()

            cur.execute("UPDATE fabonow_call_log SET processed=1 WHERE id=%s", (call_id,))
            conn.commit()

            logging.info(f"Fabonow record inserted for call_id={call_id}")

        except Exception as e:
            logging.error(f"Fabonow worker error: {e}")
            conn.rollback()

        finally:
            cur.close()
            conn.close()

        time.sleep(2)

if __name__ == "__main__":
    logging.info("Fabonow Worker Started")
    fabonow_worker()
