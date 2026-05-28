# インフラ構成

**最終更新**: 2026-05-28

thinkgrindai の本番・検証環境のサービス構成・データフロー・ネットワーク経路を一覧する。

---

## 全体構成図

```mermaid
graph TB
    User[ユーザー<br/>Web ブラウザ]
    Naoya[Naoya<br/>iPhone / Mac]
    ClaudeAI[claude.ai<br/>カスタムコネクタ]
    Cursor[Cursor<br/>ローカル Mac]

    subgraph Vercel
      VercelProd[FE Production<br/>main ブランチ]
      VercelPreview[FE Preview<br/>develop ブランチ]
    end

    subgraph Railway
      RailwayProd[BE Production<br/>+ MCP エンドポイント]
      RailwayStaging[BE Staging]
    end

    subgraph Google
      Sheets[Google Sheets<br/>user_core データ]
      ClaudeAPI[Claude API<br/>Sonnet 4.6]
    end

    GitHub[GitHub<br/>Issues / Actions / Wiki]

    User -->|HTTPS| VercelProd
    User -.->|検証用| VercelPreview
    VercelProd -->|REST| RailwayProd
    VercelPreview -->|REST| RailwayStaging
    RailwayProd --> Sheets
    RailwayProd --> ClaudeAPI
    RailwayStaging --> Sheets
    RailwayStaging --> ClaudeAPI

    ClaudeAI -->|JSON-RPC over OAuth| RailwayProd
    RailwayProd -.->|OAuth 認可| GitHub
    ClaudeAI -.->|Issue 起票| GitHub

    Naoya -->|PR Comments 承認| GitHub
    Cursor -.->|Issue ポーリング| GitHub
    Cursor -->|PR 作成・Comment 返答| GitHub
```

---

## CI/CD フロー図

```mermaid
sequenceDiagram
    participant N as Naoya
    participant C as Cursor
    participant GH as GitHub
    participant GA as GitHub Actions
    participant V as Vercel
    participant R as Railway

    N->>GH: Issue 作成（ready-for-cursor）
    C->>GH: Issue 検知（ポーリング）
    C->>GH: PR 作成（base: develop）
    GA->>GH: CI 実行（test + build）
    N->>GH: PR Comment「approve」等
    GA->>GH: 自動マージ（develop）
    GA->>V: Preview デプロイ
    GA->>R: Staging デプロイ
    GA->>GH: develop→main PR 自動作成
    N->>GH: PR Comment「approve」等
    GA->>GH: 自動マージ（main）
    GA->>V: Production デプロイ
    GA->>R: Production デプロイ
```

---

## サービス一覧と責務

| サービス | プラン | 責務 | URL |
|---|---|---|---|
| Vercel | Hobby | FE ホスティング（Production + Preview 自動デプロイ） | Vercel ダッシュボード参照 |
| Railway | Hobby | BE API + MCP エンドポイント・Staging | https://thinkgrindai-production.up.railway.app |
| Google Sheets | 無料 | user_core データ永続化 | シートID は環境変数 |
| Claude API | API 従量 | 問題生成・採点・MCP応答 | https://api.anthropic.com |
| GitHub | Free | Issues・Actions・Wiki | https://github.com/nkhippo/thinkgrindai |
| claude.ai | Pro | 要件議論・MCP経由 Issue 起票 | https://claude.ai |

---

## 環境変数一覧

### Railway BE（本番・Staging 共通）

| 変数名 | 用途 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API 認証 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Sheets 認証 |
| `GOOGLE_PRIVATE_KEY` | Sheets 認証 |
| `SPREADSHEET_ID` | データストア |
| `GITHUB_TOKEN` | MCP → GitHub API |
| `GITHUB_OWNER` | リポジトリオーナー名 |
| `GITHUB_REPO` | リポジトリ名 |
| `MCP_API_BASE_URL` | MCP 公開URL（自身の Railway URL） |

### Vercel FE

| 変数名 | 用途 | Production / Preview |
|---|---|---|
| `VITE_API_BASE_URL` | BE エンドポイント | 本番Railway URL / Staging Railway URL |

---

## コスト管理

| サービス | 月額目安（2026-05時点） |
|---|---|
| Vercel Hobby | 無料 |
| Railway Hobby（本番+Staging 2 Service） | $5（Hobby プラン共有） |
| Google Sheets | 無料 |
| Claude API | 従量（利用量に応じて） |
| GitHub Free | 無料 |
| **合計（固定費）** | **約 $5/月** |
