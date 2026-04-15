#!/bin/sh
set -e

KEY_FILE="/app/storage/app/.app_key"

# APP_KEY is injected by Docker Compose via `env_file:`.
# Fall back to the key persisted on the shared volume by the app container.
if [ -z "$APP_KEY" ] && [ -f "$KEY_FILE" ]; then
    echo "[scheduler] Loading application key from volume..."
    APP_KEY=$(cat "$KEY_FILE")
    export APP_KEY
fi

if [ -z "$APP_KEY" ]; then
    echo "[scheduler] ERROR: APP_KEY is not set. Ensure the app container has initialised." >&2
    exit 1
fi

echo "[scheduler] Starting Laravel Scheduler..."
exec php artisan schedule:work --verbose --no-interaction
