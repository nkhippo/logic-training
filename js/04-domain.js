/* Domain */
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
  const vol=st.sVolume||DEFAULT_S_VOLUME;
  return S_LENGTH_VARIABLE[vol].chars;
}
const S_RATIO={1:.6,2:.5,3:.4,4:.3,5:.2};

const C_QUESTION_COUNTS={1:3,2:3,3:4,4:5,5:5};
const C_TEXT_LENGTH=400;

const A_DEDUCTIVE_RATE={1:0,2:0,3:0,4:0.5,5:0.7};
const A_ARTICLE_LENGTH=350;

const FILL_PRESETS={
  ja:[
    {value:'email',label:'社内メール・業務連絡',minDiff:1},
    {value:'minutes',label:'議事録・進捗報告',minDiff:1},
    {value:'proposal',label:'提案書・企画書',minDiff:2},
    {value:'report',label:'分析レポート・調査報告',minDiff:3},
    {value:'strategy',label:'経営戦略文書・コンサルレポート',minDiff:4},
  ],
  en:[
    {value:'email',label:'Internal email / communication',minDiff:1},
    {value:'minutes',label:'Meeting minutes / progress report',minDiff:1},
    {value:'proposal',label:'Proposal / project plan',minDiff:2},
    {value:'report',label:'Analysis report / research findings',minDiff:3},
    {value:'strategy',label:'Management strategy / consulting report',minDiff:4},
  ],
};
const SUMMARY_PRESETS=FILL_PRESETS;
const CRITIQUE_PRESETS={
  ja:[
    {value:'chat',label:'社内チャット・短いメール',minDiff:1},
    {value:'progress',label:'進捗報告・議事録',minDiff:1},
    {value:'proposal',label:'提案書・企画書',minDiff:2},
    {value:'report',label:'分析レポート・稟議書',minDiff:3},
    {value:'strategy',label:'経営戦略文書・提言書',minDiff:4},
  ],
  en:[
    {value:'chat',label:'Internal chat / short email',minDiff:1},
    {value:'progress',label:'Progress report / meeting minutes',minDiff:1},
    {value:'proposal',label:'Proposal / project plan',minDiff:2},
    {value:'report',label:'Analysis report / approval document',minDiff:3},
    {value:'strategy',label:'Strategy document / policy recommendation',minDiff:4},
  ],
};
const AME_PRESETS={
  ja:[
    {value:'sales',label:'営業・売上',minDiff:1},
    {value:'hr',label:'人事・組織',minDiff:1},
    {value:'it',label:'IT・システム',minDiff:2},
    {value:'strategy',label:'経営・戦略',minDiff:3},
  ],
  en:[
    {value:'sales',label:'Sales / Revenue',minDiff:1},
    {value:'hr',label:'HR / Organization',minDiff:1},
    {value:'it',label:'IT / Systems',minDiff:2},
    {value:'strategy',label:'Management / Strategy',minDiff:3},
  ],
};
const INDUSTRY_PRESETS={
  ja:[
    {value:'',label:'指定なし'},
    {value:'it',label:'IT・テクノロジー'},
    {value:'mfg',label:'製造業'},
    {value:'retail',label:'小売・EC'},
    {value:'finance',label:'金融・保険'},
    {value:'medical',label:'医療・ヘルスケア'},
  ],
  en:[
    {value:'',label:'Any industry'},
    {value:'it',label:'IT / Technology'},
    {value:'mfg',label:'Manufacturing'},
    {value:'retail',label:'Retail / E-commerce'},
    {value:'finance',label:'Finance / Insurance'},
    {value:'medical',label:'Healthcare / Medical'},
  ],
};
// ── ペルソナプリセット ────────────────────────────────
const PERSONA_TENURE_OPTIONS={
  ja:[
    {value:'',label:'未設定'},
    {value:'lt1',label:'1年未満'},
    {value:'1to3',label:'1〜3年'},
    {value:'3to5',label:'3〜5年'},
    {value:'5to10',label:'5〜10年'},
    {value:'gt10',label:'10年以上'},
  ],
  en:[
    {value:'',label:'Not set'},
    {value:'lt1',label:'Less than 1 year'},
    {value:'1to3',label:'1–3 years'},
    {value:'3to5',label:'3–5 years'},
    {value:'5to10',label:'5–10 years'},
    {value:'gt10',label:'10+ years'},
  ],
};
const PERSONA_TENURE_DESC={
  ja:{
    '':'',
    lt1:'基本的な業界用語は知っているが実務経験は浅い',
    '1to3':'日常業務の流れは把握しているが専門的判断は経験不足',
    '3to5':'専門知識を持ち、自律的に業務を遂行できる',
    '5to10':'チームや案件をリードできる経験を持つ',
    gt10:'マネジメント・意思決定の経験が豊富',
  },
  en:{
    '':'',
    lt1:'Familiar with basic industry terms but limited hands-on experience',
    '1to3':'Understands day-to-day workflow but still developing professional judgment',
    '3to5':'Has specialist knowledge and can work autonomously',
    '5to10':'Experienced in leading teams and projects',
    gt10:'Extensive management and decision-making experience',
  },
};
const PERSONA_INDUSTRY_ROLES={
  ja:[
    {industry:'IT・テクノロジー',roles:['エンジニア（開発）','PM・プロダクトマネージャー','データアナリスト','インフラ・SRE','デザイナー（UX/UI）','セールスエンジニア','営業']},
    {industry:'製造業',roles:['生産管理','品質管理・QA','調達・購買','技術・研究開発','営業','ロジスティクス・物流','工場管理']},
    {industry:'小売・EC',roles:['マーチャンダイザー','バイヤー','ECサイト運営','マーケティング','店舗運営・スーパーバイザー','物流・在庫管理','営業']},
    {industry:'金融・保険',roles:['営業（法人・個人）','ファンドマネージャー','アナリスト','リスク管理・コンプライアンス','ファイナンシャルアドバイザー','システム・IT','企画・経営企画']},
    {industry:'医療・ヘルスケア',roles:['医師・医療専門職','看護師・コメディカル','医療事務・管理','MR（医薬情報担当者）','医療機器営業','病院経営・企画','IT・DX推進']},
    {industry:'コンサルティング',roles:['戦略コンサルタント','ITコンサルタント','業務改善コンサルタント','マネージャー・シニアコンサルタント','リサーチ・アナリスト','営業・ビジネス開発']},
    {industry:'人材・教育',roles:['キャリアアドバイザー','リクルーター','人事・採用担当','研修・ラーニング開発','教育コンテンツ制作','営業']},
    {industry:'広告・マーケティング',roles:['マーケター','デジタルマーケター','広告プランナー','PRプランナー','コンテンツマーケター','データアナリスト','営業・アカウント']},
  ],
  en:[
    {industry:'IT / Technology',roles:['Software Engineer','Product Manager','Data Analyst','Infrastructure / SRE','UX/UI Designer','Sales Engineer','Sales']},
    {industry:'Manufacturing',roles:['Production Management','Quality Assurance','Procurement','R&D / Engineering','Sales','Logistics','Plant Management']},
    {industry:'Retail / E-commerce',roles:['Merchandiser','Buyer','E-commerce Operations','Marketing','Store Operations / Supervisor','Logistics / Inventory','Sales']},
    {industry:'Finance / Insurance',roles:['Corporate / Retail Sales','Fund Manager','Analyst','Risk / Compliance','Financial Advisor','IT / Systems','Corporate Planning']},
    {industry:'Healthcare / Medical',roles:['Physician / Medical Professional','Nurse / Allied Health','Medical Administration','MR / Pharmaceutical Sales','Medical Device Sales','Hospital Management','IT / DX']},
    {industry:'Consulting',roles:['Strategy Consultant','IT Consultant','Operations Consultant','Manager / Senior Consultant','Research Analyst','Business Development']},
    {industry:'HR / Education',roles:['Career Advisor','Recruiter','HR / Talent Acquisition','L&D / Training','Content Development','Sales']},
    {industry:'Advertising / Marketing',roles:['Marketer','Digital Marketer','Ad Planner','PR Planner','Content Marketer','Data Analyst','Account / Sales']},
  ],
};
const PERSONA_KEY='logic_persona_v1';
const TA_MAX_ROUNDS={1:1,2:2,3:2,4:3,5:3};
const TA_EXTRA_INFO={1:'none',2:'none',3:'after_first',4:'after_second',5:'multiple'};
const TSUMIAAGE_COLS=[
  'id','theme','diff','date','industry',
  'situation','steps','finalMode','finalAnswer','feedback','lang'
];
const INDUSTRY_CONSTRAINT={
  ja:'\n- 業界が指定されている場合は文脈の色付けのみに使用し、その業界の専門知識・専門用語・規制・法律を知らなくても読める内容にすること',
  en:'\n- If an industry is specified, use it only as context coloring. The content must be readable without specialized knowledge of that industry\'s regulations, terminology, or laws.',
};
function addIndustryConstraintToPrompts(prompts){
  const suffix=st.lang==='en'?INDUSTRY_CONSTRAINT.en:INDUSTRY_CONSTRAINT.ja;
  const out={};
  for(const k in prompts)out[k]=prompts[k]+suffix;
  return out;
}

