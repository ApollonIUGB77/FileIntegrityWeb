# © 2026 Aboubacar Sidick Meite (ApollonIUGB77) — All Rights Reserved
"""FileIntegrity API — FastAPI backend."""

import hashlib
import hmac
import os
import secrets
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ── Config ────────────────────────────────────────────────────────────────────

UPLOAD_DIR = Path("uploads")
HASH_DIR = Path("hash_storage")
UPLOAD_DIR.mkdir(exist_ok=True)
HASH_DIR.mkdir(exist_ok=True)

SECRET_KEY = os.getenv("HMAC_SECRET", secrets.token_hex(32))

ALGORITHMS = {
    "sha256":  hashlib.sha256,
    "sha512":  hashlib.sha512,
    "sha1":    hashlib.sha1,
    "md5":     hashlib.md5,
}

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="FileIntegrity API",
    description="Upload files, compute cryptographic hashes, verify integrity.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ───────────────────────────────────────────────────────────────────

AlgoName = Literal["sha256", "sha512", "sha1", "md5"]


def compute_hash(file_path: Path, algorithm: str) -> str:
    h = ALGORITHMS[algorithm]()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def compute_hmac(file_path: Path) -> str:
    h = hmac.new(SECRET_KEY.encode(), digestmod=hashlib.sha256)
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def hash_filename(filename: str, algorithm: str) -> str:
    return f"{filename}.{algorithm}.hash"


# ── Models ────────────────────────────────────────────────────────────────────

class FileEntry(BaseModel):
    filename: str
    algorithm: str
    hash_value: str
    hmac_value: str


class VerifyResult(BaseModel):
    filename: str
    algorithm: str
    stored_hash: str
    computed_hash: str
    match: bool
    hmac_valid: bool


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"name": "FileIntegrity API", "version": "2.0.0", "status": "running"}


@app.get("/algorithms")
def list_algorithms():
    return {"algorithms": list(ALGORITHMS.keys())}


@app.post("/upload", response_model=FileEntry)
async def upload_file(
    file: UploadFile = File(...),
    algorithm: AlgoName = Form("sha256"),
):
    if not file.filename:
        raise HTTPException(400, "No filename provided.")

    safe_name = Path(file.filename).name
    file_path = UPLOAD_DIR / safe_name

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Compute hash
    file_hash = compute_hash(file_path, algorithm)
    file_hmac = compute_hmac(file_path)

    # Store
    hash_path = HASH_DIR / hash_filename(safe_name, algorithm)
    with open(hash_path, "w") as f:
        f.write(f"{file_hash}\n{file_hmac}")

    return FileEntry(
        filename=safe_name,
        algorithm=algorithm,
        hash_value=file_hash,
        hmac_value=file_hmac,
    )


@app.post("/verify", response_model=VerifyResult)
async def verify_file(
    file: UploadFile = File(...),
    algorithm: AlgoName = Form("sha256"),
):
    if not file.filename:
        raise HTTPException(400, "No filename provided.")

    safe_name = Path(file.filename).name
    temp_path = UPLOAD_DIR / f"_verify_{safe_name}"

    content = await file.read()
    with open(temp_path, "wb") as f:
        f.write(content)

    computed = compute_hash(temp_path, algorithm)
    computed_hmac = compute_hmac(temp_path)
    temp_path.unlink(missing_ok=True)

    hash_path = HASH_DIR / hash_filename(safe_name, algorithm)
    if not hash_path.exists():
        raise HTTPException(
            404,
            f"No stored hash found for '{safe_name}' with {algorithm}. Upload it first.",
        )

    lines = hash_path.read_text().strip().splitlines()
    stored_hash = lines[0]
    stored_hmac = lines[1] if len(lines) > 1 else ""

    return VerifyResult(
        filename=safe_name,
        algorithm=algorithm,
        stored_hash=stored_hash,
        computed_hash=computed,
        match=hmac.compare_digest(stored_hash, computed),
        hmac_valid=hmac.compare_digest(stored_hmac, computed_hmac),
    )


@app.get("/files", response_model=list[FileEntry])
def list_files():
    entries: list[FileEntry] = []
    for hash_file in HASH_DIR.iterdir():
        # filename.algo.hash
        parts = hash_file.name.rsplit(".", 2)
        if len(parts) == 3 and parts[2] == "hash" and parts[1] in ALGORITHMS:
            lines = hash_file.read_text().strip().splitlines()
            entries.append(FileEntry(
                filename=parts[0],
                algorithm=parts[1],
                hash_value=lines[0] if lines else "",
                hmac_value=lines[1] if len(lines) > 1 else "",
            ))
    return sorted(entries, key=lambda e: e.filename)


@app.get("/download/{filename}/{algorithm}")
def download_hash(filename: str, algorithm: str):
    safe_name = Path(filename).name
    hash_path = HASH_DIR / hash_filename(safe_name, algorithm)
    if not hash_path.exists():
        raise HTTPException(404, "Hash file not found.")
    return FileResponse(
        hash_path,
        media_type="text/plain",
        filename=hash_filename(safe_name, algorithm),
    )


@app.delete("/files")
def delete_all():
    deleted = 0
    for f in UPLOAD_DIR.iterdir():
        f.unlink()
        deleted += 1
    for f in HASH_DIR.iterdir():
        f.unlink()
        deleted += 1
    return {"deleted": deleted, "message": "All files and hashes cleared."}


@app.delete("/files/{filename}/{algorithm}")
def delete_file(filename: str, algorithm: str):
    safe_name = Path(filename).name
    removed = []
    for path in [UPLOAD_DIR / safe_name, HASH_DIR / hash_filename(safe_name, algorithm)]:
        if path.exists():
            path.unlink()
            removed.append(str(path))
    if not removed:
        raise HTTPException(404, "File not found.")
    return {"removed": removed}
