# token-weather for VS Code

Claude Code for VS Code で、コンテキストのトークン量を天気アイコンで表示する MOD です。

返答のたびに、会話の記録へ次のような1行が出ます。

```
token-weather: ☀ 快晴 11% (112k / 1000k tokens)
```

使用率が上がるにつれて、アイコンが変わります。

| 使用率 | 表示 |
| --- | --- |
| 25% 未満 | ☀ 快晴 |
| 25% 以上 | ☁ 曇り |
| 50% 以上 | ☂ 雨 |
| 75% 以上 | ☇ 嵐 |
| 90% 以上 | ↯ もうすぐ圧縮 |

## インストール

```
claude plugin marketplace add tk344/token-weather-for-vscode
claude plugin install token-weather@takaa-mods
```

インストール後に、Claude Code を再起動してください。

更新するときは、次のとおりです。

```
claude plugin marketplace update takaa-mods
claude plugin update token-weather@takaa-mods
```

更新後に、再起動してください。

## どこに表示されるか

| 場所 | 内容 | VS Code | ターミナル |
| --- | --- | --- | --- |
| 会話の記録 | 各ターンの終わりに1行 | 表示される | 表示される |
| プロンプト下の状態行 | `☀ 快晴 11% (112k/1000k)` | 表示される | 表示される |
| プロンプト上の帯 | 使用率と、使用量・上限 | 表示されない | 表示される |

- 回答の本文には手を加えません。モデルにも送られません。
- サブエージェントのターンでは、表示を出しません。メインの会話の値と同じ数字が、重複して並ぶためです。
- トークン量を取得できなかったターンは、「トークン量を取得できませんでした」と出ます。

## しくみ

`token-weather/hooks/register.tsx` が本体です。Claude Code の MOD（関数フック型のプラグイン）として書かれています。

- `turn.complete`: ターンの終わりに `$.session.usage()` でトークン量を読み、会話の記録に1行出します。同時に状態行を更新します。
- `ui.render`（`AbovePrompt`）: 直近の値を、プロンプトの上に帯として描きます。

## 開発メモ

- **コードを直したら、`token-weather/.claude-plugin/plugin.json` の `version` を必ず上げてください。** 上げないと、インストール済みのキャッシュが更新されず、修正が反映されません。
- 検証は、`claude plugin validate token-weather` でできます。
- 再起動せずに動作を確かめるには、ヘッドレス実行が便利です。`ui_log` と `ui_status` のイベントが出れば、フックは動いています。

  ```
  claude --plugin-dir token-weather -p "こんにちは" --output-format stream-json --verbose
  ```

- `token-weather/.claude-plugin/types/` は、Claude Code が自動で作る型定義です。リポジトリには含めていません。

## ライセンス

MIT
