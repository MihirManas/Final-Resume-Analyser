import os
import re
import logging
from typing import Optional

import gspread
from google.oauth2.service_account import Credentials

logger = logging.getLogger(__name__)

# Cache the gspread client so we don't re-auth on every call
_gs_client: Optional[gspread.Client] = None

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]


def _get_client() -> Optional[gspread.Client]:
    """Lazy-init a gspread client using the service account."""
    global _gs_client
    if _gs_client is not None:
        return _gs_client

    creds_path = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if not creds_path:
        logger.warning(
            "GOOGLE_SERVICE_ACCOUNT_JSON env var not set. "
            "Third-party Sheets push will be skipped."
        )
        return None

    try:
        creds = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        _gs_client = gspread.authorize(creds)
        logger.info("gspread client initialized successfully.")
        return _gs_client
    except Exception as e:
        logger.error(f"Failed to initialize gspread client: {e}", exc_info=True)
        return None


def _extract_spreadsheet_id(url: str) -> Optional[str]:
    """Extract the spreadsheet ID from a Google Sheets URL."""
    # Handles URLs like:
    #   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
    #   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/
    #   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID
    match = re.search(r"/spreadsheets/d/([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    # If someone just pasted the raw ID
    if re.fullmatch(r"[a-zA-Z0-9_-]{20,}", url):
        return url
    return None


HEADER_ROW = [
    "Name",
    "Phone Number",
    "Email",
    "College",
    "Branch",
    "Targeted Role",
    "Timestamp",
]


def push_candidate_to_sheet(
    google_sheet_url: str,
    name: str,
    phone: str,
    email: str,
    college: str,
    branch: str,
    target_role: str,
) -> bool:
    """
    Append a row of candidate data to the startup's Google Sheet.
    Returns True on success, False on failure.
    """
    client = _get_client()
    if client is None:
        return False

    sheet_id = _extract_spreadsheet_id(google_sheet_url)
    if not sheet_id:
        logger.error(f"Could not extract spreadsheet ID from URL: {google_sheet_url}")
        return False

    try:
        spreadsheet = client.open_by_key(sheet_id)
        worksheet = spreadsheet.sheet1  # Always use the first sheet

        # Ensure header row exists
        existing = worksheet.row_values(1)
        if not existing or existing[0] != HEADER_ROW[0]:
            worksheet.insert_row(HEADER_ROW, index=1)
            logger.info(f"Inserted header row into sheet {sheet_id}")

        from datetime import datetime

        row = [
            name or "",
            phone or "",
            email or "",
            college or "",
            branch or "",
            target_role or "",
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        ]
        worksheet.append_row(row, value_input_option="USER_ENTERED")
        logger.info(f"Successfully pushed candidate data to sheet {sheet_id}")
        return True

    except gspread.exceptions.SpreadsheetNotFound:
        logger.error(
            f"Spreadsheet {sheet_id} not found. "
            f"Make sure it's shared with the service account email."
        )
        return False
    except gspread.exceptions.APIError as e:
        logger.error(f"Google Sheets API error: {e}", exc_info=True)
        return False
    except Exception as e:
        logger.error(f"Unexpected error pushing to sheet: {e}", exc_info=True)
        return False
