#!/bin/bash
set -euo pipefail

# ── Hard watchdog ──
# Replay + suggestion + xray are the long phases; pad for build, start, and health.
HARD_TIMEOUT=$((${INPUT_REPLAY_TIMEOUT:-900} + ${INPUT_SUGGESTION_TIMEOUT:-600} + ${INPUT_XRAY_TIMEOUT:-900} + ${INPUT_HEALTH_CHECK_TIMEOUT:-120} + 120))
(
  sleep "$HARD_TIMEOUT"
  echo "::error::Tester H hard timeout reached (${HARD_TIMEOUT}s). Killing all processes."
  kill -9 0
) &
WATCHDOG_PID=$!

if [ -n "${GITHUB_WORKSPACE:-}" ]; then
  cd "$GITHUB_WORKSPACE"
fi

# ── User env vars ──
if [ -n "${INPUT_ENV:-}" ]; then
  while IFS= read -r line; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    if [ -n "$line" ] && [[ "$line" == *"="* ]]; then
      key="${line%%=*}"
      value="${line#*=}"
      export "$key=$value"
    fi
  done <<< "$INPUT_ENV"
fi

# tester-h reads the key from HAI_API_KEY (or ./.env). Surface the action input
# under both names so the CLI just picks it up without a `tester-h login` step.
export HAI_API_KEY="${INPUT_API_KEY:-${HAI_API_KEY:-}}"
if [ -n "${INPUT_AGENT_ID:-}" ]; then
  export HAI_AGENT_ID="$INPUT_AGENT_ID"
fi

# Xray / Jira credentials — only exported when xray_plan is set so the CLI's
# resolveXrayCreds() picks them up. The CLI ignores them otherwise.
if [ -n "${INPUT_XRAY_PLAN:-}" ]; then
  [ -n "${INPUT_JIRA_BASE_URL:-}" ] && export JIRA_BASE_URL="$INPUT_JIRA_BASE_URL"
  [ -n "${INPUT_JIRA_USER:-}" ] && export JIRA_USER="$INPUT_JIRA_USER"
  [ -n "${INPUT_JIRA_TOKEN:-}" ] && export JIRA_TOKEN="$INPUT_JIRA_TOKEN"
  [ -n "${INPUT_XRAY_CLIENT_ID:-}" ] && export XRAY_CLIENT_ID="$INPUT_XRAY_CLIENT_ID"
  [ -n "${INPUT_XRAY_CLIENT_SECRET:-}" ] && export XRAY_CLIENT_SECRET="$INPUT_XRAY_CLIENT_SECRET"
fi

# ── Optional CLI version override ──
# The Docker image bakes in one version, but a user can pin a different one
# at runtime without rebuilding the image.
REQUESTED_VERSION="${INPUT_TESTER_H_VERSION:-latest}"
INSTALLED_VERSION="$(tester-h --version 2>/dev/null | awk '{print $NF}' || echo '')"
if [ -n "$REQUESTED_VERSION" ] && [ "$REQUESTED_VERSION" != "$INSTALLED_VERSION" ] && [ "$REQUESTED_VERSION" != "latest" ]; then
  echo "::group::Install tester-h@${REQUESTED_VERSION}"
  npm install -g "tester-h@${REQUESTED_VERSION}"
  tester-h --version
  echo "::endgroup::"
fi

# ── Build Phase ──
if [ -n "${INPUT_BUILD_COMMAND:-}" ]; then
  echo "::group::Build"
  echo "Running: $INPUT_BUILD_COMMAND"
  (eval "$INPUT_BUILD_COMMAND")
  echo "::endgroup::"
fi

# ── Start Servers ──
echo "::group::Start servers"
echo "Running: $INPUT_START_COMMAND"
(eval "$INPUT_START_COMMAND") &
SERVER_PID=$!
echo "Server started (PID: $SERVER_PID)"
echo "::endgroup::"

# ── Health Check ──
HEALTH_URL="${INPUT_HEALTH_CHECK_URL:-${INPUT_APP_URL:-http://localhost:3000}}"
HEALTH_TIMEOUT="${INPUT_HEALTH_CHECK_TIMEOUT:-120}"
echo "::group::Health check"
echo "Polling $HEALTH_URL (timeout: ${HEALTH_TIMEOUT}s)"

SECONDS=0
STATUS="000"
while [ $SECONDS -lt "$HEALTH_TIMEOUT" ]; do
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "::error::Server process exited before health check passed. Check your start_command and build logs."
    kill $WATCHDOG_PID 2>/dev/null || true
    exit 1
  fi
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
  if [ "$STATUS" -ge 200 ] 2>/dev/null && [ "$STATUS" -lt 300 ] 2>/dev/null; then
    echo "Health check passed (HTTP $STATUS) after ${SECONDS}s"
    break
  fi
  sleep 2
done

if [ $SECONDS -ge "$HEALTH_TIMEOUT" ]; then
  echo "::error::Health check timed out after ${HEALTH_TIMEOUT}s (last status: ${STATUS})"
  kill $SERVER_PID 2>/dev/null || true
  kill $WATCHDOG_PID 2>/dev/null || true
  exit 1
fi
echo "::endgroup::"

# ── Orchestrator ──
echo "::group::Tester H — replay + suggest"
ORCH_EXIT=0
node /action/dist/orchestrator.js || ORCH_EXIT=$?
echo "::endgroup::"

# ── Cleanup ──
kill $SERVER_PID 2>/dev/null || true
kill $WATCHDOG_PID 2>/dev/null || true
exit $ORCH_EXIT
