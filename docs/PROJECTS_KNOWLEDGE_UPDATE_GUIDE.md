# Claude.ai Projects「Think Grind Ai」Knowledge 更新ガイド

**用途**: GitHub で CLAUDE.md・PROJECT_CONTEXT.md を修正したとき、Projects の Knowledge を更新する手順

---

## 背景知識

### Projects の Knowledge とは

Claude.ai Projects の「Knowledge」機能は、プロジェクトに関連したドキュメントをアップロードできます。

```
Projects「Think Grind Ai」
    └─ Knowledge
        ├─ CLAUDE.md
        └─ PROJECT_CONTEXT.md
```

このプロジェクト内で新しいチャットを立てると、Claude が自動でこれらのファイルを読み込みます。

### 重要：自動同期されない

```
❌ 誤解
Github で CLAUDE.md を修正
    ↓
Projects の Knowledge も自動で更新される

✅ 実際
GitHub で CLAUDE.md を修正
    ↓
Projects の Knowledge は古いままン
    ↓
手動で「再インポート」する必要がある
```

**つまり**: Projects は GitHub の「スナップショット」を保存するだけで、常に最新を参照しているわけではありません。

---

## Knowledge 更新の必要なタイミング

以下のファイルを GitHub で修正したときは、**必ず** Projects の Knowledge を更新してください：

| ファイル | 修正頻度 | 更新トリガー |
|---------|---------|-----------|
| CLAUDE.md | 低（数ヶ月に 1 回） | Wiki チェックリスト機能追加時など |
| PROJECT_CONTEXT.md | 低（ビジョン変更時） | Phase 更新時など |

---

## Knowledge 更新手順（ステップバイステップ）

### Step 1: Claude.ai にアクセス

```
https://claude.ai
```

ブラウザで Claude.ai を開きます。

### Step 2: Projects メニューを開く

左側サイドバーから **「Projects」** をクリック

```
左側:
├─ Chat
├─ Cowork
├─ Code
└─ Projects ← ここをクリック
```

### Step 3: 「Think Grind Ai」プロジェクトを選択

Projects ページで「Think Grind Ai」をクリック

```
Projects ページ:
├─ Think Grind Ai ← ここをクリック
├─ （他のプロジェクト）
└─ （他のプロジェクト）
```

### Step 4: Knowledge セクションを開く

プロジェクトページで右側に「Knowledge」セクションが表示されています。

```
右側:
├─ メモリー
├─ 手順
└─ ファイル
    └─ 「+ 」ボタン ← ここをクリック
```

**または**、右上の「...」メニューから「Add content from GitHub」を選択

### Step 5: GitHub ファイルをインポート

「Add content from GitHub」をクリックすると、GitHub ブラウザが開きます。

```
GitHub ブラウザ:
┌─────────────────────────────┐
│ Add content from GitHub      │
│                             │
│ Repository: nkhippo/        │
│   thinkgrindai              │
│ Branch: main                │
│                             │
│ ファイル一覧:               │
│ ☑ CLAUDE.md       ← チェック |
│ ☐ PROJECT_CONTEXT.md       │
│                             │
│        [Add content]        │
└─────────────────────────────┘
```

### Step 6: 修正したファイルをチェック

複数のファイルを修正した場合は、すべてにチェックを入れます：

**CLAUDE.md を修正した場合**:
```
☑ CLAUDE.md
```

**複数修正した場合**:
```
☑ CLAUDE.md
☑ PROJECT_CONTEXT.md
```

### Step 7: 「Add content」をクリック

GitHub ブラウザの「Add content」ボタンをクリック

```
処理開始
    ↓
「Content added successfully」が表示される
    ↓
GitHub ブラウザが閉じる
    ↓
Projects に新しい Knowledge が反映される
```

### Step 8: 更新確認

Projects の「ファイル」セクションで、ファイルが更新されているか確認：

```
ファイル:
├─ CLAUDE.md            ← 修正日時が新しくなっている？
└─ PROJECT_CONTEXT.md
```

修正日時が「今日」になっていれば OK。

---

## よくある質問

### Q: 全てのファイルを毎回アップロードする必要がある？

A: **いいえ**。修正したファイルのみ再インポートで OK。

```
CLAUDE.md だけ修正した
    ↓
☑ CLAUDE.md のみチェック
    ↓
Add content
```

### Q: 既存の Knowledge を削除してから追加する？

A: **不要です**。再インポートすると自動で上書きされます。

```
古い CLAUDE.md がある
    ↓
新しい CLAUDE.md を再インポート
    ↓
古い版は自動で削除 / 新版に更新
```

### Q: Projects の Knowledge はいつ読み込まれる？

A: **新しいチャットを立てるたびに** 読み込まれます。

```
既存チャット（古い Knowledge で開始）
    ↓
新しいチャット（新しい Knowledge で開始）
```

既に開いているチャットには反映されません。新しいチャットで新しい Knowledge が適用されます。

### Q: 更新に何分かかる？

A: **1-2 分程度**。

```
Add content をクリック
    ↓
ファイル読み込み（数秒）
    ↓
Projects に反映（完了）
    ↓
次のチャットから新しい Knowledge を使用可能
```

---

## チェックリスト（毎回確認）

GitHub でファイルを修正したときは、以下を確認：

- [ ] CLAUDE.md（または他のファイル）を GitHub で修正・commit・push
- [ ] Claude.ai Projects「Think Grind Ai」を開く
- [ ] 右側「ファイル」→「+」（または「...」→「Add content from GitHub」）
- [ ] 修正したファイルにチェック
- [ ] 「Add content」をクリック
- [ ] 「Content added successfully」が表示される
- [ ] 新しいチャットで新しい Knowledge が反映されているか確認

---

## トラブルシューティング

### GitHub ブラウザが開かない

```
問題: 「Add content from GitHub」をクリックしても何も起こらない

対応:
1. ブラウザを更新（F5）
2. キャッシュをクリア（Ctrl+Shift+Del）
3. 別のブラウザで試す
4. GitHub への認可が必要かもしれません（初回のみ）
```

### ファイルが表示されない

```
問題: GitHub ブラウザで CLAUDE.md が見当たらない

対応:
1. Repository が「nkhippo/thinkgrindai」か確認
2. Branch が「main」か確認
3. Search ボックスで「CLAUDE」と検索
4. スクロールして下にないか確認
```

### 更新されたが、チャットに反映されない

```
問題: Knowledge を更新したが、既存チャットに反映されない

対応:
✅ 正常な動作です。既存チャットは「古い Knowledge」で開始されます。
✅ 新しいチャットを立てると、新しい Knowledge が自動で読み込まれます。
```

---

## 自動化の可能性

### 現在
```
GitHub で修正
    ↓
手動で Projects に再インポート（この手順ガイド）
```

### 将来（理想）
```
GitHub で修正・push
    ↓
GitHub Actions が Projects API を呼び出す
    ↓
自動で Knowledge 更新
```

ただし、Claude.ai Projects の API はまだ公開されていないため、現在は手動です。

---

## 参考

- Claude.ai Projects: https://claude.ai
- thinkgrindai リポジトリ: https://github.com/nkhippo/thinkgrindai
- CLAUDE.md: https://github.com/nkhippo/thinkgrindai/blob/main/CLAUDE.md

---

このガイドを毎回の Knowledge 更新時に参照してください。
