import time
import mysql.connector
import logging
import os
import requests
import json
import re
from openai import OpenAI

# ---------- CONFIG ----------
DEEPGRAM_API_KEY = "7a63c6640bac02d846e02fafde98099e22150cd3"
OPENAI_API_KEY = "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"
client = OpenAI(api_key=OPENAI_API_KEY)

DB_CONFIG = {
    "host": "192.168.11.243",
    "user": "root",
    "password": "vicidialnow",
    "database": "dialdesk_callmaster"
}

logging.basicConfig(level=logging.INFO)


def deepgram_transcribe(audio_url: str):
    try:
        headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}"}
        params = {"punctuate": "true", "model": "nova", "language": "hi-Latn"}

        audio_data = requests.get(audio_url).content
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
            messages=[{"role": "user", "content": prompt}],
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


# ---------- WORKER LOOP ----------
def worker_loop():
    while True:

        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor(dictionary=True)

        # Pick only NEW calls that are not inserted already
        cur.execute("""
            SELECT * FROM call_log
            WHERE processed = 0
            AND lead_id IS NOT NULL
            ORDER BY id ASC
            LIMIT 1
        """)

        call = cur.fetchone()

        if not call:
            logging.info("No new calls found... sleeping 10 seconds.")
            time.sleep(10)
            continue

        call_id = call["id"]
        lead_id = call["lead_id"]
        logging.info(f"Processing call_id={call_id}, lead_id={lead_id}")

        try:
            # Get prompt
            cur.execute(
                "SELECT prompt_text FROM prompts WHERE client_id = %s AND is_active = 1",
                (call["Client_id"],)
            )
            prompt_row = cur.fetchone()
            if not prompt_row:
                logging.error("No prompt found. Skipping call...")
                continue

            base_prompt = prompt_row["prompt_text"]

            # Transcription
            transcription = deepgram_transcribe(call["file_url"])
            if not transcription:
                logging.error("Empty transcription. Marking dummy entry & skipping.")
                # Prevent infinite loop by inserting a placeholder row
                try:
                    cur.execute("""
                            INSERT INTO bot_tagging (
                                lead_id, ClientId, MobileNo, User, Campaign, CallDate, length_in_sec, Transcribe_Text
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (lead_id, call["Client_id"], call["MobileNo"], call["user"], call["campaign_id"], call["call_date"], call["length_in_sec"], ""))
                    conn.commit()
                    logging.info(f"Dummy row inserted for lead_id={lead_id}")

                    cur.execute("UPDATE call_log SET processed = 1 WHERE id = %s", (call_id,))
                    conn.commit()
                    logging.info(f"Marked call_id={call_id} processed (empty transcription)")

                except Exception as e:
                    logging.error(f"Failed to insert dummy row: {str(e)}")
                    conn.rollback()

                continue

            # Send to GPT
            full_prompt = f"{base_prompt}\n\n**Conversation**:\n{transcription}"
            gpt_raw = send_to_gpt(full_prompt)

            try:
                gpt_json = json.loads(gpt_raw)
            except:
                logging.error("GPT returned invalid JSON. Skipping...")
                continue

            classification = gpt_json.get("classification", {})
            quality = gpt_json.get("quality_parameters", {})
            sentiment = gpt_json.get("sentiment_analysis", {})
            competitor = gpt_json.get("competitor_analysis", {})
            fraud = gpt_json.get("fraud_metrics", {})
            fraud_conv = gpt_json.get("fraud_metrics_conversation", {})

            # ---------- PROCESS AREAS_FOR_IMPROVEMENT ----------
            raw_improv = gpt_json.get("areas_for_improvement", [])
            only_text = []
            for item in raw_improv:
                if " - " in item:
                    only_text.append(item.split(" - ", 1)[1].strip())
                else:
                    only_text.append(item.strip())
            areas_improvement_final = ", ".join(only_text)

            qp_clean = clean_percentage(quality.get("quality_percentage"))

            # Prepare INSERT params
            params = {
                "ClientId": call["Client_id"],
                "MobileNo": call["MobileNo"],
                "CallDate": call["call_date"],
                "User": call["user"],
                "lead_id": lead_id,
                "Campaign": call["campaign_id"],

                "scenario": classification.get("scenario"),
                "scenario1": classification.get("scenario1"),
                "scenario2": classification.get("scenario2"),
                "scenario3": classification.get("scenario3"),

                "Name": classification.get("Customer Name"),
                "Contact": classification.get("Contact Number"),
                "City": classification.get("City"),
                "State": classification.get("State"),
                "Pincode": classification.get("Pin code"),
                "Remarks": classification.get("Remarks"),

                "Transcribe_Text": transcription,
                "quality_percentage": qp_clean,
                "ranking": gpt_json.get("ranking"),
                "areas_for_improvement": areas_improvement_final,

                "sensetive_word": gpt_json.get("sensitive_word"),
                "sensitive_word_context": gpt_json.get("sensitive_word_context"),

                "top_positive_words": ', '.join(sentiment.get("top_positive_words", [])),
                "top_negative_words": ', '.join(sentiment.get("top_negative_words", [])),

                "top_positive_words_agent": ', '.join(sentiment.get("top_positive_words_agent", [])),
                "top_negative_words_agent": ', '.join(sentiment.get("top_negative_words_agent", [])),

                "agent_english_cuss_words": ', '.join(sentiment.get("cuss_words", {}).get("agent", {}).get("english", {}).get("list", [])),
                "agent_english_cuss_count": sentiment.get("cuss_words", {}).get("agent", {}).get("english", {}).get("count", 0),
                "agent_hindi_cuss_words": ', '.join(sentiment.get("cuss_words", {}).get("agent", {}).get("hindi", {}).get("list", [])),
                "agent_hindi_cuss_count": sentiment.get("cuss_words", {}).get("agent", {}).get("hindi", {}).get("count", 0),

                "customer_english_cuss_words": ', '.join(sentiment.get("cuss_words", {}).get("customer", {}).get("english", {}).get("list", [])),
                "customer_english_cuss_count": sentiment.get("cuss_words", {}).get("customer", {}).get("english", {}).get("count", 0),
                "customer_hindi_cuss_words": ', '.join(sentiment.get("cuss_words", {}).get("customer", {}).get("hindi", {}).get("list", [])),
                "customer_hindi_cuss_count": sentiment.get("cuss_words", {}).get("customer", {}).get("hindi", {}).get("count", 0),

                "Competitor_Name": competitor.get("Competitor Name"),
                "Positive_Comparison": competitor.get("Positive Comparison"),
                "Reason_for_Positive_Comparison": competitor.get("Reason for Positive Comparison"),
                "Exact_Positive_Language": competitor.get("Exact Positive Language"),

                "Negative_Comparison": competitor.get("Negative Comparison"),
                "Reason_for_Negative_Comparison": competitor.get("Reason for Negative Comparison"),
                "Exact_Negative_Language": competitor.get("Exact Negative Language"),

                "data_theft_or_misuse": fraud.get("Data Theft or Misuse"),
                "unprofessional_behavior": fraud.get("Unprofessional Behavior"),
                "system_manipulation": fraud.get("System Manipulation"),
                "financial_fraud": fraud.get("Financial Fraud"),
                "escalation_failure": fraud.get("Escalation Failure"),
                "collusion": fraud.get("Collusion"),
                "policy_communication_failure": fraud.get("Policy Communication Failure"),

                "areas_for_improvement_fraud": fraud.get("Areas for Improvement"),

                "Data_Theft_or_Misuse_Text": fraud_conv.get("Data Theft or Misuse Text"),
                "Unprofessional_Behavior_Text": fraud_conv.get("Unprofessional Behavior Text"),
                "System_Manipulation_Text": fraud_conv.get("System Manipulation Text"),
                "Financial_Fraud_Text": fraud_conv.get("Financial Fraud Text"),
                "Escalation_Failure_Text": fraud_conv.get("Escalation Failure Text"),
                "Collusion_Text": fraud_conv.get("Collusion Text"),
                "Policy_Communication_Failure_Text": fraud_conv.get("Policy Communication Failure Text"),

                "total_score": quality.get("total_score"),
                "max_score": quality.get("max_score"),
                "length_in_sec": call["length_in_sec"],

                "field1": quality.get("Did the agent follow the correct opening?"),
                "field2": quality.get("Did the agent maintain professionalism without rude behavior?"),
                "field3": quality.get("Did the agent use phrases that provide assurance or express appreciation?"),
                "field4": quality.get("Did the agent express empathy using keywords?"),
                "field5": quality.get("Did the agent use correct pronunciation and maintain clarity?"),
                "field6": quality.get("Did the agent speak with appropriate enthusiasm without fumbling?"),
                "field7": quality.get("Did the agent actively listen without unnecessary interruptions?"),
                "field8": quality.get("Was the agent polite and free of sarcasm?"),
                "field9": quality.get("Did the agent use proper grammar?"),
                "field10": quality.get("Did the agent accurately probe to understand the issue?"),
                "field11": quality.get("Did the agent inform the customer before placing them on hold using appropriate phrases?"),
                "field12": quality.get("Did the agent thank the customer for being on line after retrieving the call?"),
                "field13": quality.get("Was the customer informed about the exact steps being taken?"),
                "field14": quality.get("Did the agent clearly state timelines for resolution?"),
                "field15": quality.get("Did the agent provide a proper closure, including asking if the customer has further concerns?"),

                "professionalism_maintained": quality.get("Did the agent maintain professionalism without rude behavior?"),
                "assurance_or_appreciation_provided": quality.get("Did the agent use phrases that provide assurance or express appreciation?"),
                "pronunciation_and_clarity": quality.get("Did the agent use correct pronunciation and maintain clarity?"),
                "enthusiasm_and_no_fumbling": quality.get("Did the agent speak with appropriate enthusiasm without fumbling?"),
                "politeness_and_no_sarcasm": quality.get("Was the agent polite and free of sarcasm?"),
                "proper_grammar": quality.get("Did the agent use proper grammar?"),
                "accurate_issue_probing": quality.get("Did the agent accurately probe to understand the issue?"),
                "proper_hold_procedure": quality.get("Did the agent inform the customer before placing them on hold using appropriate phrases?"),
                "proper_transfer_and_language": quality.get("Did the agent clearly state timelines for resolution?"),
                "address_recorded_completely": quality.get("Did the agent actively listen without unnecessary interruptions?"),
                "correct_and_complete_information": quality.get("Was the customer informed about the exact steps being taken?"),
                "proper_call_closure": quality.get("Did the agent provide a proper closure, including asking if the customer has further concerns?"),
                "express_empathy": quality.get("Did the agent express empathy using keywords?")
            }

            # ---- INSERT INTO DB ----
            placeholders = ", ".join([f"%({k})s" for k in params.keys()])
            columns = ", ".join(params.keys())

            final_sql = f"INSERT INTO bot_tagging ({columns}) VALUES ({placeholders})"
            cur.execute(final_sql, params)
            conn.commit()

            logging.info(f"Inserted bot_tagging record for lead_id={lead_id}")

            # Mark call_log as processed
            cur.execute("UPDATE call_log SET processed = 1 WHERE id = %s", (call_id,))
            conn.commit()
            logging.info(f"Marked call_id={call_id} processed")

        except Exception as e:
            logging.error(f"Error processing call {call_id}: {str(e)}")
            conn.rollback()

        finally:
            cur.close()
            conn.close()

        time.sleep(2)  # short pause before next call


if __name__ == "__main__":
    logging.info("Worker Started...")
    worker_loop()
