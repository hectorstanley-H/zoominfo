FROM mcr.microsoft.com/playwright:v1.59.1-noble

# Python + uv for repos that need a Python backend in their start_command,
# git so the action can read the working tree state for the suggestion pass.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip curl git \
  && curl -LsSf https://astral.sh/uv/install.sh | sh \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:$PATH"

WORKDIR /action

# tester-h CLI — pinned via the TESTER_H_VERSION build arg (default: latest).
# Users can override at action runtime via the `tester_h_version` input; the
# entrypoint will `npm i -g tester-h@<version>` if it differs from this build.
#
# ── BRANCH-SPECIFIC OVERRIDE (xray-integration-test) ──
# This branch bundles a pre-release build of tester-h (0.3.0-xray-test.0) as
# a local tarball, because the Xray code hasn't been published to npm yet.
# DELETE THIS BRANCH after the proper 0.3.0 release lands on npm.
COPY tester-h-0.3.0-xray-test.0.tgz /tmp/tester-h.tgz
ARG TESTER_H_VERSION=0.3.0-xray-test.0
RUN npm install -g /tmp/tester-h.tgz \
  && rm /tmp/tester-h.tgz \
  && tester-h --version

# Orchestrator dependencies (just the Anthropic SDK for the planner step).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Pre-built JS orchestrator + entrypoint.
COPY dist/ ./dist/
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["/action/entrypoint.sh"]
