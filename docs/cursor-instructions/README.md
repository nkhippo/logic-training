# Cursor 指示書

機能実装ごとに Claude が作成する Cursor 向けの作業指示書を配置します。

## 命名規則

```
cursor_instruction_<機能名>.md
```

例: `cursor_instruction_mece.md`

## 作成タイミング

要件確定後、以下とセットで作成します（順番厳守）:

1. `docs/requirements-<name>.md`
2. `docs/specification-<name>.md`
3. `docs/cursor-instructions/cursor_instruction_<name>.md`

## Cursor の読み方

実装前に Issue とあわせて本フォルダの指示書を**必ず熟読**してください。詳細は `.cursor/rules/dev-flow.mdc` を参照。
