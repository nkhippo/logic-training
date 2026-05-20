const GAS_URL='https://script.google.com/macros/s/AKfycbwqGTZGuX-jpbQfurBHA2JSH3chZ2tL9j-SXJtgothPfSiblHX8xgVjzQXEOMFUE_e-/exec';
const APIKEY_KEY='logic_v10_apikey';
const LANG_KEY='logic_v10_lang';

// ── i18n ─────────────────────────────────────────────────
const L={
  ja:{
    appTitle:'論理トレーニング',
    subNew:'新規生成',subPast:'過去問',
    guideBtn:'ガイド',guideTitle:'トレーニングガイド',guideLoading:'読み込み中...',guideError:'ガイドの読み込みに失敗しました。',
    gTabOverview:'概要',gTabFill:'穴埋め',gTabSummary:'要約',gTabCritique:'批判読み',gTabAme:'空雨傘',
    apiLbl:'Claude APIキー',saveBtn:'保存',saved:'保存済み',
    tabFill:'穴埋め',tabCritique:'批判読み',tabSum:'要約',
    fThemeLbl:'テーマ',optional:'（省略可）',fLenLbl:'文字数（目安）',
    sLenLbl:'問題文の文字数（目安）',diffLbl:'難易度',
    dLabels:['入門','基礎','標準','上級','超難問'],
    fDescs:[
      '難易度1（入門）: 社内メール・業務連絡。基本的な接続表現のみ。穴抜き2個。ヒントあり。',
      '難易度2（基礎）: 議事録・進捗報告。因果・逆接を含む接続表現。穴抜き3個。軽いヒントあり。',
      '難易度3（標準）: 提案書・企画書の一節。類似する接続表現の正確な使い分けが問われる。穴抜き3個。ヒントなし。',
      '難易度4（上級）: 分析レポート・調査報告。接続表現の選択が論旨の成否を決める精緻な構造。穴抜き4個。ヒントなし。',
      '難易度5（超難問）: 経営戦略文書・コンサルレポート。高度な接続表現・多層的な論証構造。穴抜き5個。ヒントなし。'
    ],
    sDescs:[
      '難易度1（基礎）: 社内メール・業務連絡。設問1問（主張のまとめ）。約60%に圧縮。',
      '難易度2（標準）: 議事録・進捗報告。設問2問（主張のまとめ・用語の説明）。約50%に圧縮。',
      '難易度3（応用）: 提案書・企画書の一節。設問3問（用語の説明・主張のまとめ・理由の説明）。約40%に圧縮。',
      '難易度4（上級）: 分析レポート・調査報告。設問3問。約30%に圧縮。',
      '難易度5（超難問）: 経営戦略文書・コンサルレポート。設問3問。約20%に圧縮。'
    ],
    genBtn:'問題を生成する',genBtnBusy:'生成中…',genLoading:'問題を生成中...',gradingLoading:'答え合わせ中...',modeKeyword:'キーワード',modeQuestion:'課題・疑問',
    genPhaseLlm:'AIが問題を作成しています',genPhaseProcess:'問題を整理しています',
    gradePhaseLlm:'AIが答え合わせしています',gradePhaseProcess:'解説を表示しています',
    fInst:'問題文 — 空欄に当てはまる接続詞を答えてください',
    answerBox:'回答欄',submitBtn:'答え合わせをする',submitBtnBusy:'答え合わせ中…',
    pq:'問題を印刷',pa:'解説を印刷',
    fPastTitle:'穴埋め 過去問',sPastTitle:'要約 過去問',cPastTitle:'批判読み 過去問',
    rand:'ランダム出題',syncLoading:'集計中...',back:'一覧に戻る',all:'すべて',

    cThemeLbl:'テーマ',cDiffLbl:'難易度',cGenBtn:'問題を生成する',cGenLoading:'問題を生成中...',
    cInst:'問題文を読み、各設問に答えてください',cSubmit:'添削してもらう',cPastTitle:'批判読み 過去問',
    cSavedOk:'批判読み問題を保存しました ✓',cGenFailed:'問題の生成に失敗しました。',cGradingErr:'添削に失敗しました',
    cDescs:[
      'ビジネスの短い論証3問。「本当にそう言える？」という部分を見つける練習。',
      'ビジネスの短い論証3問。論理の弱点の指摘・条件の補完・反対意見への応答を練習。',
      'ビジネス文書1本・設問4問。話の流れを整理し、弱点・条件・反対意見を問う。',
      'ビジネス文書1本・設問5問。立場が異なる人からの疑問を含む高度な論証の検証。',
      'ビジネス文書1本・設問5問。多層的な論証構造を持つ経営・戦略文書の批判的検証。',
    ],
    cAutoInfo:'設問数：',
    cQTypes:{
      '話の流れの整理':'話の流れの整理',
      '本当にそう言える？の指摘':'本当にそう言える？',
      '結論が成立するための条件':'成立するための条件',
      '反対意見への応答':'反対意見への応答',
      '立場が異なる人からの疑問':'立場からの疑問',
      '論証構造の整理':'話の流れの整理',
      '飛躍の指摘':'本当にそう言える？',
      '条件の補完':'成立するための条件',
      '反論への応答':'反対意見への応答',
    },
    tabAme:'空雨傘',
    aThemeLbl:'テーマ',
    aDiffLbl:'難易度',
    aGenBtn:'問題を生成する',
    aGenLoading:'問題を生成中...',
    aLawLbl:'法則・前提',
    aArticleLbl:'記事',
    aSubmit:'添削してもらう',
    aPastTitle:'空雨傘 過去問',
    aSavedOk:'空雨傘問題を保存しました ✓',
    aGenFailed:'問題の生成に失敗しました。',
    aGradingErr:'添削に失敗しました',
    aSora:'☁ 空（事実の仕分け）',
    aAme:'🌧 雨（解釈）',
    aKasa:'☂ 傘（行動）',
    aDeduction:'📐 導出の説明',
    aSelfCheck:'🔍 自己検証',
    aLawLimit:'⚖ 法則の限界',
    aConstraintLbl:'制約条件：',
    aDescs:[
      '帰納型。事実のみの短い記事。雨（解釈）と傘（行動）を書く練習。',
      '帰納型。事実の仕分けに慣れる。雨・傘に加え仕分け設問あり。',
      '帰納型。事実と解釈が混在した記事から仕分け・解釈・行動を導く。傘に制約条件あり。',
      '帰納型約50%・演繹型約50%。5設問構成。',
      '帰納型約30%・演繹型約70%。5設問構成。自己検証または法則の限界を問う。',
    ],
    cTooltips:{
      '本当にそう言える？の指摘':{
        label:'「本当にそう言える？」とは？',
        body:'「AだからB」という主張を見たとき、「AがなくてもBになる場合はないか？」「他に見落としている原因はないか？」と問い直すことです。',
        example:'例：「売上が下がった→景気が悪いからだ」（競合他社の台頭や自社製品の問題など他の原因の可能性を考慮していない）'
      },
      '結論が成立するための条件':{
        label:'「成立するための条件」とは？',
        body:'この結論が正しいと言えるためには、文書に書かれていない「前提」として何が必要か、を考えます。',
        example:'例：「コスト削減のために人員を減らす」が成立するには「業務量が変わらない」という前提が必要。'
      },
      '反対意見への応答':{
        label:'「反対意見への応答」とは？',
        body:'「それでも○○ではないか」という別の立場からの意見に対して、元の主張の立場から筋道を立てて答えることです。',
        example:'例：「値上げに反対だ」という意見に対し「値上げで品質を維持しコスト増加を防げる」と根拠を示して応答する。'
      },
      '話の流れの整理':{
        label:'「話の流れの整理」とは？',
        body:'文書の主張の展開を「○○という課題があり→△△という根拠から→□□という結論を導いている」という形で順番に整理することです。',
        example:'例：「売上減少→コスト構造の問題→価格戦略の見直しが必要」のように論理のステップを順番に並べる。'
      },
      '立場が異なる人からの疑問':{
        label:'「立場が異なる人からの疑問」とは？',
        body:'同じ文書でも、読み手の立場（現場担当者・管理職・顧客・株主など）によって「疑問に思う点」や「納得できない点」が異なります。その視点から疑問を考えます。',
        example:'例：「コスト削減のため人員を減らす」という提言に対し、現場担当者は「業務が回るのか？」、株主は「短期的な効果はあるか？」という異なる疑問を持つ。'
      },
    },
    sGenBtn:'問題を生成する',sInst:'問題文を読み、各設問に答えてください',
    yourSum:'あなたの回答',sSubmit:'添削してもらう',
    autoFill:'穴埋め数（自動）：',autoQuestions:'設問数（自動）：',
    apiBtn:'AIで答え合わせする',
    overwriteBtn:'この添削で上書き保存',
    correctTxt:'正解文',
    gradingErr:'添削に失敗しました',
    overWarn:'⚠ 文字数オーバーの設問があります。修正してから添削してください。',
    charOver:'文字オーバーです',charOf:'文字',charTarget:'目標',charWithin:'文字以内',
    qLbl:'設問',qInst:'文字以内で答えてください',
    savedOk:'過去問を保存しました ✓',sSavedOk:'要約問題を保存しました ✓',
    deletedOk:'削除しました',overwriteOk:'添削を上書き保存しました ✓',
    delConfirm:'この過去問を削除しますか？',
    noApiKey:'APIキーを入力してください。',apiKeyHint:'APIキーを入力して「保存」を押してください',
    saveBtnDone:'保存しました',
    genFailed:'問題の生成に失敗しました。',
    apiKeySaved:'APIキーを保存しました ✓',
    fPrintInst:'指示：空欄（　　）に適切な接続詞を入れてください。',
    sPrintInst:'指示：問題文を読み、各設問に指定文字数以内で答えてください。',
    loading:'添削中',syncItems:'件',syncFailed:'失敗',
    noData:'過去問はありません。',
    fThemePlaceholder:'例: AI と社会',sThemePlaceholder:'例: 環境問題',
    theme:'テーマ：',diff:'難易度：',
    sVolLbl:'ボリューム',volShort:'さくっと',volMid:'普通',volLong:'じっくり',
    copiedMsg:'クリップボードにコピーしました ✓',copyBtn:'コピー（MD）',noPhotoError:'写真をアップロードしてください。',
    ansModeLbl:'回答方法',amodeText:'テキスト入力',amodePhoto:'写真で提出',
    uploadHint:'タップして写真を選ぶ',uploadNote:'JPEG / PNG / HEIC・最大2枚',memoLbl:'補足メモ（任意）',
    photoLbl:'回答を書いた紙を撮影してください（最大2枚）',photoGrading:'採点中...',
  },
  en:{
    appTitle:'Logic Training',
    subNew:'New Problem',subPast:'Past Problems',
    guideBtn:'Guide',guideTitle:'Training Guide',guideLoading:'Loading...',guideError:'Failed to load guide.',
    gTabOverview:'Overview',gTabFill:'Fill-in',gTabSummary:'Summary',gTabCritique:'Critical Reading',gTabAme:'Sky-Rain-Umbrella',
    apiLbl:'Claude API Key',saveBtn:'Save',saved:'Saved',
    tabFill:'Fill-in',tabCritique:'Critical Reading',tabSum:'Summarize',
    fThemeLbl:'Theme',optional:'(optional)',fLenLbl:'Length (approx.)',
    sLenLbl:'Problem text length (approx.)',diffLbl:'Difficulty',
    dLabels:['Beginner','Basic','Standard','Advanced','Master'],
    fDescs:[
      'Difficulty 1 (Beginner): Internal email / business communication. Basic connectors only. 2 blanks. Hints provided.',
      'Difficulty 2 (Basic): Meeting minutes / progress report. Causal and adversative connectors. 3 blanks. Light hints.',
      'Difficulty 3 (Standard): Proposal / project plan excerpt. Precise selection among similar connectors. 3 blanks. No hints.',
      'Difficulty 4 (Advanced): Analysis report / research findings. Plain language, precise logic. 4 blanks. No hints.',
      'Difficulty 5 (Master): Management strategy / consulting report. High-register connectors, layered logic. 5 blanks. No hints.'
    ],
    sDescs:[
      'Difficulty 1 (Basic): Internal email / communication. 1 question (Main claim). Target: ~60% of original.',
      'Difficulty 2 (Standard): Meeting minutes / progress report. 2 questions (Main claim + Term). Target: ~50% of original.',
      'Difficulty 3 (Advanced): Proposal / project plan. 3 questions (Term + Main claim + Reason). Target: ~40% of original.',
      'Difficulty 4 (Expert): Analysis report / research findings. 3 questions. Target: ~30% of original.',
      'Difficulty 5 (Master): Strategy document / consulting report. 3 questions. Target: ~20% of original.'
    ],
    genBtn:'Generate Problem',genBtnBusy:'Generating…',genLoading:'Generating problem...',gradingLoading:'Grading...',modeKeyword:'Keyword',modeQuestion:'Question',
    genPhaseLlm:'AI is generating the problem',genPhaseProcess:'Organizing the problem',
    gradePhaseLlm:'AI is checking your answers',gradePhaseProcess:'Preparing your feedback',
    fInst:'Fill in the blanks with the appropriate conjunctions',
    answerBox:'Answers',submitBtn:'Check Answers',submitBtnBusy:'Checking…',
    pq:'Print Problem',pa:'Print Explanation',
    fPastTitle:'Fill-in Past Problems',sPastTitle:'Summary Past Problems',cPastTitle:'Critical Reading Past Problems',
    rand:'Random Problem',syncLoading:'Loading...',back:'Back to List',all:'All',

    cThemeLbl:'Theme',cDiffLbl:'Difficulty',cGenBtn:'Generate Problem',cGenLoading:'Generating problem...',
    cInst:'Read the passage and answer each question',cSubmit:'Get Feedback',cPastTitle:'Critical Reading Past Problems',
    cSavedOk:'Saved ✓',cGenFailed:'Failed to generate problem.',cGradingErr:'Grading failed',
    cDescs:[
      '3 short business arguments. Practice finding the logical gap.',
      '3 short business arguments. Practice identifying gaps, missing conditions, and responding to objections.',
      '1 business document, 4 questions. Summarize the argument flow, identify gaps, conditions, and objections.',
      '1 business document, 5 questions. Includes stakeholder perspective questions.',
      '1 business document, 5 questions. Critical review of complex multi-layer strategy documents.',
    ],
    cAutoInfo:'Questions: ',
    cQTypes:{
      '話の流れの整理':'Argument flow',
      '本当にそう言える？の指摘':'Is this valid?',
      '結論が成立するための条件':'Missing condition',
      '反対意見への応答':'Counterargument',
      '立場が異なる人からの疑問':'Stakeholder view',
      '論証構造の整理':'Argument flow',
      '飛躍の指摘':'Is this valid?',
      '条件の補完':'Missing condition',
      '反論への応答':'Counterargument',
    },
    tabAme:'Sky-Rain-Umbrella',
    aThemeLbl:'Theme',
    aDiffLbl:'Difficulty',
    aGenBtn:'Generate Problem',
    aGenLoading:'Generating problem...',
    aLawLbl:'Law / Principle',
    aArticleLbl:'Article',
    aSubmit:'Get Feedback',
    aPastTitle:'Sky-Rain-Umbrella Past Problems',
    aSavedOk:'Saved ✓',
    aGenFailed:'Failed to generate problem.',
    aGradingErr:'Grading failed',
    aSora:'☁ Sky (Fact sorting)',
    aAme:'🌧 Rain (Interpretation)',
    aKasa:'☂ Umbrella (Action)',
    aDeduction:'📐 Deduction explanation',
    aSelfCheck:'🔍 Self-verification',
    aLawLimit:'⚖ Law limitation',
    aConstraintLbl:'Constraint: ',
    aDescs:[
      'Inductive. Facts-only article. Practice writing Rain (interpretation) and Umbrella (action).',
      'Inductive. Practice fact sorting plus Rain and Umbrella.',
      'Inductive. Mixed article with facts and interpretations. Umbrella has a constraint.',
      '~50% inductive / ~50% deductive. 5 questions.',
      '~30% inductive / ~70% deductive. 5 questions. Includes self-verification or law limitation.',
    ],
    cTooltips:{
      '本当にそう言える？の指摘':{
        label:'What does "Is this valid?" mean?',
        body:'When you see "A, therefore B", ask yourself: "Could B happen without A?" or "Are there other causes being ignored?"',
        example:'e.g. "Sales dropped → the economy is bad" (ignores other causes like competitor growth or product issues)'
      },
      '結論が成立するための条件':{
        label:'What is a "missing condition"?',
        body:'What unstated assumption must be true for this conclusion to hold? Think about what the document takes for granted.',
        example:'e.g. "Reduce headcount to cut costs" assumes "workload stays the same" — an unstated condition.'
      },
      '反対意見への応答':{
        label:'What is "responding to a counterargument"?',
        body:'When someone says "but what about X?", answer from the original argument\'s position with a clear reason.',
        example:'e.g. In response to "I oppose the price increase", argue "The increase maintains quality and prevents cost overruns."'
      },
      '話の流れの整理':{
        label:'What is "argument flow summary"?',
        body:'Break down the document\'s reasoning step by step: "There is a problem X → based on evidence Y → therefore conclusion Z."',
        example:'e.g. "Sales decline → cost structure issues → need to revise pricing strategy"'
      },
      '立場が異なる人からの疑問':{
        label:'What is "stakeholder perspective"?',
        body:'The same document raises different questions depending on the reader\'s role — frontline staff, management, customers, or shareholders. Think from one of these perspectives.',
        example:'e.g. "Reduce headcount to cut costs": frontline asks "Can we manage the workload?", shareholders ask "Will this show short-term results?"'
      },
    },
    sGenBtn:'Generate Problem',sInst:'Read the passage and answer each question',
    yourSum:'Your Answer',sSubmit:'Get Feedback',
    autoFill:'Blanks (auto):',autoQuestions:'Questions (auto):',
    apiBtn:'Grade with AI',
    overwriteBtn:'Save this feedback (overwrite)',
    correctTxt:'Correct Text',
    gradingErr:'Grading failed',
    overWarn:'⚠ Some questions exceed the limit. Please fix before submitting.',
    charOver:'chars over limit',charOf:'chars',charTarget:'Target',charWithin:'chars or less',
    qLbl:'Q',qInst:'chars or less',
    savedOk:'Saved ✓',sSavedOk:'Summary saved ✓',
    deletedOk:'Deleted',overwriteOk:'Overwritten ✓',
    delConfirm:'Delete this past problem?',
    noApiKey:'Please enter your API key.',apiKeyHint:'Enter your API key and click Save',
    saveBtnDone:'Saved',
    genFailed:'Failed to generate problem.',
    apiKeySaved:'API key saved ✓',
    fPrintInst:'Fill in each blank with an appropriate conjunction.',
    sPrintInst:'Read the passage and answer each question within the specified word count.',
    loading:'Generating feedback',syncItems:' items',syncFailed:'Failed',
    noData:'No past problems found.',
    fThemePlaceholder:'e.g. AI and Society',sThemePlaceholder:'e.g. Climate Change',
    theme:'Theme: ',diff:'Difficulty: ',
    sVolLbl:'Volume',volShort:'Quick',volMid:'Normal',volLong:'Deep',
    copiedMsg:'Copied to clipboard ✓',copyBtn:'Copy (MD)',noPhotoError:'Please upload at least one photo.',
    ansModeLbl:'Answer method',amodeText:'Text input',amodePhoto:'Submit photo',
    uploadHint:'Tap to select a photo',uploadNote:'JPEG / PNG / HEIC · max 2 photos',memoLbl:'Note (optional)',
    photoLbl:'Take photos of your handwritten answers (max 2)',photoGrading:'Grading...',
  }
};

// ── State ─────────────────────────────────────────────────
const st={lang:'ja',fDiff:3,sDiff:3,cDiff:3,sVolume:'short',sThemeMode:'keyword',answerMode:'text',answerScope:'s',fFilter:'all',sFilter:'all',cFilter:'all',aFilter:'all',fPast:[],sPast:[],cPast:[],fill:null,summary:null,critique:null,ame:null,aPast:[],aDiff:3,genBusy:null,genPhase:null,gradeBusy:null,gradePhase:null};
let answerPhotos=[];
let _genLockedEls=[];
let _gradeLockedEls=[];
function isBusy(){return st.genBusy||st.gradeBusy;}
function setAppBusyClass(){document.querySelector('.app').classList.toggle('is-busy',!!isBusy());}

// ── 穴埋め数 / 設問数の自動計算 ─────────────────────────
const F_BLANKS={1:2,2:3,3:3,4:4,5:5};
const F_LENGTH=450; // 全難易度共通（400〜500字の中央値）
const S_LENGTH_FIXED={1:300,2:400,3:500};
const S_LENGTH_VARIABLE={
  short:{ja:'さくっと',en:'Quick',chars:500},
  mid:{ja:'普通',en:'Normal',chars:2000},
  long:{ja:'じっくり',en:'Deep',chars:4000}
};
function getSummaryLength(diff){
  if(diff<=3) return S_LENGTH_FIXED[diff];
  const vol=st.sVolume||'short';
  return S_LENGTH_VARIABLE[vol].chars;
}
const S_RATIO={1:.6,2:.5,3:.4,4:.3,5:.2};

const C_QUESTION_COUNTS={1:3,2:3,3:4,4:5,5:5};
const C_TEXT_LENGTH=400;

const A_DEDUCTIVE_RATE={1:0,2:0,3:0,4:0.5,5:0.7};
const A_ARTICLE_LENGTH=350;


