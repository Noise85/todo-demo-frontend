#!/bin/sh

CONFIG_FILE="/usr/local/apache2/htdocs/default-config.js"
PLACEHOLDER="__API_BASE_URL__"
DEFAULT_API_URL="http://localhost:8080/api"

echo "[ENTRYPOINT] Starting frontend container setup..."

# Determine the API base URL to use
if [ -z "$API_BASE_URL" ]; then
  echo "[ENTRYPOINT] API_BASE_URL is not set. Falling back to default: $DEFAULT_API_URL"
  FINAL_API_URL=$DEFAULT_API_URL
else
  echo "[ENTRYPOINT] API_BASE_URL is set to: $API_BASE_URL"
  FINAL_API_URL=$API_BASE_URL
fi

# Replace the placeholder in config.js with the determined API URL
if [ -f "$CONFIG_FILE" ]; then
  echo "[ENTRYPOINT] Replacing placeholder '$PLACEHOLDER' in $CONFIG_FILE"
  sed -i "s|$PLACEHOLDER|$FINAL_API_URL|g" "$CONFIG_FILE"
  echo "[ENTRYPOINT] Replacement complete. Final config.js now uses: $FINAL_API_URL"
else
  echo "[ENTRYPOINT] ERROR: $CONFIG_FILE not found. Cannot inject runtime config."
  exit 1
fi

# Start Apache in foreground
echo "[ENTRYPOINT] Starting Apache in foreground..."
httpd-foreground
