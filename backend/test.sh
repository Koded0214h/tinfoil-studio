#!/usr/bin/env bash
# Tinfoil Studio — end-to-end API flow test
# Usage:
#   bash test.sh              — uses uploaded test image (no DALL-E cost)
#   bash test.sh --dalle      — uses text prompt (calls DALL-E 3, ~$0.04)
#   bash test.sh --poll 120   — override poll timeout in seconds (default 300)

set -euo pipefail
cd "$(dirname "$0")"

# ── colours (printf, not echo -e — works in bash and sh) ──────────────────────
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

pass()   { printf "${GREEN}✓ %s${RESET}\n" "$1"; }
fail()   { printf "${RED}✗ %s${RESET}\n" "$1"; FAILURES=$((FAILURES+1)); }
info()   { printf "${CYAN}▸ %s${RESET}\n" "$1"; }
warn()   { printf "${YELLOW}⚠ %s${RESET}\n" "$1"; }
header() { printf "\n${BOLD}── %s ──${RESET}\n" "$1"; }

FAILURES=0
BASE="http://localhost:8000"
USE_DALLE=false
POLL_TIMEOUT=300

# ── args ───────────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --dalle) USE_DALLE=true ;;
    --poll)  POLL_TIMEOUT="$2"; shift ;;
  esac; shift
done

# ── helpers ────────────────────────────────────────────────────────────────────
require_cmd() { command -v "$1" &>/dev/null || { fail "missing: $1"; exit 1; }; }
require_cmd curl
require_cmd python3
require_cmd jq

# Use printf to avoid echo mangling multiline JSON (caption_template has \n)
json_get() { printf '%s' "$1" | jq -r "$2" 2>/dev/null || printf 'null'; }

# ── server check ───────────────────────────────────────────────────────────────
header "Server"
if ! curl -sf "$BASE/health" &>/dev/null; then
  warn "Server not running — starting it..."
  source .venv/bin/activate
  python main.py &
  SERVER_PID=$!
  trap 'kill $SERVER_PID 2>/dev/null' EXIT
  for i in $(seq 1 10); do
    sleep 1
    curl -sf "$BASE/health" &>/dev/null && break
    [[ $i -eq 10 ]] && { fail "Server failed to start"; exit 1; }
  done
  pass "Server started (pid $SERVER_PID)"
else
  pass "Server already running at $BASE"
fi

# ── 1. Health ──────────────────────────────────────────────────────────────────
header "Health"
HEALTH=$(curl -sf "$BASE/health")
STATUS=$(json_get "$HEALTH" '.status')
[[ "$STATUS" == "ok" ]] && pass "GET /health → $HEALTH" || fail "GET /health returned: $HEALTH"

# ── 2. Avatar config GET ───────────────────────────────────────────────────────
header "Avatar — Vera"
VERA=$(curl -sf "$BASE/api/avatars/vera/config")
AVATAR_ID=$(json_get "$VERA" '.avatar_id')
[[ "$AVATAR_ID" == "vera" ]] && pass "GET /api/avatars/vera/config" \
  || fail "avatar_id mismatch: $VERA"
info "visual_prompt: $(json_get "$VERA" '.visual_prompt' | cut -c1-60)..."

# ── 3. Avatar config PUT ───────────────────────────────────────────────────────
header "Avatar — Update"
UPDATE=$(curl -sf -X PUT "$BASE/api/avatars/vera/config" \
  -H 'Content-Type: application/json' \
  -d '{"motion_prompt": "smooth cinematic motion, slow push-in, social-native pacing, vertical 9:16, high contrast, platform-optimised — "}')
UPDATED_ID=$(json_get "$UPDATE" '.avatar_id')
[[ "$UPDATED_ID" == "vera" ]] && pass "PUT /api/avatars/vera/config" \
  || fail "update failed: $UPDATE"

# ── 4. Jobs list (baseline) ────────────────────────────────────────────────────
header "Jobs — List"
JOBS=$(curl -sf "$BASE/api/jobs")
TOTAL=$(json_get "$JOBS" '.total')
pass "GET /api/jobs → total=$TOTAL jobs"

# ── 5. Create job ──────────────────────────────────────────────────────────────
header "Job — Create"

if [[ "$USE_DALLE" == true ]]; then
  info "Mode: text prompt (DALL-E 3 — ~\$0.04)"
  JOB=$(curl -sf -X POST "$BASE/api/jobs" \
    -F "prompt=Vera standing in a neon-lit studio, looking directly at camera, fashion editorial mood" \
    -F "platform=instagram" \
    -F "duration=5" \
    -F "use_3d=false")
