# Codex中心のAI分担（GitHub）
## できること
Codexまたは利用者がIssueに作業を書き、Actionsの **AI Team** から外部AIを呼び出します。
Claude / Geminiのどちらかを選択できます。実装担当は専用ブランチとドラフトPRを作り、
別ジョブで既存の `npm test` と `npm run build` を実行します。
レビュー担当は現在の既定ブランチを確認し、結果を実行証跡に保存します。
他のPRの差分レビューには未対応です。Codex自体を常駐起動する仕組みではありません。
外部AIは1回のAPI呼出しで変更案を返す方式です。CLIの反復的な自律エージェントではありません。

## 初回設定
1. この追加PRを確認してmainへマージします。
2. Settings → Secrets and variables → Actions で、使うAIだけ設定します。
   - Claude: Secret `ANTHROPIC_API_KEY`、Variable `ANTHROPIC_MODEL`
   - Gemini: Secret `GEMINI_API_KEY`、Variable `GEMINI_MODEL`
   - MODELには自身のAPI契約で利用できる正確なモデルIDを設定します。
3. Settings → Actions → Generalで、GitHub ActionsによるPR作成を許可します。
4. APIキーはチャット・Issue・コードへ書かず、Secretsへ直接登録します。
   外部AI API利用料とActions利用料は各契約によります。ChatGPT Plusで他社APIが利用できるわけではありません。

## 試す順番
1. 小さな変更をIssueとして登録。対象ファイル・期待動作・合格条件を明記します。
2. Actions → AI Team → Run workflow。既定ブランチを選択し、Issue番号を入力。
3. 最初はdry_run=true。API課金なし・PR作成なしで入力とコンテキスト収集を確認。
4. 実行はdry_run=false、providerを選択、role=implement。
5. 作成されたドラフトPRと、同じ実行内のverifyジョブを確認します。
6. Codexまたは利用者が差分とテストを確認してマージします。自動マージはありません。
7. 独立した現状レビューはrole=review。Artifacts内のJSONで所見を確認。
   複数実装を並行実行するならIssueと対象ファイルを分け、統合後のテストも再実行します。

## 証跡・評価
実行時間・成否はActions、依頼内容はIssue、変更はPR、AI/model・入力ファイル一覧・
API使用量・エラーは30日保持のartifact `ai-team-<run_id>` に残ります。
dry run成功は外部AIの稼働成功を意味しません。
比較時は同じ仕様・合格条件で単独Codex版と分担版を作り、時間・修正回数・利用量を記録します。

## 範囲と制約
- 自動Issue監視はしません。書込み権限のある利用者が手動起動します。
- AIへ送るのはIssue本文と追跡済みsrc/tests/docsおよびREADME、AGENTS、package.jsonです。
  公開リポジトリでも機密情報をこれらに含めないでください。
- AI出力の変更先はsrc/tests/docs内の限定した拡張子のみ。CI・依存・秘密情報を変更できません。
- コンテキストには120,000文字の上限があり、大きいファイルは省略されます。
- GitHubトークンで作成したPRは通常、別のPRトリガーworkflowを起動しません。
  そのため同じ実行のverifyジョブがテストします。必要なbranch protection checkは別途設定してください。
- テストジョブにAI用APIキーや書込みトークンは渡しません。
- 外部AI未設定・通信失敗・API制限・出力形式不備は失敗として記録。成功を偽装しません。
- 本仕組み自体の検証: `node --test .github/ai-team/runner.test.mjs`

公式API資料:
- https://platform.claude.com/docs/en/api/messages/create
- https://ai.google.dev/api/generate-content
