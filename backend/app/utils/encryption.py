import os
from pathlib import Path
from cryptography.fernet import Fernet
from app.config import settings, BASE_DIR

KEY_FILE = BASE_DIR / "data" / ".secret_key"

def get_encryption_key() -> bytes:
    if settings.ENCRYPTION_KEY:
        return settings.ENCRYPTION_KEY.encode() if isinstance(settings.ENCRYPTION_KEY, str) else settings.ENCRYPTION_KEY
    
    # Check if a persistent local key file exists
    if KEY_FILE.exists():
        with open(KEY_FILE, "rb") as f:
            return f.read().strip()
    
    # Generate and persist a new local secret key
    new_key = Fernet.generate_key()
    KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(KEY_FILE, "wb") as f:
        f.write(new_key)
    return new_key

def encrypt_token(plain_text: str) -> str:
    if not plain_text:
        return ""
    cipher = Fernet(get_encryption_key())
    return cipher.encrypt(plain_text.encode()).decode()

def decrypt_token(encrypted_text: str) -> str:
    if not encrypted_text:
        return ""
    try:
        cipher = Fernet(get_encryption_key())
        return cipher.decrypt(encrypted_text.encode()).decode()
    except Exception:
        return ""