function calcBlanks(diff){
  return F_BLANKS[diff]||3;
}
function calcBlocks(diff){
  if(diff===1)return 1;
  if(diff===2)return 2;
  return 3;
}
function getSumQuestionTypes(diff){
  if(diff===1)return ['主張のまとめ'];
  if(diff===2)return ['主張のまとめ','用語の説明'];
  return ['用語の説明','主張のまとめ','理由の説明'];
}
const SUM_TYPE_LABELS={
  ja:{'用語の説明':'用語の説明','主張のまとめ':'主張のまとめ','理由の説明':'理由の説明','語句説明':'用語の説明','主張要約':'主張のまとめ','理由説明':'理由の説明'},
  en:{'用語の説明':'Term explanation','主張のまとめ':'Main claim','理由の説明':'Reason','語句説明':'Term explanation','主張要約':'Main claim','理由説明':'Reason'}
};
function normSummaryProb(prob){
  const lang=prob.lang||prob.rang||st.lang;
  let text=String(prob.text||'').trim();
  let questions=Array.isArray(prob.questions)?prob.questions:(parseF(prob.questions)||[]);
  const qRaw=String(prob.questions||'').trim();
  if(!questions.length&&qRaw&&/^0?\.\d+$/.test(qRaw)&&!prob.ratio){
    prob={...prob,ratio:qRaw,questions:''};
  }
  const blocks=parseF(prob.blocks);
  if(!text&&blocks&&blocks.length){
    text=blocks.map(b=>(typeof b==='string'?b:(b&&b.text)||'')).filter(Boolean).join('\n\n');
  }
  if(!questions.length&&blocks&&blocks.length){
    questions=blocks.map((b,i)=>{
      const o=typeof b==='object'&&b?b:{};
      const label=o.label||'';
      return {
        id:i+1,
        type:label||'主張のまとめ',
        question:label?(lang==='en'?`Summarize: ${label}`:`「${label}」を要約しなさい。`):((lang==='en'?'Question ':'設問')+(i+1)),
        targetChars:parseInt(o.targetChars,10)||50
      };
    });
  }
  return {...prob,text,questions};
}
function sumTypeLabel(type,lang){return(SUM_TYPE_LABELS[lang]||SUM_TYPE_LABELS.ja)[type]||type;}
function buildSummaryQuestionHtml(q,i,lang,mode){
  const l=L[lang]||L.ja;
  const pfx=mode==='pp'?'pp-':'';
  const tc=q.targetChars||50;
  const lines=Math.max(4,Math.ceil(tc/18));
const printLines=Array(lines).fill('<div style="border-bottom:1px solid #ccc;height:26px;margin-bottom:1px;"></div>').join('');
  const taId=pfx?(pfx+'sans-'+i):('sans-'+i);
  const lblId=pfx?(pfx+'lbl-'+i):('slbl-'+i);
  const warnId=pfx?(pfx+'warn-'+i):('swarn-'+i);
  const onCC=mode==='pp'?`ppCC(${i})`:`updateCC(${i})`;
  const badge=sumTypeLabel(q.type,lang);
  return `<div class="sum-q-block">
    <div class="sum-q-lbl no-print">${l.qLbl}${q.id||i+1} <span class="q-type-badge">${esc(badge)}</span> <span style="font-size:11px;color:var(--text2);">（${l.charTarget} ${tc}${l.charWithin}）</span></div>
    <p class="sum-q-text">${esc(q.question||'')}</p>
    <div class="no-print">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <p class="slabel" style="margin:0;">${l.yourSum}</p>
        <span id="${lblId}" class="cc">0 / ${tc}${l.charOf}</span>
      </div>
      <textarea class="sum-ta" id="${taId}" style="min-height:${Math.max(80,tc*1.6)}px" data-target="${tc}" oninput="${onCC}" onblur="${onCC}" placeholder=""></textarea>
      <div id="${warnId}" class="owarn"></div>
    </div>
    <div class="summary-block-print"><p style="font-size:10pt;font-weight:bold;margin-bottom:.3rem;">${l.qLbl}${q.id||i+1}（${tc}${l.charWithin}）</p>${printLines}</div>
  </div>`;
}
function collectSummaryAnswers(prob,mode){
  const pfx=mode==='pp'?'pp-':'';
  return normSummaryProb(prob).questions.map((_,i)=>document.getElementById(pfx+'sans-'+i)?.value.trim()||'—');
}
function buildSummaryGradePrompt(prob,userTexts){
  const pLang=prob.lang||st.lang;
  const isEN=pLang==='en';
  const p=normSummaryProb(prob);
  const passage=isEN?`[Passage]\n${p.text}`:`【問題文】\n${p.text}`;
  const qs=p.questions.map((q,i)=>{
    const ut=userTexts[i]||'—';
    const n=ut.replace(/\s/g,'').length;
    return isEN
      ?`[Question ${q.id||i+1}] Type: ${q.type}\n${q.question}\nCriteria: within ${q.targetChars} chars. Evaluate on the following 4 axes:\n- Accuracy: Does the answer correctly capture the main claim and evidence from the passage?\n- Conciseness: Does the answer fit within the character limit?\n- Expression: Is the answer appropriately paraphrased in the learner's own words?\n- Logical selection: Does the answer retain claims and evidence while appropriately removing specific examples and modifiers?\nLearner's answer (${n} chars):\n${ut}`
      :`【設問${q.id||i+1}】タイプ: ${q.type}\n${q.question}\n模範解答の条件: ${q.targetChars}文字以内。以下の4軸で評価すること。\n- 内容の正確さ：本文の主張・根拠を正しく捉えているか\n- 簡潔さ：指定文字数に収まっているか\n- 表現：自分の言葉で適切に言い換えられているか\n- 論理的取捨選択：主張と根拠を残し、具体例や修飾を適切に削れているか\n学習者の回答（${n}文字）:\n${ut}`;
  }).join('\n\n---\n\n');
  const body=isEN
    ?`${passage}\n\n${qs}\n\nGrade each question individually on the following 4 axes. Provide an improved example within the character limit.\n\n## Per-Question Evaluation\nFor each question: accuracy, conciseness, expression, logical selection (retaining claims/evidence while removing examples), and an improved example within the limit.\n\n## Overall Feedback\nSummarize strengths and areas to improve.`
    :`${passage}\n\n${qs}\n\n文章全体を踏まえ、各設問を個別に採点してください。\n\n## 設問別評価\n各設問ごとに以下の4軸で評価し、改善例（文字数以内）を示してください。\n- 内容の正確さ\n- 簡潔さ\n- 表現\n- 論理的取捨選択（主張と根拠を残し具体例を削れているか）\n\n## 総合講評\n全体の評価と学習アドバイス。`;
  return body+(isEN?SUM_SCORE100_NOTE_EN:SUM_SCORE100_NOTE_JA);
}

// ── i18n 適用 ─────────────────────────────────────────────
const DIFF_LABELS_JA={1:'★入門',2:'★★基礎',3:'★★★標準',4:'★★★★上級',5:'★★★★★超難問'};
const DIFF_LABELS_EN={1:'★Beginner',2:'★★Basic',3:'★★★Standard',4:'★★★★Advanced',5:'★★★★★Master'};
const FILL_HINT_NONE_NOTE_JA='\n\n重要：難易度3以上ではhintsフィールドはすべて必ず空文字列("")にしてください。ヒントを含む文字列を返してはいけません。';
const FILL_HINT_NONE_NOTE_EN='\n\nIMPORTANT: For difficulty 3 and above, every hints field must be an empty string (""). Do not return any hint text.';
const FILL_FORMAT_NOTE_JA='文章の書式ルール：\n- 段落の冒頭は全角スペース「　」を1つ入れてインデントすること\n- 段落の区切りには改行を入れること\n- 読みやすさを重視し、1段落は3〜5文程度にまとめること';
const FILL_FORMAT_NOTE_EN='Formatting rules:\n- Indent the first line of each paragraph with a single space or em-space\n- Add a line break between paragraphs\n- Keep each paragraph to 3-5 sentences for readability';
const SUM_FORMAT_NOTE_JA='文章の書式ルール：\n- 段落の冒頭は全角スペース「　」を1つ入れてインデントすること\n- 段落の区切りには改行を入れること';
const SUM_FORMAT_NOTE_EN='Formatting rules:\n- Indent the first line of each paragraph\n- Add a line break between paragraphs';
function dlabel(d){return(st.lang==='ja'?DIFF_LABELS_JA:DIFF_LABELS_EN)[d]||'—';}
const BADGE={1:'b1',2:'b2',3:'b3',4:'b4',5:'b5'};

function ui(id,txt){const e=document.getElementById(id);if(e)e.textContent=txt;}
function applyLang(){
  const l=L[st.lang];
  ui('ui-app-title',l.appTitle);
  ui('ui-f-sub-new',l.subNew);ui('ui-f-sub-past',l.subPast);
  ui('ui-s-sub-new',l.subNew);ui('ui-s-sub-past',l.subPast);
  ui('ui-api-lbl',l.apiLbl);ui('ui-save-btn',l.saveBtn);
  if(localStorage.getItem(APIKEY_KEY)){
    const statusEl=document.getElementById('api-bar-status');
    if(statusEl)statusEl.textContent='✓ '+l.saved;
  }
  ui('ui-guide-btn',l.guideBtn);ui('ui-guide-title',l.guideTitle);
  ui('ui-gtab-overview',l.gTabOverview);ui('ui-gtab-fill',l.gTabFill);ui('ui-gtab-summary',l.gTabSummary);
  ui('ui-gtab-critique',l.gTabCritique);ui('ui-gtab-ame',l.gTabAme);
  ui('ui-tab-fill',l.tabFill);ui('ui-tab-critique',l.tabCritique);ui('ui-tab-sum',l.tabSum);ui('ui-tab-ame',l.tabAme);
  document.getElementById('ui-f-theme-lbl').innerHTML=l.fThemeLbl+' <span style="font-size:11px;color:var(--text2);">'+l.optional+'</span>';
  ui('ui-f-diff-lbl',l.diffLbl);
  ui('ui-f-gen',l.genBtn);ui('ui-f-inst',l.fInst);ui('ui-f-submit',l.submitBtn);
  ui('ui-f-pq',l.pq);ui('ui-f-pa',l.pa);
  ui('ui-f-gen-loading',l.genLoading);
  ui('ui-f-rand',l.rand);
  ui('ui-f-back',l.back);ui('ui-fp-all',l.all);
  const rp=document.getElementById('r-premise');
  if(rp)rp.placeholder='';
  document.getElementById('ui-s-theme-lbl').innerHTML=l.fThemeLbl+' <span style="font-size:11px;color:var(--text2);">'+l.optional+'</span>';
  ui('ui-s-diff-lbl',l.diffLbl);
  ui('ui-s-vol-lbl',l.sVolLbl);ui('ui-vol-short',l.volShort);ui('ui-vol-mid',l.volMid);ui('ui-vol-long',l.volLong);
  const fmtVolChars=n=>st.lang==='ja'?n.toLocaleString('ja-JP')+'字':n.toLocaleString('en-US')+' chars';
  ui('ui-vol-short-chars',fmtVolChars(S_LENGTH_VARIABLE.short.chars));
  ui('ui-vol-mid-chars',fmtVolChars(S_LENGTH_VARIABLE.mid.chars));
  ui('ui-vol-long-chars',fmtVolChars(S_LENGTH_VARIABLE.long.chars));
  ui('ui-s-gen',l.sGenBtn);ui('ui-s-inst',l.sInst);ui('ui-s-submit',l.sSubmit);
  ui('ui-s-ans-mode-lbl',l.ansModeLbl);ui('ui-s-amode-text',l.amodeText);ui('ui-s-amode-photo',l.amodePhoto);
  ui('ui-s-photo-lbl',l.photoLbl);ui('ui-s-upload-hint',l.uploadHint);ui('ui-s-upload-note',l.uploadNote);ui('ui-s-memo-lbl',l.memoLbl);
  ui('ui-c-ans-mode-lbl',l.ansModeLbl);ui('ui-c-amode-text',l.amodeText);ui('ui-c-amode-photo',l.amodePhoto);
  ui('ui-c-photo-lbl',l.photoLbl);ui('ui-c-upload-hint',l.uploadHint);ui('ui-c-upload-note',l.uploadNote);ui('ui-c-memo-lbl',l.memoLbl);
  ui('ui-a-ans-mode-lbl',l.ansModeLbl);ui('ui-a-amode-text',l.amodeText);ui('ui-a-amode-photo',l.amodePhoto);
  ui('ui-a-photo-lbl',l.photoLbl);ui('ui-a-upload-hint',l.uploadHint);ui('ui-a-upload-note',l.uploadNote);ui('ui-a-memo-lbl',l.memoLbl);
  ui('ui-f-copy',l.copyBtn);ui('ui-s-copy',l.copyBtn);
  ui('ui-s-pq',l.pq);ui('ui-s-pa',l.pa);
  ui('ui-s-mode-keyword',l.modeKeyword);ui('ui-s-mode-question',l.modeQuestion);
  ui('ui-s-gen-loading',l.genLoading);
  ui('ui-s-rand',l.rand);
  ui('ui-s-back',l.back);ui('ui-sp-all',l.all);

  ui('ui-c-sub-new',l.subNew);ui('ui-c-sub-past',l.subPast);
  document.getElementById('ui-c-theme-lbl').innerHTML=l.cThemeLbl+' <span style="font-size:11px;color:var(--text2);">'+l.optional+'</span>';
  ui('ui-c-diff-lbl',l.cDiffLbl);ui('ui-c-gen',l.cGenBtn);ui('ui-c-gen-loading',l.cGenLoading);
  ui('ui-c-inst',l.cInst);ui('ui-c-submit',l.cSubmit);ui('ui-c-pa',l.pa);
  ui('ui-a-sub-new',l.subNew);ui('ui-a-sub-past',l.subPast);
  document.getElementById('ui-a-theme-lbl').innerHTML=l.aThemeLbl+' <span style="font-size:11px;color:var(--text2);">'+l.optional+'</span>';
  ui('ui-a-diff-lbl',l.aDiffLbl);ui('ui-a-gen',l.aGenBtn);ui('ui-a-gen-loading',l.aGenLoading);
  ui('ui-a-law-lbl',l.aLawLbl);ui('ui-a-article-lbl',l.aArticleLbl);ui('ui-a-submit',l.aSubmit);ui('ui-a-pa',l.pa);
  ui('ui-a-rand',l.rand);ui('ui-a-back',l.back);ui('ui-ap-all',l.all);
  ui('ui-c-rand',l.rand);ui('ui-c-back',l.back);ui('ui-cp-all',l.all);

  // diff labels
  for(let d=1;d<=5;d++){
    const fe=document.getElementById('fd'+d),se=document.getElementById('sd'+d),ce=document.getElementById('cd'+d),ae=document.getElementById('ad'+d);
    if(fe)fe.textContent=l.dLabels[d-1];
    if(se)se.textContent=l.dLabels[d-1];
    if(ce)ce.textContent=l.dLabels[d-1];
    if(ae)ae.textContent=l.dLabels[d-1];
  }
  // diff desc & auto info
  updateDiffUI('f');updateDiffUI('s');updateDiffUI('c');updateDiffUI('a');
  // placeholders removed
  ['f-theme','s-theme','c-theme','a-theme'].forEach(id=>{const el=document.getElementById(id);if(el)el.placeholder='';});
  // lang buttons
  document.querySelectorAll('.lang-btn').forEach((b,i)=>b.classList.toggle('active',i===(st.lang==='ja'?0:1)));
  document.documentElement.lang=st.lang;
  if(st.genBusy)updateGenStatusUI(st.genBusy);
  if(st.gradeBusy)updateGradeStatusUI(st.gradeBusy);
  setThemeMode('s',st.sThemeMode||'keyword');
  updateApiKeyUI();
}

function genPrefix(mode){if(mode==='fill')return 'f';if(mode==='summary')return 's';if(mode==='critique')return 'c';if(mode==='ame')return 'a';return mode;}
function updateGenStatusUI(mode){
  const l=L[st.lang],p=genPrefix(mode);
  ui(p+'-gen-lbl-llm',l.genPhaseLlm);
  ui(p+'-gen-lbl-process',l.genPhaseProcess);
  const btn=document.getElementById(p+'-gen-btn');
  if(btn&&st.genBusy===mode)btn.querySelector('span').textContent=l.genBtnBusy;
  if(st.genPhase){
    const title=document.getElementById(p+'-gen-status-title');
    if(title)title.textContent=st.genPhase==='llm'?l.genPhaseLlm:l.genPhaseProcess;
  }
}
function setGenPhase(mode,phase){
  st.genPhase=phase;
  const order=['llm','process'];
  order.forEach(s=>{
    const el=document.getElementById(genPrefix(mode)+'-gen-step-'+s);
    if(!el)return;
    el.classList.remove('pending','active','done');
    if(!phase){el.classList.add('pending');return;}
    const pi=order.indexOf(phase),si=order.indexOf(s);
    if(si<pi)el.classList.add('done');
    else if(si===pi)el.classList.add('active');
    else el.classList.add('pending');
  });
  updateGenStatusUI(mode);
}
function collectGenLockEls(mode){
  const panel='#'+(mode==='fill'?'fill':mode==='summary'?'summary':mode==='critique'?'critique':'ame')+'-panel';
  return document.querySelectorAll(
    '.tab, .lang-btn, .api-save-btn, #apikey, .sub-tab, '+panel+' .card button, '+panel+' .card input, '+panel+' .card textarea, '+panel+' .mode-btn, #'+pastPrefix(mode)+'-past-area button, #'+pastPrefix(mode)+'-past-area .pf-tab, #'+pastPrefix(mode)+'-past-area .pcard, #'+pastPrefix(mode)+'-past-area .back-btn'
  );
}
function lockEl(el,skipIds){
  const skip=Array.isArray(skipIds)?skipIds:[];
  if(skip.includes(el.id)||el.id==='f-gen-btn'||el.id==='s-gen-btn'||el.id==='c-gen-btn'||el.id==='a-gen-btn')return;
  if(el.tagName==='BUTTON'||el.tagName==='INPUT'||el.tagName==='TEXTAREA'){
    el.dataset.genWasDisabled=el.disabled?'1':'0';
    el.disabled=true;
  }else{
    el.dataset.genLocked='1';
    el.style.pointerEvents='none';
    el.style.opacity='0.55';
  }
}
function unlockEl(el){
  if(el.dataset.genLocked){
    delete el.dataset.genLocked;
    el.style.pointerEvents='';
    el.style.opacity='';
  }else if(el.dataset.genWasDisabled!==undefined){
    el.disabled=el.dataset.genWasDisabled==='1';
    delete el.dataset.genWasDisabled;
  }
}
function beginGen(mode){
  if(isBusy())return false;
  st.genBusy=mode;
  const p=genPrefix(mode);
  setAppBusyClass();
  const loadEl=document.getElementById(p+'-gen-loading');
  if(loadEl)loadEl.style.display='flex';
  ui(p+'-gen-loading',L[st.lang].genLoading);

  const btn=document.getElementById(p+'-gen-btn');
  btn.disabled=true;
  btn.classList.add('is-loading');
  _genLockedEls=[...collectGenLockEls(mode)];
  _genLockedEls.forEach(el=>lockEl(el));
  return true;
}
function endGen(mode){
  if(st.genBusy!==mode)return;
  st.genBusy=null;
  st.genPhase=null;
  const p=genPrefix(mode);
  setAppBusyClass();
  const loadEl=document.getElementById(p+'-gen-loading');
  if(loadEl)loadEl.style.display='none';
  const btn=document.getElementById(p+'-gen-btn');
  btn.classList.remove('is-loading');
  btn.querySelector('span').textContent=mode==='fill'?L[st.lang].genBtn:mode==='summary'?L[st.lang].sGenBtn:L[st.lang].cGenBtn;
  _genLockedEls.forEach(unlockEl);
  _genLockedEls=[];
  setGenPhase(mode,null);
  updateApiKeyUI();
}

function updateGradeStatusUI(){
  const l=L[st.lang];
  ui('f-grade-lbl-llm',l.gradePhaseLlm);
  ui('f-grade-lbl-process',l.gradePhaseProcess);
  const btn=document.getElementById('f-submit');
  if(btn&&st.gradeBusy)btn.querySelector('span').textContent=l.submitBtnBusy;
  if(st.gradePhase){
    const title=document.getElementById('f-grade-status-title');
    if(title)title.textContent=st.gradePhase==='llm'?l.gradingLoading:l.gradePhaseProcess;
  }
}
function setGradePhase(phase){
  st.gradePhase=phase;
  ['llm','process'].forEach(s=>{
    const el=document.getElementById('f-grade-step-'+s);
    if(!el)return;
    el.classList.remove('pending','active','done');
    if(!phase){el.classList.add('pending');return;}
    const order=['llm','process'],pi=order.indexOf(phase),si=order.indexOf(s);
    if(si<pi)el.classList.add('done');
    else if(si===pi)el.classList.add('active');
    else el.classList.add('pending');
  });
  updateGradeStatusUI();
}
function collectGradeLockEls(){
  return document.querySelectorAll(
    '.tab, .lang-btn, .api-save-btn, #apikey, #fill-panel button, #fill-panel input, #fill-panel textarea, #fill-panel .pcard, #fill-panel .back-btn'
  );
}
function beginGrade(){
  if(isBusy())return false;
  st.gradeBusy='fill';
  setAppBusyClass();
  document.getElementById('f-grade-status').hidden=false;
  document.getElementById('f-fb').innerHTML='';
  updateGradeStatusUI();
  setGradePhase('llm');
  const btn=document.getElementById('f-submit');
  btn.disabled=true;
  btn.classList.add('is-loading');
  _gradeLockedEls=[...collectGradeLockEls()];
  _gradeLockedEls.forEach(el=>lockEl(el,['f-submit']));
  return true;
}
function endGrade(){
  if(st.gradeBusy!=='fill')return;
  st.gradeBusy=null;
  st.gradePhase=null;
  setAppBusyClass();
  document.getElementById('f-grade-status').hidden=true;
  const btn=document.getElementById('f-submit');
  btn.classList.remove('is-loading');
  btn.querySelector('span').textContent=L[st.lang].submitBtn;
  _gradeLockedEls.forEach(unlockEl);
  _gradeLockedEls=[];
  setGradePhase(null);
  updateApiKeyUI();
}

function updateDiffUI(m){
  const l=L[st.lang];
  const diff=m==='f'?st.fDiff:m==='s'?st.sDiff:m==='c'?st.cDiff:st.aDiff;
  if(m==='f'){
    document.getElementById('f-diff-desc').textContent=l.fDescs[diff-1];
    const b=calcBlanks(diff);
    document.getElementById('f-auto-info').textContent=l.autoFill+b+(st.lang==='ja'?'個':' blanks');
  }else if(m==='s'){
    document.getElementById('s-diff-desc').textContent=l.sDescs[diff-1];
    const nq=calcBlocks(diff);
    document.getElementById('s-auto-info').textContent=l.autoQuestions+nq+(st.lang==='ja'?'問':' questions');
  }else if(m==='c'){
    document.getElementById('c-diff-desc').textContent=l.cDescs[diff-1];
    const nq=C_QUESTION_COUNTS[diff];
    document.getElementById('c-auto-info').textContent=l.cAutoInfo+nq+(st.lang==='ja'?'問':' questions');
  }else{
    document.getElementById('a-diff-desc').textContent=l.aDescs[diff-1];
  }
}

