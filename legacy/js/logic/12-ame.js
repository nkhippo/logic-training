/* Ame */
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
  if(!isEN)return addIndustryConstraintToPrompts({
    1:`難易度1（入門）・帰納型:\n- ビジネスデータを題材にした300〜400字の短い記事を生成する\n- テーマ：営業・売上／マーケティングの領域（例：月次売上データ・顧客獲得数・キャンペーン結果など）\n- 事実のみで構成する（数値・調査結果・客観的なビジネスデータのみ）\n- 解釈や意見・評価は一切含めないこと\n- 設問構成：読み取り（雨）・次の行動（傘）の2問のみ\n- targetChars: 雨150字、傘150字`,
    2:`難易度2（基礎）・帰納型:\n- ビジネスデータを題材にした300〜400字の短い記事を生成する\n- テーマ：人事・組織／プロジェクト管理の領域（例：離職率・稼働率・進捗状況など）\n- 事実のみで構成する（数値・客観的なビジネスデータのみ）\n- 設問構成：事実の仕分け（空）・読み取り（雨）・次の行動（傘）の3問\n- 仕分け設問は「この記事に書かれていることをすべてビジネスデータ・客観的事実として整理してください」という形式\n- targetChars: 仕分け200字、雨150字、傘150字`,
    3:`難易度3（標準）・帰納型:\n- ビジネスデータを題材にした300〜400字の記事を生成する\n- テーマ：IT・システム／マーケティングの領域（例：システム導入結果・広告効果・ユーザー行動データなど）\n- 事実は5〜6件、解釈・意見は2〜3件を自然に混在させる（解釈が事実として書かれているように見える文を含めること）\n- 傘（次の行動）には制約条件を1つ設ける（例：「3ヶ月以内に実施可能なもの」「追加コストなしで」など）\n- 設問構成：事実の仕分け（空）・読み取り（雨）・次の行動（傘）の3問\n- 仕分け設問は「事実（数字や客観的情報）として書かれている部分」と「見方・解釈として書かれている部分」を仕分けする形式\n- targetChars: 仕分け250字、雨160字、傘160字`,
    4:`難易度4（上級）:\n- 演繹型（約50%）または帰納型（約50%）をランダムに選択する\n- テーマ：経営・戦略／営業の領域（例：市場シェア変動・競合分析・営業戦略の結果など）\n【演繹型の場合】\n- ビジネス原則・法則を1つ生成する（1〜2文。実際のビジネス現場で使われる判断基準にすること）\n  例：「主要顧客のLTVが低下している場合、価格戦略の見直しかサービス強化のいずれかを優先する必要がある」\n- 事実と解釈が混在した300〜400字のビジネス記事を生成する\n- 事実は5〜6件、解釈は2〜3件\n- 因果の距離を伸ばす（複数の事実を組み合わせて初めて読み取りが導ける構造）\n- 解釈の競合を含める（同じ事実から2つの読み取りが成立しうる）\n- 傘に制約条件を1つ設ける\n- 設問構成：事実の仕分け・読み取り・次の行動・考えの根拠の説明・5問目（自己検証または法則が当てはまらない場合をランダム選択）\n【帰納型の場合】\n- 事実と解釈が混在した300〜400字のビジネス記事を生成する\n- 事実は5〜6件、解釈は2〜3件\n- 解釈の競合を含める\n- 傘に制約条件を1つ設ける\n- 設問構成：事実の仕分け・読み取り・次の行動・考えの根拠の説明・5問目（自己検証に固定）\n- targetChars: 仕分け250字、雨200字、傘200字、導出200字、5問目200字`,
    5:`難易度5（超難問）:\n- 演繹型（約70%）または帰納型（約30%）をランダムに選択する\n- テーマ：経営・戦略／IT・システムの領域（例：DX推進・組織変革・事業撤退判断など）\n【演繹型の場合】\n- ビジネス原則・法則を1つ生成する（複合的な条件を含む2〜3文。経営判断レベルの基準にすること）\n- 事実と解釈が混在した300〜400字のビジネス記事を生成する\n- 事実は6〜7件、解釈は3〜4件\n- 因果の距離を3ステップ以上に設定する\n- 解釈の競合を含める\n- 傘に複数の制約条件を設ける\n- 設問構成：事実の仕分け・読み取り・次の行動・考えの根拠の説明・5問目（自己検証または法則が当てはまらない場合をランダム選択）\n【帰納型の場合】\n- 難易度4帰納型より複雑な構造（事実7件以上・因果の距離3ステップ以上）\n- 設問構成：事実の仕分け・読み取り・次の行動・考えの根拠の説明・5問目（自己検証に固定）\n- targetChars: 仕分け300字、雨220字、傘220字、導出220字、5問目220字`,
  });
  return addIndustryConstraintToPrompts({
    1:`Difficulty 1 (Beginner) · Inductive:\n- Generate a 300-400 character business article using facts only\n- Theme: Sales / Marketing (e.g. monthly sales data, customer acquisition numbers, campaign results)\n- Facts only: numbers, survey results, objective business data\n- No interpretations, opinions, or evaluations\n- Questions: Interpretation (Rain) and Action (Umbrella) only\n- targetChars: Rain 150, Umbrella 150`,
    2:`Difficulty 2 (Basic) · Inductive:\n- Generate a 300-400 character business article using facts only\n- Theme: HR / Project Management (e.g. turnover rate, utilization rate, progress status)\n- Facts only: numbers, objective business data\n- Questions: Fact sorting, Interpretation, Action (3 questions)\n- Sorting question: "List all the business facts and objective data stated in this article"\n- targetChars: Sorting 200, Rain 150, Umbrella 150`,
    3:`Difficulty 3 (Standard) · Inductive:\n- Generate a 300-400 character business article mixing facts and interpretations\n- Theme: IT/Systems / Marketing (e.g. system implementation results, ad performance, user behavior data)\n- Include 5-6 facts and 2-3 interpretations/opinions naturally mixed in\n  (include sentences that appear to be facts but are actually interpretations)\n- Add one constraint to the Action question (e.g. "implementable within 3 months", "without additional cost")\n- Questions: Fact sorting, Interpretation, Action (3 questions)\n- Sorting: separate "facts (numbers/objective data)" from "interpretations/opinions"\n- targetChars: Sorting 250, Rain 160, Umbrella 160`,
    4:`Difficulty 4 (Advanced):\n- Randomly select deductive (~50%) or inductive (~50%) type\n- Theme: Strategy / Sales (e.g. market share changes, competitive analysis, sales strategy results)\n[Deductive]\n- Generate one business principle/law (1-2 sentences. Use real business judgment criteria)\n  e.g. "When key customer LTV is declining, prioritize either pricing strategy revision or service enhancement"\n- Generate a 300-400 character business article mixing facts (5-6) and interpretations (2-3)\n- Extend causal distance (interpretation requires combining multiple facts)\n- Include competing interpretations (two valid interpretations from same facts)\n- Add one constraint to Umbrella\n- Questions: Sorting, Interpretation, Action, Deduction explanation, Q5 (self-verification or law limitation randomly)\n[Inductive]\n- Generate a 300-400 character business article with competing interpretations\n- Add one constraint to Umbrella\n- Questions: Sorting, Interpretation, Action, Deduction explanation, Q5 (self-verification fixed)\n- targetChars: Sorting 250, Rain 200, Umbrella 200, Deduction 200, Q5 200`,
    5:`Difficulty 5 (Master):\n- Randomly select deductive (~70%) or inductive (~30%) type\n- Theme: Strategy / IT (e.g. DX initiatives, organizational change, business exit decisions)\n[Deductive]\n- Generate one business principle/law (2-3 sentences with compound conditions. Use executive decision-level criteria)\n- Generate a 300-400 character business article with 6-7 facts and 3-4 interpretations\n- Extend causal distance to 3+ steps\n- Include competing interpretations\n- Add multiple constraints to Umbrella\n- Questions: Sorting, Interpretation, Action, Deduction explanation, Q5 (randomly self-verification or law limitation)\n[Inductive]\n- More complex than Difficulty 4 inductive (7+ facts, 3+ causal steps)\n- Questions: Sorting, Interpretation, Action, Deduction explanation, Q5 (self-verification fixed)\n- targetChars: Sorting 300, Rain 220, Umbrella 220, Deduction 220, Q5 220`,
  });
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
function ameSkyUsesSplitFields(prob,q){
  const diff=prob.diff??st.aDiff??3;
  const type=q?.type||'';
  return diff>=3&&(type==='空'||type==='Sky');
}
function collectAmeUserAnswer(prob,q,i,pfx){
  const lang=prob.lang||st.lang;
  const isEN=lang==='en';
  const taId=(pfx||'')+'a-ans-'+i;
  if(ameSkyUsesSplitFields(prob,q)){
    const fact=document.getElementById(`${taId}-fact`)?.value.trim()||'';
    const interp=document.getElementById(`${taId}-interp`)?.value.trim()||'';
    if(!fact&&!interp)return '—';
    return isEN
      ?`[Facts]\n${fact||'—'}\n\n[Interpretations/Opinions]\n${interp||'—'}`
      :`【事実】\n${fact||'—'}\n\n【解釈・意見】\n${interp||'—'}`;
  }
  return document.getElementById(taId)?.value.trim()||'—';
}
function collectAmeUserAnswers(prob,pfx){
  return prob.questions.map((q,i)=>collectAmeUserAnswer(prob,q,i,pfx));
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
    const isEN=lang==='en';
    if(ameSkyUsesSplitFields(prob,q)){
      const factChars=Math.ceil(tc/2);
      const interpChars=Math.floor(tc/2);
      const totalNote=isEN
        ?`(${l.aSoraSplitTotal} ${tc} chars)`
        :`（${l.aSoraSplitTotal}${tc}${cw}）`;
      return`<div class="ame-q-block">
      <div class="ame-section-lbl">${esc(sectionLbl)}<span class="q-type-badge" style="margin-left:6px;">${esc(badgeLabel)}</span></div>
      <p class="ame-q-lbl">${esc(q.question||'')}<span style="font-size:11px;color:var(--text2);margin-left:6px;">${totalNote}</span></p>
      <div class="ame-sora-split no-print">
        <label class="ame-sora-sub-lbl">${esc(l.aSoraFactLbl)}<span style="font-size:11px;color:var(--text2);margin-left:6px;">（${factChars}${cw}）</span></label>
        <textarea class="sum-ta" id="${taId}-fact"
          style="min-height:${Math.max(72,factChars*1.6)}px"
          data-target="${factChars}"
          placeholder=""></textarea>
        <label class="ame-sora-sub-lbl">${esc(l.aSoraInterpLbl)}<span style="font-size:11px;color:var(--text2);margin-left:6px;">（${interpChars}${cw}）</span></label>
        <textarea class="sum-ta" id="${taId}-interp"
          style="min-height:${Math.max(72,interpChars*1.6)}px"
          data-target="${interpChars}"
          placeholder=""></textarea>
      </div>
    </div>`;
    }
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
  renderProblemMeta('a-theme-tag',p);
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
  if(isBusy())return;
  const isEN=st.lang==='en';
  if(!validateBeforeGen('a'))return;
  const themeIn=buildThemeInFromDocType('a',isEN);
  const diff=st.aDiff;
  const isDeductive=Math.random()<A_DEDUCTIVE_RATE[diff];
  document.getElementById('ame-result').style.display='none';
  if(!beginGen('ame'))return;
  const sys=isEN
    ?'You are an expert in business reasoning and Sky-Rain-Umbrella framework education. The educational goal of this tab is to train learners to distinguish business facts from interpretations, derive logically valid interpretations from business data, and propose actions grounded in those interpretations. Use real business contexts (sales, HR, strategy, IT) as topics. For difficulty 3 and above, intentionally mix facts and interpretations so learners must sort them before deriving their own interpretation and action. Respond ONLY in valid JSON. No markdown fences, no explanation before or after.'
    :'あなたはビジネス推論と空雨傘フレームワークの教育専門家です。このタブの教育目的は「ビジネスデータにおける事実と解釈を混同せずに書き分け、事実から論理的に妥当な読み取りを導き、読み取りに基づく行動を提案する力を鍛えること」です。営業・人事・経営・IT などのビジネス領域を題材にしてください。難易度3以上では記事に事実と解釈を意図的に混在させ、学習者が仕分けを行った上で自分の読み取り・行動を導出できる構造にしてください。必ず指定されたJSON形式のみで返答してください。JSONの前後に説明文や```などを一切含めないでください。';
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
  const personaNote=buildPersonaPromptNote(isEN);
  const prompt=`${themeInst}\n${diffPrompt}${typeNote}${qTypesNote}${constraintNote}\n${jsonSchema}${personaNote}`;
  try{
    const genMaxTokens=diff<=3?2200:2500;
    const beProblemHolder={};
    const raw=await callClaude(prompt,sys,genMaxTokens,0.9,{
      mode:'generate',service:'logic',tab:'ame',theme:themeIn||'auto',
      onProblemId:(id)=>{beProblemHolder.id=id;},
    });
    if(!raw)return;
    const p=normalizeAmeFromModel(parseModelJSON(raw));
    if(!p.article)throw new Error('Invalid JSON structure: missing article (keys: '+Object.keys(p).join(', ')+')');
    if(!p.questions.length)throw new Error('Invalid JSON structure: missing questions');
    st.ame={
      id:Date.now(),beProblemId:beProblemHolder.id||null,theme:p.theme||(themeIn?themeIn.slice(0,20):''),diff,
      date:new Date().toISOString(),industry:genIndustrySnapshot(),law:p.law||null,article:p.article,
      constraint:p.constraint||null,questions:p.questions,
      form:p.form||(isDeductive?'deductive':'inductive'),feedback:null,lang:st.lang,
    };
    renderAme(st.ame);
    resetGenConditions();
    try{await syncPastOnGen('ame',st.ame);}
    catch(syncErr){setSync('ame','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].aGenFailed+'\n'+e.message);}
  finally{endGen('ame');}
}
async function submitAme(){
  if(isBusy())return;
  const prob=st.ame;if(!prob)return;
  if(st.answerMode==='photo'&&st.answerScope==='a'){await submitPhotoGrade('ame',prob,'a');return;}
  const userAnswers=collectAmeUserAnswers(prob,'');
  if(userAnswers.some(isBlankAnswer)){
    alert(L[st.lang].ameAnswerRequired);
    return;
  }
  if(!beginGradeBusy('ame'))return;
  const fb=document.getElementById('a-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading}</span></p>`;
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
  finally{endGradeBusy('ame');}
}
async function gradeAme(prob,userAnswers){
  const isEN=(prob.lang||st.lang)==='en';
  const sys=isEN
    ?'You are an expert in business reasoning and Sky-Rain-Umbrella framework education. The goal of feedback is to evaluate: whether the interpretation is logically derived from the business facts without gaps, whether the action logically follows from the interpretation and respects any constraints, and whether the learner is aware that alternative interpretations are possible from the same data. Point out specific gaps, present one alternative interpretation, then provide an improved example. Give structured feedback in English using markdown.'
    :'あなたはビジネス推論と空雨傘フレームワークの教育専門家です。フィードバックの目的は「ビジネスデータから読み取りへの飛躍がないか」「読み取りから行動への論理的なつながりがあるか（制約条件を守っているか）」「同じデータから別の読み取りが導ける可能性に気づいているか」を評価することです。飛躍を具体的に指摘し、別の読み取りを1つ示した上で改善例を提示してください。マークダウンを使って構造的に日本語でフィードバックしてください。';
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
    ?`Grade each answer on the following axes:\n- Factual grounding: Is the interpretation/action logically derived from the business data?\n- Logical gap: Is there a jump between data → interpretation or interpretation → action?\n- Constraint compliance: Does the Umbrella action respect any stated constraints?\n- Alternative interpretation: Show one other valid interpretation from the same data.\nProvide an improved example within the character limit for each question.\n\n## Per-Question Feedback\n## Overall Feedback`
    :`各設問を以下の軸で採点してください。\n- 事実との整合性：読み取り・行動がビジネスデータから論理的に導けているか\n- 飛躍の指摘：データ→読み取り、読み取り→行動の間に飛躍がないか\n- 制約条件の遵守：傘（行動）が制約条件を守っているか\n- 別解の提示：同じデータから導ける別の読み取りを1つ示す\n各設問の末尾に文字数以内の改善例を示してください。\n\n## 設問別フィードバック\n## 総合講評`;
  const prompt=`${lawSection}${articleSection}${constraintSection}${qSection}\n\n${gradeInst}`;
  return callClaude(prompt,sys,gradeMaxTokensByDiff(prob.diff),0.3,{
    mode:'score',service:'logic',problem_id:prob.beProblemId||null,
    user_answer:userAnswers.join('\n---\n'),
    context:{original_problem:prob.article,tab:'ame'},
    markdownResponse:true,
  });
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
function buildAmeEntry(prob){
  return{
    id:prob.id||Date.now(),sheet:'ame',theme:prob.theme||'—',diff:prob.diff,date:prob.date,industry:prob.industry||'',
    law:prob.law||'',article:prob.article||'',constraint:prob.constraint||'',
    questions:JSON.stringify(prob.questions||[]),feedback:prob.feedback||null,
    form:prob.form||'inductive',lang:prob.lang||st.lang,
  };
}
async function ppAme(id){
  if(isBusy())return;
  const prob=st.aPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const p=normAmeProb(prob);
  const pLang=prob.lang||'ja';const l=L[pLang];
  if(st.answerMode==='photo'&&st.answerScope==='pp'){await submitPhotoGrade('ame',{...p,lang:pLang},'pp');return;}
  const userAnswers=collectAmeUserAnswers({...p,lang:pLang},'pp-');
  if(!beginGradeBusy('pp-ame'))return;
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
  finally{endGradeBusy('pp-ame');}
}