const KB_MAX_ROUNDS={1:1,2:1,3:2,4:2,5:3};
const KIBARI_PRESETS={
  ja:[
    {value:'report',label:'報告・共有',minDiff:1},
    {value:'request',label:'依頼・指示',minDiff:1},
    {value:'proposal',label:'提案・説明',minDiff:1},
    {value:'self',label:'自己表現',minDiff:1},
  ],
  en:[
    {value:'report',label:'Report / Share',minDiff:1},
    {value:'request',label:'Request / Instruction',minDiff:1},
    {value:'proposal',label:'Proposal / Explanation',minDiff:1},
    {value:'self',label:'Self-introduction',minDiff:1},
  ],
};

/** 採点（答え合わせ）用 max_tokens — 従来比約1.5倍。問題生成には使わない */
const GRADE_MAX_TOKENS={
  diffLow:2250,diffHigh:3750,
  summaryShort:1800,summaryMid:4500,summaryLong:9000,
  default:3750,
};
function gradeMaxTokensByDiff(diff){
  return (diff||3)<=3?GRADE_MAX_TOKENS.diffLow:GRADE_MAX_TOKENS.diffHigh;
}
function gradeMaxTokensBySummaryLength(length){
  if(length<=500)return GRADE_MAX_TOKENS.summaryShort;
  if(length<=2000)return GRADE_MAX_TOKENS.summaryMid;
  return GRADE_MAX_TOKENS.summaryLong;
}

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

