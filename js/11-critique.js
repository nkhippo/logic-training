/* Critique */
// ── 批判読み ─────────────────────────────────────────────

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
function getCritiqueQuestionTypes(diff){
  if(diff===1)return ['本当にそう言える？の指摘','本当にそう言える？の指摘','結論が成立するための条件'];
  if(diff===2)return ['本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答'];
  if(diff===3)return ['話の流れの整理','本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答'];
  if(diff===4)return ['話の流れの整理','本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答','立場が異なる人からの疑問'];
  return ['話の流れの整理','本当にそう言える？の指摘','結論が成立するための条件','反対意見への応答','立場が異なる人からの疑問'];
}
function getCritiquePrompts(){
  const l=st.lang;
  if(l==='ja')return addIndustryConstraintToPrompts({
    1:`難易度1（入門）・B形式:\n- 短い論証を3つ生成する（各50〜80字）\n- ビジネス現場で起こりうる単純な因果構造（「〜だから〜すべき」「〜なので〜になる」など）\n- 各論証に論理のつながりが不十分な箇所を1つだけ含める\n- 設問は平易な言葉で「この文章では〜と結論づけています。その間に「本当にそう言える？」と感じる部分はどこですか？」という形式にする\n- targetChars: 100字`,
    2:`難易度2（基礎）・B形式:\n- 短い論証を3つ生成する（各60〜90字）\n- ビジネス現場の状況（売上・人事・プロジェクト・施策など）を題材にする\n- 設問タイプの順序: 本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答\n- 各論証の論理構造は異なるものにする\n- 設問は平易なビジネス表現で書く（論理学の専門用語を使わない）\n- targetChars: 指摘100字、条件120字、応答120字`,
    3:`難易度3（標準）・A形式:\n- 約400字のビジネス文書（提案書・報告書・企画書の一節）を1本生成する\n- 構造：「課題提起→根拠2〜3つ→反論への言及→提案・結論」\n- 文体：ビジネス文書として自然な文体。論理の弱点を意図的に含めること\n- 設問タイプ：話の流れの整理・本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答\n- 設問はすべて平易なビジネス表現で書く\n- targetChars: 整理150字、指摘120字、条件130字、応答150字`,
    4:`難易度4（上級）・A形式:\n- 約400字のビジネス文書（分析レポート・稟議書・提言書の一節）を1本生成する\n- 構造：「課題提起→根拠2〜3つ→反論処理→結論・提言」の2層構造\n- 文体：上位職向けのビジネス文書。論理構造が精緻で、読み手の立場によって疑問が生じる設計にする\n- 設問タイプ：話の流れの整理・本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答・立場が異なる人からの疑問\n- 「立場が異なる人からの疑問」では、現場担当者・管理職・顧客など立場の異なる人が持ちうる疑問を問う\n- 設問はすべて平易なビジネス表現で書く\n- targetChars: 整理150字、指摘130字、条件140字、応答150字、疑問160字`,
    5:`難易度5（超難問）・A形式:\n- 約400字のビジネス文書（経営戦略文書・コンサルレポート・提言書の一節）を1本生成する\n- 構造：「課題提起→根拠3つ以上→留保・例外→反論処理→結論・提言」の3層構造\n- 文体：経営層・意思決定者向けの高度なビジネス文書。多層的な論証・留保を含むこと\n- 設問タイプ：話の流れの整理・本当にそう言える？の指摘・結論が成立するための条件・反対意見への応答・立場が異なる人からの疑問\n- 「立場が異なる人からの疑問」では、複数の利害関係者（株主・現場・顧客・社会）の立場から最も論証を揺るがす疑問を問う\n- 設問はすべて平易なビジネス表現で書く\n- targetChars: 整理180字、指摘150字、条件160字、応答170字、疑問180字`,
  });
  return addIndustryConstraintToPrompts({
    1:`Difficulty 1 (Beginner) · Form B:\n- Generate 3 independent short arguments (50-80 chars each)\n- Use business scenarios with simple causal structure ("because X, we should Y")\n- Each argument must contain exactly one logical gap\n- Questions must use plain language: "This text concludes X. Where does it feel like a stretch?"\n- targetChars: 100`,
    2:`Difficulty 2 (Basic) · Form B:\n- Generate 3 independent short arguments (60-90 chars each)\n- Use business scenarios (sales, HR, projects, initiatives)\n- Question types in order: logical gap, missing condition, counterargument response\n- Each argument must have a different logical structure\n- Use plain business language in all questions (no academic jargon)\n- targetChars: gap 100, condition 120, response 120`,
    3:`Difficulty 3 (Standard) · Form A:\n- Generate one business document excerpt (~400 characters): proposal, report, or plan\n- Structure: issue → 2-3 pieces of evidence → reference to counterargument → proposal/conclusion\n- Style: natural business writing with intentional logical weaknesses\n- Question types: flow summary, logical gap, missing condition, counterargument response\n- Use plain business language in all questions\n- targetChars: flow 150, gap 120, condition 130, response 150`,
    4:`Difficulty 4 (Advanced) · Form A:\n- Generate one business document excerpt (~400 characters): analysis report, approval document, or recommendation\n- Structure: issue → 2-3 pieces of evidence → counterargument handling → conclusion/recommendation (2-layer)\n- Style: senior-level business document with precise logic and viewpoint-dependent questions\n- Question types: flow summary, logical gap, missing condition, counterargument response, stakeholder perspective\n- "Stakeholder perspective": ask about questions that arise from different roles (frontline staff, management, customers)\n- Use plain business language in all questions\n- targetChars: flow 150, gap 130, condition 140, response 150, perspective 160`,
    5:`Difficulty 5 (Master) · Form A:\n- Generate one business document excerpt (~400 characters): strategy document, consulting report, or policy recommendation\n- Structure: issue → 3+ pieces of evidence → reservation/exception → counterargument handling → conclusion (3-layer)\n- Style: executive-level business document with multi-layer reasoning and reservations\n- Question types: flow summary, logical gap, missing condition, counterargument response, stakeholder perspective\n- "Stakeholder perspective": ask which stakeholder's perspective (shareholders, frontline, customers, society) most challenges the argument\n- Use plain business language in all questions\n- targetChars: flow 180, gap 150, condition 160, response 170, perspective 180`,
  });
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
  renderProblemMeta('c-theme-tag',prob);
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
  if(isBusy())return;
  if(!validateBeforeGen('c'))return;
  const themeIn=buildThemeInFromDocType('c',isEN);
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
      date:new Date().toISOString(),industry:genIndustrySnapshot(),text:p.text||null,questions,
      feedback:null,lang:st.lang,form:isAForm?'A':'B',
    };
    renderCritique(st.critique);
    resetGenConditions();
    try{await syncPastOnGen('critique',st.critique);}
    catch(syncErr){setSync('critique','err',L[st.lang].syncFailed);showToast('Error: '+syncErr.message,4000);}
  }catch(e){alert(L[st.lang].cGenFailed+'\n'+e.message);}
  finally{endGen('critique');}
}
async function submitCritique(){
  if(isBusy())return;
  const prob=st.critique;if(!prob)return;
  if(st.answerMode==='photo'&&st.answerScope==='c'){await submitPhotoGrade('critique',prob,'c');return;}
  const userAnswers=prob.questions.map((_,i)=>document.getElementById(`c-ans-${i}`)?.value.trim()||'');
  if(userAnswers.some(isBlankAnswer)){
    alert(L[st.lang].critiqueAnswerRequired);
    return;
  }
  if(!beginGradeBusy('critique'))return;
  const fb=document.getElementById('c-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading}</span></p>`;
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
  finally{endGradeBusy('critique');}
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
  return callClaude(prompt,sys,gradeMaxTokensByDiff(prob.diff),0.3);
}
function buildCritiqueEntry(prob){
  const p=normCritiqueProb(prob);
  return{
    id:p.id||Date.now(),sheet:'critique',theme:p.theme||'—',diff:p.diff,date:p.date,industry:p.industry||'',
    text:p.text||'',questions:JSON.stringify(p.questions||[]),feedback:prob.feedback||p.feedback||null,
    form:p.form,lang:p.lang||st.lang,
  };
}
async function ppCritique(id){
  if(isBusy())return;
  const prob=st.cPast.find(p=>String(p.id)===String(id));if(!prob)return;
  const p=normCritiqueProb(prob);
  const pLang=prob.lang||'ja';const l=L[pLang];
  if(st.answerMode==='photo'&&st.answerScope==='pp'){await submitPhotoGrade('critique',{...p,lang:pLang},'pp');return;}
  const userAnswers=p.questions.map((_,i)=>document.getElementById(`pp-c-ans-${i}`)?.value.trim()||'—');
  if(!beginGradeBusy('pp-critique'))return;
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
  finally{endGradeBusy('pp-critique');}
}

