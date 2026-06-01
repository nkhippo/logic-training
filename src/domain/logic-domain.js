/* Domain */
import { DEFAULT_S_VOLUME } from './constants.js';
import { parseF } from '../utils/markdown.js';

const SUM_SCORE100_NOTE_JA =
  '\n\n最初の行に必ず【スコア：XX/100】の形式で100点満点の点数を記載してください。\n採点基準：内容の正確さ（50点）・簡潔さ・文字数遵守（30点）・表現・論理性（20点）。';
const SUM_SCORE100_NOTE_EN =
  '\n\nStart with 【Score: XX/100】 on the very first line.\nScoring: content accuracy (50pts), conciseness & word count (30pts), expression & logic (20pts).';

// ── 穴埋め数 / 設問数の自動計算 ─────────────────────────
export const F_BLANKS={1:2,2:3,3:3,4:4,5:5};
export const F_LENGTH=450; // 全難易度共通（400〜500字の中央値）
export const S_LENGTH_FIXED={1:300,2:400,3:500};
export const S_LENGTH_VARIABLE={
  short:{ja:'さくっと',en:'Quick',chars:500},
  mid:{ja:'普通',en:'Normal',chars:2000},
  long:{ja:'じっくり',en:'Deep',chars:4000}
};
/**
 * @param {number} diff
 * @param {string} [sVolume]
 * @returns {number}
 */
export function getSummaryLength(diff, sVolume = DEFAULT_S_VOLUME) {
  if (diff <= 3) return S_LENGTH_FIXED[diff];
  const vol = sVolume || DEFAULT_S_VOLUME;
  return S_LENGTH_VARIABLE[vol].chars;
}
export const S_RATIO={1:.6,2:.5,3:.4,4:.3,5:.2};

export const C_QUESTION_COUNTS={1:3,2:3,3:4,4:5,5:5};
export const C_TEXT_LENGTH=400;

export const A_DEDUCTIVE_RATE={1:0,2:0,3:0,4:0.5,5:0.7};
export const A_ARTICLE_LENGTH=350;

export const FILL_PRESETS={
  ja:[
    {value:'email',label:'社内メール・業務連絡',minDiff:1},
    {value:'minutes',label:'議事録・進捗報告',minDiff:1},
    {value:'proposal',label:'提案書・企画書',minDiff:2},
    {value:'report',label:'分析レポート・調査報告',minDiff:3},
    {value:'strategy',label:'経営戦略文書・コンサルレポート',minDiff:4},
    {value:'custom',label:'その他（自由入力）',minDiff:1},
  ],
  en:[
    {value:'email',label:'Internal email / communication',minDiff:1},
    {value:'minutes',label:'Meeting minutes / progress report',minDiff:1},
    {value:'proposal',label:'Proposal / project plan',minDiff:2},
    {value:'report',label:'Analysis report / research findings',minDiff:3},
    {value:'strategy',label:'Management strategy / consulting report',minDiff:4},
    {value:'custom',label:'Other (free input)',minDiff:1},
  ],
};
export const SUMMARY_PRESETS=FILL_PRESETS;
export const CRITIQUE_PRESETS={
  ja:[
    {value:'chat',label:'社内チャット・短いメール',minDiff:1},
    {value:'progress',label:'進捗報告・議事録',minDiff:1},
    {value:'proposal',label:'提案書・企画書',minDiff:2},
    {value:'report',label:'分析レポート・稟議書',minDiff:3},
    {value:'strategy',label:'経営戦略文書・提言書',minDiff:4},
    {value:'custom',label:'その他（自由入力）',minDiff:1},
  ],
  en:[
    {value:'chat',label:'Internal chat / short email',minDiff:1},
    {value:'progress',label:'Progress report / meeting minutes',minDiff:1},
    {value:'proposal',label:'Proposal / project plan',minDiff:2},
    {value:'report',label:'Analysis report / approval document',minDiff:3},
    {value:'strategy',label:'Strategy document / policy recommendation',minDiff:4},
    {value:'custom',label:'Other (free input)',minDiff:1},
  ],
};
export const AME_PRESETS={
  ja:[
    {value:'sales',label:'営業・売上',minDiff:1},
    {value:'hr',label:'人事・組織',minDiff:1},
    {value:'it',label:'IT・システム',minDiff:2},
    {value:'strategy',label:'経営・戦略',minDiff:3},
    {value:'custom',label:'その他（自由入力）',minDiff:1},
  ],
  en:[
    {value:'sales',label:'Sales / Revenue',minDiff:1},
    {value:'hr',label:'HR / Organization',minDiff:1},
    {value:'it',label:'IT / Systems',minDiff:2},
    {value:'strategy',label:'Management / Strategy',minDiff:3},
    {value:'custom',label:'Other (free input)',minDiff:1},
  ],
};
export const INDUSTRY_CONSTRAINT={
  ja:'\n- 業界が指定されている場合は文脈の色付けのみに使用し、その業界の専門知識・専門用語・規制・法律を知らなくても読める内容にすること',
  en:'\n- If an industry is specified, use it only as context coloring. The content must be readable without specialized knowledge of that industry\'s regulations, terminology, or laws.',
};
export function addIndustryConstraintToPrompts(prompts, lang = 'ja'){
  const suffix=lang==='en'?INDUSTRY_CONSTRAINT.en:INDUSTRY_CONSTRAINT.ja;
  const out={};
  for(const k in prompts)out[k]=prompts[k]+suffix;
  return out;
}

/** 採点（答え合わせ）用 max_tokens — 従来比約1.5倍。問題生成には使わない */
export const GRADE_MAX_TOKENS={
  diffLow:2250,diffHigh:3750,
  summaryShort:1800,summaryMid:4500,summaryLong:9000,
  default:3750,
};
export function gradeMaxTokensByDiff(diff){
  return (diff||3)<=3?GRADE_MAX_TOKENS.diffLow:GRADE_MAX_TOKENS.diffHigh;
}
export function gradeMaxTokensBySummaryLength(length){
  if(length<=500)return GRADE_MAX_TOKENS.summaryShort;
  if(length<=2000)return GRADE_MAX_TOKENS.summaryMid;
  return GRADE_MAX_TOKENS.summaryLong;
}

export function calcBlanks(diff){
  return F_BLANKS[diff]||3;
}
export function calcBlocks(diff){
  if(diff===1)return 1;
  if(diff===2)return 2;
  return 3;
}
export function getSumQuestionTypes(diff){
  if(diff===1)return ['主張のまとめ'];
  if(diff===2)return ['主張のまとめ','用語の説明'];
  return ['用語の説明','主張のまとめ','理由の説明'];
}
export const SUM_TYPE_LABELS={
  ja:{'用語の説明':'用語の説明','主張のまとめ':'主張のまとめ','理由の説明':'理由の説明','語句説明':'用語の説明','主張要約':'主張のまとめ','理由説明':'理由の説明'},
  en:{'用語の説明':'Term explanation','主張のまとめ':'Main claim','理由の説明':'Reason','語句説明':'Term explanation','主張要約':'Main claim','理由説明':'Reason'}
};
export function normSummaryProb(prob, defaultLang = 'ja'){
  const lang=prob.lang||prob.rang||defaultLang;
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
export function sumTypeLabel(type,lang){return(SUM_TYPE_LABELS[lang]||SUM_TYPE_LABELS.ja)[type]||type;}
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
export function buildSummaryGradePrompt(prob,userTexts){
  const pLang=prob.lang||'ja';
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

