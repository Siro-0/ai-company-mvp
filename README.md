# AI Company MVP

人間1人を頂点に、AIが「市場調査・ユーザー調査・実現可能性・批判」を行い、最後にAI CEOが統合する最小実験。

## 無料寄りの構成

- GitHub: ソース管理
- Cloudflare Pages: フロント + Pages Functions
- Gemini API: 最初のAIプロバイダー（無料枠を利用）
- APIキー: Cloudflare Pages FunctionsのSecretに保存

## Cloudflare Pagesで動かす

1. このフォルダをGitHubのpublic repositoryへpush
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Git連携
3. このrepositoryを選択
4. build commandは空欄、output directoryは `/`
5. デプロイ
6. Settings → Variables and Secrets
7. Secret `GEMINI_API_KEY` を追加
8. 再デプロイ

APIキーを `index.html` や `app.js` に書かないこと。

## ローカル

Node.jsがある場合:
`npx wrangler pages dev .`

`.dev.vars` に
`GEMINI_API_KEY="あなたのキー"`
を入れる。

## 次の拡張

- Gemini / OpenAI / Claude をproviderとして切替
- AIの提案をDBへ保存
- ユーザーの実データを取り込む
- 実験結果からKPIを評価
- AI自身が次の実験を提案
- 人間承認が必要な操作にapproval gateを入れる
