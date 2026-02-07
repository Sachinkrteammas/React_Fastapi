import time
import logging
import mysql.connector
from mysql.connector import Error

# ==========================
# LOGGING
# ==========================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# ==========================
# DB CONFIGS
# ==========================
main_db_config = {
    "host": "192.168.11.243",
    "database": "dialdesk_callmaster",
    "user": "root",
    "password": "vicidialnow"
}

asterisk_db_config = {
    "host": "192.168.10.5",
    "database": "asterisk",
    "user": "root",
    "password": "vicidialnow"
}


def get_connection(cfg):
    return mysql.connector.connect(**cfg)


def sync_calls():
    try:
        # ==========================
        # MAIN DB
        # ==========================
        main_conn = get_connection(main_db_config)
        main_cursor = main_conn.cursor(dictionary=True)

        # ==========================
        # GET CLIENT + CAMPAIGN IDS
        # ==========================
        main_cursor.execute("""
            SELECT DISTINCT clientid, campaignid
            FROM users
            WHERE clientid IS NOT NULL
              AND campaignid IS NOT NULL
        """)
        clients = main_cursor.fetchall()

        logging.info(f"Clients found: {len(clients)}")

        # ==========================
        # LOOP CLIENTS
        # ==========================
        for row in clients:
            client_id = row["clientid"]

            raw_campaigns = row["campaignid"]
            campaign_ids = ",".join(
                f"'{c.strip()}'"
                for c in raw_campaigns.split(",")
                if c.strip()
            )

            if not campaign_ids:
                continue

            logging.info(f"Client {client_id} campaigns: {campaign_ids}")

            # ==========================
            # GET MAX CALL DATE
            # ==========================
            main_cursor.execute("""
                SELECT MAX(call_date) AS max_date
                FROM call_log
                WHERE Client_id = %s
            """, (client_id,))

            max_row = main_cursor.fetchone()
            max_call_date = max_row["max_date"] or "2025-08-27 00:00:00"

            # ==========================
            # ASTERISK DB
            # ==========================
            ast_conn = get_connection(asterisk_db_config)
            ast_cursor = ast_conn.cursor(dictionary=True)

            # ==========================
            # ASTERISK QUERY (UNCHANGED)
            # ==========================
            asterisk_sql = f"""
                SELECT
                    vc.campaign_id,
                    %s AS Client_id,
                    RIGHT(vc.phone_number, 10) AS MobileNo,
                    vc.user,
                    REPLACE(
                        r.location,
                        'http://192.168.10.8/RECORDINGS/MP3/',
                        CONCAT(
                            'http://192.168.10.3/192_168_10_8/',
                            DATE_FORMAT(DATE(vc.call_date), '%Y%m%d'),
                            '/'
                        )
                    ) AS file_url,
                    vc.call_date,
                    vc.lead_id,
                    vc.length_in_sec
                FROM vicidial_closer_log vc
                LEFT JOIN recording_log r
                    ON vc.lead_id = r.lead_id
                   AND DATE(vc.call_date) = DATE(r.start_time)
                WHERE vc.campaign_id IN ({campaign_ids})
                  AND vc.call_date > %s
                  AND vc.call_date <= DATE_SUB(NOW(), INTERVAL 20 MINUTE)
                  AND vc.user != 'VDCL'
            """

            ast_cursor.execute(asterisk_sql, (client_id, max_call_date))
            calls = ast_cursor.fetchall()

            logging.info(f"Client {client_id} → Calls found: {len(calls)}")

            # ==========================
            # INSERT INTO MAIN DB
            # ==========================
            if calls:
                insert_sql = """
                    INSERT INTO call_log
                    (Client_id, campaign_id, MobileNo, user,
                     call_date, file_url, lead_id, length_in_sec, create_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """

                for call in calls:
                    main_cursor.execute(insert_sql, (
                        call["Client_id"],
                        call["campaign_id"],
                        call["MobileNo"],
                        call["user"],
                        call["call_date"],
                        call["file_url"],
                        call["lead_id"],
                        call["length_in_sec"],
                    ))

                main_conn.commit()
                logging.info(f"Inserted {len(calls)} rows for client {client_id}")

            ast_cursor.close()
            ast_conn.close()

        main_cursor.close()
        main_conn.close()

    except Error as e:
        logging.error(f"DB ERROR: {e}")
    except Exception as e:
        logging.error(f"ERROR: {e}")


# ==========================
# PERMANENT RUNNER
# ==========================
if __name__ == "__main__":
    logging.info("📞 Call Sync Worker Started")

    while True:
        sync_calls()
        time.sleep(60)   # 🔁 RUN EVERY 1 MINUTE
