/* Tsumiaage（積み上げ） */

function getTsumiaagePrompt(diff,isEN){
  if(!isEN)return{
    1:`難易度1（入門）:
- 定量データ＋人の発言・状況説明が混在したビジネス状況を生成する（300〜400字）
- 「どうすべきか・どう判断できるか」を問う設計にする
- 情報は比較的明確で、1段階の判断で答えが出せるもの
- STEP構成：A（事実整理）・B（現時点の判断）のみ
- 追加情報なし`,
    2:`難易度2（基礎）:
- 定量データ＋人の発言・状況説明が混在したビジネス状況を生成する（350〜450字）
- 「どうすべきか・どう判断できるか」を問う設計にする
- 一部に曖昧な情報を含め、判断のバリエーションが2〜3通り考えられる構造にする
- STEP構成：A（事実整理）・B（判断のバリエーション）のみ
- 追加情報なし`,
    3:`難易度3（標準）:
- 定量データ＋人の発言・状況説明が混在したビジネス状況を生成する（400〜500字）
- 「どうすべきか・どう判断できるか」を問う設計にする
- 曖昧・不完全な情報を含め、1段階目の判断では結論が出しにくい構造にする
- 追加情報（仮説を揺さぶる新情報）を1つ用意する（一次判断の後に提示）
- STEP構成：A（事実整理）・B（判断のバリエーション）・C（確認すべき情報）、追加情報後に再度A・B
- C問：「矛盾を解消するために誰に・何を確認しますか？」という問い方にする`,
    4:`難易度4（上級）:
- 定量データ＋人の発言・状況説明が混在したビジネス状況を生成する（450〜550字）
- 複数の利害関係者が絡む複雑な状況にする
- 追加情報（仮説を揺さぶる新情報）を1つ用意する（二次判断の後に提示）
- STEP構成：A・B（一次）→上司問い返し（反証含む）→A・B（二次）→追加情報→A・B（最終）
- C問あり`,
    5:`難易度5（超難問）:
- 定量データ＋人の発言・状況説明が混在したビジネス状況を生成する（500〜600字）
- 複数の利害関係者・外部環境・内部矛盾が絡む高度な状況にする
- 追加情報を複数回（2回）用意する
- STEP構成：A・B（一次）→上司問い返し→追加情報①→A・B（二次）→上司問い返し（反証含む）→追加情報②→A・B（最終）
- C問あり`,
  }[diff];
  return{
    1:`Difficulty 1 (Beginner):
- Generate a business situation mixing quantitative data and statements/context (300–400 chars)
- Frame it as "what should be done / what judgment can be made?"
- Information is relatively clear; a single-step judgment should suffice
- Steps: A (sort facts) and B (current judgment) only
- No additional information`,
    2:`Difficulty 2 (Basic):
- Generate a business situation mixing quantitative data and statements/context (350–450 chars)
- Frame it as "what should be done / what judgment can be made?"
- Include some ambiguous info so 2–3 judgment variants are plausible
- Steps: A (sort facts) and B (judgment variants) only
- No additional information`,
    3:`Difficulty 3 (Standard):
- Generate a business situation mixing quantitative data and statements/context (400–500 chars)
- Frame it as "what should be done / what judgment can be made?"
- Include incomplete/ambiguous info so first-round judgment is inconclusive
- Prepare one piece of additional information to challenge the hypothesis (revealed after first judgment)
- Steps: A, B, C then A, B again after additional info
- C question: "Who would you contact and what would you ask to resolve the contradictions?"`,
    4:`Difficulty 4 (Advanced):
- Generate a business situation mixing quantitative data and statements/context (450–550 chars)
- Involve multiple stakeholders with conflicting interests
- Prepare one piece of additional information (revealed after second judgment)
- Steps: A, B (1st) → manager follow-up (with counterargument) → A, B (2nd) → extra info → A, B (final)
- C question included`,
    5:`Difficulty 5 (Master):
- Generate a business situation mixing quantitative data and statements/context (500–600 chars)
- Involve multiple stakeholders, external factors, and internal contradictions
- Prepare two pieces of additional information
- Steps: A, B (1st) → follow-up → extra info ① → A, B (2nd) → follow-up (counterargument) → extra info ② → A, B (final)
- C question included`,
  }[diff];
}