else
  info "Mode: image upload — cat.jpg (DALL-E skipped)"
  TEST_IMG="cat.jpg"
  [[ -f "$TEST_IMG" ]] || { fail "cat.jpg not found in backend/"; exit 1; }

  JOB=$(curl -sf -X POST "$BASE/api/jobs" \
    -F "prompt=Vera in a neon-lit studio" \
    -F "platform=instagram" \
    -F "duration=5" \
    -F "use_3d=false" \
    -F "input_image=@${TEST_IMG};type=image/jpeg")
fi

JOB_ID=$(json_get "$JOB" '.id')
JOB_STATUS=$(json_get "$JOB" '.status')

[[ "$JOB_ID" != "null" && -n "$JOB_ID" ]] \
  && pass "POST /api/jobs → id=$JOB_ID status=$JOB_STATUS" \
  || { fail "Job creation failed: $JOB"; exit 1; }

# ── 6. Poll job status ─────────────────────────────────────────────────────────
header "Job — Pipeline Poll (timeout ${POLL_TIMEOUT}s)"
info "Polling $JOB_ID every 10s..."
ELAPSED=0
FINAL_STATUS=""
CURRENT="PENDING"

while [[ $ELAPSED -lt $POLL_TIMEOUT ]]; do
  sleep 10
  ELAPSED=$((ELAPSED+10))
  POLL=$(curl -sf "$BASE/api/jobs/$JOB_ID")
  CURRENT=$(json_get "$POLL" '.status')
  ERR=$(json_get "$POLL" '.error_message')
  printf "  [%ds] status=%s\n" "$ELAPSED" "$CURRENT"

  case "$CURRENT" in
    VIDEO_READY|POSTED)
      FINAL_STATUS="$CURRENT"
      VIDEO_URL=$(json_get "$POLL" '.video_url')
      pass "Pipeline completed → $CURRENT"
      info "video_url: $VIDEO_URL"
      break ;;
    FAILED)
      FINAL_STATUS="FAILED"
      fail "Pipeline FAILED: $ERR"
      break ;;
  esac
done

[[ -z "$FINAL_STATUS" ]] && {
  warn "Poll timeout after ${POLL_TIMEOUT}s — last status: $CURRENT"
  FAILURES=$((FAILURES+1))
}

# ── 7. GET job by id ───────────────────────────────────────────────────────────
header "Job — Get by ID"
FETCHED=$(curl -sf "$BASE/api/jobs/$JOB_ID")
FETCHED_STATUS=$(json_get "$FETCHED" '.status')
[[ "$FETCHED_STATUS" == "$CURRENT" ]] \
  && pass "GET /api/jobs/$JOB_ID → status=$FETCHED_STATUS" \
  || fail "status mismatch: expected=$CURRENT got=$FETCHED_STATUS"

# ── 8. List jobs with status filter ───────────────────────────────────────────
header "Jobs — Filter by Status"
FILTERED=$(curl -sf "$BASE/api/jobs?status=${CURRENT}&limit=5")
FTOTAL=$(json_get "$FILTERED" '.total')
[[ "$FTOTAL" -ge 1 ]] \
  && pass "GET /api/jobs?status=$CURRENT → total=$FTOTAL" \
  || fail "status filter returned 0 results"

# ── 9. Post endpoint (only if VIDEO_READY) ────────────────────────────────────
if [[ "$FINAL_STATUS" == "VIDEO_READY" ]]; then
  header "Job — Post to Platform"
  warn "Posting to Instagram — calls Upload-Post API"
  POST_RESP=$(curl -sf -X POST "$BASE/api/jobs/$JOB_ID/post" \
    -H 'Content-Type: application/json' \
    -d '{"platform": "instagram"}' 2>&1 || printf '{"error":"request failed"}')
  POST_STATUS=$(json_get "$POST_RESP" '.status')
  POST_URL=$(json_get "$POST_RESP" '.post_url')
  if [[ "$POST_STATUS" == "POSTED" ]]; then
    pass "POST /api/jobs/$JOB_ID/post → POSTED"
    info "post_url: $POST_URL"
  else
    warn "Posting not confirmed (Upload-Post API needs real credentials): $POST_RESP"
  fi
fi

# ── 10. 404 on unknown job ─────────────────────────────────────────────────────
header "Error Handling"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/jobs/nonexistent-id-00000")
[[ "$CODE" == "404" ]] && pass "GET unknown job → 404" || fail "expected 404, got $CODE"

# ── Summary ────────────────────────────────────────────────────────────────────
printf "\n${BOLD}────────────────────────────────${RESET}\n"
if [[ $FAILURES -eq 0 ]]; then
  printf "${GREEN}${BOLD}All tests passed${RESET}\n"
else
  printf "${RED}${BOLD}%d test(s) failed${RESET}\n" "$FAILURES"
  exit 1
fi
