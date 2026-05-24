# GAS スプレッドシート — 1行目ヘッダー用コピペ

カラム構成を変更するとき、**該当シートの A1 を選択**し、下の **「A1に貼り付け」** ブロックをまるごとコピーして貼り付けてください。  
タブ区切りなので、1行目の各列にヘッダー名が一括で入ります。

> 定義の正は `gas-script-v3.js` の `*_COLS` 定数です。コードを変えたらこのファイルも合わせて更新してください。

---

## fill

**A1に貼り付け（タブ区切り）**

```
id	theme	diff	date	industry	text	answers	hints	feedback	userAnswers	lang
```

列のみ（参考）: `id`, `theme`, `diff`, `date`, `industry`, `text`, `answers`, `hints`, `feedback`, `userAnswers`, `lang`

---

## summary

**A1に貼り付け**

```
id	theme	diff	date	industry	text	questions	ratio	lang
```

列のみ: `id`, `theme`, `diff`, `date`, `industry`, `text`, `questions`, `ratio`, `lang`

---

## critique

**A1に貼り付け**

```
id	theme	diff	date	industry	text	questions	feedback	form	lang
```

列のみ: `id`, `theme`, `diff`, `date`, `industry`, `text`, `questions`, `feedback`, `form`, `lang`

---

## ame

**A1に貼り付け**

```
id	theme	diff	date	industry	law	article	constraint	questions	feedback	form	lang
```

列のみ: `id`, `theme`, `diff`, `date`, `industry`, `law`, `article`, `constraint`, `questions`, `feedback`, `form`, `lang`

---

## kibari

**A1に貼り付け**

```
id	theme	diff	scene	date	industry	situation	readers	points	constraint	writeInstruction	rewriteInstruction	openingPhrase	closingPhrase	firstAnswer	feedback	lang
```

列のみ: `id`, `theme`, `diff`, `scene`, `date`, `industry`, `situation`, `readers`, `points`, `constraint`, `writeInstruction`, `rewriteInstruction`, `openingPhrase`, `closingPhrase`, `firstAnswer`, `feedback`, `lang`

---

## thinking

**A1に貼り付け**

```
id	core	diff	level	date	industry	situation	questions	user_core	theme	persona_snapshot	lang
```

列のみ: `id`, `core`, `diff`, `level`, `date`, `industry`, `situation`, `questions`, `user_core`, `theme`, `persona_snapshot`, `lang`

---

## 手順メモ

1. シートの列数が足りなければ、右に列を追加する。
2. **A1** を選択する。
3. 上記の該当ブロック（バッククォート内の1行）をコピーする。
4. A1 に貼り付ける（Mac: ⌘V / Win: Ctrl+V）。
5. 既存データがある場合は、列の追加・削除に合わせてデータ行をずらす。

## スプレッドシート側の巻き戻し（GASメニューを実行済みの場合）

以前の GAS メニュー「A1に列名一括コピーリンクを設置」で **1行目がリンク・2行目がヘッダー** になっている場合:

1. 1行目（📋 リンクの行）を削除する。
2. 上記の「A1に貼り付け」で、残ったヘッダー行（または新しい1行目）を更新する。

GAS 本体はクリップボード用の処理を削除済みです（通常の1行目ヘッダー前提）。
