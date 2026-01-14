from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from mysql.connector.cursor import MySQLCursorDict

from db import get_db

router = APIRouter(
    prefix="/users",
    tags=["User Profile"]
)

# ---------------- SCHEMA ----------------

class ConnectionURIUpdate(BaseModel):
    connection_uri: str


# ---------------- HELPER ----------------

def get_user_id_from_cookie(request: Request) -> int:
    user_id = request.cookies.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    return int(user_id)


# ---------------- GET PROFILE ----------------

@router.get("/profile")
def get_user_profile(
    request: Request,
    db=Depends(get_db)
):
    user_id = get_user_id_from_cookie(request)

    cursor: MySQLCursorDict = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT connection_uri
        FROM users
        WHERE id = %s
        """,
        (user_id,)
    )

    user = cursor.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


# ---------------- UPDATE CONNECTION URI ----------------

@router.put("/connection-uri")
def update_connection_uri(
    payload: ConnectionURIUpdate,
    request: Request,
    db=Depends(get_db)
):
    user_id = get_user_id_from_cookie(request)

    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE users
        SET connection_uri = %s
        WHERE id = %s
        """,
        (payload.connection_uri, user_id)
    )

    db.commit()

    if cursor.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed"
        )

    return {
        "message": "Connection URI updated successfully"
    }
