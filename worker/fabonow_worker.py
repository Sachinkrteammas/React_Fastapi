import time
import mysql.connector
import logging
import requests
import json
import re
from openai import OpenAI


DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)


DB_CONFIG = {
    "host": "192.168.11.243",
    "user": "root",
    "password": "vicidialnow",
    "database": "dialdesk_callmaster"
}

logging.basicConfig(level=logging.INFO)


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

def deepgram_transcribe(audio_url: str):
    try:
        headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}"}
        params = {"punctuate": "true", "model": "nova", "language": "hi-Latn"}

        audio_data = requests.get(audio_url, timeout=20).content
        response = requests.post(
            "https://api.deepgram.com/v1/listen",
            headers=headers,
            params=params,
            data=audio_data
        )

        if response.status_code == 200:
            return response.json()['results']['channels'][0]['alternatives'][0].get('transcript', '')
        logging.error(f"Deepgram error: {response.text}")
        return ""
    except Exception as e:
        logging.error(f"Transcription failed: {e}")
        return ""


def send_to_gpt(prompt: str):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return ONLY valid JSON. No explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0
        )

        content = response.choices[0].message.content.strip()

        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json_match.group(0)

        return ""
    except Exception as e:
        logging.error(f"GPT API error: {e}")
        return ""