async function generateTsumiaage(){
  if(isBusy())return;
  if(!validateBeforeGen('ta'))return;
  const isEN=st.lang==='en';
  const diff=st.taDiff;
  const themeIn=buildThemeInFromDocType('ta',isEN);
  const personaNote=buildPersonaPromptNote(isEN);

  document.getElementById('tsumiaage-result').style.display='none';
  if(!beginGen('tsumiaage'))return;

  const sys=isEN
    ?'You are an expert in business decision-making education. Generate a realistic business situation that requires the respondent to sort facts from uncertainty and make a reasoned judgment. The situation must mix quantitative data with qualitative statements. Include intentional ambiguity appropriate to the difficulty level. Respond ONLY in valid JSON. No markdown fences.'
    :'あなたはビジネスの意思決定・問題解決教育の専門家です。回答者が事実を整理し、根拠を持って判断を下すことが求められるリアルなビジネス状況を生成してください。定量データと人の発言・状況説明を混在させてください。難易度に応じた曖昧さを意図的に含めてください。必ず指定されたJSON形式のみで返答してください。';

  const diffPrompt=getTsumiaagePrompt(diff,isEN);
  const themeInst=buildThemeInst(themeIn,'keyword',500,isEN,false);
  const jsonSchema=isEN
    ?`Return ONLY this JSON:\n{"theme":"situation title ≤15 chars","situation":"situation text","extraInfo":["additional info 1 (if any)","additional info 2 (if any)"],"hasCQuestion":${diff>=3}}`
    :`返答はJSONのみ：\n{"theme":"状況タイトル15文字以内","situation":"状況テキスト","extraInfo":["追加情報1（ある場合）","追加情報2（ある場合）"],"hasCQuestion":${diff>=3}}`;
  const prompt=`${themeInst}\n${diffPrompt}\n${jsonSchema}${personaNote}`;

  try{
    const raw=await callClaude(prompt,sys,2000,0.9);
    if(!raw)return;
    const p=safeJSON(raw);
    if(!p.situation)throw new Error('Invalid JSON');
    st.tsumiaage={
      id:Date.now(),
      theme:p.theme||themeIn.slice(0,15),
      diff,
      date:new Date().toISOString(),
      industry:st.industry||'',
      situation:p.situation,
      extraInfo:Array.isArray(p.extraInfo)?p.extraInfo.filter(Boolean):[],
      hasCQuestion:!!p.hasCQuestion,
      steps:[],
      currentStep:0,
      maxRounds:TA_MAX_ROUNDS[diff]||1,
      finalMode:'logic',
      finalAnswer:'',
      summaryAnswer:'',
      feedback:null,
      lang:st.lang,
    };
    renderTsumiaage(st.tsumiaage);
    resetGenConditions();
    try{await syncTsumiaagePast(st.tsumiaage);}
    catch(e){setSync('tsumiaage','err',L[st.lang].syncFailed);}
  }catch(e){
    alert(L[st.lang].taGenFailed+'\n'+e.message);
  }finally{
    endGen('tsumiaage');
  }
}

function renderTsumiaage(prob){
  document.getElementById('ta-meta-row').innerHTML=buildProblemMetaHtml(prob,prob.lang||st.lang);
  document.getElementById('ta-situation').textContent=prob.situation;
  document.getElementById('ta-steps').innerHTML='';
  document.getElementById('ta-final-area').style.display='none';
  document.getElementById('ta-fb').innerHTML='';
  document.getElementById('ta-pa-btn').style.display='none';
  document.getElementById('tsumiaage-result').style.display='block';
  appendTsumiaageStep(prob,0);
  updateApiKeyUI();
}

