#!/bin/sh
export PATH="/Users/codybromell/local/node/bin:$PATH"
cd "$(dirname "$0")"
exec npx next dev --port 3000