def clean_percentage(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    value = value.replace("%", "").replace("percent", "").strip()
    try:
        return float(value)
    except:
        return None


def yes_no(condition):
    return "Yes" if condition else "No"

def yes_to_pct(value):
    return 100 if value == "Yes" else 0


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
            transcript = deepgram_transcribe(call["file_url"])

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

            # ---------- FETCH PROMPT ----------
            cur.execute("""
                SELECT prompt_text 
                FROM prompts 
                WHERE client_id = %s 
                AND is_active = 1
                LIMIT 1
            """, (630,))

            prompt_row = cur.fetchone()

            if not prompt_row:
                logging.error("No active prompt found for client_id=630")
                continue

            base_prompt = prompt_row["prompt_text"]

            prompt = f"""
            {base_prompt}

            InputConversation:
            {transcript}
            """

            ai_json_str = send_to_gpt(prompt)

            ai_json = json.loads(ai_json_str)

            # ---------- FIELD EXTRACTION ----------
            crt = ai_json.get("CRT – Isha Lead Gen", {})
            fab = ai_json.get("Fabonow Team – Conversion", {})

            # ---------- CRT – Isha ----------
            crt_total_connected = yes_no(crt.get("Total Connected") == "Connected")

            crt_total_interested = yes_no(crt.get("Total Interested") == "Interested")

            crt_asked_details = yes_no(
                crt.get("Asked for Details (WhatsApp)") == "Asked for Details"
            )

            crt_meeting_scheduled = yes_no(
                crt.get("Meeting Scheduled") == "Meeting Scheduled"
            )

            crt_not_interested = yes_no(
                crt.get("Not Interested") == "Not Interested"
            )

            crt_crm_meeting = yes_no(
                crt.get("Meeting Schedule (CRM)") == "Meeting Schedule"
            )

            # ---------- Fabonow ----------
            fab_total_connected = yes_no(
                fab.get("Total Connected") == "Connected"
            )

            fab_total_interested = yes_no(
                fab.get("Total Interested") == "Interested"
            )

            fab_not_interested = yes_no(
                fab.get("Not Interested") == "Not Interested"
            )

            fab_conversion = yes_no(
                fab.get("Conversion") == "Converted"
            )

            fab_brochure = yes_no(
                fab.get("Brochure/Proposal Discussed") == "Brochure Discussed"
            )

            dash1 = ai_json.get("Dashboard1_FranchiseOpportunityAnalysis", {})

            workable_status = dash1.get("Workable vs Non-Workable Franchise Leads")
            reason_missed = dash1.get("Reason for Missed Franchise Sign-up")
            customer_details = dash1.get("Franchise Lead Data Completeness")

            franchise_analysis = dash1.get("Franchise Opportunity Analysis")

            dash2 = ai_json.get("Dashboard2_EstimatedNPS_CSAT", {})

            cust_obj = ai_json.get("CustomerObjections", {})
            cust_dis = ai_json.get("CustomerDisinterest", {})
            agent_reb = ai_json.get("AgentRebuttals", {})

            obj = ai_json.get("ObjectionAnalysis", {})

            cust_obj_cat = obj.get("Customer Objection Category")
            cust_obj_sub = obj.get("Customer Objection SubCategory")
            agent_reb_cat = obj.get("Agent Rebuttal Category")
            agent_reb_sub = obj.get("Agent Rebuttal SubCategory")

            objection_count = obj.get("ObjectionCount", 0)
            resolved_pct = clean_percentage(obj.get("ResolvedObjectionPerc"))

            conversion_after_rebuttal = 1 if obj.get("ConversionAfterRebuttal") in ["Yes", True] else 0

            rebuttal_done = any(agent_reb.values())

            opening = ai_json.get("OpeningPitchAnalysis", {})

            opening_style = opening.get("Franchise Opening Pitch Style")

            context = ai_json.get("ContextSettingAnalysis", {})

            context_type = context.get("Franchise Context Setting Type")
            skipped_context = context.get("Skipped Context Setting")

            offer = ai_json.get("OfferedPitchAnalysis", {})

            offer_lead_pct = offer.get("Lead Qualification % by Offer Type")
            offer_engaged = offer.get("Engaged Prospects by Offer Type")
            offer_deals = offer.get("Franchise Deals Closed (Sales Team)")
            offer_conv_pct = offer.get("Franchise Conversion % by Offer Type")

            offer_type = offer.get("Franchise Offer Type")
            no_discount = offer.get("No Offer/Discount Provided") == "Yes"

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
                    
                    CustomerDisinterest_JSON,
                    CustomerObjections_JSON,
                    AgentRebuttals_JSON,

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
                    
                    Lead_Qualification_Pct_by_Offer_Type,
                    Engaged_Prospects_by_Offer_Type,
                    Franchise_Deals_Closed_Sales_Team,
                    Franchise_Conversion_Pct_by_Offer_Type,

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
                    
                    %(CustomerDisinterest_JSON)s,
                    %(CustomerObjections_JSON)s,
                    %(AgentRebuttals_JSON)s,

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
                    
                    %(Lead_Qualification_Pct_by_Offer_Type)s,
                    %(Engaged_Prospects_by_Offer_Type)s,
                    %(Franchise_Deals_Closed_Sales_Team)s,
                    %(Franchise_Conversion_Pct_by_Offer_Type)s,

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
                "Fabonow_Total_Connected": fab_total_connected,
                "Fabonow_Total_Interested": fab_total_interested,
                "Fabonow_Not_Interested": fab_not_interested,
                "Fabonow_Brochure_Proposal_Discussed": fab_brochure,
                "Fabonow_Conversion": fab_conversion,

                "CustomerDisinterest_JSON": json.dumps(cust_dis),
                "CustomerObjections_JSON": json.dumps(cust_obj),
                "AgentRebuttals_JSON": json.dumps(agent_reb),

                # Franchise
                "Franchise_Opportunity_Analysis": franchise_analysis,
                "Workable_vs_NonWorkable": workable_status,
                "Reason_for_Missed_Franchise_Signup": reason_missed,
                "Detailed_Franchise_Objection_Split_JSON": json.dumps({
                    "customer_objections": cust_obj,
                    "customer_disinterest": cust_dis
                }),
                "Franchise_Lead_Data_Completeness": str(customer_details),

                # NPS / Sentiment (not present → None)
                "Franchise_Prospect_Loyalty": dash2.get("Franchise Prospect Loyalty"),
                "Franchise_Pitch_Satisfaction": dash2.get("Franchise Pitch Satisfaction"),
                "Franchise_Prospect_Sentiment": dash2.get("Franchise Prospect Sentiment"),
                "Daily_Franchise_Call_Feedback_Summary": dash2.get("Daily Franchise Call Feedback Summary"),
                "Franchise_Prospect_Sentiment_Trend": dash2.get("Franchise Prospect Sentiment Trend"),


                # Opening pitch
                "Franchise_Opening_Pitch_Style": opening_style,
                "Qualified_Leads_Generated_Isha": crt_total_interested,
                "Lead_Qualification_Pct": yes_to_pct(crt_total_interested),
                "Prospects_Engaged": crt_total_connected,
                "Engagement_Pct": yes_to_pct(crt_total_connected),

                # Context
                "Franchise_Context_Setting_Type": context_type,
                "Prospect_Feedback_Before_Franchise_Offer": context.get("Prospect Feedback Before Franchise Offer"),
                "Combined_Franchise_Pitch": context.get("Combined Franchise Pitch"),
                "Skipped_Context_Setting": skipped_context,

                # Offer
                "Franchise_Offer_Type": offer_type,
                "No_Offer_or_Discount_Provided": no_discount,
                "Qualified_Leads_from_This_Pitch": crt_total_interested,

                "Lead_Qualification_Pct_by_Offer_Type": offer_lead_pct,
                "Engaged_Prospects_by_Offer_Type": offer_engaged,
                "Franchise_Deals_Closed_Sales_Team": offer_deals,
                "Franchise_Conversion_Pct_by_Offer_Type": offer_conv_pct,

                # Objections
                "Customer_Objection_Category": cust_obj_cat,
                "Customer_Objection_SubCategory": cust_obj_sub,
                "Agent_Rebuttal_Category": agent_reb_cat,
                "Agent_Rebuttal_SubCategory": agent_reb_sub,
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
