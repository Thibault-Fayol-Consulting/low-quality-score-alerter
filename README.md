# Low Quality Score Alerter

Identifies keywords with quality scores below a configurable threshold and provides a detailed breakdown of each QS component (creative quality, predicted CTR, post-click experience). Sends alerts and optionally exports to Google Sheets.

## What it does

1. Queries `keyword_view` via GAQL for keywords with QS below the threshold
2. Extracts the three QS components for each keyword
3. Sends an email alert with the full breakdown
4. Optionally exports results to Google Sheets
5. Optionally pauses low QS keywords

## Setup

1. Copy `main_en.gs` (or `main_fr.gs`) into a new Google Ads Script
2. Update `CONFIG.EMAIL` and adjust the QS threshold
3. Optionally set `CONFIG.SPREADSHEET_URL` for Sheets export
4. Schedule weekly

## CONFIG reference

| Parameter | Default | Description |
|---|---|---|
| `TEST_MODE` | `true` | Log only — no keywords paused |
| `EMAIL` | `you@example.com` | Email recipient |
| `MIN_QS` | `4` | Alert for keywords below this QS |
| `PAUSE_LOW_QS` | `false` | Pause low QS keywords when TEST_MODE is false |
| `SPREADSHEET_URL` | `''` | Google Sheets URL for export (empty = skip) |
| `SHEET_NAME` | `Low QS Keywords` | Sheet tab name |

## How it works

Uses `AdsApp.search()` with GAQL on `keyword_view` to pull quality score data including the three sub-components: `creative_quality_score`, `search_predicted_ctr`, and `post_click_quality_score`. Each component is reported as ABOVE_AVERAGE, AVERAGE, or BELOW_AVERAGE, helping you pinpoint whether to fix ads, bids, or landing pages.

## Requirements

- Google Ads account with active Search campaigns
- Permission to send emails (MailApp)
- Optional: Google Sheets access for export

## License

MIT — Thibault Fayol Consulting
