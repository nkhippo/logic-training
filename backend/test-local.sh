#!/bin/bash

# Railway 502 エラー診断ローカルテストスクリプト
# 使用方法: bash test-local.sh

echo "========================================="
echo "Railway 502 Error Local Diagnostic Test"
echo "========================================="
echo ""

# 1. 環境変数チェック
echo "[STEP 1] Checking environment variables..."
echo "NODE_ENV: ${NODE_ENV:-not set (will default to development)}"
echo "PORT: ${PORT:-not set (will default to 3000)}"
echo "CLAUDE_API_KEY: ${CLAUDE_API_KEY:-(not set - will fail at API call)}"
echo ""

# 2. 依存関係チェック
echo "[STEP 2] Checking node_modules..."
if [ -d "node_modules" ]; then
  echo "✓ node_modules exists"
  if [ -d "node_modules/express" ]; then
    echo "✓ express is installed"
  else
    echo "✗ express NOT found - run: npm install"
    exit 1
  fi
  if [ -d "node_modules/@anthropic-ai/sdk" ]; then
    echo "✓ @anthropic-ai/sdk is installed"
  else
    echo "✗ @anthropic-ai/sdk NOT found - run: npm install"
    exit 1
  fi
else
  echo "✗ node_modules does NOT exist"
  echo "   → Run: npm install"
  exit 1
fi
echo ""

# 3. ファイル構造チェック
echo "[STEP 3] Checking file structure..."
files=("src/index.js" "src/api/generate-problem.js" "src/api/score-answer.js" "src/config/claude-config.js")
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file NOT found"
    exit 1
  fi
done
echo ""

# 4. .env ファイルチェック
echo "[STEP 4] Checking .env configuration..."
if [ -f ".env" ]; then
  echo "✓ .env file exists"
  if grep -q "CLAUDE_API_KEY" .env; then
    echo "✓ CLAUDE_API_KEY is defined in .env"
  else
    echo "⚠ CLAUDE_API_KEY not found in .env"
  fi
elif [ -f ".env.local" ]; then
  echo "✓ .env.local file exists"
  if grep -q "CLAUDE_API_KEY" .env.local; then
    echo "✓ CLAUDE_API_KEY is defined in .env.local"
  else
    echo "⚠ CLAUDE_API_KEY not found in .env.local"
  fi
else
  echo "ℹ .env file does not exist (optional for local testing)"
  if [ -f ".env.example" ]; then
    echo "  → Copy: cp .env.example .env"
    echo "  → Then edit .env to set CLAUDE_API_KEY"
  fi
fi
echo ""

# 5. ローカル起動テスト
echo "[STEP 5] Attempting to start server locally..."
echo "Command: NODE_ENV=production node src/index.js"
echo "You should see: '[app] ✓ Server running on port 3000'"
echo ""
echo "Starting in 3 seconds (Ctrl+C to cancel)..."
sleep 3
echo ""

# Set required env vars for test
export NODE_ENV=production
export PORT=3999

# If CLAUDE_API_KEY is not set, use a dummy value for startup test
if [ -z "$CLAUDE_API_KEY" ]; then
  echo "⚠ CLAUDE_API_KEY not set - using dummy value for startup test"
  export CLAUDE_API_KEY="dummy-key-for-startup-test"
fi

# Run the server with a timeout (macOS-compatible)
node src/index.js &
server_pid=$!
sleep 10
if kill -0 "$server_pid" 2>/dev/null; then
  kill "$server_pid" 2>/dev/null
  wait "$server_pid" 2>/dev/null
  exit_code=124
else
  wait "$server_pid"
  exit_code=$?
fi

echo ""
echo "========================================="
echo "Test Results:"
echo "========================================="

if [ $exit_code -eq 124 ]; then
  echo "✓ Server started successfully and was terminated by timeout"
  echo "  → This means app.listen() is working correctly"
  echo "  → The 502 error is likely due to missing CLAUDE_API_KEY in Railway"
  echo ""
  echo "Next steps:"
  echo "1. Check Railway Variables: CLAUDE_API_KEY must be set"
  echo "2. Check Railway Environment: NODE_ENV should be 'production'"
  echo "3. If still failing, check Railway Deploy Logs for startup errors"
elif [ $exit_code -eq 0 ]; then
  echo "✓ Server exited cleanly (no startup errors)"
elif [ $exit_code -eq 1 ]; then
  echo "✗ Server failed to start - check output above"
  echo "  → Look for 'FATAL:' or 'error:' messages"
  echo "  → Likely causes:"
  echo "    - Missing npm dependencies"
  echo "    - Syntax error in src/index.js or dependencies"
  echo "    - Port already in use"
else
  echo "? Server exit code: $exit_code"
fi

echo ""
