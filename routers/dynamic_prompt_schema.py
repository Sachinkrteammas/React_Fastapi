import mysql.connector
from mysql.connector import pooling
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
import toml

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


section_router = APIRouter(prefix="/prompt-sections", tags=["Prompt Sections"])

@section_router.post("")
def create_section(payload: Dict[str, Any], db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO prompt_sections
        (client_id, section_key, parent_section_id, title, description, sort_order)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        payload["client_id"],
        payload["section_key"],
        payload.get("parent_section_id"),
        payload.get("title"),
        payload.get("description"),
        payload.get("sort_order", 0)
    ))

    db.commit()
    return {"id": cursor.lastrowid, "message": "Section created"}


@section_router.get("/{client_id}")
def get_sections(client_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM prompt_sections
        WHERE client_id = %s
        ORDER BY parent_section_id, sort_order
    """, (client_id,))
    return cursor.fetchall()


field_router = APIRouter(prefix="/prompt-fields", tags=["Prompt Fields"])

@field_router.post("")
def create_field(payload: Dict[str, Any], db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO prompt_fields
        (client_id, section_id, field_key, label, data_type, description, required, sort_order)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        payload["client_id"],
        payload["section_id"],
        payload["field_key"],
        payload["label"],
        payload["data_type"],
        payload.get("description"),
        payload.get("required", False),
        payload.get("sort_order", 0)
    ))

    db.commit()
    return {"id": cursor.lastrowid, "message": "Field created"}


@field_router.get("/{client_id}/{section_id}")
def get_fields(client_id: int, section_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM prompt_fields
        WHERE client_id = %s AND section_id = %s
        ORDER BY sort_order
    """, (client_id, section_id))
    return cursor.fetchall()



@field_router.put("/{field_id}")
def update_field(
    field_id: int,
    payload: Dict[str, Any],
    db=Depends(get_db)
):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        UPDATE prompt_fields
        SET
            field_key = %s,
            label = %s,
            data_type = %s,
            description = %s,
            required = %s,
            sort_order = %s
        WHERE id = %s
    """, (
        payload["field_key"],
        payload["label"],
        payload["data_type"],
        payload.get("description"),
        payload.get("required", False),
        payload.get("sort_order", 0),
        field_id
    ))

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Field not found")

    db.commit()
    return {"message": "Field updated successfully"}


@field_router.delete("/{field_id}")
def delete_field(field_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    # Delete options first
    cursor.execute(
        "DELETE FROM prompt_field_options WHERE field_id = %s",
        (field_id,)
    )

    # Delete values (future-safe)
    cursor.execute(
        "DELETE FROM prompt_field_values WHERE field_id = %s",
        (field_id,)
    )

    # Delete field
    cursor.execute(
        "DELETE FROM prompt_fields WHERE id = %s",
        (field_id,)
    )

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Field not found")

    db.commit()
    return {"message": "Field deleted successfully"}



option_router = APIRouter(prefix="/prompt-field-options", tags=["Prompt Field Options"])

@option_router.post("")
def create_option(payload: Dict[str, Any], db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO prompt_field_options
        (field_id, option_value, option_label, sort_order)
        VALUES (%s,%s,%s,%s)
    """, (
        payload["field_id"],
        payload["option_value"],
        payload.get("option_label"),
        payload.get("sort_order", 0)
    ))

    db.commit()
    return {"id": cursor.lastrowid, "message": "Option added"}


@option_router.get("/{field_id}")
def get_field_options(field_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM prompt_field_options
        WHERE field_id = %s
        ORDER BY sort_order
    """, (field_id,))
    return cursor.fetchall()


@option_router.put("/{option_id}")
def update_option(
    option_id: int,
    payload: Dict[str, Any],
    db=Depends(get_db)
):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        UPDATE prompt_field_options
        SET
            option_value = %s,
            option_label = %s,
            sort_order = %s
        WHERE id = %s
    """, (
        payload["option_value"],
        payload.get("option_label"),
        payload.get("sort_order", 0),
        option_id
    ))

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Option not found")

    db.commit()
    return {"message": "Option updated successfully"}