function resetUIOnLangSwitch(){
  st.fill=null;
  st.summary=null;
  st.critique=null;
  st.ame=null;
  ['fill-result','summary-result','critique-result','ame-result'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display='none';
  });
  ['f-fb','s-fb','c-fb','a-fb'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.innerHTML='';
  });
  ['f-copy-bar','s-copy-bar'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display='none';
  });
  const fs1=document.getElementById('fs1'),fs2=document.getElementById('fs2'),fs3=document.getElementById('fs3');
  if(fs1)fs1.className='step done';
  if(fs2)fs2.className='step active';
  if(fs3)fs3.className='step';
  const ss1=document.getElementById('ss1'),ss2=document.getElementById('ss2'),ss3=document.getElementById('ss3');
  if(ss1)ss1.className='step done';
  if(ss2)ss2.className='step active';
  if(ss3)ss3.className='step';
  const fpa=document.getElementById('f-pa-btn'),spa=document.getElementById('s-pa-btn');
  if(fpa)fpa.style.display='none';
  if(spa)spa.style.display='none';
  const fpq=document.getElementById('f-print-area'),spq=document.getElementById('s-print-area');
  if(fpq)fpq.style.display='none';
  if(spq)spq.style.display='none';
  const spt=document.getElementById('s-problem-text'),sq=document.getElementById('s-questions');
  if(spt)spt.innerHTML='';
  if(sq)sq.innerHTML='';
  const cs1=document.getElementById('cs1'),cs2=document.getElementById('cs2'),cs3=document.getElementById('cs3');
  if(cs1)cs1.className='step done';
  if(cs2)cs2.className='step active';
  if(cs3)cs3.className='step';
  const cpa=document.getElementById('c-pa-btn');
  if(cpa)cpa.style.display='none';
  const as1=document.getElementById('as1'),as2=document.getElementById('as2'),as3=document.getElementById('as3');
  if(as1)as1.className='step done';
  if(as2)as2.className='step active';
  if(as3)as3.className='step';
  const apa=document.getElementById('a-pa-btn');
  if(apa)apa.style.display='none';
  updateApiKeyUI();
}
function setLang(lang){
  if(isBusy())return;
  st.lang=lang;
  localStorage.setItem(LANG_KEY,lang);
  resetUIOnLangSwitch();
  Object.keys(_guideCache).forEach(k=>delete _guideCache[k]);
  applyLang();
  if(document.getElementById('guide-overlay')?.classList.contains('show'))switchGuideTab(_guideCurrentTab);
  if(document.getElementById('fill-sub-past')?.classList.contains('active'))renderPL('fill');
  if(document.getElementById('summary-sub-past')?.classList.contains('active'))renderPL('summary');
  if(document.getElementById('critique-sub-past')?.classList.contains('active'))renderPL('critique');
  if(document.getElementById('ame-sub-past')?.classList.contains('active'))renderPL('ame');
}
function setVolume(v){
  if(isBusy())return;
  st.sVolume=v;
  document.querySelectorAll('#s-volume-selector .vol-btn').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
  updateDiffUI('s');
}
function setDiff(m,d){
  if(isBusy())return;
  if(m==='f')st.fDiff=d;else if(m==='s')st.sDiff=d;else if(m==='c')st.cDiff=d;else st.aDiff=d;
  document.querySelectorAll('#'+(m==='f'?'f':m==='s'?'s':m==='c'?'c':'a')+'-diff-row .diff-btn').forEach(b=>b.classList.toggle('sel',parseInt(b.dataset.d)===d));
  if(m==='s'){
    const vs=document.getElementById('s-volume-selector');
    if(vs) vs.style.display=d>=4?'':'none';
  }
  updateDiffUI(m);
}
function switchSub(mode,sub){
  document.getElementById(mode+'-sub-new').classList.toggle('active',sub==='new');
  document.getElementById(mode+'-sub-past').classList.toggle('active',sub==='past');
  const newArea=document.getElementById(mode+'-new-area');
  const pastArea=document.getElementById(mode+'-past-area');
  if(newArea)newArea.style.display=sub==='new'?'':'none';
  if(pastArea)pastArea.style.display=sub==='past'?'':'none';
  if(sub==='past')loadPast(mode);
}
function switchTab(name){
  if(isBusy())return;
  ['fill','summary','critique','ame'].forEach((n,i)=>{
    document.querySelectorAll('.tab')[i].classList.toggle('active',n===name);
    document.getElementById(n+'-panel').classList.toggle('active',n===name);
  });
  if(name==='fill')switchSub('fill','new');
  if(name==='summary')switchSub('summary','new');
  if(name==='critique')switchSub('critique','new');
  if(name==='ame')switchSub('ame','new');
}

// ── Helpers ───────────────────────────────────────────────
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function calcFillScore(answers,ua){
  const total=answers.length;
  let correct=0;
  answers.forEach((ans,i)=>{if(String(ua[i]||'').trim()===String(ans).trim())correct++;});
  const pct=total?Math.round(correct/total*100):0;
  return {correct,total,pct};
}
function fillScoreColor(pct){
  if(pct>=80)return 'var(--green)';
  if(pct>=60)return 'var(--amber)';
  return '#c0453a';
}
function fillScoreHtml(correct,total,lang){
  const pct=total?Math.round(correct/total*100):0;
  const color=fillScoreColor(pct);
  const isJa=(lang||st.lang)==='ja';
  const text=isJa?`${correct} / ${total} 問正解（${pct}%）`:`${correct} / ${total} correct (${pct}%)`;
  return `<p class="fill-score" style="font-size:18px;font-weight:600;color:${color};margin:0 0 1rem;">${text}</p>`;
}
const SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。';
const SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.';
const SUM_SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：内容の正確さ（50点）・簡潔さ・文字数遵守（30点）・表現・論理性（20点）。';
const SUM_SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.\nScoring: content accuracy (50pts), conciseness & word count (30pts), expression & logic (20pts).';
const FILL_SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：各設問は均等配点（例：5問なら各20点）。正解は満点、部分的に正しい場合（意味が近い接続詞）は半点、不正解は0点。';
const FILL_SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.\nEach question is worth equal points (e.g. 20pts each for 5 questions). Full marks for correct answer, half marks for close alternatives, 0 for incorrect.';
const REVIEW_SCORE100_NOTE_JA='\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：接続詞の適切さ（40点）・論理的一貫性（40点）・表現の自然さ（20点）。';
const REVIEW_SCORE100_NOTE_EN='\n\nStart with 【Score: XX/100】 on the very first line.\nScoring: conjunction appropriateness (40pts), logical consistency (40pts), natural expression (20pts).';
function score100Color(score){
  if(score>=80)return 'var(--green)';
  if(score>=60)return 'var(--amber)';
  return '#c0453a';
}
function score100Html(n,isJa){
  const score=parseInt(n,10)||0;
  const suffix=isJa?'/100点':'/100';
  return `<div class="score-100" style="font-size:22px;font-weight:500;color:${score100Color(score)};margin-bottom:.75rem;">${score}<span style="font-size:14px;color:var(--text2);">${suffix}</span></div>`;
}
function stripScore100Line(text){
  const t=String(text||'').trim();
  const mJa=t.match(/^【スコア[：:]\s*(\d+)\/100】\s*/);
  if(mJa)return {score:mJa[1],rest:t.slice(mJa[0].length).trim()};
  const mEn=t.match(/^【Score[：:]\s*(\d+)\/100】\s*/i);
  if(mEn)return {score:mEn[1],rest:t.slice(mEn[0].length).trim()};
  return {score:null,rest:t};
}
function formatFeedback100(raw,lang){
  const {score,rest}=stripScore100Line(raw);
  const isJa=(lang||st.lang)==='ja';
  const head=score!=null?score100Html(score,isJa):'';
  return head+md2h(rest);
}
function formatSummaryFeedback(raw,lang){return formatFeedback100(raw,lang);}
function showCopyBar(mode){
  const id=mode==='fill'?'f-copy-bar':mode==='summary'?'s-copy-bar':'r-copy-bar';
  const el=document.getElementById(id);
  if(el)el.style.display='flex';
}
function fmtDate(s){if(!s)return'';const d=new Date(s);return`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;}
function showToast(msg,ms=3500){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),ms);}
function setSync(mode,cls,msg){const pfx=pastPrefix(mode);document.getElementById(pfx+'-dot').className='sdot'+(cls?' '+cls:'');document.getElementById(pfx+'-lbl').textContent=msg;}
function parseF(v){if(Array.isArray(v))return v;try{return JSON.parse(v);}catch{return[];}}

// ── md → HTML ─────────────────────────────────────────────
function styleCompletedConj(html){
  return html.replace(/(<div class="completed-text">)([\s\S]*?)(<\/div>)/g,(_,open,inner,close)=>{
    const s=inner.replace(/<strong>([^<]+)<\/strong>\[([^\]]+)\]/g,'<span class="conj"><strong>$1</strong><span class="conj-role">[$2]</span></span>');
    return open+s+close;
  });
}
function mdInline(s){
  return String(s||'')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/✓/g,'<span class="ok">✓</span>')
    .replace(/✗/g,'<span class="ng">✗</span>');
}
function isTableSepRow(line){
  const cells=line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|');
  return cells.length>0&&cells.every(c=>/^:?-{2,}:?$/.test(c.trim()));
}
function parseMdRow(line){
  return line.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(c=>c.trim());
}
function renderMdTable(lines){
  const header=parseMdRow(lines[0]);
  const body=lines.slice(2).map(parseMdRow).filter(r=>r.some(c=>c.length));
  let h='<table class="md-table"><thead><tr>';
  header.forEach(c=>{h+=`<th>${mdInline(c)}</th>`;});
  h+='</tr></thead><tbody>';
  body.forEach(row=>{
    h+='<tr>';
    for(let i=0;i<header.length;i++) h+=`<td>${mdInline(row[i]||'')}</td>`;
    h+='</tr>';
  });
  return h+'</tbody></table>';
}
function parseMdTables(text){
  const lines=text.split('\n');
  const out=[];
  let i=0;
  while(i<lines.length){
    const tr=lines[i].trim();
    if(tr.startsWith('|')&&tr.endsWith('|')){
      const block=[];
      while(i<lines.length){
        const t=lines[i].trim();
        if(!t.startsWith('|')||!t.endsWith('|'))break;
        block.push(t);
        i++;
      }
      if(block.length>=2&&isTableSepRow(block[1])) out.push(renderMdTable(block));
      else out.push(...block);
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}
function mdWrapTextBlocks(html){
  const re=/(<table[\s\S]*?<\/table>|<hr>|<h2>[\s\S]*?<\/h2>|<h3>[\s\S]*?<\/h3>|<h4>[\s\S]*?<\/h4>|<ul>[\s\S]*?<\/ul>|<div class="completed-text">[\s\S]*?<\/div>)/gi;
  return html.split(re).map(part=>{
    if(!part||/^<(table|hr|h[234]|ul|div)/i.test(part.trim()))return part;
    let p=part.trim();
    if(!p)return '';
    p=mdInline(p).replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br>');
    if(p&&!p.startsWith('<p>'))p='<p>'+p;
    if(p&&!p.endsWith('</p>'))p+='</p>';
    return p;
  }).join('');
}
function md2h(tx){
  let raw=String(tx||'').trim();
  if(!raw)return '';
  const blockquotes=[];
  raw=raw.replace(/^> (.+)$/gm,(_,line)=>{
    blockquotes.push('<blockquote>'+esc(line)+'</blockquote>');
    return `\x01BQ${blockquotes.length-1}\x01`;
  });
  let h=esc(raw);
  blockquotes.forEach((bq,i)=>{h=h.replace(`\x01BQ${i}\x01`,bq);});
  h=h
    .replace(/【スコア[：:]\s*(\d+)\/100】/g,(_,n)=>score100Html(n,st.lang==='ja'))
    .replace(/【Score[：:]\s*(\d+)\/100】/gi,(_,n)=>score100Html(n,false));
  h=parseMdTables(h);
  h=h
    .replace(/^#### (.+)$/gm,(_,t)=>'<h4>'+mdInline(t)+'</h4>')
    .replace(/^### (.+)$/gm,(_,t)=>'<h3>'+mdInline(t)+'</h3>')
    .replace(/^## (.+)$/gm,(_,t)=>'<h2>'+mdInline(t)+'</h2>')
    .replace(/^# (.+)$/gm,(_,t)=>'<h2>'+mdInline(t)+'</h2>')
    .replace(/^---+?\s*$/gm,'<hr>')
    .replace(/^\d+\. (.+)$/gm,(_,t)=>'<li>'+mdInline(t)+'</li>')
    .replace(/^[-*・] (.+)$/gm,(_,t)=>'<li>'+mdInline(t)+'</li>')
    .replace(/((?:<li>[\s\S]*?<\/li>\s*)+)/g,'<ul>$1</ul>');
  h=mdWrapTextBlocks(h);
  const blockEnd='(?=<h[234]>|<table|<hr|<ul>|<div class="completed-text"|$)';
  h=h
    .replace(new RegExp('「完全補完文」([\\s\\S]*?)'+blockEnd,'g'),'<div class="completed-text">$1</div>')
    .replace(new RegExp('「Fully Supplemented Text」([\\s\\S]*?)'+blockEnd,'g'),'<div class="completed-text">$1</div>')
    .replace(/<h3>完全補完文<\/h3>([\s\S]*?)(?=<h[234]>|<table|<hr|<ul>|$)/g,'<h3>完全補完文</h3><div class="completed-text">$1</div>')
    .replace(/<h3>Fully Supplemented Text<\/h3>([\s\S]*?)(?=<h[234]>|<table|<hr|<ul>|$)/g,'<h3>Fully Supplemented Text</h3><div class="completed-text">$1</div>');
  h=h.replace(/⁽(\d+)⁾/g,'<sup style="font-size:10px;color:var(--text2);">($1)</sup>');
  return styleCompletedConj(h);
}

// ── APIキー ───────────────────────────────────────────────
function hasApiKey(){return !!document.getElementById('apikey')?.value.trim();}
function updateApiKeyUI(){
  const l=L[st.lang],busy=isBusy(),ok=hasApiKey();
  ['f-gen-btn','s-gen-btn','c-gen-btn','a-gen-btn'].forEach(id=>{
    const b=document.getElementById(id);
    if(!b)return;
    b.disabled=busy||!ok;
    b.classList.toggle('needs-apikey',!ok&&!busy);
    b.title=!ok?l.apiKeyHint:'';
  });
  const sub=document.getElementById('f-submit');
  if(sub){
    const canGrade=ok&&!busy&&!!st.fill;
    sub.disabled=!canGrade;
    sub.classList.toggle('needs-apikey',!ok);
    sub.title=!ok?l.apiKeyHint:(!st.fill?(st.lang==='ja'?'先に問題を生成してください':'Generate a problem first'):'');
  }
  const csub=document.getElementById('c-submit');
  if(csub){
    const canCrit=ok&&!busy&&!!st.critique;
    csub.disabled=!canCrit;
    csub.classList.toggle('needs-apikey',!ok);
    csub.title=!ok?l.apiKeyHint:(!st.critique?(st.lang==='ja'?'先に問題を生成してください':'Generate a problem first'):'');
  }
  const asub=document.getElementById('a-submit');
  if(asub){
    const canAme=ok&&!busy&&!!st.ame;
    asub.disabled=!canAme;
    asub.classList.toggle('needs-apikey',!ok);
    asub.title=!ok?l.apiKeyHint:(!st.ame?(st.lang==='ja'?'先に問題を生成してください':'Generate a problem first'):'');
  }
}
function toggleApiBar(){
  const body=document.getElementById('api-bar-body');
  const chevron=document.getElementById('api-bar-chevron');
  const isCollapsed=body.classList.contains('collapsed');
  body.classList.toggle('collapsed',!isCollapsed);
  chevron.classList.toggle('collapsed',!isCollapsed);
}
function collapseApiBar(){
  const statusEl=document.getElementById('api-bar-status');
  if(statusEl)statusEl.textContent='✓ '+L[st.lang].saved;
  const body=document.getElementById('api-bar-body');
  const chevron=document.getElementById('api-bar-chevron');
  if(body)body.classList.add('collapsed');
  if(chevron)chevron.classList.add('collapsed');
}
function loadApiKey(){
  const v=localStorage.getItem(APIKEY_KEY);
  if(v){
    document.getElementById('apikey').value=v;
    collapseApiBar();
  }
  updateApiKeyUI();
}
function saveApiKey(){
  const k=document.getElementById('apikey').value.trim();
  if(!k){alert(L[st.lang].noApiKey);return;}
  localStorage.setItem(APIKEY_KEY,k);
  const bar=document.getElementById('api-bar');
  const btn=document.querySelector('.api-save-btn');
  const lbl=document.getElementById('ui-save-btn');
  bar.classList.add('flash-saved');
  btn.classList.add('saved');
  if(lbl)lbl.textContent=L[st.lang].saveBtnDone;
  showToast(L[st.lang].apiKeySaved);
  collapseApiBar();
  updateApiKeyUI();
  setTimeout(()=>{
    bar.classList.remove('flash-saved');
    btn.classList.remove('saved');
    if(lbl)lbl.textContent=L[st.lang].saveBtn;
  },2000);
}
function getKey(silent){
  const k=document.getElementById('apikey').value.trim();
  if(!k){if(!silent)alert(L[st.lang].noApiKey);return null;}
  return k;
}

// ── Claude API ────────────────────────────────────────────
async function callClaude(prompt,sys,maxTok=2500,temperature=0.9){
  return callClaudeMsg(sys,prompt,maxTok,temperature);
}
async function callClaudeMsg(sys,content,maxTok=2500,temperature=0.9){
  const key=getKey();if(!key)return null;
  const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:maxTok,temperature,system:sys,messages:[{role:'user',content}]})});
  if(!res.ok){let m='API error '+res.status;try{const e=await res.json();m=e.error?.message||m;}catch{}throw new Error(m);}
  const d=await res.json();return d.content?.[0]?.text||'';
}
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(String(r.result).split(',')[1]||'');
    r.onerror=()=>reject(new Error('Failed to read image'));
    r.readAsDataURL(file);
  });
}
function parseModelJSON(raw){
  const s=String(raw||'').trim();
  const tryParse=str=>{try{return JSON.parse(str);}catch{return null;}};
  const fenced=s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if(fenced){const p=tryParse(fenced[1].trim());if(p)return p;}
  const direct=tryParse(s);if(direct)return direct;
  const start=s.indexOf('{');
  if(start>=0){
    let depth=0,inStr=false,esc=false;
    for(let i=start;i<s.length;i++){
      const c=s[i];
      if(inStr){
        if(esc)esc=false;
        else if(c==='\\')esc=true;
        else if(c==='"')inStr=false;
        continue;
      }
      if(c==='"'){inStr=true;continue;}
      if(c==='{')depth++;
      else if(c==='}'){
        depth--;
        if(depth===0){
          const p=tryParse(s.slice(start,i+1));
          if(p)return p;
          break;
        }
      }
    }
  }
  const m=s.match(/\{[\s\S]*\}/);
  if(m){const p=tryParse(m[0]);if(p)return p;}
  throw new Error('JSON not found');
}
function safeJSON(raw){return parseModelJSON(raw);}
function normalizeFillFromModel(p){
  const root=p?.problem||p?.data||p||{};
  let text=String(root.text||root.passage||root.content||root.article||'').trim();
  let answers=root.answers;
  if(!Array.isArray(answers)&&Array.isArray(root.blanks)){
    answers=root.blanks.map(b=>typeof b==='string'?b:(b?.answer||b?.correct||b?.word||b?.value||''));
  }
  if(!Array.isArray(answers))answers=[];
  answers=answers.map(a=>typeof a==='string'?a:(a?.answer||a?.word||a?.text||'')).filter(Boolean);
  if(text&&/\{\{?\d+\}?\}/.test(text)){
    for(let i=0;i<answers.length;i++)text=text.replace(new RegExp(`\\{\\{?${i}\\}?\\}`,'g'),`【_${i+1}_】`);
  }
  let hints=root.hints;
  if(!Array.isArray(hints)&&Array.isArray(root.blanks))hints=root.blanks.map(b=>b?.hint||'');
  return{...root,text,answers,hints:Array.isArray(hints)?hints:[]};
}
function normalizeAmeFromModel(p){
  const root=p?.problem||p?.data||p?.result||p||{};
  const pick=(obj)=>{
    const article=String(obj.article||obj.text||obj.passage||obj.body||obj.content||obj.記事||'').trim();
    let questions=obj.questions||obj.設問||obj.items||obj.prompts;
    if(typeof questions==='string')questions=parseF(questions);
    if(!Array.isArray(questions)&&questions&&typeof questions==='object')questions=Object.values(questions);
    if(!Array.isArray(questions))questions=[];
    questions=questions.map((q,i)=>{
      if(typeof q==='string')return{id:i+1,type:'',question:q,targetChars:150};
      return{
        id:q.id||i+1,
        type:q.type||q.タイプ||'',
        question:q.question||q.q||q.prompt||q.設問||q.設問文||'',
        targetChars:parseInt(q.targetChars||q.chars||q.字数,10)||150,
      };
    });
    return{article,questions};
  };
  let{article,questions}=pick(root);
  if(!article||!questions.length){
    for(const v of Object.values(root)){
      if(!v||typeof v!=='object'||Array.isArray(v))continue;
      const nested=pick(v);
      if(nested.article&&nested.questions.length){article=nested.article;questions=nested.questions;break;}
    }
  }
  return{
    ...root,theme:root.theme,article,law:root.law||root.法則||null,
    constraint:root.constraint||root.制約||null,questions,
    form:root.form||root.type||root.形式||null,
  };
}

// ── GAS ──────────────────────────────────────────────────
async function gasGet(sheet){const r=await fetch(GAS_URL+'?sheet='+sheet+'&t='+Date.now());if(!r.ok)throw new Error('Load failed '+r.status);return r.json();}
async function gasPost(data){const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(data)});if(!r.ok)throw new Error('Write failed '+r.status);return r.json();}
let gasV3Ok=null;
async function gasPing(){
  try{
    const r=await fetch(GAS_URL+'?ping=1&t='+Date.now(),{redirect:'follow'});
    if(r.status>=400)return null;
    const text=await r.text();
    if(!text)return null;
    try{return JSON.parse(text);}catch{
      const m=text.match(/\{[\s\S]*\}/);
      return m?JSON.parse(m[0]):null;
    }
  }catch{return null;}
}
function isGasV3Payload(p){
  return !!(p&&(Number(p.version)===3
    ||(Array.isArray(p.critiqueCols)&&p.critiqueCols.includes('questions'))
    ||(Array.isArray(p.ameCols)&&p.ameCols.includes('article'))
    ||(Array.isArray(p.summaryCols)&&p.summaryCols.includes('text'))));
}
function rowLooksLikeFill(r){
  return !!(r&&r.answers!==undefined&&r.answers!==null&&String(r.answers)!=='');
}
function rowLooksLikeSummary(r){
  return !!(r&&r.ratio!==undefined&&String(r.ratio)!=='');
}
function rowLooksLikeCritique(r){
  if(!r||rowLooksLikeFill(r)||rowLooksLikeAme(r)||rowLooksLikeSummary(r))return false;
  const hasForm=r.form!==undefined&&String(r.form).trim()!=='';
  const q=String(r.questions||'').trim();
  return hasForm||(q.length>2&&(q.startsWith('[')||q.startsWith('{')));
}
function rowLooksLikeAme(r){
  return !!(r&&r.article!==undefined&&String(r.article).trim()!=='');
}
function filterPastRowsByMode(mode,rows){
  const list=Array.isArray(rows)?rows:[];
  if(mode==='fill')return list.filter(rowLooksLikeFill);
  if(mode==='summary')return list.filter(rowLooksLikeSummary);
  if(mode==='critique')return list.filter(rowLooksLikeCritique);
  if(mode==='ame')return list.filter(rowLooksLikeAme);
  return list;
}
async function gasGetPast(mode){
  const raw=await gasGet(mode);
  const rows=filterPastRowsByMode(mode,raw);
  if(mode!=='fill'&&Array.isArray(raw)&&raw.length>0&&rows.length===0&&raw.some(rowLooksLikeFill)){
    throw new Error(st.lang==='ja'
      ?'GASが古いデプロイの可能性があります。gas-script-v3.js を「新しいデプロイ」し、GAS_URLを更新してください。'
      :'GAS may be an old deployment. Redeploy gas-script-v3.js and update GAS_URL.');
  }
  return rows;
}
function assignPastStore(mode,rows){
  if(mode==='fill')st.fPast=rows;
  else if(mode==='summary')st.sPast=rows;
  else if(mode==='critique')st.cPast=rows;
  else st.aPast=rows;
}
function pastSyncCount(mode){
  return pastList(mode).length;
}
async function ensureGasV3(){
  if(gasV3Ok===true)return true;
  const p=await gasPing();
  if(isGasV3Payload(p)){gasV3Ok=true;return true;}
  if(p===null){
    // ping が CORS/リダイレクトで失敗しても POST は通ることがある → 保存は試す
    return true;
  }
  gasV3Ok=false;
  const msg=st.lang==='ja'
    ?'GASがv3ではありません。Apps Scriptに gas-script-v3.js を貼り「新しいデプロイ」し、index.html の GAS_URL を新URLに合わせてください。'
    :'GAS is not v3. Redeploy gas-script-v3.js and set GAS_URL to the new web app URL.';
  alert(msg);
  return false;
}

// ── 印刷 ─────────────────────────────────────────────────
function doPrint(mode,part){
  if(part==='a'){const fbId=mode==='fill'?'f-fb':mode==='summary'?'s-fb':mode==='critique'?'c-fb':'a-fb';const fb=document.getElementById(fbId);if(!fb||fb.innerHTML.trim()===''){alert(st.lang==='ja'?'先に添削を実行してください。':'Please grade first.');return;}}
  window.print();
}

// ══════════════════════════════════════════════════════════
// 穴埋め
// ══════════════════════════════════════════════════════════

function autoResize(el){
  el.style.height='auto';
  el.style.height=el.scrollHeight+'px';
}
function setThemeMode(m,mode){
  const key=m+'ThemeMode';
  st[key]=mode;
  document.querySelectorAll(`#${m}-theme-mode .mode-btn`).forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  const input=document.getElementById(`${m}-theme`);
  if(!input)return;
  input.placeholder='';
  if(mode==='keyword'){
    input.rows=1;
    input.style.height='';
    autoResize(input);
  }else{
    input.style.height='72px';
  }
}
function buildThemeInst(themeIn,themeMode,length,isEN,forSummary){
  if(!themeIn){
    if(isEN){
      return forSummary
        ?`Choose a theme from: recent global economic topics, cutting-edge science and technology, or health and medicine. Create one reading passage of approximately ${length} characters.`
        :`Choose a theme from: recent global economic topics, cutting-edge science and technology, or health and medicine. Write a logical text of approximately ${length} characters.`;
    }
    return `テーマは以下のカテゴリから選んでください：最近の世界経済のトピック、科学技術の最前線、健康・医療に関するトピック。約${length}文字の${forSummary?'読解用文章（問題文）を1つ':'論理的な文章を'}作成してください。`;
  }
  if(themeMode==='keyword'){
    return isEN
      ?(forSummary?`Create one reading passage of about ${length} characters on the theme "${themeIn}".`:`Write a logical text of about ${length} characters on the theme "${themeIn}".`)
      :(forSummary?`テーマ「${themeIn}」について、約${length}文字の読解用文章（問題文）を1つ作成してください。`:`テーマ「${themeIn}」について、約${length}文字の論理的な文章を作成してください。`);
  }
  return isEN
    ?`The user has the following question or problem: "${themeIn}"
Write a logical argumentative text of about ${length} characters that explores and answers this question.
The text should naturally lead the reader toward understanding the answer through logical reasoning.
The answer to the question should be embedded within the text's argument, not stated directly as a simple conclusion.`
    :`ユーザーが気になっている課題・疑問：「${themeIn}」
この課題・疑問に対して論理的に展開した約${length}文字の文章を作成してください。
文章は課題への回答を直接述べるのではなく、論拠を積み重ねながら読者が自然に答えにたどり着けるよう構成してください。
問題文中では課題への言及は冒頭の文脈設定程度に留め、主に論理的な論証の展開を重視してください。`;
}
function autoThemeInst(length,isEN,forSummary){
  if(isEN){
    return `Choose a theme from the following categories:
recent global economic topics (inflation, monetary policy, industrial transformation, etc.),
cutting-edge science and technology (AI, quantum computing, space exploration, biotechnology, etc.),
or health and medicine (public health, mental health, aging society, etc.).
${forSummary?`Create one reading passage of approximately ${length} characters.`:`Write a logical text of approximately ${length} characters.`}`;
  }
  return `テーマは以下のカテゴリから適切なものを選んでください：
最近の世界経済のトピック（インフレ・金融政策・産業転換など）、
科学技術の最前線（AI・量子コンピュータ・宇宙開発・バイオテクノロジーなど）、
健康・医療に関するトピック（公衆衛生・精神健康・老齢化社会など）。
約${length}文字の${forSummary?'読解用文章（問題文）を1つ':'論理的な文章を'}作成してください。`;
}
function hasFillHint(h){return !!(h&&String(h).trim());}
function buildFillAnswerItem(i,hint,inputId,noPrint){
  const item=document.createElement('div');
  item.className='answer-item';
  const row=document.createElement('div');
  row.className='answer-row';
  const num=i+1;
  row.innerHTML=`<label>（${num}）</label><input type="text" id="${inputId}" placeholder=""
    oninput="syncBlank(${num}, this.value)"
    onblur="syncBlank(${num}, this.value)"/>`;
  item.appendChild(row);
  if(hasFillHint(hint)){
    const ht=document.createElement('div');
    ht.className='hint-text'+(noPrint?' no-print':'');
    ht.textContent=hint;
    item.appendChild(ht);
  }
  return item;
}
function syncBlank(num,value){
  const blankEl=document.getElementById(`blank-${num}`);
  if(!blankEl) return;
  blankEl.style.borderColor='';
  blankEl.style.background='';
  blankEl.style.color='';
  const v=value.trim();
  if(v===''){
    blankEl.textContent=`（${num}）`;
    blankEl.classList.remove('filled');
  }else{
    blankEl.textContent=v.length>5?v.slice(0,5)+'…':v;
    blankEl.classList.add('filled');
  }
}
function resetBlankStyles(){
  document.querySelectorAll('.blank').forEach(el=>{
    el.style.borderColor='';
    el.style.background='';
    el.style.color='';
    el.classList.remove('filled');
  });
}
function applyFillBlankGrade(prob){
  prob.answers.forEach((ans,i)=>{
    const blankEl=document.getElementById(`blank-${i+1}`);
    if(!blankEl) return;
    const userAns=prob.userAnswers?.[i]||'';
    const isCorrect=String(userAns).trim()===String(ans).trim();
    blankEl.style.borderColor=isCorrect?'var(--green)':'#c0453a';
    blankEl.style.background=isCorrect?'var(--green-bg)':'#fce8e8';
    blankEl.style.color=isCorrect?'var(--green-text)':'#701510';
  });
}
function getFillPrompts(){
  const l=st.lang;
  if(l==='ja') return {
    1:`難易度1（入門）:
- 文書タイプ：社内メール・業務連絡（ビジネス文書）
- 文字数：400〜500字
- 構造：「状況説明→1つの要点→まとめ・依頼」のシンプルな3段構成。
  各文が前の文を受けて自然につながること
- 接続詞：「しかし」「そのため」「また」「一方」「つまり」「なお」など
  ビジネスメールで日常的に使われる基本的なもののみ
- 穴抜き：2個
- ヒント：各空欄に「逆接」「順接」などの関係性を必ず明記すること`,
    2:`難易度2（基礎）:
- 文書タイプ：議事録・進捗報告（ビジネス文書）
- 文字数：400〜500字
- 構造：「現状説明→課題・論点2つ→対応方針」の構成。
  段落間のつながりが明確であること
- 接続詞：「ただし」「したがって」「なぜなら」「一方で」「これにより」など
  因果・逆接・補足を含むビジネス文書で標準的なもの
- 穴抜き：3個
- ヒント：前後の文脈から推測できる軽いヒントを付けること`,
    3:`難易度3（標準）:
- 文書タイプ：提案書・企画書の一節（ビジネス文書）
- 文字数：400〜500字
- 構造：「課題提起→根拠2〜3つ→反論への言及→提案・結論」の構成。
  対比・譲歩を含む構造であること。
  各段落が前段落の内容を受けて展開すること
- 接続詞：「もっとも」「ただし」「むしろ」「他方」「それでもなお」など
  似た意味の中から正確なものを選ぶ力が問われるもの
- 穴抜き：3個
- ヒント：なし（hintsはすべて空文字列）`,
    4:`難易度4（上級）:
- 文書タイプ：分析レポート・調査報告（ビジネス文書）
- 文字数：400〜500字
- 構造：「課題提起→根拠2〜3つ→反論処理→結論・提言」の2層構造。
  主張と反論処理が明確に区別されていること。
  接続詞を変えると論旨が崩れるよう文章を構成すること
- 接続詞：「しかしながら」「それゆえに」「のみならず」「ひいては」「翻って」など
  ビジネス文書の上位文体で使われる精密な接続詞。
  類似する接続詞との差異が問われるよう設計すること
- 穴抜き：4個
- ヒント：なし（hintsはすべて空文字列）`,
    5:`難易度5（超難問）:
- 文書タイプ：経営戦略文書・コンサルレポート（ビジネス文書）
- 文字数：400〜500字
- 構造：「課題提起→根拠3つ以上→留保・例外→反論処理→結論・提言」の3層構造。
  多層的な論証・留保・逆説的な展開を含むこと。
  各層が前の層の内容を受けて展開すること。
  接続詞を変えると論旨が崩れるよう緻密に設計すること
- 接続詞：「しかしながら」「それゆえ」「のみならず」「してみれば」「もとより」など
  経営・コンサル文書で使われる高度な接続表現。
  複数の解釈が成立しうる文脈に配置し
  正答が一意に定まるよう緻密に設計すること
- 穴抜き：5個
- ヒント：なし（hintsはすべて空文字列）`
  };
  return {
    1:`Difficulty 1 (Beginner):
- Document type: Internal email / business communication
- Length: 400-500 characters
- Structure: Simple 3-part structure (situation → one key point → summary/request).
  Each sentence should flow naturally from the previous one.
- Conjunctions: basic business email connectors only
  (however, therefore, also, in addition, in other words, please note that)
- Blanks: 2
- Hints: specify the logical relation (e.g. "contrast", "result") for each blank`,
    2:`Difficulty 2 (Basic):
- Document type: Meeting minutes / progress report
- Length: 400-500 characters
- Structure: Current situation → 2 issues/points → action plan.
  Logical connections between paragraphs must be clear.
- Conjunctions: standard business document connectors including causal, adversative, supplementary
  (however, therefore, because, on the other hand, as a result, that said)
- Blanks: 3
- Hints: light contextual hints`,
    3:`Difficulty 3 (Standard):
- Document type: Proposal / project plan excerpt
- Length: 400-500 characters
- Structure: Issue → 2-3 pieces of evidence → reference to counterargument → proposal/conclusion.
  Must include contrast and concession.
  Each paragraph must develop from the previous paragraph's content.
- Conjunctions: precise selection required among similar business document connectors
  (nonetheless, that said, rather, on the other hand, even so)
- Blanks: 3
- Hints: none (all hints must be empty strings)`,
    4:`Difficulty 4 (Advanced):
- Document type: Analysis report / research findings
- Length: 400-500 characters
- Structure: Issue → 2-3 pieces of evidence → counterargument handling → conclusion/recommendation (2-layer).
  Main argument and counterargument handling must be clearly distinguished.
  Design sentences so that substituting a conjunction collapses the argument.
- Conjunctions: precise upper-register business document connectors
  (nevertheless, consequently, not only that, by extension, on reflection)
  where substitution collapses the argument
- Blanks: 4
- Hints: none (all hints must be empty strings)`,
    5:`Difficulty 5 (Master):
- Document type: Management strategy document / consulting report
- Length: 400-500 characters
- Structure: Issue → 3+ pieces of evidence → reservation/exception → counterargument handling → conclusion/recommendation (3-layer).
  Must include multi-layer reasoning and reservations.
  Each layer must develop from the previous layer's content.
  Design so that substituting a conjunction definitively collapses the argument.
- Conjunctions: high-register strategy/consulting document connectors
  (nevertheless, consequently, not only that, upon reflection, to be sure)
  placed in contexts where only one connector is logically correct
- Blanks: 5
- Hints: none (all hints must be empty strings)`
  };
}
function getSumPrompts(){
  const l=st.lang;
  if(l==='ja') return {
    1:'難易度1（基礎）: 社内メール・業務連絡（ビジネス文書）。設問：主張のまとめ1問。約60%に圧縮できる内容。主張と根拠が明確で具体例を削ることで圧縮できる構造にすること。',
    2:'難易度2（標準）: 議事録・進捗報告（ビジネス文書）。設問：主張のまとめ・用語の説明の2問。約50%に圧縮できる内容。ビジネス用語や略語を1〜2個含めること。',
    3:'難易度3（応用）: 提案書・企画書の一節（ビジネス文書）。課題→根拠→提案の構造を持つこと。設問：用語の説明・主張のまとめ・理由の説明の3問。約40%に圧縮できる内容。',
    4:'難易度4（上級）: 分析レポート・調査報告（ビジネス文書）。データの解釈と複数の根拠を含む構造にすること。設問：用語の説明・主張のまとめ・理由の説明の3問。約30%に圧縮できる内容。',
    5:'難易度5（超難問）: 経営戦略文書・コンサルレポート（ビジネス文書）。多層的な論証と専門的なビジネス用語を含むこと。設問：用語の説明・主張のまとめ・理由の説明の3問。約20%に圧縮できる内容。'
  };
  return {
    1:'Difficulty 1 (Basic): Internal email / business communication. Question: Main claim summary only (1 question). Target: ~60% of original. Design so claims and evidence are clear and specific examples can be removed.',
    2:'Difficulty 2 (Standard): Meeting minutes / progress report. Questions: Main claim + Term explanation (2 questions). Target: ~50% of original. Include 1-2 business terms or abbreviations.',
    3:'Difficulty 3 (Advanced): Proposal / project plan excerpt. Must follow issue → evidence → proposal structure. Questions: Term explanation + Main claim + Reason (3 questions). Target: ~40% of original.',
    4:'Difficulty 4 (Expert): Analysis report / research findings. Include data interpretation and multiple pieces of evidence. Questions: Term explanation + Main claim + Reason (3 questions). Target: ~30% of original.',
    5:'Difficulty 5 (Master): Management strategy document / consulting report. Include multi-layer reasoning and specialized business terminology. Questions: Term explanation + Main claim + Reason (3 questions). Target: ~20% of original.'
  };
}

