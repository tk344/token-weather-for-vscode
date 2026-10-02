# claude-mods

Claude Code 用の MOD（関数フック型プラグイン）を置くマーケットプレイスです。

## token-weather

コンテキストの使用率を、天気アイコンで表示します。

- 各ターンの終わりに、会話の記録へ `☀ 快晴 11% (112k / 1000k tokens)` のような1行を出します
- プロンプトの下の状態行にも、同じ内容を出します
- 使用率が上がると、快晴 → 曇り → 雨 → 嵐 → もうすぐ圧縮 と変わります

### インストール

```
claude plugin marketplace add tk344/claude-mods
claude plugin install token-weather@takaa-mods
```

インストール後に、Claude Code を再起動してください。

### 更新するとき

キャッシュはバージョン番号で管理されます。コードを直したら、`token-weather/.claude-plugin/plugin.json` の `version` を必ず上げてください。上げないと、更新が反映されません。

## ライセンス

MIT