function appendTsumiaageStep(prob,stepIdx){
  const l=L[prob.lang||st.lang];
  const isLastRound=stepIdx>=prob.maxRounds-1;
  const container=document.getElementById('ta-steps');
  let extraInfoHtml='';
  const extraInfo=prob.extraInfo||[];
  if(stepIdx>0&&extraInfo[stepIdx-1]){
    extraInfoHtml=`<div class="ta-extra-info-block">
      <p class="slabel">${esc(l.taExtraInfoLbl||'追加情報')}</p>
      <div class="problem-box" style="background:var(--bg2);border-left:3px solid var(--amber);">${esc(extraInfo[stepIdx-1])}</div>
    </div>`;
  }
  const isDefinitiveB=isLastRound||(stepIdx===0&&prob.maxRounds===1);
  const bLbl=isDefinitiveB?(l.taStep1BLbl||''):(l.taStep1BVariantLbl||'');
  const showC=prob.hasCQuestion&&!isLastRound;
  const stepHtml=`${extraInfoHtml}
    <div class="ta-step-block" data-step="${stepIdx}">
      <div class="ta-step-lbl">STEP ${stepIdx+1}</div>
      <div class="ta-qa-block">
        <p class="ta-q-lbl">${esc(l.taStep1ALbl||'事実を整理してください')}</p>
        <textarea class="sum-ta" id="ta-ans-${stepIdx}-a" style="min-height:100px;" data-target="200" placeholder=""></textarea>
      </div>
      <div class="ta-qa-block">
        <p class="ta-q-lbl">${esc(bLbl)}</p>
        <textarea class="sum-ta" id="ta-ans-${stepIdx}-b" style="min-height:120px;" data-target="200" placeholder=""></textarea>
      </div>
      ${showC?`<div class="ta-qa-block">
        <p class="ta-q-lbl">${esc(l.taStep1CLbl||'誰に・何を確認しますか？')}</p>
        <textarea class="sum-ta" id="ta-ans-${stepIdx}-c" style="min-height:80px;" data-target="150" placeholder=""></textarea>
      </div>`:''}
      <div class="action-bar no-print" style="margin-top:8px;" id="ta-step-btn-${stepIdx}">
        <button class="btn" onclick="submitTsumiaageStep(${stepIdx})">
          <span>${esc(l.taSubmitStepBtn||'次へ')}</span>
        </button>
      </div>
      <div id="ta-boss-reply-${stepIdx}" style="display:none;"></div>
    </div>`;
  container.insertAdjacentHTML('beforeend',stepHtml);
}

