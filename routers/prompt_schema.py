import mysql.connector
from mysql.connector import pooling
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

db_pool = pooling.MySQLConnectionPool(
    pool_name="prompt_pool",
    pool_size=5,
    host="192.168.11.243",
    user="root",
    password="vicidialnow",
    database="dialdesk_callmaster"
)

def get_db():
    conn = db_pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()

router = APIRouter(
    prefix="/prompt-schema",
    tags=["Prompt Schema"]
)

# ---------------- CREATE ----------------
@router.post("")
def create_prompt_schema(payload: Dict[str, Any], db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    client_id = payload.get("client_id")
    label = payload.get("label")
    data_type = payload.get("data_type")
    boolean_options = payload.get("boolean_options")
    description = payload.get("description")

    if not client_id or not label or not data_type:
        raise HTTPException(status_code=400, detail="client_id, label and data_type are required")

    if data_type != "boolean":
        boolean_options = None

    query = """
        INSERT INTO prompt_schema
        (client_id, label, data_type, boolean_options, description)
        VALUES (%s, %s, %s, %s, %s)
    """

    cursor.execute(
        query,
        (client_id, label, data_type, boolean_options, description)
    )
    db.commit()

    return {"id": cursor.lastrowid, "message": "Prompt schema created"}


# ---------------- GET ALL ----------------
@router.get("")
def get_all_prompt_schema(client_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM prompt_schema WHERE client_id = %s ORDER BY id DESC",
        (client_id,)
    )
    return cursor.fetchall()


# ---------------- GET BY ID ----------------
@router.get("/{schema_id}")
def get_prompt_schema(schema_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM prompt_schema WHERE id = %s",
        (schema_id,)
    )
    record = cursor.fetchone()

    if not record:
        raise HTTPException(status_code=404, detail="Prompt schema not found")

    return record


# ---------------- UPDATE ----------------
@router.put("/{schema_id}")
def update_prompt_schema(schema_id: int, payload: Dict[str, Any], db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT data_type FROM prompt_schema WHERE id = %s", (schema_id,))
    existing = cursor.fetchone()

    if not existing:
        raise HTTPException(status_code=404, detail="Prompt schema not found")

    fields = []
    values = []

    if "label" in payload:
        fields.append("label = %s")
        values.append(payload["label"])

    if "description" in payload:
        fields.append("description = %s")
        values.append(payload["description"])

    if "data_type" in payload:
        fields.append("data_type = %s")
        values.append(payload["data_type"])

        # Reset boolean options if changed
        if payload["data_type"] != "boolean":
            fields.append("boolean_options = NULL")

    if "boolean_options" in payload:
        if payload.get("data_type", existing["data_type"]) == "boolean":
            fields.append("boolean_options = %s")
            values.append(payload["boolean_options"])

    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    values.append(schema_id)

    query = f"""
        UPDATE prompt_schema
        SET {', '.join(fields)}
        WHERE id = %s
    """

    cursor.execute(query, tuple(values))
    db.commit()

    return {"message": "Prompt schema updated"}


# ---------------- DELETE ----------------
@router.delete("/{schema_id}")
def delete_prompt_schema(schema_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute("DELETE FROM prompt_schema WHERE id = %s", (schema_id,))
    db.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Prompt schema not found")

    return {"message": "Prompt schema deleted"}