@option_router.delete("/{option_id}")
def delete_option(option_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "DELETE FROM prompt_field_options WHERE id = %s",
        (option_id,)
    )

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Option not found")

    db.commit()
    return {"message": "Option deleted successfully"}


value_router = APIRouter(prefix="/prompt-values", tags=["Prompt Field Values"])

@value_router.post("")
def save_value(payload: Dict[str, Any], db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO prompt_field_values
        (client_id, field_id, value)
        VALUES (%s,%s,%s)
        ON DUPLICATE KEY UPDATE value = VALUES(value)
    """, (
        payload["client_id"],
        payload["field_id"],
        payload["value"]
    ))

    db.commit()
    return {"message": "Value saved"}


@value_router.get("/{client_id}")
def get_prompt_values(client_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            f.field_key,
            v.value,
            s.section_key
        FROM prompt_field_values v
        JOIN prompt_fields f ON f.id = v.field_id
        JOIN prompt_sections s ON s.id = f.section_id
        WHERE v.client_id = %s
        ORDER BY s.sort_order, f.sort_order
    """, (client_id,))

    return cursor.fetchall()





def fetch_sections(cursor, client_id):
    cursor.execute("""
        SELECT * FROM prompt_sections
        WHERE client_id = %s
        ORDER BY id ASC
    """, (client_id,))
    return cursor.fetchall()

def fetch_fields(cursor, section_id):
    cursor.execute("""
        SELECT * FROM prompt_fields
        WHERE section_id = %s
        ORDER BY id ASC
    """, (section_id,))
    return cursor.fetchall()

def fetch_options(cursor, field_id):
    cursor.execute("""
        SELECT option_value FROM prompt_field_options
        WHERE field_id = %s
        ORDER BY id ASC
    """, (field_id,))
    return [r["option_value"] for r in cursor.fetchall()]

def render_field(cursor, field):
    if field["data_type"] in ("list", "boolean"):
        return fetch_options(cursor, field["id"])

    if field["data_type"] == "number":
        return field.get("default_value", 0)

    if field["data_type"] == "json":
        return {}

    # string / text → keep full text
    return field["description"] or ""

def build_toml(client_id: int, db):
    cursor = db.cursor(dictionary=True)

    sections = fetch_sections(cursor, client_id)
    section_by_id = {s["id"]: s for s in sections}

    toml_data = {}

    # Root sections
    for s in sections:
        if s["parent_section_id"] is None:
            toml_data[s["section_key"]] = {}

            if s["title"]:
                toml_data[s["section_key"]]["class_name"] = s["title"]

            if s["description"]:
                toml_data[s["section_key"]]["description"] = s["description"]

    # Attach fields
    for s in sections:
        fields = fetch_fields(cursor, s["id"])
        if not fields:
            continue

        if s["parent_section_id"] is None:
            target = toml_data[s["section_key"]]
        else:
            parent_key = section_by_id[s["parent_section_id"]]["section_key"]
            toml_data[parent_key].setdefault(s["section_key"], {})
            target = toml_data[parent_key][s["section_key"]]

        for f in fields:
            target[f["field_key"]] = render_field(cursor, f)

    return toml.dumps(toml_data)


prompt_router = APIRouter(prefix="/prompt-preview", tags=["Prompt Preview"])


@prompt_router.get("/{client_id}")
def prompt_preview(client_id: int, db=Depends(get_db)):
    toml_text = build_toml(client_id, db)
    return {
        "format": "toml",
        "preview": toml_text
    }


prompt_config_router = APIRouter(
    prefix="/prompt-configs",
    tags=["Prompt Configs"]
)


@prompt_config_router.post("/{client_id}")
def save_prompt_config(client_id: int, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)

    toml_text = build_toml(client_id, db)

    cursor.execute("""
        INSERT INTO client_prompt_configs (client_id, prompt_text, is_active)
        VALUES (%s, %s, TRUE)
        ON DUPLICATE KEY UPDATE
            prompt_text = VALUES(prompt_text),
            is_active = TRUE
    """, (client_id, toml_text))

    db.commit()

    return {
        "message": "Prompt TOML saved successfully",
        "client_id": client_id
    }