async function generateFill(){
  if(isBusy()||!hasApiKey())return;
  const themeIn=document.getElementById('f-theme').value.trim();
  const diff=st.fDiff;
  const length=F_LENGTH;
  const blanks=calcBlanks(diff);
  const isEN=st.lang==='en';
  document.getElementById('fill-result').style.display='none';
  const fpa=document.getElementById('f-print-area');if(fpa)fpa.style.display='none';
  if(!beginGen('fill'))return;

  const sys=isEN
    ?'You are an expert in business writing and logical communication. The educational goal of this tab is to train learners to precisely read the logical connections between sentences in business documents. Design the passage so that the choice of conjunction determines whether the argument holds — substituting the wrong conjunction must break the meaning. Respond ONLY in valid JSON format. No markdown, no explanation before or after the JSON.'
    :'あなたはビジネス文書の作成と論理的コミュニケーションの専門家です。このタブの教育目的は「ビジネス文書における文と文の間の論理的接続を精確に読み取る力を鍛えること」です。問題文はビジネス現場で実際に使われる文書（メール・報告書・提案書など）の文体で作成し、接続詞の選択が論旨の成否を左右する構造にしてください。正解以外の接続詞を入れると文意が崩れるよう設計してください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
  const themeInst=buildThemeInst(themeIn,'keyword',length,isEN,false);
  const diffPrompt=getFillPrompts()[diff];
  let jsonInst=isEN
    ?`Replace ${blanks} conjunctions with placeholders [_1_][_2_]... Return ONLY this JSON:\n{"theme":"topic in 5 words or less","text":"problem text with placeholders","answers":["conj1","conj2"],"hints":["hint1","hint2"]}`
    :`その文章の中で接続詞のうち${blanks}個を選び、【_1_】【_2_】...のような番号付きプレースホルダーで置き換えてください。\n返答はJSON形式のみ：\n{"theme":"テーマを10文字以内で","text":"問題文","answers":["接続詞1"],"hints":["ヒント1"]}`;
  if(diff>=3) jsonInst+=isEN?FILL_HINT_NONE_NOTE_EN:FILL_HINT_NONE_NOTE_JA;

  try{
    const genMaxTokens=1200;
    const formatNote=isEN?FILL_FORMAT_NOTE_EN:FILL_FORMAT_NOTE_JA;
    const raw=await callClaude(`${themeInst}\n${diffPrompt}\n${jsonInst}\n${formatNote}`,sys,genMaxTokens,0.9);
    if(!raw)return;
    const p=normalizeFillFromModel(parseModelJSON(raw));
    if(!p.text||!Array.isArray(p.answers)||p.answers.length===0)throw new Error('Invalid JSON structure: missing text or answers');
    if(isEN){
      let t=p.text;
      for(let i=1;i<=p.answers.length;i++) t=t.replace(`[_${i}_]`,`【_${i}_】`);
      p.text=t;
    }
    if(diff>=3) p.hints=(p.answers||[]).map(()=>'');
    st.fill={...p,id:Date.now(),theme:p.theme||(themeIn?themeIn.slice(0,20):''),diff,date:new Date().toISOString(),blanks,feedback:null,userAnswers:null,lang:st.lang};
    renderFill(st.fill);
    try{await syncPastOnGen('fill',st.fill);}
    catch(syncErr){setSync('fill','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].genFailed+'\n'+e.message);}
  finally{endGen('fill');}
}

function renderFill(prob){
  resetBlankStyles();
  const l=L[st.lang];
  document.getElementById('f-theme-tag').innerHTML=`<span class="theme-tag">${l.theme}${esc(prob.theme||'—')}</span>`;
  document.getElementById('f-ph').innerHTML=`<h2>${l.appTitle} — ${l.tabFill}</h2><p>${l.theme}${esc(prob.theme||'—')}　${l.diff}${dlabel(prob.diff)}　${fmtDate(prob.date)}</p><p style="font-size:10pt;margin-top:.4rem;">${l.fPrintInst}</p>`;
  let html=esc(prob.text);
  for(let i=1;i<=prob.answers.length;i++) html=html.replace(`【_${i}_】`,`<span class="blank" id="blank-${i}">（${i}）</span>`);
  document.getElementById('f-problem').innerHTML=html;
  const sec=document.getElementById('f-answers');sec.innerHTML=`<p class="slabel no-print">${l.answerBox}</p>`;
  prob.answers.forEach((_,i)=>{
    sec.appendChild(buildFillAnswerItem(i,prob.hints?.[i],`fans-${i}`,true));
  });
  document.getElementById('f-fb').innerHTML='';
  const fCopy=document.getElementById('f-copy-bar');
  if(fCopy)fCopy.style.display='none';
  document.getElementById('f-pa-btn').style.display='none';
  document.getElementById('f-print-area').style.display='flex';
  document.getElementById('fill-result').style.display='block';
  document.getElementById('fs1').className='step done';
  document.getElementById('fs2').className='step active';
  document.getElementById('fs3').className='step';
  updateApiKeyUI();
}

async function submitFill(){
  if(isBusy()||!hasApiKey())return;
  const prob=st.fill;if(!prob)return;
  const ua=prob.answers.map((_,i)=>document.getElementById(`fans-${i}`)?.value.trim()||'—');
  if(!beginGrade())return;
  const fb=document.getElementById('f-fb');
  try{
    setGradePhase('llm');
    const res=await gradeFill(prob,ua);if(!res)return;
    setGradePhase('process');
    prob.feedback=res;prob.userAnswers=ua;
    applyFillBlankGrade(prob);
    fb.innerHTML=`<div class="feedback-box">${formatFeedback100(res,prob.lang)}</div>`;
    document.getElementById('fs2').className='step done';
    document.getElementById('fs3').className='step done';
    document.getElementById('f-pa-btn').style.display='';
    showCopyBar('fill');
  }catch(e){fb.innerHTML=`<p class="err">${L[st.lang].gradingErr}: ${e.message}</p>`;}
  finally{endGrade();}
}

async function gradeFill(prob,ua){
  const isEN=prob.lang==='en'||(prob.lang===undefined&&st.lang==='en');
  const sys=isEN
    ?'You are an expert educator in business writing. The goal of feedback is to help learners understand WHY a specific conjunction is logically necessary in the context of business documents — not just correct. Explain the logical relationship between adjacent sentences, the difference from alternative conjunctions, and how the conjunction fits the overall argument. Give structured feedback in English using markdown (## headings, **bold**, numbered lists).'
    :'あなたはビジネス文書の論理的表現に関する教育専門家です。フィードバックの目的は「なぜその接続詞でなければならないか」という論理的必然性を、ビジネス文書の文脈で学習者に理解させることです。前後の文の論理関係・代替接続詞との差異・文書全体の論証構造を踏まえて解説してください。マークダウン（**太字**、## 見出し、番号リスト）を使って構造的に日本語でフィードバックしてください。';
  const ct=prob.answers.reduce((t,a,i)=>t.replace(`【_${i+1}_】`,`[${a}]`),prob.text);
  const prompt=isEN?`${FILL_SCORE100_NOTE_EN}

Grade this fill-in-the-blank problem (Difficulty ${prob.diff}/5).

[Problem with correct answers]
${ct}

[Correct answers]
${prob.answers.map((a,i)=>`(${i+1}) ${a}`).join('\n')}

[Learner's answers]
${ua.map((a,i)=>`(${i+1}) ${a}`).join('\n')}

## Fully Supplemented Text
「Fully Supplemented Text」 — Rewrite the original text with ALL sentence boundaries supplemented with appropriate conjunctions (not just the blanks). Show every supplemented conjunction in **bold**.
For conjunctions that correspond to the fill-in-the-blank answers, add the question number as a superscript immediately after the conjunction. Example: "however⁽¹⁾"

## Individual Question Feedback
For each number, mark ✓ correct or ✗ incorrect. Explain why the conjunction is appropriate and the logical relationship between sentences. Suggest alternatives if any.
At the end of each question's explanation, provide the following two items:
① One short example sentence (20 words or less) using the correct conjunction in a plain everyday context.
② Show what would happen to the argument if a different conjunction were used in this passage, and explain why the correct conjunction is the only valid choice.`
  :`${FILL_SCORE100_NOTE_JA}

穴埋め問題（難易度${prob.diff}/5）の添削をしてください。

【問題文（正解入り）】${ct}
【正解】${prob.answers.map((a,i)=>`（${i+1}）${a}`).join('\n')}
【学習者の回答】${ua.map((a,i)=>`（${i+1}）${a}`).join('\n')}

## 完全補完文
「完全補完文」として、元の文章のすべての文と文の間（穴埋め箇所以外も含む）に接続詞を補完した、論理的に完全な文章を作成してください。
補完した接続詞はすべて**太字**で示してください。
穴埋め問題の空欄に対応する接続詞には、補完した接続詞の直後に上付き文字で設問番号を示してください。例：「しかるに⁽¹⁾」のように記述してください。

## 各設問の正誤と解説
各番号について ✓正解 または ✗不正解 を明示し、なぜその接続詞が適切か前後の論理関係を説明してください。代替接続詞があれば添えてください。
各設問の解説の末尾に以下の2つを示してください。
① 正解の接続詞を使った日常的な文脈の例文を1つ（20字以内・平易な内容）
② この問題文において、正解の接続詞の代わりに別の接続詞を使った場合に論旨がどう変わるかを1つ示し、なぜ正解の接続詞でなければならないかを説明してください。`;
  const gradeMaxTokens=prob.diff<=3?1500:2500;
  return callClaude(prompt,sys,gradeMaxTokens,0.3);
}

function buildFillEntry(prob){
  return {id:prob.id||Date.now(),sheet:'fill',theme:prob.theme||'—',diff:prob.diff,date:prob.date,text:prob.text,answers:prob.answers,hints:prob.hints||[],feedback:prob.feedback||null,userAnswers:prob.userAnswers||[],lang:prob.lang||st.lang};
}
function buildSummaryEntry(prob){
  const questions=prob.questions;
  return {id:prob.id||Date.now(),sheet:'summary',theme:prob.theme||'—',diff:prob.diff,date:prob.date,text:prob.text||'',questions:typeof questions==='string'?questions:JSON.stringify(questions||[]),ratio:prob.ratio,lang:prob.lang||st.lang};
}
async function gasPostEntry(entry){
  const res=await gasPost(entry);
  if(res&&res.error)throw new Error(res.error);
  if(res&&res.ok===false)throw new Error('Save failed');
  if(isGasV3Payload(res))gasV3Ok=true;
  return res;
}
async function syncPastOnGen(mode,prob){
  if(!await ensureGasV3())return;
  let entry;
  if(mode==='fill')entry=buildFillEntry(prob);
  else if(mode==='summary')entry=buildSummaryEntry(prob);
  else if(mode==='critique')entry=buildCritiqueEntry(prob);
  else entry=buildAmeEntry(prob);
  prob.id=entry.id;
  setSync(mode,'spin',L[st.lang].genPhaseProcess+'...');
  await gasPostEntry(entry);
  const store=mode==='fill'?st.fPast:mode==='summary'?st.sPast:mode==='critique'?st.cPast:st.aPast;
  const idx=store.findIndex(p=>String(p.id)===String(entry.id));
  if(idx>=0)store[idx]=entry;else store.unshift(entry);
  renderPL(mode);
  setSync(mode,'ok',pastSyncCount(mode)+L[st.lang].syncItems);
  if(mode==='fill'||mode==='summary')showToast(mode==='fill'?L[st.lang].savedOk:L[st.lang].sSavedOk);
}

// ══════════════════════════════════════════════════════════
// 要約
// ══════════════════════════════════════════════════════════
function resetAnswerPhotos(){
  answerPhotos=[];
  ['s','c','pp'].forEach(sc=>{
    const preview=document.getElementById(sc+'-photo-preview');
    if(preview)preview.innerHTML='';
    const memo=document.getElementById(sc+'-photo-memo');
    if(memo)memo.value='';
    const zone=document.getElementById(sc+'-upload-zone');
    if(zone)zone.style.display='';
    const input=document.getElementById(sc+'-photo-input');
    if(input)input.value='';
  });
}
function buildAnswerModeBar(scope){
  const l=L[st.lang];
  return`<div class="answer-mode-bar no-print" id="${scope}-answer-mode-bar"><span class="label">${esc(l.ansModeLbl)}</span><div class="answer-mode-toggle"><button type="button" class="amode-btn active" id="${scope}-amode-text" onclick="setAnswerMode('${scope}','text')"><i class="ti ti-keyboard" aria-hidden="true"></i> <span>${esc(l.amodeText)}</span></button><button type="button" class="amode-btn" id="${scope}-amode-photo" onclick="setAnswerMode('${scope}','photo')"><i class="ti ti-camera" aria-hidden="true"></i> <span>${esc(l.amodePhoto)}</span></button></div></div>`;
}
function buildPhotoArea(scope){
  const l=L[st.lang];
  return`<div id="${scope}-photo-area" class="no-print" style="display:none;margin-bottom:1rem;"><span class="label">${esc(l.photoLbl)}</span><div class="upload-zone" id="${scope}-upload-zone" onclick="document.getElementById('${scope}-photo-input').click()"><i class="ti ti-camera-plus" aria-hidden="true" style="font-size:28px;display:block;margin-bottom:.4rem;opacity:.5;"></i><span>${esc(l.uploadHint)}</span><div style="font-size:11px;color:var(--text2);margin-top:4px;">${esc(l.uploadNote)}</div></div><input type="file" id="${scope}-photo-input" accept="image/*" multiple style="display:none;" onchange="handlePhotoUpload(event,'${scope}')"/><div class="photo-preview" id="${scope}-photo-preview"></div><span class="label" style="margin-top:.5rem;display:block;">${esc(l.memoLbl)}</span><textarea id="${scope}-photo-memo" rows="2" style="resize:none;font-size:13px;"></textarea></div>`;
}
function setAnswerMode(scope,mode){
  st.answerMode=mode;
  st.answerScope=scope;
  document.getElementById(scope+'-amode-text')?.classList.toggle('active',mode==='text');
  document.getElementById(scope+'-amode-photo')?.classList.toggle('active',mode==='photo');
  const questions=document.getElementById(scope+'-questions');
  const photoArea=document.getElementById(scope+'-photo-area');
  if(questions)questions.style.display=mode==='text'?'':'none';
  if(photoArea)photoArea.style.display=mode==='photo'?'':'none';
  const owarnId=scope==='s'?'s-owarn':scope==='pp'?'pp-owarn':null;
  if(owarnId)document.getElementById(owarnId)?.classList.remove('show');
  const btnId=scope==='s'?'s-submit':scope==='c'?'c-submit':scope==='a'?'a-submit':null;
  if(scope==='pp'){
    const ppBtn=document.getElementById('pp-submit')||document.getElementById('pp-c-submit')||document.getElementById('pp-a-submit');
    if(ppBtn)ppBtn.disabled=false;
  }else{
    const btn=document.getElementById(btnId);
    if(btn)btn.disabled=false;
  }
}
function resizeImage(dataUrl,maxSize,callback){
  const img=new Image();
  img.onload=()=>{
    const canvas=document.createElement('canvas');
    let w=img.width,h=img.height;
    if(w>maxSize||h>maxSize){
      if(w>h){h=Math.round(h*maxSize/w);w=maxSize;}
      else{w=Math.round(w*maxSize/h);h=maxSize;}
    }
    canvas.width=w;canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    callback(canvas.toDataURL('image/jpeg',0.85));
  };
  img.src=dataUrl;
}
function renderPhotoPreview(scope){
  const preview=document.getElementById(scope+'-photo-preview');
  if(!preview)return;
  preview.innerHTML=answerPhotos.map((p,i)=>`
    <div class="photo-thumb">
      <img src="${p.dataUrl}" alt="回答写真${i+1}"/>
      <button type="button" class="photo-del" onclick="removePhoto(${i},'${scope}')">✕</button>
    </div>
  `).join('');
  const zone=document.getElementById(scope+'-upload-zone');
  if(zone)zone.style.display=answerPhotos.length>=2?'none':'';
}
function removePhoto(idx,scope){
  answerPhotos.splice(idx,1);
  renderPhotoPreview(scope);
}
function handlePhotoUpload(event,scope){
  const files=Array.from(event.target.files||[]);
  const remaining=2-answerPhotos.length;
  files.slice(0,remaining).forEach(file=>{
    const reader=new FileReader();
    reader.onload=(e)=>{
      resizeImage(e.target.result,1000,(resizedDataUrl)=>{
        const [header,data]=resizedDataUrl.split(',');
        const mediaType=(header.match(/:(.*?);/)||[])[1]||'image/jpeg';
        answerPhotos.push({base64:data,mediaType,dataUrl:resizedDataUrl});
        renderPhotoPreview(scope);
      });
    };
    reader.readAsDataURL(file);
  });
  event.target.value='';
}
function copyResult(mode){
  let md='';
  const l=L[st.lang];
  const dateStr=new Date().toLocaleDateString(st.lang==='ja'?'ja-JP':'en-US');
  if(mode==='fill'){
    const prob=st.fill;if(!prob)return;
    const answers=prob.answers||[];
    const ua=prob.userAnswers||[];
    const solvedText=answers.reduce((t,a,i)=>t.replace(`【_${i+1}_】`,`**[${a}]**`),prob.text||'');
    md=[
      `# 穴埋め問題｜${prob.theme||''}`,
      `**難易度：** ${l.dLabels?.[prob.diff-1]||prob.diff}　**日付：** ${dateStr}`,
      '',
      '## 問題文（正解入り）',
      solvedText,
      '',
      '## 回答結果',
      ...answers.map((a,i)=>{
        const u=ua[i]||'（未回答）';
        const mark=u===a?'✓':'✗';
        return `- （${i+1}）${mark} あなたの回答：「${u}」　正解：「${a}」`;
      }),
      '',
      '## 解説',
      prob.feedback||''
    ].join('\n');
  }else if(mode==='summary'){
    const prob=st.summary;if(!prob)return;
    const p=normSummaryProb(prob);
    md=[
      `# 要約問題｜${prob.theme||''}`,
      `**難易度：** ${l.dLabels?.[prob.diff-1]||prob.diff}　**日付：** ${dateStr}`,
      '',
      '## 問題文',
      p.text||'',
      '',
      '## 設問と回答',
      ...p.questions.map((q,i)=>{
        const ans=document.getElementById(`sans-${i}`)?.value||'（未回答）';
        return [
          `### 設問${q.id||i+1}（目標：${q.targetChars}文字以内）`,
          q.question||'',
          '',
          '**あなたの回答：**',
          ans
        ].join('\n');
      }),
      '',
      '## 解説・添削',
      prob.feedback||''
    ].join('\n\n');
  }
  const done=()=>showToast(l.copiedMsg);
  if(navigator.clipboard?.writeText){
    navigator.clipboard.writeText(md).then(done).catch(()=>{
      const el=document.createElement('textarea');
      el.value=md;document.body.appendChild(el);el.select();
      document.execCommand('copy');document.body.removeChild(el);done();
    });
  }else{
    const el=document.createElement('textarea');
    el.value=md;document.body.appendChild(el);el.select();
    document.execCommand('copy');document.body.removeChild(el);done();
  }
}
async function generateSummary(){
  if(isBusy()||!hasApiKey())return;
  const themeIn=document.getElementById('s-theme').value.trim();
  const diff=st.sDiff;
  let length;
  if(diff<=3){length=S_LENGTH_FIXED[diff];}
  else{const vol=st.sVolume||'short';length=S_LENGTH_VARIABLE[vol].chars;}
  const numQ=calcBlocks(diff);
  const ratio=S_RATIO[diff];
  const themeMode=st.sThemeMode||'keyword';
  const isEN=st.lang==='en';
  document.getElementById('summary-result').style.display='none';
  const spa=document.getElementById('s-print-area');if(spa)spa.style.display='none';
  if(!beginGen('summary'))return;

  const sys=isEN
    ?'You are an expert in business writing and communication education. The educational goal of this tab is to train learners to compress business documents by retaining claims and evidence while cutting specific examples, and to answer only based on evidence from the document. Design the passage so it can be compressed by retaining the main argument and supporting evidence. Respond ONLY in valid JSON. No markdown fences, no explanation before or after.'
    :'あなたはビジネス文書の読解と論理的コミュニケーションの教育専門家です。このタブの教育目的は「ビジネス文書の主張と根拠を残しながら具体例を削る情報の取捨選択力」と「文書に書かれていることのみを根拠にして答える規律」を鍛えることです。問題文はビジネス現場で実際に使われる文書（議事録・報告書・提案書など）の文体で作成し、主張と根拠を残し具体例を削ることで圧縮できる構造にしてください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
  const themeInst=buildThemeInst(themeIn,themeMode,length,isEN,true);
  const diffPrompt=getSumPrompts()[diff];
  const types=getSumQuestionTypes(diff);
  const typesList=types.join(isEN ? ', ' : '、');
  const typeGuide=isEN
    ?`Generate exactly ${numQ} questions about the passage. Choose types from: ${typesList}. Vary types when possible.\ntargetChars guide: 用語の説明 ~50, 主張のまとめ 80-150, 理由の説明 ~100. Use the Japanese type names in the "type" field.\nDesign the passage so that it can be compressed by retaining claims and evidence while removing specific examples.`
    :`設問はちょうど${numQ}問。タイプは次から選ぶ: ${typesList}。可能ならタイプを分散させる。\ntargetCharsの目安: 用語の説明50字、主張のまとめ80〜150字、理由の説明100字。\n文章は「主張と根拠を残し具体例を削ることで圧縮できる」構造にすること。`;
  const jsonInst=isEN
    ?`Return ONLY this JSON:\n{"theme":"topic in 10 chars or less","text":"full passage ~${length} chars","questions":[{"id":1,"type":"用語の説明","question":"...","targetChars":50}]}\nquestions must have exactly ${numQ} items. "text" is one unified business document passage.`
    :`返答はJSONのみ：\n{"theme":"テーマ10文字以内","text":"約${length}文字の問題文","questions":[{"id":1,"type":"用語の説明","question":"文書中の「〇〇」とは…50字以内で説明しなさい。","targetChars":50}]}\nquestionsは${numQ}要素。textは1つのビジネス文書（議事録・報告書・提案書など）。`;

  try{
    const genMaxTokens=length<=500?1200:length<=2000?3000:6000;
    const formatNote=isEN?SUM_FORMAT_NOTE_EN:SUM_FORMAT_NOTE_JA;
    const raw=await callClaude(`${themeInst}\n${diffPrompt}\n${typeGuide}\n${jsonInst}\n${formatNote}`,sys,genMaxTokens,0.9);
    if(!raw)return;
    const p=safeJSON(raw);
    if(!p.text||!Array.isArray(p.questions)||p.questions.length===0)throw new Error('Invalid JSON structure');
    const questions=p.questions.map((q,i)=>({id:q.id||i+1,type:q.type||'主張のまとめ',question:q.question||'',targetChars:parseInt(q.targetChars)||50}));
    st.summary={id:Date.now(),theme:p.theme||(themeIn?themeIn.slice(0,20):''),diff,date:new Date().toISOString(),text:p.text,questions,ratio,length,sVolume:diff>=4?(st.sVolume||'short'):null,feedback:null,lang:st.lang};
    renderSummary(st.summary);
    try{await syncPastOnGen('summary',st.summary);}
    catch(syncErr){setSync('summary','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].genFailed+'\n'+e.message);}
  finally{endGen('summary');}
}

function renderSummary(prob){
  resetAnswerPhotos();
  const copyBar=document.getElementById('s-copy-bar');
  if(copyBar)copyBar.style.display='none';
  setAnswerMode('s','text');
  const l=L[st.lang];
  const p=normSummaryProb(prob);
  document.getElementById('s-theme-tag').innerHTML=`<span class="theme-tag">${l.theme}${esc(p.theme||'—')}</span>`;
  document.getElementById('s-ph').innerHTML=`<h2>${l.appTitle} — ${l.tabSum}</h2><p>${l.theme}${esc(p.theme||'—')}　${l.diff}${dlabel(p.diff)}　${fmtDate(p.date)}</p><p style="font-size:10pt;margin-top:.4rem;">${l.sPrintInst}</p>`;
  document.getElementById('s-problem-text').innerHTML=esc(p.text);
  document.getElementById('s-questions').innerHTML=p.questions.map((q,i)=>buildSummaryQuestionHtml(q,i,p.lang||st.lang,'live')).join('');
  document.getElementById('s-fb').innerHTML='';
  document.getElementById('s-pa-btn').style.display='none';
  document.getElementById('s-owarn').classList.remove('show');
  document.getElementById('s-submit').disabled=false;
  document.getElementById('s-print-area').style.display='flex';
  document.getElementById('summary-result').style.display='block';
  document.getElementById('ss1').className='step done';
  document.getElementById('ss2').className='step active';
  document.getElementById('ss3').className='step';
}

function updateSumCC(i,mode){
  if(st.answerMode==='photo')return;
  const taId=mode==='pp'?`pp-sans-${i}`:`sans-${i}`;
  const lblId=mode==='pp'?`pp-lbl-${i}`:`slbl-${i}`;
  const warnId=mode==='pp'?`pp-warn-${i}`:`swarn-${i}`;
  const ta=document.getElementById(taId);if(!ta)return;
  const target=parseInt(ta.dataset.target)||0;
  const cnt=ta.value.replace(/\s/g,'').length;
  const lbl=document.getElementById(lblId);
  const warn=document.getElementById(warnId);
  const l=L[st.lang];
  if(lbl){lbl.textContent=cnt+' / '+target+l.charOf;lbl.className='cc '+(cnt>target?'over':'ok2');}
  ta.classList.toggle('overlimit',cnt>target);
  if(warn){warn.textContent=cnt>target?`⚠ ${cnt-target}${l.charOver}`:'';warn.classList.toggle('show',cnt>target);}
  const sel=mode==='pp'?'[id^="pp-sans-"]':'[id^="sans-"]';
  const anyOver=[...document.querySelectorAll(sel)].some(t=>t.value.replace(/\s/g,'').length>parseInt(t.dataset.target||0));
  const gw=document.getElementById(mode==='pp'?'pp-owarn':'s-owarn');
  if(gw){gw.textContent=anyOver?l.overWarn:'';gw.classList.toggle('show',anyOver);}
  const btn=document.getElementById(mode==='pp'?'pp-submit':'s-submit');
  if(btn)btn.disabled=anyOver;
}
function updateCC(i){updateSumCC(i,'live');}

async function submitPhotoGrade(kind,prob,scope){
  if(answerPhotos.length===0){alert(L[st.lang].noPhotoError);return;}
  const btnId=scope==='pp'?(kind==='summary'?'pp-submit':kind==='ame'?'pp-a-submit':'pp-c-submit'):(kind==='summary'?'s-submit':kind==='ame'?'a-submit':'c-submit');
  const fbId=scope==='pp'?'pp-fb':(kind==='summary'?'s-fb':kind==='ame'?'a-fb':'c-fb');
  const btn=document.getElementById(btnId);
  const fb=document.getElementById(fbId);
  const l=L[prob.lang||st.lang];
  if(btn)btn.disabled=true;
  fb.innerHTML=`<p class="loading"><span class="dots">${l.photoGrading}</span></p>`;
  const isEN=(prob.lang||st.lang)==='en';
  const memo=document.getElementById(scope+'-photo-memo')?.value.trim()||'';
  const imageContents=answerPhotos.map(ph=>({type:'image',source:{type:'base64',media_type:ph.mediaType,data:ph.base64}}));
  try{
    let sys,content,gradeMaxTokens=2500;
    if(kind==='summary'){
      const p=normSummaryProb(prob);
      const totalTargetChars=p.questions.reduce((s,q)=>s+(q.targetChars||0),0);
      const qBlock=p.questions.map((q,i)=>isEN
        ?`[Question ${q.id||i+1}] Target: ${q.targetChars} chars or less\n${q.question}`
        :`【設問${q.id||i+1}】目標：${q.targetChars}文字以内\n${q.question}`).join('\n\n');
      const textPrompt=isEN
        ?`The following is the summarization problem the learner was given.\n\nProblem text:\n${p.text}\n\nQuestions:\n${qBlock}\n\nThe learner has submitted handwritten answers in the attached image(s).\n${memo?`Learner's note: ${memo}`:''}\n\nPlease:\n1. Read the handwritten text from the image(s).\n2. If the total handwritten answer appears to exceed 1.5× the total target character count (${Math.round(totalTargetChars*1.5)} chars), respond with 【Score: 0/100】 and state the reason clearly.\n3. Otherwise, grade each answer on content accuracy, conciseness, and expression.\n4. Give a total score out of 100 at the very top in the format: 【Score: XX/100】\n5. Provide block-by-block feedback and an overall comment.${SUM_SCORE100_NOTE_EN}`
        :`以下は学習者が取り組んだ要約問題です。\n\n問題文：\n${p.text}\n\n${qBlock}\n\n学習者は添付画像に手書きで回答しています。\n${memo?`学習者のメモ：${memo}`:''}\n\n以下の手順で採点してください。\n1. 画像から手書きのテキストを読み取ってください。\n2. 回答の総文字量が目標合計文字数の1.5倍（${Math.round(totalTargetChars*1.5)}文字）を大幅に超えていると判断される場合は、「文字数が大幅に超過しているため採点できません」として【スコア：0/100】としてください。\n3. それ以外の場合は、内容の正確さ・簡潔さ・表現を評価してください。\n4. 最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n5. 設問別フィードバックと総合コメントを記載してください。${SUM_SCORE100_NOTE_JA}`;
      sys=isEN
        ?'You are an expert writing teacher for business document comprehension. The goal of feedback is to evaluate whether the learner bases answers solely on the document, and whether they retain the main argument and evidence while cutting specific examples. Explicitly point out any interpretation or outside knowledge not grounded in the document. Give structured feedback in English using markdown.'
        :'あなたはビジネス文書の読解と記述指導の教育専門家です。フィードバックの目的は「文書に書かれていることのみを根拠にし、主張と根拠を残しながら具体例を削る情報の取捨選択ができているか」を評価することです。文書外の自分の解釈や知識を持ち込んでいる箇所があれば具体的に指摘してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
      content=[...imageContents,{type:'text',text:textPrompt}];
      const diff=prob.diff||st.sDiff;
      const length=prob.length||(diff<=3?S_LENGTH_FIXED[diff]:S_LENGTH_VARIABLE[(prob.sVolume||st.sVolume||'short')].chars);
      gradeMaxTokens=length<=500?1200:length<=2000?3000:6000;
    }else if(kind==='ame'){
      const p=normAmeProb(prob);
      const lawSection=p.law?(isEN?`[Law/Principle]\n${p.law}\n\n`:`【法則・前提】\n${p.law}\n\n`):'';
      const constraintSection=p.constraint?(isEN?`[Umbrella Constraint]\n${p.constraint}\n\n`:`【傘の制約条件】\n${p.constraint}\n\n`):'';
      const articleSection=isEN?`[Article]\n${p.article}\n\n`:`【記事】\n${p.article}\n\n`;
      const qBlock=p.questions.map((q,i)=>isEN
        ?`[Q${q.id||i+1}] ${q.type}\n${q.question}\nTarget: within ${q.targetChars} chars`
        :`【設問${q.id||i+1}】${q.type}\n${q.question}\n目標: ${q.targetChars}字以内`).join('\n\n---\n\n');
      const gradeInst=isEN
        ?`The learner submitted handwritten answers in the attached image(s).\n${memo?`Learner's note: ${memo}`:''}\n\nRead the handwriting, then grade each question on factual grounding, logical gaps, and alternative interpretations. Provide an improved example within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
        :`学習者は添付画像に手書きで回答しています。\n${memo?`学習者のメモ：${memo}`:''}\n\n手書きを読み取り、各設問を事実との整合性・飛躍の有無・別解の可能性の観点で採点し、改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
      const textPrompt=`${lawSection}${articleSection}${constraintSection}${qBlock}\n\n${gradeInst}`;
      sys=isEN
        ?'You are an expert in logical thinking and Sky-Rain-Umbrella reasoning education. The goal of feedback is to evaluate whether the interpretation is logically derived from facts, whether the action follows from the interpretation, and whether the learner recognizes alternative interpretations. Point out specific gaps and present one alternative interpretation, then provide an improved example. Give structured feedback in English using markdown.'
        :'あなたは論理的思考と空雨傘フレームワークの教育専門家です。フィードバックの目的は「事実から解釈への飛躍がないか」「解釈から行動への論理的なつながりがあるか」「同じ事実から別の解釈が導ける可能性に気づいているか」を評価することです。飛躍を具体的に指摘し、別解を1つ示した上で改善例を提示してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
      content=[...imageContents,{type:'text',text:textPrompt}];
      gradeMaxTokens=(p.diff||3)<=3?1500:2500;
    }else{
      const p=normCritiqueProb(prob);
      const passageSection=(p.form==='A'&&p.text)
        ?(isEN?`[Passage]\n${p.text}\n\n`:`【問題文】\n${p.text}\n\n`)
        :'';
      const qBlock=p.questions.map((q,i)=>{
        const argPart=(p.form==='B'&&q.argument)?(isEN?`[Argument]\n${q.argument}\n`:`【論証】\n${q.argument}\n`):'';
        return isEN
          ?`[Q${q.id||i+1}] Type: ${q.type}\n${argPart}${q.question}\nTarget: within ${q.targetChars} chars`
          :`【設問${q.id||i+1}】タイプ: ${q.type}\n${argPart}${q.question}\n目標: ${q.targetChars}字以内`;
      }).join('\n\n---\n\n');
      const gradeInst=isEN
        ?`The learner submitted handwritten answers in the attached image(s).\n${memo?`Learner's note: ${memo}`:''}\n\nRead the handwriting, then grade each question on:\n- Accuracy of gap/condition/structure identification\n- Logical validity of reasoning\n- Quality of written response\nProvide an improved example within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
        :`学習者は添付画像に手書きで回答しています。\n${memo?`学習者のメモ：${memo}`:''}\n\n手書きを読み取り、各設問を以下の軸で採点してください。\n- 飛躍・条件・構造の特定の正確さ\n- 学習者の推論の論理的妥当性\n- 記述の質（明確さ・簡潔さ）\n各設問の末尾に、文字数以内の改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
      const textPrompt=`${passageSection}${qBlock}\n\n${gradeInst}`;
      sys=isEN
        ?'You are an expert in logical thinking education. The goal of feedback is to evaluate how accurately the learner identified logical gaps, missing premises, or counterargument opportunities, and how well they articulated their findings in writing. Evaluate logical validity, accuracy of identification, and clarity of expression. Provide improved example answers. Give structured feedback in English using markdown.'
        :'あなたは論理的思考教育の専門家です。フィードバックの目的は「飛躍・前提の欠如・反論の余地をどれだけ正確に特定し、論理的な応答文として表現できているか」を評価することです。学習者の回答の論理的妥当性・特定の正確さ・記述の明確さを具体的に評価し、改善例を示してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
      content=[...imageContents,{type:'text',text:textPrompt}];
      gradeMaxTokens=(p.diff||3)<=3?1500:2500;
    }
    const res=await callClaudeMsg(sys,content,gradeMaxTokens,0.3);if(!res)return;
    if(kind==='summary'){
      fb.innerHTML=`<div class="feedback-box">${formatFeedback100(res,prob.lang||st.lang)}</div>`;
      prob.feedback=res;
      prob.answerMode='photo';
      if(scope==='s'){
        document.getElementById('ss2').className='step done';
        document.getElementById('ss3').className='step done';
        document.getElementById('s-pa-btn').style.display='';
        showCopyBar('summary');
      }else{
        document.getElementById('pp-s2').className='step done';
        document.getElementById('pp-s3').className='step done';
      }
    }else if(kind==='ame'){
      fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
      prob.feedback=res;
      if(scope==='a'){
        document.getElementById('as2').className='step done';
        document.getElementById('as3').className='step done';
        document.getElementById('a-pa-btn').style.display='';
        try{await syncAmePast(prob);}
        catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }else{
        document.getElementById('pp-s2').className='step done';
        document.getElementById('pp-s3').className='step done';
        try{await syncAmePast(prob);}
        catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }
    }else{
      fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
      prob.feedback=res;
      if(scope==='c'){
        document.getElementById('cs2').className='step done';
        document.getElementById('cs3').className='step done';
        document.getElementById('c-pa-btn').style.display='';
        try{await syncCritiquePast(prob);}
        catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }else{
        document.getElementById('pp-s2').className='step done';
        document.getElementById('pp-s3').className='step done';
        try{await syncCritiquePast(prob);}
        catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
      }
    }
  }catch(e){
    const errLbl=kind==='summary'?l.gradingErr:kind==='ame'?l.aGradingErr:l.cGradingErr;
    fb.innerHTML=`<p class="err">${errLbl}: ${e.message}</p>`;
  }
  if(btn)btn.disabled=false;
}

async function submitSummary(){
  const prob=st.summary;if(!prob)return;
  if(st.answerMode==='photo'&&st.answerScope==='s'){await submitPhotoGrade('summary',prob,'s');return;}
  const anyOver=[...document.querySelectorAll('[id^="sans-"]')].some(t=>t.value.replace(/\s/g,'').length>parseInt(t.dataset.target||0));
  if(anyOver){alert(L[st.lang].overWarn);return;}
  const userTexts=collectSummaryAnswers(prob,'live');
  const btn=document.getElementById('s-submit');btn.disabled=true;
  const fb=document.getElementById('s-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading}</span></p>`;
  const isEN=prob.lang==='en';
  const sys=isEN
    ?'You are an expert writing teacher for business document comprehension. The goal of feedback is to evaluate whether the learner bases answers solely on the document, and whether they retain the main argument and evidence while cutting specific examples. Explicitly point out any interpretation or outside knowledge not grounded in the document. Give structured feedback in English using markdown.'
    :'あなたはビジネス文書の読解と記述指導の教育専門家です。フィードバックの目的は「文書に書かれていることのみを根拠にし、主張と根拠を残しながら具体例を削る情報の取捨選択ができているか」を評価することです。文書外の自分の解釈や知識を持ち込んでいる箇所があれば具体的に指摘してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
  const prompt=buildSummaryGradePrompt(prob,userTexts);
  try{
    const diff=prob.diff||st.sDiff;
    const length=prob.length||(diff<=3?S_LENGTH_FIXED[diff]:S_LENGTH_VARIABLE[(prob.sVolume||st.sVolume||'short')].chars);
    const gradeMaxTokens=length<=500?1200:length<=2000?3000:6000;
    const res=await callClaude(prompt,sys,gradeMaxTokens,0.3);if(!res)return;
    fb.innerHTML=`<div class="feedback-box">${formatSummaryFeedback(res,prob.lang)}</div>`;
    prob.feedback=res;
    prob.answerMode='text';
    document.getElementById('ss2').className='step done';
    document.getElementById('ss3').className='step done';
    document.getElementById('s-pa-btn').style.display='';
    showCopyBar('summary');
  }catch(e){fb.innerHTML=`<p class="err">${L[st.lang].gradingErr}: ${e.message}</p>`;}
  btn.disabled=false;
}


// ── 批判読み ─────────────────────────────────────────────

function pastPrefix(mode){
  if(mode==='fill')return 'fp';
  if(mode==='summary')return 'sp';
  if(mode==='critique')return 'cp';
  return 'ap';
}
function isAmePastListed(prob){
  return normAmeProb(prob).questions.length>0;
}
function pastList(mode){
  if(mode==='fill')return st.fPast;
  if(mode==='summary')return st.sPast;
  if(mode==='critique')return st.cPast.filter(isCritiquePastListed);
  if(mode==='ame')return st.aPast.filter(isAmePastListed);
  return st.aPast;
}
function parseCritiqueQuestions(raw){
  let q=raw;
  if(typeof q==='string'){
    q=q.trim();
    if(!q)return[];
    try{q=JSON.parse(q);}catch{return[];}
    if(typeof q==='string'){try{q=JSON.parse(q);}catch{return[];}}
  }
  return Array.isArray(q)?q:[];
}
function normCritiqueProb(prob){
  const questions=Array.isArray(prob.questions)?prob.questions:parseCritiqueQuestions(prob.questions);
  const form=prob.form||((prob.text&&String(prob.text).trim())?'A':'B');
  return {...prob,text:prob.text||'',questions,form};
}
function hasCritiqueQuestions(prob){
  return normCritiqueProb(prob).questions.length>0;
}
function isCritiquePastListed(prob){
  return hasCritiqueQuestions(prob);
}
function critiquePreviewText(prob){
  const p=normCritiqueProb(prob);
  if(p.form==='A'&&p.text)return p.text;
  const q0=p.questions[0];
  return q0?.argument||q0?.question||'';
}
async function syncCritiquePast(prob){
  if(!await ensureGasV3())return;
  const p=normCritiqueProb(prob);
  const entry=buildCritiqueEntry({...p,feedback:prob.feedback||p.feedback||null,lang:prob.lang||p.lang||st.lang});
  entry.id=entry.id||Date.now();
  prob.id=entry.id;
  setSync('critique','spin',L[st.lang].genPhaseProcess+'...');
  try{await gasPost({action:'delete',id:String(entry.id),sheet:'critique'});}catch{}
  await gasPostEntry(entry);
  const idx=st.cPast.findIndex(p=>String(p.id)===String(entry.id));
  if(idx>=0)st.cPast[idx]=entry;
  else st.cPast.unshift(entry);
  renderPL('critique');
  setSync('critique','ok',pastSyncCount('critique')+L[st.lang].syncItems);
  showToast(L[st.lang].cSavedOk);
}
async function syncAmePast(prob){
  if(!await ensureGasV3())return;
  const p=normAmeProb(prob);
  const entry=buildAmeEntry({...p,feedback:prob.feedback||p.feedback||null,lang:prob.lang||p.lang||st.lang});
  entry.id=entry.id||Date.now();
  prob.id=entry.id;
  setSync('ame','spin',L[st.lang].genPhaseProcess+'...');
  try{await gasPost({action:'delete',id:String(entry.id),sheet:'ame'});}catch{}
  await gasPostEntry(entry);
  const idx=st.aPast.findIndex(p=>String(p.id)===String(entry.id));
  if(idx>=0)st.aPast[idx]=entry;
  else st.aPast.unshift(entry);
  renderPL('ame');
  setSync('ame','ok',pastSyncCount('ame')+L[st.lang].syncItems);
  showToast(L[st.lang].aSavedOk);
}
function getCritiqueQuestionTypes(diff){
  if(diff===1)return ['本当にそう言える？の指摘','本当にそう言える？の指摘','結論が成立するための条件'];
  if(diff===2)return ['本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答'];
  if(diff===3)return ['話の流れの整理','本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答'];
  if(diff===4)return ['話の流れの整理','本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答','立場が異なる人からの疑問'];
  return ['話の流れの整理','本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答','立場が異なる人からの疑問'];
}
function getCritiquePrompts(){
  const l=st.lang;
  if(l==='ja')return{
    1:`難易度1（入門）・B形式:\n- 短い論証を3つ生成する（各50〜80字）\n- ビジネス現場で起こりうる単純な因果構造（「〜だから〜すべき」「〜なので〜になる」など）\n- 各論証に論理のつながりが不十分な箇所を1つだけ含める\n- 設問は平易な言葉で「この文章では〜と結論づけています。その間に「本当にそう言える？」と感じる部分はどこですか？」という形式にする\n- targetChars: 100字`,
    2:`難易度2（基礎）・B形式:\n- 短い論証を3つ生成する（各60〜90字）\n- ビジネス現場の状況（売上・人事・プロジェクト・施策など）を題材にする\n- 設問タイプの順序: 本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答\n- 各論証の論理構造は異なるものにする\n- 設問は平易なビジネス表現で書く（論理学の専門用語を使わない）\n- targetChars: 指摘100字、条件120字、応答120字`,
    3:`難易度3（標準）・A形式:\n- 約400字のビジネス文書（提案書・報告書・企画書の一節）を1本生成する\n- 構造：「課題提起→根拠2〜3つ→反論への言及→提案・結論」\n- 文体：ビジネス文書として自然な文体。論理の弱点を意図的に含めること\n- 設問タイプ：話の流れの整理・本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答\n- 設問はすべて平易なビジネス表現で書く\n- targetChars: 整理150字、指摘120字、条件130字、応答150字`,
    4:`難易度4（上級）・A形式:\n- 約400字のビジネス文書（分析レポート・稟議書・提言書の一節）を1本生成する\n- 構造：「課題提起→根拠2〜3つ→反論処理→結論・提言」の2層構造\n- 文体：上位職向けのビジネス文書。論理構造が精緻で、読み手の立場によって疑問が生じる設計にする\n- 設問タイプ：話の流れの整理・本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答・立場が異なる人からの疑問\n- 「立場が異なる人からの疑問」では、現場担当者・管理職・顧客など立場の異なる人が持ちうる疑問を問う\n- 設問はすべて平易なビジネス表現で書く\n- targetChars: 整理150字、指摘130字、条件140字、応答150字、疑問160字`,
    5:`難易度5（超難問）・A形式:\n- 約400字のビジネス文書（経営戦略文書・コンサルレポート・提言書の一節）を1本生成する\n- 構造：「課題提起→根拠3つ以上→留保・例外→反論処理→結論・提言」の3層構造\n- 文体：経営層・意思決定者向けの高度なビジネス文書。多層的な論証・留保を含むこと\n- 設問タイプ：話の流れの整理・本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答・立場が異なる人からの疑問\n- 「立場が異なる人からの疑問」では、複数の利害関係者（株主・現場・顧客・社会）の立場から最も論証を揺るがす疑問を問う\n- 設問はすべて平易なビジネス表現で書く\n- targetChars: 整理180字、指摘150字、条件160字、応答170字、疑問180字`,
  };
  return{
    1:`Difficulty 1 (Beginner) · Form B:\n- Generate 3 independent short arguments (50-80 chars each)\n- Use business scenarios with simple causal structure ("because X, we should Y")\n- Each argument must contain exactly one logical gap\n- Questions must use plain language: "This text concludes X. Where does it feel like a stretch?"\n- targetChars: 100`,
    2:`Difficulty 2 (Basic) · Form B:\n- Generate 3 independent short arguments (60-90 chars each)\n- Use business scenarios (sales, HR, projects, initiatives)\n- Question types in order: logical gap, missing condition, counterargument response\n- Each argument must have a different logical structure\n- Use plain business language in all questions (no academic jargon)\n- targetChars: gap 100, condition 120, response 120`,
    3:`Difficulty 3 (Standard) · Form A:\n- Generate one business document excerpt (~400 characters): proposal, report, or plan\n- Structure: issue → 2-3 pieces of evidence → reference to counterargument → proposal/conclusion\n- Style: natural business writing with intentional logical weaknesses\n- Question types: flow summary, logical gap, missing condition, counterargument response\n- Use plain business language in all questions\n- targetChars: flow 150, gap 120, condition 130, response 150`,
    4:`Difficulty 4 (Advanced) · Form A:\n- Generate one business document excerpt (~400 characters): analysis report, approval document, or recommendation\n- Structure: issue → 2-3 pieces of evidence → counterargument handling → conclusion/recommendation (2-layer)\n- Style: senior-level business document with precise logic and viewpoint-dependent questions\n- Question types: flow summary, logical gap, missing condition, counterargument response, stakeholder perspective\n- "Stakeholder perspective": ask about questions that arise from different roles (frontline staff, management, customers)\n- Use plain business language in all questions\n- targetChars: flow 150, gap 130, condition 140, response 150, perspective 160`,
    5:`Difficulty 5 (Master) · Form A:\n- Generate one business document excerpt (~400 characters): strategy document, consulting report, or policy recommendation\n- Structure: issue → 3+ pieces of evidence → reservation/exception → counterargument handling → conclusion (3-layer)\n- Style: executive-level business document with multi-layer reasoning and reservations\n- Question types: flow summary, logical gap, missing condition, counterargument response, stakeholder perspective\n- "Stakeholder perspective": ask which stakeholder's perspective (shareholders, frontline, customers, society) most challenges the argument\n- Use plain business language in all questions\n- targetChars: flow 180, gap 150, condition 160, response 170, perspective 180`,
  };
}
function toggleTooltip(id){
  document.querySelectorAll('.tooltip-box.show').forEach(el=>{
    if(el.id!==id)el.classList.remove('show');
  });
  const box=document.getElementById(id);
  if(box)box.classList.toggle('show');
}
function buildCritiqueQuestionHtml(q,i,lang,form,mode){
  const l=L[lang]||L.ja;
  const tc=q.targetChars||120;
  const type=q.type||'本当にそう言える？の指摘';
  const intentLabel=(l.cQTypes||{})[type]||type;
  const tooltip=(l.cTooltips||{})[type];
  const tooltipId=`c-tooltip-${mode==='pp'?'pp-':''}${i}`;
  const pfx=mode==='pp'?'pp-':'';
  const taId=pfx+'c-ans-'+i;
  const lines=Math.max(4,Math.ceil(tc/18));
  const printLines=Array(lines).fill('<div style="border-bottom:1px solid #ccc;height:26px;margin-bottom:1px;"></div>').join('');
  const tipTitle=esc(tooltip?.label||'');
  const tooltipHtml=tooltip?`<span class="tooltip-wrap"><button type="button" class="tooltip-icon" onclick="toggleTooltip('${tooltipId}')" aria-label="${tipTitle}" title="${tipTitle}">?</button><span class="tooltip-box" id="${tooltipId}" role="tooltip"><span class="tooltip-title">${tipTitle}</span>${esc(tooltip.body)}<span class="tooltip-example">${esc(tooltip.example)}</span></span></span>`:'';
  const argHtml=(form==='B'&&q.argument)?`<div class="crit-arg-box">${esc(q.argument)}</div>`:'';
  const qLbl=l.qLbl||'設問';
  return`<div class="crit-q-block"><div class="crit-q-lbl">${qLbl}${q.id||i+1} <span class="q-type-badge">${esc(intentLabel)}</span> ${tooltipHtml}<span style="font-size:11px;color:var(--text2);">（${tc}${l.charWithin||'字以内'}）</span></div>${argHtml}<p class="crit-q-text">${esc(q.question||'')}</p><div class="no-print"><textarea class="sum-ta" id="${taId}" style="min-height:${Math.max(80,tc*1.6)}px" data-target="${tc}" placeholder=""></textarea></div><div class="summary-block-print"><p style="font-size:10pt;font-weight:bold;margin-bottom:.3rem;">${qLbl}${q.id||i+1}（${tc}${l.charWithin||'字以内'}）</p>${printLines}</div></div>`;
}
function renderCritique(prob){
  const l=L[st.lang];
  document.getElementById('c-theme-tag').innerHTML=`<span class="theme-tag">${l.theme}${esc(prob.theme||'—')}</span>`;
  const problemEl=document.getElementById('c-problem');
  if(prob.form==='A'&&prob.text){
    problemEl.textContent=prob.text;
    problemEl.style.display='';
  }else{
    problemEl.style.display='none';
  }
  document.getElementById('c-questions').innerHTML=prob.questions.map((q,i)=>buildCritiqueQuestionHtml(q,i,prob.lang||st.lang,prob.form,'live')).join('');
  document.getElementById('c-fb').innerHTML='';
  document.getElementById('c-pa-btn').style.display='none';
  resetAnswerPhotos();
  setAnswerMode('c','text');
  document.getElementById('critique-result').style.display='block';
  document.getElementById('cs1').className='step done';
  document.getElementById('cs2').className='step active';
  document.getElementById('cs3').className='step';
  updateApiKeyUI();
}
async function generateCritique(){
  if(isBusy()||!hasApiKey())return;
  const themeIn=document.getElementById('c-theme').value.trim();
  const diff=st.cDiff;
  const isEN=st.lang==='en';
  const numQ=C_QUESTION_COUNTS[diff];
  const isAForm=diff>=3;
  document.getElementById('critique-result').style.display='none';
  if(!beginGen('critique'))return;
  const sys=isEN
    ?'You are an expert in business communication and logical thinking education. The educational goal of this tab is to train learners to identify logical gaps in business documents and critically verify the validity of business reasoning. Intentionally design passages and arguments with logical weaknesses relevant to business contexts (unverified assumptions, missing evidence, unstated conditions, room for stakeholder objections). Questions should lead learners to discover those weaknesses and articulate their findings in plain business language. Respond ONLY in valid JSON. No markdown fences, no explanation before or after.'
    :'あなたはビジネスコミュニケーションと論理的思考の教育専門家です。このタブの教育目的は「ビジネス文書における論理の弱点を見抜き、主張の妥当性を批判的に検証する力を鍛えること」です。問題文・論証はビジネス現場で実際に起こりうる状況を題材にし、論理的な弱点（前提の欠如・根拠の不足・反論の余地・立場による疑問）を意図的に含む構造にしてください。設問は学習者がその弱点を発見し、ビジネスの平易な言葉で応答文として記述できる形式にしてください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
  const themeInst=buildThemeInst(themeIn,'keyword',C_TEXT_LENGTH,isEN,false);
  const diffPrompt=getCritiquePrompts()[diff];
  const qTypes=getCritiqueQuestionTypes(diff);
  let prompt;
  if(isAForm){
    prompt=isEN
      ?`${themeInst}\n${diffPrompt}\n\nGenerate a business document excerpt of approximately ${C_TEXT_LENGTH} characters and exactly ${numQ} questions.\nQuestion types in order: ${qTypes.join(', ')}.\n\nReturn ONLY this JSON:\n{"theme":"topic in 10 chars","text":"document text ~${C_TEXT_LENGTH} chars","questions":[{"id":1,"type":"話の流れの整理","question":"plain question text","targetChars":120}]}`
      :`${themeInst}\n${diffPrompt}\n\n約${C_TEXT_LENGTH}文字のビジネス文書と、ちょうど${numQ}問の設問を生成してください。\n設問タイプの順序: ${qTypes.join('、')}。\n\n返答はJSONのみ：\n{"theme":"テーマ10文字以内","text":"ビジネス文書約${C_TEXT_LENGTH}文字","questions":[{"id":1,"type":"話の流れの整理","question":"平易な表現の設問文","targetChars":120}]}`;
  }else{
    prompt=isEN
      ?`${themeInst}\n${diffPrompt}\n\nGenerate exactly ${numQ} independent short argument problems.\nQuestion types in order: ${qTypes.join(', ')}.\n\nReturn ONLY this JSON:\n{"theme":"topic in 10 chars","questions":[{"id":1,"type":"本当にそう言える？の指摘","argument":"short argument text 50-80 chars","question":"plain question text","targetChars":100}]}`
      :`${themeInst}\n${diffPrompt}\n\nちょうど${numQ}問の独立した短い論証問題を生成してください。\n設問タイプの順序: ${qTypes.join('、')}。\n\n返答はJSONのみ：\n{"theme":"テーマ10文字以内","questions":[{"id":1,"type":"本当にそう言える？の指摘","argument":"50〜80字の短い論証文","question":"平易な表現の設問文","targetChars":100}]}`;
  }
  try{
    const genMaxTokens=isAForm?2000:1200;
    const raw=await callClaude(prompt,sys,genMaxTokens,0.9);
    if(!raw)return;
    const p=safeJSON(raw);
    if(!Array.isArray(p.questions)||p.questions.length===0)throw new Error('Invalid JSON structure');
    const questions=p.questions.map((q,i)=>({id:q.id||i+1,type:q.type||qTypes[i]||'本当にそう言える？の指摘',question:q.question||'',argument:q.argument||'',targetChars:parseInt(q.targetChars)||100}));
    st.critique={
      id:Date.now(),theme:p.theme||(themeIn?themeIn.slice(0,20):''),diff,
      date:new Date().toISOString(),text:p.text||null,questions,
      feedback:null,lang:st.lang,form:isAForm?'A':'B',
    };
    renderCritique(st.critique);
    try{await syncPastOnGen('critique',st.critique);}
    catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].cGenFailed+'\n'+e.message);}
  finally{endGen('critique');}
}
async function submitCritique(){
  if(isBusy()||!hasApiKey())return;
  const prob=st.critique;if(!prob)return;
  if(st.answerMode==='photo'&&st.answerScope==='c'){await submitPhotoGrade('critique',prob,'c');return;}
  const userAnswers=prob.questions.map((_,i)=>document.getElementById(`c-ans-${i}`)?.value.trim()||'—');
  const fb=document.getElementById('c-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading}</span></p>`;
  const btn=document.getElementById('c-submit');btn.disabled=true;
  try{
    const res=await gradeCritique(prob,userAnswers);if(!res)return;
    prob.feedback=res;
    fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
    document.getElementById('cs2').className='step done';
    document.getElementById('cs3').className='step done';
    document.getElementById('c-pa-btn').style.display='';
    try{await syncCritiquePast(prob);}
    catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){fb.innerHTML=`<p class="err">${L[st.lang].cGradingErr}: ${e.message}</p>`;}
  btn.disabled=false;
}
async function gradeCritique(prob,userAnswers){
  const isEN=(prob.lang||st.lang)==='en';
  const sys=isEN
    ?'You are an expert in business communication and logical thinking education. The goal of feedback is to evaluate how accurately the learner identified logical gaps, missing conditions, or stakeholder objections in business contexts, and how clearly they expressed their findings in plain business language. Evaluate accuracy of identification, logical validity, and clarity of expression. Provide improved example answers. Give structured feedback in English using markdown.'
    :'あなたはビジネスコミュニケーションと論理的思考の教育専門家です。フィードバックの目的は「ビジネス文書における論理の弱点・前提の欠如・立場による疑問をどれだけ正確に特定し、ビジネスの平易な言葉で応答文として表現できているか」を評価することです。特定の正確さ・論理的妥当性・記述の明確さを具体的に評価し、改善例を示してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
  const passageSection=(prob.form==='A'&&prob.text)
    ?(isEN?`[Passage]\n${prob.text}\n\n`:`【問題文】\n${prob.text}\n\n`)
    :'';
  const qSection=prob.questions.map((q,i)=>{
    const ua=userAnswers[i]||'—';
    const argPart=(prob.form==='B'&&q.argument)?(isEN?`[Argument]\n${q.argument}\n`:`【論証】\n${q.argument}\n`):'';
    return isEN
      ?`[Q${q.id||i+1}] Type: ${q.type}\n${argPart}${q.question}\nTarget: within ${q.targetChars} chars\nLearner's answer:\n${ua}`
      :`【設問${q.id||i+1}】タイプ: ${q.type}\n${argPart}${q.question}\n目標: ${q.targetChars}字以内\n学習者の回答:\n${ua}`;
  }).join('\n\n---\n\n');
  const gradeInst=isEN
    ?`Grade each question on the following axes and provide feedback:\n- Accuracy of gap/condition/flow/stakeholder identification\n- Logical validity of the learner's reasoning in a business context\n- Quality of written response (clarity, conciseness, plain business language)\nProvide an improved example answer within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
    :`各設問を以下の軸で採点し、フィードバックしてください。\n- 論理の弱点・前提の欠如・立場による疑問の特定の正確さ\n- 学習者の推論の論理的妥当性（ビジネス文脈）\n- 記述の質（明確さ・簡潔さ・平易なビジネス表現）\n各設問の末尾に、文字数以内の改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
  const prompt=`${passageSection}${qSection}\n\n${gradeInst}`;
  const gradeMaxTokens=prob.diff<=3?1500:2500;
  return callClaude(prompt,sys,gradeMaxTokens,0.3);
}
function buildCritiqueEntry(prob){
  const p=normCritiqueProb(prob);
  return{
    id:p.id||Date.now(),sheet:'critique',theme:p.theme||'—',diff:p.diff,date:p.date,
    text:p.text||'',questions:JSON.stringify(p.questions||[]),feedback:prob.feedback||p.feedback||null,
    form:p.form,lang:p.lang||st.lang,
  };
}
async function ppCritique(id){
  const prob=st.cPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const p=normCritiqueProb(prob);
  const pLang=prob.lang||'ja';const l=L[pLang];
  if(st.answerMode==='photo'&&st.answerScope==='pp'){await submitPhotoGrade('critique',{...p,lang:pLang},'pp');return;}
  const userAnswers=p.questions.map((_,i)=>document.getElementById(`pp-c-ans-${i}`)?.value.trim()||'—');
  const btn=document.getElementById('pp-c-submit');if(btn)btn.disabled=true;
  const fb=document.getElementById('pp-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${l.loading}</span></p>`;
  try{
    const res=await gradeCritique({...p,lang:pLang},userAnswers);if(!res)return;
    fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
    document.getElementById('pp-s2').className='step done';
    document.getElementById('pp-s3').className='step done';
    const saved={...p,id:prob.id,theme:prob.theme,diff:prob.diff,date:prob.date,feedback:res,lang:pLang};
    try{await syncCritiquePast(saved);}
    catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){fb.innerHTML=`<p class="err">${l.cGradingErr}: ${e.message}</p>`;}
  if(btn)btn.disabled=false;
}

// ── 空雨傘 ─────────────────────────────────────────────

/** 傘の設問文に埋め込まれた制約条件（別枠で表示するため除去） */
function stripAmeConstraintFromQuestion(text,constraint){
  let s=String(text||'').trim();
  if(!s)return s;
  s=s.replace(/【制約条件[：:][^】]*】\s*(を守りながら|を守って|に従い|に従って)?[、,]?\s*/g,'');
  s=s.replace(/\[(?:Umbrella\s+)?Constraint[：:][^\]]*\]\s*(while\s+(?:adhering\s+to|following)|adhering\s+to)?[,\s]*/gi,'');
  if(constraint){
    const esc=String(constraint).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    s=s.replace(new RegExp(`[「『]?${esc}[」』]?\\s*(を守りながら|を守って|に従い|に従って)[、,]?\\s*`,'g'),'');
    s=s.replace(new RegExp(`(?:while\\s+)?(?:adhering\\s+to|following)\\s*[「『]?${esc}[」』]?[,.]?\\s*`,'gi'),'');
  }
  return s.replace(/\s{2,}/g,' ').replace(/^[,、]\s*/,'').trim();
}
function normAmeProb(prob){
  const questions=Array.isArray(prob.questions)?prob.questions:(parseF(prob.questions)||[]);
  const constraint=prob.constraint||null;
  const cleaned=questions.map(q=>{
    const type=q.type||'';
    if((type!=='傘'&&type!=='Umbrella')||!q.question)return q;
    return{...q,question:stripAmeConstraintFromQuestion(q.question,constraint)};
  });
  return{...prob,article:prob.article||'',questions:cleaned,law:prob.law||null,constraint,form:prob.form||'inductive'};
}
function getAmePrompts(){
  const isEN=st.lang==='en';
  if(!isEN)return{
    1:`難易度1（入門）・帰納型:\n- 事実のみで構成された300〜400字のニュース記事風文章を生成する\n- 事実は3〜4件含める（数値・調査結果・客観的情報のみ）\n- 解釈や意見・評価は一切含めないこと\n- 設問構成：雨（解釈）・傘（行動）の2問のみ\n- targetChars: 雨150字、傘150字`,
    2:`難易度2（基礎）・帰納型:\n- 事実のみで構成された300〜400字のニュース記事風文章を生成する\n- 事実は4〜5件含める（数値・調査結果・客観的情報のみ）\n- 設問構成：仕分け（事実確認）・雨・傘の3問\n- 仕分け設問は「この記事に書かれていることをすべて事実として整理してください」という形式\n- targetChars: 仕分け200字、雨150字、傘150字`,
    3:`難易度3（標準）・帰納型:\n- 事実と解釈が混在した300〜400字のニュース記事風文章を生成する\n- 事実は5〜6件、解釈・意見は2〜3件を自然に混在させる\n- 傘（行動）には制約条件を1つ設ける（例：「3ヶ月以内に実施可能なもの」「コスト増加なしで」など）\n- 設問構成：仕分け・雨・傘の3問\n- 仕分け設問は「事実として書かれている部分」と「解釈・意見として書かれている部分」を仕分けする形式\n- targetChars: 仕分け250字、雨160字、傘160字`,
    4:`難易度4（上級）:\n- 演繹型（約50%）または帰納型（約50%）をランダムに選択する\n【演繹型の場合】\n- 一般法則・原則を1つ生成する（1〜2文）\n- 事実と解釈が混在した300〜400字のニュース記事風文章を生成する\n- 事実は5〜6件、解釈は2〜3件\n- 因果の距離を伸ばす（複数の事実を組み合わせて初めて解釈が導ける構造）\n- 解釈の競合を含める（同じ事実から2つの解釈が成立しうる）\n- 傘に制約条件を1つ設ける\n- 設問構成：仕分け・雨・傘・導出の説明・5問目（自己検証または法則の限界をランダム選択）\n【帰納型の場合】\n- 事実と解釈が混在した300〜400字のニュース記事風文章を生成する\n- 事実は5〜6件、解釈は2〜3件\n- 解釈の競合を含める\n- 傘に制約条件を1つ設ける\n- 設問構成：仕分け・雨・傘・導出の説明・5問目（自己検証に固定）\n- targetChars: 仕分け250字、雨200字、傘200字、導出200字、5問目200字`,
    5:`難易度5（超難問）:\n- 演繹型（約70%）または帰納型（約30%）をランダムに選択する\n【演繹型の場合】\n- 一般法則・原則を1つ生成する（複合的な条件を含む2〜3文）\n- 事実と解釈が混在した300〜400字のニュース記事風文章を生成する\n- 事実は6〜7件、解釈は3〜4件\n- 因果の距離を3ステップ以上に設定する\n- 解釈の競合を含める\n- 傘に複数の制約条件を設ける\n- 設問構成：仕分け・雨・傘・導出の説明・5問目（自己検証または法則の限界をランダム選択）\n【帰納型の場合】\n- 難易度4帰納型より複雑な構造（事実7件以上・因果の距離3ステップ以上）\n- 設問構成：仕分け・雨・傘・導出の説明・5問目（自己検証に固定）\n- targetChars: 仕分け300字、雨220字、傘220字、導出220字、5問目220字`,
  };
  return{
    1:`Difficulty 1 (Beginner) · Inductive:\n- Generate a 300-400 character news article consisting of facts only\n- Include 3-4 facts (numbers, survey results, objective information only)\n- No interpretations, opinions, or evaluations\n- Questions: Rain (interpretation) and Umbrella (action) only\n- targetChars: Rain 150, Umbrella 150`,
    2:`Difficulty 2 (Basic) · Inductive:\n- Generate a 300-400 character news article consisting of facts only\n- Include 4-5 facts\n- Questions: Fact sorting, Rain, Umbrella (3 questions)\n- Sorting question: "List all facts stated in this article"\n- targetChars: Sorting 200, Rain 150, Umbrella 150`,
    3:`Difficulty 3 (Standard) · Inductive:\n- Generate a 300-400 character news article mixing facts and interpretations\n- Include 5-6 facts and 2-3 interpretations/opinions naturally mixed in\n- Add one constraint to the Umbrella question (e.g. "implementable within 3 months")\n- Questions: Sorting, Rain, Umbrella (3 questions)\n- Sorting: separate facts from interpretations/opinions\n- targetChars: Sorting 250, Rain 160, Umbrella 160`,
    4:`Difficulty 4 (Advanced):\n- Randomly select deductive (~50%) or inductive (~50%) type\n[Deductive]\n- Generate one general law/principle (1-2 sentences)\n- Generate a 300-400 character article mixing facts (5-6) and interpretations (2-3)\n- Extend causal distance (interpretation requires combining multiple facts)\n- Include competing interpretations (two valid interpretations from same facts)\n- Add one constraint to Umbrella\n- Questions: Sorting, Rain, Umbrella, Deduction explanation, Q5 (self-verification or law limitation randomly)\n[Inductive]\n- Generate a 300-400 character article with competing interpretations\n- Add one constraint to Umbrella\n- Questions: Sorting, Rain, Umbrella, Deduction explanation, Q5 (self-verification fixed)\n- targetChars: Sorting 250, Rain 200, Umbrella 200, Deduction 200, Q5 200`,
    5:`Difficulty 5 (Master):\n- Randomly select deductive (~70%) or inductive (~30%) type\n[Deductive]\n- Generate one complex law/principle (2-3 sentences with compound conditions)\n- Generate a 300-400 character article with 6-7 facts and 3-4 interpretations\n- Extend causal distance to 3+ steps\n- Include competing interpretations\n- Add multiple constraints to Umbrella\n- Questions: Sorting, Rain, Umbrella, Deduction explanation, Q5 (randomly self-verification or law limitation)\n[Inductive]\n- More complex than Difficulty 4 inductive (7+ facts, 3+ causal steps)\n- Questions: Sorting, Rain, Umbrella, Deduction explanation, Q5 (self-verification fixed)\n- targetChars: Sorting 300, Rain 220, Umbrella 220, Deduction 220, Q5 220`,
  };
}
function getAmeQuestionTypes(diff,isDeductive){
  if(diff===1)return[{ja:'雨',en:'Rain'},{ja:'傘',en:'Umbrella'}];
  if(diff===2)return[{ja:'空',en:'Sky'},{ja:'雨',en:'Rain'},{ja:'傘',en:'Umbrella'}];
  if(diff===3)return[{ja:'空',en:'Sky'},{ja:'雨',en:'Rain'},{ja:'傘',en:'Umbrella'}];
  return[{ja:'空',en:'Sky'},{ja:'雨',en:'Rain'},{ja:'傘',en:'Umbrella'},{ja:'導出の説明',en:'Deduction'},{ja:'自己検証または法則の限界',en:'Self-check or Law limit'}];
}
function getAmeBadgeLabel(type,lang){
  const isEN=lang==='en';
  const map={
    '空':isEN?'Fact sorting':'事実の仕分け',
    'Sky':isEN?'Fact sorting':'事実の仕分け',
    '雨':isEN?'Interpretation':'解釈の導出',
    'Rain':isEN?'Interpretation':'解釈の導出',
    '傘':isEN?'Action':'行動の提案',
    'Umbrella':isEN?'Action':'行動の提案',
    '導出の説明':isEN?'Deduction':'導出の説明',
    'Deduction':isEN?'Deduction':'導出の説明',
    '自己検証または法則の限界':isEN?'Self-check / Law limit':'自己検証・法則の限界',
    'Self-check or Law limit':isEN?'Self-check / Law limit':'自己検証・法則の限界',
    'Self-check':isEN?'Self-check / Law limit':'自己検証・法則の限界',
    'Law limit':isEN?'Self-check / Law limit':'自己検証・法則の限界',
  };
  if(map[type])return map[type];
  if(type.includes('自己検証')||type.includes('Self-check')||type.includes('法則')||type.includes('Law limit'))return isEN?'Self-check / Law limit':'自己検証・法則の限界';
  return type;
}
function buildAmeQuestionsHtml(prob,mode){
  const lang=prob.lang||st.lang;
  const l=L[lang]||L.ja;
  const cw=l.charWithin||'字以内';
  const pfx=mode==='pp'?'pp-':'';
  const constraintHtml=prob.constraint
    ?`<div class="ame-constraint">${esc(l.aConstraintLbl)}${esc(prob.constraint)}</div>`
    :'';
  return prob.questions.map((q,i)=>{
    const tc=q.targetChars||150;
    const taId=pfx+'a-ans-'+i;
    const type=q.type||'';
    let sectionLbl='';
    if(type==='空'||type==='Sky')sectionLbl=l.aSora;
    else if(type==='雨'||type==='Rain')sectionLbl=l.aAme;
    else if(type==='傘'||type==='Umbrella')sectionLbl=l.aKasa;
    else if(type==='導出の説明'||type==='Deduction')sectionLbl=l.aDeduction;
    else if(type.includes('自己検証')||type==='Self-check')sectionLbl=l.aSelfCheck;
    else if(type.includes('法則')||type==='Law limit')sectionLbl=l.aLawLimit;
    else sectionLbl=type;
    const isUmbrella=type==='傘'||type==='Umbrella';
    const constraintBar=isUmbrella?constraintHtml:'';
    const badgeLabel=getAmeBadgeLabel(type,lang);
    return`<div class="ame-q-block">
      <div class="ame-section-lbl">${esc(sectionLbl)}<span class="q-type-badge" style="margin-left:6px;">${esc(badgeLabel)}</span></div>
      <p class="ame-q-lbl">${esc(q.question||'')}<span style="font-size:11px;color:var(--text2);margin-left:6px;">（${tc}${cw}）</span></p>
      ${constraintBar}
      <div class="no-print">
        <textarea class="sum-ta" id="${taId}"
          style="min-height:${Math.max(80,tc*1.6)}px"
          data-target="${tc}"
          placeholder=""></textarea>
      </div>
    </div>`;
  }).join('');
}
function renderAme(prob){
  const p=normAmeProb(prob);
  const l=L[st.lang];
  document.getElementById('a-theme-tag').innerHTML=`<span class="theme-tag">${l.theme}${esc(p.theme||'—')}</span>`;
  const lawBox=document.getElementById('a-law-box');
  const lawText=document.getElementById('a-law-text');
  if(p.law){lawText.textContent=p.law;lawBox.style.display='';}
  else lawBox.style.display='none';
  document.getElementById('a-article').textContent=p.article;
  document.getElementById('a-questions').innerHTML=buildAmeQuestionsHtml(p,'live');
  document.getElementById('a-fb').innerHTML='';
  document.getElementById('a-pa-btn').style.display='none';
  resetAnswerPhotos();
  setAnswerMode('a','text');
  document.getElementById('ame-result').style.display='block';
  document.getElementById('as1').className='step done';
  document.getElementById('as2').className='step active';
  document.getElementById('as3').className='step';
  updateApiKeyUI();
}
async function generateAme(){
  if(isBusy()||!hasApiKey())return;
  const themeIn=document.getElementById('a-theme').value.trim();
  const diff=st.aDiff;
  const isEN=st.lang==='en';
  const isDeductive=Math.random()<A_DEDUCTIVE_RATE[diff];
  document.getElementById('ame-result').style.display='none';
  if(!beginGen('ame'))return;
  const sys=isEN
    ?'You are an expert in logical thinking and Sky-Rain-Umbrella reasoning education. The educational goal of this tab is to train learners to distinguish facts from interpretations, derive logically valid interpretations from facts, and propose actions grounded in those interpretations. For difficulty 3 and above, intentionally mix facts and interpretations in the article so learners must sort them before deriving their own interpretation and action. Respond ONLY in valid JSON. No markdown fences, no explanation before or after.'
    :'あなたは論理的思考と空雨傘フレームワークの教育専門家です。このタブの教育目的は「事実と解釈を混同せずに書き分け、事実から論理的に妥当な解釈を導き、解釈に基づく行動を提案する力を鍛えること」です。記事には事実と解釈を意図的に混在させ（難易度3以上）、学習者が仕分けを行った上で自分の解釈・行動を導出できる構造にしてください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
  const themeInst=buildThemeInst(themeIn,'keyword',A_ARTICLE_LENGTH,isEN,false);
  const diffPrompt=getAmePrompts()[diff];
  const typeNote=isEN
    ?`\n\nFor this problem, use the ${isDeductive?'DEDUCTIVE':'INDUCTIVE'} type.`
    :`\n\nこの問題は${isDeductive?'演繹型':'帰納型'}で生成してください。`;
  const qTypes=getAmeQuestionTypes(diff,isDeductive);
  const lawField=isDeductive?(isEN?'"law":"law/principle text",':'"law":"法則・前提のテキスト",'):'';
  const constraintField=diff>=3?(isEN?'"constraint":"constraint text for umbrella",':'"constraint":"傘の制約条件テキスト",'):'';
  const jsonSchema=isEN
    ?`Return ONLY this JSON (use "article" for the passage — not "text"):\n{"theme":"topic in 10 chars",${lawField}"article":"article text ~${A_ARTICLE_LENGTH} chars",${constraintField}"questions":[{"id":1,"type":"Sky","question":"question text","targetChars":200}],"form":"${isDeductive?'deductive':'inductive'}"}`
    :`返答はJSONのみ（本文は必ず "article" キー。 "text" は使わない）：\n{"theme":"テーマ10文字以内",${lawField}"article":"記事テキスト約${A_ARTICLE_LENGTH}文字",${constraintField}"questions":[{"id":1,"type":"空","question":"設問文","targetChars":200}],"form":"${isDeductive?'deductive':'inductive'}"}`;
  const qTypesNote=isEN
    ?`\nGenerate exactly ${qTypes.length} questions in this order: ${qTypes.map(q=>q.en).join(', ')}.`
    :`\n設問はこの順序でちょうど${qTypes.length}問生成してください：${qTypes.map(q=>q.ja).join('、')}。`;
  const constraintNote=diff>=3
    ?(isEN
      ?'\nPut umbrella constraints ONLY in the "constraint" field. Do not repeat constraint wording inside the Umbrella question text.'
      :'\n傘の制約条件は "constraint" フィールドのみに書き、傘の設問文には【制約条件：…】などの文言を繰り返さないこと。')
    :'';
  const prompt=`${themeInst}\n${diffPrompt}${typeNote}${qTypesNote}${constraintNote}\n${jsonSchema}`;
  try{
    const genMaxTokens=diff<=3?2200:2500;
    const raw=await callClaude(prompt,sys,genMaxTokens,0.9);
    if(!raw)return;
    const p=normalizeAmeFromModel(parseModelJSON(raw));
    if(!p.article)throw new Error('Invalid JSON structure: missing article (keys: '+Object.keys(p).join(', ')+')');
    if(!p.questions.length)throw new Error('Invalid JSON structure: missing questions');
    st.ame={
      id:Date.now(),theme:p.theme||(themeIn?themeIn.slice(0,20):''),diff,
      date:new Date().toISOString(),law:p.law||null,article:p.article,
      constraint:p.constraint||null,questions:p.questions,
      form:p.form||(isDeductive?'deductive':'inductive'),feedback:null,lang:st.lang,
    };
    renderAme(st.ame);
    try{await syncPastOnGen('ame',st.ame);}
    catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].aGenFailed+'\n'+e.message);}
  finally{endGen('ame');}
}
async function submitAme(){
  if(isBusy()||!hasApiKey())return;
  const prob=st.ame;if(!prob)return;
  if(st.answerMode==='photo'&&st.answerScope==='a'){await submitPhotoGrade('ame',prob,'a');return;}
  const userAnswers=prob.questions.map((_,i)=>document.getElementById(`a-ans-${i}`)?.value.trim()||'—');
  const fb=document.getElementById('a-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading}</span></p>`;
  const btn=document.getElementById('a-submit');btn.disabled=true;
  try{
    const res=await gradeAme(prob,userAnswers);if(!res)return;
    prob.feedback=res;
    fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
    document.getElementById('as2').className='step done';
    document.getElementById('as3').className='step done';
    document.getElementById('a-pa-btn').style.display='';
    try{await syncAmePast(prob);}
    catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){fb.innerHTML=`<p class="err">${L[st.lang].aGradingErr}: ${e.message}</p>`;}
  btn.disabled=false;
}
async function gradeAme(prob,userAnswers){
  const isEN=(prob.lang||st.lang)==='en';
  const sys=isEN
    ?'You are an expert in logical thinking and Sky-Rain-Umbrella reasoning education. The goal of feedback is to evaluate: whether the interpretation is logically derived from the facts without gaps, whether the action logically follows from the interpretation, and whether the learner is aware that alternative interpretations are possible from the same facts. Point out specific gaps and present one alternative interpretation, then provide an improved example. Give structured feedback in English using markdown.'
    :'あなたは論理的思考と空雨傘フレームワークの教育専門家です。フィードバックの目的は「事実から解釈への飛躍がないか」「解釈から行動への論理的なつながりがあるか」「同じ事実から別の解釈が導ける可能性に気づいているか」を評価することです。飛躍を具体的に指摘し、別解を1つ示した上で改善例を提示してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
  const lawSection=prob.law
    ?(isEN?`[Law/Principle]\n${prob.law}\n\n`:`【法則・前提】\n${prob.law}\n\n`)
    :'';
  const constraintSection=prob.constraint
    ?(isEN?`[Umbrella Constraint]\n${prob.constraint}\n\n`:`【傘の制約条件】\n${prob.constraint}\n\n`)
    :'';
  const articleSection=isEN?`[Article]\n${prob.article}\n\n`:`【記事】\n${prob.article}\n\n`;
  const qSection=prob.questions.map((q,i)=>{
    const ua=userAnswers[i]||'—';
    return isEN
      ?`[Q${q.id||i+1}] ${q.type}\n${q.question}\nTarget: within ${q.targetChars} chars\nLearner's answer:\n${ua}`
      :`【設問${q.id||i+1}】${q.type}\n${q.question}\n目標: ${q.targetChars}字以内\n学習者の回答:\n${ua}`;
  }).join('\n\n---\n\n');
  const gradeInst=isEN
    ?`Grade each answer on the following axes:\n- Factual grounding: Is the interpretation/action logically derived from the facts?\n- Logical gap: Is there a jump between facts → interpretation or interpretation → action?\n- Alternative interpretation: Show one other valid interpretation from the same facts.\nProvide an improved example within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
    :`各設問を以下の軸で採点してください。\n- 事実との整合性：解釈・行動が事実から論理的に導けているか\n- 飛躍の指摘：事実→解釈、解釈→行動の間に飛躍がないか\n- 別解の提示：同じ事実から導ける別の解釈を1つ示す\n各設問の末尾に文字数以内の改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
  const prompt=`${lawSection}${articleSection}${constraintSection}${qSection}\n\n${gradeInst}`;
  const gradeMaxTokens=prob.diff<=3?1500:2500;
  return callClaude(prompt,sys,gradeMaxTokens,0.3);
}
function buildAmeEntry(prob){
  return{
    id:prob.id||Date.now(),sheet:'ame',theme:prob.theme||'—',diff:prob.diff,date:prob.date,
    law:prob.law||'',article:prob.article||'',constraint:prob.constraint||'',
    questions:JSON.stringify(prob.questions||[]),feedback:prob.feedback||null,
    form:prob.form||'inductive',lang:prob.lang||st.lang,
  };
}
async function ppAme(id){
  const prob=st.aPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const p=normAmeProb(prob);
  const pLang=prob.lang||'ja';const l=L[pLang];
  if(st.answerMode==='photo'&&st.answerScope==='pp'){await submitPhotoGrade('ame',{...p,lang:pLang},'pp');return;}
  const userAnswers=p.questions.map((_,i)=>document.getElementById(`pp-a-ans-${i}`)?.value.trim()||'—');
  const btn=document.getElementById('pp-a-submit');if(btn)btn.disabled=true;
  const fb=document.getElementById('pp-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${l.loading}</span></p>`;
  try{
    const res=await gradeAme({...p,lang:pLang},userAnswers);if(!res)return;
    fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
    document.getElementById('pp-s2').className='step done';
    document.getElementById('pp-s3').className='step done';
    const saved={...p,id:prob.id,theme:prob.theme,diff:prob.diff,date:prob.date,feedback:res,lang:pLang};
    try{await syncAmePast(saved);}
    catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){fb.innerHTML=`<p class="err">${l.aGradingErr}: ${e.message}</p>`;}
  if(btn)btn.disabled=false;
}

// ══════════════════════════════════════════════════════════
// 過去問共通
// ══════════════════════════════════════════════════════════
function filterPast(mode,f){
  if(mode==='fill')st.fFilter=f;else if(mode==='summary')st.sFilter=f;else if(mode==='critique')st.cFilter=f;else st.aFilter=f;
  document.querySelectorAll('#'+pastPrefix(mode)+'-tabs .pf-tab').forEach(b=>b.classList.toggle('active',b.dataset.f===f));
  renderPL(mode);
}
async function loadPast(mode){
  setSync(mode,'spin',L[st.lang].syncLoading);
  try{
    if(!await ensureGasV3()){setSync(mode,'err',L[st.lang].syncFailed);return;}
    assignPastStore(mode,await gasGetPast(mode));
    setSync(mode,'ok',pastSyncCount(mode)+L[st.lang].syncItems);
    renderPL(mode);
  }
  catch(e){setSync(mode,'err',L[st.lang].syncFailed);document.getElementById(pastPrefix(mode)+'-list').innerHTML=`<div class="pempty">${esc(e.message)}</div>`;}
}
function renderPL(mode){
  const all=pastList(mode);
  const f=mode==='fill'?st.fFilter:mode==='summary'?st.sFilter:mode==='critique'?st.cFilter:st.aFilter;
  const byDiff=f==='all'?all:all.filter(p=>String(p.diff)===f);
  const list=byDiff.filter(p=>(p.lang||'ja')===st.lang);
  const c=document.getElementById(pastPrefix(mode)+'-list');
  if(!list.length){c.innerHTML=`<div class="pempty"><i class="ti ti-inbox" style="font-size:26px;display:block;margin-bottom:.4rem;"></i>${L[st.lang].noData}</div>`;return;}
  c.innerHTML=list.map(p=>`
    <div class="pcard" onclick="openPast('${mode}','${p.id}')">
      <div class="pc-h"><div class="pc-t">${esc(p.theme)}</div>
        <div class="pc-m"><span class="badge ${BADGE[p.diff]||'b3'}">${dlabel(p.diff)}</span></div></div>
      <div class="pc-pre">${esc((mode==='fill'?p.text:mode==='summary'?normSummaryProb(p).text:mode==='ame'?String(p.article||''):critiquePreviewText(p)).replace(/【_\d+_】/g,'[  ]').substring(0,80))}</div>
      <div class="pc-date">${fmtDate(p.date)}${p.lang?' · '+p.lang.toUpperCase():''}</div>
    </div>`).join('');
}
function randomPast(mode){
  const all=pastList(mode);
  const f=mode==='fill'?st.fFilter:mode==='summary'?st.sFilter:mode==='critique'?st.cFilter:st.aFilter;
  const byDiff=f==='all'?all:all.filter(p=>String(p.diff)===f);
  const pool=byDiff.filter(p=>(p.lang||'ja')===st.lang);
  if(!pool.length){alert(L[st.lang].noData);return;}
  openPast(mode,pool[Math.floor(Math.random()*pool.length)].id);
}

function openPast(mode,id){
  const all=pastList(mode);
  const prob=all.find(p=>String(p.id)===String(id));if(!prob)return;
  const pLang=prob.lang||'ja';const l=L[pLang];
  const pfx=pastPrefix(mode);
  document.getElementById(pfx+'-list-view').style.display='none';
  document.getElementById(pfx+'-play').style.display='block';
  const cnt=document.getElementById(pfx+'-play-content');

  if(mode==='fill'){
    const answers=parseF(prob.answers);const hints=parseF(prob.hints);
    let html=esc(prob.text);
    for(let i=1;i<=answers.length;i++) html=html.replace(`【_${i}_】`,`<span class="blank" id="blank-${i}">（${i}）</span>`);
    cnt.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <strong>${esc(prob.theme)}</strong><span class="badge ${BADGE[prob.diff]||'b3'}">${dlabel(prob.diff)}</span></div>
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <div class="problem-box">${html}</div>
      <div class="answer-section" id="pp-inputs" style="margin-top:1rem;margin-bottom:1rem;"></div>
      <div class="divider"></div>
      <button class="btn" id="pp-api-btn" onclick="ppAPI('${id}')" style="margin-top:.5rem;">
        <i class="ti ti-sparkles" aria-hidden="true"></i>
        <span>${l.apiBtn}</span>
      </button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb" style="margin-top:.5rem;"></div>
      <div id="pp-ow-bar" class="action-bar" style="display:none;margin-top:.5rem;">
        <button class="btn btn-icon btn-sm" onclick="ppOverwrite('${id}')"><i class="ti ti-cloud-upload"></i> ${l.overwriteBtn}</button>
      </div>`;
    const sec=document.getElementById('pp-inputs');sec.innerHTML=`<p class="slabel">${l.answerBox}</p>`;
    const noHints=(prob.diff||1)>=3;
    answers.forEach((_,i)=>{
      sec.appendChild(buildFillAnswerItem(i,noHints?'':hints[i],`ppans-${i}`,false));
    });
  } else if(mode==='summary'){
    const p=normSummaryProb(prob);
    const qHtml=p.questions.map((q,i)=>buildSummaryQuestionHtml(q,i,pLang,'pp')).join('');
    cnt.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <strong>${esc(prob.theme)}</strong><span class="badge ${BADGE[prob.diff]||'b3'}">${dlabel(prob.diff)}</span></div>
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <p class="slabel">${l.sInst}</p>
      <div class="problem-box">${esc(p.text)}</div>
      ${buildAnswerModeBar('pp')}
      <div id="pp-questions">${qHtml}</div>
      ${buildPhotoArea('pp')}
      <div id="pp-owarn" class="owarn" style="margin-bottom:.5rem;"></div>
      <button class="btn" id="pp-submit" onclick="ppSummary('${id}')"><span>${l.sSubmit}</span></button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb"></div>`;
    resetAnswerPhotos();
    setAnswerMode('pp','text');
  } else if(mode==='critique'){
    const p=normCritiqueProb(prob);
    if(!p.questions.length){alert(L[st.lang].cGenFailed);closePP('critique');return;}
    const qHtml=p.questions.map((q,i)=>buildCritiqueQuestionHtml(q,i,pLang,p.form,'pp')).join('');
    cnt.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <strong>${esc(prob.theme)}</strong><span class="badge ${BADGE[prob.diff]||'b3'}">${dlabel(prob.diff)}</span></div>
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <p class="slabel">${l.cInst}</p>
      ${p.form==='A'&&p.text?`<div class="problem-box">${esc(p.text)}</div>`:''}
      ${buildAnswerModeBar('pp')}
      <div id="pp-questions">${qHtml}</div>
      ${buildPhotoArea('pp')}
      <button class="btn" id="pp-c-submit" onclick="ppCritique('${id}')"><span>${l.cSubmit}</span></button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb">${prob.feedback?`<div class="feedback-box">${md2h(prob.feedback)}</div>`:''}</div>`;
    resetAnswerPhotos();
    setAnswerMode('pp','text');
    const qq=document.getElementById('pp-questions');
    if(qq)qq.style.display='';
  } else if(mode==='ame'){
    const p=normAmeProb(prob);
    const lawHtml=p.law
      ?`<p class="slabel">${l.aLawLbl}</p><div class="mode-bar">${esc(p.law)}</div>`
      :'';
    const qHtml=buildAmeQuestionsHtml(p,'pp');
    cnt.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem;">
        <strong>${esc(prob.theme)}</strong><span class="badge ${BADGE[prob.diff]||'b3'}">${dlabel(prob.diff)}</span></div>
      <div class="step-bar"><div class="step done"></div><div class="step active" id="pp-s2"></div><div class="step" id="pp-s3"></div></div>
      <p class="slabel">${l.aArticleLbl}</p>
      <div class="problem-box">${esc(p.article)}</div>
      ${lawHtml}
      ${buildAnswerModeBar('pp')}
      <div id="pp-questions">${qHtml}</div>
      ${buildPhotoArea('pp')}
      <button class="btn" id="pp-a-submit" onclick="ppAme('${id}')"><span>${l.aSubmit}</span></button>
      <div class="action-bar" style="margin-top:8px;">
        <button class="btn btn-icon btn-sm" onclick="window.print()">
          <i class="ti ti-printer"></i>
          <span>${l.pq}</span>
        </button>
      </div>
      <div id="pp-fb"></div>`;
    resetAnswerPhotos();
    setAnswerMode('pp','text');
  }
}

function ppCC(i){updateSumCC(i,'pp');}


async function ppAPI(id){
  const prob=st.fPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const pLang=prob.lang||'ja';const l=L[pLang];
  const answers=parseF(prob.answers);
  const ua=answers.map((_,i)=>document.getElementById(`ppans-${i}`)?.value.trim()||'—');
  const fbEl=document.getElementById('pp-fb');
  fbEl.innerHTML=`<p class="loading"><span class="dots">${l.loading}</span></p>`;
  const apiBtn=document.getElementById('pp-api-btn');if(apiBtn)apiBtn.disabled=true;
  try{
    const res=await gradeFill({...prob,answers,lang:pLang},ua);if(!res)return;
    fbEl.innerHTML=`<div class="feedback-box">${formatFeedback100(res,pLang)}</div>`;
    const owBar=document.getElementById('pp-ow-bar');
    if(owBar){owBar.style.display='flex';owBar.dataset.feedback=res;owBar.dataset.ua=JSON.stringify(ua);}
    document.getElementById('pp-s2').className='step done';
    document.getElementById('pp-s3').className='step done';
  }catch(e){fbEl.innerHTML=`<p class="err">${l.gradingErr}: ${e.message}</p>`;}
  if(apiBtn)apiBtn.disabled=false;
}

async function ppOverwrite(id){
  const owBar=document.getElementById('pp-ow-bar');if(!owBar)return;
  const newFb=owBar.dataset.feedback;const newUA=JSON.parse(owBar.dataset.ua||'[]');
  if(!newFb)return;
  const prob=st.fPast.find(p=>String(p.id)===String(id));if(!prob)return;
  setSync('fill','spin',L[st.lang].loading+'...');
  try{
    await gasPost({action:'delete',id:String(id),sheet:'fill'});
    const updated={...prob,answers:parseF(prob.answers),hints:parseF(prob.hints),feedback:newFb,userAnswers:newUA,sheet:'fill'};
    await gasPost(updated);
    const idx=st.fPast.findIndex(p=>String(p.id)===String(id));
    if(idx>=0)st.fPast[idx]={...st.fPast[idx],feedback:newFb,userAnswers:newUA};
    setSync('fill','ok',L[st.lang].overwriteOk);
    showToast(L[st.lang].overwriteOk);
    owBar.style.display='none';
  }catch(e){setSync('fill','err',L[st.lang].syncFailed);showToast('Error: '+e.message,4000);}
}

async function ppSummary(id){
  const prob=st.sPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const pLang=prob.lang||'ja';const l=L[pLang];
  if(st.answerMode==='photo'&&st.answerScope==='pp'){await submitPhotoGrade('summary',prob,'pp');return;}
  const anyOver=[...document.querySelectorAll('[id^="pp-sans-"]')].some(t=>t.value.replace(/\s/g,'').length>parseInt(t.dataset.target||0));
  if(anyOver){alert(l.overWarn);return;}
  const userTexts=collectSummaryAnswers(prob,'pp');
  const btn=document.getElementById('pp-submit');btn.disabled=true;
  const fb=document.getElementById('pp-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${l.loading}</span></p>`;
  const isEN=pLang==='en';
  const sys=isEN
    ?'You are an expert writing teacher for business document comprehension. The goal of feedback is to evaluate whether the learner bases answers solely on the document, and whether they retain the main argument and evidence while cutting specific examples. Explicitly point out any interpretation or outside knowledge not grounded in the document. Give structured feedback in English using markdown.'
    :'あなたはビジネス文書の読解と記述指導の教育専門家です。フィードバックの目的は「文書に書かれていることのみを根拠にし、主張と根拠を残しながら具体例を削る情報の取捨選択ができているか」を評価することです。文書外の自分の解釈や知識を持ち込んでいる箇所があれば具体的に指摘してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
  const prompt=buildSummaryGradePrompt(prob,userTexts);
  try{
    const diff=prob.diff||st.sDiff;
    const length=prob.length||(diff<=3?S_LENGTH_FIXED[diff]:S_LENGTH_VARIABLE[(prob.sVolume||st.sVolume||'short')].chars);
    const gradeMaxTokens=length<=500?1200:length<=2000?3000:6000;
    const res=await callClaude(prompt,sys,gradeMaxTokens,0.3);if(!res)return;
    fb.innerHTML=`<div class="feedback-box">${formatSummaryFeedback(res,pLang)}</div>`;
    document.getElementById('pp-s2').className='step done';
    document.getElementById('pp-s3').className='step done';
  }catch(e){fb.innerHTML=`<p class="err">${l.gradingErr}: ${e.message}</p>`;}
  btn.disabled=false;
}


function closePP(mode){
  const pfx=pastPrefix(mode);
  document.getElementById(pfx+'-list-view').style.display='';
  document.getElementById(pfx+'-play').style.display='none';
  document.getElementById(pfx+'-play-content').innerHTML='';
  resetAnswerPhotos();
}
async function deletePast(mode,id){
  if(!confirm(L[st.lang].delConfirm))return;
  setSync(mode,'spin',L[st.lang].loading+'...');
  try{
    await gasPost({action:'delete',id:String(id),sheet:mode});
    if(mode==='fill')st.fPast=st.fPast.filter(p=>String(p.id)!==String(id));
    else if(mode==='summary')st.sPast=st.sPast.filter(p=>String(p.id)!==String(id));
    else if(mode==='critique')st.cPast=st.cPast.filter(p=>String(p.id)!==String(id));
    else st.aPast=st.aPast.filter(p=>String(p.id)!==String(id));
    const n=pastList(mode).length;
    setSync(mode,'ok',n+L[st.lang].syncItems);renderPL(mode);showToast(L[st.lang].deletedOk);
  }catch(e){setSync(mode,'err',L[st.lang].syncFailed);showToast('Error: '+e.message,4000);}
}

// ── ガイドモーダル ────────────────────────────────────────
const _guideCache={};
let _guideCurrentTab='overview';

function getGuideBasePath(){
  const base=location.pathname.replace(/\/[^/]*$/,'');
  return base+'/guide';
}

async function fetchGuide(tabKey){
  if(_guideCache[tabKey])return _guideCache[tabKey];
  const lang=st.lang==='en'?'en':'ja';
  const urls=[
    `${getGuideBasePath()}/${lang}/${tabKey}.md`,
    `${getGuideBasePath()}/${tabKey}.md`,
  ];
  for(const url of urls){
    try{
      const res=await fetch(url);
      if(res.ok){
        const text=await res.text();
        _guideCache[tabKey]=text;
        return text;
      }
    }catch{}
  }
  return null;
}

async function switchGuideTab(tabKey){
  _guideCurrentTab=tabKey;
  const l=L[st.lang];
  document.querySelectorAll('.guide-tab').forEach(b=>
    b.classList.toggle('active',b.dataset.guide===tabKey)
  );
  const body=document.getElementById('guide-body');
  body.innerHTML=`<p class="guide-loading">${l.guideLoading}</p>`;
  const md=await fetchGuide(tabKey);
  if(!md){
    body.innerHTML=`<p class="guide-loading" style="color:#c0453a;">${l.guideError}</p>`;
    return;
  }
  body.innerHTML=md2h(md);
}

function openGuide(tab='overview'){
  document.getElementById('guide-overlay').classList.add('show');
  Object.keys(_guideCache).forEach(k=>delete _guideCache[k]);
  switchGuideTab(tab);
  document.addEventListener('keydown',onGuideKeyDown);
}

function closeGuide(){
  document.getElementById('guide-overlay').classList.remove('show');
  document.removeEventListener('keydown',onGuideKeyDown);
}

function onGuideOverlayClick(e){
  if(e.target===document.getElementById('guide-overlay'))closeGuide();
}

function onGuideKeyDown(e){
  if(e.key==='Escape')closeGuide();
}

// ── Init ─────────────────────────────────────────────────
function init(){
  const savedLang=localStorage.getItem(LANG_KEY);
  if(savedLang)st.lang=savedLang;
  loadApiKey();
  applyLang();
  switchSub('fill','new');
  switchSub('summary','new');
  switchSub('critique','new');
  switchSub('ame','new');
  setDiff('c',st.cDiff);
  setDiff('a',st.aDiff);
  document.getElementById('apikey').addEventListener('input',updateApiKeyUI);
  setDiff('s',st.sDiff);
  setThemeMode('s',st.sThemeMode||'keyword');
}
init();
