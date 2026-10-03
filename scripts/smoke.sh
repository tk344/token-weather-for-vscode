#!/bin/sh
# ヘッドレス実行で、MODが期待どおりのイベントと出力を出すかを確認する(Git Bash から実行)
# サブスクの利用枠を少し使う。軽いモデルで1ターンだけ流し、セッションは残さない。
cd "$(dirname "$0")/.." || exit 1

if ! v=$(claude plugin validate token-weather 2>&1); then
  echo "FAIL claude plugin validate"; echo "$v"; exit 1
fi

if ! out=$(claude --plugin-dir token-weather --model haiku --no-session-persistence \
  -p "hi" --output-format stream-json --verbose 2>&1); then
  echo "FAIL claude の実行"; echo "$out" | tail -20; exit 1
fi

# token-weather が出したイベントだけを数える(他のプラグインの出力では合格しない)
count() { printf '%s\n' "$out" | jq -R "fromjson? | select($1)" 2>/dev/null | jq -s 'length'; }
status=$(count '.type=="system" and .subtype=="ui_status" and .plugin=="token-weather"')
logs=$(count '.type=="system" and .subtype=="ui_log" and .plugin=="token-weather"')
lines=$(count '.type=="system" and .subtype=="informational" and (.content|test("^token-weather[+:]"))')

fail=0
check() { # 名前 実際の値 期待する値
  if [ "$2" = "$3" ]; then echo "OK   $1"; else echo "FAIL $1 (期待 $3 / 実際 $2)"; fail=1; fi
}
check "状態行 ui_status が1回" "$status" 1
check "ログ ui_log を出さない(ターミナルで二重になるため)" "$logs" 0
check "1行(informational)がちょうど1回(VS Code表示用のtext返却)" "$lines" 1
if [ "$fail" -ne 0 ]; then echo "--- 出力の末尾 ---"; echo "$out" | tail -5 | cut -c1-300; fi
exit "$fail"
