from fastapi import APIRouter, Depends, Query, HTTPException, Body, Request, UploadFile, Form
from sqlalchemy.orm import Session, sessionmaker
from datetime import date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.sql import text
import json
from typing import Dict, Any
import os
import re
import subprocess
from datetime import datetime
from deepgram import Deepgram
from openai import OpenAI
import uuid


SQL_DB_URL = "mysql+pymysql://root:vicidialnow@192.168.11.243:3306/dialdesk_callmaster?charset=utf8mb4"
engine = create_engine(SQL_DB_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()


DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


@router.get("/franchise-call-summary")
def get_franchise_call_summary(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    query = text("""
    SELECT
        -- CRT – Isha to Manage
        COALESCE(SUM(CASE WHEN CRT_Isha_Total_Connected = 'Yes' THEN 1 ELSE 0 END), 0) AS CRT_Isha_Total_Connected,
        COALESCE(SUM(CASE WHEN CRT_Isha_Total_Interested = 'Yes' THEN 1 ELSE 0 END), 0) AS CRT_Isha_Total_Interested,
        COALESCE(SUM(CASE WHEN CRT_Isha_Asked_for_Details_WhatsApp = 'Yes' THEN 1 ELSE 0 END), 0) AS CRT_Isha_Asked_for_Details_WhatsApp,
        COALESCE(SUM(CASE WHEN CRT_Isha_Meeting_Scheduled = 'Yes' THEN 1 ELSE 0 END), 0) AS CRT_Isha_Meeting_Scheduled,
        COALESCE(SUM(CASE WHEN CRT_Isha_Not_Interested = 'Yes' THEN 1 ELSE 0 END), 0) AS CRT_Isha_Not_Interested,
        COALESCE(SUM(CASE WHEN CRT_Isha_Meeting_Schedule_CRM = 'Yes' THEN 1 ELSE 0 END), 0) AS CRT_Isha_Meeting_Schedule_CRM,

        -- Fabonow Team – CRT
        COALESCE(SUM(CASE WHEN Fabonow_Total_Connected = 'Yes' THEN 1 ELSE 0 END), 0) AS Fabonow_Total_Connected,
        COALESCE(SUM(CASE WHEN Fabonow_Total_Interested = 'Yes' THEN 1 ELSE 0 END), 0) AS Fabonow_Total_Interested,
        COALESCE(SUM(CASE WHEN Fabonow_Not_Interested = 'Yes' THEN 1 ELSE 0 END), 0) AS Fabonow_Not_Interested,
        COALESCE(SUM(CASE WHEN Fabonow_Brochure_Proposal_Discussed = 'Yes' THEN 1 ELSE 0 END), 0) AS Fabonow_Brochure_Proposal_Discussed,
        COALESCE(SUM(CASE WHEN Fabonow_Conversion = 'Yes' THEN 1 ELSE 0 END), 0) AS Fabonow_Conversion
    FROM fabonow_calls
    WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
    """)

    result = db.execute(query, {"start_date": start_date, "end_date": end_date}).mappings().first()

    return {
        "CRT_Isha_to_Manage": {
            "Total_Connected": result["CRT_Isha_Total_Connected"],
            "Total_Interested": result["CRT_Isha_Total_Interested"],
            "Asked_for_Details_WhatsApp": result["CRT_Isha_Asked_for_Details_WhatsApp"],
            "Meeting_Scheduled": result["CRT_Isha_Meeting_Scheduled"],
            "Not_Interested": result["CRT_Isha_Not_Interested"],
            "Meeting_Schedule_CRM": result["CRT_Isha_Meeting_Schedule_CRM"],
        },
        "Fabonow_Team_CRT": {
            "Total_Connected": result["Fabonow_Total_Connected"],
            "Total_Interested": result["Fabonow_Total_Interested"],
            "Not_Interested": result["Fabonow_Not_Interested"],
            "Brochure_Proposal_Discussed": result["Fabonow_Brochure_Proposal_Discussed"],
            "Conversion": result["Fabonow_Conversion"],
        }
    }



@router.get("/franchise-call-breakdown")
def get_franchise_call_breakdown(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    query = text("""
    SELECT
        -- Success Call Breakdown
        COALESCE(SUM(CASE WHEN Franchise_Offer_Type = 'Standard' THEN 1 ELSE 0 END), 0) AS Offer_Accepted,
        COALESCE(SUM(CASE WHEN Customer_Objection_Category = 'Financial' AND ResolvedObjectionPerc = 100 THEN 1 ELSE 0 END), 0) AS Budget_OK,
        COALESCE(SUM(CASE WHEN Fabonow_Brochure_Proposal_Discussed = 'Yes' THEN 1 ELSE 0 END), 0) AS Docs_Shared,
        COALESCE(SUM(CASE WHEN CRT_Isha_Meeting_Scheduled = 'Yes' OR CRT_Isha_Meeting_Schedule_CRM = 'Yes' THEN 1 ELSE 0 END), 0) AS Meeting_Fixed,
        COALESCE(SUM(CASE WHEN Fabonow_Conversion = 'Yes' THEN 1 ELSE 0 END), 0) AS Converted_on_Call,

        -- Reject Call Breakdown
        COALESCE(SUM(CASE WHEN Customer_Objection_Category = 'Financial' THEN 1 ELSE 0 END), 0) AS Investment_Concern,
        COALESCE(SUM(CASE WHEN Customer_Objection_Category = 'Brand' THEN 1 ELSE 0 END), 0) AS Trust_Issue,
        COALESCE(SUM(CASE WHEN Customer_Objection_Category = 'Operational' THEN 1 ELSE 0 END), 0) AS Language_Barrier,
        COALESCE(SUM(CASE WHEN Customer_Objection_Category = 'None' THEN 1 ELSE 0 END), 0) AS Wrong_Number
    FROM fabonow_calls
    WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
    """)

    result = db.execute(query, {"start_date": start_date, "end_date": end_date}).mappings().first()

    return {
        "Success_Call_Breakdown": {
            "Offer_Accepted": result["Offer_Accepted"],
            "Budget_OK": result["Budget_OK"],
            "Docs_Shared": result["Docs_Shared"],
            "Meeting_Fixed": result["Meeting_Fixed"],
            "Converted_on_Call": result["Converted_on_Call"],
        },
        "Reject_Call_Breakdown": {
            "Investment_Concern": result["Investment_Concern"],
            "Trust_Issue": result["Trust_Issue"],
            "Language_Barrier": result["Language_Barrier"],
            "Wrong_Number": result["Wrong_Number"],
        }
    }




@router.get("/franchise-opportunity-analysis")
def get_franchise_opportunity_analysis(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    query = text("""
    SELECT
        -- ✅ Total Franchise Leads
        COUNT(*) AS Total_Leads,

        -- 1. Opportunity Analysis (enum: Missed / Workable / None)
        SUM(CASE WHEN Franchise_Opportunity_Analysis = 'Workable' THEN 1 ELSE 0 END) AS Workable_Leads,
        SUM(CASE WHEN Franchise_Opportunity_Analysis = 'Missed' THEN 1 ELSE 0 END) AS Missed_Conversions,
        SUM(CASE WHEN Franchise_Opportunity_Analysis = 'None' THEN 1 ELSE 0 END) AS None_Leads,

        -- 2. Workable vs Non-Workable
        SUM(CASE WHEN Franchise_Opportunity_Analysis = 'Workable' THEN 1 ELSE 0 END) AS Workable_Count,
        SUM(CASE WHEN Franchise_Opportunity_Analysis IN ('Missed','None') THEN 1 ELSE 0 END) AS NonWorkable_Count,

        -- 3. Reason for Missed Franchise Signup
        SUM(CASE WHEN Reason_for_Missed_Franchise_Signup LIKE '%Location%' THEN 1 ELSE 0 END) AS Location_Issue,
        SUM(CASE WHEN Reason_for_Missed_Franchise_Signup LIKE '%Language%' THEN 1 ELSE 0 END) AS Language_Barrier,
        SUM(CASE WHEN Reason_for_Missed_Franchise_Signup LIKE '%Investment%' THEN 1 ELSE 0 END) AS Investment_Concern,
        SUM(CASE WHEN Reason_for_Missed_Franchise_Signup LIKE '%Network%' THEN 1 ELSE 0 END) AS Network_Issue,
        SUM(CASE WHEN Reason_for_Missed_Franchise_Signup LIKE '%General%' THEN 1 ELSE 0 END) AS General_Disinterest,

        -- 4. Detailed Franchise Objection Split (JSON column, pick latest available)
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(Detailed_Franchise_Objection_Split_JSON, '$."Brand"')) AS UNSIGNED)) AS Brand_Objections,
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(Detailed_Franchise_Objection_Split_JSON, '$."Location"')) AS UNSIGNED)) AS Location_Objections,
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(Detailed_Franchise_Objection_Split_JSON, '$."Financial"')) AS UNSIGNED)) AS Financial_Objections,
        SUM(CAST(JSON_UNQUOTE(JSON_EXTRACT(Detailed_Franchise_Objection_Split_JSON, '$."Operational"')) AS UNSIGNED)) AS Operational_Objections,

        -- 5. Franchise Lead Data Completeness
        SUM(CASE WHEN Franchise_Lead_Data_Completeness = 'Complete' THEN 1 ELSE 0 END) AS Complete_Leads,
        SUM(CASE WHEN Franchise_Lead_Data_Completeness = 'Incomplete' THEN 1 ELSE 0 END) AS Incomplete_Leads,
        SUM(CASE WHEN Franchise_Lead_Data_Completeness = 'None' THEN 1 ELSE 0 END) AS None_Leads

    FROM fabonow_calls
    WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
    """)

    result = db.execute(query, {"start_date": start_date, "end_date": end_date}).mappings().first()

    return {
        "Opportunity_Analysis_Franchise": {
            "Total_Leads": result["Total_Leads"],
            "Workable_Leads": result["Workable_Leads"],
            "Missed_Conversions": result["Missed_Conversions"],
            "None_Leads": result["None_Leads"],
        },
        "Workable_vs_NonWorkable": {
            "Workable": result["Workable_Count"],
            "NonWorkable": result["NonWorkable_Count"],
        },
        "Reason_for_Missed_Franchise_Signup": {
            "Location_Issue": result["Location_Issue"],
            "Language_Barrier": result["Language_Barrier"],
            "Investment_Concern": result["Investment_Concern"],
            "Network_Issue": result["Network_Issue"],
            "General_Disinterest": result["General_Disinterest"],
        },
        "Detailed_Franchise_Objection_Split": {
            "Brand": result["Brand_Objections"],
            "Location": result["Location_Objections"],
            "Financial": result["Financial_Objections"],
            "Operational": result["Operational_Objections"],
        },
        "Franchise_Lead_Data_Completeness": {
            "Complete_Leads": result["Complete_Leads"],
            "Incomplete_Leads": result["Incomplete_Leads"],
            "None_Leads": result["None_Leads"],
        }
    }



@router.get("/franchise-feedback-metrics")
def franchise_feedback_metrics(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    # 1. Franchise Prospect Loyalty (NPS)
    nps_sql = text("""
        SELECT
            SUM(CASE WHEN Franchise_Prospect_Loyalty = 'High' THEN 1 ELSE 0 END) AS promoters,
            SUM(CASE WHEN Franchise_Prospect_Loyalty = 'Neutral' THEN 1 ELSE 0 END) AS passives,
            SUM(CASE WHEN Franchise_Prospect_Loyalty = 'Low' THEN 1 ELSE 0 END) AS detractors,
            COUNT(*) AS total_responses
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
    """)
    nps_result = db.execute(nps_sql, {"start_date": start_date, "end_date": end_date}).mappings().first()

    promoters = nps_result["promoters"] or 0
    passives = nps_result["passives"] or 0
    detractors = nps_result["detractors"] or 0
    total_responses = nps_result["total_responses"] or 0
    nps_score = ((promoters - detractors) / total_responses * 100) if total_responses > 0 else 0

    # 2. Franchise Pitch Satisfaction (CSAT)
    csat_sql = text("""
        SELECT
            SUM(CASE WHEN Franchise_Pitch_Satisfaction = 'Positive' THEN 1 ELSE 0 END) AS positive,
            SUM(CASE WHEN Franchise_Pitch_Satisfaction = 'Neutral' THEN 1 ELSE 0 END) AS neutral,
            SUM(CASE WHEN Franchise_Pitch_Satisfaction = 'Negative' THEN 1 ELSE 0 END) AS negative,
            COUNT(*) AS total_responses
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
    """)
    csat_result = db.execute(csat_sql, {"start_date": start_date, "end_date": end_date}).mappings().first()

    positive = csat_result["positive"] or 0
    neutral = csat_result["neutral"] or 0
    negative = csat_result["negative"] or 0
    csat_total = csat_result["total_responses"] or 0
    csat_score = (positive / csat_total * 100) if csat_total > 0 else 0

    # 3. Franchise Prospect Sentiment
    sentiment_sql = text("""
        SELECT
            SUM(CASE WHEN Franchise_Prospect_Sentiment = 'Positive' THEN 1 ELSE 0 END) AS positive,
            SUM(CASE WHEN Franchise_Prospect_Sentiment = 'Neutral' THEN 1 ELSE 0 END) AS neutral,
            SUM(CASE WHEN Franchise_Prospect_Sentiment = 'Negative' THEN 1 ELSE 0 END) AS negative
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
    """)
    sentiment_result = db.execute(sentiment_sql, {"start_date": start_date, "end_date": end_date}).mappings().first()

    # 4. Daily Franchise Call Feedback Summary (text notes per day)
    feedback_sql = text("""
        SELECT
            DATE(occurred_at) AS call_date,
            GROUP_CONCAT(DISTINCT  Daily_Franchise_Call_Feedback_Summary SEPARATOR '; ') AS feedback_summary
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
        GROUP BY DATE(occurred_at)
        ORDER BY call_date ASC
    """)
    feedback_rows = db.execute(feedback_sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    daily_summary = [
        {
            "date": str(row["call_date"]),
            "feedback_summary": row["feedback_summary"] or ""
        }
        for row in feedback_rows
    ]

    # 5. Franchise Prospect Sentiment Trend (day-wise)
    trend_sql = text("""
        SELECT
            DATE(occurred_at) AS call_date,
            SUM(CASE WHEN Franchise_Prospect_Sentiment_Trend = 'Improving' THEN 1 ELSE 0 END) AS improving,
            SUM(CASE WHEN Franchise_Prospect_Sentiment_Trend = 'Worsening' THEN 1 ELSE 0 END) AS worsening,
            SUM(CASE WHEN Franchise_Prospect_Sentiment_Trend = 'Stable' THEN 1 ELSE 0 END) AS stable,
            SUM(CASE WHEN Franchise_Prospect_Sentiment_Trend = 'None' THEN 1 ELSE 0 END) AS none_count
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
        GROUP BY DATE(occurred_at)
        ORDER BY call_date ASC
    """)
    trend_rows = db.execute(trend_sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    day_wise_trend = [
        {
            "date": str(row["call_date"]),
            "Improving": row["improving"] or 0,
            "Worsening": row["worsening"] or 0,
            "Stable": row["stable"] or 0,
            "None": row["none_count"] or 0,
        }
        for row in trend_rows
    ]

    return {
        "Franchise_Prospect_Loyalty_NPS": {
            "promoters": promoters,
            "passives": passives,
            "detractors": detractors,
            "total_responses": total_responses,
            "nps_score": round(nps_score, 2)
        },
        "Franchise_Pitch_Satisfaction_CSAT": {
            "positive": positive,
            "neutral": neutral,
            "negative": negative,
            "total_responses": csat_total,
            "csat_score": round(csat_score, 2)
        },
        "Franchise_Prospect_Sentiment": {
            "positive": sentiment_result["positive"] or 0,
            "neutral": sentiment_result["neutral"] or 0,
            "negative": sentiment_result["negative"] or 0
        },
        "Daily_Franchise_Call_Feedback_Summary": daily_summary,
        "Franchise_Prospect_Sentiment_Trend": day_wise_trend
    }




@router.get("/franchise-pitch-conversion-metrics")
def franchise_pitch_conversion_metrics(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT 
            Franchise_Opening_Pitch_Style,

            -- Count Yes/No for lead qualification
            SUM(CASE WHEN Qualified_Leads_Generated_Isha = 'Yes' THEN 1 ELSE 0 END) AS Qualified_Leads_Yes,
            SUM(CASE WHEN Qualified_Leads_Generated_Isha = 'No' THEN 1 ELSE 0 END) AS Qualified_Leads_No,

            -- Aggregate metrics
            COUNT(*) AS Total_Records,
            SUM(Prospects_Engaged) AS Total_Prospects_Engaged,
            SUM(Franchise_Deals_Closed_Fabonow_Sales) AS Total_Deals_Closed,

            -- Average percentages across the group
            ROUND(AVG(COALESCE(Lead_Qualification_Pct, 0)), 2) AS Avg_Lead_Qualification_Pct,
            ROUND(AVG(COALESCE(Engagement_Pct, 0)), 2) AS Avg_Engagement_Pct,
            ROUND(AVG(COALESCE(Franchise_Conversion_Pct_Fabonow_Sales, 0)), 2) AS Avg_Franchise_Conversion_Pct

        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
        GROUP BY Franchise_Opening_Pitch_Style
    """)

    rows = db.execute(sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    return {
        "Franchise_Pitch_Conversion_Metrics": [dict(row) for row in rows]
    }



@router.get("/franchise-context-metrics")
def franchise_context_metrics(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT
            Franchise_Context_Setting_Type,

            -- Count of Yes/No responses
            SUM(CASE WHEN Prospect_Feedback_Before_Franchise_Offer = 'Yes' THEN 1 ELSE 0 END) AS Prospect_Feedback_Before_Offer_Yes,
            SUM(CASE WHEN Prospect_Feedback_Before_Franchise_Offer = 'No' THEN 1 ELSE 0 END) AS Prospect_Feedback_Before_Offer_No,

            SUM(CASE WHEN Combined_Franchise_Pitch = 'Yes' THEN 1 ELSE 0 END) AS Combined_Pitch_Yes,
            SUM(CASE WHEN Combined_Franchise_Pitch = 'No' THEN 1 ELSE 0 END) AS Combined_Pitch_No,

            SUM(CASE WHEN Skipped_Context_Setting = 'Yes' THEN 1 ELSE 0 END) AS Skipped_Context_Yes,
            SUM(CASE WHEN Skipped_Context_Setting = 'No' THEN 1 ELSE 0 END) AS Skipped_Context_No,

            COUNT(*) AS Total_Records

        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
        GROUP BY Franchise_Context_Setting_Type
    """)

    rows = db.execute(sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    return {
        "Franchise_Context_Metrics": [dict(row) for row in rows]
    }




@router.get("/franchise-offer-metrics")
def franchise_offer_metrics(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    sql = text("""
        SELECT
            Franchise_Offer_Type,
            No_Offer_or_Discount_Provided,

            -- aggregate metrics
            SUM(Qualified_Leads_from_This_Pitch) AS Qualified_Leads_from_This_Pitch,
            AVG(Lead_Qualification_Pct_by_Offer_Type) AS Lead_Qualification_Pct_by_Offer_Type,
            SUM(Engaged_Prospects_by_Offer_Type) AS Engaged_Prospects_by_Offer_Type,
            SUM(Franchise_Deals_Closed_Sales_Team) AS Franchise_Deals_Closed_Sales_Team,

            -- conversion % recomputed from totals to avoid averaging percentages
            CASE 
                WHEN SUM(Engaged_Prospects_by_Offer_Type) > 0 
                THEN ROUND(
                    (SUM(Franchise_Deals_Closed_Sales_Team) / SUM(Engaged_Prospects_by_Offer_Type)) * 100, 
                    2
                )
                ELSE 0
            END AS Franchise_Conversion_Pct_by_Offer_Type

        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
        GROUP BY Franchise_Offer_Type, No_Offer_or_Discount_Provided
    """)

    rows = db.execute(sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    return {
        "Franchise_Offer_Metrics": [dict(row) for row in rows]
    }



@router.get("/franchise-objections-metrics")
def franchise_objections_metrics(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    def parse_unique_json_array(raw_json):
        """Helper: deduplicate and flatten JSON array results"""
        if not raw_json:
            return []
        try:
            items = json.loads(raw_json)
            # handle nested lists
            if isinstance(items, list):
                flat = []
                for i in items:
                    if isinstance(i, list):
                        flat.extend(i)
                    else:
                        flat.append(i)
                return list(set(flat))  # deduplicate
            return [items]
        except Exception:
            return []

    # ----------------- 1. POS Breakdown -----------------
    pos_sql = text("""
        SELECT
            Customer_Objection_Category AS category,
            JSON_ARRAYAGG(CustomerObjections_JSON) AS customer_objections,
            SUM(ObjectionCount) AS total_objections,
            AVG(ResolvedObjectionPerc) AS resolved_pct,
            100 - AVG(ResolvedObjectionPerc) AS unresolved_pct,
            AVG(ConversionAfterRebuttal) AS conversion_after_rebuttal
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
          AND Customer_Objection_Category IS NOT NULL
        GROUP BY Customer_Objection_Category
    """)
    pos_rows = db.execute(pos_sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    pos_breakdown = [
        {
            "Category": row["category"],
            "Customer_Objections_JSON": parse_unique_json_array(row["customer_objections"]),
            "Total_Objections": row["total_objections"] or 0,
            "Resolved_Percentage": round(row["resolved_pct"] or 0, 2),
            "Unresolved_Percentage": round(row["unresolved_pct"] or 0, 2),
            "Conversion_After_Rebuttal": round(row["conversion_after_rebuttal"] or 0, 2),
        }
        for row in pos_rows
    ]

    # ----------------- 2. POS Subcategory Breakdown -----------------
    subcat_sql = text("""
        SELECT
            Customer_Objection_SubCategory AS subcategory,
            JSON_ARRAYAGG(CustomerDisinterest_JSON) AS customer_disinterest,
            SUM(ObjectionCount) AS total_objections,
            AVG(ResolvedObjectionPerc) AS resolved_pct,
            100 - AVG(ResolvedObjectionPerc) AS unresolved_pct,
            AVG(ConversionAfterRebuttal) AS conversion_after_rebuttal
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
          AND Customer_Objection_SubCategory IS NOT NULL
          AND Customer_Objection_SubCategory <> ''
        GROUP BY Customer_Objection_SubCategory
    """)
    subcat_rows = db.execute(subcat_sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    subcategory_breakdown = [
        {
            "SubCategory": row["subcategory"],
            "Customer_Disinterest_JSON": parse_unique_json_array(row["customer_disinterest"]),
            "Total_Objections": row["total_objections"] or 0,
            "Resolved_Percentage": round(row["resolved_pct"] or 0, 2),
            "Unresolved_Percentage": round(row["unresolved_pct"] or 0, 2),
            "Conversion_After_Rebuttal": round(row["conversion_after_rebuttal"] or 0, 2),
        }
        for row in subcat_rows
    ]

    # ----------------- 3. Agent Rebuttals -----------------
    rebuttal_sql = text("""
        SELECT
            Agent_Rebuttal_Category AS rebuttal_category,
            JSON_ARRAYAGG(AgentRebuttals_JSON) AS agent_rebuttals,
            SUM(ObjectionCount) AS total_objections,
            AVG(ResolvedObjectionPerc) AS resolved_pct,
            100 - AVG(ResolvedObjectionPerc) AS unresolved_pct,
            AVG(ConversionAfterRebuttal) AS conversion_after_rebuttal
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
          AND Agent_Rebuttal_Category IS NOT NULL
        GROUP BY Agent_Rebuttal_Category
    """)
    rebuttal_rows = db.execute(rebuttal_sql, {"start_date": start_date, "end_date": end_date}).mappings().all()

    agent_rebuttals = [
        {
            "Rebuttal_Category": row["rebuttal_category"],
            "Agent_Rebuttals_JSON": parse_unique_json_array(row["agent_rebuttals"]),
            "Total_Objections": row["total_objections"] or 0,
            "Resolved_Percentage": round(row["resolved_pct"] or 0, 2),
            "Unresolved_Percentage": round(row["unresolved_pct"] or 0, 2),
            "Conversion_After_Rebuttal": round(row["conversion_after_rebuttal"] or 0, 2),
        }
        for row in rebuttal_rows
    ]

    return {
        "POS_Breakdown": pos_breakdown,
        "POS_Subcategory_Breakdown": subcategory_breakdown,
        "Agent_Rebuttals": agent_rebuttals
    }



@router.post("/fabonow-calls/")
async def create_fabonow_call(request: Request, db: Session = Depends(get_db)):
    try:
        payload: Dict[str, Any] = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

    if not payload:
        raise HTTPException(status_code=400, detail="Request body is empty")

    # 🔹 Convert nested dicts/lists to JSON strings
    for key, value in payload.items():
        if isinstance(value, (dict, list)):
            payload[key] = json.dumps(value)

    columns = ", ".join(payload.keys())
    placeholders = ", ".join([f":{key}" for key in payload.keys()])

    sql = text(f"""
        INSERT INTO fabonow_calls ({columns})
        VALUES ({placeholders})
    """)

    try:
        db.execute(sql, payload)
        db.commit()
        return {"message": "Call record saved successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))



ENUM_FIELDS = {
    "Franchise_Opportunity_Analysis",
    "Workable_vs_NonWorkable",
    "Franchise_Lead_Data_Completeness",
    "Franchise_Prospect_Loyalty",
    "Franchise_Pitch_Satisfaction",
    "Franchise_Prospect_Sentiment",
    "Franchise_Prospect_Sentiment_Trend",
    "Franchise_Opening_Pitch_Style",
    "Qualified_Leads_Generated_Isha",
    "Franchise_Context_Setting_Type",
    "Prospect_Feedback_Before_Franchise_Offer",
    "Combined_Franchise_Pitch",
    "Skipped_Context_Setting",
    "Franchise_Offer_Type",
    "No_Offer_or_Discount_Provided",
    "Customer_Objection_Category",
    "Agent_Rebuttal_Category",
    # … add the rest of your enum fields here
}

NUMERIC_FIELDS = {
    "Lead_Qualification_Pct",
    "Prospects_Engaged",
    "Engagement_Pct",
    "Franchise_Deals_Closed_Fabonow_Sales",
    "Franchise_Conversion_Pct_Fabonow_Sales",
    "Qualified_Leads_from_This_Pitch",
    "Lead_Qualification_Pct_by_Offer_Type",
    "Engaged_Prospects_by_Offer_Type",
    "Franchise_Deals_Closed_Sales_Team",
    "Franchise_Conversion_Pct_by_Offer_Type",
    "ObjectionCount",
    "ResolvedObjectionPerc",
    "ConversionAfterRebuttal",
    # … add more numeric fields
}

JSON_FIELDS = {
    "Detailed_Franchise_Objection_Split_JSON",
    "CustomerDisinterest_JSON",
    "CustomerObjections_JSON",
    "AgentRebuttals_JSON"
}

DB_COLUMNS = ENUM_FIELDS | NUMERIC_FIELDS | JSON_FIELDS | {
    "Reason_for_Missed_Franchise_Signup",
    "Daily_Franchise_Call_Feedback_Summary",
    "Customer_Objection_SubCategory",
    "Agent_Rebuttal_SubCategory",
}




# FFMPEG_PATH = r"C:\Users\User\ffmpeg-8.0-essentials_build\ffmpeg-8.0-essentials_build\bin\ffmpeg.exe"


# def convert_mp3_to_wav(mp3_path, wav_path):
#     subprocess.run([FFMPEG_PATH, "-y", "-i", mp3_path, wav_path])

def transcribe_with_deepgram(wav_path):
    dg = Deepgram(DEEPGRAM_API_KEY)
    with open(wav_path, "rb") as audio:
        source = {"buffer": audio, "mimetype": "audio/wav"}
        response = dg.transcription.sync_prerecorded(source, {"punctuate": True})
    return response["results"]["channels"][0]["alternatives"][0]["transcript"]

def send_to_gpt(prompt):
    client = OpenAI(api_key=OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "You are AI sales assistant. Always return valid JSON."},
            {"role": "user", "content": prompt}
        ],
    )
    return resp.choices[0].message.content


def normalize_number(value):
    """
    Converts GPT strings like '25%', ' 30 ', '4/5', '1', '0', 'N/A' → float/int.
    Returns None if invalid.
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return value

    if not isinstance(value, str):
        return None

    val = value.strip().lower()
    if val in ("none", "n/a", "na", "-", "", "null"):
        return None

    # Boolean-like numbers
    if val in ("yes", "1"):
        return 1
    if val in ("no", "0"):
        return 0

    # Percentages
    if val.endswith("%"):
        try:
            return float(val.replace("%", "").strip())
        except Exception:
            return None

    # Fractions
    if "/" in val:
        try:
            num, denom = val.split("/")
            return float(num.strip()) / float(denom.strip())
        except Exception:
            return None

    # Extract first number
    match = re.search(r"-?\d+(\.\d+)?", val)
    if match:
        num = float(match.group())
        return int(num) if num.is_integer() else num

    return None



def normalize_enum(field, value):
    """
    Map GPT text → valid DB enum values.
    """
    if value is None:
        return None
    if not isinstance(value, str):
        value = str(value)  # handle numbers

    val = value.strip().lower()

    # Standard null markers
    if val in ("", "none", "n/a", "-", "null"):
        return "None"

    # Handle Connected/Interested style enums
    if field in {
        "CRT_Isha_Total_Connected",
        "CRT_Isha_Total_Interested",
        "CRT_Isha_Asked_for_Details_WhatsApp",
        "CRT_Isha_Meeting_Scheduled",
        "CRT_Isha_Not_Interested",
        "CRT_Isha_Meeting_Schedule_CRM",
        "Fabonow_Total_Connected",
        "Fabonow_Total_Interested",
        "Fabonow_Not_Interested",
        "Fabonow_Brochure_Proposal_Discussed",
        "Fabonow_Conversion",
    }:
        if "connected" in val or "yes" in val:
            return "Yes"
        if "no" in val or "not" in val:
            return "No"
        return "None"

    # --- Special handling for Franchise_Opportunity_Analysis ---
    if field == "Franchise_Opportunity_Analysis":
        if "workable" in val:
            return "Workable"
        if "non" in val:
            return "Non-Workable"
        if "missed" in val:
            return "Missed"
        return "None"

    # --- Special handling for Workable_vs_NonWorkable ---
    if field == "Workable_vs_NonWorkable":
        if "non" in val:
            return "Non-Workable"
        if "workable" in val:
            return "Workable"
        return "None"


    ENUM_MAPS = {
        "Franchise_Lead_Data_Completeness": {
            "complete": "Complete",
            "incomplete": "Incomplete",
            "none": "None"
        },
        "Franchise_Prospect_Loyalty": {
            "high": "High",
            "neutral": "Neutral",
            "low": "Low",
            "none": "None"
        },
        "Franchise_Pitch_Satisfaction": {
            "positive": "Positive",
            "neutral": "Neutral",
            "negative": "Negative",
            "none": "None"
        },
        "Franchise_Prospect_Sentiment": {
            "positive": "Positive",
            "neutral": "Neutral",
            "negative": "Negative",
            "none": "None"
        },
        "Franchise_Prospect_Sentiment_Trend": {
            "improving": "Improving",
            "worsening": "Worsening",
            "stable": "Stable",
            "none": "None"
        },
        "Franchise_Opening_Pitch_Style": {
            "greeting": "Greeting",
            "self-introduction": "Self-Introduction",
            "company introduction": "Company Introduction",
            "none": "None"
        },
        "Qualified_Leads_Generated_Isha": {
            "yes": "Yes",
            "no": "No",
            "none": "None"
        },
        "Franchise_Context_Setting_Type": {
            "direct pitch": "Direct pitch",
            "feedback before pitch": "Feedback before pitch",
            "skipped": "None",
            "none": "None"
        },
        "Prospect_Feedback_Before_Franchise_Offer": {
            "yes": "Yes",
            "no": "No",
            "none": "None"
        },
        "Combined_Franchise_Pitch": {
            "yes": "Yes",
            "no": "No",
            "none": "None"
        },
        "Skipped_Context_Setting": {
            "yes": "Yes",
            "no": "No",
            "none": "None"
        },
        "Franchise_Offer_Type": {
            "discount": "Discount",
            "standard": "Standard",
            "incentive": "Incentive",
            "none": "None"
        },
        "No_Offer_or_Discount_Provided": {
            "yes": "Yes",
            "no": "No",
            "none": "None"
        },
        "Customer_Objection_Category": {
            "general disinterest": "Financial",
            "investment concerns": "Financial",
            "location & space challenges": "Space",
            "business risk perception": "Operational",
            "operational concerns": "Operational",
            "brand & support concerns": "Brand",
            "timing & readiness": "None",
            "none": "None"
        },
        "Agent_Rebuttal_Category": {
            "roi": "ROI",
            "location": "Location",
            "brand": "Brand",
            "support": "Support",
            "trust": "Trust",
            "trust & assurance rebuttals": "Trust",
            "none": "None"
        },
    }

    mapping = ENUM_MAPS.get(field, {})
    return mapping.get(val, value)  # fallback: store raw



def clean_col_name(key: str) -> str:
    """
    Normalize GPT keys to DB column names:
    - Replace spaces/dashes with _
    - Remove parentheses
    - Replace '%' with 'Pct'
    """
    col = key.strip()
    col = col.replace(" ", "_").replace("-", "_")
    col = col.replace("(", "").replace(")", "")
    col = col.replace("%", "Pct")
    return col


KEY_MAPPINGS = {
    # Dashboard1
    "Franchise Opportunity Analysis": "Franchise_Opportunity_Analysis",
    "Workable vs Non-Workable Franchise Leads": "Workable_vs_NonWorkable",
    "Reason for Missed Franchise Sign-up": "Reason_for_Missed_Franchise_Signup",
    "Detailed Franchise Objection Split": "Detailed_Franchise_Objection_Split_JSON",

    # Dashboard2
    "Franchise Prospect Loyalty": "Franchise_Prospect_Loyalty",
    "Franchise Pitch Satisfaction": "Franchise_Pitch_Satisfaction",
    "Franchise Prospect Sentiment": "Franchise_Prospect_Sentiment",
    "Daily Franchise Call Feedback Summary": "Daily_Franchise_Call_Feedback_Summary",
    "Franchise Prospect Sentiment Trend": "Franchise_Prospect_Sentiment_Trend",

    # Opening Pitch
    "Franchise Opening Pitch Style": "Franchise_Opening_Pitch_Style",
    "Qualified Leads Generated (Isha)": "Qualified_Leads_Generated_Isha",
    "Lead Qualification %": "Lead_Qualification_Pct",
    "Prospects Engaged": "Prospects_Engaged",
    "Engagement %": "Engagement_Pct",
    "Franchise Deals Closed (Fabonow Sales Team)": "Franchise_Deals_Closed_Fabonow_Sales",
    "Franchise Conversion % (Fabonow Sales Team)": "Franchise_Conversion_Pct_Fabonow_Sales",

    # Context Setting
    "Franchise Context Setting Type": "Franchise_Context_Setting_Type",
    "Prospect Feedback Before Franchise Offer": "Prospect_Feedback_Before_Franchise_Offer",
    "Combined Franchise Pitch": "Combined_Franchise_Pitch",
    "Skipped Context Setting": "Skipped_Context_Setting",

    # Offered Pitch
    "Franchise Offer Type": "Franchise_Offer_Type",
    "No Offer/Discount Provided": "No_Offer_or_Discount_Provided",
    "Qualified Leads from This Pitch": "Qualified_Leads_from_This_Pitch",
    "Lead Qualification % by Offer Type": "Lead_Qualification_Pct_by_Offer_Type",
    "Engaged Prospects by Offer Type": "Engaged_Prospects_by_Offer_Type",
    "Franchise Deals Closed (Sales Team)": "Franchise_Deals_Closed_Sales_Team",
    "Franchise Conversion % by Offer Type": "Franchise_Conversion_Pct_by_Offer_Type",

    # Objections
    "Customer Objection Category": "Customer_Objection_Category",
    "Customer Objection SubCategory": "Customer_Objection_SubCategory",
    "Agent Rebuttal Category": "Agent_Rebuttal_Category",
    "Agent Rebuttal SubCategory": "Agent_Rebuttal_SubCategory",
    "ObjectionCount": "ObjectionCount",
    "ResolvedObjectionPerc": "ResolvedObjectionPerc",
    "ConversionAfterRebuttal": "ConversionAfterRebuttal",
}

KEY_MAPPINGS.update({
    # CRT – Isha Lead Gen
    "CRT – Isha Lead Gen::Total Connected": "CRT_Isha_Total_Connected",
    "CRT – Isha Lead Gen::Total Interested": "CRT_Isha_Total_Interested",
    "CRT – Isha Lead Gen::Asked for Details (WhatsApp)": "CRT_Isha_Asked_for_Details_WhatsApp",
    "CRT – Isha Lead Gen::Meeting Scheduled": "CRT_Isha_Meeting_Scheduled",
    "CRT – Isha Lead Gen::Not Interested": "CRT_Isha_Not_Interested",
    "CRT – Isha Lead Gen::Meeting Schedule (CRM)": "CRT_Isha_Meeting_Schedule_CRM",

    # Fabonow Team – Conversion
    "Fabonow Team – Conversion::Total Connected": "Fabonow_Total_Connected",
    "Fabonow Team – Conversion::Total Interested": "Fabonow_Total_Interested",
    "Fabonow Team – Conversion::Not Interested": "Fabonow_Not_Interested",
    "Fabonow Team – Conversion::Brochure/Proposal Discussed": "Fabonow_Brochure_Proposal_Discussed",
    "Fabonow Team – Conversion::Conversion": "Fabonow_Conversion",
})





def flatten_gpt_response(gpt_json: dict, db_columns: list) -> dict:
    """
    Flattens GPT JSON into DB-ready dict.
    - Keeps only leaf keys that match DB column names.
    - Applies enum/numeric/JSON normalization.
    """
    flat = {}

    def recurse(obj, parent_key=None):
        if isinstance(obj, dict):
            for k, v in obj.items():
                raw_col = clean_col_name(k)
                col_name = KEY_MAPPINGS.get(k, raw_col)

                # If this key is a JSON field → dump whole dict
                if col_name in JSON_FIELDS and isinstance(v, dict):
                    flat[col_name] = json.dumps(v)
                else:
                    recurse(v, k) if isinstance(v, dict) else process_leaf(k, v)

    def process_leaf(key, value):
        raw_col = clean_col_name(key)
        col_name = KEY_MAPPINGS.get(key, raw_col)  # prefer manual mapping

        if col_name in db_columns:
            if col_name in ENUM_FIELDS:
                flat[col_name] = normalize_enum(col_name, value)
            elif col_name in NUMERIC_FIELDS:
                flat[col_name] = normalize_number(value)
            elif col_name in JSON_FIELDS:
                flat[col_name] = json.dumps(value if value else {})
            else:
                if isinstance(value, str) and value.strip().lower() in ("none", "n/a", "0", "-"):
                    flat[col_name] = None
                else:
                    flat[col_name] = value

    recurse(gpt_json)
    return flat




# ------------------- API -------------------
@router.post("/process_audio_sales")
async def process_audio_sales(
    file: UploadFile,
    campaign_id: str = Form(...),
    calintid: str = Form(...),
    MobileNo: str = Form(...),
    user: str = Form(...),
    call_date: str = Form(...),
    Prompt: str = Form(...),
    db: Session = Depends(get_db)
):
    # -------- Save uploaded file --------
    os.makedirs("media", exist_ok=True)
    temp_audio_path = os.path.join("media", f"{uuid.uuid4().hex}.mp3")
    with open(temp_audio_path, "wb+") as f:
        f.write(await file.read())

    # -------- Convert MP3 → WAV --------
    # temp_wav_path = os.path.join("media", f"{uuid.uuid4().hex}.wav")
    # convert_mp3_to_wav(temp_audio_path, temp_wav_path)

    # -------- Transcribe --------
    transcription_text = transcribe_with_deepgram(temp_audio_path)

    # -------- GPT Extraction --------
    prompt = f"{Prompt} {transcription_text}"
    gpt_response = send_to_gpt(prompt)

    try:
        cleaned_response = re.sub(r'```json|```', '', gpt_response.strip())
        gpt_response_json = json.loads(cleaned_response)
    except Exception:
        gpt_response_json = {"error": "Invalid GPT response"}

    # -------- Prepare values --------
    try:
        occurred_at = datetime.fromisoformat(call_date)
    except Exception:
        occurred_at = datetime.utcnow()

    ai_output_str = json.dumps(gpt_response_json)

    # Flatten GPT response
    flattened = flatten_gpt_response(gpt_response_json, DB_COLUMNS)

    # Build dynamic parts
    extra_cols = ",".join(flattened.keys())
    extra_vals = ",".join([f":{k}" for k in flattened.keys()])

    # Final SQL (conditionally add extra columns if flattened is not empty)
    insert_sql = text(f"""
        INSERT INTO fabonow_calls (
            campaign_id, external_ref, agent_name, customer_phone, occurred_at,
            language, raw_transcript, ai_output_json, CRT_Isha_Total_Connected
            {"," + extra_cols if extra_cols else ""}
        )
        VALUES (
            :campaign_id, :external_ref, :agent_name, :customer_phone, :occurred_at,
            :language, :raw_transcript, :ai_output_json, :CRT_Isha_Total_Connected
            {"," + extra_vals if extra_vals else ""}
        )
    """)

    params = {
        "campaign_id": campaign_id,
        "external_ref": calintid,
        "agent_name": user,
        "customer_phone": MobileNo,
        "occurred_at": occurred_at,
        "language": "en",
        "CRT_Isha_Total_Connected": "Yes",
        "raw_transcript": transcription_text,
        "ai_output_json": ai_output_str,
        **flattened
    }

    result = db.execute(insert_sql, params)
    db.commit()

    # get inserted id (works in MySQL & Postgres with RETURNING or lastrowid)
    inserted_id = result.lastrowid if hasattr(result, "lastrowid") else None

    # -------- Cleanup --------
    os.remove(temp_audio_path)
    # os.remove(temp_wav_path)

    return {
        "status": "success",
        "id": inserted_id,
        "transcription": transcription_text,
        "ai_output": gpt_response_json
    }



@router.get("/raw_data")
def get_raw_data(
        start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
        end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
        db: Session = Depends(get_db)
):
    query = text("""
        SELECT * 
        FROM fabonow_calls
        WHERE DATE(occurred_at) BETWEEN :start_date AND :end_date
    """)

    result = db.execute(query, {
        "start_date": start_date,
        "end_date": end_date
    }).fetchall()

    # Convert result to JSON-friendly format
    response_data = [dict(row._mapping) for row in result]

    return response_data