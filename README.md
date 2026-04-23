# 🛡️ FileIntegrityWeb

> Cryptographic file hashing & integrity verification — built with FastAPI and a React cyberpunk UI.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-Proprietary-red)
![Security](https://img.shields.io/badge/Crypto-SHA256%20%2B%20HMAC-green)

---

## What is FileIntegrityWeb?

FileIntegrityWeb is a full-stack web application that lets you **hash any file with a cryptographic algorithm** and later **verify that the file hasn't been tampered with**.  
Every hash is protected by an HMAC signature — ensuring both integrity and authenticity.

---

## Features

| Feature | Details |
|---|---|
| 🔢 Multi-Algorithm Hashing | SHA-256, SHA-512, SHA-1, MD5 — your choice |
| 🔐 HMAC Protection | HMAC-SHA256 signature on every stored hash |
| ✅ Integrity Verification | Re-upload any file to instantly check if it changed |
| 📋 Hash History | Browse all stored records with full hash & HMAC values |
| ⬇️ Hash Download | Export any `.hash` file for offline archiving |
| 🗑️ Record Management | Delete individual entries or clear all at once |
| 🎨 Cyberpunk UI | Dark terminal-style interface with glowing green accents |

---

## Security Model

```
File ──► hashlib (SHA-256 / SHA-512 / SHA-1 / MD5) ──► hash_value
  │
  └──► HMAC-SHA256 (server secret key) ──► hmac_value
                                               │
                              stored together in hash_storage/
```

- **HMAC protects against hash file tampering** — even if the `.hash` file is modified, HMAC verification will fail
- **Secret key** loaded from `HMAC_SECRET` env variable (random on each restart if not set)
- **Constant-time comparison** via `hmac.compare_digest` — no timing attacks
- **Filename sanitization** — `Path(filename).name` strips any path traversal

---

## Installation

```bash
# Clone the repository
git clone https://github.com/ApollonASM8977/FileIntegrityWeb.git
cd FileIntegrityWeb
```

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API running at http://localhost:8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

> The Vite dev server proxies `/api/*` ↑ `http://localhost:8000` automatically.

---

## Project Structure

```
FileIntegrityWeb/
├── backend/
│   ├── main.py              # FastAPI app — all routes & crypto logic
│   ├── requirements.txt
│   ├── .env.example         # HMAC_SECRET env variable template
│   ├── uploads/             # Uploaded files (gitignored)
│   └── hash_storage/        # Stored .hash files (gitignored)
│
└── frontend/
    ├── src/
    │   ├── App.tsx                    # Main shell — tab navigation
    │   ├── components/
    │   │   ├── UploadTab.tsx          # Upload & hash a file
    │   │   ├── VerifyTab.tsx          # Verify file integrity
    │   │   ├── HistoryTab.tsx         # Browse stored records
    │   │   ├── AlgoSelector.tsx       # Algorithm picker
    │   │   └── DropZone.tsx           # Drag & drop file input
    │   └── index.css                  # Global styles + cyberpunk theme
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/algorithms` | List available algorithms |
| `POST` | `/upload` | Upload file ↑ returns hash + HMAC |
| `POST` | `/verify` | Verify file against stored hash |
| `GET` | `/files` | List all stored records |
| `GET` | `/download/{filename}/{algo}` | Download a `.hash` file |
| `DELETE` | `/files` | Delete all files and hashes |
| `DELETE` | `/files/{filename}/{algo}` | Delete a specific record |

---

## Usage

1. **Upload** — drop a file, pick an algorithm, click *Upload & Hash*
2. **Store** — copy the hash or download the `.hash` file for reference
3. **Verify** — later, drop the same file in the *Verify* tab
4. **Result** — instant verdict: ✅ *INTEGRITY VERIFIED* or ❌ *INTEGRITY FAILURE*
5. **History** — manage all your records from the *History* tab

---

## Tech Stack

- **Backend** — FastAPI, Python 3.11, Uvicorn
- **Hashing** — hashlib (SHA-256, SHA-512, SHA-1, MD5)
- **HMAC** — Python `hmac` module (HMAC-SHA256)
- **Frontend** — React 18, TypeScript, Vite
- **Styling** — Tailwind CSS (custom cyberpunk palette)
- **HTTP Client** — Axios

---

## Author

**Aboubacar Sidick Meite** — Cybersecurity Student  
[GitHub](https://github.com/ApollonASM8977)

---

## License

© 2026 Aboubacar Sidick Meite — All Rights Reserved.  
Unauthorized copying, distribution or modification is strictly prohibited.