async function submitTsumiaageStep(stepIdx){
  if(isBusy()||!hasApiKey())return;
  const prob=st.tsumiaage;
  if(!prob)return;
  const ansA=document.getElementById(`ta-ans-${stepIdx}-a`)?.value.trim()||'';
  const ansB=document.getElementById(`ta-ans-${stepIdx}-b`)?.value.trim()||'';
  const ansC=document.getElementById(`ta-ans-${stepIdx}-c`)?.value.trim()||'';
  if(!ansA||!ansB){alert(L[st.lang].taAnswerRequired||L[st.lang].overWarn);return;}
  const btn=document.getElementById(`ta-step-btn-${stepIdx}`);
  if(btn)btn.style.display='none';
  const isEN=(prob.lang||st.lang)==='en';
  const isLastRound=stepIdx>=prob.maxRounds-1;
  const needCounterArg=prob.diff>=4;
  const sys=isEN
    ?'You are a manager reviewing a subordinate\'s analysis. Your goal is to help them reach a higher-quality final output — but you do NOT give answers. Ask one focused follow-up question to address the most critical gap in their reasoning. If the reasoning is sound, say so briefly and move on. Keep your response to 2–3 sentences.'
    :'あなたは部下の分析をレビューする上司です。より質の高い最終アウトプットに導くことが目的ですが、答えは教えません。回答の中で最も重要な論理の弱点に対して、1つだけ的を絞った問い返しをしてください。論理が適切であれば簡潔にその旨を伝えて次に進みます。2〜3文で返してください。';
  const situationSection=isEN?`[Situation]\n${prob.situation}\n\n`:`【状況】\n${prob.situation}\n\n`;
  const answerSection=isEN
    ?`[Subordinate's analysis - Step ${stepIdx+1}]\nFact sorting: ${ansA}\nJudgment: ${ansB}${ansC?`\nVerification plan: ${ansC}`:''}`
    :`【部下の回答 - STEP${stepIdx+1}】\n事実整理：${ansA}\n判断：${ansB}${ansC?`\n確認計画：${ansC}`:''}`;
  const counterArgNote=needCounterArg&&!isLastRound
    ?(isEN?'\nIf appropriate, include a brief counterargument question (e.g., "What if X were the case?").'
      :'\n適切であれば、反証の問い（「〇〇という可能性はないですか？」）を1つ含めてください。')
    :'';
  const prompt=`${situationSection}${answerSection}${counterArgNote}`;
  const bossDiv=document.getElementById(`ta-boss-reply-${stepIdx}`);
  if(bossDiv){
    bossDiv.style.display='block';
    bossDiv.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading||'...'}</span></p>`;
  }
  try{
    const reply=await callClaude(prompt,sys,400,0.7);
    if(!reply)return;
    prob.steps[stepIdx]={ansA,ansB,ansC,bossReply:reply};
    if(bossDiv){
      bossDiv.innerHTML=`<div class="ta-boss-reply-block">
        <p class="slabel no-print">${esc(L[st.lang].taBossReply||'上司からの確認')}</p>
        <div class="problem-box" style="background:var(--bg2);border-left:3px solid var(--purple);">${esc(reply)}</div>
      </div>`;
    }
    if(isLastRound)showTsumiaageFinal(prob);
    else{
      prob.currentStep=stepIdx+1;
      appendTsumiaageStep(prob,stepIdx+1);
    }
  }catch(e){
    if(bossDiv)bossDiv.innerHTML=`<p class="err">${e.message}</p>`;
    if(btn)btn.style.display='';
  }
}

function showTsumiaageFinal(prob){
  const diff=prob.diff;
  const summaryBlock=document.getElementById('ta-summary-block');
  if(summaryBlock)summaryBlock.style.display=diff>=2?'':'none';
  setTaFinalMode(prob.finalMode||st.taFinalMode||'logic');
  const finalArea=document.getElementById('ta-final-area');
  if(finalArea){
    finalArea.style.display='';
    finalArea.scrollIntoView({behavior:'smooth',block:'start'});
  }
  updateApiKeyUI();
}

function setTaFinalMode(mode){
  if(!st.tsumiaage)return;
  st.tsumiaage.finalMode=mode;
  st.taFinalMode=mode;
  document.querySelectorAll('#ta-mode-row .mode-btn')
    .forEach(b=>b.classList.toggle('sel',b.dataset.mode===mode));
  updateTaFinalInst(st.lang,mode);
}

function updateTaFinalInst(lang,mode){
  const l=L[lang];
  const inst=document.getElementById('ui-ta-final-inst');
  if(inst)inst.textContent=mode==='delivery'
    ?(l.taFinalDeliveryLbl||'')
    :(l.taFinalLogicLbl||'');
}

async function submitTsumiaage(){
  if(isBusy()||!hasApiKey())return;
  const prob=st.tsumiaage;
  if(!prob)return;
  const summaryAns=document.getElementById('ta-summary-ans')?.value.trim()||'';
  const finalAns=document.getElementById('ta-final-ans')?.value.trim()||'';
  if(!finalAns){alert(L[st.lang].taAnswerRequired||L[st.lang].overWarn);return;}
  prob.summaryAnswer=summaryAns;
  prob.finalAnswer=finalAns;
  prob.finalMode=st.taFinalMode||'logic';
  const fb=document.getElementById('ta-fb');
  fb.innerHTML=`<p class="loading"><span class="dots">${L[st.lang].loading||'採点中...'}</span></p>`;
  const submitBtn=document.getElementById('ta-submit-btn');
  if(submitBtn)submitBtn.disabled=true;
  try{
    const res=await gradeTsumiaage(prob);
    if(!res)return;
    prob.feedback=res;
    fb.innerHTML=`<div class="feedback-box">${md2h(res)}</div>`;
    document.getElementById('ta-pa-btn').style.display='';
    try{await syncTsumiaagePast(prob);}catch(e){}
  }catch(e){
    fb.innerHTML=`<p class="err">${L[st.lang].taGradingErr}: ${e.message}</p>`;
  }
  if(submitBtn)submitBtn.disabled=false;
  updateApiKeyUI();
}

async function gradeTsumiaage(prob){
  const isEN=(prob.lang||st.lang)==='en';
  const sys=isEN
    ?'You are an expert in business decision-making education. Evaluate the respondent\'s reasoning process on 5 axes and provide structured feedback. Use markdown for structure.'
    :'あなたはビジネスの意思決定・問題解決教育の専門家です。回答者の推論プロセスを5軸で評価し、構造的なフィードバックを提供してください。マークダウンを使って構造的に記述してください。';
  const situationSection=isEN?`[Situation]\n${prob.situation}\n\n`:`【状況】\n${prob.situation}\n\n`;
  const stepsSection=(prob.steps||[]).map((s,i)=>
    isEN
      ?`[Step ${i+1}]\nFact sorting: ${s.ansA}\nJudgment: ${s.ansB}${s.ansC?`\nVerification plan: ${s.ansC}`:''}\nManager follow-up: ${s.bossReply||'—'}`
      :`【STEP${i+1}】\n事実整理：${s.ansA}\n判断：${s.ansB}${s.ansC?`\n確認計画：${s.ansC}`:''}\n上司の問い返し：${s.bossReply||'—'}`
  ).join('\n\n---\n\n');
  const finalSection=isEN
    ?`[Final judgment (${prob.finalMode==='delivery'?'Delivery mode':'Logic mode'})]\n${prob.finalAnswer}${prob.summaryAnswer?`\n[One-line summary]\n${prob.summaryAnswer}`:''}`
    :`【最終判断（${prob.finalMode==='delivery'?'伝達モード':'論理モード'}）】\n${prob.finalAnswer}${prob.summaryAnswer?`\n【一言要約】\n${prob.summaryAnswer}`:''}`;
  const gradeInst=isEN
    ?`Evaluate on the following 5 axes:\n## ① Accuracy of fact sorting\n## ② Logical validity of hypothesis\n## ③ Hypothesis update after new information\n## ④ Completeness of final judgment\n## ⑤ Abstraction accuracy of one-line summary\n## Overall feedback`
    :`以下の5軸で評価してください。\n## ① 事実と解釈の仕分けの正確さ\n## ② 仮説の論理的妥当性（飛躍がないか）\n## ③ 追加情報を受けた仮説の更新\n## ④ 最終判断の根拠の充実度\n## ⑤ 一言要約の抽象化の精度\n## 総合講評`;
  const prompt=`${situationSection}${stepsSection}\n\n${finalSection}\n\n${gradeInst}`;
  const maxTok=prob.diff<=2?1500:prob.diff<=4?2500:3500;
  return callClaude(prompt,sys,maxTok,0.3);
}

