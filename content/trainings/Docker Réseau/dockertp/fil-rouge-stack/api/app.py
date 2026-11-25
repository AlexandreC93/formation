import os
import socket
import psycopg2
from flask import Flask, jsonify, request
 
app = Flask(__name__)
 
DATABASE_URL = os.getenv("DATABASE_URL")
 
 
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)
 
 
def init_db():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS items (
                    id SERIAL PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
        conn.commit()
 
 
@app.route("/")
def index():
    return jsonify(
        {
            "service": "fil-rouge-api",
            "version": os.getenv("APP_VERSION", "2.0"),
            "host": socket.gethostname(),
        }
    )
 
 
@app.route("/health")
def health():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
        return jsonify({"status": "ok", "database": "connected"}), 200
    except Exception as exc:
        return jsonify({"status": "error", "detail": str(exc)}), 500
 
 
@app.route("/items", methods=["GET"])
def list_items():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, created_at FROM items ORDER BY id;")
            rows = cur.fetchall()
    return jsonify(
        [{"id": r[0], "name": r[1], "created_at": r[2].isoformat()} for r in rows]
    )
 
 
@app.route("/items", methods=["POST"])
def create_item():
    payload = request.get_json(silent=True) or {}
    name = payload.get("name")
    if not name:
        return jsonify({"error": "Le champ 'name' est requis"}), 400
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO items (name) VALUES (%s) RETURNING id, name;", (name,)
            )
            row = cur.fetchone()
        conn.commit()
    return jsonify({"id": row[0], "name": row[1]}), 201
 
 
if __name__ == "__main__":
    init_db()
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)