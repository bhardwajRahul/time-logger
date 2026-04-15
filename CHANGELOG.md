# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-15

### Added
- Automated daily database + file backups via `spatie/laravel-backup`
- Dedicated Docker scheduler service (`scheduler` container) running `schedule:work`
- `backups` filesystem disk (local, private) under `storage/app/backups`
- `appuser` (UID 1000) in the Docker image for better process isolation
- `postgresql-client` to Docker image for `pg_dump` support
- JSON log driver + health check for the `app` container

### Changed
- Backup retention: 1 per day (7 days) → 1 per week (4 weeks) → 1 per month (12 months) → 1 per year
- Backup schedule: `backup:run` at 22:00, `backup:clean` at 22:30

---

## [1.1.0] - 2026-04-15

### Added
- Merge time entries dialog: detects same-day duplicate entries and prompts to merge
- `POST /api/v1/time-entries/merge` endpoint
- `additional_properties` column on `time_entries` for storing merge metadata
- Stopwatch now tracks and restores the previous session on re-open

---

## [1.0.2] - 2026-02-28

### Added
- Time entries are now separated and grouped by week in the dashboard

### Fixed
- Total duration calculation showing incorrect values across multiple entries

---

## [1.0.1] - 2026-02-19

### Fixed
- Dashboard total hours displayed incorrectly due to a Day.js locale/parsing issue

---

## [1.0.0] - 2026-02-09

### Added
- Time entries: create, update, delete, and filter time logs per project
- Projects: manage projects with colour coding
- Time frames: define billable periods with start/end dates and hourly rates
- Custom hourly rate per time frame
- Preferences: per-user settings (currency, theme, etc.)
- Invoice generation with customisable colour
- Stopwatch for live time tracking
- API v1 with Sanctum authentication, filterable querystrings, and cached responses
- Dockerised deployment with FrankenPHP, PostgreSQL, and Redis