function buildTsumiaageEntry(prob){
  return{
    id:prob.id||Date.now(),
    sheet:'tsumiaage',
    theme:prob.theme||'—',
    diff:prob.diff,
    date:prob.date,
    industry:prob.industry||'',
    situation:prob.situation||'',
    steps:JSON.stringify(prob.steps||[]),
    finalMode:prob.finalMode||'logic',
    finalAnswer:prob.finalAnswer||'',
    feedback:prob.feedback||null,
    lang:prob.lang||st.lang,
  };
}

async function syncTsumiaagePast(prob){
  if(!await ensureGasV3())return;
  const entry=buildTsumiaageEntry(prob);
  prob.id=entry.id;
  setSync('tsumiaage','spin',L[st.lang].genPhaseProcess+'...');
  const res=await gasPost(entry);
  if(isGasV3Payload(res))gasV3Ok=true;
  const idx=st.taPast.findIndex(p=>String(p.id)===String(prob.id));
  if(idx>=0)st.taPast[idx]={...st.taPast[idx],...entry};
  else st.taPast.unshift(entry);
  renderPL('tsumiaage');
  setSync('tsumiaage','ok',st.taPast.length+L[st.lang].syncItems);
  showToast(L[st.lang].taSavedOk);
}

function parseTaSteps(prob){
  if(Array.isArray(prob.steps))return prob.steps;
  try{return JSON.parse(prob.steps||'[]')||[];}catch{return[];}
}

function pastTsumiaageStepsHtml(prob,lang){
  const l=L[lang];
  const steps=parseTaSteps(prob);
  if(!steps.length)return '';
  return steps.map((s,i)=>`
    <div class="ta-step-block" style="margin-top:1rem;">
      <div class="ta-step-lbl">STEP ${i+1}</div>
      <p class="ta-q-lbl">${esc(l.taStep1ALbl||'')}</p>
      <div class="problem-box" style="background:var(--bg2);">${esc(s.ansA||'—')}</div>
      <p class="ta-q-lbl" style="margin-top:8px;">${esc(l.taStep1BLbl||'')}</p>
      <div class="problem-box" style="background:var(--bg2);">${esc(s.ansB||'—')}</div>
      ${s.ansC?`<p class="ta-q-lbl" style="margin-top:8px;">${esc(l.taStep1CLbl||'')}</p><div class="problem-box" style="background:var(--bg2);">${esc(s.ansC)}</div>`:''}
      ${s.bossReply?`<div class="ta-boss-reply-block"><p class="slabel">${esc(l.taBossReply||'')}</p><div class="problem-box" style="background:var(--bg2);border-left:3px solid var(--purple);">${esc(s.bossReply)}</div></div>`:''}
    </div>`).join('');
}
