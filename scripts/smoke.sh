#!/bin/sh
# ヘッドレス実行で、MODが期待どおりのイベントと出力を出すかを確認する
set -e
cd "$(dirname "$0")/.."
claude plugin validate token-weather >/dev/null
out=$(claude --plugin-dir token-weather -p "hi" --output-format stream-json --verbose 2>&1)
fail=0
check() { echo "$out" | grep -q "$2" && echo "OK   $1" || { echo "FAIL $1"; fail=1; }; }
check "状態行 (ui_status)" '"subtype":"ui_status"'
check "ログ (ui_log)" '"subtype":"ui_log"'
check "text返却(VS Code表示用)" 'token-weather: '
exit $fail
